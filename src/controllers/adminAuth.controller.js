const User = require('../models/user.model');
const Tenant = require('../models/tenant.model');
const jwt = require('jsonwebtoken');

exports.bootstrap = async (req, res, next) => {
    try {
        const existingSuperAdmin = await User.exists({ role: 'superadmin' }).setOptions({ skipTenantScope: true });;

        if(existingSuperAdmin) {
            return res.status(409).json({ success: false, message: "Default Super Admin already exists" })
        }

        const email = process.env.SUPER_ADMIN_EMAIL;
        const password = process.env.SUPER_ADMIN_PASSWORD;
        const firstName = process.env.SUPER_ADMIN_FIRSTNAME;
        const lastName = process.env.SUPER_ADMIN_LASTNAME;
        const dob = process.env.SUPER_ADMIN_DOB;

        if(!email || !password || !firstName || !lastName || !dob) {
            return res.status(400).json({ success: false, message: "Ensure super admin details are added to env file" });
        }

        if(isNaN(new Date(dob).getTime())) {
            return res.status(400).json({ success: false, message: "dob is not valid" });
        }

        const user = await User.create({
            firstName,
            lastName,
            dob,
            email,
            password,
            role: 'superadmin'
        });

        return res.status(201).json({
            success: true,
            message: "Default Super Admin Created",
            data: user
        });
    } catch(error) {
        console.log(error);
        next(error);
    }
}

exports.login = async (req, res, next) => {
    try {
        const { emailOrId, password } = req.body;

        const existingUser = await User.findOne({
            $or: [
                { email: emailOrId, role: 'superadmin' },
                { authUserId: emailOrId, role: 'superadmin' }
            ]
        }).select('+password').setOptions({ skipTenantScope: true });

        if(!existingUser) return res.status(404).json({ success: false, message: "Email or AuthUserId not found" });

        const isMatch = await existingUser.matchPassword(password);

        if(!isMatch) return res.status(400).json({ success: false, message: "Wrong Password" });

        const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

        return res.status(200).json({
            success: true,
            message: "User logged in successfully",
            data: existingUser,
            token
        });
    } catch(error) {
        console.log(error);
        next(error);
    }
}

exports.createTenant = async (req, res, next) => {
    try {
        const {  name, subdomain, studentLimit } = req.body;

        const isExisting = await Tenant.exists({ subdomain }).setOptions({ skipTenantScope: true });;

        if(isExisting) {
            return res.status(409).json({ success: false, message: "Subdomain already exist" });
        }

        const user = await Tenant.create({
            name,
            subdomain,
            studentLimit
        });

        return res.status(201).json({
            success: true,
            message: "Tenant created successfully",
            data: user
        });
    } catch(error) {
        console.log(error);
        next(error);
    }
}

exports.createUser = async (req, res, next) => {
    try {
        const { firstName, lastName, dob, email, password, role, tenantId } = req.body;

        const tenant = await Tenant.findOne({ _id: tenantId }).setOptions({ skipTenantScope: true });

        if(!tenant) return res.status(400).json({ success: false, message: "Tenant could not be resolved" });

        if(isNaN(new Date(dob).getTime())) {
            return res.status(400).json({ success: false, message: "dob is not valid" });
        }

        const isExisting = await User.exists({ email, tenantId }).setOptions({ skipTenantScope: true });;

        if(isExisting) {
            return res.status(409).json({ success: false, message: "Email already exist" });
        }

        const user = await User.create({
            firstName,
            lastName,
            isOwner: req.body.isOwner ?? false,
            dob,
            email,
            password,
            role,
            tenantId
        });

        return res.status(201).json({
            success: true,
            message: "User created successfully",
            data: user
        });
    } catch(error) {
        console.log(error);
        next(error);
    }
}

exports.getTenants = async (req, res, next) => {
    try {
        const user = await User.find().setOptions({ skipTenantScope: true }).populate('tenantId');

        return res.status(200).json({
            success: true,
            message: "User profile fetched successfully",
            data: user
        });
    } catch(error) {
        console.log(error);
        next(error);
    }
}

exports.getUser = async (req, res, next) => {
    try {
        const userId = req.params.id;

        const user = await User.findOne({ _id: userId }).setOptions({ skipTenantScope: true }).populate('tenantId');

        return res.status(200).json({
            success: true,
            message: "User profile fetched successfully",
            data: user
        });
    } catch(error) {
        console.log(error);
        next(error);
    }
}
