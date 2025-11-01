"use client";
import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Plus, Search, Filter, Edit2, Trash2, X } from 'lucide-react';
import { motion } from 'framer-motion';

const fetcher = (u: string) => fetch(u).then(r => r.json());
const statusOptions = ['active', 'inactive'];

interface Worker {
  id?: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  role: string;
  status: 'active' | 'inactive';
  hired_date: string;
  created_at?: string;
}

interface WorkersResponse {
  items: Worker[];
  total: number;
  page: number;
  pages: number;
  pageSize: number;
}

export default function WorkersPage() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Worker | null>(null);
  const [form, setForm] = useState<Worker>({ 
    firstname: '', 
    lastname: '', 
    email: '', 
    phone: '', 
    role: '', 
    status: 'active', 
    hired_date: '' 
  });

  const query = '/api/workers?page=' + page + '&pageSize=' + pageSize + '&q=' + encodeURIComponent(q) + '&status=' + encodeURIComponent(status);
  const { data, mutate, isLoading } = useSWR<WorkersResponse>(query, fetcher, { refreshInterval: 6000 });
  useEffect(() => { setPage(1); }, [q, status]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? '/api/workers/' + editing.id : '/api/workers';
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    setShowForm(false);
    setEditing(null);
    setForm({ firstname: '', lastname: '', email: '', phone: '', role: '', status: 'active', hired_date: '' });
    mutate();
  };

  const onEdit = (w: Worker) => { setEditing(w); setForm(w); setShowForm(true); };
  const onDelete = async (w: any) => { if (!confirm('Delete worker?')) return; await fetch('/api/workers/' + w.id, { method: 'DELETE' }); mutate(); };

  return (
    <div className="py-20 my-10 md:px-24 p-6 md:p-10 min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 dark:from-gray-950 dark:via-blue-950 dark:to-purple-950 text-gray-900 dark:text-white">
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-500 text-transparent bg-clip-text">Workers Management</h1>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center mb-8 p-4 rounded-2xl bg-white/60 dark:bg-gray-900/50 backdrop-blur border border-white/40 dark:border-gray-700">
        <div className="flex-1 flex items-center gap-3 bg-white/70 dark:bg-gray-800/70 rounded-xl px-4 py-2.5 border border-gray-200/60 dark:border-gray-700/70">
          <Search size={18} className="text-cyan-600" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search worker name or email" className="bg-transparent w-full outline-none text-sm" />
        </div>
        <div className="flex items-center gap-3 bg-white/70 dark:bg-gray-800/70 rounded-xl px-4 py-2.5 border border-gray-200/60 dark:border-gray-700/70 w-full lg:w-60">
          <Filter size={18} className="text-cyan-600" />
          <select value={status} onChange={e => setStatus(e.target.value)} className="bg-transparent outline-none text-sm w-full">
            <option value="">All Status</option>
            {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <button onClick={() => { setShowForm(true); setEditing(null); }} className="px-6 py-2.5 rounded-xl font-medium text-white bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 shadow-lg hover:brightness-110 flex items-center gap-2">
          <Plus size={16} />New Worker
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl bg-white/70 dark:bg-gray-900/60 backdrop-blur border border-gray-200 dark:border-gray-700 shadow-xl">
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Hired Date</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={7} className="py-10 text-center">Loading...</td></tr>}
              {data?.items?.length === 0 && !isLoading && <tr><td colSpan={7} className="py-10 text-center">No workers.</td></tr>}
              {data?.items?.map((w) => (
                <tr key={w.id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-cyan-50 dark:hover:bg-gray-800/70">
                  <td className="px-4 py-3 font-medium">{w.firstname} {w.lastname}</td>
                  <td className="px-4 py-3">{w.email}</td>
                  <td className="px-4 py-3">{w.phone}</td>
                  <td className="px-4 py-3">{w.role}</td>
                  <td className="px-4 py-3 capitalize">{w.status}</td>
                  <td className="px-4 py-3">{w.hired_date ? new Date(w.hired_date).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => onEdit(w)} className="p-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white"><Edit2 size={14} /></button>
                    <button onClick={() => onDelete(w)} className="p-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-800/40">
          <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Page {data?.page || 1} of {data?.pages || 1} • {data?.total || 0} total</span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-4 py-1.5 rounded-full bg-gray-200 dark:bg-gray-700 disabled:opacity-40 text-sm">Prev</button>
            <button disabled={page >= (data?.pages || 1)} onClick={() => setPage(p => p + 1)} className="px-4 py-1.5 rounded-full bg-gray-200 dark:bg-gray-700 disabled:opacity-40 text-sm">Next</button>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700 relative">
            <button onClick={() => { setShowForm(false); setEditing(null); }} className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"><X size={16} /></button>
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-transparent bg-clip-text">{editing ? 'Edit Worker' : 'New Worker'}</h2>
            <form onSubmit={submit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold mb-1">First Name</label>
                  <input required value={form.firstname} onChange={e => setForm({ ...form, firstname: e.target.value })} className="w-full rounded-xl bg-gray-100 dark:bg-gray-800 px-4 py-2.5 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Last Name</label>
                  <input required value={form.lastname} onChange={e => setForm({ ...form, lastname: e.target.value })} className="w-full rounded-xl bg-gray-100 dark:bg-gray-800 px-4 py-2.5 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Email</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full rounded-xl bg-gray-100 dark:bg-gray-800 px-4 py-2.5 outline-none" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold mb-1">Phone</label>
                  <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full rounded-xl bg-gray-100 dark:bg-gray-800 px-4 py-2.5 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Role</label>
                  <input value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="w-full rounded-xl bg-gray-100 dark:bg-gray-800 px-4 py-2.5 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as 'active' | 'inactive' })} className="w-full rounded-xl bg-gray-100 dark:bg-gray-800 px-4 py-2.5 outline-none">
                    {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Hired Date</label>
                  <input type="date" value={form.hired_date} onChange={e => setForm({ ...form, hired_date: e.target.value })} className="w-full rounded-xl bg-gray-100 dark:bg-gray-800 px-4 py-2.5 outline-none" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="px-5 py-2.5 rounded-xl bg-gray-200 dark:bg-gray-700 text-sm font-medium">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white text-sm font-semibold shadow-lg">{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
