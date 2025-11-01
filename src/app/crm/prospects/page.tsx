"use client";
import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import { Search, Filter, Plus, X, Edit2, Trash2, RefreshCw } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(r => r.json());
const statusOptions = ['new','contacted','interested','converted','lost'];

export default function CRMProspectsPage() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>({ name:'', contact:'', email:'', status:'new', source:'' });

  const query = `/api/prospects?page=${page}&pageSize=${pageSize}&q=${encodeURIComponent(q)}&status=${encodeURIComponent(status)}`;
  const { data, mutate, isLoading } = useSWR(query, fetcher, { refreshInterval: 5000 });

  useEffect(() => { setPage(1); }, [q, status]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/api/prospects/${editing.id}` : '/api/prospects';
    await fetch(url, { method, headers: { 'Content-Type':'application/json' }, body: JSON.stringify(form) });
    setShowForm(false); setEditing(null); setForm({ name:'', contact:'', email:'', status:'new', source:'' });
    mutate();
  };

  const onEdit = (item: any) => { setEditing(item); setForm(item); setShowForm(true); };
  const onDelete = async (item: any) => { if(!confirm('Delete prospect?')) return; await fetch(`/api/prospects/${item.id}`, { method:'DELETE' }); mutate(); };
  const cycleStatus = async (item: any) => {
    const idx = statusOptions.indexOf(item.status);
    const next = statusOptions[(idx + 1) % statusOptions.length];
    await fetch(`/api/prospects/${item.id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({
      name: item.name,
      contact: item.contact,
      email: item.email,
      status: next,
      source: item.source
    })});
    mutate();
  };

  return (
    <div className="py-20 mx-auto my-10 md:px-36 md:p-20 bg-gradient-to-br from-gray-50 to-blue-100 dark:from-gray-950 dark:to-purple-950 dark:via-blue-950 min-h-screen text-gray-900 dark:text-white">
      {/* Heading */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-500 text-transparent bg-clip-text">CRM / Prospects</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Centralized view of all pipeline leads.</p>
      </div>

      {/* Unified control bar: search + filter + button (same line) */}
      <div className="relative mb-8">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center rounded-2xl p-4 lg:p-5 bg-gradient-to-r from-white/70 via-white/40 to-white/10 dark:from-gray-900/60 dark:via-gray-900/40 dark:to-gray-900/20 border border-white/40 dark:border-gray-700 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_30px_-4px_rgba(0,0,0,0.4)]">
          {/* Search */}
          <div className="flex-1 group relative">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-cyan-400/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:via-cyan-400/10 group-hover:to-purple-500/10 transition-colors" />
            <div className="flex items-center gap-3 h-full bg-white/70 dark:bg-gray-800/70 rounded-xl px-4 py-2.5 border border-gray-200/60 dark:border-gray-700/70 shadow-inner backdrop-blur">
              <Search size={18} className="text-blue-500 dark:text-cyan-400" />
              <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search name, email, contact" className="bg-transparent w-full outline-none text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500" />
            </div>
          </div>
          {/* Filter */}
            <div className="flex items-center gap-3 bg-white/70 dark:bg-gray-800/70 rounded-xl px-4 py-2.5 border border-gray-200/60 dark:border-gray-700/70 shadow-inner backdrop-blur w-full lg:w-56 relative overflow-hidden">
              <div className="absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.25),transparent_70%)]" />
              <Filter size={18} className="text-purple-500 dark:text-purple-400" />
              <select value={status} onChange={(e)=>setStatus(e.target.value)} className="bg-transparent outline-none text-sm w-full appearance-none pr-6">
                <option value="">All Status</option>
                {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-500 dark:text-gray-400">▼</span>
            </div>
          {/* Add Button */}
          <div className="flex items-center">
            <button onClick={() => { setShowForm(true); setEditing(null); }} className="relative group overflow-hidden px-6 py-2.5 rounded-xl font-medium text-white bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-500 shadow-lg shadow-blue-600/30 hover:shadow-cyan-500/30 transition-all">
              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-purple-500 via-cyan-500 to-blue-600 transition-opacity" />
              <span className="relative flex items-center gap-2">
                <Plus size={16} className="drop-shadow" />
                New Prospect
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Existing table section remains */}
      <div className="overflow-hidden rounded-2xl bg-white/70 dark:bg-gray-900/60 backdrop-blur border border-gray-200 dark:border-gray-700 shadow-xl">
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                <th className="text-left px-4 py-3 font-semibold">Name</th>
                <th className="text-left px-4 py-3 font-semibold">Contact</th>
                <th className="text-left px-4 py-3 font-semibold">Email</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-left px-4 py-3 font-semibold">Source</th>
                <th className="text-left px-4 py-3 font-semibold">Created</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-500">Loading...</td></tr>
              )}
              {data?.items?.length === 0 && !isLoading && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-500">No prospects found.</td></tr>
              )}
              {data?.items?.map((item: any) => (
                <tr key={item.id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-800/70 transition">
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className="px-4 py-3">{item.contact || '-'}</td>
                  <td className="px-4 py-3">{item.email || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow">
                        {item.status}
                      </span>
                      <button onClick={()=>cycleStatus(item)} title="Cycle status" className="p-1.5 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 transition">
                        <RefreshCw size={14} />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">{item.source || '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{new Date(item.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => onEdit(item)} className="p-1.5 rounded-lg hover:bg-blue-600 bg-blue-500 text-white shadow"><Edit2 size={14}/></button>
                    <button onClick={() => onDelete(item)} className="p-1.5 rounded-lg hover:bg-red-600 bg-red-500 text-white shadow"><Trash2 size={14}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-800/40">
          <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Page {data?.page || 1} of {data?.pages || 1} • {data?.total || 0} total</span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={()=>setPage(p=>p-1)} className="px-4 py-1.5 rounded-full bg-gray-200 dark:bg-gray-700 disabled:opacity-40 text-sm">Prev</button>
            <button disabled={page >= (data?.pages || 1)} onClick={()=>setPage(p=>p+1)} className="px-4 py-1.5 rounded-full bg-gray-200 dark:bg-gray-700 disabled:opacity-40 text-sm">Next</button>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y:0, opacity:1 }} className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700 relative">
            <button onClick={()=>{setShowForm(false); setEditing(null);}} className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"><X size={16}/></button>
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-cyan-500 text-transparent bg-clip-text">{editing ? 'Edit Prospect' : 'New Prospect'}</h2>
            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide mb-1">Name</label>
                <input required value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className="w-full rounded-xl bg-gray-100 dark:bg-gray-800 px-4 py-2.5 outline-none focus:ring-2 ring-blue-500/50" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1">Contact</label>
                  <input value={form.contact} onChange={e=>setForm({...form, contact:e.target.value})} className="w-full rounded-xl bg-gray-100 dark:bg-gray-800 px-4 py-2.5 outline-none focus:ring-2 ring-blue-500/50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1">Email</label>
                  <input type="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} className="w-full rounded-xl bg-gray-100 dark:bg-gray-800 px-4 py-2.5 outline-none focus:ring-2 ring-blue-500/50" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1">Status</label>
                  <select value={form.status} onChange={e=>setForm({...form, status:e.target.value})} className="w-full rounded-xl bg-gray-100 dark:bg-gray-800 px-4 py-2.5 outline-none focus:ring-2 ring-blue-500/50">
                    {statusOptions.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1">Source</label>
                  <input value={form.source} onChange={e=>setForm({...form, source:e.target.value})} className="w-full rounded-xl bg-gray-100 dark:bg-gray-800 px-4 py-2.5 outline-none focus:ring-2 ring-blue-500/50" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={()=>{setShowForm(false); setEditing(null);}} className="px-5 py-2.5 rounded-xl bg-gray-200 dark:bg-gray-700 text-sm font-medium">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-sm font-semibold shadow-lg shadow-blue-600/30">{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}