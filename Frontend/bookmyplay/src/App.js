import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Home from "./pages/Home";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Booking from "./pages/Booking";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";


import UserDashboard from "./pages/UserDashboard";
import UserProfile from "./pages/user/UserProfile";
import UserBookings from "./pages/user/UserBookings";
import UserFavorites from "./pages/user/UserFavorites";
import UserReviews from "./pages/user/UserReviews";
import UserPayments from "./pages/user/UserPayments";
import UserNotifications from "./pages/user/UserNotifications";
import UserCoupons from "./pages/user/UserCoupons";
import UserSettings from "./pages/user/UserSettings";
import VendorDashboard from "./pages/VendorDashboard";
import VenueDetails from "./pages/VenueDetails";
import AddVenue from "./pages/AddVenue";
import EditVenue from "./pages/EditVenue";
import VendorProfile from "./pages/VendorProfile";
import VendorBookings from "./pages/VendorBookings";
import VendorVenues from "./pages/vendor/VendorVenues";
import VendorBookingHistory from "./pages/vendor/VendorBookingHistory";
import VendorEarnings from "./pages/vendor/VendorEarnings";
import VendorReviews from "./pages/vendor/VendorReviews";
import VendorAnalytics from "./pages/vendor/VendorAnalytics";
import VendorNotifications from "./pages/vendor/VendorNotifications";
import VendorSettings from "./pages/vendor/VendorSettings";
import ManageSlots from "./pages/ManageSlots";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageVenues from "./pages/admin/ManageVenues";
import ManageBookings from "./pages/admin/ManageBookings";
import ManageReviews from "./pages/admin/ManageReviews";
import ContactSettings from "./pages/admin/ContactSettings";
import AboutSettings from "./pages/admin/AboutSettings";
import ManageSubscriptions from "./pages/admin/ManageSubscriptions";
import ManageSubscriptionPayments from "./pages/admin/ManageSubscriptionPayments";
import VendorPricing from "./pages/vendor/VendorPricing";
import VendorAbout from "./pages/vendor/VendorAbout";
import VendorContact from "./pages/vendor/VendorContact";
import Reports from "./pages/admin/Reports";
import ManageVendors from "./pages/admin/ManageVendors";
import ManagePayments from "./pages/admin/ManagePayments";
import PublicLayout from "./layouts/PublicLayout";
import UserLayout from "./layouts/UserLayout";

import ManageCategories from "./pages/admin/ManageCategories";
import AdminProfile from "./pages/admin/AdminProfile";
import ManageCoupons from "./pages/admin/ManageCoupons";
import BookingCalendar from "./pages/admin/BookingCalendar";



// Global window.alert override with SweetAlert2
window.alert = (message) => {
  if (window.Swal) {
    const isSuccess = /success|confirm/i.test(message);
    const isError = /fail|error|denied|unable|cannot|restrict/i.test(message);

    window.Swal.fire({
      icon: isSuccess ? "success" : isError ? "error" : "info",
      title: isSuccess ? "Success" : isError ? "Error" : "Notification",
      text: message,
      confirmButtonText: "OK",
      confirmButtonColor: isSuccess ? "#198754" : isError ? "#dc3545" : "#0d6efd"
    });
  } else {
    console.log("Native Alert:", message);
  }
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>

        <Routes>

          {/* Public */}

          <Route element={<PublicLayout />}>

            <Route path="/" element={<Home />} />

            <Route path="/about" element={<About />} />

            <Route path="/contact" element={<Contact />} />

            <Route path="/login" element={<Login />} />

            <Route path="/register" element={<Register />} />

            <Route path="/forgot-password" element={<ForgotPassword />} />

            <Route path="/reset-password" element={<ResetPassword />} />


            <Route path="/venue/:id" element={<VenueDetails />} />

          </Route>

          {/* User */}

          <Route element={<UserLayout />}>
            <Route path="/user" element={<UserDashboard />} />
            <Route path="/user/profile" element={<UserProfile />} />
            <Route path="/user/bookings" element={<UserBookings />} />
            <Route path="/user/favorites" element={<UserFavorites />} />
            <Route path="/user/reviews" element={<UserReviews />} />
            <Route path="/user/payments" element={<UserPayments />} />
            <Route path="/user/notifications" element={<UserNotifications />} />
            <Route path="/user/coupons" element={<UserCoupons />} />
            <Route path="/user/settings" element={<UserSettings />} />
            <Route path="/mybookings" element={<UserBookings />} />
            <Route path="/booking/:id" element={<Booking />} />
            <Route path="/profile" element={<UserProfile />} />
          </Route>

          {/* Vendor */}

          <Route path="/vendor" element={<VendorDashboard />} />
          <Route path="/vendor/venues" element={<VendorVenues />} />
          <Route path="/vendor/add" element={<AddVenue />} />
          <Route path="/vendor/edit/:id" element={<EditVenue />} />
          <Route path="/vendor/slots/:venueId" element={<ManageSlots />} />
          <Route path="/vendor/profile" element={<VendorProfile />} />
          <Route path="/vendor/bookings" element={<VendorBookings />} />
          <Route path="/vendor/bookings/history" element={<VendorBookingHistory />} />
          <Route path="/vendor/earnings" element={<VendorEarnings />} />
          <Route path="/vendor/reviews" element={<VendorReviews />} />
          <Route path="/vendor/analytics" element={<VendorAnalytics />} />
          <Route path="/vendor/notifications" element={<VendorNotifications />} />
          <Route path="/vendor/settings" element={<VendorSettings />} />
          <Route path="/vendor/subscription" element={<VendorPricing />} />
          <Route path="/vendor/about" element={<VendorAbout />} />
          <Route path="/vendor/contact" element={<VendorContact />} />

          {/* Admin */}

          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          <Route path="/admin/users" element={<ManageUsers />} />

          <Route path="/admin/venues" element={<ManageVenues />} />

          <Route path="/admin/bookings" element={<ManageBookings />} />

          <Route path="/admin/reviews" element={<ManageReviews />} />

          <Route path="/admin/categories" element={<ManageCategories />} />

          <Route path="/admin/vendors" element={<ManageVendors />} />

          <Route path="/admin/payments" element={<ManagePayments />} />

          <Route path="/admin/contact-settings" element={<ContactSettings />} />
          <Route path="/admin/about-settings" element={<AboutSettings />} />

          <Route path="/admin/subscriptions" element={<ManageSubscriptions />} />

          <Route path="/admin/subscription-payments" element={<ManageSubscriptionPayments />} />

          <Route path="/admin/reports" element={<Reports />} />

          <Route path="/admin/profile" element={<AdminProfile />} />

          <Route path="/admin/coupons" element={<ManageCoupons />} />

          <Route path="/admin/calendar" element={<BookingCalendar />} />


        </Routes>

      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
