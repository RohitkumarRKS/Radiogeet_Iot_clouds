const { Device } = require('../models');
const { processTelemetry } = require('./telemetryService');

let intervalId = null;

/**
 * Live Telemetry Simulator
 * Continuously generates realistic sensor telemetry data for all active devices
 * and pushes updates every 3 seconds to database + WebSocket subscribers.
 */
function startTelemetrySimulator() {
  if (process.env.ENABLE_TELEMETRY_SIMULATOR !== 'true') {
    console.log('⚡ Live Telemetry Simulator is disabled (No fake data generator running).');
    return;
  }
  if (intervalId) return;

  console.log('⚡ Live Telemetry Simulator started (streaming data every 3 seconds)...');

  intervalId = setInterval(async () => {
    try {
      // Find devices explicitly marked for simulation
      const devices = await Device.findAll({
        where: { isActive: true },
        attributes: ['id', 'name', 'type', 'additionalInfo']
      });

      const simDevices = devices.filter(dev => dev.additionalInfo && dev.additionalInfo.isSimulated === true);
      if (!simDevices || simDevices.length === 0) return;

      const now = Date.now();

      for (const dev of simDevices) {
        const telemetryData = {};

        if (dev.type === 'thermostat') {
          // Temperature oscillation with small noise
          telemetryData.temperature = parseFloat((22 + Math.sin(now / 10000) * 5 + (Math.random() - 0.5) * 1.2).toFixed(2));
          telemetryData.humidity = parseFloat((50 + Math.cos(now / 12000) * 10 + (Math.random() - 0.5) * 2).toFixed(2));
        } else if (dev.type === 'humidity') {
          telemetryData.humidity = parseFloat((55 + Math.sin(now / 8000) * 15 + (Math.random() - 0.5) * 2.5).toFixed(2));
          telemetryData.temperature = parseFloat((23 + (Math.random() - 0.5) * 0.8).toFixed(2));
        } else if (dev.type === 'energy' || dev.type === 'energy_meter') {
          const voltage = parseFloat((415.0 + (Math.random() - 0.5) * 6).toFixed(2));
          const current = parseFloat((55.0 + Math.sin(now / 10000) * 25 + (Math.random() - 0.5) * 5).toFixed(2));
          const powerFactor = parseFloat(Math.min(1.0, Math.max(0.75, 0.92 + (Math.random() - 0.5) * 0.08)).toFixed(2));
          const activePower = parseFloat(((voltage * current * 1.732 * powerFactor) / 1000).toFixed(2));
          const frequency = parseFloat((49.95 + (Math.random() - 0.5) * 0.1).toFixed(2));

          telemetryData.voltage_V = voltage;
          telemetryData.current_A = current;
          telemetryData.activePower_kW = activePower;
          telemetryData.powerFactor = powerFactor;
          telemetryData.frequency_Hz = frequency;
          telemetryData.totalEnergy_kWh = parseFloat((14500 + (now % 86400000) / 3600).toFixed(2));
        } else if (dev.type === 'air_quality') {
          telemetryData.aqi = Math.floor(45 + Math.sin(now / 15000) * 30 + Math.random() * 10);
          telemetryData.pm25 = parseFloat((12 + Math.random() * 8).toFixed(1));
          telemetryData.co2 = Math.floor(420 + Math.random() * 80);
        } else if (dev.type === 'gateway') {
          telemetryData.cpu = parseFloat((25 + Math.sin(now / 5000) * 20 + Math.random() * 10).toFixed(1));
          telemetryData.memory = parseFloat((48 + (Math.random() - 0.5) * 2).toFixed(1));
        } else {
          telemetryData.value = parseFloat((65 + Math.sin(now / 7000) * 25 + (Math.random() - 0.5) * 5).toFixed(2));
          telemetryData.pressure = parseFloat((4.2 + (Math.random() - 0.5) * 0.4).toFixed(2));
        }

        // Process telemetry (stores in DB, updates device activity, broadcasts via WS)
        await processTelemetry(dev.id, telemetryData, now).catch(() => {});
      }
    } catch (err) {
      console.error('Telemetry simulator error:', err.message);
    }
  }, 3000);
}

function stopTelemetrySimulator() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log('🛑 Live Telemetry Simulator stopped.');
  }
}

module.exports = {
  startTelemetrySimulator,
  stopTelemetrySimulator,
};
