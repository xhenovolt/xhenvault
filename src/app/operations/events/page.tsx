"use client";
import React,{useState,useEffect,useRef} from 'react';
import useSWR from 'swr';
import { Plus, Search, Filter, X, Edit2, Trash2, RefreshCw, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

const fetcher=(u:string)=>fetch(u).then(r=>r.json());
const statusOptions=['upcoming','ongoing','completed'];
interface Event { id?:number; title:string; description:string|null; start_datetime:string|null; end_datetime:string|null; location:string|null; status:'upcoming'|'ongoing'|'completed'; created_by?:number|null; }
interface EventResp { items:Event[]; total:number; page:number; pages:number; pageSize:number; }
interface Toast { id:string; message:React.ReactNode; type:'info'|'action'; ttl?:number }

export default function EventsPage(){
  const [page,setPage]=useState(1); const [pageSize]=useState(10);
  const [q,setQ]=useState(''); const [status,setStatus]=useState('');
  const [showForm,setShowForm]=useState(false); const [editing,setEditing]=useState<Event|null>(null);
  const [form,setForm]=useState<Event>({ title:'', description:'', start_datetime:'', end_datetime:'', location:'', status:'upcoming', created_by:null });
  const [viewEvent,setViewEvent] = useState<Event|null>(null);
  const [toasts,setToasts] = useState<Toast[]>([]);
  const dayAlertedRef = useRef<Set<number>>(new Set());
  const startPromptedRef = useRef<Set<number>>(new Set());
  const query='/api/events?page='+page+'&pageSize='+pageSize+'&q='+encodeURIComponent(q)+'&status='+encodeURIComponent(status);
  const { data, mutate, isLoading } = useSWR<EventResp>(query, fetcher, { refreshInterval:9000 });
  useEffect(()=>{ setPage(1); },[q,status]);

  const submit=async(e:React.FormEvent)=>{ e.preventDefault(); const method=editing?'PUT':'POST'; const url=editing?'/api/events/'+editing.id:'/api/events'; await fetch(url,{method,headers:{'Content-Type':'application/json'},body:JSON.stringify({...form, description:form.description||null, location:form.location||null, start_datetime:form.start_datetime||null, end_datetime:form.end_datetime||null})}); setShowForm(false); setEditing(null); setForm({ title:'', description:'', start_datetime:'', end_datetime:'', location:'', status:'upcoming', created_by:null }); mutate(); };
  const onEdit=(ev:Event)=>{ setEditing(ev); setForm({ ...ev, start_datetime: ev.start_datetime? ev.start_datetime.substring(0,16):'', end_datetime: ev.end_datetime? ev.end_datetime.substring(0,16):'' }); setShowForm(true); };
  const del=async(id:number)=>{ if(!confirm('Delete event?')) return; await fetch('/api/events/'+id,{method:'DELETE'}); mutate(); };
  const cycleStatus=async(ev:Event)=>{ const idx=statusOptions.indexOf(ev.status); const next=statusOptions[(idx+1)%statusOptions.length]; await fetch('/api/events/'+ev.id,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({...ev,status:next})}); mutate(); };
  const pushToast = (toast:Toast) => {
    setToasts(t=>[...t,toast]);
    if(toast.ttl){ setTimeout(()=> setToasts(ts=> ts.filter(x=>x.id!==toast.id)), toast.ttl); }
  };
  const removeToast = (id:string)=> setToasts(t=> t.filter(x=>x.id!==id));

  const events = (data?.items||[]).map(ev=> ({ id:String(ev.id), title: ev.title, start: ev.start_datetime || undefined, end: ev.end_datetime || undefined, extendedProps: ev }));

  const handleDateSelect = (info:any) => {
    setEditing(null);
    setForm({ title:'', description:'', start_datetime: info.startStr.substring(0,16), end_datetime: info.endStr? info.endStr.substring(0,16): info.startStr.substring(0,16), location:'', status:'upcoming', created_by:null });
    setShowForm(true);
  };
  const handleEventClick = (info:any) => {
    const ev = info.event.extendedProps.extendedProps || info.event.extendedProps;
    setViewEvent(ev as Event);
  };
  const handleEventChange = async(info:any)=>{
    const ev = info.event.extendedProps.extendedProps || info.event.extendedProps;
    await fetch('/api/events/'+ev.id,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({...ev,start_datetime: info.event.start?.toISOString(), end_datetime: info.event.end?.toISOString()})});
    mutate();
  };

  // Create notifications for events (tomorrow & missed) once per load cycle
  useEffect(()=>{
    if(!data?.items) return; (async()=>{
      for(const ev of data.items){
        if(!ev.id || !ev.start_datetime) continue;
        const start = new Date(ev.start_datetime).getTime();
        const now = Date.now();
        const diff = start - now;
        // Tomorrow reminder
        if(ev.status==='upcoming' && diff > 0 && diff <= 24*60*60*1000 && !dayAlertedRef.current.has(ev.id)){
          dayAlertedRef.current.add(ev.id);
          await fetch('/api/notifications',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ type:'event_reminder', event_id: ev.id, title:'Event Tomorrow', message: ev.title })});
        }
        // Missed (yesterday) if still upcoming
        if(ev.status==='upcoming' && diff < -24*60*60*1000 && diff > -48*60*60*1000 && !startPromptedRef.current.has(ev.id)){
          startPromptedRef.current.add(ev.id);
          await fetch('/api/notifications',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ type:'event_missed', event_id: ev.id, title:'Missed Event', message: ev.title+' was scheduled previously.' })});
        }
      }
    })(); },[data]);

  return (
    <div className="py-20 md:px-24 my-10  md:p-10 min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 dark:from-gray-950 dark:via-blue-950 dark:to-purple-950 text-gray-900 dark:text-white">
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 text-transparent bg-clip-text flex items-center gap-2"><Calendar size={28}/> Operations / Events</h1>
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center mb-8 p-4 rounded-2xl bg-white/60 dark:bg-gray-900/50 backdrop-blur border border-white/40 dark:border-gray-700">
        <div className="flex-1 flex items-center gap-3 bg-white/70 dark:bg-gray-800/70 rounded-xl px-4 py-2.5 border border-gray-200/60 dark:border-gray-700/70"><Search size={18} className="text-blue-600"/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search title, description or location" className="bg-transparent w-full outline-none text-sm"/></div>
        <div className="flex items-center gap-3 bg-white/70 dark:bg-gray-800/70 rounded-xl px-4 py-2.5 border border-gray-200/60 dark:border-gray-700/70 w-full lg:w-56"><Filter size={18} className="text-blue-600"/><select value={status} onChange={e=>setStatus(e.target.value)} className="bg-transparent outline-none text-sm w-full"><option value="">All Status</option>{statusOptions.map(s=> <option key={s} value={s}>{s}</option>)}</select></div>
        <button onClick={()=>{setShowForm(true); setEditing(null);}} className="px-6 py-2.5 rounded-xl font-medium text-white bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 shadow-lg hover:brightness-110 flex items-center gap-2"><Plus size={16}/>New Event</button>
      </div>
      <div className="rounded-2xl bg-white/70 dark:bg-gray-900/60 backdrop-blur border border-gray-200 dark:border-gray-700 shadow-xl p-4">
        <FullCalendar
          plugins={[dayGridPlugin,timeGridPlugin,interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{ left:'prev,next today', center:'title', right:'dayGridMonth,timeGridWeek,timeGridDay' }}
          events={events}
          selectable
          selectMirror
          select={handleDateSelect}
          eventClick={handleEventClick}
          editable
          eventChange={handleEventChange}
          height="auto"
          aspectRatio={1.6}
        />
      </div>
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 w-72 max-w-full">
        {toasts.map(t=> (
          <div key={t.id} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg p-3 text-sm flex flex-col gap-2 animate-fade-in">
            {t.message}
            {!t.ttl && <button onClick={()=>removeToast(t.id)} className="self-end text-xs text-gray-500 hover:text-gray-800 dark:hover:text-gray-300">Close</button>}
          </div>
        ))}
      </div>
      {/* View Modal */}
      {viewEvent && !showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div initial={{y:40,opacity:0}} animate={{y:0,opacity:1}} className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700 relative">
            <button onClick={()=>setViewEvent(null)} className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"><X size={16}/></button>
            <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 text-transparent bg-clip-text">{viewEvent.title}</h2>
            <div className="space-y-2 text-sm">
              <div><span className="font-semibold">Starts:</span> {viewEvent.start_datetime? new Date(viewEvent.start_datetime).toLocaleString(): '-'}</div>
              <div><span className="font-semibold">Ends:</span> {viewEvent.end_datetime? new Date(viewEvent.end_datetime).toLocaleString(): '-'}</div>
              <div><span className="font-semibold">Location:</span> {viewEvent.location || '-'}</div>
              <div><span className="font-semibold">Status:</span> {viewEvent.status}</div>
              <div><span className="font-semibold">Description:</span> {viewEvent.description || '-'}</div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={()=>{setEditing(viewEvent); setForm({ ...viewEvent, start_datetime: viewEvent.start_datetime? viewEvent.start_datetime.substring(0,16):'', end_datetime: viewEvent.end_datetime? viewEvent.end_datetime.substring(0,16):'' }); setShowForm(true); setViewEvent(null);}} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm">Edit</button>
              {viewEvent.status!=='ongoing' && viewEvent.status!=='completed' && <button onClick={async()=>{ await fetch('/api/events/'+viewEvent.id,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({...viewEvent,status:'ongoing'})}); mutate(); setViewEvent(null);}} className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm">Mark Ongoing</button>}
              {viewEvent.status==='ongoing' && <button onClick={async()=>{ await fetch('/api/events/'+viewEvent.id,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({...viewEvent,status:'completed'})}); mutate(); setViewEvent(null);}} className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm">Complete</button>}
            </div>
          </motion.div>
        </div>
      )}
      {showForm && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"><motion.div initial={{y:40,opacity:0}} animate={{y:0,opacity:1}} className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700 relative"><button onClick={()=>{setShowForm(false); setEditing(null);}} className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"><X size={16}/></button><h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 text-transparent bg-clip-text">{editing?'Edit Event':'New Event'}</h2><form onSubmit={submit} className="space-y-5"><div><label className="block text-xs font-semibold mb-1">Title</label><input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} className="w-full rounded-xl bg-gray-100 dark:bg-gray-800 px-4 py-2.5 outline-none"/></div><div><label className="block text-xs font-semibold mb-1">Description</label><textarea value={form.description||''} onChange={e=>setForm({...form,description:e.target.value})} className="w-full rounded-xl bg-gray-100 dark:bg-gray-800 px-4 py-2.5 outline-none h-24 resize-none"/></div><div className="grid grid-cols-1 md:grid-cols-2 gap-5"><div><label className="block text-xs font-semibold mb-1">Start</label><input type="datetime-local" value={form.start_datetime||''} onChange={e=>setForm({...form,start_datetime:e.target.value})} className="w-full rounded-xl bg-gray-100 dark:bg-gray-800 px-4 py-2.5 outline-none"/></div><div><label className="block text-xs font-semibold mb-1">End</label><input type="datetime-local" value={form.end_datetime||''} onChange={e=>setForm({...form,end_datetime:e.target.value})} className="w-full rounded-xl bg-gray-100 dark:bg-gray-800 px-4 py-2.5 outline-none"/></div></div><div className="grid grid-cols-1 md:grid-cols-2 gap-5"><div><label className="block text-xs font-semibold mb-1">Location</label><input value={form.location||''} onChange={e=>setForm({...form,location:e.target.value})} className="w-full rounded-xl bg-gray-100 dark:bg-gray-800 px-4 py-2.5 outline-none"/></div><div><label className="block text-xs font-semibold mb-1">Status</label><select value={form.status} onChange={e=>setForm({...form,status:e.target.value as Event['status']})} className="w-full rounded-xl bg-gray-100 dark:bg-gray-800 px-4 py-2.5 outline-none">{statusOptions.map(s=> <option key={s} value={s}>{s}</option>)}</select></div></div><div className="flex justify-end gap-3 pt-2"><button type="button" onClick={()=>{setShowForm(false); setEditing(null);}} className="px-5 py-2.5 rounded-xl bg-gray-200 dark:bg-gray-700 text-sm font-medium">Cancel</button><button type="submit" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 text-white text-sm font-semibold shadow-lg">{editing?'Update':'Create'}</button></div></form></motion.div></div>)}
    </div>
  );
}
