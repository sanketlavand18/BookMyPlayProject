import api from "./api";

export const getAllVenues = () => {
    return api.get("/venues");
};

export const searchVenues = (params) => {
    return api.get("/venues/search", { params });
};


export const getVenueById = (id) => {
    return api.get(`/venues/${id}`);
};

export const getVenuesByVendor = (vendorId) => {
    return api.get(`/venues/vendor/${vendorId}`);
};
export const addVenue = (venueData, files, coverIndex) => {
    const formData = new FormData();
    formData.append(
        "venue",
        new Blob([JSON.stringify(venueData)], { type: "application/json" })
    );
    files.forEach((file) => {
        formData.append("images", file);
    });
    formData.append("coverIndex", coverIndex);

    return api.post("/venues", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};

export const updateVenue = (id, venue) => {
    return api.put(`/venues/${id}`, venue);
};

export const deleteVenue = (id) => {
    return api.delete(`/venues/${id}`);
};