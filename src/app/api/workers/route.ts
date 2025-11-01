import { NextResponse } from "next/server";
import { query } from "../../../lib/db";

export async function GET() {
  const workers = await query("SELECT * FROM workers");
  return NextResponse.json(workers);
}

export async function POST(req: Request) {
  const { firstname, lastname, email, phone, role, status, hired_date } = await req.json();
  const result = await query(
    "INSERT INTO workers (firstname, lastname, email, phone, role, status, hired_date) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [firstname, lastname, email, phone, role, status, hired_date]
  );
  return NextResponse.json({ id: result.insertId });
}
