import React, { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import { Bell, Check, Loader2 } from 'lucide-react';
// Add trash icon
import { Trash2 } from 'lucide-react';

const fetcher = (u) => fetch(u).then(r=>r.json());

// Lightweight base64 beep
const BEEP_SRC = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=";

export default function NotificationsBell(){
  const { data, mutate, isLoading } = useSWR('/api/notifications?limit=50', fetcher, { refreshInterval:20000 });
  const [open,setOpen]=useState(false);
  const [timeframe,setTimeframe]=useState('all'); // all|24h|7d|30d
  const [expanded,setExpanded]=useState(false);
  const knownIdsRef = useRef(new Set());
  const audioRef = useRef(null);

  const items = (data?.items || []).slice().sort((a,b)=> new Date(b.created_at).getTime()-new Date(a.created_at).getTime());
  const now = Date.now();
  const cutoffMap = { '24h': 24*60*60*1000, '7d': 7*24*60*60*1000, '30d': 30*24*60*60*1000 };
  const filtered = timeframe==='all'? items : items.filter(n => (now - new Date(n.created_at).getTime()) <= cutoffMap[timeframe]);
  const display = expanded ? filtered : filtered.slice(0,5);
  const unread = items.filter(n=>n.status==='unread').length;

  useEffect(()=>{
    if(!items.length) return;
    let newFound = false;
    items.forEach(n=>{ if(!knownIdsRef.current.has(n.id)){ knownIdsRef.current.add(n.id); newFound = true; }});
    if(newFound && audioRef.current){ audioRef.current.currentTime=0; audioRef.current.play().catch(()=>{}); }
  },[items]);

  const markAllRead = async()=>{
    const unreadIds = filtered.filter(i=>i.status==='unread').map(i=>i.id);
    if(!unreadIds.length) return;
    await fetch('/api/notifications',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({ ids: unreadIds })});
    mutate();
  };

  const toggle = ()=> setOpen(o=>!o);

  const markRead = async(id)=>{
    await fetch('/api/notifications/'+id,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({ status:'read' })});
    mutate();
  };
  const remove = async(id)=>{ await fetch('/api/notifications/'+id,{method:'DELETE'}); mutate(); };

  return (
    <div className="relative">
      <audio ref={audioRef} src={BEEP_SRC} preload="auto" />
      <button onClick={toggle} className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition">
        <Bell size={18} />
        {unread>0 && <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 text-[10px] font-bold flex items-center justify-center rounded-full bg-red-600 text-white shadow">{unread>99?'99+':unread}</span>}
      </button>
      {open && (
        <div className="absolute right-0 mt-3 w-96 max-w-[90vw] z-50 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl backdrop-blur overflow-hidden animate-fade-in">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-800/60">
            <div className="text-sm font-semibold flex-1">Notifications</div>
            <select value={timeframe} onChange={e=>{setTimeframe(e.target.value); setExpanded(false);}} className="text-xs bg-gray-200 dark:bg-gray-700 rounded-md px-2 py-1 outline-none">
              <option value="all">All</option>
              <option value="24h">24h</option>
              <option value="7d">7d</option>
              <option value="30d">30d</option>
            </select>
            {isLoading && <Loader2 size={14} className="animate-spin text-gray-500" />}
            <button onClick={markAllRead} disabled={!unread} className="text-xs flex items-center gap-1 px-2 py-1 rounded-md bg-gray-200 dark:bg-gray-700 disabled:opacity-40"> <Check size={12}/> Read</button>
          </div>
          <div className="max-h-96 overflow-auto divide-y divide-gray-200 dark:divide-gray-800">
            {display.length===0 && <div className="p-6 text-center text-xs text-gray-500">No notifications</div>}
            {display.map(n=> (
              <div key={n.id} className={`p-4 text-sm flex flex-col gap-1 ${n.status==='unread'?'bg-blue-50/60 dark:bg-blue-900/20':''}`}>
                <div className="flex justify-between items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium leading-snug break-words">{n.title}</div>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    {n.status==='unread' && <button onClick={()=>markRead(n.id)} className="text-[10px] px-2 py-0.5 rounded-full bg-blue-600 text-white">Read</button>}
                    <button onClick={()=>remove(n.id)} className="text-[10px] px-2 py-0.5 rounded-full bg-red-600 text-white flex items-center gap-1"><Trash2 size={10}/>Del</button>
                  </div>
                </div>
                {n.message && <div className="text-xs text-gray-600 dark:text-gray-400 leading-snug whitespace-pre-line break-words">{n.message}</div>}
                <div className="text-[10px] text-gray-500 dark:text-gray-500 flex justify-between items-center pt-1">
                  <span>{new Date(n.created_at).toLocaleString()}</span>
                  {n.type && <span className="uppercase tracking-wide font-semibold text-[9px] text-gray-400">{n.type.replace('event_','')}</span>}
                </div>
              </div>
            ))}
          </div>
          {filtered.length>5 && (
            <button onClick={()=>setExpanded(e=>!e)} className="w-full text-center text-xs font-medium py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700">
              {expanded? 'Show Less' : 'Show All ('+(filtered.length-5)+' more)'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
