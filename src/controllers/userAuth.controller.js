const User = require('../models/user.model');
const Tenant = require('../models/tenant.model');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

exports.register = async (req, res, next) => {
    let session = null;
    try {
        const { firstName, lastName, dob, email, password, role, name, subdomain } = req.user;

        const existingSubdomain = await Tenant.exists({ subdomain }).setOptions({ skipTenantScope: true });
        if(existingSubdomain) return res.status(409).json({ success: false, message: "Subdomain already exist" });

        const existingEmail = await User.exists({ email }).setOptions({ skipTenantScope: true });
        if(existingEmail) return res.status(409).json({ success: false, message: "Email already exist" });

        if(isNaN(new Date(dob).getTime())) return res.status(400).json({ success: false, message: "dob is not a valid date" });

        session = await mongoose.startSession();
        session.startTransaction();

        const tenant = await Tenant.create({
            name,
            subdomain,
            studentLimit: 100
        });

        const user = await User.create({
            firstName,
            lastName,
            isOwner: true,
            dob,
            email,
            password,
            role,
            tenantId: tenant._id
        });

        await session.commitTransaction();

        return res.status(201).json({ success: true, message: `${name} Created Successfully`, data: user });
    } catch(error) {
        console.log(error);
        if(session) await session.abortTransaction();
        next(error);
    } finally {
        if(session) await session.endSession();
    }
}

exports.login = async (req, res, next) => {
    try {
        const { emailOrId, password } = req.body;

        const user = await User.findOne({
            $or: [
                { email: emailOrId, tenantId: req.tenant._id },
                { authUserId: emailOrId, tenantId: req.tenant._id }
            ]
        }).select('+password');

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
        next(error);
    }
}

exports.createTenantUser = async (req, res, next) => {
    try {
        const { firstName, lastName, dob, email, password, role } = req.body;

        const tenantId = req.tenant._id;

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
        next(error);
    }
}

exports.getMe = async (req, res, next) => {
    try {
        const tenantId = req.tenant._id;
        const userId = req.user._id;

        const user = await User.findOne({ _id: userId, tenantId }).populate('tenantId');

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
