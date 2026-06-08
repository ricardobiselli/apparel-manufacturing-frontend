 import api from '../../../api/AxiosConnection.jsx'

 export const AddGarment = async (garment) => {

    console.log('checkpoint right before api call, this is garment: ', garment);

    const response = await api.post('/Garment/AddGarment/', garment )
    return response.data;
}

export const GetGarments = async () => {

    console.log('checkpoint right before api call ');

    const response = await api.get('/Garment/GetAll/')
    return response.data;
}
 