import { Container, Navbar, Nav, Button } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../../services/authentication/AuthContext";

const Header = () => {
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);
    const isOperator = user?.role?.toLowerCase() === "operator";

    const handleLogin = () => navigate("/login");
    const handleLogout = () => {
        logout && logout();
        navigate("/Home");
    };
    const displayName = user?.firstName ? `${user.firstName}` : "Guest";

    return (
        <Navbar expand="lg" variant="light" className="header-navbar shadow-sm" sticky="top">
            <Container>
                <Navbar.Brand as={Link} to="/" className="fw-bold text-uppercase">
                    Apparel Manufacturing System
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="main-navbar-nav" />
                <Navbar.Collapse id="main-navbar-nav">
                    {!isOperator ? (
                        <Nav className="me-auto align-items-center gap-2">
                            {/* <Nav.Link as={Link} to="/" className="nav-button">Home</Nav.Link> */}
                            <Nav.Link as={Link} to="/createGarment" className="nav-button">Create new garment</Nav.Link>
                            <Nav.Link as={Link} to="/GarmentList" className="nav-button">Garment List</Nav.Link>
                            <Nav.Link as={Link} to="/createorder" className="nav-button">Create Order</Nav.Link>
                            <Nav.Link as={Link} to="/OrderList" className="nav-button">Orders List</Nav.Link>
                            <Nav.Link as={Link} to="/machinepanel" className="nav-button">Create Machine</Nav.Link>
                            <Nav.Link as={Link} to="/machineList" className="nav-button">Machine List</Nav.Link>
                            <Nav.Link as={Link} to="/createFabricRoll" className="nav-button">Create Fabric Roll</Nav.Link>
                            <Nav.Link as={Link} to="/FabricRollList" className="nav-button">Fabric Roll List</Nav.Link>
                            <Nav.Link as={Link} to="/operationassignement" className="nav-button">Operation Assignment</Nav.Link>
                            <Nav.Link as={Link} to="/timeCalculatorDashboard" className="nav-button">Metrics Dashboard</Nav.Link>
                        </Nav>
                    ) : (
                        <Nav className="me-auto align-items-center">
                            <Nav.Link as={Link} to="/machineSelectScreen" className="nav-button fw-semibold">
                                Machine Select
                            </Nav.Link>
                        </Nav>
                    )}
                    <div className="d-flex align-items-center gap-2 mt-3 mt-lg-0 header-actions">
                        {user ? (
                            <>
                                <span className="fw-semibold text-secondary">Hello, {displayName}</span>
                                <Button variant="secondary" onClick={handleLogout}>Logout</Button>
                            </>
                        ) : (
                            <Button variant="outline-secondary" onClick={handleLogin}>Login</Button>
                        )}
                    </div>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Header;
