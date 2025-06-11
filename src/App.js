import logo from './logo.svg';
import './App.css';
import './style.scss'
import Register from "./pages/Register"
import Login from './pages/Login';
import Home from './pages/Home';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from "react-router-dom"
import { useContext, useEffect } from 'react';
import { AuthContext } from './context/AuthContext';
import { requestLocationPermission, startLocationTracking, stopLocationTracking } from "./utils/locationUtils";

function App() {
  const {currentUser} = useContext(AuthContext);

  useEffect(() => {
    const setupLocationTracking = async () => {
      const hasPermission = await requestLocationPermission();
      if (hasPermission && currentUser) {
        startLocationTracking();
      }
    };

    setupLocationTracking();

    return () => {
      stopLocationTracking();
    };
  }, [currentUser]);

  const ProtectedRoute = ({children}) => {
    if (!currentUser) {
      return <Navigate to="/login"/>
    }

    return children
  }

  return (
    <Router>
    <Routes>
      <Route path="/">
        <Route index element={<ProtectedRoute><Home/></ProtectedRoute>} />
        <Route path="login" element={<Login/>} />
        <Route path="register" element={<Register/>} />
      </Route>
    </Routes>
    </Router>
  );
}

export default App;
