"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Label } from "recharts";

export function EquityPieChart({ contributions }: { contributions: any[] }) {
  const totalValue = contributions.reduce((sum, c) => sum + (Number(c.risk_adjusted_value) || 0), 0);
  const data = contributions.map((c) => ({ name: c.contributor_name, value: Number(c.risk_adjusted_value) || 0 }));
  const COLORS = ["#10B981", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444"];

  return (
    <div className="w-full h-full relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={75} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none">
            {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
            <Label value={totalValue.toLocaleString()} position="center" fill="#0F172A" style={{ fontSize: '24px', fontWeight: '900' }} />
            <Label value="TOTAL POINTS" position="center" dy={20} fill="#94A3B8" style={{ fontSize: '10px', fontWeight: 'bold' }} />
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}