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

    <div className="container my-5">

        <div className="row justify-content-center">

            <div className="col-lg-8">

                <div className="card shadow-lg border-0 rounded-4">

                    <div className="card-header bg-success text-white text-center py-3">

                        <h2 className="mb-0">
                            Book Your Venue
                        </h2>

                    </div>

                    <div className="card-body p-4">

                        <div className="alert alert-info">

                            <h5 className="mb-1">Booking Information</h5>

                            <p className="mb-0">
                                Please select your booking date and time carefully.
                            </p>

                        </div>

                        <form onSubmit={handleSubmit}>

                            <div className="mb-3">

                                <label className="form-label fw-bold">
                                    📅 Booking Date
                                </label>

                                <input
                                    type="date"
                                    className="form-control"
                                    name="bookingDate"
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                            <div className="row">

                                <div className="col-md-6 mb-3">

                                    <label className="form-label fw-bold">
                                        🕒 Start Time
                                    </label>

                                    <input
                                        type="time"
                                        className="form-control"
                                        name="startTime"
                                        onChange={handleChange}
                                        required
                                    />

                                </div>

                                <div className="col-md-6 mb-3">

                                    <label className="form-label fw-bold">
                                        🕒 End Time
                                    </label>

                                    <input
                                        type="time"
                                        className="form-control"
                                        name="endTime"
                                        onChange={handleChange}
                                        required
                                    />

                                </div>

                            </div>

                            <hr />

                            <div className="card bg-light mb-4">

                                <div className="card-body">

                                    <h5>Booking Summary</h5>

                                    <p>
                                        <strong>User ID :</strong> {user.id}
                                    </p>

                                    <p>
                                        <strong>Venue ID :</strong> {booking.venueId}
                                    </p>

                                    <p>
                                        <strong>Total Price :</strong>

                                        <span className="text-success fw-bold">
                                            ₹ {booking.totalPrice}
                                        </span>

                                    </p>

                                </div>

                            </div>

                            <button
                                type="submit"
                                className="btn btn-success btn-lg w-100"
                            >

                                Confirm Booking

                            </button>

                        </form>

                    </div>

                </div>

            </div>

        </div>

    </div>

);
}
export default Booking;