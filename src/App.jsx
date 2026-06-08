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
// import ClientRegistration from "./components/client-registration/ClientRegistration";
// import ProtectedRoute from "./services/protected-routes/ProtectedRoutes";
import Register from './components/register/Register';
import GuestWorkerPanel from './components/workers/GuestWorkerPanel';
import Home from './components/home/Home';
import CreateOrder from './components/orders/CreateOrder';
import OperationAssignment from './components/operations/OperationAssignment';
import MachinePanel from './components/machines/MachinePanel';
import MachineSelectScreen from './components/machines/MachineSelectScreen';
import TimeCalculatorDashboard from './components/analytics/TimeCalculatorDashboard';
import MachineSessionDetails from './components/machines/MachineSessionDetails';
import OrderList from './components/orders/OrderList';

const App = () => {

  return (
    <>
      <div>
        <AuthProvider>
          <BrowserRouter>
            <Header />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="createGarment" element={<CreateGarment />} />
              <Route path="GarmentList" element={<GarmentList />} />
                            <Route path="OrderList" element={<OrderList />} />

              <Route path="login" element={<Login />} />
              <Route
                path="operationlog/:machineSessionId"
                element={<OperationLog />}
              />
              <Route path="register" element={<Register />} />
              <Route path="guestworkerpanel" element={<GuestWorkerPanel />} />
              <Route path="operationassignement" element={<OperationAssignment />} />
              <Route path="machinepanel" element={<MachinePanel />} />
              <Route path="createorder" element={<CreateOrder />} />
              <Route path="machineSelectScreen" element={<MachineSelectScreen />} />
              <Route path="timeCalculatorDashboard" element={<TimeCalculatorDashboard />} />
              <Route path="/MachineSessionDetails/:machineSessionId" element={<MachineSessionDetails />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </div>
    </>
  )
}

export default App;