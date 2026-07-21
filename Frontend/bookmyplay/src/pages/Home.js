import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllVenues } from "../services/venueService";

function Home() {

    const [venues, setVenues] = useState([]);

    useEffect(() => {

        loadVenues();

    }, []);

    const loadVenues = async () => {

        try {

            const response = await getAllVenues();

            setVenues(response.data);

        } catch (error) {

            console.log(error);

        }

    };

    return (

        <div className="container mt-4">

            <h2 className="mb-4 text-center">

                Available Sports Venues

            </h2>

            <div className="row">

                {venues.map((venue) => (

                    <div className="col-md-4 mb-4" key={venue.id}>

                        <div className="card shadow h-100">

                            <img
                                src={venue.imageUrl}
                                className="card-img-top"
                                alt={venue.venueName}
                                style={{ height: "220px", objectFit: "cover" }}
                            />

                            <div className="card-body">

                                <h4>{venue.venueName}</h4>

                                <p>

                                    <b>Sport :</b> {venue.sport}

                                </p>

                                <p>

                                    <b>City :</b> {venue.city}

                                </p>

                                <p>

                                    <b>Price :</b> ₹{venue.pricePerHour}/Hour

                                </p>

                                <Link
                                    to={`/venue/${venue.id}`}
                                    className="btn btn-success w-100"
                                >

                                    Book Now

                                </Link>

                            </div>

                        </div>

                    </div>

                ))}

            </div>

        </div>

    );

}

export default Home;