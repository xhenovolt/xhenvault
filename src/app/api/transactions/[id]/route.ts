import { NextResponse } from 'next/server';
import { query } from '../../../../lib/mysql';

interface Params { id: string }

export async function DELETE(_req: Request, { params }: { params: Params }) {
  const id = parseInt(params.id,10);
  // Reverse wallet balance before delete
  const rows:any = await query(`SELECT * FROM transactions WHERE id=:id`,{ id });
  if(rows[0]){
    const tx = rows[0];
    if(tx.type === 'income'){
      await query(`UPDATE wallets SET balance = balance - :amt WHERE id=:id`,{ amt: tx.amount, id: tx.wallet_id });
    } else {
      await query(`UPDATE wallets SET balance = balance + :amt WHERE id=:id`,{ amt: tx.amount, id: tx.wallet_id });
    }
  }
  await query(`DELETE FROM transactions WHERE id=:id`,{ id });
  await query(`DELETE FROM allocation_logs WHERE transaction_id=:id`,{ id });
  return NextResponse.json({ success:true });
}