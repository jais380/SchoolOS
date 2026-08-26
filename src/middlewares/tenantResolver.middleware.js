// src/middleware/tenantResolver.js
const Tenant = require('../models/tenant.model');

const tenantResolver = async (req, res, next) => {
  try {
    if (req.path.startsWith('/api/super-admin')) {
      return next(); // Skip entirely, no tenant validation needed
    }

    const host = req.hostname; // e.g. "greenwood.schoolos.com"
    const subdomain = host.split('.')[0];

    // Handle localhost/dev — you'll likely test with a header instead of real subdomains
    if (['localhost', '127', 'www'].includes(subdomain) || !host.includes('.')) {
      const tenantId = req.headers['x-tenant-id']; // dev-only escape hatch
      if (!tenantId) {
        return res.status(400).json({ success: false, message: 'Tenant could not be resolved' });
      }
      req.tenant = await Tenant.findById(tenantId);
    } else {
      req.tenant = await Tenant.findOne({ subdomain, status: 'active' });
    }

    if (!req.tenant) {
      return res.status(404).json({ success: false, message: 'School not found' });
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { tenantResolver };
