import { useState } from "react";
import { Form } from "react-bootstrap";

const GuestWorkerPanel = () => {
    const [machineNumber, setMachineNumber] = useState("");


    const handleSubmit = () => {

    }
    return (
        <Form onSubmit={handleSubmit}>
            <Form.Group>
                <Form.Label>Please enter machine ID number</Form.Label>
                <Form.Control
                    type="text"
                    value={machineNumber}
                    onChange={(e) => setMachineNumber(e.target.value)}
                />
            </Form.Group>


        </Form>
    );
};

export default GuestWorkerPanel;
