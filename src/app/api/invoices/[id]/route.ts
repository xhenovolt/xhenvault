import { NextResponse } from 'next/server';
import { query } from '../../../../lib/mysql';

interface Params { id: string }

export async function PUT(req: Request, { params }: { params: Params }) {
  const id = parseInt(params.id, 10);
  const body = await req.json();
  await query(`UPDATE invoices SET deal_id=:deal_id, invoice_number=:invoice_number, amount=:amount, due_date=:due_date, status=:status WHERE id=:id`, {
    id,
    deal_id: body.deal_id,
    invoice_number: body.invoice_number,
    amount: body.amount,
    due_date: body.due_date || null,
    status: body.status
  });
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: Request, { params }: { params: Params }) {
  const id = parseInt(params.id, 10);
  await query(`DELETE FROM invoices WHERE id=:id`, { id });
  return NextResponse.json({ success: true });
}