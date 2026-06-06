const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db');

const Admin = sequelize.define('Admin', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.STRING,
        defaultValue: 'Admin',
    }
}, {
    tableName: 'admins',
    timestamps: true,
});

module.exports = Admin;
