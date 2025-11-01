import { NextResponse } from 'next/server';
import { query } from '../../../../lib/mysql';

interface Params { id: string }

export async function DELETE(_req: Request, { params }: { params: Params }) {
  const id = parseInt(params.id,10);
  await query(`DELETE FROM cashflow_rules WHERE id=:id`,{ id });
  return NextResponse.json({ success:true });
}