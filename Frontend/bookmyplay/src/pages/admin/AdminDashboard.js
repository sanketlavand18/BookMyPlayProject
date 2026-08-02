import { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../components/AdminSidebar";
import AdminNavbar from "../../components/AdminNavbar";
import {
  FaUsers,
  FaBuilding,
  FaCalendarCheck,
  FaRupeeSign,
  FaStar,
  FaCreditCard,
  FaUserCheck,
  FaUserTimes,
  FaHourglassHalf,
  FaClipboardCheck,
  FaBoxes,
  FaCalendarAlt
} from "react-icons/fa";

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVendors: 0,
    activeVendors: 0,
    expiredVendors: 0,
    totalVenues: 0,
    pendingVenueApprovals: 0,
    totalBookings: 0,
    todaysBookings: 0,
    monthlyBookings: 0,
    totalReviews: 0,
    totalRevenue: 0.0,
    subscriptionRevenue: 0.0,
    platformRevenue: 0.0,
    pendingPayments: 0
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8080/api/admin/dashboard");
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const bookingRev = stats.totalRevenue - stats.subscriptionRevenue;
  const bookingPercentage = stats.totalRevenue > 0 ? (bookingRev / stats.totalRevenue) * 100 : 0;
  const subscriptionPercentage = stats.totalRevenue > 0 ? (stats.subscriptionRevenue / stats.totalRevenue) * 100 : 0;

  const maxMonthlyRevenue = stats.monthlyRevenue && stats.monthlyRevenue.length > 0 
      ? Math.max(...stats.monthlyRevenue.map(r => r.revenue)) 
      : 0;

  const maxMonthlyBookings = stats.monthlyBookingsOverTime && stats.monthlyBookingsOverTime.length > 0 
      ? Math.max(...stats.monthlyBookingsOverTime.map(b => b.bookings)) 
      : 0;

  return (
    <div className="container-fluid">
      <div className="row">
        
        {/* Left Sidebar */}
        <div className="col-md-2 p-0">
          <AdminSidebar />
        </div>

        {/* Right Content Column */}
        <div className="col-md-10 p-0 bg-light" style={{ minHeight: "100vh" }}>
          
          <AdminNavbar />

          <div className="px-4 pb-4">
            <h2 className="fw-bold mb-4 text-dark">System Operations & Analytics</h2>

            {/* Quick Metrics Grid */}
            <div className="row g-3 mb-5">
              
              <div className="col-md-3">
                <div className="card border-0 shadow-sm rounded-3 bg-white p-3 d-flex flex-row align-items-center gap-3">
                  <div className="bg-primary-subtle text-primary rounded p-3 fs-3">
                    <FaUsers />
                  </div>
                  <div>
                    <span className="text-muted small fw-semibold text-uppercase d-block" style={{ fontSize: "0.7rem", letterSpacing: "0.5px" }}>Customers</span>
                    <h3 className="fw-bold mb-0 text-dark">{stats.totalUsers}</h3>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="card border-0 shadow-sm rounded-3 bg-white p-3 d-flex flex-row align-items-center gap-3">
                  <div className="bg-success-subtle text-success rounded p-3 fs-3">
                    <FaUserCheck />
                  </div>
                  <div>
                    <span className="text-muted small fw-semibold text-uppercase d-block" style={{ fontSize: "0.7rem", letterSpacing: "0.5px" }}>Active Vendors</span>
                    <h3 className="fw-bold mb-0 text-success">{stats.activeVendors} <span className="text-muted small fs-6">/ {stats.totalVendors}</span></h3>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="card border-0 shadow-sm rounded-3 bg-white p-3 d-flex flex-row align-items-center gap-3">
                  <div className="bg-danger-subtle text-danger rounded p-3 fs-3">
                    <FaUserTimes />
                  </div>
                  <div>
                    <span className="text-muted small fw-semibold text-uppercase d-block" style={{ fontSize: "0.7rem", letterSpacing: "0.5px" }}>Expired Vendors</span>
                    <h3 className="fw-bold mb-0 text-danger">{stats.expiredVendors}</h3>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="card border-0 shadow-sm rounded-3 bg-white p-3 d-flex flex-row align-items-center gap-3">
                  <div className="bg-info-subtle text-info rounded p-3 fs-3">
                    <FaBuilding />
                  </div>
                  <div>
                    <span className="text-muted small fw-semibold text-uppercase d-block" style={{ fontSize: "0.7rem", letterSpacing: "0.5px" }}>Total Venues</span>
                    <h3 className="fw-bold mb-0 text-dark">{stats.totalVenues}</h3>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="card border-0 shadow-sm rounded-3 bg-white p-3 d-flex flex-row align-items-center gap-3">
                  <div className="bg-warning-subtle text-warning rounded p-3 fs-3">
                    <FaClipboardCheck />
                  </div>
                  <div>
                    <span className="text-muted small fw-semibold text-uppercase d-block" style={{ fontSize: "0.7rem", letterSpacing: "0.5px" }}>Venue Approvals</span>
                    <h3 className={`fw-bold mb-0 ${stats.pendingVenueApprovals > 0 ? "text-warning" : "text-success"}`}>
                      {stats.pendingVenueApprovals} Pending
                    </h3>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="card border-0 shadow-sm rounded-3 bg-white p-3 d-flex flex-row align-items-center gap-3">
                  <div className="bg-success-subtle text-success rounded p-3 fs-3">
                    <FaCalendarCheck />
                  </div>
                  <div>
                    <span className="text-muted small fw-semibold text-uppercase d-block" style={{ fontSize: "0.7rem", letterSpacing: "0.5px" }}>Total Bookings</span>
                    <h3 className="fw-bold mb-0 text-dark">{stats.totalBookings}</h3>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="card border-0 shadow-sm rounded-3 bg-white p-3 d-flex flex-row align-items-center gap-3">
                  <div className="bg-primary-subtle text-primary rounded p-3 fs-3">
                    <FaCalendarAlt />
                  </div>
                  <div>
                    <span className="text-muted small fw-semibold text-uppercase d-block" style={{ fontSize: "0.7rem", letterSpacing: "0.5px" }}>Monthly Bookings</span>
                    <h3 className="fw-bold mb-0 text-dark">{stats.monthlyBookings}</h3>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="card border-0 shadow-sm rounded-3 bg-white p-3 d-flex flex-row align-items-center gap-3">
                  <div className="bg-success-subtle text-success rounded p-3 fs-3">
                    <FaRupeeSign />
                  </div>
                  <div>
                    <span className="text-muted small fw-semibold text-uppercase d-block" style={{ fontSize: "0.7rem", letterSpacing: "0.5px" }}>Total Revenue</span>
                    <h3 className="fw-bold mb-0 text-success">₹{stats.totalRevenue.toFixed(2)}</h3>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="card border-0 shadow-sm rounded-3 bg-white p-3 d-flex flex-row align-items-center gap-3">
                  <div className="bg-info-subtle text-info rounded p-3 fs-3">
                    <FaCreditCard />
                  </div>
                  <div>
                    <span className="text-muted small fw-semibold text-uppercase d-block" style={{ fontSize: "0.7rem", letterSpacing: "0.5px" }}>Sub Revenue</span>
                    <h3 className="fw-bold mb-0 text-info">₹{stats.subscriptionRevenue.toFixed(2)}</h3>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="card border-0 shadow-sm rounded-3 bg-white p-3 d-flex flex-row align-items-center gap-3">
                  <div className="bg-warning-subtle text-warning rounded p-3 fs-3">
                    <FaRupeeSign />
                  </div>
                  <div>
                    <span className="text-muted small fw-semibold text-uppercase d-block" style={{ fontSize: "0.7rem", letterSpacing: "0.5px" }}>Platform Comm.</span>
                    <h3 className="fw-bold mb-0 text-dark">₹{stats.platformRevenue.toFixed(2)}</h3>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="card border-0 shadow-sm rounded-3 bg-white p-3 d-flex flex-row align-items-center gap-3">
                  <div className="bg-danger-subtle text-danger rounded p-3 fs-3">
                    <FaHourglassHalf />
                  </div>
                  <div>
                    <span className="text-muted small fw-semibold text-uppercase d-block" style={{ fontSize: "0.7rem", letterSpacing: "0.5px" }}>Pending Payments</span>
                    <h3 className="fw-bold mb-0 text-danger">{stats.pendingPayments}</h3>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="card border-0 shadow-sm rounded-3 bg-white p-3 d-flex flex-row align-items-center gap-3">
                  <div className="bg-secondary-subtle text-secondary rounded p-3 fs-3">
                    <FaStar />
                  </div>
                  <div>
                    <span className="text-muted small fw-semibold text-uppercase d-block" style={{ fontSize: "0.7rem", letterSpacing: "0.5px" }}>Total Reviews</span>
                    <h3 className="fw-bold mb-0 text-dark">{stats.totalReviews}</h3>
                  </div>
                </div>
              </div>

            </div>

            {/* Custom Visual Charts */}
            <div className="row g-4 mb-4">
              
              {/* Monthly Revenue Chart */}
              <div className="col-md-6">
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
                  <h5 className="fw-bold text-dark mb-4">Monthly Platform Growth (Revenue)</h5>
                  {!stats.monthlyRevenue || stats.monthlyRevenue.length === 0 || maxMonthlyRevenue === 0 ? (
                    <div className="text-center text-muted py-5 my-auto">No data available</div>
                  ) : (
                    <div className="d-flex align-items-end justify-content-between pt-5" style={{ height: "200px" }}>
                      {stats.monthlyRevenue.map((item, idx) => {
                        const heightPx = maxMonthlyRevenue > 0 ? (item.revenue / maxMonthlyRevenue) * 150 : 0;
                        const isCurrent = idx === stats.monthlyRevenue.length - 1;
                        return (
                          <div key={idx} className="d-flex flex-column align-items-center flex-grow-1">
                            <span className="small text-muted mb-1" style={{ fontSize: "0.75rem" }}>₹{item.revenue.toFixed(0)}</span>
                            <div 
                              className={isCurrent ? "bg-success rounded-top animate-hover" : "bg-primary rounded-top animate-hover"} 
                              style={{ height: `${Math.max(5, heightPx)}px`, width: "30px", transition: "height 0.3s ease" }}
                              title={`₹${item.revenue.toFixed(2)}`}
                            ></div>
                            <span className={isCurrent ? "small text-dark fw-bold mt-2" : "small text-muted mt-2"}>
                              {isCurrent ? "Current" : item.month}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Monthly Booking Chart */}
              <div className="col-md-6">
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
                  <h5 className="fw-bold text-dark mb-4">Booking Volumes Over Time</h5>
                  {!stats.monthlyBookingsOverTime || stats.monthlyBookingsOverTime.length === 0 || maxMonthlyBookings === 0 ? (
                    <div className="text-center text-muted py-5 my-auto">No data available</div>
                  ) : (
                    <div className="d-flex align-items-end justify-content-between pt-5" style={{ height: "200px" }}>
                      {stats.monthlyBookingsOverTime.map((item, idx) => {
                        const heightPx = maxMonthlyBookings > 0 ? (item.bookings / maxMonthlyBookings) * 150 : 0;
                        const isCurrent = idx === stats.monthlyBookingsOverTime.length - 1;
                        return (
                          <div key={idx} className="d-flex flex-column align-items-center flex-grow-1">
                            <span className="small text-muted mb-1" style={{ fontSize: "0.75rem" }}>{item.bookings} Bk</span>
                            <div 
                              className={isCurrent ? "bg-success rounded-top animate-hover" : "bg-info rounded-top animate-hover"} 
                              style={{ height: `${Math.max(5, heightPx)}px`, width: "35px", transition: "height 0.3s ease" }}
                              title={`${item.bookings} Bookings`}
                            ></div>
                            <span className={isCurrent ? "small text-dark fw-bold mt-2" : "small text-muted mt-2"}>
                              {isCurrent ? "Current" : item.month}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Popular Analytics Grid */}
            <div className="row g-4">
              
              {/* Top Sports */}
              <div className="col-md-4">
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
                  <h5 className="fw-bold text-dark mb-4">Most Booked Sports</h5>
                  {!stats.topSports || stats.topSports.length === 0 ? (
                    <div className="text-center text-muted py-5 my-auto">No data available</div>
                  ) : (
                    stats.topSports.slice(0, 4).map((sport, index) => (
                      <div className="mb-3" key={index}>
                        <div className="d-flex justify-content-between mb-1 small text-muted fw-semibold">
                          <span>{sport.name}</span>
                          <span>{sport.bookings} bookings</span>
                        </div>
                        <div className="progress rounded-pill" style={{ height: "8px" }}>
                          <div className="progress-bar rounded-pill animate-hover" style={{ width: `${sport.percentage}%`, backgroundColor: sport.color }} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Top Cities */}
              <div className="col-md-4">
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
                  <h5 className="fw-bold text-dark mb-4">Top Performing Cities</h5>
                  {!stats.topCities || stats.topCities.length === 0 ? (
                    <div className="text-center text-muted py-5 my-auto">No data available</div>
                  ) : (
                    stats.topCities.slice(0, 4).map((city, index) => (
                      <div className="mb-3" key={index}>
                        <div className="d-flex justify-content-between mb-1 small text-muted fw-semibold">
                          <span>{city.name}</span>
                          <span>{city.bookings} bookings</span>
                        </div>
                        <div className="progress rounded-pill" style={{ height: "8px" }}>
                          <div className="progress-bar bg-success rounded-pill animate-hover" style={{ width: `${city.percentage}%` }} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Top Vendors */}
              <div className="col-md-4">
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
                  <h5 className="fw-bold text-dark mb-4">Top Vendor Groups</h5>
                  {!stats.topVendorsList || stats.topVendorsList.length === 0 ? (
                    <div className="text-center text-muted py-5 my-auto">No data available</div>
                  ) : (
                    stats.topVendorsList.slice(0, 3).map((vendor, index) => (
                      <div className="mb-3" key={index}>
                        <div className="d-flex justify-content-between mb-1 small text-muted fw-semibold">
                          <span>{vendor.name}</span>
                          <span>₹ {vendor.revenue.toLocaleString("en-IN")}</span>
                        </div>
                        <div className="progress rounded-pill" style={{ height: "8px" }}>
                          <div className="progress-bar bg-warning rounded-pill animate-hover" style={{ width: `${vendor.percentage}%` }} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default AdminDashboard;