const { RuleChain } = require('../models');
const { Op } = require('sequelize');

exports.getAll = async (req, res, next) => {
  try {
    const chains = await RuleChain.findAll({
      where: { tenantId: req.user.tenantId },
      attributes: ['id', 'name', 'description', 'isRoot', 'isDebug', 'createdAt', 'updatedAt'],
      order: [['isRoot', 'DESC'], ['name', 'ASC']],
    });
    res.json({ data: chains });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const chain = await RuleChain.findOne({
      where: { id: req.params.id, tenantId: req.user.tenantId },
    });
    if (!chain) return res.status(404).json({ error: 'Rule chain not found.' });
    res.json(chain);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name, description, isRoot } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required.' });

    if (isRoot) {
      await RuleChain.update(
        { isRoot: false },
        { where: { tenantId: req.user.tenantId, isRoot: true } }
      );
    }

    const chain = await RuleChain.create({
      name,
      description: description || '',
      isRoot: isRoot || false,
      tenantId: req.user.tenantId,
    });

    res.status(201).json(chain);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const chain = await RuleChain.findOne({
      where: { id: req.params.id, tenantId: req.user.tenantId },
    });
    if (!chain) return res.status(404).json({ error: 'Rule chain not found.' });

    const { name, description, isRoot, isDebug, configuration } = req.body;
    if (name !== undefined) chain.name = name;
    if (description !== undefined) chain.description = description;
    if (isDebug !== undefined) chain.isDebug = isDebug;
    if (configuration !== undefined) chain.configuration = configuration;

    if (isRoot && !chain.isRoot) {
      await RuleChain.update(
        { isRoot: false },
        { where: { tenantId: req.user.tenantId, isRoot: true } }
      );
      chain.isRoot = true;
    }

    await chain.save();
    res.json(chain);
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const chain = await RuleChain.findOne({
      where: { id: req.params.id, tenantId: req.user.tenantId },
    });
    if (!chain) return res.status(404).json({ error: 'Rule chain not found.' });

    if (chain.isRoot) {
      return res.status(400).json({ error: 'Cannot delete root rule chain.' });
    }

    await chain.destroy();
    res.json({ message: 'Rule chain deleted.' });
  } catch (error) {
    next(error);
  }
};

exports.setRoot = async (req, res, next) => {
  try {
    await RuleChain.update(
      { isRoot: false },
      { where: { tenantId: req.user.tenantId, isRoot: true } }
    );

    const chain = await RuleChain.findOne({
      where: { id: req.params.id, tenantId: req.user.tenantId },
    });
    if (!chain) return res.status(404).json({ error: 'Rule chain not found.' });

    chain.isRoot = true;
    await chain.save();

    res.json(chain);
  } catch (error) {
    next(error);
  }
};
