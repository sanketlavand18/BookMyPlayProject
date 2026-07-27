import { NavLink } from "react-router-dom";

import {
FaHome,
FaCalendar,
FaHeart,
FaStar,
FaUser,
FaFutbol
} from "react-icons/fa";

function UserSidebar() {

return (

<div
className="bg-white shadow"
style={{
width:"250px",
minHeight:"100vh"
}}
>

<div className="list-group list-group-flush">

<NavLink className="list-group-item" to="/user">

<FaHome className="me-2"/>

Dashboard

</NavLink>

<NavLink className="list-group-item" to="/user/venues">

<FaFutbol className="me-2"/>

Browse Venues

</NavLink>

<NavLink className="list-group-item" to="/user/bookings">

<FaCalendar className="me-2"/>

My Bookings

</NavLink>

<NavLink className="list-group-item" to="/user/favorites">

<FaHeart className="me-2"/>

Favorites

</NavLink>

<NavLink className="list-group-item" to="/user/reviews">

<FaStar className="me-2"/>

Reviews

</NavLink>

<NavLink className="list-group-item" to="/user/profile">

<FaUser className="me-2"/>

Profile

</NavLink>

</div>

</div>

);

}

export default UserSidebar;