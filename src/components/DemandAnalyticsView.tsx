import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  AlertCircle,
  FileCheck2,
  Clock,
  Layers,
  Users,
  Filter,
  Info
} from 'lucide-react';
import { AnalyticsData } from '../services/analyticsService';
import { RoomRequest } from '../types/campus';

interface DemandAnalyticsViewProps {
  analytics: AnalyticsData;
  roomRequests: RoomRequest[];
}

const STATUS_COLORS: Record<string, string> = {
  Approved: '#10B981', // emerald
  Waitlisted: '#F59E0B', // amber
  Rejected: '#EF4444', // red
  Cancelled: '#64748B' // slate
};

const PURPOSE_COLORS = ['#0D9488', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899'];

export const DemandAnalyticsView: React.FC<DemandAnalyticsViewProps> = ({
  analytics,
  roomRequests
}) => {
  const [purposeFilter, setPurposeFilter] = useState<string>('All');

  // Filter requests if user selects purpose filter
  const filteredRequests = useMemo(() => {
    if (purposeFilter === 'All') return roomRequests;
    return roomRequests.filter(r => r.purpose === purposeFilter);
  }, [roomRequests, purposeFilter]);

  const approvalRate = useMemo(() => {
    if (filteredRequests.length === 0) return 0;
    const approved = filteredRequests.filter(r => r.status === 'Approved').length;
    return Math.round((approved / filteredRequests.length) * 100);
  }, [filteredRequests]);

  const waitlistRate = useMemo(() => {
    if (filteredRequests.length === 0) return 0;
    const waitlisted = filteredRequests.filter(r => r.status === 'Waitlisted').length;
    return Math.round((waitlisted / filteredRequests.length) * 100);
  }, [filteredRequests]);

  const rejectRate = useMemo(() => {
    if (filteredRequests.length === 0) return 0;
    const rejected = filteredRequests.filter(r => r.status === 'Rejected').length;
    return Math.round((rejected / filteredRequests.length) * 100);
  }, [filteredRequests]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            Demand Analytics Dashboard
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              Computed from 5,000 Requests
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Empirical demand patterns, request bottlenecks, departmental class hours, and event attendance reconciliation.
          </p>
        </div>

        {/* Purpose Filter Selector */}
        <div className="flex items-center gap-2 shrink-0">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-medium text-slate-600">Filter by Purpose:</span>
          <select
            value={purposeFilter}
            onChange={e => setPurposeFilter(e.target.value)}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-2xs"
          >
            <option value="All">All Purposes (5,000)</option>
            <option value="Study group">Study group</option>
            <option value="Class">Class</option>
            <option value="Workshop">Workshop</option>
            <option value="Club meeting">Club meeting</option>
            <option value="Project work">Project work</option>
          </select>
        </div>
      </div>

      {/* Critical Methodological Governance Notice */}
      <div className="p-4 rounded-xl bg-slate-900 text-slate-200 border border-slate-800 text-xs flex items-start gap-3">
        <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed text-slate-300">
          <strong className="text-white">Admin Analytical Integrity Note:</strong> The supplied <code className="text-teal-300">room_requests.csv</code> represents <em>pre-allocation student &amp; faculty demand</em> without assigned <code className="text-teal-300">room_id</code> fields. Per datathon guidelines, true individual room utilization cannot be calculated from unassigned requests. Instead, this dashboard accurately computes <strong>request fulfillment rates, hourly demand spikes, capacity mismatch, and scheduled class hours</strong>.
        </div>
      </div>

      {/* Key Metric Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            Analyzed Requests
          </span>
          <div className="text-2xl lg:text-3xl font-extrabold text-slate-900 tabular-nums">
            {filteredRequests.length.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {purposeFilter === 'All' ? '100% of request dataset' : `Filtered to ${purposeFilter}`}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 block mb-1">
            Approval Rate
          </span>
          <div className="text-2xl lg:text-3xl font-extrabold text-emerald-700 tabular-nums">
            {approvalRate}%
          </div>
          <p className="text-xs text-slate-500 mt-1">Successfully fulfilled demand</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 block mb-1">
            Waitlist Rate
          </span>
          <div className="text-2xl lg:text-3xl font-extrabold text-amber-700 tabular-nums">
            {waitlistRate}%
          </div>
          <p className="text-xs text-slate-500 mt-1">High room scarcity signal</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-red-600 block mb-1">
            Rejection Rate
          </span>
          <div className="text-2xl lg:text-3xl font-extrabold text-red-700 tabular-nums">
            {rejectRate}%
          </div>
          <p className="text-xs text-slate-500 mt-1">Unmet facility or capacity specs</p>
        </div>
      </div>

      {/* Charts Row 1: Request Status & Purpose Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Status Distribution Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-1">Request Status Distribution</h2>
            <p className="text-xs text-slate-500 mb-4">Outcome breakdown across the 5,000 campus room requests</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="count"
                  label={(entry: any) => `${entry.name}: ${entry.percentage}%`}
                >
                  {analytics.statusDistribution.map(entry => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#94A3B8'} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any) => [`${value} requests`, name]}
                  contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-600 pt-2 border-t border-slate-100">
            {analytics.statusDistribution.map(s => (
              <div key={s.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[s.name] }} />
                <span>{s.name}: <strong className="tabular-nums">{s.count.toLocaleString()}</strong> ({s.percentage}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Demand by Purpose Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-1">Demand by Purpose</h2>
            <p className="text-xs text-slate-500 mb-4">Total requested bookings segmented by activity type</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.purposeDistribution} layout="vertical" margin={{ left: 10, right: 30, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={90} />
                <Tooltip
                  formatter={(val: any) => [`${val} requests`, 'Volume']}
                  contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#0D9488" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-xs text-slate-500 pt-2 border-t border-slate-100 text-center">
            Study groups &amp; classes constitute the primary driver of student space requests.
          </div>
        </div>
      </div>

      {/* Charts Row 2: Hourly Demand & Weekday Class Load */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Demand Profile (Peak hours) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-bold text-slate-900">Hourly Request Demand Curve</h2>
            <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
              Peak: 10:00 &amp; 14:00
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-4">Volume of room requests requested by start hour</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.hourlyDemand} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any) => [`${val} requests`, 'Demand']}
                  contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="count" stroke="#0D9488" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Scheduled Class Hours by Weekday */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-bold text-slate-900">Scheduled Class Hours by Weekday</h2>
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
              Mon–Sat Timetable
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-4">Total recurring class hours committed per day across all 120 rooms</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.weekdayClassLoad} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="weekday" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any) => [`${val} hours`, 'Class Hours']}
                  contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="scheduledHours" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 3: Requested Capacity & Event Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Requested Capacity Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <h2 className="text-sm font-bold text-slate-900 mb-1">Requested Capacity Distribution</h2>
          <p className="text-xs text-slate-500 mb-4">Seating size groups requested by organizers</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.capacityDistribution} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any) => [`${val} requests`, 'Requests']}
                  contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expected vs Actual Event Attendance */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <h2 className="text-sm font-bold text-slate-900 mb-1">Event Expected vs. Actual Attendance</h2>
          <p className="text-xs text-slate-500 mb-4">Average attendance variance computed from 1,800 event records</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.eventAttendanceComparison} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="eventType" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any, name: any) => [`${val} attendees`, name === 'expectedAvg' ? 'Expected Avg' : 'Actual Avg']}
                  contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend formatter={(val) => val === 'expectedAvg' ? 'Expected Attendance' : 'Actual Turnout'} wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="expectedAvg" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actualAvg" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Department Class Hours & Building Inventory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department load */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <h2 className="text-sm font-bold text-slate-900 mb-1">Department Scheduled Teaching Hours</h2>
          <p className="text-xs text-slate-500 mb-3">Academic load across the 6 campus departments</p>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3 text-right">Class Sections</th>
                  <th className="py-2.5 px-3 text-right">Total Hours</th>
                  <th className="py-2.5 px-3 text-right">% of Timetable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {analytics.departmentClassHours.map(d => {
                  const totalHrs = analytics.departmentClassHours.reduce((acc, curr) => acc + curr.hours, 0);
                  const pct = totalHrs > 0 ? ((d.hours / totalHrs) * 100).toFixed(1) : '0';
                  return (
                    <tr key={d.department} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-medium text-slate-900">{d.department}</td>
                      <td className="py-2 px-3 text-right tabular-nums text-slate-600">{d.classes.toLocaleString()}</td>
                      <td className="py-2 px-3 text-right tabular-nums font-semibold text-slate-800">{d.hours.toLocaleString()} hrs</td>
                      <td className="py-2 px-3 text-right tabular-nums text-slate-500">{pct}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Building Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <h2 className="text-sm font-bold text-slate-900 mb-1">Campus Building Seat Inventory</h2>
          <p className="text-xs text-slate-500 mb-3">Facility distribution across the 120 rooms</p>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Building</th>
                  <th className="py-2.5 px-3 text-right">Rooms</th>
                  <th className="py-2.5 px-3 text-right">Total Seating</th>
                  <th className="py-2.5 px-3 text-right">Avg Capacity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {analytics.buildingBreakdown.map(b => (
                  <tr key={b.building} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-medium text-slate-900">{b.building}</td>
                    <td className="py-2 px-3 text-right tabular-nums text-slate-600">{b.roomCount}</td>
                    <td className="py-2 px-3 text-right tabular-nums font-semibold text-teal-700">{b.totalSeats.toLocaleString()} seats</td>
                    <td className="py-2 px-3 text-right tabular-nums text-slate-600">{b.avgCapacity} seats</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
