import "./App.css";
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <Router>
      <AppRoutes />
      <ToastContainer position="bottom-right" autoClose={2000} hideProgressBar />
    </Router>
  );
}

export default App;