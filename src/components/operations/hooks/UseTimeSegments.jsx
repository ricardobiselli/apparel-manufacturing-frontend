import { GetTimeSegments } from "../endpoints/Endpoints"; 
import { useState, useEffect } from "react";


const useTimeSegments = () => {
    const [timeSegments,setTimeSegments ] = useState(null);

    useEffect(() => {
        const fetchSegments= async () => {
            const response = await GetTimeSegments();
            setTimeSegments(response);
        };
        
        fetchSegments();
    }, []);

    console.log("Current garments state:", timeSegments);
    return { timeSegments };
};
export default useTimeSegments;