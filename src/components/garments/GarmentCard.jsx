import PropTypes from 'prop-types';
import { Button, Card, CardHeader, CardBody } from 'react-bootstrap';

const GarmentCard = ({ garment, onEditOperations, canEditOperations }) => {
  const { garmentId, garmentName, garmentDescription, sam, operations } = garment;

  const formattedSam = sam % 2 !== 0 ? sam.toFixed(2) : sam.toFixed(0);

  return (
    <div className="card-wrapper">
      <Card className="mb-3 shadow-sm h-100">
        <CardHeader className="py-3" style={{ backgroundColor: 'var(--primary-soft)', borderBottom: '2px solid var(--primary)' }}>
          <h5 className="mb-0 fw-bold" style={{ color: 'var(--surface)' }}> {garmentName}</h5>
        </CardHeader>
        <CardBody>
          <p className="mb-2"><strong>ID:</strong> <span style={{ color: 'var(--muted)' }}>{garmentId}</span></p>
          <p className="mb-2"><strong>Description:</strong> <span style={{ color: 'var(--muted)' }}>{garmentDescription}</span></p>
          <p className="mb-3"><strong>SAM:</strong> <span className="badge" style={{ backgroundColor: 'var(--primary)', color: 'var(--surface)' }}>{formattedSam}</span></p>

          {canEditOperations && (
            <Button variant="outline-primary" size="sm" className="mb-3" onClick={() => onEditOperations(garment)}>
              Edit operations
            </Button>
          )}

          <hr />
          <h6 className="mt-3 fw-bold">Operations ({operations.length})</h6>
          <ul className="list-group list-group-flush">
            {operations.map((operation, index) => (
              <li key={index} className="list-group-item px-0 py-2">
                <p className="mb-1"><strong>{operation.operationName}</strong></p>
                <small className="text-muted d-block mb-1">{operation.operationDescription}</small>
                <small style={{ color: 'var(--primary)' }}>⏱ {operation.baseTime} seconds</small>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>
    </div>
  );
};

GarmentCard.propTypes = {
  garment: PropTypes.shape({
    garmentId: PropTypes.number.isRequired,
    garmentName: PropTypes.string.isRequired,
    garmentDescription: PropTypes.string.isRequired,
    sam: PropTypes.number.isRequired,
    operations: PropTypes.arrayOf(
      PropTypes.shape({
        operationName: PropTypes.string.isRequired,
        operationDescription: PropTypes.string.isRequired,
        baseTime: PropTypes.number.isRequired
      })
    ).isRequired
  }).isRequired,
  onEditOperations: PropTypes.func,
  canEditOperations: PropTypes.bool,
};

export default GarmentCard;