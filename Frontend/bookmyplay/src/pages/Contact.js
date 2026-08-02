import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaLinkedin,
  FaWhatsapp,
  FaSpinner
} from "react-icons/fa";

function Contact() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/contact-settings");
      setSettings(res.data);
    } catch (e) {
      console.error("Error loading contact settings:", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <FaSpinner className="spinner-border text-primary fs-2" role="status" />
        <h4 className="mt-3 text-muted">Loading contact details...</h4>
      </div>
    );
  }

  const s = settings || {};

  return (
    <>

      {/* Header Banner */}
      <div className="bg-dark text-white py-5 text-center position-relative mb-5" style={{ background: "linear-gradient(135deg, #1e3a8a, #111827)" }}>
        <div className="container position-relative py-3">
          <span className="badge bg-success-subtle text-success px-3 py-2 rounded-pill small text-uppercase mb-2">Get In Touch</span>
          <h1 className="display-4 fw-bold">{s.companyName || "BookMyPlay"}</h1>
          <p className="lead opacity-75 max-w-2xl mx-auto">We are here to support your bookings, turf registrations, and query responses.</p>
        </div>
      </div>

      <div className="container pb-5">
        <div className="row g-5">
          
          {/* Channels column */}
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm p-4 rounded-4 bg-white mb-4">
              <h3 className="fw-bold mb-4 text-dark border-bottom pb-2">Direct Contact Channels</h3>

              <div className="d-flex align-items-start gap-3 mb-4">
                <div className="bg-primary-subtle text-primary rounded p-3 fs-4">
                  <FaPhoneAlt />
                </div>
                <div>
                  <h6 className="fw-bold text-muted mb-1 text-uppercase small">Call Us</h6>
                  <span className="fs-5 fw-bold text-dark">{s.phone}</span>
                </div>
              </div>

              <div className="d-flex align-items-start gap-3 mb-4">
                <div className="bg-success-subtle text-success rounded p-3 fs-4">
                  <FaWhatsapp />
                </div>
                <div>
                  <h6 className="fw-bold text-muted mb-1 text-uppercase small">WhatsApp Support</h6>
                  <span className="fs-5 fw-bold text-dark">{s.whatsAppNumber}</span>
                </div>
              </div>

              <div className="d-flex align-items-start gap-3 mb-4">
                <div className="bg-info-subtle text-info rounded p-3 fs-4">
                  <FaEnvelope />
                </div>
                <div>
                  <h6 className="fw-bold text-muted mb-1 text-uppercase small">Email Inquiries</h6>
                  <span className="fs-5 fw-bold text-dark d-block">{s.email}</span>
                  <span className="small text-muted d-block">Support: {s.supportEmail}</span>
                </div>
              </div>

              <div className="d-flex align-items-start gap-3 mb-4">
                <div className="bg-warning-subtle text-warning rounded p-3 fs-4">
                  <FaClock />
                </div>
                <div>
                  <h6 className="fw-bold text-muted mb-1 text-uppercase small">Business Operating Hours</h6>
                  <span className="fs-5 fw-bold text-dark">{s.businessHours}</span>
                </div>
              </div>

            </div>
          </div>

          {/* Location & Social column */}
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm p-4 rounded-4 bg-white h-100">
              <h3 className="fw-bold mb-4 text-dark border-bottom pb-2">Office Headquarters</h3>
              
              <div className="d-flex align-items-start gap-3 mb-4">
                <div className="bg-danger-subtle text-danger rounded p-3 fs-4">
                  <FaMapMarkerAlt />
                </div>
                <div>
                  <h6 className="fw-bold text-muted mb-1 text-uppercase small">Office Location</h6>
                  <p className="fs-5 text-dark mb-0">{s.officeAddress}</p>
                </div>
              </div>

              {s.googleMapsLocation && (
                <div className="rounded-3 border overflow-hidden mb-4" style={{ height: "200px", background: "#f3f4f6" }}>
                  {/* Embedded static fallback or navigate link */}
                  <div className="d-flex flex-column align-items-center justify-content-center h-100 p-3 text-center">
                    <FaMapMarkerAlt className="text-danger fs-2 mb-2" />
                    <span className="small fw-bold text-dark mb-1">Located Coordinates: {s.googleMapsLocation}</span>
                    <a
                      href={`https://www.google.com/maps?q=${s.googleMapsLocation}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary btn-sm rounded-pill mt-2"
                    >
                      View on Google Maps
                    </a>
                  </div>
                </div>
              )}

              <hr />

              <h5 className="fw-bold text-muted mb-3">Connect With Us</h5>
              <div className="d-flex gap-3">
                {s.facebookUrl && (
                  <a href={s.facebookUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: "42px", height: "42px" }}>
                    <FaFacebook />
                  </a>
                )}
                {s.instagramUrl && (
                  <a href={s.instagramUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline-danger rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: "42px", height: "42px" }}>
                    <FaInstagram />
                  </a>
                )}
                {s.twitterUrl && (
                  <a href={s.twitterUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline-dark rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: "42px", height: "42px" }}>
                    <FaTwitter />
                  </a>
                )}
                {s.linkedinUrl && (
                  <a href={s.linkedinUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline-info rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: "42px", height: "42px" }}>
                    <FaLinkedin />
                  </a>
                )}
              </div>

            </div>
          </div>

        </div>
      </div>

    </>
  );
}

export default Contact;