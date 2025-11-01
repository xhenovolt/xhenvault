"use client";
import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Plus, Filter, Trash2, X } from 'lucide-react';
import { motion } from 'framer-motion';

const fetcher=(u:string)=>fetch(u).then(r=>r.json());
interface Rule { id?:number; wallet_id:number; category:string; percentage:number; }
interface RulesResp { items:Rule[]; total:number; page:number; pages:number; pageSize:number; }
interface Wallet { id:number; name:string; }

export default function CashflowRulesPage(){
  const [page,setPage]=useState(1); const [pageSize]=useState(10); const [walletFilter,setWalletFilter]=useState('');
  const [showForm,setShowForm]=useState(false); const [form,setForm]=useState<Rule>({ wallet_id:0, category:'', percentage:0 });
  const query='/api/cashflow-rules?page='+page+'&pageSize='+pageSize+'&wallet_id='+encodeURIComponent(walletFilter);
  const { data, mutate, isLoading } = useSWR<RulesResp>(query, fetcher, { refreshInterval:9000 });
  const { data: walletsData } = useSWR<{items:Wallet[]}>('/api/wallets?page=1&pageSize=1000', fetcher);
  const wallets = walletsData?.items || [];
  useEffect(()=>{ setPage(1); },[walletFilter]);

  const submit=async(e:React.FormEvent)=>{ e.preventDefault(); await fetch('/api/cashflow-rules',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...form, percentage:Number(form.percentage)})}); setShowForm(false); setForm({ wallet_id:0, category:'', percentage:0 }); mutate(); };
  const del=async(id:number)=>{ if(!confirm('Delete rule?')) return; await fetch('/api/cashflow-rules/'+id,{method:'DELETE'}); mutate(); };

  return (
    <div className="py-40 my-10 md:px-24 p-6 md:py-20 min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 dark:from-gray-950 dark:via-blue-950 dark:to-purple-950 text-gray-900 dark:text-white">
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-rose-600 via-pink-500 to-fuchsia-500 text-transparent bg-clip-text">Finance / Cashflow Rules</h1>
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center mb-8 p-4 rounded-2xl bg-white/60 dark:bg-gray-900/50 backdrop-blur border border-white/40 dark:border-gray-700">
        <div className="flex items-center gap-3 bg-white/70 dark:bg-gray-800/70 rounded-xl px-4 py-2.5 border border-gray-200/60 dark:border-gray-700/70 w-full lg:w-60"><Filter size={18} className="text-rose-600"/><select value={walletFilter} onChange={e=>setWalletFilter(e.target.value)} className="bg-transparent outline-none text-sm w-full"><option value="">All Wallets</option>{wallets.map(w=> <option key={w.id} value={w.id}>{w.name}</option>)}</select></div>
        <button onClick={()=>setShowForm(true)} className="px-6 py-2.5 rounded-xl font-medium text-white bg-gradient-to-r from-rose-600 via-pink-500 to-fuchsia-500 shadow-lg hover:brightness-110 flex items-center gap-2"><Plus size={16}/>New Rule</button>
      </div>
      <div className="overflow-hidden rounded-2xl bg-white/70 dark:bg-gray-900/60 backdrop-blur border border-gray-200 dark:border-gray-700 shadow-xl">
        <div className="overflow-auto"><table className="w-full text-sm"><thead><tr className="bg-gray-100 dark:bg-gray-800"><th className="px-4 py-3 text-left">Wallet</th><th className="px-4 py-3 text-left">Category</th><th className="px-4 py-3 text-left">Percentage</th><th className="px-4 py-3">Actions</th></tr></thead><tbody>{isLoading && <tr><td colSpan={4} className="py-10 text-center">Loading...</td></tr>}{data?.items?.length===0 && !isLoading && <tr><td colSpan={4} className="py-10 text-center">No rules.</td></tr>}{data?.items?.map(r=> <tr key={r.id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-rose-50 dark:hover:bg-gray-800/70"><td className="px-4 py-3">{wallets.find(w=>w.id===r.wallet_id)?.name || r.wallet_id}</td><td className="px-4 py-3">{r.category}</td><td className="px-4 py-3">{r.percentage}%</td><td className="px-4 py-3"><button onClick={()=>del(r.id!)} className="p-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white"><Trash2 size={14}/></button></td></tr>)}</tbody></table></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-800/40"><span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Page {data?.page||1} of {data?.pages||1} • {data?.total||0} total</span><div className="flex gap-2"><button disabled={page<=1} onClick={()=>setPage(p=>p-1)} className="px-4 py-1.5 rounded-full bg-gray-200 dark:bg-gray-700 disabled:opacity-40 text-sm">Prev</button><button disabled={page>=(data?.pages||1)} onClick={()=>setPage(p=>p+1)} className="px-4 py-1.5 rounded-full bg-gray-200 dark:bg-gray-700 disabled:opacity-40 text-sm">Next</button></div></div>
      </div>
      {showForm && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"><motion.div initial={{y:40,opacity:0}} animate={{y:0,opacity:1}} className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700 relative"><button onClick={()=>setShowForm(false)} className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"><X size={16}/></button><h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-rose-600 via-pink-500 to-fuchsia-500 text-transparent bg-clip-text">New Rule</h2><form onSubmit={submit} className="space-y-5"><div><label className="block text-xs font-semibold mb-1">Wallet</label><select required value={form.wallet_id} onChange={e=>setForm({...form,wallet_id:Number(e.target.value)})} className="w-full rounded-xl bg-gray-100 dark:bg-gray-800 px-4 py-2.5 outline-none"><option value="0">Select wallet</option>{wallets.map(w=> <option key={w.id} value={w.id}>{w.name}</option>)}</select></div><div className="grid grid-cols-1 md:grid-cols-2 gap-5"><div><label className="block text-xs font-semibold mb-1">Category</label><input value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className="w-full rounded-xl bg-gray-100 dark:bg-gray-800 px-4 py-2.5 outline-none"/></div><div><label className="block text-xs font-semibold mb-1">Percentage</label><input type="number" value={form.percentage} onChange={e=>setForm({...form,percentage:parseFloat(e.target.value||'0')})} className="w-full rounded-xl bg-gray-100 dark:bg-gray-800 px-4 py-2.5 outline-none"/></div></div><div className="flex justify-end gap-3 pt-2"><button type="button" onClick={()=>setShowForm(false)} className="px-5 py-2.5 rounded-xl bg-gray-200 dark:bg-gray-700 text-sm font-medium">Cancel</button><button type="submit" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-pink-500 to-fuchsia-500 text-white text-sm font-semibold shadow-lg">Create</button></div></form></motion.div></div>)}
    </div>
  );
}
