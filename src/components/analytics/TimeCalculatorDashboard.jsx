import { useState } from "react";
import { Form, Table, Badge, Button } from "react-bootstrap";
import UseOrders from "../orders/hooks/UseOrders";
import { useNavigate } from "react-router-dom";

const TimeCalculatorDashboard = () => {
    const [currentOrderId, setCurrentOrderId] = useState("");
    const { orders } = UseOrders();
    const navigate = useNavigate();

    const selectedOrder = orders?.find(
        (o) => o.orderId === Number(currentOrderId)
    );

    return (
        <div>
            <h3>Production Time Dashboard</h3>

            <Form.Group className="mb-3">
                <Form.Label>Select Order</Form.Label>
                <Form.Select
                    value={currentOrderId}
                    onChange={(e) => setCurrentOrderId(e.target.value)}
                >
                    <option value="">Select order</option>
                    {orders?.map((order) => (
                        <option
                            key={order.orderId}
                            value={order.orderId}
                        >
                            {order.orderId} - {order.description}
                        </option>
                    ))}
                </Form.Select>
            </Form.Group>

            {selectedOrder && (
                <>
                    <h5>Machine Sessions</h5>

                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Machine</th>
                                <th>Garment</th>
                                <th>Operation</th>
                                <th>Started</th>
                                <th>Ended</th>
                                <th>Status</th>
                                <th>Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedOrder.machineSessions?.map((session) => (
                                <tr key={session.machineSessionId}>
                                    <td>{session.machineId}</td>
                                    <td>{session.garmentName}</td>
                                    <td>{session.operationName}</td>
                                    <td>
                                        {new Date(session.startedAt).toLocaleString()}
                                    </td>
                                    <td>
                                        {session.endedAt
                                            ? new Date(session.endedAt).toLocaleString()
                                            : "-"}
                                    </td>
                                    <td>
                                        {session.status === 'Pending' && <Badge bg="warning">Pending</Badge>}
                                        {session.status === 'InProgress' && <Badge bg="success">In Progress</Badge>}
                                        {session.status === 'Completed' && <Badge bg="secondary">Completed</Badge>}
                                        {session.status === 'Paused' && <Badge bg="info">Paused</Badge>}
                                    </td>
                                    <td>
                                        <Button
                                            variant="info"
                                            size="sm"
                                            onClick={() => navigate(`/MachineSessionDetails/${session.machineSessionId}`)}
                                        >
                                            Details
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    {/* <Button onClick={handleDetails}>Details</Button> */}
                </>
            )}
        </div>
    );
};

export default TimeCalculatorDashboard;
