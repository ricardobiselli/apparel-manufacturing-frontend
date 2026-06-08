
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
		<div className="container mt-3">
			<Card className="mb-3 shadow-sm">
				<CardHeader className="bg-success text-white">
					<h5 className="mb-0">Order Details</h5>
				</CardHeader>
				<CardBody>
					<Form.Group controlId="orderStatusSelect">
						<Form.Label><strong>Status:</strong></Form.Label>
						<Form.Select value={status} onChange={handleStatusChange} disabled={updating}>
							{statusOptions.map(opt => (
								<option key={opt} value={opt}>{opt}</option>
							))}
						</Form.Select>
					</Form.Group>
					<p className="mt-2">
						<Button variant="primary" onClick={handleUpdateStatus} disabled={updating}>
							{updating ? 'Updating...' : 'Update Status'}
						</Button>
					</p>
					<p><strong>ID:</strong> {orderId}</p>
					<p><strong>Description:</strong> {description}</p>
					<p><strong>Date:</strong> {dateOfCreation}</p>

					<h6 className="mt-3">Garments:</h6>
					<ul className="list-group">
						{orderGarments && orderGarments.length > 0 ? (
							orderGarments.map((garment, index) => (
								<li key={index} className="list-group-item">
									<strong>Name:</strong> {garment.garmentName || garment.name || 'N/A'} <br />
									<strong>Description:</strong> {garment.garmentDescription || garment.description || 'N/A'}
								</li>
							))
						) : (
							<li className="list-group-item">No garments in this order.</li>
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
