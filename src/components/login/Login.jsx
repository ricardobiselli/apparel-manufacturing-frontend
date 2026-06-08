import { useState, useContext } from "react";
import AuthContext from "../../services/authentication/AuthContext";
import { useNavigate } from "react-router-dom";
import { Form, Alert } from "react-bootstrap";
import Button from '@mui/material/Button';


const Login = () => {
  const { login } = useContext(AuthContext);
  const [userNameOrEmail, setUserNameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); 
    const success = await login(userNameOrEmail, password);
    if (success) {
      navigate("/")
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
            <Form.Label>Email or Username</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your email or username"
              value={userNameOrEmail}
              onChange={(e) => setUserNameOrEmail(e.target.value)}
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
           <Button variant="contained" type="submit">Login</Button>

          {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
        </Form>
      </div>
    </div>
  )
};

export default Login;