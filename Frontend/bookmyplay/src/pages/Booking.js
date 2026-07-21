import { useState } from "react";
import { useParams } from "react-router-dom";
import { createBooking } from "../services/bookingService";

function Booking() {

    const { id } = useParams();

    const user = JSON.parse(localStorage.getItem("user"));

    const [booking, setBooking] = useState({

        userId: user.id,

        venueId: Number(id),

        bookingDate: "",

        startTime: "",

        endTime: "",

        totalPrice: 1200

    });

    const handleChange = (e) => {

        setBooking({
            ...booking,
            [e.target.name]: e.target.value
        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            const response = await createBooking(booking);

            alert(response.data);

        } catch (error) {

            alert(error.response?.data || "Booking Failed");

        }

    };

    return (

        <div className="container mt-5">

            <div className="card shadow">

                <div className="card-body">

                    <h2>Book Venue</h2>

                    <form onSubmit={handleSubmit}>

                        <label>Date</label>

                        <input
                            type="date"
                            className="form-control mb-3"
                            name="bookingDate"
                            onChange={handleChange}
                        />

                        <label>Start Time</label>

                        <input
                            type="time"
                            className="form-control mb-3"
                            name="startTime"
                            onChange={handleChange}
                        />

                        <label>End Time</label>

                        <input
                            type="time"
                            className="form-control mb-3"
                            name="endTime"
                            onChange={handleChange}
                        />

                        <button className="btn btn-success">

                            Confirm Booking

                        </button>

                    </form>

                </div>

            </div>

        </div>

    );

}

export default Booking;