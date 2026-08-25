const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if(!token) {
        return res.status(403).json({
            success: false,
            message: "User not authorized, no token"
        });
    }

    if(req.user.tenantId !== req.tenant._id) {
        return res.status(403).json({ success: false, message: "User is not a Tenant" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.id;
        next();
    } catch(error) {
        return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
}

const authorize = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.roles)) {
            return res.status(403).json({
                success: false,
                message: `Role ${req.user.role} does not have access`
            });
        };

        next();
    }
}

module.exports = { protect, authorize };
