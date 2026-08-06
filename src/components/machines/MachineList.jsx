import { useContext, useState } from 'react';
import { Alert, Button, Form, Modal } from 'react-bootstrap';
import MachineCard from './MachineCard';
import useMachines from './hooks/UseMachines';
import AuthContext from '../../services/authentication/AuthContext';
import { UpdateMachine } from './endpoints/Endpoints';

const formatDateForInput = (value) => {
  if (!value) return '';

  if (typeof value === 'string') {
    return value.slice(0, 10);
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return '';
};

const MachineList = () => {
  const { user } = useContext(AuthContext);
  const { machines, refreshMachines } = useMachines();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [machineDraft, setMachineDraft] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState('');

  const canEditMachine = user?.role?.toLowerCase() === 'admin';

  const openEditModal = (machine) => {
    setSelectedMachine(machine);
    setMachineDraft({
      MachineId: machine?.machineId ?? machine?.MachineId ?? null,
      PostNumber: machine?.postNumber ?? machine?.PostNumber ?? '',
      MachineName: machine?.machineName ?? machine?.MachineName ?? '',
      MachineModel: machine?.machineModel ?? machine?.MachineModel ?? '',
      InstallDate: formatDateForInput(machine?.installDate ?? machine?.InstallDate ?? ''),
      Status: machine?.status ?? machine?.Status ?? '',
    });
    setSaveMessage('');
    setSaveError('');
    setIsModalOpen(true);
  };

  const closeEditModal = () => {
    setIsModalOpen(false);
    setSelectedMachine(null);
    setMachineDraft(null);
    setSaveMessage('');
    setSaveError('');
  };

  const handleFieldChange = (field, value) => {
    setMachineDraft((prev) => ({
      ...prev,
      [field]: field === 'PostNumber' ? Number(value) : value,
    }));
  };

  const handleSaveMachine = async () => {
    if (!selectedMachine || !machineDraft) return;

    try {
      setIsSaving(true);
      setSaveError('');
      setSaveMessage('');

      const payload = {
        MachineId: Number(machineDraft.MachineId ?? selectedMachine?.machineId ?? selectedMachine?.MachineId ?? 0),
        PostNumber: Number(machineDraft.PostNumber ?? 0),
        MachineName: machineDraft.MachineName || '',
        MachineModel: machineDraft.MachineModel || '',
        InstallDate: machineDraft.InstallDate || '',
        Status: machineDraft.Status || '',
      };

      await UpdateMachine(payload.MachineId, payload);
      await refreshMachines();
      setSaveMessage('Machine updated successfully.');
      closeEditModal();
    } catch (error) {
      console.error('Error updating machine:', error);
      setSaveError('Unable to save the changes right now. Please verify the backend endpoint and payload.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!machines) {
    return (
      <div className="container mt-4">
        <div className="alert alert-info" role="alert">
          ⏳ Loading machines...
        </div>
      </div>
    );
  }

  if (machines.length === 0) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning" role="alert">
          📭 No machines found. Start by adding a new machine.
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4 fw-bold">Machines ({machines.length})</h2>
      <div className="cards-grid">
        {machines.map((machine) => (
          <MachineCard
            key={machine.machineId}
            machine={machine}
            onEditMachine={openEditModal}
            canEditMachine={canEditMachine}
          />
        ))}
      </div>

      <Modal show={isModalOpen} onHide={closeEditModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit machine details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {saveError && <Alert variant="danger">{saveError}</Alert>}
          {saveMessage && <Alert variant="success">{saveMessage}</Alert>}

          {machineDraft && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Post number</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  value={machineDraft.PostNumber ?? ''}
                  onChange={(event) => handleFieldChange('PostNumber', event.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Machine name</Form.Label>
                <Form.Control
                  type="text"
                  value={machineDraft.MachineName || ''}
                  onChange={(event) => handleFieldChange('MachineName', event.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Machine model</Form.Label>
                <Form.Control
                  type="text"
                  value={machineDraft.MachineModel || ''}
                  onChange={(event) => handleFieldChange('MachineModel', event.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Installed date</Form.Label>
                <Form.Control
                  type="date"
                  value={machineDraft.InstallDate || ''}
                  onChange={(event) => handleFieldChange('InstallDate', event.target.value)}
                />
              </Form.Group>

              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={machineDraft.Status || ''}
                  onChange={(event) => handleFieldChange('Status', event.target.value)}
                >
                  <option value="">Select status</option>
                  <option value="Operational">Operational</option>
                  <option value="InMaintenance">Under Maintenance</option>
                  <option value="Broken">Broken</option>
                  <option value="Retired">Retired</option>
                </Form.Select>
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeEditModal} disabled={isSaving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveMachine} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save changes'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MachineList;
