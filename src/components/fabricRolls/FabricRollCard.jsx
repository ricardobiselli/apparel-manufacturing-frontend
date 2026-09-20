import PropTypes from 'prop-types';
import { Button, Card } from 'react-bootstrap';

const FabricRollCard = ({ fabricRoll, onEdit }) => (
    <div className="card-wrapper">
        <Card className="mb-3 shadow-sm h-100">
            <Card.Header className="py-3" style={{ backgroundColor: 'var(--primary-soft)', borderBottom: '2px solid var(--primary)' }}>
                <h5 className="mb-0 fw-bold" style={{ color: 'var(--surface)' }}>{fabricRoll.fabricRollName}</h5>
            </Card.Header>
            <Card.Body>
                <p className="mb-2"><strong>ID:</strong> <span style={{ color: 'var(--muted)' }}>{fabricRoll.fabricRollId}</span></p>
                <p className="mb-2"><strong>Color:</strong> <span style={{ color: 'var(--muted)' }}>{fabricRoll.color}</span></p>
                <p className="mb-2"><strong>Weight / Length:</strong> <span style={{ color: 'var(--muted)' }}>{fabricRoll.weightOrLength}</span></p>
                <p className="mb-2"><strong>Yield:</strong> <span style={{ color: 'var(--muted)' }}>{fabricRoll.yield}</span></p>
                <p className="mb-2"><strong>Loaded:</strong> <span style={{ color: 'var(--muted)' }}>{fabricRoll.date || '-'}</span></p>
                <p className="mb-2"><strong>Barcode:</strong> <span style={{ color: 'var(--muted)' }}>{fabricRoll.barCode ?? '-'}</span></p>
                <p className="mb-3"><strong>Description:</strong> <span style={{ color: 'var(--muted)' }}>{fabricRoll.fabricRollDescription || '-'}</span></p>
                <Button variant="outline-primary" size="sm" onClick={() => onEdit(fabricRoll)}>
                    Edit fabric roll
                </Button>
            </Card.Body>
        </Card>
    </div>
);

FabricRollCard.propTypes = {
    fabricRoll: PropTypes.shape({
        fabricRollId: PropTypes.number.isRequired,
        fabricRollName: PropTypes.string.isRequired,
        color: PropTypes.string.isRequired,
        fabricRollDescription: PropTypes.string,
        weightOrLength: PropTypes.number.isRequired,
        yield: PropTypes.number.isRequired,
        date: PropTypes.string,
        barCode: PropTypes.number,
    }).isRequired,
    onEdit: PropTypes.func.isRequired,
};

export default FabricRollCard;