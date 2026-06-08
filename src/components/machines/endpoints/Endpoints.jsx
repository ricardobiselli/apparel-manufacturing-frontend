//MACHINES
 import api from '../../../api/AxiosConnection.jsx'

 export const GetMachines = async () => {
    console.log('checkpoint right before api call ');

    const response = await api.get('/Machine/All/')
    return response.data;
}

export const AddMachine = async (machine) => {

    const response = await api.post('/Machine/add-machine', machine);
    return response.data;
} 

 export const AddMachineSession = async (machineSession) => {
    const response = await api.post('/MachineSession/AddMachineSession', machineSession);
    return response.data;
}

export const GetActiveMachineSessionByMachineId = async (id) => {

    const response = await api.get(`/MachineSession/${id}`) //check later if the endpoint is correct
    return response.data;
}


export const GetActiveMachineSessionWithDetailsByMachineId = async (id) => {

    const response = await api.get(`/MachineSession/GetActiveMachineSessionByMachineIdWithDetailsIncluded/${id}`)
    return response.data;
} 

export const GetMachineSessions = async () => {
    const response = await api.get('/MachineSession/All/')
    return response.data;
}

export const DeleteMachineSession = async (id) => {
    const response = await api.delete(`/MachineSession/${id}`)
    return response.data;
}
