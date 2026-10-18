import React, { useState } from 'react';
import {
  Upload,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RotateCcw,
  Download,
  Database,
  FileSpreadsheet,
  FileText,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { DatasetSummary, ValidationIssue } from '../types/campus';
import { dataService } from '../services/dataService';

interface DataManagementViewProps {
  summary: DatasetSummary;
  onResetDefault: () => void;
}

export const DataManagementView: React.FC<DataManagementViewProps> = ({
  summary,
  onResetDefault
}) => {
  const [selectedTable, setSelectedTable] = useState<'rooms' | 'class_schedule' | 'events' | 'room_requests'>('rooms');
  const [uploadStatus, setUploadStatus] = useState<{
    success?: boolean;
    message?: string;
    issues?: ValidationIssue[];
  } | null>(null);

  const tableSchemas = {
    rooms: {
      name: 'Rooms Inventory (rooms.csv)',
      desc: 'Campus space facilities, seating capacities, and equipment specifications',
      requiredCols: ['room_id', 'building', 'floor', 'room_type', 'capacity', 'projector', 'computers', 'accessible', 'power_outlets'],
      count: summary.roomsCount,
      sampleFile: '/data/rooms.csv'
    },
    class_schedule: {
      name: 'Class Timetable (class_schedule.csv)',
      desc: 'Recurring Mon–Sat departmental lecture and laboratory schedule slots',
      requiredCols: ['schedule_id', 'room_id', 'course_code', 'weekday', 'start_hour', 'duration_hours', 'expected_attendance', 'department'],
      count: summary.classesCount,
      sampleFile: '/data/class_schedule.csv'
    },
    events: {
      name: 'Campus Events (events.csv)',
      desc: 'Dated seminars, exams, club meetings, and guest lectures with actual vs expected attendance',
      requiredCols: ['event_id', 'room_id', 'event_type', 'start_time', 'duration_hours', 'expected_attendance', 'actual_attendance'],
      count: summary.eventsCount,
      sampleFile: '/data/events.csv'
    },
    room_requests: {
      name: 'Room Requests (room_requests.csv)',
      desc: 'Student and faculty demand tickets before room assignment (unassigned demand)',
      requiredCols: ['request_id', 'request_date', 'start_hour', 'duration_hours', 'required_capacity', 'projector_required', 'computers_required', 'purpose', 'status'],
      count: summary.requestsCount,
      sampleFile: '/data/room_requests.csv'
    }
  };

  const currentSchema = tableSchemas[selectedTable];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      const text = evt.target?.result as string;
      if (!text || !text.trim()) {
        setUploadStatus({
          success: false,
          message: 'The selected file is empty. Please choose a valid CSV.',
          issues: [{ table: selectedTable, message: 'File contains 0 bytes of content', severity: 'error' }]
        });
        return;
      }

      const res = dataService.updateTable(selectedTable, text);
      setUploadStatus(res);
    };
    reader.onerror = () => {
      setUploadStatus({
        success: false,
        message: 'Failed to read file from local disk.',
        issues: [{ table: selectedTable, message: 'FileReader encountered an unexpected I/O error', severity: 'error' }]
      });
    };
    reader.readAsText(file);
    // Reset input so same file can be re-selected if edited
    e.target.value = '';
  };

  const handleDownloadTemplate = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            Data Management &amp; Validation
            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
              summary.isCustomLoaded ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {summary.isCustomLoaded ? 'Custom Datasets Active' : 'Default Datathon Benchmark'}
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Audit active table schemas, import replacement CSVs with strict validation, or restore baseline dataset records.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onResetDefault}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors shadow-2xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset to Default Datasets</span>
          </button>
        </div>
      </div>

      {/* Overview Cards of 4 Tables */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(Object.keys(tableSchemas) as Array<keyof typeof tableSchemas>).map(tableKey => {
          const t = tableSchemas[tableKey];
          const isSelected = selectedTable === tableKey;
          return (
            <div
              key={tableKey}
              onClick={() => {
                setSelectedTable(tableKey);
                setUploadStatus(null);
              }}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-white border-teal-500 shadow-sm ring-1 ring-teal-500'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <FileSpreadsheet className={`w-4 h-4 ${isSelected ? 'text-teal-600' : 'text-slate-400'}`} />
                <span className="text-xs font-bold text-slate-900 tabular-nums">
                  {t.count.toLocaleString()} rows
                </span>
              </div>
              <h3 className="text-xs font-bold text-slate-900 mb-0.5 truncate">{t.name}</h3>
              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{t.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Selected Table Manager & Schema Validator */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-teal-600" />
              <h2 className="text-sm font-bold text-slate-900">{currentSchema.name}</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{currentSchema.desc}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleDownloadTemplate(currentSchema.sampleFile, `${selectedTable}.csv`)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Download Raw CSV</span>
            </button>

            <label className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors cursor-pointer shadow-2xs">
              <Upload className="w-3.5 h-3.5 text-teal-400" />
              <span>Upload Replacement CSV</span>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Upload Status Banner */}
        {uploadStatus && (
          <div className={`p-4 border-b text-xs ${
            uploadStatus.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-start gap-2">
              {uploadStatus.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-semibold">{uploadStatus.message}</p>
                {uploadStatus.issues && uploadStatus.issues.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {uploadStatus.issues.slice(0, 5).map((iss, i) => (
                      <div key={i} className="text-[11px] font-mono text-slate-700">
                        • {iss.severity.toUpperCase()} {iss.rowNumber ? `(Row ${iss.rowNumber})` : ''}: {iss.message}
                      </div>
                    ))}
                    {uploadStatus.issues.length > 5 && (
                      <p className="text-[11px] text-slate-500 italic">+ {uploadStatus.issues.length - 5} more issues logged</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Expected Schema Specification Table */}
        <div className="p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Required Schema Specification
          </h3>

          <div className="flex flex-wrap gap-2">
            {currentSchema.requiredCols.map(col => (
              <span
                key={col}
                className="text-xs font-mono px-2.5 py-1 rounded bg-slate-100 text-slate-800 border border-slate-200"
              >
                {col}
              </span>
            ))}
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-2">
            <h4 className="font-semibold text-slate-900 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-slate-400" />
              <span>Import Validation Rules</span>
            </h4>
            <ul className="space-y-1 list-disc list-inside text-slate-600">
              <li>Header row must contain all required column names exactly as documented.</li>
              <li>Numeric columns (<code className="font-mono">start_hour</code>, <code className="font-mono">duration_hours</code>, <code className="font-mono">capacity</code>) are parsed with conservative fallbacks.</li>
              <li>Flags (<code className="font-mono">projector</code>, <code className="font-mono">computers</code>, <code className="font-mono">accessible</code>) accept <code className="font-mono">1</code>, <code className="font-mono">0</code>, or boolean strings.</li>
              <li>The original datasets remain preserved in memory and can be restored anytime via <em>&quot;Reset to Default Datasets&quot;</em>.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
