import { NextResponse } from 'next/server';
import { query } from '../../../lib/mysql';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
  const q = searchParams.get('q') || '';
  const status = searchParams.get('status') || '';
  const offset = (page - 1) * pageSize;

  const whereParts: string[] = [];
  const params: any = {};
  if (q) { whereParts.push('(invoice_number LIKE :q)'); params.q = `%${q}%`; }
  if (status) { whereParts.push('status = :status'); params.status = status; }
  const where = whereParts.length ? `WHERE ${whereParts.join(' AND ')}` : '';

  const items = await query(`SELECT * FROM invoices ${where} ORDER BY created_at DESC LIMIT :limit OFFSET :offset`, { ...params, limit: pageSize, offset });
  const totalRows: any = await query(`SELECT COUNT(*) as cnt FROM invoices ${where}`, params);
  const total = totalRows[0]?.cnt || 0;
  return NextResponse.json({ items, total, page, pageSize, pages: Math.ceil(total / pageSize) });
}

export async function POST(req: Request) {
  const body = await req.json();
  await query(`INSERT INTO invoices (deal_id, invoice_number, amount, due_date, status) VALUES (:deal_id,:invoice_number,:amount,:due_date,:status)`, {
    deal_id: body.deal_id,
    invoice_number: body.invoice_number,
    amount: body.amount,
    due_date: body.due_date || null,
    status: body.status || 'unpaid'
  });
  return NextResponse.json({ success: true }, { status: 201 });
}