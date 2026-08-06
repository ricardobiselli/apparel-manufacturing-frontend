import { Form, Button } from "react-bootstrap";
import useMachines from "./hooks/UseMachines";
import { useState } from "react";

const MachineWelcomeScreen = () => {
    const { machines } = useMachines();
    const [postNumber, setPostNumber] = useState(null);


    const handleSubmit = () => {

    }

    return (
        <div className="container mt-4">
            <div className="form-container">
                <h1 className="text-center mb-4">Select Machine</h1>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-4">
                        <Form.Label className="fw-bold">Select Machine Post Number</Form.Label>
                        <Form.Select
                            value={postNumber || ""}
                            onChange={(e) => setPostNumber(e.target.value)}
                            disabled={!machines}
                            size="lg"
                        >
                            <option value="">-- Select a machine --</option>
                            {machines?.map((machine) => (
                                <option
                                    key={machine.MachineId}
                                    value={machine.PostNumber}
                                >
                                    POST {machine.PostNumber} - {machine.MachineName} ({machine.MachineModel})
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                    <Button
                        type="submit"
                        variant="primary"
                        className="w-100 py-2 fw-bold"
                        disabled={!postNumber}
                    >
                        Continue
                    </Button>
                </Form>
            </div>
        </div>
    )

}

export default MachineWelcomeScreen;