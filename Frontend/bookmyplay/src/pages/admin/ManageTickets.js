import { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../components/AdminSidebar";
import AdminNavbar from "../../components/AdminNavbar";
import { FaReply, FaCheckCircle, FaSpinner } from "react-icons/fa";

function ManageTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [replyModal, setReplyModal] = useState({ show: false, ticketId: null, replyMessage: "" });

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8080/api/admin/extended/tickets");
      setTickets(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReply = (id) => {
    setReplyModal({ show: true, ticketId: id, replyMessage: "" });
  };

  const handleSaveReply = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8080/api/admin/extended/tickets/${replyModal.ticketId}/reply`, {
        reply: replyModal.replyMessage
      });
      alert("Reply sent successfully.");
      setReplyModal({ show: false, ticketId: null, replyMessage: "" });
      loadTickets();
    } catch (err) {
      console.error(err);
      alert("Failed to submit reply.");
    }
  };

  const handleCloseTicket = async (id) => {
    if (!window.confirm("Are you sure you want to close this ticket?")) return;
    try {
      await axios.put(`http://localhost:8080/api/admin/extended/tickets/${id}/status`, { status: "CLOSED" });
      alert("Ticket closed.");
      loadTickets();
    } catch (err) {
      console.error(err);
      alert("Failed to close ticket.");
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
            <h2 className="fw-bold mb-4 text-dark">Helpdesk Support Tickets</h2>

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
                        <th className="py-3 px-4">Ticket ID</th>
                        <th className="py-3">Title</th>
                        <th className="py-3">Inquiry Message</th>
                        <th className="py-3">Sender Type</th>
                        <th className="py-3">Created At</th>
                        <th className="py-3">Status</th>
                        <th className="py-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tickets.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="text-center text-muted py-5">No support tickets found.</td>
                        </tr>
                      ) : (
                        tickets.map((t) => (
                          <tr key={t.id}>
                            <td className="px-4 text-muted fw-bold">#TKT-{t.id}</td>
                            <td className="fw-semibold text-dark">{t.title}</td>
                            <td style={{ maxWidth: "300px", wordBreak: "break-all" }}>
                              <p className="mb-1 text-dark small">{t.message}</p>
                              {t.replyMessage && (
                                <div className="bg-light p-2 rounded border small mt-1">
                                  <strong className="text-success d-block">Admin Reply:</strong>
                                  <span className="text-muted">{t.replyMessage}</span>
                                </div>
                              )}
                            </td>
                            <td>
                              <span className={`badge ${t.userRole === "VENDOR" ? "bg-primary" : "bg-info"}`}>{t.userRole}</span>
                            </td>
                            <td className="text-muted small">{new Date(t.createdAt).toLocaleString()}</td>
                            <td>
                              <span className={`badge px-3 py-1.5 rounded-pill ${
                                t.status === "RESOLVED" ? "bg-success" : t.status === "PENDING" ? "bg-warning text-dark" : "bg-secondary"
                              }`}>
                                {t.status}
                              </span>
                            </td>
                            <td className="text-center">
                              {t.status === "PENDING" ? (
                                <div className="d-flex justify-content-center gap-2">
                                  <button onClick={() => handleOpenReply(t.id)} className="btn btn-outline-primary btn-sm rounded-pill d-flex align-items-center gap-1">
                                    <FaReply /> Reply
                                  </button>
                                  <button onClick={() => handleCloseTicket(t.id)} className="btn btn-outline-secondary btn-sm rounded-pill d-flex align-items-center gap-1">
                                    <FaCheckCircle /> Close
                                  </button>
                                </div>
                              ) : t.status === "RESOLVED" ? (
                                <button onClick={() => handleCloseTicket(t.id)} className="btn btn-outline-secondary btn-sm rounded-pill">
                                  Close
                                </button>
                              ) : (
                                <span className="text-muted small">Resolved</span>
                              )}
                            </td>
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

      {/* Reply Modal */}
      {replyModal.show && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0">
              <div className="modal-header bg-dark text-white rounded-top-4">
                <h5 className="modal-title fw-bold">Reply to Support Ticket</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setReplyModal({ show: false, ticketId: null, replyMessage: "" })} />
              </div>
              <form onSubmit={handleSaveReply}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted">Message Reply Details</label>
                    <textarea
                      className="form-control rounded-3"
                      rows="4"
                      value={replyModal.replyMessage}
                      onChange={e => setReplyModal({ ...replyModal, replyMessage: e.target.value })}
                      placeholder="Type your response to the reporter here..."
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer border-0 p-3">
                  <button type="button" className="btn btn-secondary rounded-pill px-4" onClick={() => setReplyModal({ show: false, ticketId: null, replyMessage: "" })}>Close</button>
                  <button type="submit" className="btn btn-success rounded-pill px-4 text-white fw-bold">Submit Response</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default ManageTickets;