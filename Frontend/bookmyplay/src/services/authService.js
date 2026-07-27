import axios from "axios";

const API_URL = "http://localhost:8080/api/auth";

export const registerUser = (user) => {
    return axios.post(`${API_URL}/register`, user);
};

export const loginUser = (login) => {
    return axios.post(`${API_URL}/login`, login);
};