import { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../components/AdminSidebar";

function ManageCategories() {

    const [categories, setCategories] = useState([]);
    const [categoryName, setCategoryName] = useState("");
    const [description, setDescription] = useState("");

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = () => {
        axios
            .get("http://localhost:8080/api/categories")
            .then(res => setCategories(res.data))
            .catch(err => console.log(err));
    };

    const addCategory = () => {

        axios.post("http://localhost:8080/api/categories", {
            categoryName,
            description
        })
        .then(() => {
            setCategoryName("");
            setDescription("");
            loadCategories();
        })
        .catch(err => console.log(err));
    };

    const deleteCategory = (id) => {

        if(window.confirm("Delete this category?")){

            axios.delete(`http://localhost:8080/api/categories/${id}`)
            .then(() => loadCategories())
            .catch(err => console.log(err));

        }
    };

    return (

        <div className="container-fluid">

            <div className="row">

                <div className="col-md-2 p-0">
                    <AdminSidebar/>
                </div>

                <div className="col-md-10 p-4">

                    <h2>Manage Categories</h2>

                    <div className="card p-3 mb-4">

                        <input
                            className="form-control mb-2"
                            placeholder="Category Name"
                            value={categoryName}
                            onChange={(e)=>setCategoryName(e.target.value)}
                        />

                        <textarea
                            className="form-control mb-2"
                            placeholder="Description"
                            value={description}
                            onChange={(e)=>setDescription(e.target.value)}
                        />

                        <button
                            className="btn btn-success"
                            onClick={addCategory}
                        >
                            Add Category
                        </button>

                    </div>

                    <table className="table table-bordered">

                        <thead className="table-dark">

                            <tr>

                                <th>ID</th>
                                <th>Name</th>
                                <th>Description</th>
                                <th>Action</th>

                            </tr>

                        </thead>

                        <tbody>

                            {categories.map(cat=>(
                                <tr key={cat.id}>

                                    <td>{cat.id}</td>
                                    <td>{cat.categoryName}</td>
                                    <td>{cat.description}</td>

                                    <td>

                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={()=>deleteCategory(cat.id)}
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

export default ManageCategories;