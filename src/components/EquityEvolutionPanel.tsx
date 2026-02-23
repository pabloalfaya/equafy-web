"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

const MOCK_EQUITY_HISTORY = [
  { month: "Mar", Founder: 48, "Co-founder": 32, Investor: 20 },
  { month: "Apr", Founder: 46, "Co-founder": 31, Investor: 23 },
  { month: "May", Founder: 44, "Co-founder": 30, Investor: 26 },
  { month: "Jun", Founder: 42, "Co-founder": 29, Investor: 29 },
  { month: "Jul", Founder: 40, "Co-founder": 28, Investor: 32 },
  { month: "Aug", Founder: 38, "Co-founder": 27, Investor: 35 },
  { month: "Sep", Founder: 36, "Co-founder": 26, Investor: 38 },
  { month: "Oct", Founder: 34, "Co-founder": 25, Investor: 41 },
  { month: "Nov", Founder: 33, "Co-founder": 24, Investor: 43 },
  { month: "Dec", Founder: 32, "Co-founder": 23, Investor: 45 },
  { month: "Jan", Founder: 31, "Co-founder": 22, Investor: 47 },
  { month: "Feb", Founder: 30, "Co-founder": 21, Investor: 49 },
];

const MOCK_POINTS_THIS_MONTH = 450;
const MOCK_PCT_VS_LAST_MONTH = 12;

export function EquityEvolutionPanel() {
  return (
    <div className="h-full flex flex-col gap-6 min-h-0">
      <div className="flex-shrink-0">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Equity History</h3>
        <div className="h-[240px] rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={MOCK_EQUITY_HISTORY} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#64748b" }} stroke="#cbd5e1" />
              <YAxis domain={[0, 60]} tick={{ fontSize: 10, fill: "#64748b" }} stroke="#cbd5e1" tickFormatter={(v) => `${v}%`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1)",
                  fontSize: "12px",
                }}
                formatter={(value: number | undefined, name?: string) => [value != null ? `${value}%` : "—", name ?? ""]}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Legend wrapperStyle={{ fontSize: "10px" }} iconType="line" />
              <Line type="monotone" dataKey="Founder" stroke="#10b981" strokeWidth={2} dot={false} name="Founder" />
              <Line type="monotone" dataKey="Co-founder" stroke="#3b82f6" strokeWidth={2} dot={false} name="Co-founder" />
              <Line type="monotone" dataKey="Investor" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Investor" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="flex-shrink-0">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Points velocity / Burn rate</h3>
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 shadow-sm">
          <p className="text-2xl font-black text-slate-800 tabular-nums">
            +{MOCK_POINTS_THIS_MONTH.toLocaleString()} points this month
          </p>
          <p className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-emerald-600">
            <span aria-hidden>↑</span>
            <span>{MOCK_PCT_VS_LAST_MONTH}% vs last month</span>
          </p>
        </div>
      </div>
    </div>
  );
}
