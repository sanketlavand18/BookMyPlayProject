import { FaFutbol, FaFootballBall } from "react-icons/fa";
import { GiCricketBat, GiTennisRacket } from "react-icons/gi";

function CategorySection() {

    const categories = [
        {
            name: "Cricket",
            icon: <GiCricketBat size={45} />
        },
        {
            name: "Football",
            icon: <FaFootballBall size={45} />
        },
        {
            name: "Badminton",
            icon: <GiTennisRacket size={45} />
        },
        {
            name: "Tennis",
            icon: <FaFutbol size={45} />
        }
    ];

    return (

        <div className="container my-5">

            <h2 className="text-center fw-bold mb-4">
                Explore Sports
            </h2>

            <div className="row">

                {categories.map((category, index) => (

                    <div className="col-md-3 col-sm-6 mb-4" key={index}>

                        <div className="category-card text-center">

                            <div className="mb-3">
                                {category.icon}
                            </div>

                            <h5>{category.name}</h5>

                        </div>

                    </div>

                ))}

            </div>

        </div>

    );

}

export default CategorySection;