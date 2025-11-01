import { NextResponse } from "next/server";
import { query } from "../../../../lib/mysql";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const worker = await query("SELECT * FROM workers WHERE id = :id", { id: params.id });
  return NextResponse.json(worker[0]);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  await query(
    "UPDATE workers SET firstname = :firstname, lastname = :lastname, email = :email, phone = :phone, role = :role, status = :status, hired_date = :hired_date WHERE id = :id",
    {
      firstname: body.firstname,
      lastname: body.lastname,
      email: body.email || null,
      phone: body.phone || null,
      role: body.role || null,
      status: body.status || 'active',
      hired_date: body.hired_date || null,
      id: params.id
    }
  );
  return NextResponse.json({ message: "Worker updated successfully" });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await query("DELETE FROM workers WHERE id = :id", { id: params.id });
  return NextResponse.json({ message: "Worker deleted successfully" });
}
