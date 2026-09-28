const net = require('net');
const tls = require('tls');
const fs = require('fs');
const path = require('path');
const { Device } = require('../models');
const { processTelemetry } = require('./telemetryService');

let server = null;
let tlsServer = null;
const connectedSockets = new Map();
const MQTT_PORT = process.env.MQTT_PORT || 1883;
const MQTTS_PORT = process.env.MQTTS_PORT || 8883;
const CERTS_DIR = process.env.CERTS_DIR || path.join(__dirname, '../certs');

/**
 * Native Lightweight MQTT Broker Service for IoT Devices
 * Fully compliant with MQTT v3.1.1 protocol framing and packet parsing.
 * Compatible with ThingsBoard MQTT topic: v1/devices/me/telemetry
 * Credentials: Device Access Token passed as MQTT Username, Client ID, or Topic parameter.
 */

function parseRemainingLength(buffer, offset) {
  let multiplier = 1;
  let value = 0;
  let bytesRead = 0;
  let digit;

  do {
    if (offset + bytesRead >= buffer.length) {
      return null; // Incomplete remaining length
    }
    digit = buffer[offset + bytesRead];
    value += (digit & 0x7F) * multiplier;
    multiplier *= 128;
    bytesRead++;
    if (multiplier > 128 * 128 * 128) {
      throw new Error('Malformed remaining length in MQTT packet');
    }
  } while ((digit & 0x80) !== 0);

  return { value, bytesRead };
}

function handleConnectPacket(socket, packet, headerOffset) {
  try {
    let offset = headerOffset;

    // Protocol Name (2 bytes length + string)
    if (offset + 2 > packet.length) return false;
    const protoLen = packet.readUInt16BE(offset);
    offset += 2;
    if (offset + protoLen > packet.length) return false;
    const protoName = packet.toString('utf8', offset, offset + protoLen);
    offset += protoLen;

    // Protocol Version (1 byte)
    if (offset >= packet.length) return false;
    const protoVersion = packet[offset++];

    // Connect Flags (1 byte)
    if (offset >= packet.length) return false;
    const connectFlags = packet[offset++];
    const hasUsername = (connectFlags & 0x80) !== 0;
    const hasPassword = (connectFlags & 0x40) !== 0;
    const hasWill = (connectFlags & 0x04) !== 0;

    // Keep Alive (2 bytes)
    if (offset + 2 > packet.length) return false;
    const keepAlive = packet.readUInt16BE(offset);
    offset += 2;

    // Client ID (2 bytes length + string)
    if (offset + 2 > packet.length) return false;
    const clientLen = packet.readUInt16BE(offset);
    offset += 2;
    if (offset + clientLen > packet.length) return false;
    const clientId = packet.toString('utf8', offset, offset + clientLen);
    offset += clientLen;

    // Skip Will Topic & Will Message if present
    if (hasWill) {
      if (offset + 2 > packet.length) return false;
      const willTopicLen = packet.readUInt16BE(offset);
      offset += 2 + willTopicLen;
      if (offset + 2 > packet.length) return false;
      const willMsgLen = packet.readUInt16BE(offset);
      offset += 2 + willMsgLen;
    }

    // Username (2 bytes length + string)
    let username = null;
    if (hasUsername && offset + 2 <= packet.length) {
      const userLen = packet.readUInt16BE(offset);
      offset += 2;
      if (offset + userLen <= packet.length) {
        username = packet.toString('utf8', offset, offset + userLen);
        offset += userLen;
      }
    }

    // Password (2 bytes length + string)
    let password = null;
    if (hasPassword && offset + 2 <= packet.length) {
      const passLen = packet.readUInt16BE(offset);
      offset += 2;
      if (offset + passLen <= packet.length) {
        password = packet.toString('utf8', offset, offset + passLen);
        offset += passLen;
      }
    }

    // Authenticate token: Username first, then ClientID
    socket.clientToken = username || clientId;
    socket.clientId = clientId;
    if (socket.clientToken) {
      connectedSockets.set(socket.clientToken, socket);
    }

    console.log(`🔑 MQTT Client connected (Token/ClientId: ${socket.clientToken || 'anonymous'})`);

    // Send MQTT CONNACK: 0x20 (Type), 0x02 (Length), 0x00 (Session Present), 0x00 (Accepted)
    const connack = Buffer.from([0x20, 0x02, 0x00, 0x00]);
    socket.write(connack);
    return true;
  } catch (err) {
    console.error('MQTT CONNECT processing error:', err.message);
    const connackFail = Buffer.from([0x20, 0x02, 0x00, 0x04]); // Bad username or password
    socket.write(connackFail);
    socket.end();
    return false;
  }
}

async function handlePublishPacket(socket, byte0, packet, headerOffset) {
  try {
    const qos = (byte0 >> 1) & 0x03;
    let offset = headerOffset;

    // Topic Length (2 bytes BE)
    if (offset + 2 > packet.length) return;
    const topicLen = packet.readUInt16BE(offset);
    offset += 2;

    if (offset + topicLen > packet.length) return;
    const topic = packet.toString('utf8', offset, offset + topicLen);
    offset += topicLen;
    console.log(`📥 MQTT Packet Received [${topic}]:`, packet.toString('utf8', offset));

    // Packet Identifier (2 bytes BE, if QoS > 0)
    let packetId = null;
    if (qos > 0) {
      if (offset + 2 > packet.length) return;
      packetId = packet.readUInt16BE(offset);
      offset += 2;
    }

    // Payload (Remaining bytes)
    const payloadStr = packet.toString('utf8', offset);

    // If QoS == 1, respond with PUBACK immediately
    if (qos === 1 && packetId !== null) {
      const puback = Buffer.from([0x40, 0x02, (packetId >> 8) & 0xFF, packetId & 0xFF]);
      socket.write(puback);
    }

    // Parse JSON payload (with smart fallback for unquoted keys)
    let payload = null;
    try {
      payload = JSON.parse(payloadStr);
    } catch (e) {
      // Handle string payloads, partial JSON, or unquoted keys like {temperature: 25.5}
      const jsonStart = payloadStr.indexOf('{');
      const jsonEnd = payloadStr.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        const jsonSub = payloadStr.substring(jsonStart, jsonEnd + 1);
        try {
          payload = JSON.parse(jsonSub);
        } catch (e2) {
          try {
            // Repair unquoted object keys: {temperature: 25.5} -> {"temperature": 25.5}
            const repairedJson = jsonSub.replace(/([{,]\s*)([a-zA-Z0-9_$]+)\s*:/g, '$1"$2":');
            payload = JSON.parse(repairedJson);
          } catch (e3) { /* malformed payload */ }
        }
      }
    }

    // Resolve target access token or device identifier
    let targetToken = socket.clientToken;

    // Check if topic contains explicit token: v1/devices/:token/telemetry
    const topicMatch = topic.match(/^v1\/devices\/([a-zA-Z0-9_\-]+)\/telemetry$/);
    if (topicMatch && topicMatch[1] && topicMatch[1] !== 'me') {
      targetToken = topicMatch[1];
    }

    if (payload && typeof payload === 'object') {
      if (payload.token || payload.accessToken) {
        targetToken = payload.token || payload.accessToken;
        delete payload.token;
        delete payload.accessToken;
      }
      if (!targetToken && payload.values && typeof payload.values === 'object') {
        targetToken = payload.values.token || payload.values.accessToken || payload.values.ID || payload.values.id;
      }
      if (!targetToken && (payload.ID || payload.id)) {
        targetToken = payload.ID || payload.id;
      }
    }

    // Fallback: If still no token and there is an IMEI in payload, match device
    if (!targetToken && payload && typeof payload === 'object') {
      const imei = payload.IMEI || (payload.values && payload.values.IMEI);
      if (imei) {
        const { Op } = require('sequelize');
        const devByImei = await Device.findOne({
          where: {
            [Op.or]: [
              { label: { [Op.like]: `%${imei}%` } },
              { name: { [Op.like]: `%${imei}%` } },
              { accessToken: { [Op.like]: `%${imei}%` } }
            ]
          }
        });
        if (devByImei) targetToken = devByImei.accessToken;
      }
    }

    if (!targetToken) {
      console.warn(`⚠️ MQTT Telemetry: No explicit device token in topic [${topic}]. Checking for registered gateway...`);
      const singleGw = await Device.findOne({ where: { isGateway: true }, order: [['updatedAt', 'DESC']] });
      if (singleGw) {
        targetToken = singleGw.accessToken;
        console.log(`ℹ️ Auto-associated telemetry with gateway [${singleGw.name}]`);
      } else {
        return;
      }
    }

    // 1. Check ThingsBoard Gateway Topics
    if (topic === 'v1/gateway/telemetry') {
      const gateway = await Device.findOne({ where: { accessToken: targetToken } });
      if (!gateway) {
        console.warn(`⚠️ Gateway Telemetry Rejected: Invalid gateway token [${targetToken}]`);
        return;
      }
      
      // Expected ThingsBoard Gateway format:
      // { "Device_A": [{"ts": 1711..., "values": { "v": 230 }}], "Device_B": { "temp": 25 } }
      if (payload && typeof payload === 'object') {
        for (const [subDeviceName, subData] of Object.entries(payload)) {
          if (!subDeviceName || typeof subData !== 'object') continue;

          const [subDevice] = await Device.findOrCreate({
            where: { name: subDeviceName, tenantId: gateway.tenantId },
            defaults: {
              name: subDeviceName,
              type: 'sensor',
              label: `Gateway Device (${gateway.name})`,
              tenantId: gateway.tenantId,
              customerId: gateway.customerId,
              isActive: true,
              additionalInfo: { gatewayId: gateway.id }
            }
          });

          if (Array.isArray(subData)) {
            for (const item of subData) {
              const values = item.values || item;
              const ts = item.ts ? new Date(item.ts).getTime() : Date.now();
              await processTelemetry(subDevice.id, values, ts);
            }
          } else {
            await processTelemetry(subDevice.id, subData, Date.now());
          }
          console.log(`📡 Gateway [${gateway.name}] Processed Sub-Device [${subDeviceName}]`);
        }
      }
      return;
    }

    if (topic === 'v1/gateway/connect') {
      const gateway = await Device.findOne({ where: { accessToken: targetToken } });
      if (!gateway) return;
      const subDeviceName = payload.device || payload.name;
      if (subDeviceName) {
        const [subDevice] = await Device.findOrCreate({
          where: { name: subDeviceName, tenantId: gateway.tenantId },
          defaults: {
            name: subDeviceName,
            type: 'sensor',
            label: `Gateway Device (${gateway.name})`,
            tenantId: gateway.tenantId,
            customerId: gateway.customerId,
            isActive: true,
            additionalInfo: { gatewayId: gateway.id }
          }
        });
        await subDevice.update({ isActive: true });
        console.log(`🔗 Gateway [${gateway.name}] Connected Sub-Device [${subDeviceName}]`);
      }
      return;
    }

    if (topic === 'v1/gateway/disconnect') {
      const gateway = await Device.findOne({ where: { accessToken: targetToken } });
      if (!gateway) return;
      const subDeviceName = payload.device || payload.name;
      if (subDeviceName) {
        const subDevice = await Device.findOne({ where: { name: subDeviceName, tenantId: gateway.tenantId } });
        if (subDevice) {
          await subDevice.update({ isActive: false });
          const wsServer = require('../websocket/wsServer');
          wsServer.broadcast(subDevice.id, {
            type: 'DEVICE_DISCONNECTED',
            entityId: subDevice.id,
            status: 'DISCONNECTED',
            timestamp: new Date().toISOString()
          });
          console.log(`🔌 Gateway [${gateway.name}] Disconnected Sub-Device [${subDeviceName}]`);
        }
      }
      return;
    }

    // 2. Check RPC Response Topic: v1/devices/me/rpc/response/:requestId
    const rpcResponseMatch = topic.match(/^v1\/devices\/(?:me|[a-zA-Z0-9_\-]+)\/rpc\/response\/([a-zA-Z0-9_\-]+)$/);
    if (rpcResponseMatch) {
      const requestId = rpcResponseMatch[1];
      const device = await Device.findOne({ where: { accessToken: targetToken } });
      if (device) {
        const wsServer = require('../websocket/wsServer');
        wsServer.broadcast(device.id, {
          type: 'RPC_RESPONSE_RECEIVED',
          entityId: device.id,
          requestId,
          response: payload,
          timestamp: new Date().toISOString()
        });
        console.log(`📥 RPC Response for Device [${device.name}] (Req: ${requestId}):`, payload);
      }
      return;
    }

    // 3. Standard Direct Device Telemetry (Match by accessToken OR device name)
    const { Op } = require('sequelize');
    const device = await Device.findOne({
      where: {
        [Op.or]: [
          { accessToken: targetToken },
          { name: targetToken }
        ]
      }
    });

    if (!device) {
      console.warn(`⚠️ MQTT Telemetry Rejected: Invalid device access token [${targetToken}].`);
      return;
    }

    if (!payload || typeof payload !== 'object') {
      console.warn(`⚠️ MQTT Telemetry Rejected: Malformed JSON payload from Device [${device.name}]. Raw payload: "${payloadStr}"`);
      return;
    }

    // Process telemetry in database + WebSocket broadcast
    await processTelemetry(device.id, payload, Date.now());
    console.log(`📡 MQTT Received Telemetry for Device [${device.name}]:`, payload);

  } catch (err) {
    console.error('MQTT PUBLISH processing error:', err.message);
  }
}

/**
 * Shared MQTT socket handler — used by both plain TCP and TLS servers
 * to avoid code duplication.
 */
function handleMqttSocket(socket) {
  socket._mqttBuffer = Buffer.alloc(0);
  socket.clientToken = null;

  socket.on('data', async (chunk) => {
    socket._mqttBuffer = Buffer.concat([socket._mqttBuffer, chunk]);

    while (socket._mqttBuffer.length >= 2) {
      const byte0 = socket._mqttBuffer[0];
      const packetType = (byte0 >> 4) & 0x0F;

      let parsedLen = null;
      try {
        parsedLen = parseRemainingLength(socket._mqttBuffer, 1);
      } catch (e) {
        console.warn('MQTT Packet parse error:', e.message);
        socket.destroy();
        return;
      }

      if (!parsedLen) {
        // Packet incomplete, await next TCP chunk
        return;
      }

      const headerLength = 1 + parsedLen.bytesRead;
      const totalPacketLength = headerLength + parsedLen.value;

      if (socket._mqttBuffer.length < totalPacketLength) {
        // Complete packet not yet buffered
        return;
      }

      // Extract packet slice
      const packet = socket._mqttBuffer.subarray(0, totalPacketLength);
      socket._mqttBuffer = socket._mqttBuffer.subarray(totalPacketLength);

      // Process Packet Type
      if (packetType === 1) {
        // CONNECT
        handleConnectPacket(socket, packet, headerLength);
      } else if (packetType === 3) {
        // PUBLISH
        await handlePublishPacket(socket, byte0, packet, headerLength);
      } else if (packetType === 12) {
        // PINGREQ -> Respond PINGRESP
        socket.write(Buffer.from([0xD0, 0x00]));
      } else if (packetType === 14) {
        // DISCONNECT
        socket.end();
      }
    }
  });

  socket.on('close', async () => {
    if (socket.clientToken) {
      connectedSockets.delete(socket.clientToken);
      try {
        const device = await Device.findOne({ where: { accessToken: socket.clientToken } });
        if (device) {
          await device.update({ isActive: false });
          const wsServer = require('../websocket/wsServer');
          wsServer.broadcast(device.id, {
            type: 'DEVICE_DISCONNECTED',
            entityId: device.id,
            deviceName: device.name,
            status: 'DISCONNECTED',
            timestamp: new Date().toISOString()
          });
          console.log(`🔌 MQTT Device Disconnected [${device.name}] -> Status OFFLINE (Telemetry -> 0)`);
        }
      } catch (e) {
        console.error('Error handling device disconnect:', e.message);
      }
    }
  });

  socket.on('error', () => {});
}

function startMqttServer() {
  if (server) return;

  // Plain TCP MQTT Server (Port 1883)
  server = net.createServer((socket) => {
    handleMqttSocket(socket);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`⚠️ MQTT Port ${MQTT_PORT} is in use by Mosquitto Service.`);
      console.log(`📡 Connecting CloudBoard Bridge Listener to Mosquitto on mqtt://localhost:${MQTT_PORT}...`);
      startMqttBridgeClient();
    } else {
      console.error('MQTT Server error:', err.message);
    }
  });

  server.listen(MQTT_PORT, '0.0.0.0', () => {
    console.log(`📡 Native MQTT Server listening for IoT devices on mqtt://0.0.0.0:${MQTT_PORT}`);
    console.log(`   Topic: v1/devices/me/telemetry | Credentials: Device Access Token\n`);

    // Proactively check and connect Mosquitto Bridge Client if Mosquitto Service is active
    startMqttBridgeClient();
  });

  // MQTTS (TLS-encrypted MQTT) Server on Port 8883
  startMqttTlsServer();
}

/**
 * Start a TLS-encrypted MQTT server on port 8883 (MQTTS).
 * Only starts if certificate files are present in the certs directory.
 * Devices connect via mqtts://server:8883 for encrypted communication.
 */
function startMqttTlsServer() {
  const certPath = path.join(CERTS_DIR, 'server.crt');
  const keyPath = path.join(CERTS_DIR, 'server.key');
  const caPath = path.join(CERTS_DIR, 'ca.crt');

  if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
    console.log(`ℹ️  MQTTS skipped: Certificate files not found in ${CERTS_DIR}/`);
    console.log(`   To enable MQTTS (Port ${MQTTS_PORT}), place server.crt and server.key in ${CERTS_DIR}/\n`);
    return;
  }

  const tlsOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  };

  // Optional: Enable mTLS (mutual TLS) if CA certificate is present
  if (fs.existsSync(caPath)) {
    tlsOptions.ca = [fs.readFileSync(caPath)];
    tlsOptions.requestCert = true;
    tlsOptions.rejectUnauthorized = true;
    console.log(`🔐 mTLS enabled: Device X.509 client certificates will be verified against ${caPath}`);
  }

  tlsServer = tls.createServer(tlsOptions, (socket) => {
    // Log mTLS certificate info if available
    if (tlsOptions.requestCert && socket.authorized) {
      const clientCert = socket.getPeerCertificate();
      if (clientCert && clientCert.subject) {
        console.log(`🔐 MQTTS Device authenticated via X.509 cert CN: ${clientCert.subject.CN}`);
        // Use certificate CN as device access token for mTLS auth
        socket.clientToken = clientCert.subject.CN;
        connectedSockets.set(socket.clientToken, socket);
      }
    }
    handleMqttSocket(socket);
  });

  tlsServer.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`⚠️ MQTTS Port ${MQTTS_PORT} is already in use.`);
    } else {
      console.error('MQTTS Server error:', err.message);
    }
  });

  tlsServer.listen(MQTTS_PORT, '0.0.0.0', () => {
    console.log(`🔒 MQTTS (Secure MQTT) listening on mqtts://0.0.0.0:${MQTTS_PORT}`);
    console.log(`   Encrypted with TLS | ${tlsOptions.requestCert ? 'mTLS (X.509 Client Cert)' : 'Server-Side TLS'}\n`);
  });
}

function buildSubscribePacket(packetId, topicFilter, qos = 0) {
  const topicBuffer = Buffer.from(topicFilter, 'utf8');
  const remainingLength = 2 + 2 + topicBuffer.length + 1;
  const header = Buffer.from([0x82, remainingLength, (packetId >> 8) & 0xFF, packetId & 0xFF]);
  const topicLenBuf = Buffer.alloc(2);
  topicLenBuf.writeUInt16BE(topicBuffer.length, 0);
  const qosBuf = Buffer.from([qos]);

  return Buffer.concat([header, topicLenBuf, topicBuffer, qosBuf]);
}

let bridgeClientSocket = null;
let bridgeReconnectTimer = null;

function startMqttBridgeClient() {
  if (bridgeClientSocket) {
    try { bridgeClientSocket.destroy(); } catch (e) {}
    bridgeClientSocket = null;
  }
  if (bridgeReconnectTimer) {
    clearTimeout(bridgeReconnectTimer);
    bridgeReconnectTimer = null;
  }

  const clientIdStr = 'CB_Bridge_' + Math.random().toString(36).substring(2, 8);
  const clientIdBuf = Buffer.from(clientIdStr, 'utf8');

  const remainingLength = 2 + 4 + 1 + 1 + 2 + 2 + clientIdBuf.length;
  const connectHeader = Buffer.from([
    0x10, remainingLength,
    0x00, 0x04, 0x4D, 0x51, 0x54, 0x54, // "MQTT"
    0x04, // Version 4 (v3.1.1)
    0x02, // Clean Session
    0x00, 0x3C, // Keep Alive 60s
    (clientIdBuf.length >> 8) & 0xFF, clientIdBuf.length & 0xFF
  ]);
  const connectPacket = Buffer.concat([connectHeader, clientIdBuf]);

  try {
    const clientSocket = net.connect({ host: '127.0.0.1', port: MQTT_PORT }, () => {
      clientSocket.write(connectPacket);
    });

    bridgeClientSocket = clientSocket;
    clientSocket._mqttBuffer = Buffer.alloc(0);

    const pingInterval = setInterval(() => {
      if (clientSocket.writable) {
        clientSocket.write(Buffer.from([0xC0, 0x00])); // PINGREQ
      }
    }, 25000);

    clientSocket.on('data', async (chunk) => {
      clientSocket._mqttBuffer = Buffer.concat([clientSocket._mqttBuffer, chunk]);

      while (clientSocket._mqttBuffer.length >= 2) {
        const byte0 = clientSocket._mqttBuffer[0];
        const packetType = (byte0 >> 4) & 0x0F;

        let parsedLen = null;
        try {
          parsedLen = parseRemainingLength(clientSocket._mqttBuffer, 1);
        } catch (e) {
          clientSocket.destroy();
          return;
        }
        if (!parsedLen) return;

        const headerLength = 1 + parsedLen.bytesRead;
        const totalPacketLength = headerLength + parsedLen.value;

        if (clientSocket._mqttBuffer.length < totalPacketLength) return;

        const packet = clientSocket._mqttBuffer.subarray(0, totalPacketLength);
        clientSocket._mqttBuffer = clientSocket._mqttBuffer.subarray(totalPacketLength);

        if (packetType === 2) {
          // CONNACK received from external broker
          console.log(`✅ Connected to external MQTT broker on port ${MQTT_PORT}. Subscribing to v1/# ...`);
          const sub = buildSubscribePacket(1, 'v1/#');
          clientSocket.write(sub);
        } else if (packetType === 3) {
          // PUBLISH received from external broker!
          console.log(`📡 Bridge client received PUBLISH packet (len: ${totalPacketLength})`);
          await handlePublishPacket(clientSocket, byte0, packet, headerLength);
        } else if (packetType === 9) {
          // SUBACK
          console.log(`✅ Bridge successfully subscribed to v1/# on MQTT broker.`);
        } else if (packetType === 13) {
          // PINGRESP from external broker
        }
      }
    });

    clientSocket.on('error', () => {});
    clientSocket.on('close', () => {
      clearInterval(pingInterval);
      if (bridgeClientSocket === clientSocket) {
        bridgeClientSocket = null;
        if (!bridgeReconnectTimer) {
          bridgeReconnectTimer = setTimeout(() => {
            bridgeReconnectTimer = null;
            startMqttBridgeClient();
          }, 5000);
        }
      }
    });
  } catch (e) {}
}

function stopMqttServer() {
  if (bridgeClientSocket) {
    try { bridgeClientSocket.destroy(); } catch (e) {}
    bridgeClientSocket = null;
  }
  if (bridgeReconnectTimer) {
    clearTimeout(bridgeReconnectTimer);
    bridgeReconnectTimer = null;
  }
  if (tlsServer) {
    tlsServer.close();
    tlsServer = null;
    console.log('🛑 MQTTS Server stopped.');
  }
  if (server) {
    server.close();
    server = null;
    console.log('🛑 MQTT Server stopped.');
  }
}

async function sendRpcCommand(deviceIdOrToken, rpcPayload = {}) {
  const { Device } = require('../models');
  const wsServer = require('../websocket/wsServer');
  const { v4: uuidv4 } = require('uuid');

  let device = await Device.findByPk(deviceIdOrToken);
  if (!device) {
    device = await Device.findOne({ where: { accessToken: deviceIdOrToken } });
  }

  if (!device) {
    throw new Error('Device not found for RPC execution');
  }

  const token = device.accessToken;
  const requestId = uuidv4().substring(0, 8);
  const topic = `v1/devices/me/rpc/request/${requestId}`;
  const payloadStr = JSON.stringify(rpcPayload);

  // 1. Deliver via Native MQTT Server socket if connected
  const targetSocket = connectedSockets.get(token);
  if (targetSocket && targetSocket.writable) {
    const topicBuf = Buffer.from(topic, 'utf8');
    const payloadBuf = Buffer.from(payloadStr, 'utf8');
    const remLen = 2 + topicBuf.length + payloadBuf.length;
    const header = Buffer.from([0x30, remLen, (topicBuf.length >> 8) & 0xFF, topicBuf.length & 0xFF]);
    targetSocket.write(Buffer.concat([header, topicBuf, payloadBuf]));
  }

  // 2. Deliver via Mosquitto Broker bridge client socket
  if (bridgeClientSocket && bridgeClientSocket.writable) {
    const pubTopic = `v1/devices/${token}/rpc/request/${requestId}`;
    const topicBuf = Buffer.from(pubTopic, 'utf8');
    const payloadBuf = Buffer.from(payloadStr, 'utf8');
    const remLen = 2 + topicBuf.length + payloadBuf.length;
    const header = Buffer.from([0x30, remLen, (topicBuf.length >> 8) & 0xFF, topicBuf.length & 0xFF]);
    bridgeClientSocket.write(Buffer.concat([header, topicBuf, payloadBuf]));
  }

  // 3. Broadcast real-time RPC event to WebSocket clients for UI feedback
  wsServer.broadcast(device.id, {
    type: 'RPC_COMMAND_SENT',
    entityId: device.id,
    requestId,
    payload: rpcPayload,
    timestamp: new Date().toISOString()
  });

  return { success: true, requestId, targetDevice: device.name, payload: rpcPayload };
}

module.exports = {
  startMqttServer,
  stopMqttServer,
  sendRpcCommand,
};

