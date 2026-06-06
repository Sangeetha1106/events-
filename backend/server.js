const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { connectDB, sequelize } = require('./config/db');
const apiRoutes = require('./routes/index');
const bcrypt = require('bcryptjs');
const Admin = require('./modules/admin/admin.model');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ✅ ROUTES (IMPORTANT FIX HERE)
app.use('/api', apiRoutes);

// Test route
app.get('/', (req, res) => {
    res.send('Event Registration and Ticket Booking API is running...');
});

const PORT = process.env.PORT || 5000;

// 🔥 Seed default admin
const seedAdmin = async () => {
    try {
        const existingAdmin = await Admin.findOne({ where: { username: 'admin' } });

        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash('admin123', 10);

            await Admin.create({
                username: 'admin',
                password: hashedPassword
            });

            console.log('Default Admin created: admin / admin123');
        }

        // Also seed admin@gmail.com to support email-based username input
        const existingEmailAdmin = await Admin.findOne({ where: { username: 'admin@gmail.com' } });

        if (!existingEmailAdmin) {
            const hashedPassword = await bcrypt.hash('admin123', 10);

            await Admin.create({
                username: 'admin@gmail.com',
                password: hashedPassword
            });

            console.log('Default Email Admin created: admin@gmail.com / admin123');
        }
    } catch (error) {
        console.error('Seed error:', error);
    }
};

app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);

    await connectDB();

    try {
        await sequelize.sync({ alter: true });
        console.log('Database synced');

        await seedAdmin();
    } catch (error) {
        console.error('DB sync error:', error);
    }
});