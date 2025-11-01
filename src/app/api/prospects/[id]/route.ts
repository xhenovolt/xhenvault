import { NextResponse } from 'next/server';
import { query } from '../../../../lib/mysql';

interface Params { id: string }

export async function PUT(req: Request, { params }: { params: Params }) {
  const id = parseInt(params.id, 10);
  const body = await req.json();
  await query(`UPDATE prospects SET name=:name, contact=:contact, email=:email, status=:status, source=:source WHERE id=:id`, {
    id,
    name: body.name,
    contact: body.contact || null,
    email: body.email || null,
    status: body.status,
    source: body.source || null
  });
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: Request, { params }: { params: Params }) {
  const id = parseInt(params.id, 10);
  await query(`DELETE FROM prospects WHERE id=:id`, { id });
  return NextResponse.json({ success: true });
}