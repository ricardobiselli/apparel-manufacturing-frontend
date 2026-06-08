import { /*useContext,*/ useState } from "react";
import { Button, Form } from "react-bootstrap";
/* import { AddGarment } from "./garments/endpoints/EndPoints";
 */// import AuthContext from "../../services/authentication/AuthContext";
import { AddGarment } from "./endpoints/Endpoints";

const CreateGarment = () => {
    // const{user, role} = useContext(AuthContext);
    const [garment, setGarment] = useState({
        garmentName: "",
        garmentDescription: ""
    });

    const [operation, setOperation] = useState({
        operationName: "",
        operationDescription: "",
        baseTime: "",
        unitsPerGarment: 1
    });

    const [operations, setOperations] = useState([]);

    const handleGarmentInputChange = (e) => {
        const { name, value } = e.target;
        setGarment((prevGarment) => ({
            ...prevGarment,
            [name]: value
        }));
    };

    const handleOperationInputChange = (e) => {
        const { name, value, type } = e.target;
        setOperation((prevOperation) => ({
            ...prevOperation,
            [name]: type === "number" ? Number(value) : value
        }));
    };

    const handleAddNewOperation = () => {
        if (!operation.operationName || !operation.operationDescription || !operation.baseTime || !operation.unitsPerGarment) {
            alert("Please fill out all operation fields before adding.");
            return;
        }
        setOperations([...operations, operation]);
        setOperation({
            operationName: "",
            operationDescription: "",
            baseTime: "",
            unitsPerGarment: 1
        });
    };

    const handleRemoveOperation = (index) => {
        setOperations(operations.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!garment.garmentName || !garment.garmentDescription) {
            alert("Please fill out all garment fields.");
            return;
        }

        if (operations.length === 0) {
            alert("Please add at least one operation.");
            return;
        }

        const newGarment = {
            ...garment,
            operations
        };

        try {
            await AddGarment(newGarment);
            alert("Garment successfully added!");
            setGarment({
                garmentName: "",
                garmentDescription: ""
            });
            setOperations([]);
        } catch (error) {
            console.error("Error adding garment:", error);
            alert("Failed to add garment. Please try again.");
        }
    };

    return (
        <>
            <Form onSubmit={handleSubmit}>
                <h2>Create New Garment</h2>
                <Form.Group>
                    <Form.Label>Garment name: </Form.Label>
                    <Form.Control
                        type="text"
                        name="garmentName"
                        placeholder="Enter garment name..."
                        value={garment.garmentName}
                        onChange={handleGarmentInputChange}
                        required
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Garment description: </Form.Label>
                    <Form.Control
                        type="text"
                        name="garmentDescription"
                        placeholder="Enter garment description..."
                        value={garment.garmentDescription}
                        onChange={handleGarmentInputChange}
                        required
                    />
                </Form.Group>

                <h2>Add Operations</h2>

                <Form.Label>Operation name: </Form.Label>
                <Form.Control
                    type="text"
                    name="operationName"
                    placeholder="Enter operation name..."
                    value={operation.operationName}
                    onChange={handleOperationInputChange}
                    required={operations.length === 0} />


                <Form.Label>Operation Description: </Form.Label>
                <Form.Control
                    type="text"
                    name="operationDescription"
                    placeholder="Short description please..."
                    value={operation.operationDescription}
                    onChange={handleOperationInputChange}
                    required={operations.length === 0} />



                <Form.Label>BaseTime (seconds): </Form.Label>
                <Form.Control
                    type="number"
                    min={1}
                    name="baseTime"
                    placeholder="Enter base time for this operation (seconds)"
                    value={operation.baseTime}
                    onChange={handleOperationInputChange}
                    required={operations.length === 0} />

                <Form.Label>Units Per Garment: </Form.Label>
                <Form.Control
                    type="number"
                    min={1}
                    name="unitsPerGarment"
                    placeholder="How many times is this operation performed per garment?"
                    value={operation.unitsPerGarment}
                    onChange={handleOperationInputChange}
                    required={operations.length === 0} />


                <Button type="button" onClick={handleAddNewOperation}>
                    Add New Operation
                </Button>

                {operations.length > 0 && (
                    <>
                        <h3>Operations List</h3>
                        <ul>
                            {operations.map((op, index) => (
                                <li key={index}>
                                    {op.operationName}: {op.operationDescription} ({op.baseTime} seconds, {op.unitsPerGarment} per garment)
                                    <button onClick={() => handleRemoveOperation(index)}>Remove</button>
                                </li>
                            ))}
                        </ul>
                    </>
                )}

                <button type="submit">Add Garment</button>
            </Form>
        </>
    );
};

export default CreateGarment;
