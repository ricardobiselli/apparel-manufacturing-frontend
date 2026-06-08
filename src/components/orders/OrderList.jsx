
import OrderCard from "./OrderCard.jsx";
import useOrders from "./hooks/UseOrders.jsx";

const OrderList = () => {
	const { orders } = useOrders();

	if (!orders) {
		return <div>Please wait while loading orders...</div>;
	}

	if (orders.length === 0) {
		return <div>No orders found...</div>;
	}

	return (
		<div className="order-list">
			{orders.map((order) => (
				<OrderCard key={order.orderId} order={order} />
			))}
		</div>
	);
};

export default OrderList;
