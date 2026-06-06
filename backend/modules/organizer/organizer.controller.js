const bcrypt = require('bcryptjs');
const Organizer = require('./organizer.model');
const { generateToken } = require('../../utils/jwt');
const { sendSuccess, sendError } = require('../../utils/response');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const organizer = await Organizer.findOne({ where: { email } });
        if (!organizer) {
            return sendError(res, 404, 'Organizer not found');
        }

        const isMatch = await bcrypt.compare(password, organizer.password);
        if (!isMatch) {
            return sendError(res, 401, 'Invalid credentials');
        }

        const token = generateToken({ id: organizer.id, role: organizer.role, email: organizer.email });

        return sendSuccess(res, 200, 'Login successful', { token });
    } catch (error) {
        return sendError(res, 500, 'Server error', error.message);
    }
};

module.exports = {
    login
};
