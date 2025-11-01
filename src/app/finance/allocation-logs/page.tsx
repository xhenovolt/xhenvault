"use client";
import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Filter } from 'lucide-react';

const fetcher=(u:string)=>fetch(u).then(r=>r.json());
interface Allocation { id:number; transaction_id:number; wallet_id:number; amount:number; created_at:string; }
interface AllocResp { items:Allocation[]; total:number; page:number; pages:number; pageSize:number; }
interface Wallet { id:number; name:string; }
interface Tx { id:number; category:string|null; }

export default function AllocationLogsPage(){
  const [page,setPage]=useState(1); const [pageSize]=useState(10); const [walletFilter,setWalletFilter]=useState('');
  const query='/api/allocation-logs?page='+page+'&pageSize='+pageSize+'&wallet_id='+encodeURIComponent(walletFilter);
  const { data, isLoading } = useSWR<AllocResp>(query, fetcher, { refreshInterval:10000 });
  const { data: walletsData } = useSWR<{items:Wallet[]}>('/api/wallets?page=1&pageSize=1000', fetcher);
  const { data: txData } = useSWR<{items:Tx[]}>('/api/transactions?page=1&pageSize=1000', fetcher);
  const wallets=walletsData?.items||[]; const txs=txData?.items||[];
  useEffect(()=>{ setPage(1); },[walletFilter]);

  return (
    <div className="py-40 my-10 md:px-24 p-6 md:py-20 min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 dark:from-gray-950 dark:via-blue-950 dark:to-purple-950 text-gray-900 dark:text-white">
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-sky-600 via-cyan-500 to-teal-500 text-transparent bg-clip-text">Finance / Allocation Logs</h1>
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center mb-8 p-4 rounded-2xl bg-white/60 dark:bg-gray-900/50 backdrop-blur border border-white/40 dark:border-gray-700">
        <div className="flex items-center gap-3 bg-white/70 dark:bg-gray-800/70 rounded-xl px-4 py-2.5 border border-gray-200/60 dark:border-gray-700/70 w-full lg:w-60"><Filter size={18} className="text-sky-600"/><select value={walletFilter} onChange={e=>setWalletFilter(e.target.value)} className="bg-transparent outline-none text-sm w-full"><option value="">All Wallets</option>{wallets.map(w=> <option key={w.id} value={w.id}>{w.name}</option>)}</select></div>
      </div>
      <div className="overflow-hidden rounded-2xl bg-white/70 dark:bg-gray-900/60 backdrop-blur border border-gray-200 dark:border-gray-700 shadow-xl">
        <div className="overflow-auto"><table className="w-full text-sm"><thead><tr className="bg-gray-100 dark:bg-gray-800"><th className="px-4 py-3 text-left">Wallet</th><th className="px-4 py-3 text-left">Transaction</th><th className="px-4 py-3 text-left">Amount</th><th className="px-4 py-3 text-left">Created</th></tr></thead><tbody>{isLoading && <tr><td colSpan={4} className="py-10 text-center">Loading...</td></tr>}{data?.items?.length===0 && !isLoading && <tr><td colSpan={4} className="py-10 text-center">No allocations.</td></tr>}{data?.items?.map(a=> <tr key={a.id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-sky-50 dark:hover:bg-gray-800/70"><td className="px-4 py-3">{wallets.find(w=>w.id===a.wallet_id)?.name || a.wallet_id}</td><td className="px-4 py-3">{a.transaction_id}</td><td className="px-4 py-3 font-mono">${Number(a.amount).toLocaleString()}</td><td className="px-4 py-3 whitespace-nowrap">{a.created_at? new Date(a.created_at).toLocaleDateString():''}</td></tr>)}</tbody></table></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-800/40"><span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Page {data?.page||1} of {data?.pages||1} • {data?.total||0} total</span><div className="flex gap-2"><button disabled={page<=1} onClick={()=>setPage(p=>p-1)} className="px-4 py-1.5 rounded-full bg-gray-200 dark:bg-gray-700 disabled:opacity-40 text-sm">Prev</button><button disabled={page>=(data?.pages||1)} onClick={()=>setPage(p=>p+1)} className="px-4 py-1.5 rounded-full bg-gray-200 dark:bg-gray-700 disabled:opacity-40 text-sm">Next</button></div></div>
      </div>
    </div>
  );
}
