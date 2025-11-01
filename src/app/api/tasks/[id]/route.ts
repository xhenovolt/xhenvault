import { NextResponse } from 'next/server';
import { query } from '../../../../lib/mysql';

interface Params { id: string }

export async function PUT(req: Request, { params }: { params: Params }) {
  const id = parseInt(params.id,10);
  const body = await req.json();
  await query(`UPDATE tasks SET title=:title,description=:description,assigned_to=:assigned_to,priority=:priority,due_date=:due_date,status=:status WHERE id=:id`, {
    id,
    title: body.title,
    description: body.description || null,
    assigned_to: body.assigned_to || null,
    priority: body.priority || 'medium',
    due_date: body.due_date || null,
    status: body.status || 'pending'
  });
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: Request, { params }: { params: Params }) {
  const id = parseInt(params.id,10);
  await query(`DELETE FROM tasks WHERE id=:id`, { id });
  return NextResponse.json({ success: true });
}