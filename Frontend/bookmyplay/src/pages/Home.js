import { useEffect, useState } from "react";
import { searchVenues } from "../services/venueService";
import { getAllCategories } from "../services/categoryService";
import VenueCard from "../components/VenueCart";
import {
    FaSearch,
    FaFilter,
    FaStar,
    FaTimes,
    FaSpinner,
    FaChevronLeft,
    FaChevronRight,
    FaCalendarCheck
} from "react-icons/fa";

function Home() {
    // Categories & Cities list
    const [categories, setCategories] = useState([]);
    const [cities, setCities] = useState(["Pune", "Mumbai", "Bangalore", "Delhi", "Hyderabad", "Chennai", "Kolkata"]);

    // Filter states
    const [query, setQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedCity, setSelectedCity] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [selectedRating, setSelectedRating] = useState("");
    const [onlyAvailable, setOnlyAvailable] = useState(false);
    const [sortBy, setSortBy] = useState("newest");

    // Pagination & Results states
    const [venues, setVenues] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalResults, setTotalResults] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        loadSearchResults();
    }, [selectedCategory, selectedCity, minPrice, maxPrice, selectedRating, onlyAvailable, sortBy, currentPage]);

    const loadCategories = async () => {
        try {
            const response = await getAllCategories();
            setCategories(response.data);
        } catch (error) {
            console.error("Error loading categories:", error);
        }
    };

    const loadSearchResults = async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                size: 9,
                sort: sortBy,
                venueName: query || null,
                city: selectedCity || null,
                categoryId: selectedCategory || null,
                minPrice: minPrice || null,
                maxPrice: maxPrice || null,
                rating: selectedRating || null,
                available: onlyAvailable || null
            };

            const response = await searchVenues(params);
            let fetchedVenues = response.data.content || [];
            fetchedVenues.sort((a, b) => {
                const order = { FEATURED: 1, TRENDING: 2, POPULAR: 3, RECOMMENDED: 4, NEW: 5 };
                const rankA = order[a.tag?.toUpperCase()] || 99;
                const rankB = order[b.tag?.toUpperCase()] || 99;
                return rankA - rankB;
            });
            setVenues(fetchedVenues);
            setTotalPages(response.data.totalPages || 0);
            setTotalResults(response.data.totalElements || 0);
        } catch (error) {
            console.error("Error loading search results:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setCurrentPage(0);
        loadSearchResults();
    };

    const clearAllFilters = () => {
        setQuery("");
        setSelectedCategory("");
        setSelectedCity("");
        setMinPrice("");
        setMaxPrice("");
        setSelectedRating("");
        setOnlyAvailable(false);
        setSortBy("newest");
        setCurrentPage(0);
    };

    const getCategoryName = (id) => {
        const cat = categories.find(c => c.id === parseInt(id));
        return cat ? cat.categoryName : "";
    };

    return (
        <div>
            {/* Hero search bar section */}
            <div className="bg-primary text-white py-5 mb-4 shadow-sm" style={{ background: "linear-gradient(135deg, #1e3b8b, #3b82f6)" }}>
                <div className="container text-center">
                    <h1 className="display-4 fw-bold mb-2">Find Your Perfect Play Arena</h1>
                    <p className="lead opacity-75 mb-4">Book turfs, courts, and fields instantly in your city</p>
                    
                    <div className="row justify-content-center">
                        <div className="col-md-8 col-lg-6">
                            <form onSubmit={handleSearchSubmit} className="input-group input-group-lg shadow rounded-3 overflow-hidden">
                                <span className="input-group-text bg-white border-0 text-muted"><FaSearch /></span>
                                <input
                                    type="text"
                                    className="form-control border-0 shadow-none"
                                    placeholder="Search by venue name..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                />
                                <button type="submit" className="btn btn-warning fw-bold px-4">Search</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container py-2">
                <div className="row g-4">
                    
                    {/* Left Sidebar Filter Section */}
                    <div className="col-lg-3">
                        <div className="card border-0 shadow-sm p-4 rounded-4" style={{ backdropFilter: "blur(10px)", background: "rgba(255,255,255,0.98)" }}>
                            <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
                                <h5 className="fw-bold mb-0 text-dark d-flex align-items-center">
                                    <FaFilter className="me-2 text-primary" style={{ fontSize: '0.9rem' }} /> Filters
                                </h5>
                                <button
                                    onClick={clearAllFilters}
                                    className="btn btn-sm btn-outline-danger border-0 fw-semibold px-2 py-1"
                                    style={{ fontSize: '0.8rem' }}
                                >
                                    Clear All
                                </button>
                            </div>

                            {/* Category Filter */}
                            <div className="mb-4">
                                <label className="form-label fw-bold text-secondary small text-uppercase">Sport / Sport Type</label>
                                <select
                                    className="form-select border-2 shadow-none"
                                    value={selectedCategory}
                                    onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(0); }}
                                >
                                    <option value="">All Sports</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>{c.categoryName}</option>
                                    ))}
                                </select>
                            </div>

                            {/* City Filter */}
                            <div className="mb-4">
                                <label className="form-label fw-bold text-secondary small text-uppercase">Select City</label>
                                <select
                                    className="form-select border-2 shadow-none"
                                    value={selectedCity}
                                    onChange={(e) => { setSelectedCity(e.target.value); setCurrentPage(0); }}
                                >
                                    <option value="">All Cities</option>
                                    {cities.map((city) => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Price range filter */}
                            <div className="mb-4">
                                <label className="form-label fw-bold text-secondary small text-uppercase">Price Range (₹/hr)</label>
                                <div className="d-flex gap-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        className="form-control border-2 shadow-none"
                                        value={minPrice}
                                        onChange={(e) => { setMinPrice(e.target.value); setCurrentPage(0); }}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        className="form-control border-2 shadow-none"
                                        value={maxPrice}
                                        onChange={(e) => { setMaxPrice(e.target.value); setCurrentPage(0); }}
                                    />
                                </div>
                            </div>

                            {/* Rating filter */}
                            <div className="mb-4">
                                <label className="form-label fw-bold text-secondary small text-uppercase">Rating</label>
                                <select
                                    className="form-select border-2 shadow-none"
                                    value={selectedRating}
                                    onChange={(e) => { setSelectedRating(e.target.value); setCurrentPage(0); }}
                                >
                                    <option value="">All Ratings</option>
                                    <option value="5">⭐⭐⭐⭐⭐ (5/5)</option>
                                    <option value="4">⭐⭐⭐⭐ & above (4+/5)</option>
                                    <option value="3">⭐⭐⭐ & above (3+/5)</option>
                                    <option value="2">⭐⭐ & above (2+/5)</option>
                                </select>
                            </div>

                            {/* Availability Filter */}
                            <div className="mb-2">
                                <div className="form-check form-switch">
                                    <input
                                        className="form-check-input shadow-none cursor-pointer"
                                        type="checkbox"
                                        id="availabilityCheck"
                                        checked={onlyAvailable}
                                        onChange={(e) => { setOnlyAvailable(e.target.checked); setCurrentPage(0); }}
                                    />
                                    <label className="form-check-label fw-bold text-secondary small text-uppercase cursor-pointer" htmlFor="availabilityCheck">
                                        Available Slots Only
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Results Grid */}
                    <div className="col-lg-9">
                        
                        {/* Control bar */}
                        <div className="card border-0 shadow-sm p-3 rounded-4 mb-4 bg-white d-flex flex-sm-row justify-content-between align-items-center gap-3">
                            <span className="text-secondary fw-semibold">
                                Showing {totalResults} {totalResults === 1 ? "venue" : "venues"} found
                            </span>
                            
                            <div className="d-flex align-items-center gap-2">
                                <span className="small text-muted text-nowrap">Sort By:</span>
                                <select
                                    className="form-select form-select-sm border-2 shadow-none"
                                    style={{ width: "160px" }}
                                    value={sortBy}
                                    onChange={(e) => { setSortBy(e.target.value); setCurrentPage(0); }}
                                >
                                    <option value="newest">Newest Venues</option>
                                    <option value="priceAsc">Price: Low → High</option>
                                    <option value="priceDesc">Price: High → Low</option>
                                </select>
                            </div>
                        </div>

                        {/* Filter Chips list */}
                        <div className="d-flex flex-wrap gap-2 mb-3">
                            {selectedCategory && (
                                <span className="badge bg-light text-dark border p-2 rounded-pill d-flex align-items-center">
                                    Sport: {getCategoryName(selectedCategory)}
                                    <FaTimes className="ms-2 cursor-pointer text-danger" onClick={() => setSelectedCategory("")} />
                                </span>
                            )}
                            {selectedCity && (
                                <span className="badge bg-light text-dark border p-2 rounded-pill d-flex align-items-center">
                                    City: {selectedCity}
                                    <FaTimes className="ms-2 cursor-pointer text-danger" onClick={() => setSelectedCity("")} />
                                </span>
                            )}
                            {minPrice && (
                                <span className="badge bg-light text-dark border p-2 rounded-pill d-flex align-items-center">
                                    Min: ₹{minPrice}
                                    <FaTimes className="ms-2 cursor-pointer text-danger" onClick={() => setMinPrice("")} />
                                </span>
                            )}
                            {maxPrice && (
                                <span className="badge bg-light text-dark border p-2 rounded-pill d-flex align-items-center">
                                    Max: ₹{maxPrice}
                                    <FaTimes className="ms-2 cursor-pointer text-danger" onClick={() => setMaxPrice("")} />
                                </span>
                            )}
                            {selectedRating && (
                                <span className="badge bg-light text-dark border p-2 rounded-pill d-flex align-items-center">
                                    Rating: {selectedRating}★
                                    <FaTimes className="ms-2 cursor-pointer text-danger" onClick={() => setSelectedRating("")} />
                                </span>
                            )}
                            {onlyAvailable && (
                                <span className="badge bg-light text-dark border p-2 rounded-pill d-flex align-items-center">
                                    <FaCalendarCheck className="me-1 text-success" /> Slots Available
                                    <FaTimes className="ms-2 cursor-pointer text-danger" onClick={() => setOnlyAvailable(false)} />
                                </span>
                            )}
                        </div>

                        {/* Loading spinner */}
                        {loading ? (
                            <div className="text-center py-5">
                                <FaSpinner className="spinner-border text-primary fs-2" role="status" />
                                <h5 className="mt-3 text-muted">Searching matches...</h5>
                            </div>
                        ) : (
                            <>
                                {/* Venues Grid */}
                                {venues.length === 0 ? (
                                    <div className="card border-0 shadow-sm p-5 text-center rounded-4 bg-white mt-2">
                                        <div className="py-4 text-muted">
                                            <h4 className="fw-bold mb-2">No Arenas Found</h4>
                                            <p className="mb-0">Try clearing filters or search query to explore more results.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="row">
                                        {venues.map((venue) => (
                                            <div className="col-md-6 col-xl-4 mb-4" key={venue.id}>
                                                <VenueCard venue={venue} />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Pagination controller */}
                                {totalPages > 1 && (
                                    <div className="d-flex justify-content-center align-items-center gap-3 mt-4">
                                        <button
                                            className="btn btn-outline-primary rounded-circle p-2 d-flex align-items-center justify-content-center"
                                            style={{ width: "40px", height: "40px" }}
                                            disabled={currentPage === 0}
                                            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                                        >
                                            <FaChevronLeft />
                                        </button>
                                        <span className="fw-semibold text-secondary">
                                            Page {currentPage + 1} of {totalPages}
                                        </span>
                                        <button
                                            className="btn btn-outline-primary rounded-circle p-2 d-flex align-items-center justify-content-center"
                                            style={{ width: "40px", height: "40px" }}
                                            disabled={currentPage === totalPages - 1}
                                            onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                                        >
                                            <FaChevronRight />
                                        </button>
                                    </div>
                                )}
                            </>
                        )}

                    </div>

                </div>
            </div>
        </div>
    );
}

export default Home;