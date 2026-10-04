import { /*useContext,*/ useState } from "react";
import { Button, Form } from "react-bootstrap";
/* import { AddGarment } from "./garments/endpoints/EndPoints";
 */// import AuthContext from "../../services/authentication/AuthContext";
import { AddGarment } from "./endpoints/Endpoints";

const exampleGarment = {
    garmentName: "Classic T-Shirt (Example)",
    garmentDescription: "A basic short-sleeve T-shirt with shoulder seams, set-in sleeves, side seams, and finished hems."
};

const exampleOperations = [
    { operationName: "Join shoulder seams", operationDescription: "Sew the front and back panels together at both shoulders.", baseTime: 30, unitsPerGarment: 1 },
    { operationName: "Attach sleeves", operationDescription: "Sew each sleeve into its armhole.", baseTime: 45, unitsPerGarment: 2 },
    { operationName: "Close side seams", operationDescription: "Sew from each sleeve opening down to the bottom hem.", baseTime: 40, unitsPerGarment: 2 },
    { operationName: "Hem sleeves", operationDescription: "Fold and stitch the opening of each sleeve.", baseTime: 25, unitsPerGarment: 2 },
    { operationName: "Hem bottom", operationDescription: "Fold and stitch the bottom edge of the T-shirt.", baseTime: 35, unitsPerGarment: 1 }
];

const CreateGarment = () => {
    // const{user, role} = useContext(AuthContext);
    const [garment, setGarment] = useState({ ...exampleGarment });

    const [operation, setOperation] = useState({
        operationName: "",
        operationDescription: "",
        baseTime: "",
        unitsPerGarment: 1
    });

    const [operations, setOperations] = useState(exampleOperations.map((operation) => ({ ...operation })));

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
            setGarment({ garmentName: "", garmentDescription: "" });
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
