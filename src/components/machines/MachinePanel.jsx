import { Form, Button } from "react-bootstrap";
import { useState } from "react";
import { AddMachine } from "./endpoints/Endpoints";

const MachinePanel = () => {
    const [machine, setMachine] = useState({
        postNumber: "",
        machineName: "",
        machineModel: "",
        purchaseDate: "",
        installDate: ""
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
            await AddMachine(machine);
            setMachine({
                postNumber: "",
                machineName: "",
                machineModel: "",
                purchaseDate: "",
                installDate: ""
            })
                alert("Machine added successfully!");
        }catch(error){
            console.error("Error adding machine:", error);
        }
    }

    return (
        <Form onSubmit={handleSubmit}>
            <Form.Group controlId="machineAdd"></Form.Group>
            <Form.Label>Machine Post Number:</Form.Label>
            <Form.Control
                type="number"
                name="postNumber"
                placeholder="Enter Post number"
                value={machine.postNumber}
                onChange={handleMachineInputChange}
                required
            />
            <Form.Group />
            <Form.Group controlId="machineAdd"></Form.Group>
            <Form.Label>Machine name:</Form.Label>
            <Form.Control
                type="text"
                name="machineName"
                placeholder="Enter machine name"
                value={machine.machineName}
                onChange={handleMachineInputChange}
                required
            />
            <Form.Group />
            <Form.Group controlId="machineAdd"></Form.Group>
            <Form.Label>Machine machine model:</Form.Label>
            <Form.Control
                type="text"
                name="machineModel"
                placeholder="Enter machine model"
                value={machine.machineModel}
                onChange={handleMachineInputChange}
                required
            />
            <Form.Group />
            <Form.Group controlId="machineAdd"></Form.Group>
            <Form.Label>Machine purchase date:</Form.Label>
            <Form.Control
                type="date"
                name="purchaseDate"
                placeholder="Enter machine's purchase date"
                value={machine.purchaseDate}
                onChange={handleMachineInputChange}
                required
            />
            <Form.Group />
            <Form.Group />
            <Form.Group controlId="machineAdd"></Form.Group>
            <Form.Label>Machine install date:</Form.Label>
            <Form.Control
                type="date"
                name="installDate"
                placeholder="Enter machine's install date"
                value={machine.installDate}
                onChange={handleMachineInputChange}
                required
            />
            <Form.Group />

            <Button type="submit">Add Machine</Button>
        </Form>
    )
}

export default MachinePanel;