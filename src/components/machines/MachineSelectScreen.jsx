import { useState } from 'react';
import { Form, Button, Modal } from 'react-bootstrap';
import useMachines from './hooks/UseMachines';
import { GetActiveMachineSessionWithDetailsByMachineId } from './endpoints/Endpoints';
import { useNavigate } from 'react-router-dom';

const MachineSelectScreen = () => {
    const { machines } = useMachines();
    const navigate = useNavigate();

    const [selectedMachine, setSelectedMachine] = useState("");
    const [activeSession, setActiveSession] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedMachine) return;

        try {
            const session = await GetActiveMachineSessionWithDetailsByMachineId(selectedMachine);
            console.log("Active session:", session);
            setActiveSession(session);
            setShowConfirmModal(true);

        } catch (err) {
            if (err.response?.status === 404) {
                console.log('error case b', err);
                alert("No active session found. Please contact your floor supervisor.");
                return;//probar
            } else {
                console.error(err);
                alert("Machine configuration error");
                return;
            }
        }
    };

    const handleConfirm = () => {
        if (!activeSession) return;

        navigate(`/operationLog/${activeSession.machineSessionId}`);
    };

    return (
        <>
            <Form onSubmit={handleSubmit}>
                <Form.Group>
                    <Form.Control
                        as="select"
                        value={selectedMachine}
                        onChange={(e) => setSelectedMachine(e.target.value)}
                    >
                        <option value=""> --- Select Machine Post Number ---</option>

                        {machines?.map((machine) => (
                            <option
                                key={machine.machineId}
                                value={machine.machineId}
                            >
                                POST: {machine.postNumber}
                            </option>
                        ))}
                    </Form.Control>
                </Form.Group>

                <Button type="submit" className="mt-3">
                    Select Machine
                </Button>
            </Form>

            <Modal
                show={showConfirmModal}
                onHide={() => setShowConfirmModal(false)}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Machine Selection</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {activeSession && (
                        <>
                            <p>Machine is currently set to perform:</p>
                            <strong>{activeSession.operationName}</strong>
                            <br />
                            on garment:
                            <br />
                            <strong>{activeSession.garmentName}</strong>
                        </>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setShowConfirmModal(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleConfirm}
                    >
                        Continue
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default MachineSelectScreen;
