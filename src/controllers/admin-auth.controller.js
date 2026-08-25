const User = require('../models/user.model');
const Tenant = require('../models/tenant.model');
const jwt = require('jsonwebtoken');

exports.bootstrap = async (req, res) => {
    try {
        const existingSuperAdmin = await User.exists({ role: 'superadmin' });

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
        return res.status(500).json({ success: false, message: "Failed to provision Super Admin" });
    }
}

exports.createTenant = async (req, res) => {
    try {
        const {  name, subdomain, studentLimit } = req.body;

        const isExisting = await Tenant.exists({ subdomain });

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
        return res.status(500).json({ success: false, message: "Failed to create user" });
    }
}

exports.createUser = async (req, res) => {
    try {
        const { firstName, lastName, dob, email, password, role } = req.body;

        const tenantId = req.tenant.id;

        if(!tenantId) return res.status(400).json({ success: false, message: "Tenant Id not provided" });

        if(isNaN(new Date(dob).getTime())) {
            return res.status(400).json({ success: false, message: "dob is not valid" });
        }

        const isExisting = await User.exists({ email, tenantId });

        if(isExisting) {
            return res.status(409).json({ success: false, message: "Email already exist" });
        }

        const user = await User.create({
            firstName,
            lastName,
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
        return res.status(500).json({ success: false, message: "Failed to create user" });
    }
}
