import { useState } from 'react';
import { Form, Button, Modal, Alert, Spinner } from 'react-bootstrap';
import useMachines from './hooks/UseMachines';
import { GetPendingSessionsForActiveOrderByMachineId } from './endpoints/Endpoints';
import { useNavigate } from 'react-router-dom';

const MachineSelectScreen = () => {
    const { machines } = useMachines();
    const navigate = useNavigate();

    const [selectedMachine, setSelectedMachine] = useState("");
    const [pendingSessions, setPendingSessions] = useState([]);
    const [selectedSessionId, setSelectedSessionId] = useState("");
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [loadingSessions, setLoadingSessions] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const fetchPendingSessions = async (machineId) => {
        setLoadingSessions(true);
        setErrorMessage("");
        setPendingSessions([]);
        setSelectedSessionId("");

        try {
            const response = await GetPendingSessionsForActiveOrderByMachineId(machineId);
            console.log("response from API:", response);
            const sessions = Array.isArray(response) ? response : [response];

            if (!sessions || sessions.length === 0) {
                setErrorMessage("No pending sessions were found for the selected machine's active order.");
                return;
            }

            setPendingSessions(sessions);
            setSelectedSessionId(sessions[0].machineSessionId.toString());
        } catch (err) {
            if (err.response?.status === 404) {
                setErrorMessage("No pending sessions were found for the selected machine.");
            } else {
                console.error(err);
                setErrorMessage("Unable to load pending sessions. Please try again.");
            }
        } finally {
            setLoadingSessions(false);
        }
    };

    const handleMachineChange = async (event) => {
        const machineId = event.target.value;
        setSelectedMachine(machineId);
        setPendingSessions([]);
        setSelectedSessionId("");
        setErrorMessage("");

        if (machineId) {
            await fetchPendingSessions(machineId);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedSessionId) {
            setErrorMessage("Please select a pending session before continuing.");
            return;
        }
        setShowConfirmModal(true);
    };

    const activeSession = pendingSessions.find(
        (session) => session.machineSessionId.toString() === selectedSessionId
    );

    const handleConfirm = () => {
        if (!activeSession) return;

        navigate(`/operationLog/${activeSession.machineSessionId}`);
    };

    return (
        <>
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>Select Machine</Form.Label>
                    <Form.Control
                        as="select"
                        value={selectedMachine}
                        onChange={handleMachineChange}
                    >
                        <option value="">--- Select Machine Post Number ---</option>
                        {machines?.map((machine) => (
                            <option key={machine.machineId} value={machine.machineId}>
                                POST: {machine.postNumber}
                            </option>
                        ))}
                    </Form.Control>
                </Form.Group>

                {loadingSessions && (
                    <div className="mb-3">
                        <Spinner animation="border" size="sm" role="status" />{' '}
                        Loading pending sessions...
                    </div>
                )}

                {errorMessage && <Alert variant="warning">{errorMessage}</Alert>}

                {pendingSessions.length > 0 && (
                    <Form.Group className="mb-3">
                        <Form.Label>Select Pending Session</Form.Label>
                        <Form.Control
                            as="select"
                            value={selectedSessionId}
                            onChange={(e) => setSelectedSessionId(e.target.value)}
                        >
                            {pendingSessions.map((session) => (
                                <option
                                    key={session.machineSessionId}
                                    value={session.machineSessionId}
                                >
                                    {session.operationName || 'Unknown operation'} - {session.garmentName || 'Unknown garment'} (Order {session.orderId})
                                </option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                )}

                <Button type="submit" className="mt-2" disabled={!pendingSessions.length || loadingSessions}>
                    Continue to Operation Log
                </Button>
            </Form>

            <Modal
                show={showConfirmModal}
                onHide={() => setShowConfirmModal(false)}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Session</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {activeSession ? (
                        <>
                            <p>Please confirm the selected pending session:</p>
                            <p>
                                <strong>Order:</strong> {activeSession.orderId}
                                <br />
                                <strong>Operation:</strong> {activeSession.operationName || 'Unknown operation'}
                                <br />
                                <strong>Garment:</strong> {activeSession.garmentName || 'Unknown garment'}
                                <br />
                                <strong>Machine:</strong> {activeSession.machineId ?? '—'}
                                <br />
                                <strong>Status:</strong> {activeSession.status || 'Unknown'}
                            </p>
                        </>
                    ) : (
                        <p>No session selected.</p>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleConfirm}>
                        Confirm
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default MachineSelectScreen;
