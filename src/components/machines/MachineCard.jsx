import PropTypes from 'prop-types';
import { Button, Card, CardHeader, CardBody } from 'react-bootstrap';

const MachineCard = ({ machine, onEditMachine, canEditMachine }) => {
  const { machineId, postNumber, machineName, machineModel, installDate, status } = machine;

  const formattedInstallDate = installDate
    ? new Date(installDate).toLocaleDateString()
    : 'Unknown';

  return (
    <div className="card-wrapper">
      <Card className="mb-3 shadow-sm h-100">
        <CardHeader className="py-3" style={{ backgroundColor: 'var(--primary-soft)', borderBottom: '2px solid var(--primary)' }}>
          <h5 className="mb-0 fw-bold" style={{ color: 'var(--surface)' }}> {machineName}</h5>
        </CardHeader>
        <CardBody>
          <p className="mb-2"><strong>ID:</strong> <span style={{ color: 'var(--muted)' }}>{machineId}</span></p>
          <p className="mb-2"><strong>Post:</strong> <span style={{ color: 'var(--muted)' }}>{postNumber}</span></p>
          <p className="mb-2"><strong>Model:</strong> <span style={{ color: 'var(--muted)' }}>{machineModel}</span></p>
          <p className="mb-2"><strong>Installed:</strong> <span style={{ color: 'var(--muted)' }}>{formattedInstallDate}</span></p>
          <p className="mb-3"><strong>Status:</strong> <span className="badge" style={{ backgroundColor: 'var(--primary)', color: 'var(--surface)' }}>{status}</span></p>

          {canEditMachine && (
            <Button variant="outline-primary" size="sm" onClick={() => onEditMachine(machine)}>
              Edit details
            </Button>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

MachineCard.propTypes = {
  machine: PropTypes.shape({
    machineId: PropTypes.number,
    postNumber: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    machineName: PropTypes.string,
    machineModel: PropTypes.string,
    installDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    status: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  onEditMachine: PropTypes.func,
  canEditMachine: PropTypes.bool,
};

export default MachineCard;
