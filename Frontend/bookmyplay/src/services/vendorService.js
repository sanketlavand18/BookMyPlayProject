import api from "./api";

export const getVendorStats = (vendorId) => {
    return api.get(`/vendor/${vendorId}/stats`);
};
