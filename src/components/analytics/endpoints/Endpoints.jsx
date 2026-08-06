import api from '../../../api/AxiosConnection.jsx';

export const GetProductionMetrics = async (machineSessionId) => {
    const response = await api.get(`/ProductionMetrics/${machineSessionId}`);
    return response.data;
};

// export const GetProductionMetrics = async (machineSessionId) => {
//     const query = machineSessionId ? `?sessionId=${machineSessionId}` : "";
//     const response = await api.get(`/ProductionMetrics${query}`);
//     return response.data;
// };
