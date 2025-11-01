import { NextResponse } from 'next/server';
import { query } from '../../../lib/mysql';

export async function GET(req: Request){
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page')||'1',10);
  const pageSize = parseInt(searchParams.get('pageSize')||'10',10);
  const owner_type = searchParams.get('owner_type')||'';
  const owner_id = searchParams.get('owner_id')||'';
  const doc_type = searchParams.get('document_type')||'';
  const offset=(page-1)*pageSize;
  const whereParts:string[]=[]; const params:any={};
  if(owner_type){ whereParts.push('owner_type = :owner_type'); params.owner_type=owner_type; }
  if(owner_id){ whereParts.push('owner_id = :owner_id'); params.owner_id=owner_id; }
  if(doc_type){ whereParts.push('document_type = :document_type'); params.document_type=doc_type; }
  const where = whereParts.length? 'WHERE '+whereParts.join(' AND '):'';
  const items = await query(`SELECT * FROM documents ${where} ORDER BY uploaded_at DESC LIMIT :limit OFFSET :offset`, { ...params, limit: pageSize, offset });
  const totalRows:any = await query(`SELECT COUNT(*) as cnt FROM documents ${where}`, params);
  const total = totalRows[0]?.cnt || 0;
  return NextResponse.json({ items,total,page,pageSize,pages:Math.ceil(total/pageSize) });
}

export async function POST(req: Request){
  const body = await req.json();
  await query(`INSERT INTO documents (owner_type,owner_id,document_type,file_path,uploaded_by) VALUES (:owner_type,:owner_id,:document_type,:file_path,:uploaded_by)`,{
    owner_type: body.owner_type,
    owner_id: body.owner_id,
    document_type: body.document_type,
    file_path: body.file_path || null,
    uploaded_by: body.uploaded_by || null
  });
  return NextResponse.json({ success:true }, { status:201 });
}