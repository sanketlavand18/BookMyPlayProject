import { FaMapMarkerAlt, FaUsers, FaCalendarCheck, FaFutbol } from "react-icons/fa";

function Statistics() {

    const stats = [
        {
            icon: <FaFutbol size={40} />,
            value: "100+",
            title: "Sports Venues"
        },
        {
            icon: <FaCalendarCheck size={40} />,
            value: "1000+",
            title: "Bookings"
        },
        {
            icon: <FaUsers size={40} />,
            value: "500+",
            title: "Happy Players"
        },
        {
            icon: <FaMapMarkerAlt size={40} />,
            value: "20+",
            title: "Cities"
        }
    ];

    return (

        <div className="stats-section">

            <div className="container">

                <div className="row">

                    {stats.map((stat, index) => (

                        <div className="col-md-3 col-6 mb-4" key={index}>

                            <div className="stats-card text-center">

                                <div className="mb-3 text-warning">
                                    {stat.icon}
                                </div>

                                <h2>{stat.value}</h2>

                                <p>{stat.title}</p>

                            </div>

                        </div>

                    ))}

                </div>

            </div>

        </div>

    );

}

export default Statistics;