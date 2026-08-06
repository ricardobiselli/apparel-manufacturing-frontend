import { Form, Button } from "react-bootstrap";
import { useState } from "react";
import { AddMachine } from "./endpoints/Endpoints";

const MachinePanel = () => {
    const [machine, setMachine] = useState({
        postNumber: "",
        machineName: "",
        machineModel: "",
        installDate: "",
    });

    const handleMachineInputChange = (e) => {
        const { name, value } = e.target;
        setMachine((prevMachine) => ({
            ...prevMachine,
            [name]: value
        }));
        console.log(machine);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
            const payload = {
                PostNumber: Number(machine.postNumber),
                MachineName: machine.machineName,
                MachineModel: machine.machineModel,
                InstallDate: machine.installDate,
            };

            await AddMachine(payload);
            setMachine({
                postNumber: "",
                machineName: "",
                machineModel: "",
                installDate: ""
            })
                alert("Machine added successfully!");
        }catch(error){
            console.error("Error adding machine:", error);
        }
    }

    return (
        <div className="container mt-4">
            <div className="form-container">
                <h1 className="text-center mb-4">Add New Machine</h1>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Machine Post Number</Form.Label>
                        <Form.Control
                            type="number"
                            name="postNumber"
                            placeholder="e.g., 1, 2, 3..."
                            value={machine.postNumber}
                            onChange={handleMachineInputChange}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Machine Name</Form.Label>
                        <Form.Control
                            type="text"
                            name="machineName"
                            placeholder="e.g., Embroidery Unit A"
                            value={machine.machineName}
                            onChange={handleMachineInputChange}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Machine Model</Form.Label>
                        <Form.Control
                            type="text"
                            name="machineModel"
                            placeholder="e.g., Singer XL-1000"
                            value={machine.machineModel}
                            onChange={handleMachineInputChange}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-4">
                        <Form.Label className="fw-bold">Installation Date</Form.Label>
                        <Form.Control
                            type="date"
                            name="installDate"
                            value={machine.installDate}
                            onChange={handleMachineInputChange}
                            required
                        />
                    </Form.Group>
                    <Button variant="primary" type="submit" className="w-100 py-2 fw-bold">
                        + Add Machine
                    </Button>
                </Form>
            </div>
        </div>
    )
}

export default MachinePanel;