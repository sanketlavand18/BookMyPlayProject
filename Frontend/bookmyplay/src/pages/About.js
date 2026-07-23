import { FaBullseye, FaEye, FaUsers } from "react-icons/fa";

function About() {
    return (
        <>

            {/* Hero */}

            <section className="bg-success text-white text-center py-5">

                <div className="container">

                    <h1 className="fw-bold">About BookMyPlay</h1>

                    <p className="lead">
                        Making Sports Venue Booking Simple & Smart.
                    </p>

                </div>

            </section>

            {/* Story */}

            <div className="container my-5">

                <div className="row align-items-center">

                    <div className="col-md-6">

                        <img
                            src="https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=900&q=80"
                            className="img-fluid rounded shadow"
                            alt="Sports"
                        />

                    </div>

                    <div className="col-md-6">

                        <h2>Who We Are</h2>

                        <p>
                            BookMyPlay is an online platform where users can
                            discover, book and manage sports venues like Cricket,
                            Football and Badminton courts with ease.
                        </p>

                        <p>
                            Our goal is to connect players with quality sports
                            facilities while helping venue owners manage bookings
                            efficiently.
                        </p>

                    </div>

                </div>

            </div>

            {/* Mission Vision */}

            <div className="container my-5">

                <div className="row">

                    <div className="col-md-4 mb-4">

                        <div className="card shadow h-100 text-center p-4">

                            <FaBullseye size={45} className="text-success mx-auto mb-3"/>

                            <h4>Mission</h4>

                            <p>
                                Simplify sports venue booking for everyone.
                            </p>

                        </div>

                    </div>

                    <div className="col-md-4 mb-4">

                        <div className="card shadow h-100 text-center p-4">

                            <FaEye size={45} className="text-success mx-auto mb-3"/>

                            <h4>Vision</h4>

                            <p>
                                Become India's most trusted sports booking platform.
                            </p>

                        </div>

                    </div>

                    <div className="col-md-4 mb-4">

                        <div className="card shadow h-100 text-center p-4">

                            <FaUsers size={45} className="text-success mx-auto mb-3"/>

                            <h4>Community</h4>

                            <p>
                                Encourage people to play more sports and stay healthy.
                            </p>

                        </div>

                    </div>

                </div>

            </div>

        </>
    );
}

export default About;