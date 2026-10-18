import React, { useMemo, useState } from 'react';
import {
  X,
  Building2,
  Users,
  Monitor,
  Projector,
  Accessibility,
  Zap,
  Calendar,
  Clock,
  BookOpen,
  BookmarkPlus
} from 'lucide-react';
import { Room, ClassSchedule, CampusEvent, Weekday } from '../types/campus';

interface RoomDetailModalProps {
  room: Room | null;
  classSchedules: ClassSchedule[];
  events: CampusEvent[];
  onClose: () => void;
  onRequestRoom: (room: Room) => void;
}

export const RoomDetailModal: React.FC<RoomDetailModalProps> = ({
  room,
  classSchedules,
  events,
  onClose,
  onRequestRoom
}) => {
  const [activeTab, setActiveTab] = useState<'classes' | 'events'>('classes');
  const [selectedDay, setSelectedDay] = useState<Weekday>('Mon');

  // Filter classes for this room
  const roomClasses = useMemo(() => {
    if (!room) return [];
    return classSchedules
      .filter(s => s.room_id === room.room_id)
      .sort((a, b) => a.start_hour - b.start_hour);
  }, [room, classSchedules]);

  const dayClasses = useMemo(() => {
    return roomClasses.filter(s => s.weekday === selectedDay);
  }, [roomClasses, selectedDay]);

  // Filter events for this room
  const roomEvents = useMemo(() => {
    if (!room) return [];
    return events
      .filter(e => e.room_id === room.room_id)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  }, [room, events]);

  if (!room) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-start justify-between bg-slate-900 text-white">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight">Room {room.room_id}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                {room.room_type}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {room.building} Building · Floor {room.floor}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Room Attributes Banner */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs text-slate-700">
          <div>
            <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Capacity</span>
            <span className="font-bold text-slate-900 text-sm tabular-nums">{room.capacity} seats</span>
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Projector</span>
            <span className="font-semibold text-slate-800">{room.projector ? 'Equipped' : 'None'}</span>
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Computers</span>
            <span className="font-semibold text-slate-800">{room.computers ? 'Workstation Bank' : 'None'}</span>
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Accessibility</span>
            <span className="font-semibold text-slate-800">{room.accessible ? 'ADA Compliant' : 'Standard'}</span>
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Outlets</span>
            <span className="font-semibold text-slate-800 tabular-nums">{room.power_outlets} ports</span>
          </div>
        </div>

        {/* Tabs: Weekly Class Schedule vs Dated Events */}
        <div className="flex items-center gap-2 px-5 pt-4 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('classes')}
            className={`pb-2.5 px-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'classes'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Weekly Class Schedule ({roomClasses.length} slots)
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`pb-2.5 px-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'events'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Booked Dated Events ({roomEvents.length})
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {activeTab === 'classes' ? (
            <div className="space-y-4">
              {/* Day selector buttons */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                {(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as Weekday[]).map(day => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                      selectedDay === day
                        ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>

              {/* Class Schedule Table for selected day */}
              {dayClasses.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No classes scheduled in Room {room.room_id} on {selectedDay}.
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Time Range</th>
                        <th className="py-2.5 px-3">Course Code</th>
                        <th className="py-2.5 px-3">Department</th>
                        <th className="py-2.5 px-3 text-right">Exp. Attendance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {dayClasses.map(c => (
                        <tr key={c.schedule_id} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-mono font-semibold text-slate-900">
                            {String(c.start_hour).padStart(2, '0')}:00 – {String(c.start_hour + c.duration_hours).padStart(2, '0')}:00
                          </td>
                          <td className="py-2 px-3 font-medium text-teal-700">{c.course_code}</td>
                          <td className="py-2 px-3 text-slate-600">{c.department}</td>
                          <td className="py-2 px-3 text-right tabular-nums text-slate-700">{c.expected_attendance}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {roomEvents.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No dated events currently booked for Room {room.room_id}.
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Date &amp; Time</th>
                        <th className="py-2.5 px-3">Event Type</th>
                        <th className="py-2.5 px-3 text-right">Duration</th>
                        <th className="py-2.5 px-3 text-right">Exp. Turnout</th>
                        <th className="py-2.5 px-3 text-right">Actual Turnout</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {roomEvents.map(e => (
                        <tr key={e.event_id} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-mono text-slate-900">{e.start_time}</td>
                          <td className="py-2 px-3 font-medium text-slate-800">{e.event_type}</td>
                          <td className="py-2 px-3 text-right tabular-nums text-slate-600">{e.duration_hours} hr</td>
                          <td className="py-2 px-3 text-right tabular-nums text-slate-600">{e.expected_attendance}</td>
                          <td className="py-2 px-3 text-right tabular-nums font-semibold text-emerald-700">{e.actual_attendance}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Conflicts calculated from loaded timetable records.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onRequestRoom(room);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <BookmarkPlus className="w-3.5 h-3.5 text-teal-400" />
              <span>Request this Room</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
