import { useState } from 'react';
import { Alert, Button, Form, Modal } from 'react-bootstrap';
import FabricRollCard from './FabricRollCard';
import useFabricRolls from './hooks/UseFabricRolls.jsx';
import { UpdateFabricRoll } from './endpoints/Endpoints';

const FabricRollList = () => {
    const { fabricRolls, refreshFabricRolls } = useFabricRolls();
    const [selectedRoll, setSelectedRoll] = useState(null);
    const [draft, setDraft] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const openEditModal = (fabricRoll) => {
        setSelectedRoll(fabricRoll);
        setDraft({
            fabricRollName: fabricRoll.fabricRollName,
            color: fabricRoll.color,
            fabricRollDescription: fabricRoll.fabricRollDescription || '',
            weightOrLength: fabricRoll.weightOrLength,
            yield: fabricRoll.yield,
            date: fabricRoll.date || '',
            barCode: fabricRoll.barCode ?? '',
        });
        setError('');
    };

    const closeEditModal = () => {
        setSelectedRoll(null);
        setDraft(null);
        setError('');
    };

    const handleChange = ({ target }) => {
        setDraft((currentDraft) => ({ ...currentDraft, [target.name]: target.value }));
    };

    const handleSave = async (event) => {
        event.preventDefault();
        setIsSaving(true);
        setError('');

        try {
            await UpdateFabricRoll(selectedRoll.fabricRollId, {
                fabricRollName: draft.fabricRollName.trim(),
                color: draft.color.trim(),
                fabricRollDescription: draft.fabricRollDescription.trim() || null,
                weightOrLength: Number(draft.weightOrLength),
                yield: Number(draft.yield),
                date: draft.date || null,
                barCode: draft.barCode === '' ? null : Number(draft.barCode),
            });
            await refreshFabricRolls();
            closeEditModal();
        } catch (requestError) {
            console.error('Error updating fabric roll:', requestError);
            setError('Unable to update the fabric roll. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    if (!fabricRolls) {
        return (
            <div className="container mt-4">
                <div className="alert alert-info" role="alert">Loading fabric rolls...</div>
            </div>
        );
    }

    if (fabricRolls.length === 0) {
        return (
            <div className="container mt-4">
                <div className="alert alert-warning" role="alert">
                    No fabric rolls found. Start by creating a new fabric roll.
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <h2 className="mb-4 fw-bold">Fabric Rolls ({fabricRolls.length})</h2>
            <div className="cards-grid">
                {fabricRolls.map((fabricRoll) => (
                    <FabricRollCard
                        key={fabricRoll.fabricRollId}
                        fabricRoll={fabricRoll}
                        onEdit={openEditModal}
                    />
                ))}
            </div>

            <Modal show={Boolean(selectedRoll)} onHide={closeEditModal}>
                <Form onSubmit={handleSave}>
                    <Modal.Header closeButton>
                        <Modal.Title>Edit fabric roll</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {error && <Alert variant="danger">{error}</Alert>}
                        <Form.Group className="mb-3">
                            <Form.Label>Roll name</Form.Label>
                            <Form.Control name="fabricRollName" value={draft?.fabricRollName || ''} onChange={handleChange} required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Color</Form.Label>
                            <Form.Control name="color" value={draft?.color || ''} onChange={handleChange} required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Weight or length</Form.Label>
                            <Form.Control type="number" min="0" step="any" name="weightOrLength" value={draft?.weightOrLength ?? ''} onChange={handleChange} required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Yield</Form.Label>
                            <Form.Control type="number" min="0" step="any" name="yield" value={draft?.yield ?? ''} onChange={handleChange} required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Loaded date</Form.Label>
                            <Form.Control type="date" name="date" value={draft?.date || ''} onChange={handleChange} required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Barcode (Optional)</Form.Label>
                            <Form.Control type="number" min="0" step="1" name="barCode" value={draft?.barCode ?? ''} onChange={handleChange} />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Description (Optional)</Form.Label>
                            <Form.Control as="textarea" rows={3} name="fabricRollDescription" value={draft?.fabricRollDescription || ''} onChange={handleChange} />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" type="button" onClick={closeEditModal} disabled={isSaving}>Cancel</Button>
                        <Button variant="primary" type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save changes'}</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default FabricRollList;