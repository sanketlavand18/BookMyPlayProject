import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    addSlot,
    deleteSlot,
    getSlotsByVenue
} from "../services/slotService";

function ManageSlots() {

    const { venueId } = useParams();

    const [slots, setSlots] = useState([]);

    const [slot, setSlot] = useState({
        venueId: venueId,
        slotDate: "",
        startTime: "",
        endTime: ""
    });

    useEffect(() => {
        loadSlots();
    }, []);

    const loadSlots = async () => {

        const response = await getSlotsByVenue(venueId);

        setSlots(response.data);

    };

    const handleChange = (e) => {

        setSlot({
            ...slot,
            [e.target.name]: e.target.value
        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        const response = await addSlot(slot);

        alert(response.data);

        loadSlots();

    };

    const handleDelete = async (id) => {

        await deleteSlot(id);

        alert("Slot Deleted");

        loadSlots();

    };

    return (

        <div className="container mt-5">

            <h2>Manage Slots</h2>

            <hr/>

            <form onSubmit={handleSubmit}>

                <input
                    type="date"
                    className="form-control mb-3"
                    name="slotDate"
                    onChange={handleChange}
                />

                <input
                    type="time"
                    className="form-control mb-3"
                    name="startTime"
                    onChange={handleChange}
                />

                <input
                    type="time"
                    className="form-control mb-3"
                    name="endTime"
                    onChange={handleChange}
                />

                <button className="btn btn-success">

                    Add Slot

                </button>

            </form>

            <hr/>

            <table className="table table-bordered">

                <thead className="table-dark">

                    <tr>

                        <th>Date</th>
                        <th>Start</th>
                        <th>End</th>
                        <th>Status</th>
                        <th>Action</th>

                    </tr>

                </thead>

                <tbody>

                    {slots.map(slot => (

                        <tr key={slot.id}>

                            <td>{slot.slotDate}</td>

                            <td>{slot.startTime}</td>

                            <td>{slot.endTime}</td>

                            <td>

                                {slot.isBooked ? "Booked" : "Available"}

                            </td>

                            <td>

                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleDelete(slot.id)}
                                >
                                    Delete
                                </button>

                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>

    );

}

export default ManageSlots;