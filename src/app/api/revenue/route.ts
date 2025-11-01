import { NextResponse } from 'next/server';
import { query } from '../../../lib/mysql';

export async function GET(req: Request){
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page')||'1',10);
  const pageSize = parseInt(searchParams.get('pageSize')||'10',10);
  const q = searchParams.get('q')||''; const offset=(page-1)*pageSize;
  const whereParts:string[]=[]; const params:any={};
  if(q){ whereParts.push('(source LIKE :q)'); params.q=`%${q}%`; }
  const where = whereParts.length?`WHERE ${whereParts.join(' AND ')}`:'';
  const items = await query(`SELECT * FROM revenue ${where} ORDER BY created_at DESC LIMIT :limit OFFSET :offset`,{...params,limit:pageSize,offset});
  const totalRows:any = await query(`SELECT COUNT(*) as cnt FROM revenue ${where}`,params);
  const total = totalRows[0]?.cnt || 0;
  return NextResponse.json({ items,total,page,pageSize,pages:Math.ceil(total/pageSize) });
}

export async function POST(req: Request){
  const body = await req.json();
  await query(`INSERT INTO revenue (source,amount,period_start,period_end) VALUES (:source,:amount,:period_start,:period_end)`,{
    source: body.source,
    amount: body.amount,
    period_start: body.period_start || null,
    period_end: body.period_end || null
  });
  return NextResponse.json({ success:true }, { status:201 });
}