import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Brain,
  Code2,
  Layers,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const MethodologyView: React.FC = () => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          Methodology, Algorithmic Transparency &amp; Data Ethics
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Complete disclosure of mathematical formulas, conflict-detection geometry, and machine-learning boundaries.
        </p>
      </div>

      {/* 1. The Matching Pipeline */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 text-teal-700">
          <Code2 className="w-5 h-5" />
          <h2 className="text-base font-bold text-slate-900">Deterministic 6-Stage Matching Pipeline</h2>
        </div>

        <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
            <span className="font-bold text-slate-900 block mb-1">Stage 1: Input Validation</span>
            Verifies start time (<code className="font-mono">07:00–22:00</code>), duration (<code className="font-mono">1–6 hrs</code>), end time (<code className="font-mono">&le; 24:00</code>), and requested capacity.
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
            <span className="font-bold text-slate-900 block mb-1">Stage 2: Mandatory Constraints Filter</span>
            Rooms with <code className="font-mono">capacity &lt; minCapacity</code> or lacking required facilities (<code className="font-mono">projector</code>, <code className="font-mono">computers</code>, <code className="font-mono">accessible</code>) are filtered out immediately. High score cannot override mandatory specs.
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
            <span className="font-bold text-slate-900 block mb-1">Stage 3: Recurring Timetable Conflict Detection</span>
            Evaluates recurring classes for the specified weekday. Evaluates overlap strictly using half-open intervals:
            <div className="p-2 my-1.5 font-mono bg-white rounded border border-slate-200 text-teal-900">
              overlap = (searchStart &lt; classEnd) &amp;&amp; (classStart &lt; searchEnd)
            </div>
            Back-to-back classes (e.g., class ending at 11:00 and search starting at 11:00) do NOT overlap.
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
            <span className="font-bold text-slate-900 block mb-1">Stage 4: Dated Event Conflict Detection</span>
            Cross-references <code className="font-mono">events.csv</code> for rooms hosting seminars, exams, or guest lectures on the specific calendar date.
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
            <span className="font-bold text-slate-900 block mb-1">Stage 5: Transparent Mathematical Scoring (0–100)</span>
            Available rooms with zero conflicts receive a multi-factor score:
            <ul className="list-disc list-inside mt-1.5 space-y-1 text-slate-700">
              <li><strong>Capacity Efficiency (Max 40 pts):</strong> <code className="font-mono">Math.round((needed / room.capacity) * 40)</code> — rewards close fits and discourages wasting 160-seat halls on 20-person groups.</li>
              <li><strong>Facility Match &amp; Amenities (Max 25 pts):</strong> 15 base + bonus for projector (+3), PCs (+3), step-free accessibility (+2), and &gt;15 outlets (+2).</li>
              <li><strong>Location Convenience (Max 15 pts):</strong> Central building (+4) and ground/1st floor accessibility (+5).</li>
              <li><strong>Schedule Buffer (Max 20 pts):</strong> Rewards rooms with lighter total daily load on that day (+20 for &le;2 hrs, +14 for &le;5 hrs).</li>
            </ul>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
            <span className="font-bold text-slate-900 block mb-1">Stage 6: Natural Language Explanation Generation</span>
            Generates specific reasons from the actual computations (e.g. capacity efficiency percentage, amenities satisfied, zero conflicts).
          </div>
        </div>
      </div>

      {/* 2. Machine Learning & Forecasting Honesty */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 text-blue-700">
          <Brain className="w-5 h-5" />
          <h2 className="text-base font-bold text-slate-900">Machine Learning &amp; AI Honesty Policy</h2>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Per competition instructions, we strictly maintain scientific honesty regarding AI &amp; Machine Learning:
        </p>

        <div className="space-y-3 text-xs">
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900">
            <strong className="block mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>What is Implemented (Working Deterministic MVP):</span>
            </strong>
            A rigorous rule-based recommendation engine, exact interval overlap detection, data validation, and empirical demand aggregations. No synthetic black-box models are pretended.
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
            <strong className="block mb-1 text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Proposed Future AI / ML Enhancements (Future Scope):</span>
            </strong>
            <ul className="list-disc list-inside space-y-1 mt-1 text-slate-600">
              <li><strong>Time-Series Demand Forecasting:</strong> An ARIMA or gradient-boosted tree model trained over multi-semester historical request trends to predict weekly demand surges by department.</li>
              <li><strong>Dynamic Room Swapping:</strong> An automated constraint-satisfaction solver (ILP) that can suggest mutually beneficial room swaps when clubs need larger space.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 3. Room Utilization Limitations */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-3 text-xs text-slate-600">
        <div className="flex items-center gap-2 text-amber-700">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <h2 className="text-base font-bold text-slate-900">Why Unassigned Requests Cannot Determine True Room Utilization</h2>
        </div>

        <p className="leading-relaxed">
          In the supplied datathon schema, <code className="font-mono text-slate-800">room_requests.csv</code> contains student request tickets (<code className="font-mono">request_id</code>, <code className="font-mono">required_capacity</code>, <code className="font-mono">purpose</code>, <code className="font-mono">status</code>) without an assigned <code className="font-mono">room_id</code>.
        </p>
        <p className="leading-relaxed">
          Claiming individual room utilization rates from this table would be scientifically fraudulent because unassigned requests reflect <em>unallocated student demand</em>, not verified room occupancy. True physical room utilization requires either assigned booking logs, electronic door-badge entry scans, or occupancy sensors.
        </p>
      </div>
    </div>
  );
};
