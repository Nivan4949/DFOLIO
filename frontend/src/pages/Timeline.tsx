import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { Calendar, Loader2 } from 'lucide-react';

interface TaskDependency {
  id: string;
  name?: string;
  title?: string;
  status: string;
  progress: number;
}

interface TaskItem {
  id: string;
  title: string;
  name?: string;
  description?: string | null;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'HOLD' | 'INSPECTION' | 'COMPLETED';
  priority: string;
  progress: number;
  startDate: string;
  endDate: string;
  estimatedDays?: number;
  dependsOnTaskId?: string | null;
  dependsOnTask?: TaskDependency | null;
  subWork?: { name: string; category?: { name: string } };
  room?: { name: string; floor?: { name: string } };
  contractor?: { name: string };
  supervisor?: { name: string };
}

const Timeline: React.FC = () => {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hoveredTask, setHoveredTask] = useState<TaskItem | null>(null);

  const fetchTimelineTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await client.get('/api/tasks');
      setTasks(res.data);
    } catch (err: any) {
      console.error('Failed to load timeline tasks:', err);
      setError(err.response?.data?.error || 'Failed to load task timeline records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimelineTasks();
  }, []);

  // Generate 14 day dates for Gantt header starting from earliest task or today
  const getGanttDates = () => {
    const dates = [];
    const base = new Date();
    base.setDate(base.getDate() - 3); // Start 3 days ago for context
    for (let i = 0; i < 18; i++) {
      const d = new Date(base);
      d.setDate(d.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const ganttDates = getGanttDates();
  const todayStr = new Date().toDateString();

  return (
    <div className="space-y-10 animate-fade-in">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E8E5DF] dark:border-[#2B2D34] pb-6">
        <div>
          <div className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#6E7179] dark:text-[#A0A4AD]">
            CRITICAL PATH & SCHEDULE
          </div>
          <h2 className="font-serif text-3xl font-bold text-[#16171A] dark:text-[#F4F2ED] tracking-tight mt-1">
            Execution Timeline
          </h2>
          <p className="text-xs text-[#6E7179] dark:text-[#A0A4AD] mt-1 max-w-xl">
            Architectural Gantt schedule mapping trade sequences, work overlaps, and prerequisite dependency chains.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="arch-card p-16 text-center">
          <Loader2 className="w-8 h-8 text-[#16171A] dark:text-[#F4F2ED] animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#6E7179] dark:text-[#A0A4AD]">Loading Schedule Grid...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="arch-card p-16 text-center">
          <Calendar className="w-12 h-12 text-[#8C8F99] mx-auto mb-3" />
          <h3 className="font-serif text-xl font-bold text-[#16171A] dark:text-[#F4F2ED]">No Tasks Scheduled</h3>
          <p className="text-xs text-[#6E7179] dark:text-[#A0A4AD] mt-1">Create tasks to view Gantt timeline bars.</p>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* 🏛️ DESKTOP HORIZONTAL GANTT TIMELINE */}
          <div className="hidden md:block arch-card p-6 overflow-hidden">
            <div className="overflow-x-auto pb-4">
              <div className="min-w-[900px]">
                
                {/* Gantt Header Days */}
                <div className="grid grid-cols-[220px_1fr] border-b border-[#E8E5DF] dark:border-[#2B2D34] pb-3 mb-4">
                  <div className="text-[10px] font-mono uppercase text-[#6E7179] dark:text-[#A0A4AD] font-semibold">
                    Work Phase / Task
                  </div>
                  <div className="grid grid-cols-18 gap-1 text-center font-mono text-[9px]">
                    {ganttDates.map((d, idx) => {
                      const isToday = d.toDateString() === todayStr;
                      return (
                        <div 
                          key={idx} 
                          className={`p-1 ${isToday ? 'bg-[#16171A] text-[#FAF8F5] dark:bg-[#F4F2ED] dark:text-[#16171A] font-bold' : 'text-[#6E7179]'}`}
                        >
                          <div>{d.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                          <div className="font-bold">{d.getDate()}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Task Bars */}
                <div className="space-y-4">
                  {tasks.map((task) => {
                    return (
                      <div 
                        key={task.id} 
                        className="grid grid-cols-[220px_1fr] items-center group py-2 border-b border-[#E8E5DF]/40 dark:border-[#2B2D34]/40"
                        onMouseEnter={() => setHoveredTask(task)}
                        onMouseLeave={() => setHoveredTask(null)}
                      >
                        {/* Left Title */}
                        <div className="pr-4">
                          <div className="font-serif font-bold text-sm text-[#16171A] dark:text-[#F4F2ED] truncate">
                            {task.title || task.name}
                          </div>
                          <div className="text-[10px] text-[#6E7179] dark:text-[#A0A4AD] font-mono">
                            {task.subWork?.category?.name || 'Trade Work'}
                          </div>
                        </div>

                        {/* Gantt Bar Line */}
                        <div className="relative h-8 bg-[#FAF8F5] dark:bg-[#121316] rounded-sm flex items-center p-1 border border-[#E8E5DF] dark:border-[#2B2D34]">
                          <div 
                            className="h-full bg-[#16171A] dark:bg-[#F4F2ED] rounded-xs transition-all flex items-center justify-between px-2 text-[9px] font-mono text-[#FAF8F5] dark:text-[#16171A] relative"
                            style={{
                              width: `${Math.max(15, task.progress)}%`,
                            }}
                          >
                            <span className="font-bold">{task.progress}%</span>
                            <span className="truncate max-w-[80px] hidden sm:inline">{task.status}</span>
                          </div>

                          {/* Hover Tooltip */}
                          {hoveredTask?.id === task.id && (
                            <div className="absolute left-1/2 -top-12 -translate-x-1/2 bg-[#16171A] text-[#FAF8F5] dark:bg-[#F4F2ED] dark:text-[#16171A] text-[10px] font-mono p-2 shadow-2xl z-30 pointer-events-none whitespace-nowrap">
                              {task.title || task.name} ({task.progress}%) | {new Date(task.startDate).toLocaleDateString()} - {new Date(task.endDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            </div>
          </div>

          {/* 📱 MOBILE VERTICAL TIMELINE LIST */}
          <div className="md:hidden space-y-4">
            {tasks.map((task) => (
              <div key={task.id} className="arch-card p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] font-mono uppercase text-[#6E7179]">{task.subWork?.category?.name || 'Phase'}</span>
                    <h4 className="font-serif font-bold text-base text-[#16171A] dark:text-[#F4F2ED]">{task.title || task.name}</h4>
                  </div>
                  <span className="text-[10px] font-mono font-bold">{task.progress}%</span>
                </div>

                <div className="w-full h-1.5 bg-[#E8E5DF] dark:bg-[#2B2D34]">
                  <div className="h-full bg-[#16171A] dark:bg-[#F4F2ED]" style={{ width: `${task.progress}%` }} />
                </div>

                <div className="flex justify-between text-[10px] font-mono text-[#6E7179]">
                  <span>Start: {new Date(task.startDate).toLocaleDateString()}</span>
                  <span>End: {new Date(task.endDate).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
};

export default Timeline;
