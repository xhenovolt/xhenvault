import { NextRequest, NextResponse } from "next/server";
import { query } from "../../../../lib/mysql";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const worker = (await query("SELECT * FROM workers WHERE id = :id", { id })) as any[];
    return NextResponse.json(worker[0] || null);
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
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
        id
      }
    );
    return NextResponse.json({ message: "Worker updated successfully" });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await query("DELETE FROM workers WHERE id = :id", { id });
    return NextResponse.json({ message: "Worker deleted successfully" });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
