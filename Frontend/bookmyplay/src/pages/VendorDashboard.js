import { useEffect, useState } from "react";
import { getVenuesByVendor } from "../services/venueService";
import { Link } from "react-router-dom";

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

    <table className="table table-bordered">

        <thead className="table-dark">
            <tr>
                <th>ID</th>
                <th>Venue</th>
                <th>City</th>
                <th>Sport</th>
                <th>Price</th>
            </tr>
        </thead>

        <tbody>

        {venues.map((venue)=>(
            <tr key={venue.id}>
                <td>{venue.id}</td>
                <td>{venue.venueName}</td>
                <td>{venue.city}</td>
                <td>{venue.sport}</td>
                <td>₹{venue.pricePerHour}</td>
            </tr>
        ))}

        </tbody>

    </table>

</div>

);
}

export default VendorDashboard;