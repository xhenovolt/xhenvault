"use client";
import React, { useState } from "react";
import useSWR from "swr";
import { Plus, Edit2, Trash2 } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function WorkersPage() {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ firstname: "", lastname: "", email: "", phone: "", role: "", status: "active", hired_date: "" });
  const { data, mutate } = useSWR("/api/workers", fetcher);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editing ? "PUT" : "POST";
    const url = editing ? `/api/workers/${editing.id}` : "/api/workers";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShowForm(false);
    setEditing(null);
    setForm({ firstname: "", lastname: "", email: "", phone: "", role: "", status: "active", hired_date: "" });
    mutate();
  };

  const onEdit = (worker: any) => {
    setEditing(worker);
    setForm(worker);
    setShowForm(true);
  };

  const onDelete = async (id: number) => {
    if (!confirm("Delete worker?")) return;
    await fetch(`/api/workers/${id}`, { method: "DELETE" });
    mutate();
  };

  return (
    <div>
      <h1>Workers</h1>
      <button onClick={() => setShowForm(true)}>
        <Plus /> Add Worker
      </button>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((worker: any) => (
            <tr key={worker.id}>
              <td>{worker.firstname} {worker.lastname}</td>
              <td>{worker.email}</td>
              <td>{worker.phone}</td>
              <td>{worker.role}</td>
              <td>{worker.status}</td>
              <td>
                <button onClick={() => onEdit(worker)}>
                  <Edit2 />
                </button>
                <button onClick={() => onDelete(worker.id)}>
                  <Trash2 />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showForm && (
        <form onSubmit={submit}>
          <input value={form.firstname} onChange={(e) => setForm({ ...form, firstname: e.target.value })} placeholder="First Name" />
          <input value={form.lastname} onChange={(e) => setForm({ ...form, lastname: e.target.value })} placeholder="Last Name" />
          <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" />
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" />
          <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Role" />
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <input type="date" value={form.hired_date} onChange={(e) => setForm({ ...form, hired_date: e.target.value })} />
          <button type="submit">{editing ? "Update" : "Create"}</button>
        </form>
      )}
    </div>
  );
}
