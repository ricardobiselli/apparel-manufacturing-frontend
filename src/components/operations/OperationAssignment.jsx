import { useState } from 'react';
import useMachines from '../machines/hooks/UseMachines';
import useOrders from '../orders/hooks/UseOrders';
import useMachineSessions from '../machines/hooks/UseMachineSessions';
import { Form, Button, Table } from 'react-bootstrap';
import {
    AddMachineSession,
    DeleteMachineSession
} from "../machines/endpoints/Endpoints";

const OperationAssignment = () => {
    const { machines } = useMachines();
    const { orders } = useOrders();
    const { machineSessions, fetchSessions } = useMachineSessions();

    const [selectedOrder, setSelectedOrder] = useState("");
    const [selectedGarment, setSelectedGarment] = useState("");
    const [selectedOperation, setSelectedOperation] = useState("");
    const [selectedMachine, setSelectedMachine] = useState("");

    const selectedOrderObj = orders?.find(
        o => o.orderId === Number(selectedOrder)
    );

    const garmentsFromOrder = selectedOrderObj?.orderGarments || [];

    const selectedGarmentObj = garmentsFromOrder.find(
        og => og.garmentId === Number(selectedGarment)
    );

    const filteredSessions = selectedGarment
        ? machineSessions.filter(
            ms =>
                ms.garmentId === Number(selectedGarment) &&
                ms.orderId === Number(selectedOrder)
        )
        : [];


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedOrder || !selectedGarment || !selectedOperation || !selectedMachine) {
            alert("Please complete all selections.");
            return;
        }

        const alreadyExists = machineSessions.some(ms =>
            ms.orderId === Number(selectedOrder) &&
            ms.garmentId === Number(selectedGarment) &&
            ms.machineId === Number(selectedMachine) &&
            ms.operationId === Number(selectedOperation)
        );

        if (alreadyExists) {
            alert("This operation is already assigned to this machine.");
            return;
        }

        const machineSession = {
            orderId: Number(selectedOrder),
            machineId: Number(selectedMachine),
            garmentId: Number(selectedGarment),
            operationId: Number(selectedOperation),
        };

        try {
            await AddMachineSession(machineSession);
            alert('Operation assigned successfully!');

            setSelectedOperation("");
            setSelectedMachine("");

            await fetchSessions();
        } catch (err) {
            console.error('Error while adding MachineSession:', err);
            alert('Error while assigning operation.');
        }
    };

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this assignment?");
        if (!confirmDelete) return;

        try {
            await DeleteMachineSession(id);
            await fetchSessions();
        } catch (err) {
            console.error("Error deleting session:", err);
            alert("Error deleting assignment.");
        }
    };

    return (
        <>
            {/* 🔹 FORM */}
            <Form onSubmit={handleSubmit}>

                {/* ORDER */}
                <Form.Group controlId="orderSelect">
                    <Form.Label>Select Order</Form.Label>
                    <Form.Control
                        as="select"
                        value={selectedOrder}
                        onChange={(e) => {
                            setSelectedOrder(e.target.value);
                            setSelectedGarment("");
                            setSelectedOperation("");
                            setSelectedMachine("");
                        }}
                    >
                        <option value="">-- Select Order --</option>
                        {orders?.map(order => (
                            <option key={order.orderId} value={order.orderId}>
                                Order #{order.orderId} - {order.description}
                            </option>
                        ))}
                    </Form.Control>
                </Form.Group>

                {/* GARMENT */}
                <Form.Group controlId="garmentSelect" className="mt-3">
                    <Form.Label>Select Garment</Form.Label>
                    <Form.Control
                        as="select"
                        value={selectedGarment}
                        onChange={(e) => {
                            setSelectedGarment(e.target.value);
                            setSelectedOperation("");
                            setSelectedMachine("");
                        }}
                        disabled={!selectedOrderObj}
                    >
                        <option value="">-- Select Garment --</option>
                        {garmentsFromOrder.map(og => (
                            <option key={og.garmentId} value={og.garmentId}>
                                {og.garmentName} (Qty: {og.quantity})
                            </option>
                        ))}
                    </Form.Control>
                </Form.Group>

                {/* OPERATION */}
                <Form.Group controlId="operationSelect" className="mt-3">
                    <Form.Label>Select Operation</Form.Label>
                    <Form.Control
                        as="select"
                        value={selectedOperation}
                        onChange={(e) => setSelectedOperation(e.target.value)}
                        disabled={!selectedGarmentObj}
                    >
                        <option value="">-- Select Operation --</option>
                        {selectedGarmentObj?.operations?.map(operation => (
                            <option
                                key={operation.operationId}
                                value={operation.operationId}
                            >
                                {operation.operationName} - {operation.baseTime}s
                            </option>
                        ))}
                    </Form.Control>
                </Form.Group>

                {/* MACHINE */}
                <Form.Group controlId="machineSelect" className="mt-3">
                    <Form.Label>Select Machine</Form.Label>
                    <Form.Control
                        as="select"
                        value={selectedMachine}
                        onChange={(e) => setSelectedMachine(e.target.value)}
                    >
                        <option value="">-- Select Machine --</option>
                        {machines?.map(machine => (
                            <option
                                key={machine.machineId}
                                value={machine.machineId}
                            >
                                POST {machine.postNumber} - {machine.machineModel}
                            </option>
                        ))}
                    </Form.Control>
                </Form.Group>

                <Button type="submit" className="mt-4">
                    Assign Operation
                </Button>
            </Form>

            {/* 🔹 LIST (ONLY when garment selected) */}
            {selectedGarment && (
                <>
                    <h4 className="mt-5">Assigned Operations</h4>

                    <Table striped bordered hover className="mt-3">
                        <thead>
                            <tr>
                                <th>Session ID</th>
                                <th>Garment</th>
                                <th>Operation</th>
                                <th>Machine Post </th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSessions.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center">
                                        No operations assigned to this garment
                                    </td>
                                </tr>
                            ) : (
                                filteredSessions.map(session => (
                                    <tr key={session.machineSessionId}>
                                        <td>{session.machineSessionId}</td>
                                        <td>{session.garmentName}</td>
                                        <td>{session.operationName}</td>
                                        <td>POST {session.machineId}</td>
                                        <td>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => handleDelete(session.machineSessionId)}
                                            >
                                                Delete
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                </>
            )}
        </>
    );
};

export default OperationAssignment;