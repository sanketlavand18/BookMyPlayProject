import { Link } from "react-router-dom";

function HeroSection() {
    return (
        <section className="bg-success text-white py-5">
            <div className="container">

                <div className="row align-items-center">

                    <div className="col-lg-6">

                        <h1 className="display-4 fw-bold">
                            Book Your Favorite Sports Venue
                        </h1>

                        <p className="lead mt-3">
                            Cricket • Football • Badminton • Tennis • Basketball
                        </p>

                        <p>
                            Find nearby sports venues, choose your slot,
                            and book instantly.
                        </p>

                        <Link to="/booking" className="btn btn-light btn-lg mt-3">
                            Book Now
                        </Link>

                    </div>

                    <div className="col-lg-6 text-center">

                        <img
                            src="https://images.unsplash.com/photo-1517649763962-0c623066013b?w=700"
                            alt="Sports"
                            className="img-fluid rounded shadow"
                        />

                    </div>

                </div>

            </div>
        </section>
    );
}

export default HeroSection;