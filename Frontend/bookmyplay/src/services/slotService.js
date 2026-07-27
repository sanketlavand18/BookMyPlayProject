import api from "./api";

export const getSlotsByVenue = (venueId, date) => {
    const url = date ? `/slots/venue/${venueId}?date=${date}` : `/slots/venue/${venueId}`;
    return api.get(url);
};

export const addSlot = (slot) => {
    return api.post("/slots", slot);
};

export const deleteSlot = (id) => {
    return api.delete(`/slots/${id}`);
};