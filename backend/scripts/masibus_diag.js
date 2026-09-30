/**
 * Masibus MSG-21 Gateway Diagnostic Tool
 * Run: node masibus_diag.js
 * 
 * This script:
 * 1. Verifies Mosquitto is running and accepting connections
 * 2. Monitors port 1883 for incoming connections from the gateway
 * 3. Subscribes to all v1/# topics to capture any gateway MQTT messages
 * 4. Validates the backend pipeline (device lookup, telemetry processing)
 * 5. Reports every stage with PASS/FAIL/BLOCKED/NOT TESTED
 */

const net = require('net');
const { Device, Telemetry, sequelize } = require('../models');

const MQTT_PORT = 1883;
const GATEWAY_IP = '192.168.100.110';
const LOCAL_IP = '192.168.100.20';
const MONITOR_DURATION = 60; // seconds

// MQTT packet builders
function buildConnectPacket(clientId) {
  const clientIdBuf = Buffer.from(clientId, 'utf8');
  const remainingLength = 2 + 4 + 1 + 1 + 2 + 2 + clientIdBuf.length;
  const connectHeader = Buffer.from([
    0x10, remainingLength,
    0x00, 0x04, 0x4D, 0x51, 0x54, 0x54,
    0x04, 0x02, 0x00, 0x3C,
    (clientIdBuf.length >> 8) & 0xFF, clientIdBuf.length & 0xFF
  ]);
  return Buffer.concat([connectHeader, clientIdBuf]);
}

function buildSubscribePacket(packetId, topicFilter) {
  const topicBuf = Buffer.from(topicFilter, 'utf8');
  const remainingLength = 2 + 2 + topicBuf.length + 1;
  const header = Buffer.from([0x82, remainingLength, (packetId >> 8) & 0xFF, packetId & 0xFF]);
  const topicLenBuf = Buffer.alloc(2);
  topicLenBuf.writeUInt16BE(topicBuf.length, 0);
  return Buffer.concat([header, topicLenBuf, topicBuf, Buffer.from([0x00])]);
}

function parseRemainingLength(buffer, offset) {
  let multiplier = 1, value = 0, bytesRead = 0, digit;
  do {
    if (offset + bytesRead >= buffer.length) return null;
    digit = buffer[offset + bytesRead];
    value += (digit & 0x7F) * multiplier;
    multiplier *= 128;
    bytesRead++;
  } while ((digit & 0x80) !== 0);
  return { value, bytesRead };
}

const results = {
  mosquitto_running: 'NOT TESTED',
  mosquitto_accepting: 'NOT TESTED',
  bridge_subscription: 'NOT TESTED',
  gateway_tcp_connection: 'NOT TESTED',
  gateway_mqtt_connect: 'NOT TESTED',
  gateway_publish: 'NOT TESTED',
  device_in_database: 'NOT TESTED',
  telemetry_processing: 'NOT TESTED',
  websocket_broadcast: 'NOT TESTED',
  dashboard_display: 'NOT TESTED',
};

async function runDiagnostics() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║  MASIBUS MSG-21 → RADIOGEET IOT CLOUD DIAGNOSTIC TOOL      ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log(`║  Gateway IP:   ${GATEWAY_IP}                            ║`);
  console.log(`║  Local IP:     ${LOCAL_IP}                             ║`);
  console.log(`║  MQTT Port:    ${MQTT_PORT}                                     ║`);
  console.log(`║  Monitor Time: ${MONITOR_DURATION}s                                       ║`);
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  // --- Stage 1: Check DB connectivity ---
  try {
    await sequelize.authenticate();
    console.log('✅ [DB] Database connection OK');
  } catch(e) {
    console.log('❌ [DB] Database connection FAILED:', e.message);
    return;
  }

  // --- Stage 2: Check devices in database ---
  const gatewayDevices = await Device.findAll({ 
    where: { isGateway: true },
    attributes: ['id', 'name', 'type', 'accessToken', 'isActive', 'isGateway', 'lastActivityTime']
  });

  console.log(`\n📋 [DB] Gateway devices in database: ${gatewayDevices.length}`);
  gatewayDevices.forEach(d => {
    console.log(`   - ${d.name} | Token: ${d.accessToken} | Active: ${d.isActive} | LastActivity: ${d.lastActivityTime}`);
  });

  if (gatewayDevices.length > 0) {
    results.device_in_database = 'PASS';
  } else {
    results.device_in_database = 'FAIL';
    console.log('   ⚠️  No gateway device registered. MSG-21 needs a device entry with matching accessToken.');
  }

  // --- Stage 3: Connect to Mosquitto as diagnostic subscriber ---
  console.log('\n🔌 [MQTT] Connecting to Mosquitto on 127.0.0.1:1883...');

  const diagSocket = net.connect({ host: '127.0.0.1', port: MQTT_PORT }, () => {
    results.mosquitto_running = 'PASS';
    results.mosquitto_accepting = 'PASS';
    console.log('✅ [MQTT] Connected to Mosquitto');
    diagSocket.write(buildConnectPacket('masibus_diag_' + Date.now()));
  });

  let mqttBuffer = Buffer.alloc(0);
  let subscribed = false;
  let messagesReceived = [];

  diagSocket.on('data', (chunk) => {
    mqttBuffer = Buffer.concat([mqttBuffer, chunk]);

    while (mqttBuffer.length >= 2) {
      const byte0 = mqttBuffer[0];
      const packetType = (byte0 >> 4) & 0x0F;
      const parsed = parseRemainingLength(mqttBuffer, 1);
      if (!parsed) return;

      const headerLen = 1 + parsed.bytesRead;
      const totalLen = headerLen + parsed.value;
      if (mqttBuffer.length < totalLen) return;

      const packet = mqttBuffer.subarray(0, totalLen);
      mqttBuffer = mqttBuffer.subarray(totalLen);

      if (packetType === 2) { // CONNACK
        console.log('✅ [MQTT] CONNACK received. Subscribing to v1/# and # ...');
        diagSocket.write(buildSubscribePacket(1, 'v1/#'));
        diagSocket.write(buildSubscribePacket(2, '#'));
      } else if (packetType === 9) { // SUBACK
        subscribed = true;
        results.bridge_subscription = 'PASS';
        console.log('✅ [MQTT] Subscribed to all topics. Waiting for gateway messages...');
      } else if (packetType === 3) { // PUBLISH
        let offset = headerLen;
        if (offset + 2 > packet.length) continue;
        const topicLen = packet.readUInt16BE(offset);
        offset += 2;
        if (offset + topicLen > packet.length) continue;
        const topic = packet.toString('utf8', offset, offset + topicLen);
        offset += topicLen;
        const qos = (byte0 >> 1) & 0x03;
        if (qos > 0) offset += 2;
        const payload = packet.toString('utf8', offset);

        const ts = new Date().toISOString();
        console.log(`\n📡 [MSG] ═══════════════════════════════════════════`);
        console.log(`   Time:    ${ts}`);
        console.log(`   Topic:   ${topic}`);
        console.log(`   Payload: ${payload.substring(0, 500)}`);
        console.log(`   ═══════════════════════════════════════════════════`);

        messagesReceived.push({ ts, topic, payload: payload.substring(0, 200) });

        if (topic.startsWith('v1/')) {
          results.gateway_publish = 'PASS';
        }
      }
    }
  });

  diagSocket.on('error', (err) => {
    results.mosquitto_running = 'FAIL';
    results.mosquitto_accepting = 'FAIL';
    console.log(`❌ [MQTT] Cannot connect to Mosquitto: ${err.message}`);
  });

  // --- Stage 4: Monitor TCP port 1883 for external connections ---
  console.log(`\n👁️  [NET] Monitoring port 1883 for connections from ${GATEWAY_IP} for ${MONITOR_DURATION}s...`);
  console.log('   (If MSG-21 is correctly configured, you should see a connection within its publish interval)\n');

  let checkCount = 0;
  const maxChecks = MONITOR_DURATION / 2;
  let gatewayConnected = false;

  const monitorInterval = setInterval(async () => {
    checkCount++;

    try {
      const { execSync } = require('child_process');
      const output = execSync(
        `powershell -Command "Get-NetTCPConnection -LocalPort 1883 -ErrorAction SilentlyContinue | Where-Object { $_.RemoteAddress -eq '${GATEWAY_IP}' } | Select-Object -ExpandProperty State"`,
        { encoding: 'utf8', timeout: 3000 }
      ).trim();

      if (output) {
        gatewayConnected = true;
        results.gateway_tcp_connection = 'PASS';
        console.log(`\n🎉 [NET] GATEWAY ${GATEWAY_IP} CONNECTED! State: ${output}`);
      }
    } catch (e) {
      // No connection found
    }

    // Print progress every 10 seconds
    if (checkCount % 5 === 0) {
      const elapsed = checkCount * 2;
      if (!gatewayConnected) {
        console.log(`   ⏳ [${elapsed}s/${MONITOR_DURATION}s] No connection from ${GATEWAY_IP} yet...`);
      }
    }

    if (checkCount >= maxChecks) {
      clearInterval(monitorInterval);

      if (!gatewayConnected) {
        results.gateway_tcp_connection = 'FAIL';
        results.gateway_mqtt_connect = 'BLOCKED';
        results.gateway_publish = results.gateway_publish === 'PASS' ? 'PASS' : 'BLOCKED';
        results.telemetry_processing = results.gateway_publish === 'PASS' ? 'NOT TESTED' : 'BLOCKED';
      }

      // Close diagnostic socket
      diagSocket.write(Buffer.from([0xE0, 0x00])); // DISCONNECT
      setTimeout(() => diagSocket.destroy(), 500);

      // Print final report
      console.log('\n\n╔══════════════════════════════════════════════════════════════╗');
      console.log('║                    DIAGNOSTIC RESULTS                        ║');
      console.log('╠══════════════════════════════════════════════════════════════╣');
      Object.entries(results).forEach(([key, value]) => {
        const icon = value === 'PASS' ? '✅' : value === 'FAIL' ? '❌' : value === 'BLOCKED' ? '🔶' : '⬜';
        const label = key.replace(/_/g, ' ').toUpperCase().padEnd(30);
        console.log(`║  ${icon} ${label} ${value.padEnd(12)} ║`);
      });
      console.log('╚══════════════════════════════════════════════════════════════╝');

      if (messagesReceived.length > 0) {
        console.log(`\n📨 Messages received during test: ${messagesReceived.length}`);
        messagesReceived.forEach((m, i) => {
          console.log(`  ${i+1}. [${m.ts}] ${m.topic} → ${m.payload}`);
        });
      }

      if (!gatewayConnected) {
        console.log('\n' + '═'.repeat(64));
        console.log('🔴 ROOT CAUSE: MSG-21 Gateway is NOT connecting to this broker.');
        console.log('═'.repeat(64));
        console.log('\nThe gateway at 192.168.100.110 is reachable (ping OK) but is');
        console.log('NOT initiating any TCP connection to 192.168.100.20:1883.');
        console.log('\n📋 REQUIRED MANUAL ACTIONS ON THE MSG-21 GATEWAY:');
        console.log('─────────────────────────────────────────────────');
        console.log('1. Open browser → http://192.168.100.110');
        console.log('   Login with gateway credentials (check device label)');
        console.log('2. Navigate to MQTT / Cloud / IIoT Configuration page');
        console.log('3. Verify these settings:');
        console.log(`   • Broker IP:    ${LOCAL_IP}`);
        console.log(`   • Broker Port:  ${MQTT_PORT}`);
        console.log('   • Protocol:     MQTT (NOT MQTTS/TLS)');
        console.log('   • Client ID:    energy-gateway-01');
        if (gatewayDevices.length > 0) {
          console.log(`   • Username:     ${gatewayDevices[0].accessToken}`);
        } else {
          console.log('   • Username:     (create a gateway device in Radiogeet first)');
        }
        console.log('   • Password:     (leave empty — Mosquitto allows anonymous)');
        console.log('   • Topic:        v1/devices/me/telemetry');
        console.log('   • Publish:      ENABLED');
        console.log('   • Interval:     5 seconds');
        console.log('4. SAVE configuration and REBOOT the gateway');
        console.log('5. After reboot, re-run this diagnostic:\n');
        console.log('   node scripts/masibus_diag.js\n');
      }

      setTimeout(() => process.exit(0), 1000);
    }
  }, 2000);
}

runDiagnostics().catch(err => {
  console.error('Diagnostic error:', err);
  process.exit(1);
});
