import { NextResponse } from 'next/server';
import { query } from '../../../../lib/mysql';

interface Params { id: string }

export async function PUT(req: Request, { params }: { params: Params }) {
  const id = parseInt(params.id, 10);
  const body = await req.json();
  await query(`UPDATE clients SET prospect_id=:prospect_id, company_id=:company_id, name=:name, contact=:contact, email=:email, status=:status, start_date=:start_date WHERE id=:id`, {
    id,
    prospect_id: body.prospect_id || null,
    company_id: body.company_id || null,
    name: body.name,
    contact: body.contact || null,
    email: body.email || null,
    status: body.status,
    start_date: body.start_date || null
  });
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: Request, { params }: { params: Params }) {
  const id = parseInt(params.id, 10);
  await query(`DELETE FROM clients WHERE id=:id`, { id });
  return NextResponse.json({ success: true });
}