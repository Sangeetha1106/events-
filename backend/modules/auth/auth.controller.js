const bcrypt = require('bcryptjs');
const Admin = require('../admin/admin.model');
const Organizer = require('../organizer/organizer.model');
const Attender = require('../attender/attender.model');
const { generateToken } = require('../../utils/jwt');
const { sendSuccess, sendError } = require('../../utils/response');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return sendError(res, 400, 'Email/Username and password are required');
        }

        // 1. Search Admin
        let user = await Admin.findOne({ where: { username: email } });
        let role = 'Admin';
        
        // 2. Search Organizer if not Admin
        if (!user) {
            user = await Organizer.findOne({ where: { email } });
            role = 'Organizer';
        }

        // 3. Search Attender if not Organizer
        if (!user) {
            user = await Attender.findOne({ where: { email } });
            role = 'Attender';
        }

        if (!user) {
            return sendError(res, 404, 'Account not found. Please register or check your credentials.');
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return sendError(res, 401, 'Invalid credentials');
        }

        // Generate token
        const tokenPayload = { id: user.id, role: user.role || role };
        if (role === 'Admin') {
            tokenPayload.username = user.username;
        } else {
            tokenPayload.email = user.email;
        }
        
        const token = generateToken(tokenPayload);

        return sendSuccess(res, 200, 'Login successful', { token });
    } catch (error) {
        return sendError(res, 500, 'Server error', error.message);
    }
};

module.exports = { login };
