import { FaCheckCircle, FaClock, FaShieldAlt, FaMoneyBillWave } from "react-icons/fa";

function WhyChooseUs() {

    const features = [

        {
            icon: <FaClock size={45} />,
            title: "Instant Booking",
            desc: "Book your favorite venue in seconds."
        },

        {
            icon: <FaShieldAlt size={45} />,
            title: "Verified Venues",
            desc: "Trusted vendors and quality grounds."
        },

        {
            icon: <FaMoneyBillWave size={45} />,
            title: "Best Prices",
            desc: "Affordable booking with no hidden charges."
        },

        {
            icon: <FaCheckCircle size={45} />,
            title: "Easy Cancellation",
            desc: "Simple cancellation and booking management."
        }

    ];

    return (

        <div className="container my-5">

            <h2 className="text-center fw-bold mb-5">
                Why Choose BookMyPlay?
            </h2>

            <div className="row">

                {features.map((feature, index) => (

                    <div className="col-md-3 mb-4" key={index}>

                        <div className="feature-card text-center">

                            <div className="text-success mb-3">
                                {feature.icon}
                            </div>

                            <h5>{feature.title}</h5>

                            <p>{feature.desc}</p>

                        </div>

                    </div>

                ))}

            </div>

        </div>

    );

}

export default WhyChooseUs;