import { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../components/AdminSidebar";

function ManageBookings() {

    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = () => {
        axios
            .get("http://localhost:8080/api/admin/bookings")
            .then(res => setBookings(res.data))
            .catch(err => console.log(err));
    };

    return (

        <div className="container-fluid">

            <div className="row">

                <div className="col-md-2 p-0">
                    <AdminSidebar />
                </div>

                <div className="col-md-10 p-4">

                    <h2 className="mb-4">Manage Bookings</h2>

                    <table className="table table-bordered table-hover">

                        <thead className="table-dark">

                            <tr>

                                <th>ID</th>
                                <th>User ID</th>
                                <th>Venue ID</th>
                                <th>Date</th>
                                <th>Amount</th>
                                <th>Status</th>

                            </tr>

                        </thead>

                       <tbody>

{bookings.map((booking) => (

<tr key={booking.id}>

    <td>{booking.id}</td>

    <td>{booking.userId}</td>

    <td>{booking.venueId}</td>

    <td>{booking.bookingDate}</td>

    <td>₹ {booking.totalPrice}</td>

    <td>{booking.bookingStatus}</td>

</tr>

))}

</tbody>
                    </table>

                </div>

            </div>

        </div>

    );

}

export default ManageBookings;