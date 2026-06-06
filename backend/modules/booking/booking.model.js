const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db');
const Event = require('../event/event.model');
const Attender = require('../attender/attender.model');

const Booking = sequelize.define('Booking', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    eventId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Event,
            key: 'id'
        }
    },
    attenderId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Attender,
            key: 'id'
        }
    },
    ticketType: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'Standard',
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 1,
    },
    totalPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.00,
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'Confirmed', // Can be Confirmed, Cancelled, etc.
    },
    fullName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    location: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    paymentStatus: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Pending', // pending or paid
    }
}, {
    timestamps: true,
});

Event.hasMany(Booking, { foreignKey: 'eventId' });
Booking.belongsTo(Event, { foreignKey: 'eventId' });

Attender.hasMany(Booking, { foreignKey: 'attenderId' });
Booking.belongsTo(Attender, { foreignKey: 'attenderId' });

module.exports = Booking;
