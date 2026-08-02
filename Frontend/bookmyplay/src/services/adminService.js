import axios from "axios";

const API = "http://localhost:8080/api/admin";

export const loginAdmin = (loginData) => {
    return axios.post(`${API}/login`, loginData);
};