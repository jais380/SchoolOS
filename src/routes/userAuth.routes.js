const express = require('express');
const router = express.Router();
const { login, register, createTenantUser, getMe } = require('../controllers/userAuth.controller');
const { validate, loginSchema, registerSchema, createTenantUserSchema } = require('../middlewares/validate.middleware');
const { protect, authorize } = require('../middlewares/auth.middleware');

// All except superadmin
router.post('/user/login', validate(loginSchema), login);
router.get('/user/me', protect, authorize('admin', 'staff', 'parent', 'student'), getMe);

// Admin ONLY
router.post('/admin/register', validate(registerSchema), register);
router.post('/admin/create-tenant-user', protect, authorize('admin'), validate(createTenantUserSchema), createTenantUser);

module.exports = router;
