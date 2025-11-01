import { NextResponse } from 'next/server';
import { query } from '../../../lib/mysql';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
  const q = searchParams.get('q') || '';
  const status = searchParams.get('status') || '';
  const priority = searchParams.get('priority') || '';
  const offset = (page - 1) * pageSize;
  const whereParts: string[] = []; const params: any = {};
  if(q){ whereParts.push('(title LIKE :q OR description LIKE :q)'); params.q = `%${q}%`; }
  if(status){ whereParts.push('status = :status'); params.status = status; }
  if(priority){ whereParts.push('priority = :priority'); params.priority = priority; }
  const where = whereParts.length? 'WHERE '+whereParts.join(' AND '):'';
  const items = await query(`SELECT * FROM tasks ${where} ORDER BY due_date ASC LIMIT :limit OFFSET :offset`, { ...params, limit: pageSize, offset });
  const totalRows: any = await query(`SELECT COUNT(*) as cnt FROM tasks ${where}`, params);
  const total = totalRows[0]?.cnt || 0;
  return NextResponse.json({ items, total, page, pageSize, pages: Math.ceil(total/pageSize) });
}

export async function POST(req: Request) {
  const body = await req.json();
  await query(`INSERT INTO tasks (title,description,assigned_to,priority,due_date,status) VALUES (:title,:description,:assigned_to,:priority,:due_date,:status)`, {
    title: body.title,
    description: body.description || null,
    assigned_to: body.assigned_to || null,
    priority: body.priority || 'medium',
    due_date: body.due_date || null,
    status: body.status || 'pending'
  });
  return NextResponse.json({ success: true }, { status: 201 });
}