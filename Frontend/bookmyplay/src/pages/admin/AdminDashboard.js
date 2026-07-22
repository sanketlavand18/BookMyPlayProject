import { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../components/AdminSidebar";

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVenues: 0,
    totalBookings: 0,
    totalReviews: 0,
  });

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/admin/dashboard")
      .then((res) => setStats(res.data))
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className="container-fluid">
      <div className="row">

        <div className="col-md-2 p-0">
          <AdminSidebar />
        </div>

        <div className="col-md-10 p-4">
          <h2 className="mb-4">Admin Dashboard</h2>

          <div className="row">

            <div className="col-md-3">
              <div className="card text-center shadow">
                <div className="card-body">
                  <h5>Total Users</h5>
                  <h2>{stats.totalUsers}</h2>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card text-center shadow">
                <div className="card-body">
                  <h5>Total Venues</h5>
                  <h2>{stats.totalVenues}</h2>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card text-center shadow">
                <div className="card-body">
                  <h5>Total Bookings</h5>
                  <h2>{stats.totalBookings}</h2>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card text-center shadow">
                <div className="card-body">
                  <h5>Total Reviews</h5>
                  <h2>{stats.totalReviews}</h2>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default AdminDashboard;