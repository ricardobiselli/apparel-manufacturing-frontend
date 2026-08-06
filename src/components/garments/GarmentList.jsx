import { useContext, useState } from 'react';
import { Alert, Button, Form, Modal } from 'react-bootstrap';
import GarmentCard from './GarmentCard';
import useGarments from './hooks/UseGarments.jsx';
import AuthContext from '../../services/authentication/AuthContext';
import { UpdateOperation } from '../operations/endpoints/Endpoints';

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
        setOperationDrafts((garment?.operations || []).map((operation) => ({
            ...operation,
            operationId: operation.operationId ?? operation.id ?? null,
        })));
        setSaveMessage('');
        setSaveError('');
        setIsModalOpen(true);
    };

    const closeOperationsModal = () => {
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
                    [field]: field === 'baseTime' ? Number(value) : value,
                }
                : operation
        ));
    };

    const handleSaveOperations = async () => {
        if (!selectedGarment) return;

        try {
            setIsSaving(true);
            setSaveError('');
            setSaveMessage('');

            for (const operation of operationDrafts) {
                if (!operation.operationId) {
                    throw new Error('Missing operation id for one of the selected operations.');
                }

                const payload = {
                    operationName: operation.operationName || '',
                    operationDescription: operation.operationDescription || '',
                    baseTime: Number(operation.baseTime ?? 0),
                    unitsPerGarment: Number(operation.unitsPerGarment ?? 0),
                };

                await UpdateOperation(operation.operationId, payload);
            }

            await refreshGarments();
            setSaveMessage('Operations updated successfully.');
            closeOperationsModal();
        } catch (error) {
            console.error('Error updating garment operations:', error);
            setSaveError('Unable to save the changes right now. Please verify the backend endpoint and payload.');
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
                <Modal.Header closeButton>
                    <Modal.Title>Edit operations for {selectedGarment?.garmentName || 'garment'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {saveError && <Alert variant="danger">{saveError}</Alert>}
                    {saveMessage && <Alert variant="success">{saveMessage}</Alert>}

                    {operationDrafts.map((operation, index) => (
                        <div key={operation.operationId ?? `${selectedGarment?.garmentId}-${index}`} className="border rounded p-3 mb-3">
                            <Form.Group className="mb-3">
                                <Form.Label>Operation name</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={operation.operationName || ''}
                                    onChange={(event) => handleOperationChange(index, 'operationName', event.target.value)}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Description</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    value={operation.operationDescription || ''}
                                    onChange={(event) => handleOperationChange(index, 'operationDescription', event.target.value)}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Base time (seconds)</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={operation.baseTime ?? 0}
                                    onChange={(event) => handleOperationChange(index, 'baseTime', event.target.value)}
                                />
                            </Form.Group>

                            <Form.Group>
                                <Form.Label>Units per garment</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="0"
                                    value={operation.unitsPerGarment ?? 0}
                                    onChange={(event) => handleOperationChange(index, 'unitsPerGarment', event.target.value)}
                                />
                            </Form.Group>
                        </div>
                    ))}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeOperationsModal} disabled={isSaving}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSaveOperations} disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save changes'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default GarmentList;