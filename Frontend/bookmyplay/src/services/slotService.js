import api from "./api";

export const getSlotsByVenue = (venueId) => {
    return api.get(`/slots/venue/${venueId}`);
};

export const addSlot = (slot) => {
    return api.post("/slots", slot);
};

export const deleteSlot = (id) => {
    return api.delete(`/slots/${id}`);
};