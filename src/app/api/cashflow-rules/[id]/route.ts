import { NextResponse } from "next/server";
import { query } from "../../../../lib/mysql";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cashflowRule = await query("SELECT * FROM cashflow_rules WHERE id = :id", { id: params.id });
    return NextResponse.json(cashflowRule[0]);
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    await query(
      "UPDATE cashflow_rules SET wallet_id = :wallet_id, category = :category, percentage = :percentage WHERE id = :id",
      {
        wallet_id: body.wallet_id,
        category: body.category,
        percentage: body.percentage,
        id: params.id
      }
    );
    return NextResponse.json({ message: "Cashflow rule updated successfully" });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await query("DELETE FROM cashflow_rules WHERE id = :id", { id: params.id });
    return NextResponse.json({ message: "Cashflow rule deleted successfully" });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}