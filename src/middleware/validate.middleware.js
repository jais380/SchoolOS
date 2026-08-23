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

exports.module = { validate };
