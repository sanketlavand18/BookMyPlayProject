import { useEffect, useState } from "react";
import { getMyBookings } from "../services/bookingService";

function MyBookings() {

    const user = JSON.parse(localStorage.getItem("user"));

    const [bookings, setBookings] = useState([]);

    useEffect(() => {

        loadBookings();

    }, []);

    const loadBookings = async () => {

        try {

            const response = await getMyBookings(user.id);

            setBookings(response.data);

        } catch (error) {

            console.log(error);

        }

    };

    return (

        <div className="container mt-5">

            <h2 className="mb-4">My Bookings</h2>

            <table className="table table-bordered table-hover">

                <thead className="table-dark">

                    <tr>

                        <th>ID</th>

                        <th>Venue</th>

                        <th>Date</th>

                        <th>Start</th>

                        <th>End</th>

                        <th>Price</th>

                        <th>Status</th>

                    </tr>

                </thead>

                <tbody>

                    {bookings.map((booking) => (

                        <tr key={booking.id}>

                            <td>{booking.id}</td>

                            <td>{booking.venueId}</td>

                            <td>{booking.bookingDate}</td>

                            <td>{booking.startTime}</td>

                            <td>{booking.endTime}</td>

                            <td>₹{booking.totalPrice}</td>

                            <td>{booking.bookingStatus}</td>

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>

    );

}

export default MyBookings;