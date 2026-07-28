import React, { useState, useEffect, useRef } from 'react';
import client from '../api/client';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  FileSpreadsheet, 
  Download, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  HardHat, 
  Loader2, 
  Building2, 
  FileText,
  Printer
} from 'lucide-react';

export type ReportType = 'daily' | 'weekly' | 'snag' | 'completion';

const Reports: React.FC = () => {
  const [activeType, setActiveType] = useState<ReportType>('daily');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exportingPdf, setExportingPdf] = useState(false);

  const reportRef = useRef<HTMLDivElement>(null);

  const fetchReport = async (type: ReportType) => {
    try {
      setLoading(true);
      setError('');
      const res = await client.get(`/api/reports/${type}`);
      setReportData(res.data);
    } catch (err: any) {
      console.error('Failed to fetch report data:', err);
      setError(err.response?.data?.error || 'Failed to generate report dataset from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(activeType);
  }, [activeType]);

  const handleExportPDF = async () => {
    if (!reportRef.current || !reportData) return;

    setExportingPdf(true);
    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#060814',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`DFOLIO_${activeType.toUpperCase()}_REPORT_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err: any) {
      console.error('PDF Export Error:', err);
      // Fallback: Trigger native browser print engine
      window.print();
    } finally {
      setExportingPdf(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* HEADER & CONTROLS */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            Executive Construction Reports & PDF Export
          </h3>
          <p className="text-xs text-slate-400">
            Generate and export PDF reports for Daily Site Logs, Weekly Summaries, Snags, and Project Handover.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all border border-slate-700"
            title="Print Report"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>

          <button
            onClick={handleExportPDF}
            disabled={exportingPdf || loading || !reportData}
            className="flex items-center justify-center gap-2 py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all shadow-[0_4px_15px_rgba(16,185,129,0.25)] disabled:opacity-50"
          >
            {exportingPdf ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Exporting PDF...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" /> Export PDF
              </>
            )}
          </button>
        </div>
      </div>

      {/* REPORT TYPE TABS */}
      <div className="glass-card p-2 rounded-2xl flex flex-wrap gap-2">
        {([
          { id: 'daily', label: 'Daily Progress Report', icon: Clock },
          { id: 'weekly', label: 'Weekly Execution Report', icon: Calendar },
          { id: 'snag', label: 'Snag & Defect Report', icon: AlertTriangle },
          { id: 'completion', label: 'Handover & Completion Report', icon: CheckCircle2 },
        ] as const).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeType === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveType(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-500/30 text-red-200 text-sm rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* PREVIEW CONTAINER FOR PDF EXPORT */}
      {loading ? (
        <div className="glass-card p-16 text-center rounded-2xl">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Generating Live Report Data...</p>
        </div>
      ) : !reportData ? (
        <div className="glass-card p-12 text-center rounded-2xl">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-300 text-sm font-semibold">No Data Available</p>
        </div>
      ) : (
        <div ref={reportRef} className="glass-panel p-8 rounded-2xl space-y-6 bg-[#060814] text-white border border-white/10 shadow-2xl">
          
          {/* REPORT HEADER BRANDING */}
          <div className="flex justify-between items-start border-b border-white/10 pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-500/20 border border-emerald-500/30 rounded-xl flex items-center justify-center text-emerald-400 font-black text-sm">
                  <HardHat className="w-4 h-4" />
                </div>
                <span className="text-lg font-black tracking-widest text-white">DFOLIO CONSTRUCTIONS</span>
              </div>
              <h2 className="text-xl font-extrabold text-white pt-2">{reportData.title}</h2>
              <p className="text-xs text-slate-400">Official Executive Report • Generated {new Date(reportData.generatedAt).toLocaleString()}</p>
            </div>

            <div className="text-right text-xs text-slate-400 font-semibold space-y-1">
              <div className="text-white font-bold uppercase tracking-wider">DFOLIO SYSTEM</div>
              <div>Report ID: #{activeType.toUpperCase()}-{Date.now().toString().slice(-6)}</div>
              <div className="text-emerald-400 font-extrabold">STATUS: VERIFIED</div>
            </div>
          </div>

          {/* METRICS CARDS */}
          {reportData.type === 'daily' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-900/80 rounded-xl border border-white/5">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Active Tasks Today</div>
                <div className="text-2xl font-black text-white mt-1">{reportData.metrics.activeTasksCount}</div>
              </div>
              <div className="p-4 bg-slate-900/80 rounded-xl border border-white/5">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Total Workers On Site</div>
                <div className="text-2xl font-black text-emerald-400 mt-1">{reportData.metrics.totalLaborOnSite}</div>
              </div>
              <div className="p-4 bg-slate-900/80 rounded-xl border border-white/5">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Site Notes Filed</div>
                <div className="text-2xl font-black text-purple-400 mt-1">{reportData.metrics.notesCount}</div>
              </div>
              <div className="p-4 bg-slate-900/80 rounded-xl border border-white/5">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Photos Captured</div>
                <div className="text-2xl font-black text-brand-400 mt-1">{reportData.metrics.photosCount}</div>
              </div>
            </div>
          )}

          {reportData.type === 'weekly' && (
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-slate-900/80 rounded-xl border border-white/5">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Total Weekly Tasks</div>
                <div className="text-2xl font-black text-white mt-1">{reportData.metrics.totalWeeklyTasks}</div>
              </div>
              <div className="p-4 bg-slate-900/80 rounded-xl border border-white/5">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Avg Progress %</div>
                <div className="text-2xl font-black text-emerald-400 mt-1">{reportData.metrics.avgProgressPercent}%</div>
              </div>
              <div className="p-4 bg-slate-900/80 rounded-xl border border-white/5">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Delayed Tasks</div>
                <div className="text-2xl font-black text-red-400 mt-1">{reportData.metrics.delayedTasksCount}</div>
              </div>
            </div>
          )}

          {reportData.type === 'snag' && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="p-3 bg-slate-900/80 rounded-xl border border-white/5">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Total Snags</div>
                <div className="text-xl font-black text-white mt-1">{reportData.metrics.totalSnags}</div>
              </div>
              <div className="p-3 bg-slate-900/80 rounded-xl border border-white/5">
                <div className="text-[10px] font-bold text-red-400 uppercase">Open</div>
                <div className="text-xl font-black text-red-400 mt-1">{reportData.metrics.open}</div>
              </div>
              <div className="p-3 bg-slate-900/80 rounded-xl border border-white/5">
                <div className="text-[10px] font-bold text-brand-400 uppercase">In Progress</div>
                <div className="text-xl font-black text-brand-400 mt-1">{reportData.metrics.inProgress}</div>
              </div>
              <div className="p-3 bg-slate-900/80 rounded-xl border border-white/5">
                <div className="text-[10px] font-bold text-amber-300 uppercase">Resolved</div>
                <div className="text-xl font-black text-amber-300 mt-1">{reportData.metrics.resolved}</div>
              </div>
              <div className="p-3 bg-slate-900/80 rounded-xl border border-white/5">
                <div className="text-[10px] font-bold text-emerald-400 uppercase">Closed</div>
                <div className="text-xl font-black text-emerald-400 mt-1">{reportData.metrics.closed}</div>
              </div>
            </div>
          )}

          {reportData.type === 'completion' && (
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 bg-slate-900/80 rounded-xl border border-white/5">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Overall Completion</div>
                <div className="text-2xl font-black text-emerald-400 mt-1">{reportData.metrics.overallProgressPercent}%</div>
              </div>
              <div className="p-4 bg-slate-900/80 rounded-xl border border-white/5">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Total Tasks</div>
                <div className="text-2xl font-black text-white mt-1">{reportData.metrics.totalTasks}</div>
              </div>
              <div className="p-4 bg-slate-900/80 rounded-xl border border-white/5">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Completed Tasks</div>
                <div className="text-2xl font-black text-emerald-300 mt-1">{reportData.metrics.completedTasks}</div>
              </div>
              <div className="p-4 bg-slate-900/80 rounded-xl border border-white/5">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Rooms Handled</div>
                <div className="text-2xl font-black text-cyan-400 mt-1">{reportData.metrics.roomsCount}</div>
              </div>
            </div>
          )}

          {/* REPORT DATA TABLES */}
          <div className="space-y-3 pt-2">
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-400" /> Executive Data Breakdown
            </h4>

            {reportData.type === 'daily' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="p-3">Task Title</th>
                      <th className="p-3">Room / Floor</th>
                      <th className="p-3">Trade / SubWork</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Progress</th>
                      <th className="p-3">Labour</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    {reportData.tasks.map((t: any) => (
                      <tr key={t.id}>
                        <td className="p-3 font-bold text-white">{t.name || t.title}</td>
                        <td className="p-3">{t.room?.name || 'Site'}</td>
                        <td className="p-3">{t.subWork?.name || 'General'}</td>
                        <td className="p-3 uppercase font-extrabold text-brand-400">{t.status}</td>
                        <td className="p-3 font-bold">{t.progress}%</td>
                        <td className="p-3">{t.labourCount || 1} Workers</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {reportData.type === 'weekly' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="p-3">Task Title</th>
                      <th className="p-3">Start Date</th>
                      <th className="p-3">End Date</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Progress</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    {reportData.tasks.map((t: any) => (
                      <tr key={t.id}>
                        <td className="p-3 font-bold text-white">{t.name || t.title}</td>
                        <td className="p-3">{new Date(t.startDate).toLocaleDateString()}</td>
                        <td className="p-3">{new Date(t.endDate).toLocaleDateString()}</td>
                        <td className="p-3 uppercase font-extrabold text-cyan-400">{t.status}</td>
                        <td className="p-3 font-bold">{t.progress}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {reportData.type === 'snag' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="p-3">Defect Title</th>
                      <th className="p-3">Room</th>
                      <th className="p-3">Priority</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Assigned Labour</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    {reportData.snags.map((s: any) => (
                      <tr key={s.id}>
                        <td className="p-3 font-bold text-white">{s.title}</td>
                        <td className="p-3">{s.room?.name || 'Site'}</td>
                        <td className="p-3 uppercase font-bold text-orange-400">{s.priority}</td>
                        <td className="p-3 uppercase font-extrabold text-red-400">{s.status}</td>
                        <td className="p-3">{s.assignedTo?.name || 'Unassigned'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {reportData.type === 'completion' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="p-3">Room Name</th>
                      <th className="p-3">Floor</th>
                      <th className="p-3">Tasks Count</th>
                      <th className="p-3">Completion %</th>
                      <th className="p-3">Pending Defect Snags</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    {reportData.rooms.map((r: any) => (
                      <tr key={r.id}>
                        <td className="p-3 font-bold text-white">{r.name}</td>
                        <td className="p-3">{r.floorName || 'General Floor'}</td>
                        <td className="p-3">{r.taskCount} Tasks</td>
                        <td className="p-3 font-bold text-emerald-400">{r.progress}%</td>
                        <td className="p-3 text-red-400 font-bold">{r.pendingSnags} Snags</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* SIGNATURE & AUTHORIZATION BLOCK */}
          <div className="pt-8 border-t border-white/10 grid grid-cols-2 gap-8 text-xs text-slate-400">
            <div>
              <div className="border-b border-slate-700 pb-8 text-slate-500 italic">Site Engineer Signature</div>
              <div className="pt-2 font-bold text-white">Prepared By: Site Inspection Manager</div>
            </div>
            <div>
              <div className="border-b border-slate-700 pb-8 text-slate-500 italic">Project Manager Approval</div>
              <div className="pt-2 font-bold text-white">Approved By: Chief Construction Manager</div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default Reports;
