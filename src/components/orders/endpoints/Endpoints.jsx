  import api from '../../../api/AxiosConnection.jsx'

 
 export const CreateOrder = async (order) => {
    console.log('checkpoint right before API call, this is the order: ', order);

    const response = await api.post('/Client/CreateOrder', order);
    return response.data;
} 

 export const GetOrders = async () => {
    const response = await api.get('/Order/GetAll');
    return response.data;
} 


 export const AddOrder = async (order) => {

    console.log('checkpoint right before api call, this is order: ', order);

    const response = await api.post('/Order/CreateOrder/', order )
    return response.data;
}

// Update order status
export const UpdateOrderStatus = async (payload) => {
    const response = await api.put('/Order/Update', payload);
    return response.data;
};
 