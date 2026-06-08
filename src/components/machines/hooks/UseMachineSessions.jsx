import { useEffect, useState } from "react";
import { GetMachineSessions } from "../endpoints/Endpoints";

const useMachineSessions = () => {
    const [machineSessions, setMachineSessions] = useState([]);

    const fetchSessions = async () => {
        try {
            const data = await GetMachineSessions();
            setMachineSessions(data);
        } catch (err) {
            console.error("Error fetching machine sessions", err);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    return { machineSessions, fetchSessions };
};

export default useMachineSessions;