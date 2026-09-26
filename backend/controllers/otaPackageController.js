const { OtaPackage } = require('../models');
const { Op } = require('sequelize');

exports.getOtaPackages = async (req, res, next) => {
  try {
    const { search } = req.query;
    const tenantId = req.user.tenantId;

    const where = { tenantId };
    if (search) {
      where.title = { [Op.like]: `%${search}%` };
    }

    const packages = await OtaPackage.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });

    res.json({ data: packages });
  } catch (error) {
    next(error);
  }
};

exports.createOtaPackage = async (req, res, next) => {
  try {
    const { title, version, type, checksumAlgorithm, checksum, content } = req.body;
    const tenantId = req.user.tenantId;

    const ota = await OtaPackage.create({
      title,
      version,
      type: type || 'FIRMWARE',
      checksumAlgorithm: checksumAlgorithm || 'SHA256',
      checksum: checksum || 'a1b2c3d4e5f6',
      content: content || '',
      tenantId,
    });

    res.status(201).json(ota);
  } catch (error) {
    next(error);
  }
};

exports.deleteOtaPackage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tenantId = req.user.tenantId;

    const deleted = await OtaPackage.destroy({ where: { id, tenantId } });
    if (!deleted) return res.status(404).json({ error: 'OTA Package not found' });

    res.json({ message: 'OTA Package deleted successfully' });
  } catch (error) {
    next(error);
  }
};
