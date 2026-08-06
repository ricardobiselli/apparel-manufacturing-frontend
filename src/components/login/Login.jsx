import { useState, useContext } from "react";
import AuthContext from "../../services/authentication/AuthContext";
import { useNavigate } from "react-router-dom";
import { Form, Alert, Button } from "react-bootstrap";


const Login = () => {
  const { login } = useContext(AuthContext);
  const [employeeIdNumber, setEmployeeIdNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const success = await login(employeeIdNumber, password);

    if (success) {
      const role = localStorage.getItem("role")?.toLowerCase();

      if (role === "operator") {
        navigate("/machineSelectScreen");
      } else if (role === "admin") {
        navigate("/timeCalculatorDashboard");
      } else {
        navigate("/");
      }
    } else {
      setError("Invalid credentials...try again!");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100">
      <div className="form-container">
        <h2 className="mb-4 text-center">Login</h2>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formBasicEmail" className="mb-3">
            <Form.Label>Employee ID number</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your employee ID number"
              value={employeeIdNumber}
              onChange={(e) => setEmployeeIdNumber(e.target.value)}
              required
              className="form-control"
            />
          </Form.Group>

          <Form.Group controlId="formBasicPassword" className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-control"
            />
          </Form.Group>
          <Button variant="primary" type="submit" className="w-100">Login</Button>

          {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
        </Form>
      </div>
    </div>
  )
};

export default Login;