import { NextResponse } from 'next/server';
import { query } from '../../../../lib/mysql';

interface Params { id: string }

export async function PATCH(req: Request, { params }: { params: Params }) {
  const id = parseInt(params.id,10);
  const body = await req.json();
  await query(`UPDATE notifications SET status=:status WHERE id=:id`, { id, status: body.status || 'read' });
  return NextResponse.json({ success:true });
}

export async function DELETE(_req: Request, { params }: { params: Params }) {
  const id = parseInt(params.id,10);
  await query(`DELETE FROM notifications WHERE id=:id`, { id });
  return NextResponse.json({ success:true });
}