import React, { useState, useMemo } from 'react';
import {
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  Clock,
  Users,
  Building,
  Monitor,
  Projector,
  Accessibility,
  Zap,
  Info,
  ChevronDown,
  ChevronUp,
  Download,
  RotateCcw,
  Sparkles,
  SlidersHorizontal,
  BookmarkPlus
} from 'lucide-react';
import {
  Room,
  ClassSchedule,
  CampusEvent,
  SearchFilters,
  RoomMatchResult,
  Weekday
} from '../types/campus';
import { findMatchingRooms, validateFilters, getWeekdayFromDate } from '../services/matchingEngine';
import { dataService } from '../services/dataService';

interface SmartRoomFinderViewProps {
  rooms: Room[];
  classSchedules: ClassSchedule[];
  events: CampusEvent[];
  onInspectRoom: (room: Room) => void;
  onRequestRoom: (room: Room, filters: SearchFilters) => void;
}

export const SmartRoomFinderView: React.FC<SmartRoomFinderViewProps> = ({
  rooms,
  classSchedules,
  events,
  onInspectRoom,
  onRequestRoom
}) => {
  // Default to a date within the dataset's active semester (e.g. 2025-09-17, Wednesday)
  const [filters, setFilters] = useState<SearchFilters>({
    date: '2025-09-17',
    weekday: 'Wed',
    startHour: 10,
    durationHours: 2,
    minCapacity: 40,
    roomType: 'All',
    building: 'All',
    requireProjector: true,
    requireComputers: false,
    requireAccessible: false,
    minPowerOutlets: 0
  });

  const [showIneligible, setShowIneligible] = useState(false);
  const [expandedScoreId, setExpandedScoreId] = useState<string | null>(null);

  // Sync date change with weekday
  const handleDateChange = (newDate: string) => {
    const wd = getWeekdayFromDate(newDate);
    setFilters(prev => ({ ...prev, date: newDate, weekday: wd }));
  };

  const validation = useMemo(() => validateFilters(filters), [filters]);

  const allResults = useMemo(() => {
    if (!validation.valid) return [];
    return findMatchingRooms(rooms, classSchedules, events, filters);
  }, [rooms, classSchedules, events, filters, validation.valid]);

  const availableResults = useMemo(() => {
    return allResults.filter(r => r.isEligible && !r.hasConflict);
  }, [allResults]);

  const displayedResults = showIneligible ? allResults : availableResults;

  const handleExportMatches = () => {
    const exportData = availableResults.map(r => ({
      Room_ID: r.room.room_id,
      Building: r.room.building,
      Floor: r.room.floor,
      Room_Type: r.room.room_type,
      Capacity: r.room.capacity,
      Requested_Capacity: filters.minCapacity,
      Match_Score: r.score,
      Capacity_Fit_Score: r.scoreBreakdown.capacityFit,
      Facility_Match_Score: r.scoreBreakdown.facilityMatch,
      Location_Score: r.scoreBreakdown.locationConvenience,
      Schedule_Buffer_Score: r.scoreBreakdown.scheduleBuffer,
      Has_Projector: r.room.projector ? 'Yes' : 'No',
      Has_Computers: r.room.computers ? 'Yes' : 'No',
      Accessible: r.room.accessible ? 'Yes' : 'No',
      Power_Outlets: r.room.power_outlets,
      Status: 'Available (No Conflict)'
    }));
    dataService.exportCSV(`campusspace_matches_${filters.weekday}_${filters.startHour}h.csv`, exportData);
  };

  const handleResetFilters = () => {
    setFilters({
      date: '2025-09-17',
      weekday: 'Wed',
      startHour: 10,
      durationHours: 2,
      minCapacity: 40,
      roomType: 'All',
      building: 'All',
      requireProjector: false,
      requireComputers: false,
      requireAccessible: false,
      minPowerOutlets: 0
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header and Live Query Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            Smart Room Finder
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-100 text-teal-800">
              Deterministic Matching
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Evaluates room seating, facility constraints, and cross-references 5,000 class schedules and 1,800 events to eliminate overlaps.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportMatches}
            disabled={availableResults.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Matches (CSV)</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Filter Form & Right Candidates List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Search Criteria Form */}
        <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-5 h-fit lg:sticky lg:top-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-teal-600" />
              <h2 className="text-sm font-bold text-slate-900">Search Requirements</h2>
            </div>
            <button
              onClick={handleResetFilters}
              className="text-[11px] text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Validation Warnings */}
          {!validation.valid && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 space-y-1">
              {validation.errors.map((err, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-600" />
                  <span>{err}</span>
                </div>
              ))}
            </div>
          )}

          {/* Date & Weekday */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-700">
              Date &amp; Weekday Target
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-slate-400 block mb-1">Calendar Date</span>
                <div className="relative">
                  <input
                    type="date"
                    value={filters.date}
                    onChange={e => handleDateChange(e.target.value)}
                    className="w-full text-xs font-mono px-2.5 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block mb-1">Schedule Day</span>
                <select
                  value={filters.weekday}
                  onChange={e => setFilters(prev => ({ ...prev, weekday: e.target.value as Weekday }))}
                  className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Mon">Monday</option>
                  <option value="Tue">Tuesday</option>
                  <option value="Wed">Wednesday</option>
                  <option value="Thu">Thursday</option>
                  <option value="Fri">Friday</option>
                  <option value="Sat">Saturday</option>
                </select>
              </div>
            </div>
          </div>

          {/* Time & Duration */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Start Hour
              </label>
              <select
                value={filters.startHour}
                onChange={e => setFilters(prev => ({ ...prev, startHour: parseInt(e.target.value, 10) }))}
                className="w-full text-xs font-mono px-2.5 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {Array.from({ length: 14 }, (_, i) => i + 8).map(h => (
                  <option key={h} value={h}>
                    {String(h).padStart(2, '0')}:00 ({h > 12 ? `${h - 12} PM` : `${h} AM`})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Duration
              </label>
              <select
                value={filters.durationHours}
                onChange={e => setFilters(prev => ({ ...prev, durationHours: parseInt(e.target.value, 10) }))}
                className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value={1}>1 hour</option>
                <option value={2}>2 hours</option>
                <option value={3}>3 hours</option>
                <option value={4}>4 hours</option>
              </select>
            </div>
          </div>

          {/* Required Capacity */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Minimum Seating Capacity
              </label>
              <span className="text-xs font-bold text-teal-600 tabular-nums">
                {filters.minCapacity} seats
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="150"
              step="5"
              value={filters.minCapacity}
              onChange={e => setFilters(prev => ({ ...prev, minCapacity: parseInt(e.target.value, 10) }))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>10 seats</span>
              <span>50 seats</span>
              <span>100 seats</span>
              <span>150+ seats</span>
            </div>
          </div>

          {/* Room Type & Building */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Room Type
              </label>
              <select
                value={filters.roomType}
                onChange={e => setFilters(prev => ({ ...prev, roomType: e.target.value }))}
                className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="All">Any Room Type</option>
                <option value="Classroom">Classroom</option>
                <option value="Seminar">Seminar</option>
                <option value="Lab">Lab</option>
                <option value="Study room">Study room</option>
                <option value="Auditorium">Auditorium</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Building
              </label>
              <select
                value={filters.building}
                onChange={e => setFilters(prev => ({ ...prev, building: e.target.value }))}
                className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="All">Any Building</option>
                <option value="Central">Central</option>
                <option value="North">North</option>
                <option value="South">South</option>
                <option value="East">East</option>
                <option value="West">West</option>
              </select>
            </div>
          </div>

          {/* Mandatory Facility Requirements */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <span className="block text-xs font-semibold text-slate-700">
              Mandatory Facilities
            </span>

            <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.requireProjector}
                onChange={e => setFilters(prev => ({ ...prev, requireProjector: e.target.checked }))}
                className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4 border-slate-300"
              />
              <span>Must have Presentation Projector</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.requireComputers}
                onChange={e => setFilters(prev => ({ ...prev, requireComputers: e.target.checked }))}
                className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4 border-slate-300"
              />
              <span>Must have Student Computer Bank</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.requireAccessible}
                onChange={e => setFilters(prev => ({ ...prev, requireAccessible: e.target.checked }))}
                className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4 border-slate-300"
              />
              <span>Wheelchair Accessible (ADA Compliant)</span>
            </label>

            <div className="pt-2">
              <div className="flex justify-between items-center text-xs text-slate-700 mb-1">
                <span>Minimum Power Outlets:</span>
                <span className="font-semibold tabular-nums text-teal-700">
                  {filters.minPowerOutlets > 0 ? `${filters.minPowerOutlets}+ outlets` : 'No minimum'}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                step="5"
                value={filters.minPowerOutlets}
                onChange={e => setFilters(prev => ({ ...prev, minPowerOutlets: parseInt(e.target.value, 10) }))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
              />
            </div>
          </div>

          {/* Quick Demo Scenarios (Helper for datathon presentation) */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Judges Demo Scenarios
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => setFilters(prev => ({
                  ...prev,
                  date: '2025-09-17',
                  weekday: 'Wed',
                  startHour: 10,
                  durationHours: 2,
                  minCapacity: 45,
                  requireProjector: true,
                  requireComputers: false
                }))}
                className="px-2 py-1.5 rounded text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 text-left transition-colors cursor-pointer"
              >
                1. High Availability (45 Seats)
              </button>

              <button
                onClick={() => setFilters(prev => ({
                  ...prev,
                  date: '2025-09-17',
                  weekday: 'Wed',
                  startHour: 14,
                  durationHours: 3,
                  minCapacity: 120,
                  requireProjector: true,
                  requireComputers: false
                }))}
                className="px-2 py-1.5 rounded text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 text-left transition-colors cursor-pointer"
              >
                2. Peak Conflict Case (Wed 14:00)
              </button>

              <button
                onClick={() => setFilters(prev => ({
                  ...prev,
                  minCapacity: 175,
                  requireComputers: true
                }))}
                className="px-2 py-1.5 rounded text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 text-left transition-colors cursor-pointer col-span-2"
              >
                3. Over-Constrained (No Match Case)
              </button>
            </div>
          </div>
        </div>

        {/* Right Search Results Column */}
        <div className="lg:col-span-8 space-y-4">
          {/* Results Summary Header Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="text-xs text-slate-600">
                <span className="font-bold text-slate-900 text-sm tabular-nums">{availableResults.length}</span> rooms available for{' '}
                <span className="font-semibold text-slate-800">{filters.weekday} {String(filters.startHour).padStart(2, '0')}:00 – {String(filters.startHour + filters.durationHours).padStart(2, '0')}:00</span>{' '}
                ({filters.durationHours} hr{filters.durationHours > 1 ? 's' : ''})
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showIneligible}
                  onChange={e => setShowIneligible(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500 w-3.5 h-3.5 border-slate-300"
                />
                <span>Include Conflicted / Ineligible ({allResults.length - availableResults.length})</span>
              </label>
            </div>
          </div>

          {/* No Match State with Explainability */}
          {displayedResults.length === 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-4 shadow-2xs">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">No Suitable Rooms Match Your Criteria</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                  No room in the campus catalog simultaneously satisfies your minimum capacity of {filters.minCapacity} seats, requested mandatory facilities, and zero schedule conflict during the {String(filters.startHour).padStart(2, '0')}:00–{String(filters.startHour + filters.durationHours).padStart(2, '0')}:00 slot.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => setFilters(prev => ({ ...prev, minCapacity: Math.max(10, prev.minCapacity - 20) }))}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-700 transition-colors"
                >
                  Reduce capacity to {Math.max(10, filters.minCapacity - 20)}
                </button>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, requireComputers: false, requireProjector: false }))}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-700 transition-colors"
                >
                  Remove optional facility filters
                </button>
                <button
                  onClick={() => setShowIneligible(true)}
                  className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-medium border border-teal-200 transition-colors"
                >
                  Inspect why rooms conflicted
                </button>
              </div>
            </div>
          )}

          {/* Result Cards List */}
          <div className="space-y-3.5">
            {displayedResults.map((result, idx) => {
              const { room, isEligible, hasConflict, conflicts, score, scoreBreakdown, reasons } = result;
              const isAvailable = isEligible && !hasConflict;
              const isExpanded = expandedScoreId === room.room_id;

              return (
                <div
                  key={room.room_id}
                  className={`bg-white rounded-xl border transition-all ${
                    isAvailable
                      ? 'border-slate-200 hover:border-teal-400 shadow-2xs'
                      : 'border-slate-200/70 bg-slate-50/60 opacity-80'
                  }`}
                >
                  <div className="p-4 sm:p-5">
                    {/* Top line: Room ID, Badges, Score */}
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-base font-bold text-slate-900 tracking-tight">
                            Room {room.room_id}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">
                            {room.building} Building · Floor {room.floor}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                            {room.room_type}
                          </span>

                          {isAvailable ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Available (No Conflict)</span>
                            </span>
                          ) : hasConflict ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
                              <XCircle className="w-3.5 h-3.5 text-red-600" />
                              <span>Conflict Detected ({conflicts.length})</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                              <span>Ineligible</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Match Score Display */}
                      {isAvailable && (
                        <div className="text-right shrink-0">
                          <div className="flex items-baseline justify-end gap-1">
                            <span className="text-xs text-slate-400 font-medium">Rank #{idx + 1}</span>
                            <span className="text-xl font-extrabold text-teal-600 tabular-nums">{score}</span>
                            <span className="text-xs text-slate-400 font-normal">/100</span>
                          </div>
                          <button
                            onClick={() => setExpandedScoreId(isExpanded ? null : room.room_id)}
                            className="text-[11px] text-teal-700 hover:text-teal-900 font-medium inline-flex items-center gap-0.5 cursor-pointer mt-0.5"
                          >
                            <span>Score Factors</span>
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Room Specs & Facilities Bar */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600 my-3 py-2 border-y border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>Capacity: <strong className="text-slate-800">{room.capacity}</strong> seats</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Projector className={`w-3.5 h-3.5 ${room.projector ? 'text-teal-600' : 'text-slate-300'}`} />
                        <span className={room.projector ? 'text-slate-800' : 'text-slate-400'}>
                          {room.projector ? 'Projector' : 'No Projector'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Monitor className={`w-3.5 h-3.5 ${room.computers ? 'text-teal-600' : 'text-slate-300'}`} />
                        <span className={room.computers ? 'text-slate-800' : 'text-slate-400'}>
                          {room.computers ? 'Computer Lab' : 'No PC Bank'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Accessibility className={`w-3.5 h-3.5 ${room.accessible ? 'text-blue-600' : 'text-slate-300'}`} />
                        <span className={room.accessible ? 'text-slate-800' : 'text-slate-400'}>
                          {room.accessible ? 'Step-Free / ADA' : 'Standard Access'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span>{room.power_outlets} Outlets</span>
                      </div>
                    </div>

                    {/* Conflict breakdown if conflicted */}
                    {hasConflict && (
                      <div className="mb-3 p-3 rounded-lg bg-red-50/70 border border-red-200/80 text-xs text-red-900 space-y-1.5">
                        <div className="font-semibold flex items-center gap-1.5 text-red-800">
                          <XCircle className="w-3.5 h-3.5 text-red-600" />
                          <span>Conflicting Overlapping Schedule:</span>
                        </div>
                        {conflicts.map((c, i) => (
                          <div key={i} className="pl-5 text-slate-700 flex flex-wrap gap-x-2">
                            <span className="font-semibold text-slate-900">{c.title}</span>
                            <span className="text-slate-500 font-mono">({c.timeRange})</span>
                            <span className="text-slate-600">— {c.details}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Ineligibility Reason if not eligible */}
                    {!isEligible && result.disqualificationReason && (
                      <div className="mb-3 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
                        <strong>Criteria Filtered:</strong> {result.disqualificationReason}
                      </div>
                    )}

                    {/* Score Breakdown Accordion (Transparent math) */}
                    {isExpanded && isAvailable && (
                      <div className="my-3 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2">
                        <div className="font-semibold text-slate-800 flex items-center justify-between pb-1.5 border-b border-slate-200/80">
                          <span>Transparent Recommendation Score Weights</span>
                          <span className="font-mono text-teal-700">{score} Total / 100</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-600">
                          <div className="p-2 bg-white rounded border border-slate-200">
                            <span className="block text-[10px] text-slate-400">Capacity Efficiency</span>
                            <span className="text-sm font-bold text-slate-900 tabular-nums">
                              {scoreBreakdown.capacityFit} <span className="text-xs text-slate-400 font-normal">/ 40</span>
                            </span>
                          </div>
                          <div className="p-2 bg-white rounded border border-slate-200">
                            <span className="block text-[10px] text-slate-400">Facility Match</span>
                            <span className="text-sm font-bold text-slate-900 tabular-nums">
                              {scoreBreakdown.facilityMatch} <span className="text-xs text-slate-400 font-normal">/ 25</span>
                            </span>
                          </div>
                          <div className="p-2 bg-white rounded border border-slate-200">
                            <span className="block text-[10px] text-slate-400">Location &amp; Entry</span>
                            <span className="text-sm font-bold text-slate-900 tabular-nums">
                              {scoreBreakdown.locationConvenience} <span className="text-xs text-slate-400 font-normal">/ 15</span>
                            </span>
                          </div>
                          <div className="p-2 bg-white rounded border border-slate-200">
                            <span className="block text-[10px] text-slate-400">Day Schedule Buffer</span>
                            <span className="text-sm font-bold text-slate-900 tabular-nums">
                              {scoreBreakdown.scheduleBuffer} <span className="text-xs text-slate-400 font-normal">/ 20</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Reasons / Explanation List */}
                    {reasons.length > 0 && isAvailable && (
                      <ul className="text-xs text-slate-600 space-y-1 mb-3">
                        {reasons.slice(0, 3).map((r, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-teal-600 font-bold shrink-0 mt-0.5">•</span>
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between gap-3 pt-2">
                      <button
                        onClick={() => onInspectRoom(room)}
                        className="text-xs text-slate-600 hover:text-slate-900 font-medium inline-flex items-center gap-1.5 hover:underline cursor-pointer"
                      >
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Inspect Full Room Calendar</span>
                      </button>

                      {isAvailable && (
                        <button
                          onClick={() => onRequestRoom(room, filters)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors shadow-2xs cursor-pointer"
                        >
                          <BookmarkPlus className="w-3.5 h-3.5 text-teal-400" />
                          <span>Request Room (Demo)</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
