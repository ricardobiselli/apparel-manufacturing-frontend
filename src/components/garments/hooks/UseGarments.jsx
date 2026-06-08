import { GetGarments } from  "../endpoints/Endpoints";
import { useState, useEffect } from "react";


const useGarments = () => {
    const [garments, setGarments] = useState(null);

    useEffect(() => {
        const fetchGarments = async () => {
            console.log("checkpoint before fetching Garments");
            const response = await GetGarments();
            console.log("Garments response:", response);
            setGarments(response);
        };
        
        fetchGarments();
    }, []);

    console.log("Current garments state:", garments);
    return { garments };
};
export default useGarments;