import { useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, Form } from 'react-bootstrap';
import { getFabricRollStateLabel, getFabricRollStateValue } from '../fabricRolls/FabricRollState';

const FabricRollPicker = ({ fabricRolls, selectedRollIds, onChange, disabled = false }) => {
    const [search, setSearch] = useState('');

    if (fabricRolls == null) {
        return <Alert variant="info" className="mb-0">Loading fabric rolls...</Alert>;
    }

    if (fabricRolls.length === 0) {
        return <Alert variant="warning" className="mb-0">No fabric rolls are available.</Alert>;
    }

    const normalizedSearch = search.trim().toLowerCase();
    const visibleRolls = fabricRolls.filter((roll) => {
        const searchableDetails = [
            roll.fabricRollName,
            roll.supplier,
            getFabricRollStateLabel(roll.state),
            roll.color,
            roll.fabricRollDescription,
            roll.barCode,
            roll.fabricRollId,
        ].filter(Boolean).join(' ').toLowerCase();

        return searchableDetails.includes(normalizedSearch);
    });

    const handleRollChange = (fabricRollId, checked) => {
        if (checked) {
            onChange([...selectedRollIds, fabricRollId]);
            return;
        }

        onChange(selectedRollIds.filter((selectedId) => selectedId !== fabricRollId));
    };

    return (
        <div>
            <Form.Control
                type="search"
                className="mb-2"
                placeholder="Search by name, supplier, color, barcode, or ID"
                aria-label="Search fabric rolls by name, supplier, color, barcode, or ID"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                disabled={disabled}
            />
            <div className="border rounded px-3" aria-label="Available fabric rolls">
                {visibleRolls.length > 0 ? visibleRolls.map((roll) => (
                    <Form.Check
                        key={roll.fabricRollId}
                        id={`order-fabric-roll-${roll.fabricRollId}`}
                        type="checkbox"
                        className="border-bottom py-2"
                        checked={selectedRollIds.includes(roll.fabricRollId)}
                        disabled={disabled || getFabricRollStateValue(roll.state) === 1}
                        onChange={(event) => handleRollChange(roll.fabricRollId, event.target.checked)}
                        label={(
                            <span className="d-block">
                                <span className="fw-semibold">{roll.fabricRollName}</span>
                                <span className="d-block small text-muted">
                                    {getFabricRollStateLabel(roll.state)} | {roll.supplier ? `${roll.supplier} | ` : ''}{roll.color} | {roll.weightOrLength} | Yield {roll.yield}
                                    {roll.barCode != null ? ` | Barcode ${roll.barCode}` : ''}
                                </span>
                            </span>
                        )}
                    />
                )) : (
                    <p className="text-muted my-3">No rolls match &quot;{search}&quot;.</p>
                )}
            </div>
            <div className="small text-muted mt-2" aria-live="polite">
                {selectedRollIds.length} roll{selectedRollIds.length === 1 ? '' : 's'} selected
            </div>
        </div>
    );
};

FabricRollPicker.propTypes = {
    fabricRolls: PropTypes.arrayOf(PropTypes.shape({
        fabricRollId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
        fabricRollName: PropTypes.string.isRequired,
        supplier: PropTypes.string,
        state: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        color: PropTypes.string,
        weightOrLength: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        yield: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        barCode: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        fabricRollDescription: PropTypes.string,
    })),
    selectedRollIds: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number, PropTypes.string])).isRequired,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
};

export default FabricRollPicker;