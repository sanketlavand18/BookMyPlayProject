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


import Profile from "./pages/Profile";

import UserDashboard from "./pages/UserDashboard";
import VendorDashboard from "./pages/VendorDashboard";
import VenueDetails from "./pages/VenueDetails";
import AddVenue from "./pages/AddVenue";
import EditVenue from "./pages/EditVenue";

import ManageSlots from "./pages/ManageSlots";
import VendorProfile from "./pages/VendorProfile";
import VendorBookings from "./pages/VendorBookings";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageVenues from "./pages/admin/ManageVenues";
import ManageBookings from "./pages/admin/ManageBookings";
import ManageReviews from "./pages/admin/ManageReviews";
import ManageVendors from "./pages/admin/ManageVendors";
import ManagePayments from "./pages/admin/ManagePayments";
import PublicLayout from "./layouts/PublicLayout";
import UserLayout from "./layouts/UserLayout";

import ManageCategories from "./pages/admin/ManageCategories";
import AdminProfile from "./pages/admin/AdminProfile";
function App() {
  return (
  <BrowserRouter>

<Routes>

{/* Public */}

<Route element={<PublicLayout />}>

<Route path="/" element={<Home />} />

<Route path="/about" element={<About />} />

<Route path="/contact" element={<Contact />} />

<Route path="/login" element={<Login />} />

<Route path="/register" element={<Register />} />

<Route path="/venue/:id" element={<VenueDetails />} />

</Route>

{/* User */}

<Route element={<UserLayout />}>

<Route path="/user" element={<UserDashboard />} />

<Route path="/user/profile" element={<UserDashboard />} />

<Route path="/mybookings" element={<MyBookings />} />

<Route path="/booking/:id" element={<Booking />} />

<Route path="/profile" element={<Profile />} />
</Route>

{/* Vendor */}

<Route path="/vendor" element={<VendorDashboard />} />

<Route path="/vendor/add" element={<AddVenue />} />

<Route path="/vendor/edit/:id" element={<EditVenue />} />

<Route path="/vendor/slots/:venueId" element={<ManageSlots />} />

<Route path="/vendor/profile" element={<VendorProfile />} />

<Route path="/vendor/bookings" element={<VendorBookings />} />

{/* Admin */}

<Route path="/admin/dashboard" element={<AdminDashboard />} />

<Route path="/admin/users" element={<ManageUsers />} />

<Route path="/admin/venues" element={<ManageVenues />} />

<Route path="/admin/bookings" element={<ManageBookings />} />

<Route path="/admin/reviews" element={<ManageReviews />} />

<Route path="/admin/categories" element={<ManageCategories />} />

<Route path="/admin/vendors" element={<ManageVendors />} />

<Route path="/admin/payments" element={<ManagePayments />} />

<Route path="/admin/profile" element={<AdminProfile />} />

</Routes>

</BrowserRouter>
  );
}

export default App;