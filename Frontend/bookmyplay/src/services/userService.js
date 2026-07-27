import api from "./api";

export const updateProfile = (id, data) => {
    return api.put(`/users/${id}/profile`, data);
};

export const changePassword = (id, data) => {
    return api.put(`/users/${id}/change-password`, data);
};
