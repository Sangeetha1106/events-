const bcrypt = require('bcryptjs');
const Attender = require('./attender.model');
const Organizer = require('../organizer/organizer.model');
const { generateToken } = require('../../utils/jwt');
const { sendSuccess, sendError } = require('../../utils/response');

const register = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        const existingAttender = await Attender.findOne({ where: { email } });
        if (existingAttender) {
            return sendError(res, 400, 'Email already registered');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newAttender = await Attender.create({
            fullName,
            email,
            password: hashedPassword
        });

        const attenderData = newAttender.toJSON();
        delete attenderData.password;

        return sendSuccess(res, 201, 'Registration successful', attenderData);
    } catch (error) {
        return sendError(res, 500, 'Server error', error.message);
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const attender = await Attender.findOne({ where: { email } });
        if (!attender) {
            return sendError(res, 404, 'User not found');
        }

        const isMatch = await bcrypt.compare(password, attender.password);
        if (!isMatch) {
            return sendError(res, 401, 'Invalid credentials');
        }

        const token = generateToken({ id: attender.id, role: attender.role, email: attender.email });

        return sendSuccess(res, 200, 'Login successful', { token });
    } catch (error) {
        return sendError(res, 500, 'Server error', error.message);
    }
};

const viewOrganizers = async (req, res) => {
    try {
        const organizers = await Organizer.findAll({
            attributes: ['id', 'organizationName', 'email', 'contactNumber']
        });
        return sendSuccess(res, 200, 'Organizers retrieved', organizers);
    } catch (error) {
        return sendError(res, 500, 'Server error', error.message);
    }
};

const viewOrganizerDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const organizer = await Organizer.findByPk(id, {
            attributes: ['id', 'organizationName', 'email', 'contactNumber']
        });

        if (!organizer) {
            return sendError(res, 404, 'Organizer not found');
        }

        return sendSuccess(res, 200, 'Organizer details retrieved', organizer);
    } catch (error) {
        return sendError(res, 500, 'Server error', error.message);
    }
};

module.exports = {
    register,
    login,
    viewOrganizers,
    viewOrganizerDetails
};
