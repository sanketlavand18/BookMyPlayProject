import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Booking from "./pages/Booking";
import MyBookings from "./pages/MyBookings";

import VendorDashboard from "./pages/VendorDashboard";
import VenueDetails from "./pages/VenueDetails";
import AddVenue from "./pages/AddVenue";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/booking/:id" element={<Booking />} />
        <Route path="/mybookings" element={<MyBookings />} />
        

        <Route path="/venue/:id" element={<VenueDetails />} />
        <Route path="/vendor" element={<VendorDashboard />} />
        <Route path="/vendor/add" element={<AddVenue />} />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default App;