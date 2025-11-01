import { NextResponse } from 'next/server';
import { query } from '../../../lib/mysql';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
  const q = searchParams.get('q') || '';
  const status = searchParams.get('status') || '';
  const offset = (page - 1) * pageSize;
  const whereParts: string[] = []; const params: any = {};
  if(q){ whereParts.push('(title LIKE :q OR description LIKE :q OR location LIKE :q)'); params.q = `%${q}%`; }
  if(status){ whereParts.push('status = :status'); params.status = status; }
  const where = whereParts.length? 'WHERE '+whereParts.join(' AND '):'';
  const items = await query(`SELECT * FROM events ${where} ORDER BY start_datetime DESC LIMIT :limit OFFSET :offset`, { ...params, limit: pageSize, offset });
  const totalRows: any = await query(`SELECT COUNT(*) as cnt FROM events ${where}`, params);
  const total = totalRows[0]?.cnt || 0;
  return NextResponse.json({ items, total, page, pageSize, pages: Math.ceil(total/pageSize) });
}

export async function POST(req: Request) {
  const body = await req.json();
  await query(`INSERT INTO events (title,description,start_datetime,end_datetime,location,status,created_by) VALUES (:title,:description,:start_datetime,:end_datetime,:location,:status,:created_by)`, {
    title: body.title,
    description: body.description || null,
    start_datetime: body.start_datetime || null,
    end_datetime: body.end_datetime || null,
    location: body.location || null,
    status: body.status || 'upcoming',
    created_by: body.created_by || null
  });
  return NextResponse.json({ success: true }, { status: 201 });
}