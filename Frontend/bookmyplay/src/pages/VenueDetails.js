import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getVenueById } from "../services/venueService";
import "../css/VenueDetails.css";

function VenueDetails() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [venue, setVenue] = useState(null);

    useEffect(() => {
        loadVenue();
    }, []);

    const loadVenue = async () => {
        try {
            const response = await getVenueById(id);
            setVenue(response.data);
        } catch (error) {
            console.log(error);
        }
    };

    if (!venue) {
        return (
            <div className="container text-center mt-5">
                <h2>Loading Venue...</h2>
            </div>
        );
    }

    return (

        <div className="container my-5">

            <div className="card shadow-lg border-0 rounded-4 overflow-hidden">

                <img
                    src={
                        venue.imageUrl
                            ? venue.imageUrl
                            : "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80"
                    }
                    className="card-img-top venue-image"
                    alt={venue.venueName}
                />

                <div className="card-body p-4">

                    <span className="badge bg-success mb-3 fs-6">
                        ✔ Verified Venue
                    </span>

                    <h2 className="fw-bold mb-3">
                        {venue.venueName}
                    </h2>

                    <hr />

                    <div className="row">

                        <div className="col-md-6">

                            <p>
                                <strong>🏏 Sport :</strong>{" "}
                                {venue.category?.categoryName}
                            </p>

                            <p>
                                <strong>📍 City :</strong>{" "}
                                {venue.city}
                            </p>

                            <p>
                                <strong>🏠 Address :</strong>{" "}
                                {venue.address}
                            </p>

                        </div>

                        <div className="col-md-6">

                            <p>
                                <strong>⏱ Slot Duration :</strong>{" "}
                                {venue.slotDuration} Minutes
                            </p>

                            <h3 className="text-success fw-bold">

                                ₹ {venue.pricePerHour} / Hour

                            </h3>

                        </div>

                    </div>

                    <hr />

                    <h4>Description</h4>

                    <p className="text-muted">

                        {venue.description}

                    </p>

                    <button
                        className="btn btn-success btn-lg mt-3 px-5"
                        onClick={() => navigate(`/booking/${venue.id}`)}
                    >
                        Book Now
                    </button>

                </div>

            </div>

            {/* Reviews */}

            <div className="card shadow border-0 rounded-4 mt-4">

                <div className="card-body">

                    <h3 className="mb-4">
                        User Reviews
                    </h3>

                    {
                        venue.reviews && venue.reviews.length > 0 ?

                            venue.reviews.map((review) => (

                                <div
                                    key={review.id}
                                    className="border-bottom pb-3 mb-3"
                                >

                                    <h5>

                                        ⭐ {review.rating}/5

                                    </h5>

                                    <p className="mb-1">

                                        {review.comment}

                                    </p>

                                </div>

                            ))

                            :

                            <p className="text-muted">

                                No Reviews Yet.

                            </p>

                    }

                </div>

            </div>

        </div>

    );

}

export default VenueDetails;