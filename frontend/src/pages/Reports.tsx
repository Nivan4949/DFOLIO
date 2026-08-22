import React, { useState, useEffect, useRef } from 'react';
import client from '../api/client';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  Download, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2, 
  Printer,
  Camera,
  X
} from 'lucide-react';

export type ReportType = 'daily' | 'weekly' | 'snag' | 'completion' | 'gallery';

interface PhotoItem {
  id: string;
  url: string;
  caption?: string | null;
  createdAt: string;
  task?: { name: string; room?: { name: string; floor?: { name: string } } };
}

const Reports: React.FC = () => {
  const [activeType, setActiveType] = useState<ReportType>('daily');
  const [reportData, setReportData] = useState<any>(null);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exportingPdf, setExportingPdf] = useState(false);

  const reportRef = useRef<HTMLDivElement>(null);

  const fetchReport = async (type: ReportType) => {
    try {
      setLoading(true);
      setError('');
      if (type === 'gallery') {
        const res = await client.get('/api/photos');
        setPhotos(res.data);
      } else {
        const res = await client.get(`/api/reports/${type}`);
        setReportData(res.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch data:', err);
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
        backgroundColor: '#FAF8F5',
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
      window.print();
    } finally {
      setExportingPdf(false);
    }
  };

  return (
    <div className="space-y-10 animate-fade-in">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E8E5DF] dark:border-[#2B2D34] pb-6">
        <div>
          <div className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#6E7179] dark:text-[#A0A4AD]">
            PROJECT DOCUMENTATION & EXPORTS
          </div>
          <h2 className="font-serif text-3xl font-bold text-[#16171A] dark:text-[#F4F2ED] tracking-tight mt-1">
            Executive Reports & Photo Gallery
          </h2>
          <p className="text-xs text-[#6E7179] dark:text-[#A0A4AD] mt-1 max-w-xl">
            Generate printable PDF executive documentation or inspect site photo logs.
          </p>
        </div>

        {activeType !== 'gallery' && (
          <div className="flex items-center gap-3">
            <button onClick={() => window.print()} className="arch-btn-secondary flex items-center gap-2">
              <Printer className="w-3.5 h-3.5" /> Print
            </button>

            <button
              onClick={handleExportPDF}
              disabled={exportingPdf || loading || !reportData}
              className="arch-btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              {exportingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span>Export PDF</span>
            </button>
          </div>
        )}
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex flex-wrap gap-2 border-b border-[#E8E5DF] dark:border-[#2B2D34] pb-4">
        {[
          { id: 'daily', label: 'Daily Log', icon: Clock },
          { id: 'weekly', label: 'Weekly Summary', icon: Calendar },
          { id: 'snag', label: 'Defect Snags', icon: AlertTriangle },
          { id: 'completion', label: 'Handover & Completion', icon: CheckCircle2 },
          { id: 'gallery', label: 'Photo Gallery', icon: Camera },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeType === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveType(tab.id as ReportType)}
              className={`flex items-center gap-2 text-xs font-mono px-4 py-2 border transition-all ${
                isActive
                  ? 'bg-[#16171A] dark:bg-[#F4F2ED] text-[#FAF8F5] dark:text-[#16171A] border-[#16171A] dark:border-[#F4F2ED]'
                  : 'bg-transparent border-[#E8E5DF] dark:border-[#2B2D34] text-[#6E7179] dark:text-[#A0A4AD] hover:border-[#16171A]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-sm">
          {error}
        </div>
      )}

      {/* 📸 MASONRY PHOTO GALLERY MODE */}
      {activeType === 'gallery' ? (
        loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-64 arch-skeleton" />)}
          </div>
        ) : photos.length === 0 ? (
          <div className="arch-card p-16 text-center">
            <Camera className="w-12 h-12 text-[#8C8F99] mx-auto mb-3" />
            <h3 className="font-serif text-xl font-bold text-[#16171A] dark:text-[#F4F2ED]">No Site Photos</h3>
            <p className="text-xs text-[#6E7179] dark:text-[#A0A4AD] mt-1">Upload inspection photos inside work task panels.</p>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {photos.map((photo) => (
              <div 
                key={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                className="arch-card arch-image-card break-inside-avoid group cursor-pointer overflow-hidden relative"
              >
                <img src={photo.url} alt={photo.caption || 'Site photo'} loading="lazy" className="w-full object-cover" />
                <div className="arch-image-overlay">
                  <div className="space-y-1">
                    <div className="text-[9px] font-mono text-white/70">
                      {new Date(photo.createdAt).toLocaleDateString()}
                    </div>
                    <div className="font-serif text-base font-bold text-white leading-snug">
                      {photo.caption || photo.task?.name || 'Inspection Log'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* 📄 EDITORIAL PDF REPORT PREVIEW */
        loading ? (
          <div className="arch-card p-16 text-center">
            <Loader2 className="w-8 h-8 text-[#16171A] dark:text-[#F4F2ED] animate-spin mx-auto mb-3" />
            <p className="text-xs text-[#6E7179] dark:text-[#A0A4AD]">Compiling Executive Report...</p>
          </div>
        ) : reportData && (
          <div ref={reportRef} className="arch-card p-10 space-y-8 bg-[#FAF8F5] dark:bg-[#121316] text-[#16171A] dark:text-[#F4F2ED]">
            
            {/* Header branding */}
            <div className="flex justify-between items-start border-b border-[#E8E5DF] dark:border-[#2B2D34] pb-6">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#6E7179]">DFOLIO ARCHITECTURAL STUDIO</div>
                <h1 className="font-serif text-3xl font-bold mt-1">{reportData.title}</h1>
                <p className="text-xs text-[#6E7179] mt-0.5">Generated {new Date(reportData.generatedAt).toLocaleString()}</p>
              </div>

              <div className="text-right text-xs font-mono space-y-1">
                <div className="font-bold">VERIFIED REPORT</div>
                <div className="text-[10px] text-[#6E7179]">ID: #{activeType.toUpperCase()}-{Date.now().toString().slice(-6)}</div>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 border border-[#E8E5DF] dark:border-[#2B2D34] bg-white dark:bg-[#18191D]">
                <div className="text-[9px] font-mono uppercase text-[#6E7179]">Scope Metric</div>
                <div className="font-serif text-2xl font-bold mt-1">
                  {reportData.metrics?.activeTasksCount || reportData.metrics?.totalWeeklyTasks || reportData.metrics?.totalSnags || reportData.metrics?.totalTasks || 0}
                </div>
              </div>

              <div className="p-4 border border-[#E8E5DF] dark:border-[#2B2D34] bg-white dark:bg-[#18191D]">
                <div className="text-[9px] font-mono uppercase text-[#6E7179]">Status Indicator</div>
                <div className="font-serif text-2xl font-bold mt-1">
                  {reportData.metrics?.avgProgressPercent || reportData.metrics?.overallProgressPercent || reportData.metrics?.open || 100}%
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="pt-4 space-y-3">
              <h3 className="font-serif text-lg font-bold">Executive Log Data</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-[#E8E5DF] dark:border-[#2B2D34]">
                  <thead>
                    <tr className="bg-[#EFECE6] dark:bg-[#1C1D23] font-mono text-[9px] uppercase text-[#6E7179]">
                      <th className="p-3">Item / Task</th>
                      <th className="p-3">Location</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Completion</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E5DF] dark:divide-[#2B2D34]">
                    {(reportData.tasks || reportData.snags || reportData.rooms || []).slice(0, 10).map((row: any, i: number) => (
                      <tr key={i}>
                        <td className="p-3 font-semibold">{row.title || row.name}</td>
                        <td className="p-3 text-[#6E7179]">{row.room?.name || row.floorName || 'Site'}</td>
                        <td className="p-3 font-mono text-[10px] uppercase">{row.status || 'ACTIVE'}</td>
                        <td className="p-3 text-right font-mono font-bold">{row.progress || 100}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Signature */}
            <div className="pt-12 grid grid-cols-2 gap-8 border-t border-[#E8E5DF] dark:border-[#2B2D34] text-xs">
              <div className="border-b border-[#16171A] dark:border-[#F4F2ED] pb-8 text-[#6E7179]">
                Architectural Lead Signature
              </div>
              <div className="border-b border-[#16171A] dark:border-[#F4F2ED] pb-8 text-[#6E7179]">
                Site Engineer Approval
              </div>
            </div>

          </div>
        )
      )}

      {/* LIGHTBOX MODAL */}
      {selectedPhoto && (
        <div 
          onClick={() => setSelectedPhoto(null)} 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md cursor-pointer"
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img src={selectedPhoto.url} alt="Lightbox view" className="max-w-full max-h-[85vh] object-contain shadow-2xl" />
            <div className="absolute top-4 right-4 text-white p-2">
              <X className="w-6 h-6" />
            </div>
            {selectedPhoto.caption && (
              <div className="absolute bottom-4 left-4 right-4 p-4 bg-black/80 text-white font-serif text-lg">
                {selectedPhoto.caption}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default Reports;
