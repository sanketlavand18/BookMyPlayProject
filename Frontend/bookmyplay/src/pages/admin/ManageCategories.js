import { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../components/AdminSidebar";
import { FaSearch, FaTrash, FaEdit, FaPlusCircle, FaChevronLeft, FaChevronRight, FaSpinner } from "react-icons/fa";

function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // Form states
  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Edit Modal states
  const [editingCategory, setEditingCategory] = useState(null);
  const [editForm, setEditForm] = useState({
    categoryName: "",
    description: ""
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8080/api/admin/categories");
      setCategories(res.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load sports categories.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      alert("Please enter a category name");
      return;
    }

    try {
      await axios.post("http://localhost:8080/api/admin/categories", {
        categoryName,
        description
      });
      alert("Category Added Successfully");
      setCategoryName("");
      setDescription("");
      loadCategories();
    } catch (err) {
      console.error(err);
      alert("Failed to add category.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category? Associated venues might lose this classification!")) {
      return;
    }

    try {
      await axios.delete(`http://localhost:8080/api/admin/categories/${id}`);
      alert("Category Deleted Successfully");
      loadCategories();
    } catch (err) {
      console.error(err);
      alert("Failed to delete category.");
    }
  };

  const handleEditClick = (cat) => {
    setEditingCategory(cat);
    setEditForm({
      categoryName: cat.categoryName || "",
      description: cat.description || ""
    });
  };

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedCategory = { ...editingCategory, ...editForm };
      await axios.put(`http://localhost:8080/api/admin/categories/${editingCategory.id}`, updatedCategory);
      alert("Category Updated Successfully");
      setEditingCategory(null);
      loadCategories();
    } catch (err) {
      console.error(err);
      alert("Failed to update category.");
    }
  };

  // Filter & Search logic
  const filteredCategories = categories.filter((c) => {
    const query = searchQuery.toLowerCase();
    return (
      (c.categoryName || "").toLowerCase().includes(query) ||
      (c.description || "").toLowerCase().includes(query)
    );
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCategories.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

  return (
    <div className="container-fluid">
      <div className="row">
        
        <div className="col-md-2 p-0">
          <AdminSidebar />
        </div>

        <div className="col-md-10 p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold mb-0">Manage Categories</h2>
            
            {/* Search Input */}
            <div className="input-group shadow-sm" style={{ width: "300px" }}>
              <span className="input-group-text bg-white border-end-0 text-muted"><FaSearch /></span>
              <input
                type="text"
                placeholder="Search category name..."
                className="form-control border-start-0 shadow-none"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>

          <div className="row g-4">
            {/* Add Category Form Panel */}
            <div className="col-md-4">
              <div className="card border-0 shadow-sm p-4 bg-white rounded-4">
                <h5 className="fw-bold mb-3 d-flex align-items-center"><FaPlusCircle className="me-2 text-success" /> Add New Sport</h5>
                <form onSubmit={handleAddCategory}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted">Sport Category Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Badminton"
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted">Description</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Brief description about the sport facility specifications"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn btn-success w-100 py-2 fw-semibold rounded-3 text-white">
                    Add Sport Category
                  </button>
                </form>
              </div>
            </div>

            {/* Categories Table List */}
            <div className="col-md-8">
              {loading ? (
                <div className="text-center py-5">
                  <FaSpinner className="spinner-border text-success fs-2" role="status" />
                  <h5 className="mt-3 text-muted">Loading categories...</h5>
                </div>
              ) : (
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-dark">
                        <tr>
                          <th className="py-3 px-4">ID</th>
                          <th className="py-3">Category Name</th>
                          <th className="py-3">Description</th>
                          <th className="py-3 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentItems.length === 0 ? (
                          <tr>
                            <td colSpan="4" className="text-center text-muted py-5">No sports categories found.</td>
                          </tr>
                        ) : (
                          currentItems.map((cat) => (
                            <tr key={cat.id}>
                              <td className="px-4 fw-semibold text-secondary">#{cat.id}</td>
                              <td>
                                <span className="fw-bold text-dark">{cat.categoryName}</span>
                              </td>
                              <td className="text-muted small text-truncate" style={{ maxWidth: "200px" }}>{cat.description || "No Description"}</td>
                              <td className="text-center">
                                <div className="d-flex justify-content-center gap-2">
                                  <button
                                    className="btn btn-outline-primary btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center"
                                    style={{ width: "35px", height: "35px" }}
                                    onClick={() => handleEditClick(cat)}
                                  >
                                    <FaEdit />
                                  </button>
                                  <button
                                    className="btn btn-outline-danger btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center"
                                    style={{ width: "35px", height: "35px" }}
                                    onClick={() => handleDelete(cat.id)}
                                  >
                                    <FaTrash />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination controls */}
                  {totalPages > 1 && (
                    <div className="card-footer bg-white border-0 py-3 d-flex justify-content-center align-items-center gap-3">
                      <button
                        className="btn btn-outline-secondary btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center"
                        style={{ width: "32px", height: "32px" }}
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((prev) => prev - 1)}
                      >
                        <FaChevronLeft />
                      </button>
                      <span className="small text-secondary fw-semibold">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        className="btn btn-outline-secondary btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center"
                        style={{ width: "32px", height: "32px" }}
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((prev) => prev + 1)}
                      >
                        <FaChevronRight />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      {editingCategory && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow">
              <div className="modal-header bg-dark text-white border-0 py-3 rounded-top-4">
                <h5 className="modal-title fw-bold">Edit Sport Category</h5>
                <button type="button" className="btn-close btn-close-white shadow-none" onClick={() => setEditingCategory(null)}></button>
              </div>
              <form onSubmit={handleEditSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted">Category Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="categoryName"
                      value={editForm.categoryName}
                      onChange={handleEditChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted">Description</label>
                    <textarea
                      className="form-control"
                      name="description"
                      rows="4"
                      value={editForm.description}
                      onChange={handleEditChange}
                    />
                  </div>
                </div>
                <div className="modal-footer border-0 p-3 bg-light rounded-bottom-4">
                  <button type="button" className="btn btn-secondary px-4 rounded-pill" onClick={() => setEditingCategory(null)}>Cancel</button>
                  <button type="submit" className="btn btn-success px-4 text-white rounded-pill">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageCategories;