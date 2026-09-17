import { Form, Button } from "react-bootstrap";
import useGarments from "../garments/hooks/UseGarments.jsx";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AddOrder } from "./endpoints/Endpoints";

const CreateOrder = () => {
    const { garments } = useGarments();
    const [selectedGarment, setSelectedGarment] = useState("");
    const [selectedQuantity, setSelectedQuantity] = useState("");
    const [description, setDescription] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const order = {
            description: description,
            orderGarments: [
                {
                    garmentId: selectedGarment,
                    quantity: selectedQuantity
                }
            ]
        };

        try {
            await AddOrder(order);
            alert('Order submitted successfully')
            ;
            setSelectedGarment("");
            setSelectedQuantity("");
            setDescription("");
            navigate("/OrderList");

        } catch (err) {
            console.log('Error while adding new order:', err);
            alert('Error while creating order...');
        }
    };


    return (
        <div className="container mt-4">
            <div className="form-container">
                <h1 className="text-center mb-4">Create New Order</h1>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Select Garment</Form.Label>
                        <Form.Select
                            disabled={!garments}
                            value={selectedGarment}
                            onChange={(e) => setSelectedGarment(e.target.value)}
                            required
                        >
                            <option value="">--- Select a garment ---</option>
                            {garments?.map((garment) => (
                                <option
                                    key={garment.garmentId}
                                    value={garment.garmentId}
                                >
                                    {garment.garmentName}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Quantity</Form.Label>
                        <Form.Control
                            type="number"
                            min="1"
                            placeholder="Enter quantity for production"
                            disabled={!selectedGarment}
                            value={selectedQuantity}
                            onChange={(e) => setSelectedQuantity(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-4">
                        <Form.Label className="fw-bold">Description (Optional)</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Enter any special notes or details for this order..."
                            disabled={!selectedGarment || !selectedQuantity}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </Form.Group>
                    <Button
                        variant="primary"
                        type="submit"
                        className="w-100 py-2 fw-bold"
                        disabled={!selectedGarment || !selectedQuantity }
                    >
                        Create Order
                    </Button>
                </Form>
            </div>
        </div>
    );
};

export default CreateOrder;
