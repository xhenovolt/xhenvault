import { NextResponse } from "next/server";
import { query } from "../../../../lib/mysql";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const worker = await query("SELECT * FROM workers WHERE id = ?", [params.id]);
  return NextResponse.json(worker[0]);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { firstname, lastname, email, phone, role, status, hired_date } = await req.json();
  await query(
    "UPDATE workers SET firstname = ?, lastname = ?, email = ?, phone = ?, role = ?, status = ?, hired_date = ? WHERE id = ?",
    [firstname, lastname, email, phone, role, status, hired_date, params.id]
  );
  return NextResponse.json({ message: "Worker updated successfully" });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await query("DELETE FROM workers WHERE id = ?", [params.id]);
  return NextResponse.json({ message: "Worker deleted successfully" });
}
