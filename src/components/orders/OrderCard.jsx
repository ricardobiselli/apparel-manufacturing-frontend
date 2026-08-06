
import PropTypes from 'prop-types';

import { Button, Card, CardHeader, CardBody, Form } from 'react-bootstrap';
import { useState } from 'react';
import { UpdateOrderStatus } from './endpoints/Endpoints';




const statusOptions = ['Pending', 'Active', 'Completed', 'Cancelled'];

const OrderCard = ({ order }) => {
	console.log('OrderCard received order:', order);
	const { orderId, description, dateOfCreation, orderGarments } = order;
	const [status, setStatus] = useState(order.status);
	const [updating, setUpdating] = useState(false);

	const handleStatusChange = (e) => {
		setStatus(e.target.value);
	};

	const handleUpdateStatus = async () => {
		setUpdating(true);
		try {
			const payload = {
				OrderId: orderId,
				Status: status,
				Description: description || ""
			};
			console.log("order status:", payload);
			await UpdateOrderStatus(payload);
		} catch (err) {
			alert('Failed to update status');
			console.error('Error updating order status:', err);
		}
		setUpdating(false);
	};

	return (
		<div className="card-wrapper">
			<Card className="mb-3 shadow-sm h-100">
				<CardHeader className="py-3" style={{backgroundColor: 'var(--primary)', borderBottom: '2px solid var(--primary-strong)'}}>
					<h5 className="mb-0 fw-bold" style={{color: 'var(--surface)'}}>Order #{orderId}</h5>
				</CardHeader>
				<CardBody>
					<p className="mb-2"><strong>Status:</strong></p>
					<Form.Group controlId="orderStatusSelect" className="mb-3">
						<Form.Select value={status} onChange={handleStatusChange} disabled={updating} size="sm">
							{statusOptions.map(opt => (
								<option key={opt} value={opt}>{opt}</option>
							))}
						</Form.Select>
					</Form.Group>
					<Button variant="primary" size="sm" onClick={handleUpdateStatus} disabled={updating} className="mb-3">
						{updating ? '⏳ Updating...' : '✓ Update Status'}
					</Button>

					<hr />
					<p className="mb-2"><strong>Description:</strong> <span style={{color: 'var(--muted)'}}>{description}</span></p>
					<p className="mb-3"><strong>Created:</strong> <small className="text-muted">{new Date(dateOfCreation).toLocaleDateString()}</small></p>

					<h6 className="fw-bold mt-3 mb-2">Assigned Garments ({orderGarments?.length || 0})</h6>
					<ul className="list-group list-group-flush">
						{orderGarments && orderGarments.length > 0 ? (
							orderGarments.map((garment, index) => (
								<li key={index} className="list-group-item px-0 py-2">
									<p className="mb-1 fw-semibold">{garment.garmentName || garment.name || 'N/A'}</p>
									<small className="text-muted">{garment.garmentDescription || garment.description || 'No description'}</small>
								</li>
							))
						) : (
							<li className="list-group-item px-0 py-2 text-muted">No garments in this order</li>
						)}
					</ul>
				</CardBody>
			</Card>
		</div>
	);
};

OrderCard.propTypes = {
	order: PropTypes.shape({
		orderId: PropTypes.number.isRequired,
		description: PropTypes.string,
		status: PropTypes.string,
		dateOfCreation: PropTypes.string,
		orderGarments: PropTypes.arrayOf(
			PropTypes.shape({
				garmentName: PropTypes.string,
				garmentDescription: PropTypes.string,
				name: PropTypes.string,
				description: PropTypes.string
			})
		)
	}).isRequired
};

export default OrderCard;
