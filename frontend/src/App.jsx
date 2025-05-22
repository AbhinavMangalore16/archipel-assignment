import React, { useEffect, useState } from "react";

const API_BASE = "http://127.0.0.1:5000/api/products";

// Input component
function Input({ label, name, value, onChange, type = "text", required = false }) {
  return (
    <div className="flex flex-col mb-4">
      <label htmlFor={name} className="mb-1 font-semibold text-gray-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );
}

// ProductForm component for create & update
function ProductForm({ form, onChange, onSubmit, onCancel, editingId }) {
  return (
    <form onSubmit={onSubmit} className="bg-white p-6 rounded shadow-md mb-8">
      <h2 className="text-xl font-bold mb-4">{editingId ? "Edit Product" : "Add Product"}</h2>

      <Input label="Name" name="name" value={form.name} onChange={onChange} required />
      <Input label="Price" name="price" value={form.price} onChange={onChange} type="number" required />
      <Input label="Description" name="description" value={form.description} onChange={onChange} />
      <Input label="Category" name="category" value={form.category} onChange={onChange} />

      <div className="flex items-center gap-4 mt-4">
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
        >
          {editingId ? "Update" : "Create"}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-400 rounded hover:bg-gray-100 transition"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

// ProductTable component to list products
function ProductTable({ products, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-300 rounded">
        <thead className="bg-gray-100">
          <tr>
            {["ID", "Name", "Price", "Description", "Category", "Actions"].map((header) => (
              <th
                key={header}
                className="text-left px-4 py-2 border-b border-gray-300 text-gray-700 font-semibold"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center py-6 text-gray-500">
                No products found.
              </td>
            </tr>
          ) : (
            products.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="border-b border-gray-300 px-4 py-2">{p.id}</td>
                <td className="border-b border-gray-300 px-4 py-2">{p.name}</td>
                <td className="border-b border-gray-300 px-4 py-2">${p.price.toFixed(2)}</td>
                <td className="border-b border-gray-300 px-4 py-2">{p.description || "-"}</td>
                <td className="border-b border-gray-300 px-4 py-2">{p.category || "-"}</td>
                <td className="border-b border-gray-300 px-4 py-2">
                  <button
                    onClick={() => onEdit(p)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(p.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function ProductManager() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", price: "", description: "", category: "" });
  const [editingId, setEditingId] = useState(null);

  // Fetch products from backend
  async function fetchProducts() {
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      alert(error.message);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle form input changes
  function onChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  // Create or update product on submit
  async function onSubmit(e) {
    e.preventDefault();
    const { name, price, description, category } = form;
    if (!name || !price) {
      alert("Name and price are required");
      return;
    }

    const payload = {
      name,
      price: parseFloat(price),
      description: description || undefined,
      category: category || undefined,
    };

    try {
      if (editingId) {
        // Update existing product
        const res = await fetch(`${API_BASE}/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Update failed");
      } else {
        // Create new product
        const res = await fetch(API_BASE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Creation failed");
      }
      setForm({ name: "", price: "", description: "", category: "" });
      setEditingId(null);
      fetchProducts();
    } catch (err) {
      alert(err.message);
    }
  }

  // Delete product
  async function onDelete(id) {
    if (!window.confirm("Are you sure you want to delete?")) return;
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      fetchProducts();
    } catch (error) {
      alert(error.message);
    }
  }

  // Edit product - load into form
  function onEdit(product) {
    setForm({
      name: product.name,
      price: product.price.toString(),
      description: product.description || "",
      category: product.category || "",
    });
    setEditingId(product.id);
  }

  // Cancel editing
  function onCancel() {
    setForm({ name: "", price: "", description: "", category: "" });
    setEditingId(null);
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <ProductForm
        form={form}
        onChange={onChange}
        onSubmit={onSubmit}
        onCancel={onCancel}
        editingId={editingId}
      />

      <h2 className="text-2xl font-semibold mb-4">Product List</h2>
      <ProductTable products={products} onEdit={onEdit} onDelete={onDelete} />
    </div>
  );
}
