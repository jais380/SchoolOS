const { z } = require('zod')

const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);
    if(!result.success) {
        res.status(403).json({
            success: false,
            errors: result.error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message
            }))
        });
    }
    req.body = result.data;
    next();
};

const superAdminLoginSchema = z.object({
    emailOrId: z.string().trim().min(1),
    password: z.string().trim().min(6),
});

const createTenantSchema = z.object({
    name: z.string().trim().min(1),
    subdomain: z.string().toLowerCase().trim().min(1),
    studentLimit: z.coerce.number().min(1)
});

const createUserSchema = z.object({
    firstName: z.string().trim().min(1),
    lastName: z.string().trim().min(1),
    email: z.email().trim(),
    password: z.string().trim().min(6),
    dob: z.string().trim().min(1),
    role: z.enum(['superadmin', 'admin', 'staff', 'parent', 'student']),
    tenantId: z.string().trim().min(1)
});

module.exports = {
    validate,
    superAdminLoginSchema,
    createTenantSchema,
    createUserSchema
};
