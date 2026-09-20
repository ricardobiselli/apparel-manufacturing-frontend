import api from '../../../api/AxiosConnection.jsx';

export const AddFabricRoll = async (fabricRoll) => {
    const response = await api.post('/FabricRoll/AddFabricRoll', fabricRoll);
    return response.data;
};

export const GetFabricRolls = async () => {
    const response = await api.get('/FabricRoll/GetAll');
    return response.data;
};

export const UpdateFabricRoll = async (fabricRollId, fabricRoll) => {
    const response = await api.put(`/FabricRoll/Update/${fabricRollId}`, fabricRoll);
    return response.data;
};