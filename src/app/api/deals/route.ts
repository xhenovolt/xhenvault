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
  if (q) { whereParts.push('(title LIKE :q)'); params.q = `%${q}%`; }
  if (status) { whereParts.push('status = :status'); params.status = status; }
  const where = whereParts.length ? `WHERE ${whereParts.join(' AND ')}` : '';

  const items = await query(`SELECT * FROM deals ${where} ORDER BY created_at DESC LIMIT :limit OFFSET :offset`, { ...params, limit: pageSize, offset });
  const totalRows: any = await query(`SELECT COUNT(*) as cnt FROM deals ${where}`, params);
  const total = totalRows[0]?.cnt || 0;
  return NextResponse.json({ items, total, page, pageSize, pages: Math.ceil(total / pageSize) });
}

export async function POST(req: Request) {
  const body = await req.json();
  const result: any = await query(`INSERT INTO deals (client_id, title, amount, status, expected_close, actual_close) VALUES (:client_id,:title,:amount,:status,:expected_close,:actual_close)`, {
    client_id: body.client_id,
    title: body.title,
    amount: body.amount,
    status: body.status || 'pending',
    expected_close: body.expected_close || null,
    actual_close: body.actual_close || null
  });
  return NextResponse.json({ success: true }, { status: 201 });
}