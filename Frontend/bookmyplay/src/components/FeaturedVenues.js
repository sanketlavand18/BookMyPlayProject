
import { Link } from "react-router-dom";

function FeaturedVenues() {

    const venues = [

        {
            id: 1,
            name: "Elite Cricket Turf",
            location: "Pune",
            rating: "4.8",
            price: "₹800 / Hour",
            image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97?w=600"
        },

        {
            id: 2,
            name: "Football Arena",
            location: "Mumbai",
            rating: "4.7",
            price: "₹1000 / Hour",
            image: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=600"
        },

        {
            id: 3,
            name: "Badminton Court",
            location: "Nashik",
            rating: "4.9",
            price: "₹500 / Hour",
            image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600"
        }

    ];

    return (

        <section className="container py-5">

            <h2 className="text-center fw-bold mb-5">
                Featured Venues
            </h2>

            <div className="row">

                {venues.map((venue) => (

                    <div className="col-lg-4 mb-4" key={venue.id}>

                        <div className="card shadow-lg border-0 h-100">

                            <img
                                src={venue.image}
                                className="card-img-top"
                                alt={venue.name}
                                style={{ height: "220px", objectFit: "cover" }}
                            />

                            <div className="card-body">

                                <h4>{venue.name}</h4>

                                <p>📍 {venue.location}</p>

                                <p>⭐ {venue.rating}</p>

                                <h5 className="text-success">
                                    {venue.price}
                                </h5>

                                <Link
                                    to="/booking"
                                    className="btn btn-success w-100"
                                >
                                    Book Now
                                </Link>

                            </div>

                        </div>

                    </div>

                ))}

            </div>

        </section>

    );
}

export default FeaturedVenues;