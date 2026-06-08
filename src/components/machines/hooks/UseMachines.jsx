import { GetMachines } from '../endpoints/Endpoints';
import { useEffect, useState } from 'react';

const useMachines = () => {
    const [machines, setMachines] = useState(null);

    useEffect(() => {
        fetchMachines();
    }, []);
    const fetchMachines = async () => {

        console.log("checkpoint before fetching Machines");
        const response = await GetMachines();
        console.log("Machines response:", response);
        setMachines(response);
    }

    return { machines };
}

export default useMachines;