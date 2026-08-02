import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import VendorSidebar from "../../components/VendorSidebar";
import VendorNavbar from "../../components/VendorNavbar";
import { FaSpinner, FaRupeeSign, FaCalendarDay, FaCalendarWeek, FaCalendarAlt, FaHistory, FaSearch, FaChevronLeft, FaChevronRight } from "react-icons/fa";

function VendorEarnings() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    if (user.id) {
      loadBookings();
    } else {
      navigate("/login");
    }
  }, [user.id]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:8080/api/bookings/vendor/${user.id}`);
      // Filter only successful payments or confirmed bookings that represent actual earnings
      const successBookings = (res.data || []).filter(
        b => b.paymentStatus === "SUCCESS" || b.bookingStatus === "CONFIRMED" || b.bookingStatus === "COMPLETED"
      );
      setBookings(successBookings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Date parsing helper
  const getDaysAgo = (days) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d;
  };

  // Calculate earnings
  const getTodayEarnings = () => {
    const todayStr = new Date().toISOString().split("T")[0];
    return bookings
      .filter(b => b.bookingDate === todayStr)
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  };

  const getWeeklyEarnings = () => {
    const limit = getDaysAgo(7);
    return bookings
      .filter(b => new Date(b.bookingDate) >= limit)
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  };

  const getMonthlyEarnings = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return bookings
      .filter(b => {
        const bd = new Date(b.bookingDate);
        return bd.getMonth() === currentMonth && bd.getFullYear() === currentYear;
      })
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  };

  const getYearlyEarnings = () => {
    const currentYear = new Date().getFullYear();
    return bookings
      .filter(b => new Date(b.bookingDate).getFullYear() === currentYear)
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  };

  // Prepare monthly data for SVG chart
  const getMonthlyData = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentYear = new Date().getFullYear();
    const monthlySum = Array(12).fill(0);

    bookings.forEach(b => {
      const bd = new Date(b.bookingDate);
      if (bd.getFullYear() === currentYear) {
        monthlySum[bd.getMonth()] += b.totalPrice || 0;
      }
    });

    return months.map((m, idx) => ({ month: m, amount: monthlySum[idx] }));
  };

  const monthlyData = getMonthlyData();
  const maxAmount = Math.max(...monthlyData.map(d => d.amount), 1000);

  // Search logic for payment list
  const filteredBookings = bookings.filter((b) => {
    const query = searchQuery.toLowerCase();
    const customer = b.customerName || b.userName || "";
    const venue = b.venueName || "";
    return (
      String(b.id).includes(query) ||
      customer.toLowerCase().includes(query) ||
      venue.toLowerCase().includes(query)
    );
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBookings.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-2 p-0">
          <VendorSidebar mobileOpen={sidebarOpen} onCloseSidebar={() => setSidebarOpen(false)} />
        </div>

        {/* Content */}
        <div className="col-md-10 p-0 bg-light" style={{ minHeight: "100vh" }}>
          <VendorNavbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

          <div className="px-4 pb-4">
            <div className="mb-4">
              <h2 className="fw-bold mb-0 text-dark">💰 Revenue & Earnings</h2>
              <p className="text-muted">Track cash flows, payment methods, monthly progress, and audit transaction records.</p>
            </div>

            {/* Earnings Cards */}
            <div className="row g-3 mb-4">
              <div className="col-md-3">
                <div className="card border-0 shadow-sm text-white" style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
                  <div className="card-body d-flex align-items-center py-4">
                    <div className="fs-1 me-3 opacity-75"><FaCalendarDay /></div>
                    <div>
                      <h6 className="card-subtitle mb-1 text-white-50 fw-bold text-uppercase" style={{ fontSize: "0.7rem", letterSpacing: "1px" }}>Today's Earnings</h6>
                      <h3 className="card-title mb-0 fw-bold">₹ {getTodayEarnings().toLocaleString()}</h3>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="card border-0 shadow-sm text-white" style={{ background: "linear-gradient(135deg, #3b82f6, #1d4ed8)" }}>
                  <div className="card-body d-flex align-items-center py-4">
                    <div className="fs-1 me-3 opacity-75"><FaCalendarWeek /></div>
                    <div>
                      <h6 className="card-subtitle mb-1 text-white-50 fw-bold text-uppercase" style={{ fontSize: "0.7rem", letterSpacing: "1px" }}>Weekly Earnings</h6>
                      <h3 className="card-title mb-0 fw-bold">₹ {getWeeklyEarnings().toLocaleString()}</h3>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="card border-0 shadow-sm text-white" style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>
                  <div className="card-body d-flex align-items-center py-4">
                    <div className="fs-1 me-3 opacity-75"><FaCalendarAlt /></div>
                    <div>
                      <h6 className="card-subtitle mb-1 text-white-50 fw-bold text-uppercase" style={{ fontSize: "0.7rem", letterSpacing: "1px" }}>Monthly Earnings</h6>
                      <h3 className="card-title mb-0 fw-bold">₹ {getMonthlyEarnings().toLocaleString()}</h3>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="card border-0 shadow-sm text-white" style={{ background: "linear-gradient(135deg, #8b5cf6, #6d28d9)" }}>
                  <div className="card-body d-flex align-items-center py-4">
                    <div className="fs-1 me-3 opacity-75"><FaHistory /></div>
                    <div>
                      <h6 className="card-subtitle mb-1 text-white-50 fw-bold text-uppercase" style={{ fontSize: "0.7rem", letterSpacing: "1px" }}>Annual Earnings</h6>
                      <h3 className="card-title mb-0 fw-bold">₹ {getYearlyEarnings().toLocaleString()}</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SVG Interactive Earnings Chart */}
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
              <h5 className="fw-bold text-dark mb-4">Monthly Revenue Flow Chart (Current Year)</h5>
              <div className="position-relative" style={{ height: "300px" }}>
                <svg width="100%" height="100%" viewBox="0 0 1000 300" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  <line x1="50" y1="50" x2="950" y2="50" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="50" y1="125" x2="950" y2="125" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="50" y1="200" x2="950" y2="200" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="50" y1="270" x2="950" y2="270" stroke="#cbd5e1" strokeWidth="2" />

                  {/* SVG Area / Line Drawing */}
                  <path
                    d={`M 50 270 ` + monthlyData.map((d, i) => {
                      const x = 50 + (i * 900) / 11;
                      const y = 270 - (d.amount / maxAmount) * 200;
                      return `L ${x} ${y}`;
                    }).join(" ") + ` L 950 270 Z`}
                    fill="url(#earningsGlow)"
                    opacity="0.2"
                  />
                  <path
                    d={monthlyData.map((d, i) => {
                      const x = 50 + (i * 900) / 11;
                      const y = 270 - (d.amount / maxAmount) * 200;
                      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
                    }).join(" ")}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3.5"
                  />

                  {/* Data Points */}
                  {monthlyData.map((d, i) => {
                    const x = 50 + (i * 900) / 11;
                    const y = 270 - (d.amount / maxAmount) * 200;
                    return (
                      <g key={i} className="chart-node">
                        <circle cx={x} cy={y} r="5" fill="#ffffff" stroke="#10b981" strokeWidth="3" />
                        <text x={x} y={y - 12} fill="#1e293b" fontSize="10" textAnchor="middle" fontWeight="bold">
                          {d.amount > 0 ? `₹${(d.amount / 1000).toFixed(1)}k` : ""}
                        </text>
                        <text x={x} y="290" fill="#64748b" fontSize="11" textAnchor="middle">
                          {d.month}
                        </text>
                      </g>
                    );
                  })}

                  {/* Gradient Definitions */}
                  <defs>
                    <linearGradient id="earningsGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Payments list ledger card */}
            <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
              <div className="card-header bg-white border-0 py-3 d-flex flex-wrap justify-content-between align-items-center gap-3">
                <h5 className="fw-bold mb-0 text-dark">Transaction Records Log</h5>
                <div className="input-group shadow-sm" style={{ width: "300px" }}>
                  <span className="input-group-text bg-white border-end-0 text-muted"><FaSearch /></span>
                  <input
                    type="text"
                    placeholder="Search by ID, Customer, Venue..."
                    className="form-control border-start-0 shadow-none"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  />
                </div>
              </div>

              {loading ? (
                <div className="text-center py-5">
                  <FaSpinner className="spinner-border text-success fs-2" role="status" />
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-dark">
                      <tr>
                        <th className="py-3 px-4">Booking ID</th>
                        <th className="py-3">Customer Name</th>
                        <th className="py-3">Arena Venue</th>
                        <th className="py-3">Transaction Date</th>
                        <th className="py-3">Amount Received</th>
                        <th className="py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center text-muted py-5">No payments logged yet.</td>
                        </tr>
                      ) : (
                        currentItems.map((b) => (
                          <tr key={b.id}>
                            <td className="px-4 fw-semibold text-secondary">#BMP-{b.id}</td>
                            <td>
                              <span className="fw-bold text-dark">{b.customerName || b.userName || "N/A"}</span>
                            </td>
                            <td className="fw-semibold">{b.venueName || "N/A"}</td>
                            <td className="text-muted small">{b.bookingDate}</td>
                            <td className="fw-bold text-success">₹ {b.totalPrice}</td>
                            <td>
                              <span className="badge bg-success px-3 py-2 text-uppercase">SUCCESS</span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="card-footer bg-white border-0 py-3 d-flex justify-content-center align-items-center gap-3">
                  <button
                    className="btn btn-outline-secondary btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center"
                    style={{ width: "32px", height: "32px" }}
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                  >
                    <FaChevronLeft />
                  </button>
                  <span className="small text-secondary fw-semibold">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    className="btn btn-outline-secondary btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center"
                    style={{ width: "32px", height: "32px" }}
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                  >
                    <FaChevronRight />
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default VendorEarnings;
