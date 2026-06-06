const Event = require('./event.model');
const { sendSuccess, sendError } = require('../../utils/response');

// Organizer: Create Event
const createEvent = async (req, res) => {
    try {
        const { title, description, date, time, location, image, ticketPrice, seatLimit } = req.body;
        const organizerId = req.user.id;

        const newEvent = await Event.create({
            title,
            description,
            date,
            time,
            location,
            image,
            ticketPrice,
            seatLimit,
            organizerId
        });

        return sendSuccess(res, 201, 'Event created successfully', newEvent);
    } catch (error) {
        console.error('Error creating event:', error);
        return sendError(res, 500, 'Server error', error.message);
    }
};

// Organizer: Update Event
const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, date, time, location, image, ticketPrice, seatLimit } = req.body;
        const organizerId = req.user.id;

        const event = await Event.findOne({ where: { id, organizerId } });
        if (!event) {
            return sendError(res, 404, 'Event not found or unauthorized');
        }

        await event.update({ title, description, date, time, location, image, ticketPrice, seatLimit });

        return sendSuccess(res, 200, 'Event updated successfully', event);
    } catch (error) {
        return sendError(res, 500, 'Server error', error.message);
    }
};

// Organizer: Delete Event
const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const organizerId = req.user.id;

        const event = await Event.findOne({ where: { id, organizerId } });
        if (!event) {
            return sendError(res, 404, 'Event not found or unauthorized');
        }

        await event.destroy();

        return sendSuccess(res, 200, 'Event deleted successfully');
    } catch (error) {
        return sendError(res, 500, 'Server error', error.message);
    }
};

// Organizer: View Own Events
const viewOwnEvents = async (req, res) => {
    try {
        const organizerId = req.user.id;
        const events = await Event.findAll({ where: { organizerId } });

        return sendSuccess(res, 200, 'Events retrieved', events);
    } catch (error) {
        return sendError(res, 500, 'Server error', error.message);
    }
};

// Organizer: Add Event Schedule
const addEventSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const { schedule } = req.body; // Array of schedule objects
        const organizerId = req.user.id;

        const event = await Event.findOne({ where: { id, organizerId } });
        if (!event) {
            return sendError(res, 404, 'Event not found or unauthorized');
        }

        await event.update({ schedule });

        return sendSuccess(res, 200, 'Event schedule updated successfully', event);
    } catch (error) {
        return sendError(res, 500, 'Server error', error.message);
    }
};

// Organizer: Add Ticket Details
const addTicketDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const { ticketDetails } = req.body; // Object with ticket types and prices
        const organizerId = req.user.id;

        const event = await Event.findOne({ where: { id, organizerId } });
        if (!event) {
            return sendError(res, 404, 'Event not found or unauthorized');
        }

        await event.update({ ticketDetails });

        return sendSuccess(res, 200, 'Ticket details updated successfully', event);
    } catch (error) {
        return sendError(res, 500, 'Server error', error.message);
    }
};

// Attender/Public: View Public Events
const viewPublicEvents = async (req, res) => {
    try {
        const events = await Event.findAll();
        return sendSuccess(res, 200, 'Public events retrieved', events);
    } catch (error) {
        console.error('Error fetching public events:', error);
        return sendError(res, 500, 'Server error', error.message);
    }
};

const viewEvents = viewPublicEvents;

module.exports = {
    createEvent,
    updateEvent,
    deleteEvent,
    viewOwnEvents,
    addEventSchedule,
    addTicketDetails,
    viewEvents,
    viewPublicEvents
};
