import { useContext, useState } from 'react';
import useMachines from '../machines/hooks/UseMachines';
import useOrders from '../orders/hooks/UseOrders';
import useMachineSessions from '../machines/hooks/UseMachineSessions';
import AuthContext from '../../services/authentication/AuthContext';
import { Alert, Form, Button, Modal, Table } from 'react-bootstrap';
import {
    AddMachineSession,
    DeleteMachineSession,
    UpdateMachineSession
} from '../machines/endpoints/Endpoints';

const OperationAssignment = () => {
    const { user } = useContext(AuthContext);
    const { machines } = useMachines();
    const { orders } = useOrders();
    const { machineSessions, fetchSessions } = useMachineSessions();

    const [selectedOrder, setSelectedOrder] = useState('');
    const [machineSelections, setMachineSelections] = useState({});
    const [updatingMachineKeys, setUpdatingMachineKeys] = useState({});
    const [editingSession, setEditingSession] = useState(null);
    const [operationDraft, setOperationDraft] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState('');

    const selectedOrderObj = orders?.find(
        (order) => order.orderId === Number(selectedOrder)
    );

    const orderOperations = selectedOrderObj
        ? selectedOrderObj.orderGarments.flatMap((garment) =>
            garment.operations.map((operation) => ({
                orderId: selectedOrderObj.orderId,
                garmentId: garment.garmentId,
                garmentName: garment.garmentName,
                operationId: operation.operationId,
                operationName: operation.operationName,
                operationDescription: operation.operationDescription ?? '',
                baseTime: operation.baseTime,
                unitsPerGarment: operation.unitsPerGarment ?? 1,
            }))
        )
        : [];

    const currentAssignments = selectedOrder
        ? machineSessions.filter(
            (session) => session.orderId === Number(selectedOrder)
        )
        : [];

    const getAssignmentKey = (garmentId, operationId) =>
        `${garmentId}-${operationId}`;

    const getOperationSnapshot = (operation, assignedSession) => {
        if (assignedSession) {
            return {
                operationName: assignedSession.operationName ?? operation.operationName,
                operationDescription: assignedSession.operationDescription ?? operation.operationDescription ?? '',
                baseTime: assignedSession.baseTime ?? operation.baseTime,
                unitsPerGarment: assignedSession.unitsPerGarment ?? operation.unitsPerGarment ?? 1,
            };
        }

        return {
            operationName: operation.operationName,
            operationDescription: operation.operationDescription ?? '',
            baseTime: operation.baseTime,
            unitsPerGarment: operation.unitsPerGarment ?? 1,
        };
    };

    const handleOrderChange = (event) => {
        setSelectedOrder(event.target.value);
        setMachineSelections({});
    };

    const handleMachineSelection = async (key, machineId, assignedSession) => {
        setMachineSelections((prev) => ({
            ...prev,
            [key]: machineId,
        }));
        if (!assignedSession || !machineId || Number(machineId) === Number(assignedSession.machineId)) return;

        try {
            setUpdatingMachineKeys((previous) => ({ ...previous, [key]: true }));
            await UpdateMachineSession(assignedSession.machineSessionId, {
                machineId: Number(machineId),
            });
            setMachineSelections((previous) => {
                const next = { ...previous };
                delete next[key];
                return next;
            });
            await fetchSessions();
        } catch (err) {
            console.error('Error changing assigned machine:', err);
            alert('Unable to change the assigned machine. Please try again.');
            setMachineSelections((previous) => {
                const next = { ...previous };
                delete next[key];
                return next;
            });
        } finally {
            setUpdatingMachineKeys((previous) => ({ ...previous, [key]: false }));
        }
    };

    const openEditModal = (session, snapshot) => {
        setEditingSession(session);
        setOperationDraft({ ...snapshot });
        setSaveError('');
    };

    const closeEditModal = () => {
        if (isSaving) return;
        setEditingSession(null);
        setOperationDraft(null);
        setSaveError('');
    };

    const handleOperationDraftChange = (event) => {
        const { name, value } = event.target;
        setOperationDraft((previous) => ({ ...previous, [name]: value }));
    };

    const handleSaveOperation = async (event) => {
        event.preventDefault();
        if (!editingSession || !operationDraft) return;

        try {
            setIsSaving(true);
            setSaveError('');
            await UpdateMachineSession(editingSession.machineSessionId, {
                operationDescription: operationDraft.operationDescription,
                baseTime: Number(operationDraft.baseTime),
            });
            await fetchSessions();
            setEditingSession(null);
            setOperationDraft(null);
        } catch (err) {
            console.error('Error updating machine session operation:', err);
            setSaveError('Unable to save operation changes. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleAssign = async (operation) => {
        if (!selectedOrder) {
            alert('Please select an order first.');
            return;
        }

        const key = getAssignmentKey(operation.garmentId, operation.operationId);
        const selectedMachineId = machineSelections[key];

        if (!selectedMachineId) {
            alert('Please select a machine for this operation.');
            return;
        }

        if (!user?.userId) {
            alert('Unable to identify the logged-in operator. Please log in again.');
            return;
        }

        const existingSession = currentAssignments.find(
            (session) =>
                session.garmentId === operation.garmentId &&
                session.operationId === operation.operationId
        );

        if (existingSession) {
            alert('This operation already has an assignment. Delete it first to reassign.');
            return;
        }

        const machineSession = {
            orderId: Number(selectedOrder),
            machineId: Number(selectedMachineId),
            UserId: Number(user.userId),
            garmentId: operation.garmentId,
            operationId: operation.operationId,
        };

        try {
            await AddMachineSession(machineSession);
            console.log("Operation assigned successfully!");
            await fetchSessions();
        } catch (err) {
            console.error('Error while adding MachineSession:', err);
            alert('Error while assigning operation.');
        }
    };

    const handleDelete = async (id) => {
        // const confirmDelete = window.confirm('Are you sure you want to delete this assignment?');
        // if (!confirmDelete) return;

        try {
            await DeleteMachineSession(id);
            await fetchSessions();
        } catch (err) {
            console.error('Error deleting session:', err);
            alert('Error deleting assignment.');
        }
    };

    return (
        <>
            <Form>
                <Form.Group controlId="orderSelect">
                    <Form.Label>Select Order</Form.Label>
                    <Form.Control
                        as="select"
                        value={selectedOrder}
                        onChange={handleOrderChange}
                    >
                        <option value="">-- Select Order --</option>
                        {orders?.map((order) => (
                            <option key={order.orderId} value={order.orderId}>
                                Order #{order.orderId} - {order.description}
                            </option>
                        ))}
                    </Form.Control>
                </Form.Group>
            </Form>

            {selectedOrder && (
                <>
                    <h4 className="mt-4">Order Operations</h4>
                    <Table striped bordered hover className="mt-3">
                        <thead>
                            <tr>
                                <th>Garment</th>
                                <th>Operation</th>
                                <th>Base Time</th>
                                <th>Assigned Machine</th>
                                <th>Select Machine</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orderOperations.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center">
                                        No operations available for this order.
                                    </td>
                                </tr>
                            ) : (
                                orderOperations.map((operation) => {
                                    const key = getAssignmentKey(operation.garmentId, operation.operationId);
                                    const assignedSession = currentAssignments.find(
                                        (session) =>
                                            session.garmentId === operation.garmentId &&
                                            session.operationId === operation.operationId
                                    );
                                    const assignedMachine = assignedSession
                                        ? machines?.find((machine) => machine.machineId === assignedSession.machineId)
                                        : null;
                                    const operationalMachines = (machines || []).filter(
                                        (machine) => (machine?.Status ?? machine?.status ?? '').toString().toLowerCase() === 'operational'
                                    );
                                    const snapshot = getOperationSnapshot(operation, assignedSession);

                                    return (
                                        <tr key={key}>
                                            <td>{operation.garmentName}</td>
                                            <td>
                                                <strong>{snapshot.operationName}</strong>
                                                {snapshot.operationDescription ? (
                                                    <div className="text-muted small">{snapshot.operationDescription}</div>
                                                ) : null}
                                            </td>
                                            <td>
                                                <div>{snapshot.baseTime}s</div>
                                                <small className="text-muted">Units/garment: {snapshot.unitsPerGarment}</small>
                                            </td>
                                            <td>
                                                {assignedMachine
                                                    ? `POST ${assignedMachine.postNumber}`
                                                    : 'Not assigned'}
                                            </td>
                                            <td>
                                                <Form.Control
                                                    as="select"
                                                    value={machineSelections[key] ?? (assignedSession ? String(assignedSession.machineId) : '')}
                                                    onChange={(e) => handleMachineSelection(key, e.target.value, assignedSession)}
                                                    disabled={!!updatingMachineKeys[key]}
                                                >
                                                    {!assignedSession && <option value="">-- Select Machine --</option>}
                                                    {assignedMachine && !operationalMachines.some((machine) => machine.machineId === assignedMachine.machineId) && (
                                                        <option value={assignedMachine.machineId}>
                                                            POST {assignedMachine.postNumber} - {assignedMachine.machineModel}
                                                        </option>
                                                    )}
                                                    {operationalMachines.map((machine) => (
                                                        <option key={machine.machineId} value={machine.machineId}>
                                                            POST {machine.postNumber} - {machine.machineModel}
                                                        </option>
                                                    ))}
                                                </Form.Control>
                                            </td>
                                            <td>
                                                {assignedSession ? (
                                                    <div className="d-flex gap-2">
                                                        <Button
                                                            variant="outline-primary"
                                                            size="sm"
                                                            onClick={() => openEditModal(assignedSession, snapshot)}
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            variant="danger"
                                                            size="sm"
                                                            onClick={() => handleDelete(assignedSession.machineSessionId)}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        onClick={() => handleAssign(operation)}
                                                        disabled={!machineSelections[key]}
                                                    >
                                                        Assign
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </Table>
                </>
            )}

            <Modal show={!!editingSession} onHide={closeEditModal} centered>
                <Form onSubmit={handleSaveOperation}>
                    <Modal.Header closeButton={!isSaving}>
                        <Modal.Title>Edit assigned operation</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {saveError && <Alert variant="danger">{saveError}</Alert>}
                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                name="operationDescription"
                                value={operationDraft?.operationDescription ?? ''}
                                onChange={handleOperationDraftChange}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Base time (seconds)</Form.Label>
                            <Form.Control
                                type="number"
                                min="0"
                                step="0.01"
                                name="baseTime"
                                value={operationDraft?.baseTime ?? ''}
                                onChange={handleOperationDraftChange}
                                required
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={closeEditModal} disabled={isSaving}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save changes'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
};

export default OperationAssignment;
