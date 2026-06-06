const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db');
const Organizer = require('../organizer/organizer.model');

const Event = sequelize.define('Event', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    time: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    image: {
        type: DataTypes.TEXT, // Using TEXT for long base64 URLs or URLs
        allowNull: true,
    },
    ticketPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
    },
    seatLimit: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    schedule: {
        type: DataTypes.JSONB, // Can store array of schedule objects
        defaultValue: [],
    },
    ticketDetails: {
        type: DataTypes.JSONB, // Can store ticket types and prices
        defaultValue: {},
    },
    organizerId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Organizer,
            key: 'id'
        }
    }
}, {
    timestamps: true,
});

Organizer.hasMany(Event, { foreignKey: 'organizerId' });
Event.belongsTo(Organizer, { foreignKey: 'organizerId' });

module.exports = Event;
