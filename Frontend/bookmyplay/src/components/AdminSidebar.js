import { Link } from "react-router-dom";

function AdminSidebar() {
    return (

        <div
            className="bg-dark text-white p-3"
            style={{
                width: "250px",
                minHeight: "100vh"
            }}
        >

            <h3 className="text-center mb-4">
                Admin Panel
            </h3>

            <ul className="nav flex-column">

                <li className="nav-item mb-2">
                    <Link
                        className="nav-link text-white"
                        to="/admin/dashboard"
                    >
                        📊 Dashboard
                    </Link>
                </li>

                <li className="nav-item mb-2">
                    <Link
                        className="nav-link text-white"
                        to="/admin/users"
                    >
                        👥 Manage Users
                    </Link>
                </li>

                <li className="nav-item mb-2">
                    <Link
                        className="nav-link text-white"
                        to="/admin/venues"
                    >
                        🏟 Manage Venues
                    </Link>
                </li>

                <li className="nav-item mb-2">
                    <Link
                        className="nav-link text-white"
                        to="/admin/bookings"
                    >
                        📅 Bookings
                    </Link>
                </li>

                <li className="nav-item mb-2">
                    <Link
                        className="nav-link text-white"
                        to="/admin/reviews"
                    >
                        ⭐ Reviews
                    </Link>
                </li>

                <li className="nav-item">
                    <Link className="nav-link" to="/admin/categories">
                        Manage Categories
                     </Link>
                </li>

            </ul>

        </div>

    );
}

export default AdminSidebar;