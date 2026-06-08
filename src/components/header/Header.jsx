import { Container, Navbar, Button } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";

const Header = () => {
    const navigate = useNavigate();

    const handleLogin = () => navigate("/login");
    const handleRegister = () => navigate("/register");
    const handleLogout = () => {
        navigate("/Home")
    }
    const handleGuest = () => navigate("/workerPanel")

    return (
        <Navbar bg="light" expand="lg" className="shadow-sm">
            <Container>
                <Navbar.Brand className="fw-bold text-dark">Apparel Manufacturing</Navbar.Brand>
                <div>
                    <Button variant="primary" className="me-2" onClick={handleLogin}>Login</Button>
                    <Button variant="primary" className="me-2" onClick={handleLogout}>Logout</Button>
                    <Button variant="primary" onClick={handleRegister}>Register</Button>
                    <Button variant="secondary" onClick={handleGuest}>Enter as guest </Button>
                    <br></br>
                    <Link to="/">Home</Link>
                    <br></br>

                    <Link to="/createGarment">Crear Prenda</Link>                    <br></br>

                    <Link to="/GarmentList">Lista Prendas</Link>                    <br></br>
                                        <Link to="/OrderList">Lista Órdenes</Link>                    <br></br>


                    <Link to="/createorder">Crear Orden</Link>                    <br></br>

                    <Link to="/machinepanel">Panel crear Máquinas</Link>                    <br></br>

                    <Link to="/guestworkerpanel">Panel Trabajadores</Link>                    <br></br>
                                        <Link to="/Machineselectscreen">machine select screen</Link>                    <br></br>


                    <Link to="/operationassignement">Asignación de operaciones</Link>                    <br></br>

                    <Link to="/timeCalculatorDashboard">Calculadora Tiempo</Link>                    <br></br>

                    {/* <Link to="/login">Login</Link> */}
                </div>
            </Container>
        </Navbar>

    );
};

export default Header;
