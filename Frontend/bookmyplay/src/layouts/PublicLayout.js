import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function PublicLayout() {

    return (

        <>

            <Navbar />

            <Outlet />

            <Footer />

        </>

    );

}

export default PublicLayout;