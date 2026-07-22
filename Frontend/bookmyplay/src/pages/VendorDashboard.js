import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    getVenuesByVendor,
    deleteVenue
} from "../services/venueService";

function VendorDashboard() {

    const user = JSON.parse(localStorage.getItem("user"));

    const [venues, setVenues] = useState([]);

    useEffect(() => {
        loadVenues();
    }, []);

    const loadVenues = async () => {

        try {

            const response = await getVenuesByVendor(user.id);

            setVenues(response.data);

        } catch (error) {

            console.log(error);

        }

    };

    const handleDelete = async (id) => {

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this venue?"
        );

        if (!confirmDelete) return;

        try {

            await deleteVenue(id);

            alert("Venue Deleted Successfully");

            loadVenues();

        } catch (error) {

            console.log(error);

            alert("Failed to Delete Venue");

        }

    };

    return (

        <div className="container mt-5">

            <h2>Vendor Dashboard</h2>

            <hr />

            <Link
                to="/vendor/add"
                className="btn btn-success mb-3"
            >
                + Add New Venue
            </Link>

            <h4>My Venues</h4>

            <table className="table table-bordered table-hover">

                <thead className="table-dark">

                    <tr>

                        <th>ID</th>
                        <th>Venue</th>
                        <th>City</th>
                        <th>Sport</th>
                        <th>Price</th>
                        <th>Action</th>

                    </tr>

                </thead>

                <tbody>

                    {venues.length > 0 ? (

                        venues.map((venue) => (

                            <tr key={venue.id}>

                                <td>{venue.id}</td>

                                <td>{venue.venueName}</td>

                                <td>{venue.city}</td>

                                <td>{venue.sport}</td>

                                <td>₹{venue.pricePerHour}</td>

                                <td>

                                    <Link
                                        to={`/venue/${venue.id}`}
                                        className="btn btn-info btn-sm me-2"
                                    >
                                        View
                                    </Link>

                                    <Link
                                        to={`/vendor/edit/${venue.id}`}
                                        className="btn btn-warning btn-sm me-2"
                                    >
                                        Edit
                                    </Link>

                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleDelete(venue.id)}
                                    >
                                        Delete
                                    </button>
                                    <Link
    to={`/vendor/slots/${venue.id}`}
    className="btn btn-primary btn-sm ms-2"
>
    Slots
</Link>

                                </td>

                            </tr>

                        ))

                    ) : (

                        <tr>

                            <td colSpan="6" className="text-center">

                                No Venues Found

                            </td>

                        </tr>

                    )}

                </tbody>

            </table>

        </div>

    );

}

export default VendorDashboard;