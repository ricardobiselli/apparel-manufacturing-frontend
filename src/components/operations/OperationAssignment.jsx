import { useState } from 'react';
import useMachines from '../machines/hooks/UseMachines';
import useOrders from '../orders/hooks/UseOrders';
import useMachineSessions from '../machines/hooks/UseMachineSessions';
import { Form, Button, Table } from 'react-bootstrap';
import {
    AddMachineSession,
    DeleteMachineSession
} from '../machines/endpoints/Endpoints';

const OperationAssignment = () => {
    const { machines } = useMachines();
    const { orders } = useOrders();
    const { machineSessions, fetchSessions } = useMachineSessions();

    const [selectedOrder, setSelectedOrder] = useState('');
    const [machineSelections, setMachineSelections] = useState({});

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

    const handleMachineSelection = (key, machineId) => {
        setMachineSelections((prev) => ({
            ...prev,
            [key]: machineId,
        }));
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
                                                    value={machineSelections[key] || ''}
                                                    onChange={(e) => handleMachineSelection(key, e.target.value)}
                                                >
                                                    <option value="">-- Select Machine --</option>
                                                    {operationalMachines.map((machine) => (
                                                        <option key={machine.machineId} value={machine.machineId}>
                                                            POST {machine.postNumber} - {machine.machineModel}
                                                        </option>
                                                    ))}
                                                </Form.Control>
                                            </td>
                                            <td>
                                                <Button
                                                    variant={assignedSession ? 'danger' : 'primary'}
                                                    size="sm"
                                                    onClick={() =>
                                                        assignedSession
                                                            ? handleDelete(assignedSession.machineSessionId)
                                                            : handleAssign(operation)
                                                    }
                                                    disabled={!assignedSession && !machineSelections[key]}
                                                >
                                                    {assignedSession ? 'Delete' : 'Assign'}
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </Table>
                </>
            )}
        </>
    );
};

export default OperationAssignment;
