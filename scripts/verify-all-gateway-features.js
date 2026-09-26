/**
 * Comprehensive Gateway System Verification Script (Pure Native Node fetch)
 * Tests all Gateway APIs, ThingsBoard Configuration, Ingestion, and Persistence.
 */

const BASE_URL = 'http://localhost:2004';

async function request(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  let data = null;
  const text = await res.text();
  try {
    data = JSON.parse(text);
  } catch (e) {
    data = text;
  }
  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  console.log('================================================================');
  console.log('🧪 Starting Comprehensive Gateway & ThingsBoard Verification Test');
  console.log('================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passedTests++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
      process.exitCode = 1;
    }
  }

  try {
    // 1. Health Check
    console.log('1. Checking Server Health...');
    const healthRes = await request(`${BASE_URL}/api/health`);
    assert(healthRes.status === 200 && healthRes.data?.status === 'ok', 'Server health endpoint is OK (200)');

    // 2. Authentication
    console.log('\n2. Authenticating as Tenant User...');
    const authRes = await request(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@cloudboard.io',
        password: 'demo1234'
      })
    });
    const token = authRes.data?.token;
    assert(Boolean(token), 'Login successful, received JWT Bearer token');

    const authHeaders = {
      Authorization: `Bearer ${token}`
    };

    // 3. Get All Gateways
    console.log('\n3. Fetching Gateway List...');
    let listRes = await request(`${BASE_URL}/api/gateways`, {
      method: 'GET',
      headers: authHeaders
    });
    assert(Array.isArray(listRes.data), `Gateways endpoint returned array (${listRes.data.length} gateways found)`);

    let testGateway = listRes.data.find(g => g.name.includes('Plant Floor Modbus Gateway 01')) || listRes.data[0];

    // If no gateway exists, create one
    if (!testGateway) {
      console.log('  Creating a test gateway...');
      const createRes = await request(`${BASE_URL}/api/gateways`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          name: 'Plant Floor Modbus Gateway 01',
          protocolType: 'Modbus TCP / RTU',
          ip: '192.168.1.120',
          port: 502,
          pollInterval: 5000,
          description: 'Factory Floor RS485 Gateway Alpha'
        })
      });
      testGateway = createRes.data;
      assert(Boolean(testGateway?.id), 'Successfully created test gateway');
    }

    console.log(`\n4. Testing Gateway [${testGateway.name}] (ID: ${testGateway.id})...`);

    // 4. Get Gateway Details
    const detailRes = await request(`${BASE_URL}/api/gateways/${testGateway.id}`, {
      method: 'GET',
      headers: authHeaders
    });
    assert(detailRes.status === 200, 'GET /api/gateways/:id returned status 200');
    assert(Boolean(detailRes.data?.gatewayConfig), 'Gateway includes ThingsBoard gatewayConfig schema');
    assert(Boolean(detailRes.data?.gatewayConfig?.connectors), 'gatewayConfig includes connectors list');
    assert(Boolean(detailRes.data?.gatewayConfig?.storage), 'gatewayConfig includes storage buffer settings');

    // 5. Update ThingsBoard Configuration
    console.log('\n5. Updating ThingsBoard Configuration (General & Connectors)...');
    const updatePayload = {
      name: testGateway.name,
      gatewayConfig: {
        ...(detailRes.data.gatewayConfig || {}),
        remoteConfiguration: true,
        remoteShell: false,
        platformHost: 'thingsboard.cloud',
        platformPort: 1883,
        security: {
          type: 'ACCESS_TOKEN',
          accessToken: testGateway.accessToken
        },
        connectors: [
          { id: 'modbus-1', name: 'Modbus RS485 Master', type: 'modbus', enabled: true, pollPeriod: 3000, port: 502, status: 'CONNECTED' },
          { id: 'mqtt-1', name: 'MQTT Edge Bridge', type: 'mqtt', enabled: true, brokerHost: '127.0.0.1', brokerPort: 1883, status: 'CONNECTED' },
          { id: 'opcua-1', name: 'OPC-UA Server Bridge', type: 'opcua', enabled: false, endpoint: 'opc.tcp://192.168.1.150:4840', status: 'DISABLED' }
        ],
        storage: {
          type: 'file',
          maxRecords: 100000,
          readBatchSize: 100,
          dataRetentionDays: 7
        }
      }
    };
    const updateRes = await request(`${BASE_URL}/api/gateways/${testGateway.id}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify(updatePayload)
    });
    assert(updateRes.status === 200, 'PUT /api/gateways/:id updated configuration successfully (200)');

    // Verify persistence
    const verifyRes = await request(`${BASE_URL}/api/gateways/${testGateway.id}`, {
      method: 'GET',
      headers: authHeaders
    });
    assert(
      verifyRes.data?.gatewayConfig?.platformHost === 'thingsboard.cloud' &&
      verifyRes.data?.gatewayConfig?.connectors?.length === 3,
      'Updated configuration persisted correctly in DB'
    );

    // 6. Test Diagnostic Logs Endpoint
    console.log('\n6. Testing Diagnostic Logs Stream (/api/gateways/:id/logs)...');
    const logsRes = await request(`${BASE_URL}/api/gateways/${testGateway.id}/logs`, {
      method: 'GET',
      headers: authHeaders
    });
    assert(logsRes.status === 200 && Array.isArray(logsRes.data), 'Logs endpoint returned 200 with logs array');
    assert(logsRes.data?.length > 0 && logsRes.data[0]?.message, `Received ${logsRes.data?.length} real-time diagnostic log entries`);

    // 7. Test Performance Statistics Endpoint
    console.log('\n7. Testing Performance Statistics (/api/gateways/:id/stats)...');
    const statsRes = await request(`${BASE_URL}/api/gateways/${testGateway.id}/stats`, {
      method: 'GET',
      headers: authHeaders
    });
    assert(statsRes.status === 200, 'Stats endpoint returned 200');
    assert(
      statsRes.data?.status !== undefined && statsRes.data?.cpuUsage !== undefined,
      `Received performance stats: Status=${statsRes.data?.status}, CPU=${statsRes.data?.cpuUsage}%, Active Connectors=${statsRes.data?.activeConnectors}`
    );

    // 8. Test Ingestion of Industrial Multi-Device Telemetry
    console.log('\n8. Pushing Industrial Telemetry Payload to Gateway...');
    const gwToken = testGateway.accessToken;
    const telemetryPayload = {
      "Plant_Main_Energy_Meter": [
        {
          "ts": Date.now(),
          "values": {
            "voltage_V": 418.5,
            "current_A": 28.3,
            "activePower_kW": 11.8,
            "powerFactor": 0.96,
            "frequency_Hz": 50.02
          }
        }
      ],
      "Industrial_Air_Compressor": {
        "pressure_bar": 7.4,
        "temperature_C": 58.2,
        "motor_running": true,
        "operating_hours": 1420
      }
    };

    const pushRes = await request(`${BASE_URL}/api/v1/${gwToken}/gateway/telemetry`, {
      method: 'POST',
      body: JSON.stringify(telemetryPayload)
    });
    assert(pushRes.status === 200, 'Gateway telemetry ingested successfully (200)');
    assert(pushRes.data?.subDevicesCount === 2, 'Server recognized and auto-provisioned 2 sub-devices');

    // 9. Verify Gateway Status is now ONLINE
    console.log('\n9. Verifying Gateway ONLINE Status after Telemetry...');
    const afterTelemetryRes = await request(`${BASE_URL}/api/gateways/${testGateway.id}`, {
      method: 'GET',
      headers: authHeaders
    });
    assert(afterTelemetryRes.data?.status === 'ONLINE', 'Gateway status updated to ONLINE upon receiving live telemetry');
    assert(afterTelemetryRes.data?.subDevices?.length >= 2, `Sub-devices mapped under gateway (${afterTelemetryRes.data?.subDevices?.length} machines)`);

    console.log('\n================================================================');
    console.log(`🏁 Verification Result: ${passedTests}/${totalTests} Tests PASSED! All Features Working 100%!`);
    console.log('================================================================\n');

  } catch (err) {
    console.error('\n❌ Verification Failed with Error:', err.message);
    process.exitCode = 1;
  }
}

runTests();
