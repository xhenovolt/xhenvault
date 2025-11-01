"use client";
import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import { Search, Filter, Plus, X, Edit2, Trash2, RefreshCw } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(r=>r.json());
const statusOptions = ['active','inactive'];

export default function CRMClientsPage(){
  const [page,setPage]=useState(1); const [pageSize]=useState(10);
  const [q,setQ]=useState(''); const [status,setStatus]=useState('');
  const [showForm,setShowForm]=useState(false); const [editing,setEditing]=useState<any|null>(null);
  const [form,setForm]=useState<any>({ prospect_id:'', company_id:'', name:'', contact:'', email:'', status:'active', start_date:'' });
  const query=`/api/clients?page=${page}&pageSize=${pageSize}&q=${encodeURIComponent(q)}&status=${encodeURIComponent(status)}`;
  const { data, mutate, isLoading } = useSWR(query, fetcher, { refreshInterval:5000 });
  useEffect(()=>{ setPage(1); },[q,status]);

  const onSubmit=async(e:React.FormEvent)=>{ e.preventDefault(); const method=editing?'PUT':'POST'; const url=editing?`/api/clients/${editing.id}`:'/api/clients'; await fetch(url,{method,headers:{'Content-Type':'application/json'},body:JSON.stringify({...form, prospect_id:form.prospect_id||null, company_id:form.company_id||null, start_date:form.start_date||null})}); setShowForm(false); setEditing(null); setForm({ prospect_id:'', company_id:'', name:'', contact:'', email:'', status:'active', start_date:'' }); mutate(); };
  const onEdit=(item:any)=>{ setEditing(item); setForm({ ...item, start_date: item.start_date ? item.start_date.substring(0,10):'' }); setShowForm(true); };
  const onDelete=async(item:any)=>{ if(!confirm('Delete client?')) return; await fetch(`/api/clients/${item.id}`,{method:'DELETE'}); mutate(); };
  const cycleStatus=async(item:any)=>{ const next=item.status==='active'?'inactive':'active'; await fetch(`/api/clients/${item.id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({...item,status:next})}); mutate(); };

  return (
    <div className="pt-20 md:pl-72 p-6 md:p-10 bg-gradient-to-br from-gray-50 to-blue-100 dark:from-gray-950 dark:to-purple-950 dark:via-blue-950 min-h-screen text-gray-900 dark:text-white">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-green-600 via-cyan-500 to-blue-500 text-transparent bg-clip-text">CRM / Clients</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage converted relationships.</p>
      </div>
      <div className="relative mb-8">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center rounded-2xl p-4 bg-gradient-to-r from-white/70 via-white/40 to-white/10 dark:from-gray-900/60 dark:via-gray-900/40 dark:to-gray-900/20 border border-white/40 dark:border-gray-700 backdrop-blur-xl">
          <div className="flex-1 flex items-center gap-3 bg-white/70 dark:bg-gray-800/70 rounded-xl px-4 py-2.5 border border-gray-200/60 dark:border-gray-700/70">
            <Search size={18} className="text-green-600" />
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search name, email, contact" className="bg-transparent w-full outline-none text-sm" />
          </div>
          <div className="flex items-center gap-3 bg-white/70 dark:bg-gray-800/70 rounded-xl px-4 py-2.5 border border-gray-200/60 dark:border-gray-700/70 w-full lg:w-56">
            <Filter size={18} className="text-green-600" />
            <select value={status} onChange={e=>setStatus(e.target.value)} className="bg-transparent outline-none text-sm w-full">
              <option value="">All Status</option>
              {statusOptions.map(s=> <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button onClick={()=>{setShowForm(true); setEditing(null);}} className="px-6 py-2.5 rounded-xl font-medium text-white bg-gradient-to-r from-green-600 via-cyan-500 to-blue-500 shadow-lg hover:brightness-110"> <Plus size={16}/> New Client</button>
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl bg-white/70 dark:bg-gray-900/60 backdrop-blur border border-gray-200 dark:border-gray-700 shadow-xl">
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                <th className="px-4 py-3 text-left">Name</th><th className="px-4 py-3 text-left">Contact</th><th className="px-4 py-3 text-left">Email</th><th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-left">Start</th><th className="px-4 py-3 text-left">Created</th><th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={7} className="py-10 text-center">Loading...</td></tr>}
              {data?.items?.length===0 && !isLoading && <tr><td colSpan={7} className="py-10 text-center">No clients found.</td></tr>}
              {data?.items?.map((item:any)=>(
                <tr key={item.id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-green-50 dark:hover:bg-gray-800/70">
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className="px-4 py-3">{item.contact||'-'}</td>
                  <td className="px-4 py-3">{item.email||'-'}</td>
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.status==='active'?'bg-green-500':'bg-gray-500'} text-white`}>{item.status}</span><button onClick={()=>cycleStatus(item)} className="p-1.5 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-green-500 hover:text-white"><RefreshCw size={14}/></button></div></td>
                  <td className="px-4 py-3">{item.start_date? new Date(item.start_date).toLocaleDateString():'-'}</td>
                  <td className="px-4 py-3">{new Date(item.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 flex gap-2"><button onClick={()=>onEdit(item)} className="p-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white"><Edit2 size={14}/></button><button onClick={()=>onDelete(item)} className="p-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white"><Trash2 size={14}/></button></td>
                </tr>))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-800/40">
          <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Page {data?.page||1} of {data?.pages||1} • {data?.total||0} total</span>
          <div className="flex gap-2"><button disabled={page<=1} onClick={()=>setPage(p=>p-1)} className="px-4 py-1.5 rounded-full bg-gray-200 dark:bg-gray-700 disabled:opacity-40 text-sm">Prev</button><button disabled={page>=(data?.pages||1)} onClick={()=>setPage(p=>p+1)} className="px-4 py-1.5 rounded-full bg-gray-200 dark:bg-gray-700 disabled:opacity-40 text-sm">Next</button></div>
        </div>
      </div>
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div initial={{y:40,opacity:0}} animate={{y:0,opacity:1}} className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700 relative">
            <button onClick={()=>{setShowForm(false); setEditing(null);}} className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"><X size={16}/></button>
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-green-600 to-cyan-500 text-transparent bg-clip-text">{editing?'Edit Client':'New Client'}</h2>
            <form onSubmit={onSubmit} className="space-y-5">
              <div><label className="block text-xs font-semibold mb-1">Name</label><input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="w-full rounded-xl bg-gray-100 dark:bg-gray-800 px-4 py-2.5 outline-none"/></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5"><div><label className="block text-xs font-semibold mb-1">Contact</label><input value={form.contact} onChange={e=>setForm({...form,contact:e.target.value})} className="w-full rounded-xl bg-gray-100 dark:bg-gray-800 px-4 py-2.5 outline-none"/></div><div><label className="block text-xs font-semibold mb-1">Email</label><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="w-full rounded-xl bg-gray-100 dark:bg-gray-800 px-4 py-2.5 outline-none"/></div></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5"><div><label className="block text-xs font-semibold mb-1">Status</label><select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} className="w-full rounded-xl bg-gray-100 dark:bg-gray-800 px-4 py-2.5 outline-none">{statusOptions.map(s=> <option key={s} value={s}>{s}</option>)}</select></div><div><label className="block text-xs font-semibold mb-1">Start Date</label><input type="date" value={form.start_date} onChange={e=>setForm({...form,start_date:e.target.value})} className="w-full rounded-xl bg-gray-100 dark:bg-gray-800 px-4 py-2.5 outline-none"/></div></div>
              <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={()=>{setShowForm(false); setEditing(null);}} className="px-5 py-2.5 rounded-xl bg-gray-200 dark:bg-gray-700 text-sm font-medium">Cancel</button><button type="submit" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-green-600 via-cyan-500 to-blue-500 text-white text-sm font-semibold shadow-lg">{editing?'Update':'Create'}</button></div>
            </form>
          </motion.div>
        </div> )}
    </div>
  );
}