import './App.css';
import CreateGarment from './components/garments/CreateGarment';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import GarmentList from './components/garments/GarmentList';
import Login from './components/login/Login';
import OperationLog from './components/operations/OperationLog';
import Header from './components/header/Header';
import { AuthProvider } from "./services/authentication/AuthContext";
// import Home from "./components/home-page/HomePage";
// import Header from "./components/header/Header";
import ProtectedRoute from "./services/protected-routes/ProtectedRoutes";
// import Register from './components/register/Register';
import Home from './components/home/Home';
import CreateOrder from './components/orders/CreateOrder';
import OperationAssignment from './components/operations/OperationAssignment';
import MachinePanel from './components/machines/MachinePanel';
import MachineSelectScreen from './components/machines/MachineSelectScreen';
import TimeCalculatorDashboard from './components/analytics/TimeCalculatorDashboard';
import MachineSessionMetrics from './components/analytics/MachineSessionMetrics';
import OrderList from './components/orders/OrderList';
import MachineList from './components/machines/MachineList';

const App = () => {

  return (
    <>
      <div className="app-shell">
        <AuthProvider>
          <BrowserRouter>
            <Header />
            <main className="app-main py-4">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="createGarment" element={<ProtectedRoute allowedRoles={["Admin"]}><CreateGarment /></ProtectedRoute>} />
                <Route path="GarmentList" element={<ProtectedRoute allowedRoles={["Admin"]}><GarmentList /></ProtectedRoute>} />
                <Route path="OrderList" element={<ProtectedRoute allowedRoles={["Admin"]}><OrderList /></ProtectedRoute>} />
                <Route path="login" element={<Login />} />
                <Route
                  path="operationlog/:machineSessionId"
                  element={<OperationLog />}
                />
                {/* <Route path="register" element={<Register />} /> */}
                <Route path="operationassignement" element={<ProtectedRoute allowedRoles={["Admin"]}><OperationAssignment /></ProtectedRoute>} />
                <Route path="machinepanel" element={<ProtectedRoute allowedRoles={["Admin"]}><MachinePanel /></ProtectedRoute>} />
                <Route path="createorder" element={<ProtectedRoute allowedRoles={["Admin"]}><CreateOrder /></ProtectedRoute>} />
                <Route path="machineSelectScreen" element={<ProtectedRoute allowedRoles={["Operator"]}><MachineSelectScreen /></ProtectedRoute>} />
                <Route path="timeCalculatorDashboard" element={<ProtectedRoute allowedRoles={["Admin"]}><TimeCalculatorDashboard /></ProtectedRoute>} />
                <Route path="/MachineSessionMetrics/:machineSessionId" element={<ProtectedRoute allowedRoles={["Admin"]}><MachineSessionMetrics /></ProtectedRoute>} />
                <Route path="machineList" element={<ProtectedRoute allowedRoles={["Admin"]}><MachineList /></ProtectedRoute>} />
              </Routes>
            </main>
          </BrowserRouter>
        </AuthProvider>
      </div>
    </>
  )
}

export default App;