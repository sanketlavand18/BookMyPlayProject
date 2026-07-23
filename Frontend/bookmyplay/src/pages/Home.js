import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllVenues } from "../services/venueService";
import "../css/Home.css";
import CategorySection from "../components/CategorySection";
import SearchSection from "../components/SearchSection";
import WhyChooseUs from "../components/WhyChooseUs";
import Statistics from "../components/Statistics";



function Home() {

    const [venues, setVenues] = useState([]);
    const [search, setSearch] = useState("");

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
    const filteredVenues = venues.filter((venue) => {

    const keyword = search.toLowerCase();

    return (

        venue.venueName.toLowerCase().includes(keyword) ||

        venue.city.toLowerCase().includes(keyword) ||

        venue.category?.categoryName.toLowerCase().includes(keyword)

    );

});

    
    return (
    <>

        <div className="hero-section text-center text-white">

            <div className="hero-overlay">

                <h1 className="display-3 fw-bold">
                    BOOK MY PLAY
                </h1>

                <p className="lead mt-3">
                    Find & Book the Best Sports Venues Near You
                </p>

                <Link
                    to="/venues"
                    className="btn btn-warning btn-lg mt-3 px-5"
                >
                    Explore Venues
                </Link>

            </div>

        </div>
        
        <SearchSection onSearch={setSearch} />

        <CategorySection />
        <WhyChooseUs />
        <Statistics />
        

        <div className="container mt-5">

            <h2 className="mb-4 text-center">
                Available Sports Venues
            </h2>

            <div className="row">

                {filteredVenues.map((venue) => (

                    <div className="col-md-4 mb-4" key={venue.id}>

                        <div className="card shadow h-100">

                            <img
    src={
        venue.imageUrl
            ? venue.imageUrl
            : "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1000&q=80"
    }
    className="card-img-top"
    alt={venue.venueName}
    style={{
        height: "220px",
        objectFit: "cover"
    }}
/>

                           <div className="card-body d-flex flex-column">

    <h4 className="fw-bold">
        {venue.venueName}
    </h4>

    <span className="badge bg-success mb-2">
        {venue.category?.categoryName}
    </span>

    <p className="mb-2">
        📍 {venue.city}
    </p>

    <p className="text-warning fs-5">
        ⭐⭐⭐⭐⭐
        <span className="text-dark fs-6 ms-2">
            4.8
        </span>
    </p>

    <h5 className="text-success">
        ₹ {venue.pricePerHour} / Hour
    </h5>

    <Link
        to={`/venue/${venue.id}`}
        className="btn btn-success mt-auto"
    >
        Book Now
    </Link>

</div>


                        </div>

                    </div>

                ))}

            </div>

        </div>

    </>
    );
}
export default Home;