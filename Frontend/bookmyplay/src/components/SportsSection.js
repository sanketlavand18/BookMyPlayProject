function SportsSection() {

    const sports = [
        { emoji: "🏏", name: "Cricket" },
        { emoji: "⚽", name: "Football" },
        { emoji: "🏸", name: "Badminton" },
        { emoji: "🎾", name: "Tennis" },
        { emoji: "🏀", name: "Basketball" },
        { emoji: "🏐", name: "Volleyball" }
    ];

    return (
        <section className="container py-5">

            <h2 className="text-center fw-bold mb-5">
                Popular Sports
            </h2>

            <div className="row">

                {sports.map((sport, index) => (

                    <div className="col-md-4 mb-4" key={index}>

                        <div className="card border-0 shadow-lg rounded-4 text-center p-4 h-100">

                            <h1>{sport.emoji}</h1>

                            <h4 className="mt-3">
                                {sport.name}
                            </h4>

                        </div>

                    </div>

                ))}

            </div>

        </section>
    );
}

export default SportsSection;