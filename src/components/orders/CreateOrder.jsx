import { Form, Button } from "react-bootstrap";
import useGarments from "../garments/hooks/UseGarments.jsx";
import { useState } from "react";
import { AddOrder } from "./endpoints/Endpoints";

const CreateOrder = () => {
    const { garments } = useGarments();
    const [selectedGarment, setSelectedGarment] = useState("");
    const [selectedQuantity, setSelectedQuantity] = useState("");
    const [description, setDescription] = useState("");
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
            alert('Order submitted successfully');
            setSelectedGarment("");
            setSelectedQuantity("");
            setDescription("");

        } catch (err) {
            console.log('Error while adding new order:', err);
            alert('Error while creating order...');
        }
    };


    return (
        <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
                <Form.Label>Select garment</Form.Label>

                <Form.Control
                    as="select"
                    disabled={!garments}
                    value={selectedGarment}
                    onChange={(e) => setSelectedGarment(e.target.value)}
                >
                    <option value="">--- Select a garment ---</option>

                    {garments?.map((garment) => (
                        <option
                            key={garment.garmentId}
                            value={garment.garmentId}
                        >
                            {garment.garmentName} – {garment.garmentDescription}
                        </option>
                    ))}
                </Form.Control>
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Quantity</Form.Label>

                <Form.Control
                    type="number"
                    min="1"
                    placeholder="Enter quantity for production"
                    disabled={!selectedGarment}
                    value={selectedQuantity}
                    onChange={(e) => setSelectedQuantity(e.target.value)}
                />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>

                <Form.Control
                    type="text"
                    placeholder="Enter Description/details for this order..."
                    disabled={!selectedGarment || !selectedQuantity}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </Form.Group>
            <Button
                type="submit"
                disabled={!selectedGarment || !selectedQuantity}
            >
                Create order
            </Button>
        </Form>
    );
};

export default CreateOrder;
