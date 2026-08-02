import { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../components/AdminSidebar";
import AdminNavbar from "../../components/AdminNavbar";
import { FaSpinner, FaHistory } from "react-icons/fa";

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8080/api/admin/extended/audit-logs");
      // Sort logs descending by default
      const sorted = (res.data || []).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setLogs(sorted);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
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
            <h2 className="fw-bold mb-4 text-dark d-flex align-items-center gap-2">
              <FaHistory className="text-secondary" /> Administrative Audit Activity Logs
            </h2>

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
                        <th className="py-3 px-4">Timestamp</th>
                        <th className="py-3">Action Type</th>
                        <th className="py-3">Triggered By</th>
                        <th className="py-3">Role</th>
                        <th className="py-3">Action Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center text-muted py-5">No system audit activities registered.</td>
                        </tr>
                      ) : (
                        logs.map((l) => (
                          <tr key={l.id}>
                            <td className="px-4 text-muted small">{new Date(l.timestamp).toLocaleString()}</td>
                            <td className="fw-bold"><span className="badge bg-dark-subtle text-dark border px-3 py-1.5">{l.action}</span></td>
                            <td className="fw-semibold text-secondary">{l.actor}</td>
                            <td><span className="badge bg-danger">{l.actorRole}</span></td>
                            <td style={{ maxWidth: "400px", wordBreak: "break-all" }}>{l.details}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

export default AuditLogs;