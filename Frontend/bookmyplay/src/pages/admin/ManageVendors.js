import { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../components/AdminSidebar";
import AdminNavbar from "../../components/AdminNavbar";
import { FaSearch, FaChevronLeft, FaChevronRight, FaSpinner, FaBan, FaCheck, FaBuilding, FaRupeeSign, FaCalendarCheck, FaCreditCard } from "react-icons/fa";

function ManageVendors() {
  const [vendors, setVendors] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // View Details Modal states
  const [vendorDetailsModal, setVendorDetailsModal] = useState({
    show: false,
    vendor: null,
    venues: [],
    bookings: [],
    subscription: null,
    revenue: 0
  });

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    setLoading(true);

    try {
      const res = await axios.get("http://localhost:8080/api/admin/vendors");

      console.log("Vendor API Response:", res.data);

      setVendors(res.data || []);
    } catch (err) {
      console.error("Error loading vendors:", err);
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };
  const handleToggleSuspend = async (vendor) => {
    const isSuspended = vendor.isBlocked || false;
    const action = isSuspended ? "unblock" : "block";
    if (!window.confirm(`Are you sure you want to ${isSuspended ? "activate" : "suspend"} this vendor account?`)) return;

    try {
      await axios.put(`http://localhost:8080/api/admin/extended/users/${vendor.id}/${action}`);
      alert(`Vendor account ${isSuspended ? "activated" : "suspended"} successfully.`);
      loadVendors();
    } catch (err) {
      console.error(err);
      alert("Failed to change vendor status.");
    }
  };

  const viewVendorDetails = async (vendor) => {
    try {
      // 1. Get venues owned by vendor
      const venuesRes = await axios.get(`http://localhost:8080/api/venues/vendor/${vendor.id}`);
      const venues = venuesRes.data || [];

      // 2. Get bookings & revenue
      const bookingsRes = await axios.get("http://localhost:8080/api/admin/bookings");
      const allBookings = bookingsRes.data || [];
      const vendorBookings = allBookings.filter(b => b.venue?.vendorId === vendor.id);

      const revenue = vendorBookings
        .filter(b => b.bookingStatus === "CONFIRMED")
        .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

      // 3. Get subscription status
      const subRes = await axios.get(`http://localhost:8080/api/subscriptions/vendor/${vendor.id}`);
      const sub = subRes.data;

      setVendorDetailsModal({
        show: true,
        vendor: vendor,
        venues: venues,
        bookings: vendorBookings,
        subscription: sub,
        revenue: revenue
      });
    } catch (e) {
      console.error(e);
      alert("Failed to load vendor details.");
    }
  };

  // Filter
  const filteredVendors = vendors.filter((v) => {
    const query = searchQuery.toLowerCase();
    return (
      (v.fullName || "").toLowerCase().includes(query) ||
      (v.email || "").toLowerCase().includes(query) ||
      (v.phone || "").toLowerCase().includes(query) ||
      (v.businessName || "").toLowerCase().includes(query)
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredVendors.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredVendors.length / itemsPerPage);

  return (
    <div className="container-fluid">
      <div className="row">

        {/* Left Sidebar */}
        <div className="col-md-2 p-0">
          <AdminSidebar />
        </div>

        {/* Content Column */}
        <div className="col-md-10 p-0 bg-light" style={{ minHeight: "100vh" }}>

          <AdminNavbar />

          <div className="px-4 pb-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="fw-bold mb-0 text-dark">Manage Business Vendors</h2>

              {/* Search */}
              <div className="input-group shadow-sm" style={{ width: "300px" }}>
                <span className="input-group-text bg-white border-end-0 text-muted"><FaSearch /></span>
                <input
                  type="text"
                  placeholder="Search name, business, email..."
                  className="form-control border-start-0 shadow-none"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <FaSpinner className="spinner-border text-primary fs-2" role="status" />
              </div>
            ) : (
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-dark">
                      <tr>
                        <th className="py-3 px-4">ID</th>
                        <th className="py-3">Vendor Name</th>
                        <th className="py-3">Business Profile</th>
                        <th className="py-3">Email / Contact</th>
                        <th className="py-3">Status</th>
                        <th className="py-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center text-muted py-5">No vendor profiles found.</td>
                        </tr>
                      ) : (
                        currentItems.map((v) => (
                          <tr key={v.id}>
                            <td className="px-4 text-muted fw-bold">#{v.id}</td>
                            <td className="fw-semibold text-dark">{v.fullName}</td>
                            <td className="text-dark">{v.businessName || "N/A"}</td>
                            <td>
                              <span className="d-block">{v.email}</span>
                              <span className="text-muted small">{v.phone}</span>
                            </td>
                            <td>
                              <span className={`badge px-2 py-1 ${v.isBlocked ? "bg-danger" : "bg-success"}`}>
                                {v.isBlocked ? "Suspended" : "Active"}
                              </span>
                            </td>
                            <td className="text-center">
                              <div className="d-flex justify-content-center gap-2">
                                <button className="btn btn-outline-primary btn-sm" onClick={() => viewVendorDetails(v)}>
                                  View Details
                                </button>
                                <button className={`btn btn-sm ${v.isBlocked ? "btn-success" : "btn-warning"}`} onClick={() => handleToggleSuspend(v)}>
                                  {v.isBlocked ? <><FaCheck /> Activate</> : <><FaBan /> Suspend</>}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="card-footer bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                    <span className="small text-muted">Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredVendors.length)} of {filteredVendors.length} entries</span>
                    <div className="d-flex gap-2">
                      <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="btn btn-outline-dark btn-sm rounded-circle px-2 py-1"><FaChevronLeft /></button>
                      <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="btn btn-outline-dark btn-sm rounded-circle px-2 py-1"><FaChevronRight /></button>
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>

        </div>

      </div>

      {/* Details Modal */}
      {vendorDetailsModal.show && vendorDetailsModal.vendor && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 rounded-4" style={{ maxHeight: "85vh", overflowY: "auto" }}>
              <div className="modal-header bg-dark text-white border-0 py-3 rounded-top-4">
                <h5 className="modal-title fw-bold">Vendor Profile & Metrics</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setVendorDetailsModal({ show: false, vendor: null, venues: [], bookings: [], subscription: null, revenue: 0 })}></button>
              </div>
              <div className="modal-body p-4">

                {/* Highlights grid */}
                <div className="row g-3 mb-4">
                  <div className="col-md-3">
                    <div className="bg-light p-3 rounded-3 text-center">
                      <FaBuilding className="text-primary fs-3 mb-2" />
                      <span className="small text-muted d-block">Venues Owned</span>
                      <h4 className="fw-bold mb-0 text-dark">{vendorDetailsModal.venues.length}</h4>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="bg-light p-3 rounded-3 text-center">
                      <FaCalendarCheck className="text-warning fs-3 mb-2" />
                      <span className="small text-muted d-block">Total Bookings</span>
                      <h4 className="fw-bold mb-0 text-dark">{vendorDetailsModal.bookings.length}</h4>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="bg-light p-3 rounded-3 text-center">
                      <FaRupeeSign className="text-success fs-3 mb-2" />
                      <span className="small text-muted d-block">Gross Earnings</span>
                      <h4 className="fw-bold mb-0 text-success">₹ {vendorDetailsModal.revenue}</h4>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="bg-light p-3 rounded-3 text-center">
                      <FaCreditCard className="text-info fs-3 mb-2" />
                      <span className="small text-muted d-block">Subscription Status</span>
                      <strong className={`d-block small text-uppercase mt-1 ${vendorDetailsModal.subscription?.active ? "text-success" : "text-danger"}`}>
                        {vendorDetailsModal.subscription?.active ? "Active" : "Inactive"}
                      </strong>
                    </div>
                  </div>
                </div>

                <h5 className="fw-bold text-dark border-bottom pb-2 mb-3">Venue Aggregates</h5>
                <div className="list-group mb-4">
                  {vendorDetailsModal.venues.length === 0 ? (
                    <p className="text-muted small">No venues registered under this vendor.</p>
                  ) : (
                    vendorDetailsModal.venues.map(v => (
                      <div className="list-group-item d-flex justify-content-between align-items-center" key={v.id}>
                        <div>
                          <strong className="text-dark d-block">{v.venueName}</strong>
                          <span className="text-muted small">{v.city} - {v.address}</span>
                        </div>
                        <span className="badge bg-success">₹ {v.pricePerHour} / Hr</span>
                      </div>
                    ))
                  )}
                </div>

                <h5 className="fw-bold text-dark border-bottom pb-2 mb-3">Recent Bookings</h5>
                <div className="table-responsive">
                  <table className="table table-sm table-hover">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Venue</th>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vendorDetailsModal.bookings.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center text-muted small">No bookings registered.</td>
                        </tr>
                      ) : (
                        vendorDetailsModal.bookings.map(b => (
                          <tr key={b.id}>
                            <td className="small">#BMP-{b.id}</td>
                            <td className="fw-semibold">{b.venue?.venueName || "N/A"}</td>
                            <td>{b.bookingDate}</td>
                            <td className="fw-bold text-success">₹ {b.totalPrice}</td>
                            <td>
                              <span className={`badge ${b.bookingStatus === "CONFIRMED" ? "bg-success" : "bg-danger"}`}>
                                {b.bookingStatus}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

              </div>
              <div className="modal-footer border-0 p-3 bg-light rounded-bottom-4">
                <button type="button" className="btn btn-secondary px-4 rounded-pill" onClick={() => setVendorDetailsModal({ show: false, vendor: null, venues: [], bookings: [], subscription: null, revenue: 0 })}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default ManageVendors;