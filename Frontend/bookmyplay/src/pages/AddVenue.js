import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { addVenue } from "../services/venueService";
import { getAllCategories } from "../services/categoryService";

function AddVenue() {

    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user"));

    const [categories, setCategories] = useState([]);

    const [venue, setVenue] = useState({

        vendorId: user.id,
        venueName: "",
        categoryId: "",
        city: "",
        address: "",
        description: "",
        pricePerHour: "",
        imageUrl: "",
        slotDuration: ""

    });

    useEffect(() => {

        loadCategories();

    }, []);

    const loadCategories = async () => {

        try {

            const response = await getAllCategories();
            setCategories(response.data);

        } catch (error) {

            console.log(error);

        }

    };

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

            console.log(error);

            alert("Failed to Add Venue");

        }

    };

    return (

        <div className="container mt-5">

            <div className="card shadow">

                <div className="card-body">

                    <h2 className="mb-4">Add Venue</h2>

                    <form onSubmit={handleSubmit}>

                        <input
                            className="form-control mb-3"
                            placeholder="Venue Name"
                            name="venueName"
                            value={venue.venueName}
                            onChange={handleChange}
                            required
                        />

                        {/* Category Dropdown */}

                        <select
                            className="form-control mb-3"
                            name="categoryId"
                            value={venue.categoryId}
                            onChange={handleChange}
                            required
                        >

                            <option value="">

                                Select Category

                            </option>

                            {

                                categories.map(category => (

                                    <option
                                        key={category.id}
                                        value={category.id}
                                    >

                                        {category.categoryName}

                                    </option>

                                ))

                            }

                        </select>

                        <input
                            className="form-control mb-3"
                            placeholder="City"
                            name="city"
                            value={venue.city}
                            onChange={handleChange}
                            required
                        />

                        <input
                            className="form-control mb-3"
                            placeholder="Address"
                            name="address"
                            value={venue.address}
                            onChange={handleChange}
                            required
                        />

                        <textarea
                            className="form-control mb-3"
                            placeholder="Description"
                            name="description"
                            value={venue.description}
                            onChange={handleChange}
                        />

                        <input
                            type="number"
                            className="form-control mb-3"
                            placeholder="Price Per Hour"
                            name="pricePerHour"
                            value={venue.pricePerHour}
                            onChange={handleChange}
                            required
                        />

                        <input
                            className="form-control mb-3"
                            placeholder="Image URL"
                            name="imageUrl"
                            value={venue.imageUrl}
                            onChange={handleChange}
                        />

                        <input
                            type="number"
                            className="form-control mb-3"
                            placeholder="Slot Duration (Minutes)"
                            name="slotDuration"
                            value={venue.slotDuration}
                            onChange={handleChange}
                        />

                        <button
                            className="btn btn-success w-100"
                            type="submit"
                        >

                            Add Venue

                        </button>

                    </form>

                </div>

            </div>

        </div>

    );

}

export default AddVenue;