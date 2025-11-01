import { NextResponse } from 'next/server';
import { query } from '../../../lib/mysql';

export async function GET(req: Request){
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || '';
  const limit = parseInt(searchParams.get('limit')||'100',10);
  const where = status? 'WHERE status = :status' : '';
  const items = await query(`SELECT * FROM notifications ${where} ORDER BY created_at DESC LIMIT :limit`, { status, limit });
  return NextResponse.json({ items });
}

export async function POST(req: Request){
  const body = await req.json();
  const result:any = await query(`INSERT INTO notifications (type,event_id,title,message,status) VALUES (:type,:event_id,:title,:message,:status)`,{
    type: body.type || 'system',
    event_id: body.event_id || null,
    title: body.title,
    message: body.message || null,
    status: body.status || 'unread'
  });
  return NextResponse.json({ success:true, id: result.insertId }, { status:201 });
}

export async function PATCH(req: Request){
  const body = await req.json();
  if(body.ids && Array.isArray(body.ids)){
    await query(`UPDATE notifications SET status='read' WHERE id IN (${body.ids.map((_:any,i:number)=>':id'+i).join(',')})`, body.ids.reduce((acc:any,id:number,i:number)=>{ acc['id'+i]=id; return acc; },{}));
  }
  return NextResponse.json({ success:true });
}