import api from "./api";

export const createBooking = (booking) => {
    return api.post("/bookings", booking);
};

export const getMyBookings = (userId) => {
    return api.get(`/bookings/user/${userId}`);
};

export const cancelBooking = (bookingId) => {
    return api.put(`/bookings/${bookingId}/cancel`);
};

export const getBookingDetails = (id) => {
    return api.get(`/bookings/${id}`);
};

export const rescheduleBooking = (id, newSlotId) => {
    return api.put(`/bookings/reschedule/${id}?newSlotId=${newSlotId}`);
};