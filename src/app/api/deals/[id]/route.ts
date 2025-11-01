import { NextResponse } from 'next/server';
import { query } from '../../../../lib/mysql';
import crypto from 'crypto';

interface Params { id: string }

export async function PUT(req: Request, { params }: { params: Params }) {
  const id = parseInt(params.id, 10);
  const body = await req.json();
  // If status transitions to won and no invoice created, create invoice automatically
  const dealRow: any = await query(`SELECT * FROM deals WHERE id=:id`, { id });
  if (!dealRow[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const prevStatus = dealRow[0].status;

  await query(`UPDATE deals SET client_id=:client_id, title=:title, amount=:amount, status=:status, expected_close=:expected_close, actual_close=:actual_close WHERE id=:id`, {
    id,
    client_id: body.client_id,
    title: body.title,
    amount: body.amount,
    status: body.status,
    expected_close: body.expected_close || null,
    actual_close: body.actual_close || null
  });

  if (prevStatus !== 'won' && body.status === 'won') {
    const invoiceNumber = 'INV-' + crypto.randomBytes(4).toString('hex').toUpperCase();
    await query(`INSERT INTO invoices (deal_id, invoice_number, amount, due_date, status) VALUES (:deal_id,:invoice_number,:amount,:due_date,:status)`, {
      deal_id: id,
      invoice_number: invoiceNumber,
      amount: body.amount,
      due_date: body.due_date || null,
      status: 'unpaid'
    });
    // Placeholder: here integrate email sending to xhenvolt@gmail.com
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(_req: Request, { params }: { params: Params }) {
  const id = parseInt(params.id, 10);
  await query(`DELETE FROM deals WHERE id=:id`, { id });
  return NextResponse.json({ success: true });
}