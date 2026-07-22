import { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../components/AdminSidebar";

function ManageVenues() {
  const [venues, setVenues] = useState([]);

  useEffect(() => {
    loadVenues();
  }, []);

  const loadVenues = () => {
    axios
      .get("http://localhost:8080/api/admin/venues")
      .then((res) => setVenues(res.data))
      .catch((err) => console.log(err));
  };

  const deleteVenue = (id) => {
    if (!window.confirm("Delete this venue?")) return;

    axios
      .delete(`http://localhost:8080/api/admin/venues/${id}`)
      .then(() => {
        alert("Venue Deleted Successfully");
        loadVenues();
      })
      .catch(() => alert("Unable to Delete Venue"));
  };

  return (
    <div className="container-fluid">
      <div className="row">

        <div className="col-md-2 p-0">
          <AdminSidebar />
        </div>

        <div className="col-md-10 p-4">

          <h2 className="mb-4">Manage Venues</h2>

          <table className="table table-bordered table-hover">

            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Venue</th>
                <th>Sport</th>
                <th>City</th>
                <th>Price</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {venues.map((venue) => (
                <tr key={venue.id}>

                  <td>{venue.id}</td>
                  <td>{venue.venueName}</td>
                  <td>{venue.sport}</td>
                  <td>{venue.city}</td>
                  <td>₹ {venue.pricePerHour}</td>

                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => deleteVenue(venue.id)}
                    >
                      Delete
                    </button>
                  </td>

                </tr>
              ))}

            </tbody>

          </table>

        </div>

      </div>
    </div>
  );
}

export default ManageVenues;