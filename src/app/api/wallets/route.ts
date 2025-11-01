import { NextResponse } from 'next/server';
import { query } from '../../../lib/mysql';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1',10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10',10);
  const q = searchParams.get('q') || '';
  const type = searchParams.get('type') || '';
  const offset = (page-1)*pageSize;
  const whereParts:string[]=[]; const params:any={};
  if(q){ whereParts.push('(name LIKE :q)'); params.q=`%${q}%`; }
  if(type){ whereParts.push('type = :type'); params.type=type; }
  const where = whereParts.length? `WHERE ${whereParts.join(' AND ')}`:'';
  const items = await query(`SELECT * FROM wallets ${where} ORDER BY id DESC LIMIT :limit OFFSET :offset`,{...params,limit:pageSize,offset});
  const totalRows:any = await query(`SELECT COUNT(*) as cnt FROM wallets ${where}`,params);
  const total = totalRows[0]?.cnt || 0;
  return NextResponse.json({ items, total, page, pageSize, pages: Math.ceil(total/pageSize) });
}

export async function POST(req: Request){
  const body = await req.json();
  await query(`INSERT INTO wallets (company_id,name,type,balance) VALUES (:company_id,:name,:type,:balance)`,{
    company_id: body.company_id || null,
    name: body.name,
    type: body.type || 'cash',
    balance: body.balance || 0
  });
  return NextResponse.json({ success:true }, { status:201 });
}