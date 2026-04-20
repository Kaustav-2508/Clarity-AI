import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { motion } from 'motion/react';

export function ProgressChart({ data }: { data: { day: string; progress: number }[] }) {
  return (
    <div className="professional-card p-6 h-64 bg-bg-deep border border-border-subtle group">
      <h4 className="text-xs font-black uppercase tracking-widest text-text-dim mb-4">Cognitive Velocity</h4>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="day" hide />
          <YAxis hide />
          <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }} />
          <Line type="monotone" dataKey="progress" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
