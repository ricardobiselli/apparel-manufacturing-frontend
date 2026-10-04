import { useContext, useState } from 'react';
import { Alert, Button, Form, Modal } from 'react-bootstrap';
import GarmentCard from './GarmentCard';
import useGarments from './hooks/UseGarments.jsx';
import AuthContext from '../../services/authentication/AuthContext';
import { UpdateGarment } from './endpoints/Endpoints';

const GarmentList = () => {
    const { user } = useContext(AuthContext);
    const { garments, refreshGarments } = useGarments();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedGarment, setSelectedGarment] = useState(null);
    const [operationDrafts, setOperationDrafts] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const [saveError, setSaveError] = useState('');

    const canEditOperations = user?.role?.toLowerCase() === 'admin';

    const openOperationsModal = (garment) => {
        setSelectedGarment(garment);
        setOperationDrafts((garment?.operations || []).map((operation, index) => ({
            ...operation,
            operationId: operation.operationId ?? operation.id ?? null,
            draftKey: `existing-${operation.operationId ?? operation.id ?? index}`,
        })));
        setSaveMessage('');
        setSaveError('');
        setIsModalOpen(true);
    };

    const closeOperationsModal = () => {
        if (isSaving) return;
        setIsModalOpen(false);
        setSelectedGarment(null);
        setOperationDrafts([]);
        setSaveMessage('');
        setSaveError('');
    };

    const handleOperationChange = (index, field, value) => {
        setOperationDrafts((prev) => prev.map((operation, currentIndex) =>
            currentIndex === index
                ? {
                    ...operation,
                    [field]: ['baseTime', 'unitsPerGarment'].includes(field) && value !== ''
                        ? Number(value)
                        : value,
                }
                : operation
        ));
    };

    const handleAddOperation = () => {
        setOperationDrafts((previous) => [...previous, {
            draftKey: `new-${Date.now()}-${previous.length}`,
            operationName: '',
            operationDescription: '',
            baseTime: '',
            unitsPerGarment: 1,
        }]);
    };

    // const handleRemoveOperation = (index) => {
    //     setOperationDrafts((previous) => previous.filter((_, currentIndex) => currentIndex !== index));
    // };

    const handleSaveOperations = async () => {
        if (!selectedGarment) return;

        try {
            setIsSaving(true);
            setSaveError('');
            setSaveMessage('');

            const payload = {
                garmentName: selectedGarment.garmentName,
                garmentDescription: selectedGarment.garmentDescription,
                operations: operationDrafts.map((operation) => ({
                    operationId: operation.operationId ?? 0,
                    operationName: operation.operationName || '',
                    operationDescription: operation.operationDescription || '',
                    baseTime: Number(operation.baseTime ?? 0),
                    unitsPerGarment: Number(operation.unitsPerGarment ?? 0),
                })),
            };

            await UpdateGarment(selectedGarment.garmentId, payload);

            await refreshGarments();
            closeOperationsModal();
        } catch (error) {
            console.error('Error saving garment operations:', error);
            setSaveError('Unable to save operation changes. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    if (!garments) {
        return (
            <div className="container mt-4">
                <div className="alert alert-info" role="alert">
                    ⏳ Loading garments...
                </div>
            </div>
        );
    }

    if (garments.length === 0) {
        return (
            <div className="container mt-4">
                <div className="alert alert-warning" role="alert">
                    📭 No garments found. Start by creating a new garment.
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <h2 className="mb-4 fw-bold">Garments ({garments.length})</h2>
            <div className="cards-grid">
                {garments.map((garment) => (
                    <GarmentCard
                        key={garment.garmentId}
                        garment={garment}
                        onEditOperations={openOperationsModal}
                        canEditOperations={canEditOperations}
                    />
                ))}
            </div>

            <Modal show={isModalOpen} onHide={closeOperationsModal} size="lg">
                <Form onSubmit={handleSaveOperations}>
                    <Modal.Header closeButton={!isSaving}>
                        <Modal.Title>Manage operations for {selectedGarment?.garmentName || 'garment'}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                    {saveError && <Alert variant="danger">{saveError}</Alert>}
                    {saveMessage && <Alert variant="success">{saveMessage}</Alert>}

                    {operationDrafts.map((operation, index) => (
                        <div key={operation.draftKey ?? operation.operationId ?? `${selectedGarment?.garmentId}-${index}`} className="border rounded p-3 mb-3">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <strong>{operation.operationId ? `Operation ${index + 1}` : 'New operation'}</strong>
                                {/* <Button
                                    type="button"
                                    size="sm"
                                    variant="outline-danger"
                                    onClick={() => handleRemoveOperation(index)}
                                    disabled={isSaving}
                                >
                                    Delete
                                </Button> */}
                            </div>
                            <Form.Group className="mb-3">
                                <Form.Label>Operation name</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={operation.operationName || ''}
                                    onChange={(event) => handleOperationChange(index, 'operationName', event.target.value)}
                                    required={!operation.operationId}
                                    disabled={isSaving}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Description</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    value={operation.operationDescription || ''}
                                    onChange={(event) => handleOperationChange(index, 'operationDescription', event.target.value)}
                                    required={!operation.operationId}
                                    disabled={isSaving}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Base time (seconds)</Form.Label>
                                <Form.Control
                                    type="number"
                                    min={operation.operationId ? '0' : '1'}
                                    step="0.01"
                                    value={operation.baseTime ?? 0}
                                    onChange={(event) => handleOperationChange(index, 'baseTime', event.target.value)}
                                    required={!operation.operationId}
                                    disabled={isSaving}
                                />
                            </Form.Group>

                            <Form.Group>
                                <Form.Label>Units per garment</Form.Label>
                                <Form.Control
                                    type="number"
                                    min={operation.operationId ? '0' : '1'}
                                    step="1"
                                    value={operation.unitsPerGarment ?? 0}
                                    onChange={(event) => handleOperationChange(index, 'unitsPerGarment', event.target.value)}
                                    required={!operation.operationId}
                                    disabled={isSaving}
                                />
                            </Form.Group>
                        </div>
                    ))}
                    <Button type="button" variant="outline-primary" onClick={handleAddOperation} disabled={isSaving}>
                        + Add operation
                    </Button>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button type="button" variant="secondary" onClick={closeOperationsModal} disabled={isSaving}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save changes'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default GarmentList;