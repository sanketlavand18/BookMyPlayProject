function Testimonials() {

    const reviews = [
        {
            id: 1,
            name: "Rahul Sharma",
            sport: "Cricket Player",
            review: "Amazing experience! Booking a turf was quick and hassle-free."
        },
        {
            id: 2,
            name: "Priya Patil",
            sport: "Badminton Player",
            review: "Clean courts, easy booking process, and great support."
        },
        {
            id: 3,
            name: "Amit Joshi",
            sport: "Football Captain",
            review: "Best sports booking platform I've used. Highly recommended!"
        }
    ];

    return (
        <section className="container py-5">

            <h2 className="text-center fw-bold mb-5">
                What Our Users Say
            </h2>

            <div className="row">

                {reviews.map((review) => (

                    <div className="col-md-4 mb-4" key={review.id}>

                        <div className="card shadow border-0 h-100 p-4">

                            <h4>{review.name}</h4>

                            <small className="text-success">
                                {review.sport}
                            </small>

                            <hr />

                            <p>"{review.review}"</p>

                            <div className="text-warning fs-5">
                                ⭐⭐⭐⭐⭐
                            </div>

                        </div>

                    </div>

                ))}

            </div>

        </section>
    );
}

export default Testimonials;