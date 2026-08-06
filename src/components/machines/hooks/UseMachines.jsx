import { GetMachines } from '../endpoints/Endpoints';
import { useEffect, useState } from 'react';

const useMachines = () => {
    const [machines, setMachines] = useState(null);

    const fetchMachines = async () => {
        const response = await GetMachines();
        setMachines(Array.isArray(response) ? response : []);
    };

    useEffect(() => {
        fetchMachines();
    }, []);

    return { machines, refreshMachines: fetchMachines };
};

export default useMachines;