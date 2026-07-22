import api from "./api";

export const getAllVenues = () => {
    return api.get("/venues");
};

export const getVenueById = (id) => {
    return api.get(`/venues/${id}`);
};

export const getVenuesByVendor = (vendorId) => {
    return api.get(`/venues/vendor/${vendorId}`);
};
export const addVenue = (venue) => {
    return api.post("/venues", venue);
};

export const updateVenue = (id, venue) => {
    return api.put(`/venues/${id}`, venue);
};

export const deleteVenue = (id) => {
    return api.delete(`/venues/${id}`);
};