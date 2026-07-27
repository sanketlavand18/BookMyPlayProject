import { Outlet } from "react-router-dom";
import UserNavbar from "../components/UserNavbar";
import UserSidebar from "../components/UserSidebar";

function UserLayout() {

  return (

    <>
      <UserNavbar />

      <div className="w-100 bg-light p-4" style={{ minHeight: "100vh" }}>
        <Outlet />
      </div>

    </>

  );

}

export default UserLayout;