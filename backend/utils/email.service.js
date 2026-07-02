const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const sendWelcomeEmail = async (organizerEmail, organizerName, password) => {
    const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`;

    const mailOptions = {
        from: `"EventPro Team" <${process.env.SMTP_USER}>`,
        to: organizerEmail,
        subject: 'Welcome to Eventhub - Organizer Account Created',
        text: `Hello ${organizerName},\n\nYour organizer account has been created successfully.\n\nLogin Credentials:\n\nEmail: ${organizerEmail}\nPassword: ${password}\n\nLogin URL: ${loginUrl}\n\nPlease log in using these credentials and change your password after your first login.\n\nRegards,\nEventPro Team`,
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <p>Hello ${organizerName},</p>
                <p>Your organizer account has been created successfully.</p>
                
                <p><strong>Login Credentials:</strong></p>
                <ul>
                    <li><strong>Email:</strong> ${organizerEmail}</li>
                    <li><strong>Password:</strong> ${password}</li>
                </ul>
                
                <p><strong>Login URL:</strong> <a href="${loginUrl}">${loginUrl}</a></p>
                
                <p>Please log in using these credentials and change your password after your first login.</p>
                <p>Regards,<br>EventPro Team</p>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error: error.message };
    }
};

module.exports = { sendWelcomeEmail };
