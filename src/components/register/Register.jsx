// import { useState } from "react";
// import { Container, Form, Button } from "react-bootstrap";
// import { RegisterClient } from "../../api/Endpoints";

// const Register = () => {
//     const [formData, setFormData] = useState({
//         userName: "",
//         firstName: "",
//         lastName: "",
//         email: "",
//         password: "",
//         userType: "Client"
//     });


//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData({ ...formData, [name]: value });
//         console.log('Updated formData:', formData); // check

//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         try {
//             const response = await RegisterClient(formData);
//             console.log("User registered successfully:", response.data);
//             alert("Registration successful!");
//             setFormData({
//                 userName: "",
//                 firstName: "",
//                 lastName: "",
//                 email: "",
//                 password: "",
//                 userType: ""
//             });
//         } catch (error) {
//             console.error("Registration failed:", error);
//             alert("Error during registration. Please try again.");
//         }
//     };

//     return (
//         <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
//             <div className="p-4 shadow rounded text-center" style={{ backgroundColor: "#FFDDC1", maxWidth: "400px", width: "100%" }}>
//                 <h3 className="mb-3" >Register</h3>
//                 <Form onSubmit={handleSubmit}>
//                     <Form.Group className="mb-2">
//                         <Form.Control
//                             type="text"
//                             name="firstName"
//                             placeholder="First Name"
//                             value={formData.firstName}
//                             onChange={handleChange}
//                             required
//                         />
//                     </Form.Group>

//                     <Form.Group className="mb-2">
//                         <Form.Control
//                             type="text"
//                             name="lastName"
//                             placeholder="Last Name"
//                             value={formData.lastName}
//                             onChange={handleChange}
//                             required
//                         />
//                     </Form.Group>

//                     <Form.Group className="mb-2">
//                         <Form.Control
//                             type="text"
//                             name="userName"
//                             placeholder="Username"
//                             value={formData.userName}
//                             onChange={handleChange}
//                             required
//                         />
//                     </Form.Group>

//                     <Form.Group className="mb-2">
//                         <Form.Control
//                             type="email"
//                             name="email"
//                             placeholder="Email"
//                             value={formData.email}
//                             onChange={handleChange}
//                             required
//                         />
//                     </Form.Group>

//                     <Form.Group className="mb-2">
//                         <Form.Control
//                             type="password"
//                             name="password"
//                             placeholder="Password"
//                             value={formData.password}
//                             onChange={handleChange}
//                             required
//                         />
//                     </Form.Group>

//                     <Form.Group className="mb-3">
//                         <Form.Select
//                             name="userType"
//                             value={formData.userType}
//                             onChange={handleChange}
//                             required
//                         >
//                             <option value="Client">Client</option>
//                             <option value="GarmentWorker">Worker</option>
//                         </Form.Select>
//                     </Form.Group>
                    

//                     <Button type="submit" className="w-100" >
//                         Register
//                     </Button>
//                 </Form>
//             </div>
//         </Container>
//     );
// };

// export default Register;