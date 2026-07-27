import { FaMapMarkerAlt, FaStar } from "react-icons/fa";
import { Link } from "react-router-dom";

function VenueCard({ venue }) {
  const getImageUrl = (path) => {
    if (!path) return "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1000&q=80";
    if (path.startsWith("http")) return path;
    return `http://localhost:8080${path}`;
  };

  return (

    <div className="card shadow h-100">

      <img
        src={getImageUrl(venue.imageUrl || venue.image)}
        className="card-img-top"
        alt={venue.venueName || venue.name}
        style={{ height: "220px", objectFit: "cover" }}
      />

      <div className="card-body">

        <h5>{venue.venueName || venue.name}</h5>

        <p className="mb-2 text-muted">

          <FaMapMarkerAlt className="text-danger me-2"/>

          {venue.city}

        </p>

        <p className="mb-2">

          Sport : <span className="badge bg-secondary">{venue.category?.categoryName || venue.sport}</span>

        </p>

        <h5 className="text-success mb-3">

          ₹{venue.pricePerHour || venue.price} / Hour

        </h5>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <FaStar className="text-warning me-1"/>
            <span>4.8</span>
          </div>
          {venue.openTime && (
            <span className="small text-muted">⏰ {venue.openTime} - {venue.closeTime}</span>
          )}
        </div>

        <Link
          to={`/venue/${venue.id}`}
          className="btn btn-success w-100"
        >
          View Details
        </Link>

      </div>

    </div>

  );

}

export default VenueCard;