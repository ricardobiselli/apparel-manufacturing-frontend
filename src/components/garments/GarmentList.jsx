import GarmentCard from "./GarmentCard";
import useGarments from "./hooks/UseGarments.jsx";

const GarmentList = () => {
    const { garments } = useGarments();

    if (!garments) {
        return <div>Please wait while loading garments...</div>;
    }

    if (garments.length === 0) {
        return <div>No garments found...</div>;
    }

    return (
        <div className="garment-list">
            {garments.map((garment) => (
                <GarmentCard key={garment.garmentId} garment={garment} />
            ))}
        </div>
    );
};

export default GarmentList;