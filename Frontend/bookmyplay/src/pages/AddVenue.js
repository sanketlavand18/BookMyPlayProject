import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addVenue } from "../services/venueService";

function AddVenue() {

    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user"));

    const [venue, setVenue] = useState({

        vendorId: user.id,
        venueName: "",
        sport: "",
        city: "",
        address: "",
        description: "",
        pricePerHour: "",
        imageUrl: ""

    });

    const handleChange = (e) => {

        setVenue({
            ...venue,
            [e.target.name]: e.target.value
        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            const response = await addVenue(venue);

            alert(response.data);

            navigate("/vendor");

        } catch (error) {

            alert("Failed to Add Venue");

        }

    };

    return (

        <div className="container mt-5">

            <div className="card shadow">

                <div className="card-body">

                    <h2>Add Venue</h2>

                    <form onSubmit={handleSubmit}>

                        <input
                            className="form-control mb-3"
                            placeholder="Venue Name"
                            name="venueName"
                            onChange={handleChange}
                        />

                        <input
                            className="form-control mb-3"
                            placeholder="Sport"
                            name="sport"
                            onChange={handleChange}
                        />

                        <input
                            className="form-control mb-3"
                            placeholder="City"
                            name="city"
                            onChange={handleChange}
                        />

                        <input
                            className="form-control mb-3"
                            placeholder="Address"
                            name="address"
                            onChange={handleChange}
                        />

                        <textarea
                            className="form-control mb-3"
                            placeholder="Description"
                            name="description"
                            onChange={handleChange}
                        />

                        <input
                            type="number"
                            className="form-control mb-3"
                            placeholder="Price Per Hour"
                            name="pricePerHour"
                            onChange={handleChange}
                        />

                        <input
                            className="form-control mb-3"
                            placeholder="Image URL"
                            name="imageUrl"
                            onChange={handleChange}
                        />

                        <button className="btn btn-success">

                            Add Venue

                        </button>

                    </form>

                </div>

            </div>

        </div>

    );

}

export default AddVenue;
