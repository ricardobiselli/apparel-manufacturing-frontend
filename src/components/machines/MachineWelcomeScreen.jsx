import { Form, Button } from "react-bootstrap";
import useMachines from "./hooks/UseMachines";
import { useState } from "react";

const MachineWelcomeScreen = () => {
    const { machines } = useMachines();
    const [postNumber, setPostNumber] = useState(null);


    const handleSubmit = () => {

    }

    return (
        <Form onSubmit={handleSubmit}>
            <Form.Group>
                <Form.Label> Select Machine Post number to begin...</Form.Label>
                <Form.Control
                    as="select"
                    value={postNumber}
                    onChange={(e) => setPostNumber(e.target.value)}
                    disabled={!machines}
                >
                    <option value="">
                        -- Select a machine --
                    </option>

                    {machines?.map((machine) => (
                        <option
                            key={machine.machineId}
                            value={machine.postNumber}
                        >
                            POST {machine.postNumber} - Model: {machine.machineModel}
                        </option>
                    ))}
                </Form.Control>
            </Form.Group>
            <Button
                type="sumbit"
                disabled={!postNumber}
            ></Button>
        </Form>
    )

}

export default MachineWelcomeScreen;