import React from 'react';
import {
  Search,
  Building2,
  Calendar,
  Users,
  FileCheck2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  BarChart2,
  Database,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { AnalyticsData } from '../services/analyticsService';
import { DatasetSummary } from '../types/campus';
import { NavTab } from './Navigation';

interface OverviewViewProps {
  analytics: AnalyticsData;
  summary: DatasetSummary;
  onNavigate: (tab: NavTab) => void;
  onQuickSearch: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  analytics,
  summary,
  onNavigate,
  onQuickSearch
}) => {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Hero Banner with Datathon Problem Statement */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-850 to-blue-950 text-white p-6 md:p-10 border border-slate-800 shadow-sm">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Datathon MVP · Educational Space Allocation Engine</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-3">
            The Campus Has Space. <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-sky-300 to-blue-200">
              Students Don&apos;t.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 mb-6 leading-relaxed">
            CampusSpace AI reconciles 5,000 recurring course blocks, 1,800 scheduled events, and 120 campus facilities to solve room discovery and bottleneck allocation for university clubs, study groups, faculty, and administrators.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('finder')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-teal-500 text-slate-950 font-semibold text-sm hover:bg-teal-400 transition-colors shadow-sm cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Launch Smart Room Finder</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('analytics')}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-white text-sm font-medium border border-slate-700 transition-colors cursor-pointer"
            >
              <BarChart2 className="w-4 h-4 text-slate-300" />
              <span>Explore Demand Analytics</span>
            </button>
          </div>
        </div>

        {/* Ambient subtle glow background */}
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Dataset & Integrity Health Banner */}
      <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 text-xs text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-amber-950 dark:text-amber-100">Datathon Data Governance &amp; Availability Notice:</span>{' '}
            All data loaded is synthetic educational test data. Room availability signifies{' '}
            <span className="underline font-medium">zero detected conflict</span> in the 5,000 class schedules and 1,800 dated event records, not real-time physical sensor occupancy.
          </div>
        </div>
        <div className="text-[11px] font-mono text-amber-800 dark:text-amber-300 shrink-0 whitespace-nowrap">
          Source: {summary.isCustomLoaded ? 'Custom User Upload' : 'Default Benchmark CSVs'}
        </div>
      </div>

      {/* Key Metric KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Campus Rooms</span>
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl lg:text-3xl font-bold text-slate-900 tabular-nums">
            {analytics.totalRooms}
          </div>
          <p className="text-xs text-slate-500 mt-1">Across 5 academic buildings</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Class Slots</span>
            <Calendar className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl lg:text-3xl font-bold text-slate-900 tabular-nums">
            {analytics.totalClasses.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500 mt-1">Mon–Sat recurring timetable</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Dated Events</span>
            <Clock className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl lg:text-3xl font-bold text-slate-900 tabular-nums">
            {analytics.totalEvents.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500 mt-1">Aug 2025 – Nov 2025 records</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Room Requests</span>
            <FileCheck2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl lg:text-3xl font-bold text-slate-900 tabular-nums">
            {analytics.totalRequests.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500 mt-1">Unassigned demand records</p>
        </div>
      </div>

      {/* 2-Column Split: Demo Path & Core Mechanisms */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommended Live Demo Pathway */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Live Datathon Demonstration Pathway</h2>
              <p className="text-xs text-slate-500">Recommended 5-step evaluation sequence for judges</p>
            </div>
            <span className="text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
              Datathon Guide
            </span>
          </div>

          <ol className="space-y-4">
            <li className="flex items-start gap-3.5">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">1</span>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Test Capacity &amp; Facility Constraints</h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Navigate to <strong>Smart Room Finder</strong>. Search for a room with 60+ capacity on Wednesday 14:00 with Projector. Notice only matching rooms with zero schedule conflicts are ranked.
                </p>
              </div>
            </li>

            <li className="flex items-start gap-3.5">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Inspect Explainable Match Scoring</h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Examine each candidate room&apos;s score breakdown: Capacity Fit (40 pts), Facility Bonus (25 pts), Accessibility &amp; Location (15 pts), and Schedule Buffer (20 pts).
                </p>
              </div>
            </li>

            <li className="flex items-start gap-3.5">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">3</span>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Observe Conflict Detection in Action</h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Toggle on &quot;Show Conflicted &amp; Ineligible Rooms&quot; in the finder. See exactly which class code or dated event blocks a room during the requested interval.
                </p>
              </div>
            </li>

            <li className="flex items-start gap-3.5">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">4</span>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Analyze Real Request Bottlenecks</h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Open <strong>Demand Analytics</strong>. Notice peak unassigned request times (14:00–18:00), study group demand dominance, and the mismatch between small study group demand and large lecture hall supply.
                </p>
              </div>
            </li>

            <li className="flex items-start gap-3.5">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">5</span>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Validate Data Integrity &amp; CSV Custom Imports</h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Visit <strong>Data Management</strong> to audit the loaded schema, upload custom CSVs, download match reports, or reset to original datasets.
                </p>
              </div>
            </li>
          </ol>
        </div>

        {/* System & Architecture Invariants */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-5 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-1">Architecture &amp; Data Rules</h2>
            <p className="text-xs text-slate-500 mb-4">Core invariants governing this datathon application</p>

            <div className="space-y-3.5 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-1.5 font-semibold text-slate-800 mb-1">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <span>Rule-Based Deterministic Engine</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  No hallucinated ML models or black boxes. Availability and scores are computed through transparent mathematical formulas and verified interval intersection.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-1.5 font-semibold text-slate-800 mb-1">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>Back-to-Back Precision</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Events ending at 14:00 do not overlap with bookings starting at 14:00. Intervals are evaluated as half-open: <code className="font-mono text-slate-700">[start, end)</code>.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-1.5 font-semibold text-slate-800 mb-1">
                  <Database className="w-4 h-4 text-purple-600" />
                  <span>Client-Side Zero-Cost Engine</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  100% free stack: in-browser parsing via PapaParse, reactive state, and Recharts. Zero external paid API or cloud subscriptions required.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('finder')}
            className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span>Start Searching Rooms</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
