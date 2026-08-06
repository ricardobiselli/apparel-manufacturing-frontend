import { GetGarments } from  "../endpoints/Endpoints";
import { useState, useEffect } from "react";

const useGarments = () => {
    const [garments, setGarments] = useState(null);

    const fetchGarments = async () => {
        console.log("checkpoint before fetching Garments");
        const response = await GetGarments();
        console.log("Garments response:", response);
        setGarments(response);
    };

    useEffect(() => {
        fetchGarments();
    }, []);

    console.log("Current garments state:", garments);
    return { garments, refreshGarments: fetchGarments };
};
export default useGarments;