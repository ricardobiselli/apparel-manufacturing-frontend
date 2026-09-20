import { useState } from 'react';
import { Alert, Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { AddFabricRoll } from './endpoints/Endpoints';

const initialFabricRoll = {
    fabricRollName: '',
    color: '',
    fabricRollDescription: '',
    weightOrLength: '',
    yield: '',
    date: new Date().toISOString().slice(0, 10),
    barCode: '',
};

const CreateFabricRoll = () => {
    const [fabricRoll, setFabricRoll] = useState(initialFabricRoll);
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const navigate = useNavigate();

    const handleChange = ({ target }) => {
        setFabricRoll((currentRoll) => ({
            ...currentRoll,
            [target.name]: target.value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setIsSaving(true);

        const payload = {
            fabricRollName: fabricRoll.fabricRollName.trim(),
            color: fabricRoll.color.trim(),
            fabricRollDescription: fabricRoll.fabricRollDescription.trim() || null,
            weightOrLength: Number(fabricRoll.weightOrLength),
            yield: Number(fabricRoll.yield),
            date: fabricRoll.date,
            barCode: fabricRoll.barCode === '' ? null : Number(fabricRoll.barCode),
        };

        try {
            await AddFabricRoll(payload);
            setFabricRoll(initialFabricRoll);
            navigate('/FabricRollList');
        } catch (requestError) {
            console.error('Error adding fabric roll:', requestError);
            setError('Unable to create the fabric roll. Please verify the details and try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="container mt-4">
            <div className="form-container">
                <h1 className="text-center mb-4">Create New Fabric Roll</h1>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Roll name</Form.Label>
                        <Form.Control
                            type="text"
                            name="fabricRollName"
                            value={fabricRoll.fabricRollName}
                            onChange={handleChange}
                            placeholder="Enter a unique roll name"
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Color</Form.Label>
                        <Form.Control
                            type="text"
                            name="color"
                            value={fabricRoll.color}
                            onChange={handleChange}
                            placeholder="Enter the roll's actual color"
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Weight or length</Form.Label>
                        <Form.Control
                            type="number"
                            name="weightOrLength"
                            min="0"
                            step="any"
                            value={fabricRoll.weightOrLength}
                            onChange={handleChange}
                            placeholder="Enter this roll's measurement"
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Yield</Form.Label>
                        <Form.Control
                            type="number"
                            name="yield"
                            min="0"
                            step="any"
                            value={fabricRoll.yield}
                            onChange={handleChange}
                            placeholder="Enter this roll's yield"
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Loaded date</Form.Label>
                        <Form.Control
                            type="date"
                            name="date"
                            value={fabricRoll.date}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-4">
                        <Form.Label className="fw-bold">Barcode (Optional)</Form.Label>
                        <Form.Control
                            type="number"
                            name="barCode"
                            min="0"
                            step="1"
                            value={fabricRoll.barCode}
                            onChange={handleChange}
                            placeholder="Enter the roll barcode"
                        />
                    </Form.Group>

                    <Form.Group className="mb-4">
                        <Form.Label className="fw-bold">Description (Optional)</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            name="fabricRollDescription"
                            value={fabricRoll.fabricRollDescription}
                            onChange={handleChange}
                            placeholder="Add notes about this specific roll"
                        />
                    </Form.Group>

                    <Button variant="primary" type="submit" className="w-100 py-2 fw-bold" disabled={isSaving}>
                        {isSaving ? 'Creating...' : 'Create Fabric Roll'}
                    </Button>
                </Form>
            </div>
        </div>
    );
};

export default CreateFabricRoll;