import api from '../../../api/AxiosConnection.jsx'

// Obtener todos los registros de operaciones
export const GetAllOperationLogs = async () => {
    console.log("Obteniendo todos los registros de operaciones");
    const response = await api.get("/operation-logs");
    return response.data;
};

// Obtener un registro por ID
export const GetOperationLogById = async (id) => {
    console.log(`Obteniendo registro de operación con ID: ${id}`);
    const response = await api.get(`/operation-logs/${id}`);
    return response.data;
};

// Crear un nuevo registro de operación
export const CreateOperationLog = async (operationLogData) => {
    console.log("Creando un nuevo registro de operación:", operationLogData);
    const response = await api.post("/operation-logs", operationLogData);
    return response.data;
};

// Actualizar un registro de operación por ID
export const UpdateOperationLog = async (id, operationLogData) => {
    console.log(`Actualizando registro de operación con ID: ${id}`);
    await api.put(`/operation-logs/${id}`, operationLogData);
};

// Eliminar un registro de operación por ID
export const DeleteOperationLog = async (id) => {
    console.log(`Eliminando registro de operación con ID: ${id}`);
    await api.delete(`/operation-logs/${id}`);
};

export const AddOperationLog = async (machineSessionId) => {
    console.log('checkpoint right before API call for AddOperationLog: ', machineSessionId);

    const response = await api.post('/operationLogs/CreateOperationLog', { machineSessionId });
    console.log('returning response...')
    return response.data;
}
//exception
export const AddMachineExceptionLog = async (machineSessionId, exceptionType) => {
    console.log('checkpoint right before API call for AddOperationLog: ', machineSessionId);

    const response = await api.post('/operationLogs/CreateExceptionLog', {
        machineSessionId,
        type: exceptionType
    });
    console.log('returning response...')
    return response.data;
}

export const GetTimeSegments = async (id) => {
    const response = await api.get(`/operationlogs/GetTimeSegmentsForMachineSession/${id}`);
    return response.data;
} 