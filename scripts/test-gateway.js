/**
 * RadioGeet IoT Platform - Industrial Gateway Telemetry Test Script
 * Run: node scripts/test-gateway.js
 */

const http = require('http');

async function testGatewayTelemetry() {
  console.log('🚀 Testing Industrial Gateway Telemetry Stream...\n');

  // 1. Fetch gateway token from database
  const { Device } = require('../backend/models');
  const gateway = await Device.findOne({ where: { isGateway: true } });

  if (!gateway) {
    console.error('❌ No Gateway found in database! Please create one at http://localhost:2004/gateways first.');
    process.exit(1);
  }

  console.log(`📡 Found Gateway: [${gateway.name}]`);
  console.log(`🔑 Gateway Token: [${gateway.accessToken}]\n`);

  // 2. Prepare ThingsBoard format multi-device payload
  const now = Date.now();
  const payload = {
    "Plant_Main_Energy_Meter": [
      {
        "ts": now,
        "values": {
          "voltage_V": parseFloat((415.0 + (Math.random() - 0.5) * 4).toFixed(2)),
          "current_A": parseFloat((52.4 + (Math.random() - 0.5) * 8).toFixed(2)),
          "powerFactor": parseFloat((0.95 + (Math.random() - 0.5) * 0.04).toFixed(2)),
          "activePower_kW": parseFloat((38.2 + (Math.random() - 0.5) * 5).toFixed(2)),
          "frequency_Hz": 50.0
        }
      }
    ],
    "Industrial_Air_Compressor": {
      "pressure_bar": parseFloat((6.8 + (Math.random() - 0.5) * 0.4).toFixed(2)),
      "motor_running": true,
      "temperature_C": parseFloat((42.5 + (Math.random() - 0.5) * 1.5).toFixed(2))
    }
  };

  const dataString = JSON.stringify(payload);

  const options = {
    hostname: 'localhost',
    port: 2004,
    path: `/api/v1/${gateway.accessToken}/gateway/telemetry`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(dataString),
    },
  };

  const req = http.request(options, (res) => {
    let responseBody = '';
    res.on('data', (chunk) => { responseBody += chunk; });
    res.on('end', () => {
      console.log(`✅ Server Response [Status ${res.statusCode}]:`);
      try {
        console.log(JSON.stringify(JSON.parse(responseBody), null, 2));
      } catch (e) {
        console.log(responseBody);
      }
      console.log('\n🎉 SUCCESS! Open http://localhost:2004/gateways and click on your Gateway.');
      console.log('You will see the connected machines with live values updating!');
      process.exit(0);
    });
  });

  req.on('error', (err) => {
    console.error('❌ Connection error:', err.message);
    process.exit(1);
  });

  req.write(dataString);
  req.end();
}

testGatewayTelemetry();
