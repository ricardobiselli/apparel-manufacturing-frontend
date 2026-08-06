
import OrderCard from "./OrderCard.jsx";
import useOrders from "./hooks/UseOrders.jsx";

const OrderList = () => {
	const { orders } = useOrders();

	if (!orders) {
		return (
			<div className="container mt-4">
				<div className="alert alert-info" role="alert">
					⏳ Loading orders...
				</div>
			</div>
		);
	}

	if (orders.length === 0) {
		return (
			<div className="container mt-4">
				<div className="alert alert-warning" role="alert">
					📭 No orders found. Start by creating a new order.
				</div>
			</div>
		);
	}

	return (
		<div className="container mt-4">
			<h2 className="mb-4 fw-bold">Orders ({orders.length})</h2>
			<div className="cards-grid">
				{orders.map((order) => (
					<OrderCard key={order.orderId} order={order} />
				))}
			</div>
		</div>
	);
};

export default OrderList;
