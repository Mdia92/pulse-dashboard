import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface Transaction {
  id: string;
  time: string;
  zone: string;
  category: string;
  amount: string;
  status: "completed" | "pending";
}

interface TransactionTableProps {
  transactions: Transaction[];
  hourlyTotal: number;
}

export function TransactionTable({
  transactions,
  hourlyTotal,
}: TransactionTableProps) {
  return (
    <div className="border border-[#1e3a5f] bg-[#111827]">
      <div className="flex items-center justify-between border-b border-[#1e3a5f] px-4 py-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
          Recent Transactions
        </h3>
        <span className="text-xs text-cyan-400">{hourlyTotal} in last hour</span>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="border-[#1e3a5f] hover:bg-transparent">
            <TableHead className="text-slate-500">ID</TableHead>
            <TableHead className="text-slate-500">Time</TableHead>
            <TableHead className="text-slate-500">Zone</TableHead>
            <TableHead className="text-slate-500">Category</TableHead>
            <TableHead className="text-right text-slate-500">Volume</TableHead>
            <TableHead className="text-slate-500">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow className="border-[#1e3a5f] hover:bg-transparent">
              <TableCell
                colSpan={6}
                className="py-10 text-center text-sm text-slate-500"
              >
                No transactions in the current hour
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((txn) => (
              <TableRow
                key={txn.id}
                className="border-[#1e3a5f] hover:bg-[#141d2e]"
              >
                <TableCell className="font-mono text-xs text-cyan-400">
                  {txn.id}
                </TableCell>
                <TableCell className="text-slate-300">{txn.time}</TableCell>
                <TableCell className="text-slate-300">{txn.zone}</TableCell>
                <TableCell className="text-slate-300">{txn.category}</TableCell>
                <TableCell className="text-right font-medium text-slate-100">
                  {txn.amount}
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      txn.status === "completed"
                        ? "rounded-none border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                        : "rounded-none border-amber-500/40 bg-amber-500/10 text-amber-400"
                    }
                  >
                    {txn.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
