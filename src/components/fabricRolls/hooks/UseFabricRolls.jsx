import { useEffect, useState } from 'react';
import { GetFabricRolls } from '../endpoints/Endpoints';

const useFabricRolls = () => {
    const [fabricRolls, setFabricRolls] = useState(null);

    const fetchFabricRolls = async () => {
        const response = await GetFabricRolls();
        setFabricRolls(response);
    };

    useEffect(() => {
        fetchFabricRolls();
    }, []);

    return { fabricRolls, refreshFabricRolls: fetchFabricRolls };
};

export default useFabricRolls;