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
            <div style="background-color: #121212; color: #e5e5e5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px 20px; text-align: center;">
                <h1 style="color: #facc15; margin-bottom: 10px; font-weight: 700; font-size: 28px;">Welcome to EventPro!</h1>
                <p style="margin-top: 0; font-size: 14px; color: #a3a3a3;">Your organizer account has been successfully created</p>

                <div style="background-color: #1a1a1a; border: 1px solid #facc15; border-radius: 8px; max-width: 500px; margin: 30px auto; padding: 30px; text-align: left;">
                    <p style="font-weight: bold; margin-top: 0; font-size: 15px;">Hello ${organizerName},</p>
                    <p style="line-height: 1.5; color: #d4d4d4; font-size: 14px;">An administrator has registered you as an Event Organizer on our platform. Here are your login credentials:</p>
                    
                    <table style="width: 100%; margin-top: 20px; margin-bottom: 30px; border-collapse: collapse; font-size: 14px;">
                        <tr>
                            <td style="padding: 8px 0; color: #a3a3a3; width: 25%;">Email:</td>
                            <td style="padding: 8px 0; color: #3b82f6;">${organizerEmail}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #a3a3a3; width: 25%;">Password:</td>
                            <td style="padding: 8px 0; color: #e5e5e5;">${password}</td>
                        </tr>
                    </table>
                    
                    <div style="text-align: center; margin-top: 20px;">
                        <a href="${loginUrl}" style="background-color: #facc15; color: #121212; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px; display: inline-block;">Log In to Your Dashboard</a>
                    </div>
                </div>
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
