import React from "react";
import { Link } from "react-router-dom";
import {
  FaBullseye,
  FaEye,
  FaUsers,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaHeadphones,
  FaBolt,
  FaShieldAlt,
  FaCreditCard,
  FaClock,
  FaStar,
  FaCog,
  FaFutbol,
  FaBasketballBall,
  FaVolleyballBall
} from "react-icons/fa";
import { GiCricketBat, GiTennisRacket } from "react-icons/gi";
import "./About.css";

function About() {
  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero text-white text-center d-flex align-items-center">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 about-hero-content">
              <span className="badge bg-white text-success px-3 py-2 rounded-pill fw-bold mb-3 shadow-sm">
                About Us
              </span>
              <h1 className="display-4 fw-extrabold mb-3">About BookMyPlay</h1>
              <p className="lead fw-semibold mb-4 text-light-green">
                India's Smart Sports Venue Booking Platform
              </p>
              <p className="fs-5 text-light opacity-90 lh-base">
                BookMyPlay is a modern online platform that allows users to discover, compare, and instantly book sports venues such as cricket turfs, football grounds, badminton courts, tennis courts, basketball courts, and more.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Who We Are Section */}
      <section className="who-we-are-section">
        <div className="container">
          <div className="row justify-content-center text-center">
            <div className="col-lg-9">
              <h2 className="section-title">Who We Are</h2>
              <p className="fs-5 text-muted leading-relaxed mt-3">
                BookMyPlay connects sports enthusiasts with trusted venue owners through a seamless online booking platform. Our goal is to simplify sports venue discovery, enable real-time slot booking, and help venue owners efficiently manage their facilities and reservations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="stats-section">
        <div className="container">
          <div className="row g-4">
            {/* Stat 1 */}
            <div className="col-md-6 col-lg-3">
              <div className="about-card stat-card">
                <div className="stat-icon-wrapper">
                  <FaMapMarkerAlt />
                </div>
                <h3 className="stat-number">50+</h3>
                <p className="stat-desc">Sports Venues</p>
              </div>
            </div>
            {/* Stat 2 */}
            <div className="col-md-6 col-lg-3">
              <div className="about-card stat-card">
                <div className="stat-icon-wrapper">
                  <FaUsers />
                </div>
                <h3 className="stat-number">500+</h3>
                <p className="stat-desc">Happy Players</p>
              </div>
            </div>
            {/* Stat 3 */}
            <div className="col-md-6 col-lg-3">
              <div className="about-card stat-card">
                <div className="stat-icon-wrapper">
                  <FaCheckCircle />
                </div>
                <h3 className="stat-number">1000+</h3>
                <p className="stat-desc">Bookings Completed</p>
              </div>
            </div>
            {/* Stat 4 */}
            <div className="col-md-6 col-lg-3">
              <div className="about-card stat-card">
                <div className="stat-icon-wrapper">
                  <FaHeadphones />
                </div>
                <h3 className="stat-number">24/7</h3>
                <p className="stat-desc">Customer Support</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose BookMyPlay Section */}
      <section className="features-section">
        <div className="container">
          <div className="row justify-content-center text-center mb-5">
            <div className="col-lg-8">
              <h2 className="section-title">Why Choose BookMyPlay</h2>
              <p className="text-muted mt-2">
                We are committed to delivering the ultimate sports booking experience for players and venue partners alike.
              </p>
            </div>
          </div>
          <div className="row g-4">
            {/* Feature 1 */}
            <div className="col-md-6 col-lg-4">
              <div className="about-card feature-card">
                <FaBolt className="feature-icon" />
                <h4 className="feature-title">Instant Booking</h4>
                <p className="feature-text">
                  Confirm your slots instantly without any back-and-forth hassles.
                </p>
              </div>
            </div>
            {/* Feature 2 */}
            <div className="col-md-6 col-lg-4">
              <div className="about-card feature-card">
                <FaShieldAlt className="feature-icon" />
                <h4 className="feature-title">Verified Venues</h4>
                <p className="feature-text">
                  Play only at quality venues verified by our team for safety and standards.
                </p>
              </div>
            </div>
            {/* Feature 3 */}
            <div className="col-md-6 col-lg-4">
              <div className="about-card feature-card">
                <FaCreditCard className="feature-icon" />
                <h4 className="feature-title">Secure Payments</h4>
                <p className="feature-text">
                  Make secure online payments with a wide range of supported options.
                </p>
              </div>
            </div>
            {/* Feature 4 */}
            <div className="col-md-6 col-lg-4">
              <div className="about-card feature-card">
                <FaClock className="feature-icon" />
                <h4 className="feature-title">Real-Time Slot Availability</h4>
                <p className="feature-text">
                  Check available time slots in real-time before making a booking.
                </p>
              </div>
            </div>
            {/* Feature 5 */}
            <div className="col-md-6 col-lg-4">
              <div className="about-card feature-card">
                <FaStar className="feature-icon" />
                <h4 className="feature-title">Reviews & Ratings</h4>
                <p className="feature-text">
                  Read honest feedback from fellow players to select the best venue.
                </p>
              </div>
            </div>
            {/* Feature 6 */}
            <div className="col-md-6 col-lg-4">
              <div className="about-card feature-card">
                <FaCog className="feature-icon" />
                <h4 className="feature-title">Easy Venue Management</h4>
                <p className="feature-text">
                  Empowering venue owners with simple tools to track reservations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Services Section */}
      <section className="services-section">
        <div className="container">
          <div className="row justify-content-center text-center mb-5">
            <div className="col-lg-8">
              <h2 className="section-title">Our Services</h2>
              <p className="text-muted mt-2">
                Discover and book courts for your favorite sport and get playing.
              </p>
            </div>
          </div>
          <div className="row g-4 row-cols-2 row-cols-md-3 row-cols-lg-6 justify-content-center">
            {/* Sport 1: Cricket */}
            <div className="col">
              <div className="about-card sport-card">
                <div className="sport-icon-wrapper">
                  <GiCricketBat />
                </div>
                <h5 className="sport-title">Cricket</h5>
              </div>
            </div>
            {/* Sport 2: Football */}
            <div className="col">
              <div className="about-card sport-card">
                <div className="sport-icon-wrapper">
                  <FaFutbol />
                </div>
                <h5 className="sport-title">Football</h5>
              </div>
            </div>
            {/* Sport 3: Badminton */}
            <div className="col">
              <div className="about-card sport-card">
                <div className="sport-icon-wrapper">
                  <GiTennisRacket />
                </div>
                <h5 className="sport-title">Badminton</h5>
              </div>
            </div>
            {/* Sport 4: Basketball */}
            <div className="col">
              <div className="about-card sport-card">
                <div className="sport-icon-wrapper">
                  <FaBasketballBall />
                </div>
                <h5 className="sport-title">Basketball</h5>
              </div>
            </div>
            {/* Sport 5: Tennis */}
            <div className="col">
              <div className="about-card sport-card">
                <div className="sport-icon-wrapper">
                  <GiTennisRacket />
                </div>
                <h5 className="sport-title">Tennis</h5>
              </div>
            </div>
            {/* Sport 6: Volleyball */}
            <div className="col">
              <div className="about-card sport-card">
                <div className="sport-icon-wrapper">
                  <FaVolleyballBall />
                </div>
                <h5 className="sport-title">Volleyball</h5>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Vision Community Section */}
      <section className="mv-section">
        <div className="container">
          <div className="row g-4">
            {/* Mission */}
            <div className="col-lg-4">
              <div className="about-card mv-card">
                <div className="mv-icon-wrapper">
                  <FaBullseye />
                </div>
                <h3 className="mv-card-title">Mission</h3>
                <p className="mv-card-text">
                  Make sports accessible through fast and reliable venue booking.
                </p>
              </div>
            </div>
            {/* Vision */}
            <div className="col-lg-4">
              <div className="about-card mv-card">
                <div className="mv-icon-wrapper">
                  <FaEye />
                </div>
                <h3 className="mv-card-title">Vision</h3>
                <p className="mv-card-text">
                  Become India's most trusted sports venue booking platform.
                </p>
              </div>
            </div>
            {/* Community */}
            <div className="col-lg-4">
              <div className="about-card mv-card">
                <div className="mv-icon-wrapper">
                  <FaUsers />
                </div>
                <h3 className="mv-card-title">Community</h3>
                <p className="mv-card-text">
                  Encourage healthy lifestyles by making sports more accessible.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call To Action Section */}
      <section className="cta-section text-center">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <h2 className="cta-title">Ready to Play?</h2>
              <p className="cta-text">
                Find and book your favorite sports venue in just a few clicks.
              </p>
              <Link to="/" className="cta-btn">
                Explore Venues
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;
