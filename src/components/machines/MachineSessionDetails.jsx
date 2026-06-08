import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Table, Spinner, Alert } from "react-bootstrap";
import { GetTimeSegments } from "../operations/endpoints/Endpoints";

const MachineSessionDetails = () => {
    const { machineSessionId } = useParams();
    const [timeSegments, setTimeSegments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSegments = async () => {
            try {
                console.log('MachineSessionId in MachineSessionDetails:',
                    machineSessionId);
                const response = await GetTimeSegments(machineSessionId);
                setTimeSegments(response);
            } catch (err) {
                setError("Error loading time segments");
                console.log('Error:', err);
            } finally {
                setLoading(false);
            }
        };

        if (machineSessionId) {
            fetchSegments();
        }
    }, [machineSessionId]);


    if (loading) return <Spinner animation="border" />;
    if (error) return <Alert variant="danger">{error}</Alert>;

    return (
        <Table striped bordered hover>
            <thead>
                <tr>
                    <th>Start</th>
                    <th>End</th>
                    <th>Duration</th>
                    <th>Type</th>
                </tr>
            </thead>
            <tbody>
                {timeSegments.map((segment, index) => (
                    <tr key={index}>
                        <td>{new Date(segment.start).toLocaleString()}</td>
                        <td>{new Date(segment.end).toLocaleString()}</td>
                        <td>{segment.duration}</td>
                        <td>{segment.type}</td>
                    </tr>
                ))}
            </tbody>
        </Table>
    );
};

export default MachineSessionDetails;
