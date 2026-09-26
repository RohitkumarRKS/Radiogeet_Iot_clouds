const db = require('../models');

/**
 * Simple rule engine — evaluates the root rule chain for incoming telemetry.
 * In a real system this would execute the node graph; here we provide
 * a simplified pipeline: input → filter → action.
 */
async function executeRuleChain(tenantId, entityId, telemetryData) {
  try {
    const rootChain = await db.RuleChain.findOne({
      where: { tenantId, isRoot: true },
    });

    if (!rootChain || !rootChain.configuration) return;

    const nodes = rootChain.configuration.nodes || [];
    const connections = rootChain.configuration.connections || [];

    // Find input node
    const inputNode = nodes.find(n => n.type === 'input');
    if (!inputNode) return;

    // Walk connections from input
    const visited = new Set();
    await walkNode(inputNode, nodes, connections, visited, { entityId, tenantId, data: telemetryData });
  } catch (err) {
    console.error('Rule engine error:', err.message);
  }
}

async function walkNode(node, allNodes, connections, visited, context) {
  if (visited.has(node.id)) return;
  visited.add(node.id);

  // Execute node logic based on type
  let result = true;
  switch (node.type) {
    case 'input':
      result = true; // Pass-through
      break;

    case 'filter':
      result = evaluateFilter(node, context);
      break;

    case 'transform':
      context.data = applyTransform(node, context.data);
      break;

    case 'action':
      await executeAction(node, context);
      break;

    case 'external':
      await executeExternal(node, context);
      break;

    default:
      break;
  }

  if (!result) return;

  // Find outgoing connections
  const outgoing = connections.filter(c => c.from === node.id);
  for (const conn of outgoing) {
    // Check connection label matches (e.g., "True" / "False" for filters)
    if (conn.label === 'False' && result !== true) continue;
    if (conn.label === 'True' && result !== true) continue;

    const nextNode = allNodes.find(n => n.id === conn.to);
    if (nextNode) {
      await walkNode(nextNode, allNodes, connections, visited, context);
    }
  }
}

function evaluateFilter(node, context) {
  const config = node.config || {};
  const key = config.key;
  const value = context.data?.[key];
  if (value === undefined) return false;

  switch (config.operation) {
    case 'GREATER_THAN': return parseFloat(value) > parseFloat(config.value);
    case 'LESS_THAN': return parseFloat(value) < parseFloat(config.value);
    case 'EQUALS': return parseFloat(value) === parseFloat(config.value);
    default: return true;
  }
}

function applyTransform(node, data) {
  // Simple key renaming or value scaling
  const config = node.config || {};
  if (config.multiply && config.key) {
    data[config.key] = (parseFloat(data[config.key]) || 0) * parseFloat(config.multiply);
  }
  return data;
}

async function executeAction(node, context) {
  const config = node.config || {};

  switch (config.action) {
    case 'CREATE_ALARM':
      const alarmService = require('./alarmService');
      await alarmService.createAlarm({
        tenantId: context.tenantId,
        originatorType: 'DEVICE',
        originatorId: context.entityId,
        type: config.alarmType || 'rule_alarm',
        severity: config.severity || 'WARNING',
        detail: { message: config.message || 'Rule triggered', data: context.data },
      });
      break;

    case 'LOG':
      console.log(`[RuleEngine] Action log: ${config.message || ''}`, context.data);
      break;

    default:
      break;
  }
}

async function executeExternal(node, context) {
  const config = node.config || {};

  switch (config.type) {
    case 'WEBHOOK':
      try {
        const fetch = globalThis.fetch || require('node-fetch');
        await fetch(config.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ entityId: context.entityId, data: context.data }),
        });
      } catch (err) {
        console.error('Webhook error:', err.message);
      }
      break;

    case 'EMAIL':
      console.log(`[RuleEngine] Would send email to ${config.to}: ${config.subject}`);
      break;

    default:
      break;
  }
}

module.exports = { executeRuleChain };
