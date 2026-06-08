import { GetOrders } from '../endpoints/Endpoints';
import { useEffect, useState } from 'react';

const useOrders = () => {
    const [orders, setOrders] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        console.log("checkpoint before fetching Orders");
        const response = await GetOrders();
        console.log("Orders response:", response);
        setOrders(response);
    }

    return { orders };
}

export default useOrders;