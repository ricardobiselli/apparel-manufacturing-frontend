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
        <div className="container mt-4">
            <div className="form-container">
                <h1 className="text-center mb-4">Create New Garment</h1>
                <Form onSubmit={handleSubmit}>
                    <fieldset className="mb-4 p-3 border rounded" style={{borderColor: 'var(--border)'}}>
                        <legend className="text-primary">Garment Information</legend>
                        <Form.Group className="mb-3">
                            <Form.Label>Garment Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="garmentName"
                                placeholder="Enter garment name..."
                                value={garment.garmentName}
                                onChange={handleGarmentInputChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Garment Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="garmentDescription"
                                placeholder="Enter garment description..."
                                value={garment.garmentDescription}
                                onChange={handleGarmentInputChange}
                                required
                            />
                        </Form.Group>
                    </fieldset>

                    <fieldset className="mb-4 p-3 border rounded" style={{borderColor: 'var(--border)'}}>
                        <legend className="text-primary">Operation Details</legend>
                        <Form.Group className="mb-3">
                            <Form.Label>Operation Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="operationName"
                                placeholder="Enter operation name..."
                                value={operation.operationName}
                                onChange={handleOperationInputChange}
                                required={operations.length === 0}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Operation Description</Form.Label>
                            <Form.Control
                                type="text"
                                name="operationDescription"
                                placeholder="Short description..."
                                value={operation.operationDescription}
                                onChange={handleOperationInputChange}
                                required={operations.length === 0}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Base Time (seconds)</Form.Label>
                            <Form.Control
                                type="number"
                                min={1}
                                name="baseTime"
                                placeholder="Enter base time in seconds"
                                value={operation.baseTime}
                                onChange={handleOperationInputChange}
                                required={operations.length === 0}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Units Per Garment</Form.Label>
                            <Form.Control
                                type="number"
                                min={1}
                                name="unitsPerGarment"
                                placeholder="How many times per garment?"
                                value={operation.unitsPerGarment}
                                onChange={handleOperationInputChange}
                                required={operations.length === 0}
                            />
                        </Form.Group>
                        <Button variant="primary" type="button" onClick={handleAddNewOperation}>
                            + Add Operation
                        </Button>
                    </fieldset>

                    {operations.length > 0 && (
                        <div className="mb-4 p-3 bg-light border rounded">
                            <h5>Operations ({operations.length})</h5>
                            <ul className="list-group list-group-flush mt-2">
                                {operations.map((op, index) => (
                                    <li key={index} className="list-group-item d-flex justify-content-between align-items-start">
                                        <div>
                                            <strong>{op.operationName}</strong>
                                            <p className="mb-1 text-muted small">{op.operationDescription}</p>
                                            <small>⏱ {op.baseTime}s × {op.unitsPerGarment} units</small>
                                        </div>
                                        <Button size="sm" variant="outline-danger" onClick={() => handleRemoveOperation(index)}>
                                            ✕
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <Button variant="primary" type="submit" className="w-100 py-2 fw-bold">
                        Create Garment
                    </Button>
                </Form>
            </div>
        </div>
    );
};

export default CreateGarment;
