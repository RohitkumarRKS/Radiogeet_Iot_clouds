const { Customer } = require('../models');
const { Op } = require('sequelize');

exports.getAll = async (req, res, next) => {
  try {
    const { page = 0, pageSize = 20, search } = req.query;
    const where = { tenantId: req.user.tenantId };
    if (search) where.name = { [Op.like]: `%${search}%` };

    const { count, rows } = await Customer.findAndCountAll({
      where,
      limit: parseInt(pageSize),
      offset: parseInt(page) * parseInt(pageSize),
      order: [['name', 'ASC']],
    });

    res.json({ data: rows, totalElements: count, totalPages: Math.ceil(count / pageSize) });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const customer = await Customer.findOne({ where: { id: req.params.id, tenantId: req.user.tenantId } });
    if (!customer) return res.status(404).json({ error: 'Customer not found.' });
    res.json(customer);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name, email, phone, country, city, address } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required.' });

    const customer = await Customer.create({
      name, email, phone, country, city, address,
      tenantId: req.user.tenantId,
    });
    res.status(201).json(customer);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const customer = await Customer.findOne({ where: { id: req.params.id, tenantId: req.user.tenantId } });
    if (!customer) return res.status(404).json({ error: 'Customer not found.' });

    Object.assign(customer, req.body);
    await customer.save();
    res.json(customer);
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const customer = await Customer.findOne({ where: { id: req.params.id, tenantId: req.user.tenantId } });
    if (!customer) return res.status(404).json({ error: 'Customer not found.' });
    await customer.destroy();
    res.json({ message: 'Customer deleted.' });
  } catch (error) {
    next(error);
  }
};
