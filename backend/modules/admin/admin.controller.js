const bcrypt = require('bcryptjs');
const Admin = require('./admin.model');
const Organizer = require('../organizer/organizer.model');
const { generateToken } = require('../../utils/jwt');
const { sendSuccess, sendError } = require('../../utils/response');

const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Find admin
        const admin = await Admin.findOne({ where: { username } });
        if (!admin) {
            return sendError(res, 404, 'Admin not found');
        }

        // Check password (assuming plaintext in DB for initial setup or you can seed a hashed one)
        // For security, let's use bcrypt
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return sendError(res, 401, 'Invalid credentials');
        }

        // Generate Token
        const token = generateToken({ id: admin.id, role: admin.role, username: admin.username });

        return sendSuccess(res, 200, 'Login successful', { token });
    } catch (error) {
        return sendError(res, 500, 'Server error', error.message);
    }
};

const createOrganizer = async (req, res) => {
    try {
        const { organizationName, email, password, contactNumber } = req.body;

        const existingOrganizer = await Organizer.findOne({ where: { email } });
        if (existingOrganizer) {
            return sendError(res, 400, 'Organizer with this email already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newOrganizer = await Organizer.create({
            organizationName,
            email,
            password: hashedPassword,
            contactNumber
        });

        // Exclude password from response
        const organizerData = newOrganizer.toJSON();
        delete organizerData.password;

        return sendSuccess(res, 201, 'Organizer created successfully', organizerData);
    } catch (error) {
        return sendError(res, 500, 'Server error', error.message);
    }
};

const viewOrganizers = async (req, res) => {
    try {
        const organizers = await Organizer.findAll({
            attributes: { exclude: ['password'] }
        });

        return sendSuccess(res, 200, 'Organizers retrieved successfully', organizers);
    } catch (error) {
        return sendError(res, 500, 'Server error', error.message);
    }
};

const organizerCount = async (req, res) => {
    try {
        const count = await Organizer.count();
        return sendSuccess(res, 200, 'Organizer count retrieved', { count });
    } catch (error) {
        return sendError(res, 500, 'Server error', error.message);
    }
};

module.exports = {
    login,
    createOrganizer,
    viewOrganizers,
    organizerCount
};
