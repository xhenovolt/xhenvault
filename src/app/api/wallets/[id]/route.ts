import { NextResponse } from 'next/server';
import { query } from '../../../../lib/mysql';

interface Params { id: string }

export async function PUT(req: Request, { params }: { params: Params }) {
  const id = parseInt(params.id,10);
  const body = await req.json();
  await query(`UPDATE wallets SET company_id=:company_id,name=:name,type=:type,balance=:balance WHERE id=:id`,{
    id,
    company_id: body.company_id || null,
    name: body.name,
    type: body.type,
    balance: body.balance
  });
  return NextResponse.json({ success:true });
}

export async function DELETE(_req: Request, { params }: { params: Params }) {
  const id = parseInt(params.id,10);
  await query(`DELETE FROM wallets WHERE id=:id`,{ id });
  return NextResponse.json({ success:true });
}