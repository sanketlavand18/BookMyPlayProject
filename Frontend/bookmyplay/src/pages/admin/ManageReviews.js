import { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../components/AdminSidebar";

function ManageReviews() {

    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        loadReviews();
    }, []);

    const loadReviews = () => {
        axios
            .get("http://localhost:8080/api/admin/reviews")
            .then(res => setReviews(res.data))
            .catch(err => console.log(err));
    };

    return (

        <div className="container-fluid">

            <div className="row">

                <div className="col-md-2 p-0">
                    <AdminSidebar />
                </div>

                <div className="col-md-10 p-4">

                    <h2 className="mb-4">Manage Reviews</h2>

                    <table className="table table-bordered table-hover">

                        <thead className="table-dark">

                            <tr>

                                <th>ID</th>
                                <th>User</th>
                                <th>Venue</th>
                                <th>Rating</th>
                                <th>Comment</th>
                                <th>Date</th>

                            </tr>

                        </thead>

                        <tbody>

                            {reviews.map((review) => (

                                <tr key={review.id}>

                                    <td>{review.id}</td>
                                    <td>{review.userId}</td>
                                    <td>{review.venueId}</td>
                                    <td>{review.rating} ⭐</td>
                                    <td>{review.comment}</td>
                                    <td>{review.createdAt}</td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            </div>

        </div>

    );
}

export default ManageReviews;