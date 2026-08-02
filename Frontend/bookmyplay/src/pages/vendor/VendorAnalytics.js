import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getVenuesByVendor } from "../../services/venueService";
import VendorSidebar from "../../components/VendorSidebar";
import VendorNavbar from "../../components/VendorNavbar";
import { FaSpinner, FaChartPie, FaChartLine, FaClock, FaCheckCircle } from "react-icons/fa";

function VendorAnalytics() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const [venues, setVenues] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (user.id) {
      loadData();
    } else {
      navigate("/login");
    }
  }, [user.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const venueRes = await getVenuesByVendor(user.id);
      setVenues(venueRes.data || []);

      const bookingRes = await axios.get(`http://localhost:8080/api/bookings/vendor/${user.id}`);
      setBookings(bookingRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // 1. Peak Booking Hour computation
  const getPeakBookingData = () => {
    // 6 slots: Morning (6-9 AM), Late Morning (9-12 PM), Afternoon (12-3 PM), Late Afternoon (3-6 PM), Evening (6-9 PM), Night (9-12 AM)
    const slotLabels = ["6-9 AM", "9-12 PM", "12-3 PM", "3-6 PM", "6-9 PM", "9-12 AM"];
    const counts = Array(6).fill(0);

    bookings.forEach(b => {
      if (!b.startTime) return;
      let hr = 0;
      if (Array.isArray(b.startTime)) {
        hr = b.startTime[0];
      } else if (typeof b.startTime === "string") {
        hr = parseInt(b.startTime.split(":")[0], 10);
      }

      if (hr >= 6 && hr < 9) counts[0]++;
      else if (hr >= 9 && hr < 12) counts[1]++;
      else if (hr >= 12 && hr < 15) counts[2]++;
      else if (hr >= 15 && hr < 18) counts[3]++;
      else if (hr >= 18 && hr < 21) counts[4]++;
      else if (hr >= 21 || hr < 6) counts[5]++;
    });

    return slotLabels.map((lbl, idx) => ({ label: lbl, count: counts[idx] }));
  };

  // 2. Venue Booking Share computation
  const getVenuePerformanceData = () => {
    const map = {};
    venues.forEach(v => {
      map[v.venueName] = 0;
    });

    bookings.forEach(b => {
      const vName = b.venueName || (b.venue && b.venue.venueName);
      if (vName) {
        map[vName] = (map[vName] || 0) + 1;
      }
    });

    return Object.keys(map).map(k => ({ venueName: k, bookingsCount: map[k] }));
  };

  const peakData = getPeakBookingData();
  const maxPeakCount = Math.max(...peakData.map(d => d.count), 1);

  const venuePerfData = getVenuePerformanceData();
  const maxVenueCount = Math.max(...venuePerfData.map(d => d.bookingsCount), 1);

  // Compute stats
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(b => b.bookingStatus === "CONFIRMED" || b.bookingStatus === "COMPLETED").length;
  const cancelledBookings = bookings.filter(b => b.bookingStatus === "CANCELLED").length;
  const mostBookedVenue = venuePerfData.length > 0 
    ? [...venuePerfData].sort((a,b) => b.bookingsCount - a.bookingsCount)[0]?.venueName || "N/A"
    : "N/A";

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
              <h2 className="fw-bold mb-0 text-dark">📊 Analytics & Performance</h2>
              <p className="text-muted">Analyze peak hours, venue popularity rankings, and booking ratios.</p>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <FaSpinner className="spinner-border text-success fs-2" role="status" />
              </div>
            ) : (
              <>
                {/* Stats row */}
                <div className="row g-3 mb-4">
                  <div className="col-md-3">
                    <div className="card border-0 shadow-sm p-4 bg-white text-center rounded-4">
                      <FaChartLine className="fs-2 text-primary mb-2" />
                      <h6 className="text-muted text-uppercase small font-weight-bold">Total Reservations</h6>
                      <h3 className="fw-bold text-dark">{totalBookings}</h3>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card border-0 shadow-sm p-4 bg-white text-center rounded-4">
                      <FaCheckCircle className="fs-2 text-success mb-2" />
                      <h6 className="text-muted text-uppercase small font-weight-bold">Success Ratio</h6>
                      <h3 className="fw-bold text-dark">
                        {totalBookings > 0 ? ((confirmedBookings / totalBookings) * 100).toFixed(0) : 0}%
                      </h3>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card border-0 shadow-sm p-4 bg-white text-center rounded-4">
                      <FaClock className="fs-2 text-warning mb-2" />
                      <h6 className="text-muted text-uppercase small font-weight-bold">Cancelled Bookings</h6>
                      <h3 className="fw-bold text-dark">{cancelledBookings}</h3>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card border-0 shadow-sm p-4 bg-white text-center rounded-4">
                      <FaChartPie className="fs-2 text-info mb-2" />
                      <h6 className="text-muted text-uppercase small font-weight-bold">Most Booked Arena</h6>
                      <h5 className="fw-bold text-dark text-truncate mt-1" style={{ fontSize: "1.1rem" }}>{mostBookedVenue}</h5>
                    </div>
                  </div>
                </div>

                {/* Graphs Row */}
                <div className="row g-4">
                  {/* Peak Booking Times */}
                  <div className="col-md-6">
                    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
                      <h5 className="fw-bold text-dark mb-4">Peak Booking Hours</h5>
                      <div style={{ height: "250px" }}>
                        <svg width="100%" height="100%" viewBox="0 0 500 250" preserveAspectRatio="none">
                          {/* Grid Lines */}
                          <line x1="40" y1="40" x2="480" y2="40" stroke="#f1f5f9" strokeWidth="1" />
                          <line x1="40" y1="120" x2="480" y2="120" stroke="#f1f5f9" strokeWidth="1" />
                          <line x1="40" y1="200" x2="480" y2="200" stroke="#e2e8f0" strokeWidth="2" />

                          {/* Bars */}
                          {peakData.map((d, i) => {
                            const barWidth = 45;
                            const gap = (400 - 6 * barWidth) / 5;
                            const x = 50 + i * (barWidth + gap);
                            const barHeight = (d.count / maxPeakCount) * 150;
                            const y = 200 - barHeight;

                            return (
                              <g key={i}>
                                <rect
                                  x={x}
                                  y={y}
                                  width={barWidth}
                                  height={barHeight}
                                  fill="#4f46e5"
                                  rx="4"
                                />
                                <text x={x + barWidth / 2} y={y - 8} fill="#1e293b" fontSize="10" fontWeight="bold" textAnchor="middle">
                                  {d.count > 0 ? d.count : ""}
                                </text>
                                <text x={x + barWidth / 2} y="220" fill="#64748b" fontSize="9" textAnchor="middle">
                                  {d.label}
                                </text>
                              </g>
                            );
                          })}
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Venue Performance */}
                  <div className="col-md-6">
                    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
                      <h5 className="fw-bold text-dark mb-4">Venue Booking Share</h5>
                      <div className="d-flex flex-column gap-3 justify-content-center" style={{ minHeight: "200px" }}>
                        {venuePerfData.length === 0 ? (
                          <div className="text-center text-muted py-4">No venues listed yet.</div>
                        ) : (
                          venuePerfData.map((d, idx) => {
                            const percentage = totalBookings > 0 ? ((d.bookingsCount / totalBookings) * 100).toFixed(0) : 0;
                            return (
                              <div key={idx} className="w-100">
                                <div className="d-flex justify-content-between mb-1">
                                  <span className="small fw-semibold text-dark text-truncate" style={{ maxWidth: "250px" }}>{d.venueName}</span>
                                  <span className="small text-muted fw-bold">{d.bookingsCount} ({percentage}%)</span>
                                </div>
                                <div className="progress rounded-pill" style={{ height: "10px" }}>
                                  <div
                                    className="progress-bar rounded-pill bg-success"
                                    role="progressbar"
                                    style={{ width: `${percentage}%`, background: "linear-gradient(90deg, #10b981, #059669)" }}
                                    aria-valuenow={percentage}
                                    aria-valuemin="0"
                                    aria-valuemax="100"
                                  ></div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default VendorAnalytics;
