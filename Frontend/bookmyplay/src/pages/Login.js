import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";

function Login() {

    const navigate = useNavigate();

    const [login, setLogin] = useState({
        email: "",
        password: ""
    });

    const handleChange = (e) => {

        setLogin({
            ...login,
            [e.target.name]: e.target.value
        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            const response = await loginUser(login);

            localStorage.setItem("user", JSON.stringify(response.data));

            alert("Login Successful");

            navigate("/");

        }
        catch (error) {

            alert(error.response?.data || "Login Failed");

        }

    };

    return (

        <div className="container mt-5">

            <div className="row justify-content-center">

                <div className="col-md-5">

                    <div className="card shadow">

                        <div className="card-body">

                            <h2 className="text-center mb-4">

                                Login

                            </h2>

                            <form onSubmit={handleSubmit}>

                                <input
                                    className="form-control mb-3"
                                    placeholder="Email"
                                    name="email"
                                    value={login.email}
                                    onChange={handleChange}
                                />

                                <input
                                    className="form-control mb-3"
                                    type="password"
                                    placeholder="Password"
                                    name="password"
                                    value={login.password}
                                    onChange={handleChange}
                                />

                                <button className="btn btn-primary w-100">

                                    Login

                                </button>

                            </form>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default Login;