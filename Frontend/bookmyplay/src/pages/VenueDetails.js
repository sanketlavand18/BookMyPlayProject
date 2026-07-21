import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getVenueById } from "../services/venueService";

function VenueDetails() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [venue, setVenue] = useState(null);

    useEffect(() => {
        loadVenue();
    }, []);

    const loadVenue = async () => {

        const response = await getVenueById(id);

        setVenue(response.data);

    };

    if (!venue) {

        return <h2 className="text-center mt-5">Loading...</h2>;

    }

    return (

        <div className="container mt-5">

            <div className="card shadow">

                <img
                    src={venue.imageUrl}
                    className="card-img-top"
                    style={{height:"350px",objectFit:"cover"}}
                    alt=""
                />

                <div className="card-body">

                    <h2>{venue.venueName}</h2>

                    <hr/>

                    <p><b>Sport :</b> {venue.sport}</p>

                    <p><b>City :</b> {venue.city}</p>

                    <p><b>Address :</b> {venue.address}</p>

                    <p>{venue.description}</p>

                    <h3 className="text-success">

                        ₹{venue.pricePerHour}/Hour

                    </h3>

                    <button
                        className="btn btn-success"
                        onClick={() => navigate(`/booking/${venue.id}`)}
                    >

                        Book Now

                    </button>

                </div>

            </div>

        </div>

    );

}

export default VenueDetails;