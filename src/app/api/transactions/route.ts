import { NextResponse } from 'next/server';
import { query } from '../../../lib/mysql';

async function applyCashflowRules(transactionId:number, walletId:number, amount:number){
  // Fetch rules
  const rules:any = await query(`SELECT * FROM cashflow_rules WHERE wallet_id=:wallet_id`,{ wallet_id: walletId });
  for(const r of rules){
    const alloc = (amount * Number(r.percentage))/100;
    await query(`INSERT INTO allocation_logs (transaction_id, wallet_id, amount) VALUES (:transaction_id,:wallet_id,:amount)`,{
      transaction_id: transactionId,
      wallet_id: walletId,
      amount: alloc
    });
  }
}

export async function GET(req: Request){
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page')||'1',10);
  const pageSize = parseInt(searchParams.get('pageSize')||'10',10);
  const q = searchParams.get('q')||''; const type = searchParams.get('type')||''; const offset=(page-1)*pageSize;
  const whereParts:string[]=[]; const params:any={};
  if(q){ whereParts.push('(category LIKE :q OR description LIKE :q)'); params.q=`%${q}%`; }
  if(type){ whereParts.push('type = :type'); params.type=type; }
  const where = whereParts.length?`WHERE ${whereParts.join(' AND ')}`:'';
  const items = await query(`SELECT * FROM transactions ${where} ORDER BY created_at DESC LIMIT :limit OFFSET :offset`,{...params,limit:pageSize,offset});
  const totalRows:any = await query(`SELECT COUNT(*) as cnt FROM transactions ${where}`,params);
  const total = totalRows[0]?.cnt || 0;
  return NextResponse.json({ items,total,page,pageSize,pages:Math.ceil(total/pageSize) });
}

export async function POST(req: Request){
  const body = await req.json();
  // Insert transaction
  const insert:any = await query(`INSERT INTO transactions (wallet_id,type,category,amount,description,created_by) VALUES (:wallet_id,:type,:category,:amount,:description,:created_by)`,{
    wallet_id: body.wallet_id,
    type: body.type,
    category: body.category || null,
    amount: body.amount,
    description: body.description || null,
    created_by: body.created_by || null
  });
  const transactionId = insert.insertId || 0;
  // Update wallet balance
  if(body.type === 'income'){
    await query(`UPDATE wallets SET balance = balance + :amt WHERE id=:id`,{ amt: body.amount, id: body.wallet_id });
  } else {
    await query(`UPDATE wallets SET balance = balance - :amt WHERE id=:id`,{ amt: body.amount, id: body.wallet_id });
  }
  // Apply cashflow rules
  await applyCashflowRules(transactionId, body.wallet_id, body.amount);
  return NextResponse.json({ success:true }, { status:201 });
}