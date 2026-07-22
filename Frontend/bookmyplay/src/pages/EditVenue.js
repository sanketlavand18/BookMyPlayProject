import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getVenueById, updateVenue } from "../services/venueService";

function EditVenue() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [venue, setVenue] = useState({
        venueName: "",
        sport: "",
        city: "",
        address: "",
        description: "",
        pricePerHour: "",
        imageUrl: ""
    });

    useEffect(() => {
        loadVenue();
    }, []);

    const loadVenue = async () => {
        const response = await getVenueById(id);
        setVenue(response.data);
    };

    const handleChange = (e) => {
        setVenue({
            ...venue,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        await updateVenue(id, venue);

        alert("Venue Updated Successfully");

        navigate("/vendor");
    };

    return (
        <div className="container mt-5">

            <div className="card shadow">

                <div className="card-body">

                    <h2>Edit Venue</h2>

                    <form onSubmit={handleSubmit}>

                        <input
                            className="form-control mb-3"
                            name="venueName"
                            value={venue.venueName}
                            onChange={handleChange}
                        />

                        <input
                            className="form-control mb-3"
                            name="sport"
                            value={venue.sport}
                            onChange={handleChange}
                        />

                        <input
                            className="form-control mb-3"
                            name="city"
                            value={venue.city}
                            onChange={handleChange}
                        />

                        <input
                            className="form-control mb-3"
                            name="address"
                            value={venue.address}
                            onChange={handleChange}
                        />

                        <textarea
                            className="form-control mb-3"
                            name="description"
                            value={venue.description}
                            onChange={handleChange}
                        />

                        <input
                            type="number"
                            className="form-control mb-3"
                            name="pricePerHour"
                            value={venue.pricePerHour}
                            onChange={handleChange}
                        />

                        <input
                            className="form-control mb-3"
                            name="imageUrl"
                            value={venue.imageUrl}
                            onChange={handleChange}
                        />

                        <button className="btn btn-primary">
                            Update Venue
                        </button>

                    </form>

                </div>

            </div>

        </div>
    );
}

export default EditVenue;