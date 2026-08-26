const User = require('../models/user.model');
const Tenant = require('../models/tenant.model');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {

}

exports.login = async (req, res) => {
    try {
        const { emailOrId, password } = req.body;

        const user = await User.findOne({
            $or: [
                { email: emailOrId, tenantId: req.tenant._id },
                { authUserId: emailOrId, tenantId: req.tenant._id }
            ]
        }).select('+password').setOptions({ skipTenantScope: true });

        if(!user) return res.status(404).json({ success: false, message: "Email or AuthUserId not found" });

        const isMatch = await User.matchPassword(password);

        if(!isMatch) return res.status(400).json({ success: false, message: "Wrong Password" });

        const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

        return res.status(200).json({
            success: true,
            message: "User logged in successfully",
            data: user,
            token
        });
    } catch(error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Login Failed, Please try again later" });
    }
}
