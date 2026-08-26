const express = require('express');
const router = express.Router();
const { bootstrap, login, createTenant, createUser } = require('../controllers/adminAuth.controller');
const { validate, superAdminLoginSchema, createTenantSchema, createUserSchema } = require('../middlewares/validate.middleware');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.post('/bootstrap', bootstrap);
router.post('/login', validate(superAdminLoginSchema), login);
router.post('/create-tenant', protect, authorize('superadmin'), validate(createTenantSchema), createTenant);
router.post('/create-user', protect, authorize('superadmin'), validate(createUserSchema), createUser);

module.exports = router;
