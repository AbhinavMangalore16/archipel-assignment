'use client';

import { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';

type Product = {
  id: number;
  name: string;
  price: number;
  description?: string;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<Partial<Product>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [isModalOpen, setModalOpen] = useState(false);

  const handleEdit = (product: Product) => {
    setForm(product);
    setEditingId(product.id);
    setModalOpen(true);
  };


  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchProducts(search);
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const fetchProducts = async (query = '') => {
    const res = await fetch(`http://127.0.0.1:5000/api/products?search=${encodeURIComponent(query)}`);
    const data = await res.json();
    setProducts(data);
  };



  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await fetch(`http://127.0.0.1:5000/api/products/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setEditingId(null);
    } else {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    }
    setForm({});
    fetchProducts();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    await fetch(`http://127.0.0.1:5000/api/products/${id}`, {
      method: 'DELETE',
    });
    fetchProducts();
  };

  return (
    <div className="p-8 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 h-[calc(100vh-4rem)]">
      <h1 className="text-2xl font-bold mb-4 col-span-full">Product Manager</h1>

      {/* Left column: Create Product Form */}
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (editingId) return; // prevent inline form submit while editing modal open
          await fetch('http://127.0.0.1:5000/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
          });
          setForm({});
          fetchProducts();
        }}
        className="mb-8 space-y-4"
      >
        <input
          className="border p-2 w-full"
          placeholder="Name"
          name="name"
          value={form.name || ''}
          onChange={handleChange}
          required
          disabled={!!editingId} // disable input if editing in modal
        />
        <input
          className="border p-2 w-full"
          placeholder="Price"
          type="number"
          name="price"
          value={form.price || ''}
          onChange={handleChange}
          required
          disabled={!!editingId}
        />
        <textarea
          className="border p-2 w-full"
          placeholder="Description"
          name="description"
          value={form.description || ''}
          onChange={handleChange}
          disabled={!!editingId}
        />
        <input
          className="border p-2 w-full"
          placeholder="Category"
          name="category"
          value={form.category || ''}
          onChange={handleChange}
          disabled={!!editingId}
        />
        <button
          className={`px-4 py-2 rounded text-white ${editingId ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600'
            }`}
          type="submit"
          disabled={!!editingId}
        >
          Create Product
        </button>
      </form>

      {/* Right column: Product List */}

      <div className="max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 border rounded">
      <input
        type="text"
        placeholder="Search by name..."
        className="border p-2 w-full mb-4"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
        <ul className="space-y-4">
          {products.map((product) => (
            <li
              key={product.id}
              className="border p-4 rounded flex justify-between items-start"
            >
              <div>
                <h2 className="font-bold text-lg">{product.name}</h2>
                <p className="text-sm text-gray-600">₹{product.price}</p>
                <p>{product.description}</p>
                <p className="text-sm text-gray-500">{product.category}</p>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => {
                    setForm(product); // load product data into form state
                    setEditingId(product.id);
                    setModalOpen(true);
                  }}
                  className="bg-yellow-400 px-3 py-1 rounded text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Modal for Editing */}
      <Dialog
        open={isModalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingId(null);
          setForm({});
        }}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <Dialog.Title className="text-lg font-bold mb-4">Edit Product</Dialog.Title>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!editingId) return;
                await fetch(`http://127.0.0.1:5000/api/products/${editingId}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(form),
                });
                setModalOpen(false);
                setEditingId(null);
                setForm({});
                fetchProducts();
              }}
              className="space-y-4"
            >
              <input
                className="border p-2 w-full"
                placeholder="Name"
                name="name"
                value={form.name || ''}
                onChange={handleChange}
                required
              />
              <input
                className="border p-2 w-full"
                placeholder="Price"
                type="number"
                name="price"
                value={form.price || ''}
                onChange={handleChange}
                required
              />
              <textarea
                className="border p-2 w-full"
                placeholder="Description"
                name="description"
                value={form.description || ''}
                onChange={handleChange}
              />
              <input
                className="border p-2 w-full"
                placeholder="Category"
                name="category"
                value={form.category || ''}
                onChange={handleChange}
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded border"
                  onClick={() => {
                    setModalOpen(false);
                    setEditingId(null);
                    setForm({});
                  }}
                >
                  Cancel
                </button>
                <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">
                  Save Changes
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}   
