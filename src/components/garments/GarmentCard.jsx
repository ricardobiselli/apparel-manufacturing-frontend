import PropTypes from 'prop-types';
import { Card, CardHeader , CardBody} from 'react-bootstrap';

const GarmentCard = ({ garment }) => {
  const { garmentId, garmentName, garmentDescription, sam, operations } = garment;

  return (
    <div className="container mt-3">
      <Card className="mb-3 shadow-sm">
        <CardHeader className="bg-primary text-white">
          <h5 className="mb-0">Garment Details</h5>
        </CardHeader>
        <CardBody>
          <p><strong>ID:</strong> {garmentId}</p>
          <p><strong>Name:</strong> {garmentName}</p>
          <p><strong>Description:</strong> {garmentDescription}</p>
          <p><strong>SAM:</strong> {sam}</p>

          
          <h6 className="mt-3">Operations:</h6>
          <ul className="list-group">
            {operations.map((operation, index) => (
              <li key={index} className="list-group-item">
                <strong>Name:</strong> {operation.operationName} <br />
                <strong>Description:</strong> {operation.operationDescription} <br />
                <strong>Base Time:</strong> {operation.baseTime} seconds
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
  }).isRequired
};

export default GarmentCard;