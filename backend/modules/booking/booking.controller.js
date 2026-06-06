const Booking = require('./booking.model');
const Event = require('../event/event.model');
const Attender = require('../attender/attender.model');
const { sendSuccess, sendError } = require('../../utils/response');
const bcrypt = require('bcryptjs');

// Attender: Book Tickets
const bookTickets = async (req, res) => {
    try {
        const { eventId, ticketType, quantity } = req.body;
        const attenderId = req.user.id;

        const event = await Event.findByPk(eventId);
        if (!event) {
            return sendError(res, 404, 'Event not found');
        }

        // Logic to calculate price based on event's ticketDetails
        const ticketPrices = event.ticketDetails || {};
        const pricePerTicket = ticketPrices[ticketType] || 0;
        const totalPrice = pricePerTicket * quantity;

        const booking = await Booking.create({
            eventId,
            attenderId,
            ticketType,
            quantity,
            totalPrice
        });

        return sendSuccess(res, 201, 'Tickets booked successfully', booking);
    } catch (error) {
        return sendError(res, 500, 'Server error', error.message);
    }
};

// Attender: View Booking History
const viewBookingHistory = async (req, res) => {
    try {
        const attenderId = req.user.id;
        const bookings = await Booking.findAll({
            where: { attenderId },
            include: [{ model: Event, attributes: ['title', 'date', 'location'] }]
        });

        return sendSuccess(res, 200, 'Booking history retrieved', bookings);
    } catch (error) {
        return sendError(res, 500, 'Server error', error.message);
    }
};

// Organizer: View Bookings for their events
const viewEventBookings = async (req, res) => {
    try {
        const organizerId = req.user.id;
        
        // Find all events created by the organizer
        const events = await Event.findAll({
            where: { organizerId },
            attributes: ['id']
        });

        const eventIds = events.map(event => event.id);

        // Find all bookings for these events
        const bookings = await Booking.findAll({
            where: { eventId: eventIds },
            include: [
                { model: Event, attributes: ['title', 'date', 'location'] },
                { model: Attender, attributes: ['fullName', 'email'] }
            ]
        });

        return sendSuccess(res, 200, 'Bookings retrieved', bookings);
    } catch (error) {
        return sendError(res, 500, 'Server error', error.message);
    }
};

// Attender: Create Booking (Public booking flow)
const createBooking = async (req, res) => {
    try {
        const { fullName, email, password, location, eventId, paymentStatus } = req.body;

        if (!eventId) {
            return sendError(res, 400, 'Event ID is required');
        }
        if (!fullName || !email) {
            return sendError(res, 400, 'Full Name and Email are required');
        }

        const event = await Event.findByPk(eventId);
        if (!event) {
            return sendError(res, 404, 'Event not found');
        }

        // Find or create the attender
        let attender = await Attender.findOne({ where: { email } });
        if (!attender) {
            const hashedPassword = await bcrypt.hash(password || 'attender123', 10);
            attender = await Attender.create({
                fullName,
                email,
                password: hashedPassword,
                role: 'Attender'
            });
        }

        // Create the booking record
        const booking = await Booking.create({
            eventId,
            attenderId: attender.id,
            fullName,
            email,
            location,
            paymentStatus: paymentStatus || 'Pending',
            ticketType: 'Standard',
            quantity: 1,
            totalPrice: event.ticketPrice || 0.00
        });

        // Load relations for response
        const bookingWithDetails = await Booking.findByPk(booking.id, {
            include: [
                { model: Event, attributes: ['title', 'date', 'location'] },
                { model: Attender, attributes: ['fullName', 'email'] }
            ]
        });

        return sendSuccess(res, 201, 'Booking created successfully', bookingWithDetails);
    } catch (error) {
        console.error('Error in createBooking:', error);
        return sendError(res, 500, 'Server error', error.message);
    }
};

module.exports = {
    bookTickets,
    viewBookingHistory,
    viewEventBookings,
    createBooking
};
