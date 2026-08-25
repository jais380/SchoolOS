const express = require('express');
const router = express.Router();
const { bootstrap, createTenant, createUser } = require('../controllers/admin-auth.controller');
const { validate, createTenantSchema, createUserSchema } = require('../middlewares/validate.middleware');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.post('/bootstrap', bootstrap);
router.post('/create-tenant', authorize(['superadmin']), validate(createTenantSchema), createTenant);
router.post('/create-user', authorize(['superadmin']), validate(createUserSchema), createUser);

module.exports = router;
