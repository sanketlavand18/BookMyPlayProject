import { useState } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import AdminNavbar from "../../components/AdminNavbar";
import { FaFileDownload, FaUsers, FaBuilding, FaCalendarCheck, FaRupeeSign } from "react-icons/fa";

function Reports() {
  const [reportType, setReportType] = useState("users");
  const [format, setFormat] = useState("csv");

  const handleExport = () => {
    // Navigate directly to the download API endpoint
    const url = `http://localhost:8080/api/reports/export/${reportType}/${format}`;
    window.open(url, "_blank");
  };

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
            <h2 className="fw-bold mb-4 text-dark">Data Exports & Reports Center</h2>

            <div className="row g-4">
              
              {/* Export panel */}
              <div className="col-lg-6">
                <div className="card border-0 shadow-sm p-4 rounded-4 bg-white">
                  <h4 className="fw-bold text-dark mb-4">Export Settings</h4>
                  
                  <div className="mb-4">
                    <label className="form-label fw-semibold text-muted">Select Report Content</label>
                    <select
                      className="form-select form-select-lg rounded-3"
                      value={reportType}
                      onChange={e => setReportType(e.target.value)}
                    >
                      <option value="users">Registered Customers List</option>
                      <option value="vendors">Registered Vendor Details</option>
                      <option value="bookings">General Bookings Log</option>
                      <option value="payments">General Booking Payments</option>
                      <option value="reviews">Customer Reviews Ledger</option>
                      <option value="revenue">Financial Revenue Summary</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold text-muted">Select Export Format</label>
                    <select
                      className="form-select form-select-lg rounded-3"
                      value={format}
                      onChange={e => setFormat(e.target.value)}
                    >
                      <option value="csv">CSV (Comma-Separated Values)</option>
                      <option value="excel">XLS (Microsoft Excel Sheet)</option>
                      <option value="pdf">PDF (Printable Text Format)</option>
                    </select>
                  </div>

                  <button onClick={handleExport} className="btn btn-success btn-lg w-100 rounded-pill py-3 fw-bold text-white shadow-sm d-flex align-items-center justify-content-center gap-2">
                    <FaFileDownload /> Trigger Export Download
                  </button>
                </div>
              </div>

              {/* Explanations card */}
              <div className="col-lg-6">
                <div className="card border-0 shadow-sm p-4 rounded-4 bg-white h-100">
                  <h4 className="fw-bold text-dark mb-4">Export Metrics Summary</h4>
                  <div className="d-flex flex-column gap-3 small text-muted">
                    <div className="d-flex align-items-center gap-2 border-bottom pb-2">
                      <FaUsers className="text-primary" />
                      <span><strong>Registered Customers:</strong> Exports all registered profile ids, email addresses, names, and contact channels.</span>
                    </div>
                    <div className="d-flex align-items-center gap-2 border-bottom pb-2">
                      <FaUsers className="text-success" />
                      <span><strong>Vendor Details:</strong> Lists venue owners along with business profiles and location details.</span>
                    </div>
                    <div className="d-flex align-items-center gap-2 border-bottom pb-2">
                      <FaCalendarCheck className="text-warning" />
                      <span><strong>General Bookings:</strong> Pulls timestamps, schedules, venues, and status parameters.</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <FaRupeeSign className="text-success" />
                      <span><strong>Financial Revenue:</strong> Provides total income breakdowns across subscriptions and turf bookings.</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Reports;