import { NextResponse } from 'next/server';
import { query } from '../../../../lib/mysql';

interface Params { id: string }

export async function PUT(req: Request, { params }: { params: Params }) {
  const id = parseInt(params.id,10);
  const body = await req.json();
  await query(`UPDATE events SET title=:title,description=:description,start_datetime=:start_datetime,end_datetime=:end_datetime,location=:location,status=:status WHERE id=:id`, {
    id,
    title: body.title,
    description: body.description || null,
    start_datetime: body.start_datetime || null,
    end_datetime: body.end_datetime || null,
    location: body.location || null,
    status: body.status || 'upcoming'
  });
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: Request, { params }: { params: Params }) {
  const id = parseInt(params.id,10);
  await query(`DELETE FROM events WHERE id=:id`, { id });
  return NextResponse.json({ success: true });
}