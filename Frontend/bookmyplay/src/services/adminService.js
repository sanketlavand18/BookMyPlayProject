import axios from "axios";

const API = "http://localhost:8080/api/admin";

export const getDashboard = () => {
    return axios.get(`${API}/dashboard`);
};

export const getUsers = () => {
    return axios.get(`${API}/users`);
};