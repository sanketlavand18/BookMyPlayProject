import { Link } from "react-router-dom";
import { FaFacebook, FaInstagram, FaLinkedin, FaGithub } from "react-icons/fa";
import "../css/Footer.css";

function Footer() {
    return (
        <footer className="footer">

            <div className="container">

                <div className="row">

                    <div className="col-md-4 mb-4">

                        <h3 className="text-success fw-bold">
                            BookMyPlay
                        </h3>

                        <p>
                            Book sports venues easily and enjoy your favorite
                            games with friends anytime, anywhere.
                        </p>

                    </div>

                    <div className="col-md-2 mb-4">

                        <h5>Quick Links</h5>

                        <ul className="list-unstyled">

                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/about">About</Link></li>
                            <li><Link to="/booking">Booking</Link></li>
                            <li><Link to="/contact">Contact</Link></li>

                        </ul>

                    </div>

                    <div className="col-md-3 mb-4">

                        <h5>Support</h5>

                        <p>Email : support@bookmyplay.com</p>

                        <p>Phone : +91 9876543210</p>

                    </div>

                    <div className="col-md-3 mb-4">

                        <h5>Follow Us</h5>

                        <div className="social-icons">

                            <FaFacebook />

                            <FaInstagram />

                            <FaLinkedin />

                            <FaGithub />

                        </div>

                    </div>

                </div>

                <hr />

                <div className="text-center">

                    © 2026 BookMyPlay. All Rights Reserved.

                </div>

            </div>

        </footer>
    );
}

export default Footer;