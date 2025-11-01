import { NextResponse } from 'next/server';
import { query } from '../../../lib/mysql';

export async function GET(req: Request){
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page')||'1',10);
  const pageSize = parseInt(searchParams.get('pageSize')||'10',10);
  const wallet = searchParams.get('wallet_id')||''; const offset=(page-1)*pageSize;
  const whereParts:string[]=[]; const params:any={};
  if(wallet){ whereParts.push('wallet_id = :wallet_id'); params.wallet_id=wallet; }
  const where = whereParts.length?`WHERE ${whereParts.join(' AND ')}`:'';
  const items = await query(`SELECT * FROM allocation_logs ${where} ORDER BY id DESC LIMIT :limit OFFSET :offset`,{...params,limit:pageSize,offset});
  const totalRows:any = await query(`SELECT COUNT(*) as cnt FROM allocation_logs ${where}`,params);
  const total = totalRows[0]?.cnt || 0;
  return NextResponse.json({ items,total,page,pageSize,pages:Math.ceil(total/pageSize) });
}