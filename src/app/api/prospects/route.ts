import { NextResponse } from 'next/server';
import { query } from '../../../lib/mysql';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
  const q = searchParams.get('q') || '';
  const status = searchParams.get('status') || '';
  const offset = (page - 1) * pageSize;

  const whereClauses: string[] = [];
  const params: any = {};
  if (q) { whereClauses.push('(name LIKE :q OR email LIKE :q OR contact LIKE :q)'); params.q = `%${q}%`; }
  if (status) { whereClauses.push('status = :status'); params.status = status; }
  const where = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const items = await query(`SELECT * FROM prospects ${where} ORDER BY created_at DESC LIMIT :limit OFFSET :offset`, { ...params, limit: pageSize, offset });
  const totalRows: any = await query(`SELECT COUNT(*) as cnt FROM prospects ${where}`, params);
  const total = totalRows[0]?.cnt || 0;

  return NextResponse.json({ items, total, page, pageSize, pages: Math.ceil(total / pageSize) });
}

export async function POST(req: Request) {
  const body = await req.json();
  await query(`INSERT INTO prospects (name, contact, email, status, source) VALUES (:name,:contact,:email,:status,:source)`, {
    name: body.name,
    contact: body.contact || null,
    email: body.email || null,
    status: body.status || 'new',
    source: body.source || null
  });
  return NextResponse.json({ success: true }, { status: 201 });
}