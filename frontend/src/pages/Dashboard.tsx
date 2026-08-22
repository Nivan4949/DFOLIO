import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { 
  Building2, 
  CheckSquare, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  ArrowUpRight,
  Camera,
  Calendar,
  Layers,
  MapPin
} from 'lucide-react';

interface ProjectItem {
  id: string;
  name: string;
  description?: string | null;
  location?: string | null;
  startDate: string;
  endDate?: string | null;
  status: string;
  _count?: {
    tasks: number;
    snags: number;
    floors: number;
  };
}

interface TaskItem {
  id: string;
  name?: string;
  title?: string;
  progress: number;
  status: string;
  startDate: string;
  endDate: string;
  room?: { name: string; floor?: { name: string; project?: { name: string } } };
  subWork?: { name: string; category?: { name: string } };
}

interface PhotoItem {
  id: string;
  url: string;
  caption?: string | null;
  createdAt: string;
  uploadedBy?: { name: string };
}

interface CategoryStat {
  id: string;
  name: string;
  taskCount: number;
  progress: number;
}

interface DashboardStatsData {
  overallProgress: number;
  todayTasksCount: number;
  todayTasks: TaskItem[];
  pendingSnagsCount: number;
  delayedTasksCount: number;
  statusBreakdown: {
    NOT_STARTED: number;
    IN_PROGRESS: number;
    HOLD: number;
    INSPECTION: number;
    COMPLETED: number;
  };
  categoryBreakdown: CategoryStat[];
  recentPhotos: PhotoItem[];
}

// High Quality Architectural Photographic Thumbnails for Projects
const ARCH_PROJECT_PHOTOS = [
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
];

// Helper Animated Counter Component
const AnimatedNumber: React.FC<{ value: number; duration?: number; suffix?: string }> = ({ value, duration = 1000, suffix = '' }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) {
      setDisplayValue(end);
      return;
    }
    const incrementTime = (duration / (end || 1));
    const timer = setInterval(() => {
      start += 1;
      setDisplayValue(start);
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      }
    }, Math.max(16, incrementTime));

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{displayValue}{suffix}</span>;
};

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStatsData | null>(null);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const [statsRes, projectsRes] = await Promise.all([
        client.get('/api/projects/dashboard/stats'),
        client.get('/api/projects')
      ]);
      setStats(statsRes.data);
      setProjects(projectsRes.data);
    } catch (err: any) {
      console.error('Failed to load dashboard metrics:', err);
      setError(err.response?.data?.error || 'Failed to load live dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="space-y-2">
          <div className="h-4 w-32 arch-skeleton" />
          <div className="h-10 w-96 arch-skeleton" />
          <div className="h-4 w-64 arch-skeleton" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 arch-skeleton" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-200 text-xs rounded-sm flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
        <div>
          <p className="font-semibold">Dashboard Synchronization Issue</p>
          <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5">{error || 'Could not connect to live metrics.'}</p>
        </div>
      </div>
    );
  }

  const {
    overallProgress,
    todayTasksCount,
    todayTasks,
    pendingSnagsCount,
    delayedTasksCount,
    categoryBreakdown,
    recentPhotos
  } = stats;

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="space-y-12 animate-fade-in">
      
      {/* 🏛️ EDITORIAL HERO SECTION */}
      <section className="space-y-3 pb-6 border-b border-[#E8E5DF] dark:border-[#2B2D34]">
        <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#6E7179] dark:text-[#A0A4AD]">
          {formattedDate} &nbsp;—&nbsp; EXECUTIVE CONTROL
        </div>
        
        <h1 className="font-serif text-3xl md:text-5xl font-normal text-[#16171A] dark:text-[#F4F2ED] tracking-tight leading-tight">
          Good morning. <br className="hidden sm:inline" />
          <span className="italic font-light">Your projects, under control.</span>
        </h1>

        <p className="text-xs md:text-sm text-[#6E7179] dark:text-[#A0A4AD] max-w-2xl leading-relaxed pt-1">
          Real-time architectural project execution, quality assurance snags, and daily site operations across active developments.
        </p>
      </section>

      {/* 📊 EDITORIAL METRICS COUNTERS (MINIMAL ARCHITECTURAL CARDS) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="arch-card p-6 space-y-2">
          <div className="text-[10px] font-semibold text-[#6E7179] dark:text-[#A0A4AD] uppercase tracking-wider flex justify-between items-center">
            <span>Overall Completion</span>
            <TrendingUp className="w-4 h-4 text-[#16171A] dark:text-[#F4F2ED]" />
          </div>
          <div className="font-serif text-3xl md:text-4xl font-semibold text-[#16171A] dark:text-[#F4F2ED] tracking-tight">
            <AnimatedNumber value={overallProgress} suffix="%" />
          </div>
          <div className="w-full h-1 bg-[#FAF8F5] dark:bg-[#121316] border border-[#E8E5DF] dark:border-[#2B2D34] overflow-hidden mt-2">
            <div 
              className="h-full bg-[#16171A] dark:bg-[#F4F2ED] transition-all duration-1000"
              style={{ width: `${Math.max(3, overallProgress)}%` }}
            />
          </div>
          <div className="text-[10px] text-[#6E7179] dark:text-[#A0A4AD] pt-1">
            Site-wide execution average
          </div>
        </div>

        <div className="arch-card p-6 space-y-2">
          <div className="text-[10px] font-semibold text-[#6E7179] dark:text-[#A0A4AD] uppercase tracking-wider flex justify-between items-center">
            <span>Today's Works</span>
            <Clock className="w-4 h-4 text-[#16171A] dark:text-[#F4F2ED]" />
          </div>
          <div className="font-serif text-3xl md:text-4xl font-semibold text-[#16171A] dark:text-[#F4F2ED] tracking-tight">
            <AnimatedNumber value={todayTasksCount} />
          </div>
          <div className="text-[10px] text-[#6E7179] dark:text-[#A0A4AD] pt-3">
            Tasks scheduled on site today
          </div>
        </div>

        <div className="arch-card p-6 space-y-2">
          <div className="text-[10px] font-semibold text-[#6E7179] dark:text-[#A0A4AD] uppercase tracking-wider flex justify-between items-center">
            <span>Pending Snags</span>
            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="font-serif text-3xl md:text-4xl font-semibold text-[#16171A] dark:text-[#F4F2ED] tracking-tight">
            <AnimatedNumber value={pendingSnagsCount} />
          </div>
          <div className="text-[10px] text-rose-600 dark:text-rose-400 pt-3 font-medium">
            Defects requiring clearance
          </div>
        </div>

        <div className="arch-card p-6 space-y-2">
          <div className="text-[10px] font-semibold text-[#6E7179] dark:text-[#A0A4AD] uppercase tracking-wider flex justify-between items-center">
            <span>Delayed Works</span>
            <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="font-serif text-3xl md:text-4xl font-semibold text-[#16171A] dark:text-[#F4F2ED] tracking-tight">
            <AnimatedNumber value={delayedTasksCount} />
          </div>
          <div className="text-[10px] text-amber-600 dark:text-amber-400 pt-3 font-medium">
            Works requiring schedule review
          </div>
        </div>

      </section>

      {/* 🏢 ACTIVE PROJECTS OVERVIEW (LARGE EDITORIAL PHOTOGRAPHIC CARDS) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 border-b border-[#E8E5DF] dark:border-[#2B2D34] pb-4">
          <div>
            <div className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#6E7179] dark:text-[#A0A4AD]">
              PORTFOLIO CONTROL
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#16171A] dark:text-[#F4F2ED] tracking-tight mt-1 flex items-center gap-3">
              ACTIVE PROJECTS 
              <span className="font-mono text-sm font-normal text-[#6E7179] dark:text-[#A0A4AD] bg-[#EFECE6] dark:bg-[#22242B] px-2 py-0.5">
                {String(projects.length).padStart(2, '0')}
              </span>
            </h2>
          </div>
          <span className="text-xs text-[#6E7179] dark:text-[#A0A4AD]">
            Hover cards to inspect live development details
          </span>
        </div>

        {projects.length === 0 ? (
          <div className="arch-card p-12 text-center">
            <Building2 className="w-10 h-10 text-[#8C8F99] mx-auto mb-3" />
            <h3 className="font-serif text-lg font-bold text-[#16171A] dark:text-[#F4F2ED]">No Active Projects</h3>
            <p className="text-xs text-[#6E7179] dark:text-[#A0A4AD] mt-1 max-w-sm mx-auto">
              Your first project will appear here once initialized in the portfolio system.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projects.map((proj, idx) => {
              const photoUrl = ARCH_PROJECT_PHOTOS[idx % ARCH_PROJECT_PHOTOS.length];
              return (
                <div 
                  key={proj.id} 
                  className="arch-card arch-image-card group h-[360px] cursor-pointer"
                >
                  <img 
                    src={photoUrl} 
                    alt={proj.name} 
                    loading="lazy" 
                  />

                  {/* Top Status Tag Pill */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="text-[9px] font-mono uppercase tracking-widest bg-[#16171A]/90 text-[#FAF8F5] px-2.5 py-1 backdrop-blur-md">
                      {proj.status}
                    </span>
                  </div>

                  {/* Arrow Indicator Top Right */}
                  <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-y-1 group-hover:translate-y-0">
                    <div className="w-8 h-8 bg-white/90 dark:bg-black/90 text-[#16171A] dark:text-[#F4F2ED] flex items-center justify-center backdrop-blur-md">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Bottom Editorial Content Overlay */}
                  <div className="arch-image-overlay">
                    <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 space-y-2">
                      {proj.location && (
                        <div className="text-[10px] font-semibold text-white/70 uppercase tracking-widest flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {proj.location}
                        </div>
                      )}
                      
                      <h3 className="font-serif text-2xl font-bold text-white tracking-tight leading-snug">
                        {proj.name}
                      </h3>

                      <div className="flex items-center justify-between pt-2 border-t border-white/20 text-xs text-white/90">
                        <span className="flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-white/70" />
                          {proj._count?.floors || 0} Floors &nbsp;•&nbsp; {proj._count?.tasks || 0} Works
                        </span>
                        
                        <div className="font-mono text-xs font-semibold text-white">
                          Target: {proj.endDate ? new Date(proj.endDate).toLocaleDateString() : 'TBD'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 📐 PROJECT PROGRESS & TRADE BREAKDOWN */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
        
        {/* Trade / Categories Breakdown */}
        <div className="lg:col-span-2 arch-card p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-[#E8E5DF] dark:border-[#2B2D34] pb-4">
            <div>
              <div className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#6E7179] dark:text-[#A0A4AD]">
                ANALYSIS
              </div>
              <h3 className="font-serif text-xl font-bold text-[#16171A] dark:text-[#F4F2ED]">
                Trade Execution Breakdown
              </h3>
            </div>
            <span className="text-xs font-mono text-[#6E7179] dark:text-[#A0A4AD]">
              {categoryBreakdown.length} Categories
            </span>
          </div>

          <div className="space-y-4">
            {categoryBreakdown.length === 0 ? (
              <p className="text-xs text-[#8C8F99] italic">No category breakdown data available.</p>
            ) : (
              categoryBreakdown.map((cat) => (
                <div key={cat.id} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-medium">
                    <span className="text-[#16171A] dark:text-[#F4F2ED] font-semibold">
                      {cat.name}
                      <span className="text-[10px] font-mono text-[#6E7179] dark:text-[#A0A4AD] ml-2">
                        ({cat.taskCount} tasks)
                      </span>
                    </span>
                    <span className="font-mono font-bold text-[#16171A] dark:text-[#F4F2ED]">
                      {cat.progress}%
                    </span>
                  </div>
                  
                  <div className="w-full h-1.5 bg-[#FAF8F5] dark:bg-[#121316] border border-[#E8E5DF] dark:border-[#2B2D34] overflow-hidden">
                    <div 
                      className="h-full bg-[#16171A] dark:bg-[#F4F2ED] transition-all duration-700"
                      style={{ width: `${Math.max(2, cat.progress)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Scheduled Today Schedule */}
        <div className="arch-card p-6 space-y-6">
          <div className="border-b border-[#E8E5DF] dark:border-[#2B2D34] pb-4">
            <div className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#6E7179] dark:text-[#A0A4AD]">
              AGENDA
            </div>
            <h3 className="font-serif text-xl font-bold text-[#16171A] dark:text-[#F4F2ED]">
              Today's Schedule
            </h3>
          </div>

          <div className="space-y-3">
            {todayTasks.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-[#E8E5DF] dark:border-[#2B2D34]">
                <CheckSquare className="w-6 h-6 text-[#A0A4AD] mx-auto mb-2" />
                <p className="text-xs text-[#6E7179] dark:text-[#A0A4AD]">No works scheduled for today.</p>
              </div>
            ) : (
              todayTasks.map((t) => (
                <div key={t.id} className="p-3 bg-[#FAF8F5] dark:bg-[#121316] border-l-2 border-[#16171A] dark:border-[#F4F2ED] space-y-1">
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-bold text-[#16171A] dark:text-[#F4F2ED]">
                      {t.title || t.name}
                    </h4>
                    <span className="text-[10px] font-mono text-[#6E7179] dark:text-[#A0A4AD]">
                      {t.progress}%
                    </span>
                  </div>
                  {t.room?.name && (
                    <div className="text-[10px] text-[#6E7179] dark:text-[#A0A4AD]">
                      Location: {t.room.name}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </section>

      {/* 📷 RECENT SITE INSPECTION GALLERY */}
      <section className="arch-card p-6 space-y-6">
        <div className="flex justify-between items-center border-b border-[#E8E5DF] dark:border-[#2B2D34] pb-4">
          <div>
            <div className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#6E7179] dark:text-[#A0A4AD]">
              PHOTOGRAPHIC EVIDENCE
            </div>
            <h3 className="font-serif text-xl font-bold text-[#16171A] dark:text-[#F4F2ED]">
              Recent Site Inspections
            </h3>
          </div>
          <Camera className="w-5 h-5 text-[#6E7179] dark:text-[#A0A4AD]" />
        </div>

        {recentPhotos.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-[#E8E5DF] dark:border-[#2B2D34]">
            <Camera className="w-8 h-8 text-[#A0A4AD] mx-auto mb-2" />
            <p className="text-xs text-[#6E7179] dark:text-[#A0A4AD]">No site photos logged yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {recentPhotos.map((photo) => (
              <div key={photo.id} className="arch-image-card aspect-square group cursor-pointer border border-[#E8E5DF] dark:border-[#2B2D34]">
                <img 
                  src={photo.url} 
                  alt={photo.caption || 'Site Photo'} 
                  loading="lazy" 
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end text-[10px] text-white">
                  <p className="font-semibold truncate">{photo.caption || 'Site Inspection'}</p>
                  <p className="text-[8px] text-white/70">{new Date(photo.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
};

export default Dashboard;
