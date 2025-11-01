import { NextResponse } from 'next/server';
import { query } from '../../../../lib/mysql';

interface Params { id: string }

export async function PUT(req: Request, { params }: { params: Params }) {
  const id = parseInt(params.id,10);
  const body = await req.json();
  await query(`UPDATE documents SET owner_type=:owner_type,owner_id=:owner_id,document_type=:document_type,file_path=:file_path WHERE id=:id`, {
    id,
    owner_type: body.owner_type,
    owner_id: body.owner_id,
    document_type: body.document_type,
    file_path: body.file_path || null
  });
  return NextResponse.json({ success:true });
}

export async function DELETE(_req: Request, { params }: { params: Params }) {
  const id = parseInt(params.id,10);
  await query(`DELETE FROM documents WHERE id=:id`, { id });
  return NextResponse.json({ success:true });
}