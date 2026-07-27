import axios from "axios";

const API = "http://localhost:8080/api/notifications";

export const getUserNotifications = (userId) => {
    return axios.get(`${API}/${userId}`);
};

export const getUnreadNotifications = (userId) => {
    return axios.get(`${API}/unread/${userId}`);
};

export const markAsRead = (id) => {
    return axios.put(`${API}/read/${id}`);
};

export const markAllAsRead = (userId) => {
    return axios.put(`${API}/read-all/${userId}`);
};

export const sendNotification = (notificationData) => {
    return axios.post(`${API}/send`, notificationData);
};

export const deleteNotification = (id) => {
    return axios.delete(`${API}/${id}`);
};
