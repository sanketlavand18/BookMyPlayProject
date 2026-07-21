import { useState } from "react";
import { registerUser } from "../services/authService";

function Register() {

    const [user, setUser] = useState({
        fullName: "",
        email: "",
        password: "",
        phone: "",
        role: "USER"
    });

    const handleChange = (e) => {
        setUser({
            ...user,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            const response = await registerUser(user);

            alert(response.data);

            setUser({
                fullName: "",
                email: "",
                password: "",
                phone: "",
                role: "USER"
            });

        } catch (error) {

            alert(error.response?.data || "Registration Failed");

        }

    };

    return (

        <div className="container mt-5">

            <div className="row justify-content-center">

                <div className="col-md-6">

                    <div className="card shadow">

                        <div className="card-body">

                            <h2 className="text-center mb-4">

                                Register

                            </h2>

                            <form onSubmit={handleSubmit}>

                                <input
                                    className="form-control mb-3"
                                    name="fullName"
                                    placeholder="Full Name"
                                    value={user.fullName}
                                    onChange={handleChange}
                                />

                                <input
                                    className="form-control mb-3"
                                    name="email"
                                    placeholder="Email"
                                    value={user.email}
                                    onChange={handleChange}
                                />

                                <input
                                    className="form-control mb-3"
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    value={user.password}
                                    onChange={handleChange}
                                />

                                <input
                                    className="form-control mb-3"
                                    name="phone"
                                    placeholder="Phone"
                                    value={user.phone}
                                    onChange={handleChange}
                                />

                                <button className="btn btn-success w-100">

                                    Register

                                </button>

                            </form>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default Register;