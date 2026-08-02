import { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../components/AdminSidebar";
import AdminNavbar from "../../components/AdminNavbar";
import { FaCalendarAlt, FaChevronLeft, FaChevronRight, FaSpinner } from "react-icons/fa";

function BookingCalendar() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8080/api/admin/bookings");
      setBookings(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const dayElements = [];

    // Fill blank slots for previous month padding
    for (let i = 0; i < firstDay; i++) {
      dayElements.push(<div className="col border p-3 bg-light text-muted" style={{ minHeight: "100px" }} key={`empty-${i}`}></div>);
    }

    // Fill days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const dayBookings = bookings.filter(b => b.bookingDate === dateStr);

      dayElements.push(
        <div className="col border p-2 bg-white" style={{ minHeight: "110px", width: "14.28%" }} key={`day-${day}`}>
          <div className="d-flex justify-content-between align-items-center mb-1">
            <span className="fw-bold text-dark small">{day}</span>
            {dayBookings.length > 0 && <span className="badge bg-dark rounded-circle">{dayBookings.length}</span>}
          </div>
          <div className="d-flex flex-column gap-1 overflow-auto" style={{ maxHeight: "70px" }}>
            {dayBookings.map((b) => (
              <span
                key={b.id}
                className={`badge text-start small font-monospace truncate ${
                  b.bookingStatus === "CONFIRMED" ? "bg-success text-white" : "bg-danger text-white"
                }`}
                style={{ fontSize: "0.65rem", cursor: "pointer", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                title={`${b.venue?.venueName} (${b.startTime}-${b.endTime})`}
              >
                {b.startTime} {b.venue?.venueName}
              </span>
            ))}
          </div>
        </div>
      );
    }

    return dayElements;
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

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
              <h2 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                <FaCalendarAlt className="text-secondary" /> Bookings Calendar Ledger
              </h2>
              
              {/* Navigation controls */}
              <div className="d-flex align-items-center gap-3 bg-white p-2 rounded-pill shadow-sm border">
                <button className="btn btn-outline-dark btn-sm rounded-circle" onClick={handlePrevMonth}><FaChevronLeft /></button>
                <h5 className="fw-bold mb-0 px-2 text-dark" style={{ minWidth: "150px", textAlign: "center" }}>
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h5>
                <button className="btn btn-outline-dark btn-sm rounded-circle" onClick={handleNextMonth}><FaChevronRight /></button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <FaSpinner className="spinner-border text-primary fs-2" role="status" />
              </div>
            ) : (
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white p-4">
                
                {/* Weekdays names */}
                <div className="row text-center fw-bold text-muted border-bottom pb-2 mb-2" style={{ fontSize: "0.85rem" }}>
                  <div className="col">Sun</div>
                  <div className="col">Mon</div>
                  <div className="col">Tue</div>
                  <div className="col">Wed</div>
                  <div className="col">Thu</div>
                  <div className="col">Fri</div>
                  <div className="col">Sat</div>
                </div>

                {/* Calendar grid */}
                <div className="row row-cols-7 g-0 border-top border-start">
                  {renderCalendarDays()}
                </div>

              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

export default BookingCalendar;