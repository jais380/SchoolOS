const express = require('express');
const router = express.Router();
const { bootstrap, login, createTenant, createUser, getTenants, getUser } = require('../controllers/adminAuth.controller');
const { validate, loginSchema, createTenantSchema, createUserSchema } = require('../middlewares/validate.middleware');
const { protect, authorize } = require('../middlewares/auth.middleware');

// SuperAdmin ONLY
router.post('/bootstrap', bootstrap);
router.post('/login', validate(loginSchema), login);
router.post('/create-tenant', protect, authorize('superadmin'), validate(createTenantSchema), createTenant);
router.post('/create-user', protect, authorize('superadmin'), validate(createUserSchema), createUser);
router.get('/tenants', protect, authorize('superadmin'), getTenants)
router.get('/user/:id', protect, authorize('superadmin'), validate(), getUser);

module.exports = router;
