import { FaMapMarkerAlt, FaClock, FaShieldAlt, FaMobileAlt } from "react-icons/fa";

function WhyChooseUs() {

    const features = [

        {
            icon: <FaMapMarkerAlt size={45} className="text-success" />,
            title: "Find Nearby Venues",
            desc: "Search sports venues near your location."
        },

        {
            icon: <FaClock size={45} className="text-success" />,
            title: "Instant Booking",
            desc: "Book your slot in just a few clicks."
        },

        {
            icon: <FaShieldAlt size={45} className="text-success" />,
            title: "Secure Payments",
            desc: "Safe and secure online transactions."
        },

        {
            icon: <FaMobileAlt size={45} className="text-success" />,
            title: "Mobile Friendly",
            desc: "Book from any device anytime."
        }

    ];

    return (

        <section className="bg-light py-5">

            <div className="container">

                <h2 className="text-center fw-bold mb-5">
                    Why Choose BookMyPlay?
                </h2>

                <div className="row">

                    {features.map((feature, index) => (

                        <div className="col-md-3 mb-4" key={index}>

                            <div className="card border-0 shadow h-100 text-center p-4">

                                {feature.icon}

                                <h4 className="mt-3">
                                    {feature.title}
                                </h4>

                                <p>
                                    {feature.desc}
                                </p>

                            </div>

                        </div>

                    ))}

                </div>

            </div>

        </section>

    );

}

export default WhyChooseUs;