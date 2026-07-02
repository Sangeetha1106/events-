const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db');

const Organizer = sequelize.define('Organizer', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    organizerName: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Unknown Organizer',
    },
    organizationName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    contactNumber: {
        type: DataTypes.STRING,
    },
    role: {
        type: DataTypes.STRING,
        defaultValue: 'Organizer',
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'Active',
    },
    emailStatus: {
        type: DataTypes.STRING,
        defaultValue: 'pending',
    }
}, {
    tableName: 'organizers',
    timestamps: true,
});

module.exports = Organizer;
