import DashboardCard from "../components/DashboardCard";
import VenueCard from "../components/VenueCard";

import {
FaCalendarCheck,
FaCheckCircle,
FaHeart
} from "react-icons/fa";

function Dashboard() {

const user = JSON.parse(localStorage.getItem("user"));

const venues = [

{
id:1,
name:"Elite Football Turf",
city:"Pune",
sport:"Football",
price:600,
image:"https://images.unsplash.com/photo-1517466787929-bc90951d0974"
},

{
id:2,
name:"Smash Badminton Arena",
city:"Mumbai",
sport:"Badminton",
price:500,
image:"https://images.unsplash.com/photo-1546519638-68e109498ffc"
},

{
id:3,
name:"Champions Cricket Ground",
city:"Nashik",
sport:"Cricket",
price:1000,
image:"https://images.unsplash.com/photo-1531415074968-036ba1b575da"
}

];

return(

<div>

<h2 className="mb-4">

Welcome,

{user?.fullName} 👋

</h2>

<div className="row g-4 mb-5">

<div className="col-md-4">

<DashboardCard

title="Upcoming Bookings"

value="3"

icon={<FaCalendarCheck/>}

color="border-primary"

/>

</div>

<div className="col-md-4">

<DashboardCard

title="Completed"

value="12"

icon={<FaCheckCircle/>}

color="border-success"

/>

</div>

<div className="col-md-4">

<DashboardCard

title="Favorites"

value="5"

icon={<FaHeart/>}

color="border-danger"

/>

</div>

</div>

<h3 className="mb-4">

Featured Venues

</h3>

<div className="row g-4">

{

venues.map((venue)=>(

<div
className="col-lg-4"
key={venue.id}
>

<VenueCard venue={venue}/>

</div>

))

}

</div>

</div>

);

}

export default Dashboard;