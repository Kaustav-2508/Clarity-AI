
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getStudyPlan, toggleTask, StudyTask } from '../../lib/studyPlan';
import { CheckCircle2, Circle, Calendar, BookOpen } from 'lucide-react';
import { cn } from '../../lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export function StudyPlanView() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<StudyTask[]>([]);

  useEffect(() => {
    if (user) {
      getStudyPlan(user.uid).then(setTasks);
    }
  }, [user]);

  const completedCount = tasks.filter(t => t.completed).length;
  const data = [
    { name: 'Completed', value: completedCount },
    { name: 'Pending', value: tasks.length - completedCount }
  ];
  const COLORS = ['#10B981', '#374151'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6">
      <div className="lg:col-span-2 professional-card p-8 space-y-6">
        <h2 className="text-2xl font-black text-text-main uppercase">Study Roadmap</h2>
        <div className="space-y-4">
          {tasks.map(t => (
            <div key={t.id} className="flex items-center gap-4 p-4 bg-bg-deep rounded-xl border border-border-subtle">
              <button onClick={() => toggleTask(user!.uid, t.id, !t.completed).then(() => getStudyPlan(user!.uid).then(setTasks))}>
                {t.completed ? <CheckCircle2 className="text-accent-green" /> : <Circle className="text-text-dim" />}
              </button>
              <div>
                <p className={cn("font-bold", t.completed && "line-through text-text-dim")}>{t.title}</p>
                <p className="text-xs text-text-dim">{t.subject} • {new Date(t.dueDate).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="professional-card p-8 space-y-6">
        <h3 className="text-lg font-black text-text-main">Completion Velocity</h3>
        <div className="h-64">
           <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <p className="text-center font-bold text-text-main">{completedCount} / {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} achieved</p>
      </div>
    </div>
  );
}
