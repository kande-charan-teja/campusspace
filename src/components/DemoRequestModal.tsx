import React, { useState } from 'react';
import {
  X,
  BookmarkPlus,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Clock,
  Users,
  Building2
} from 'lucide-react';
import { Room, SearchFilters, LocalDemoBooking } from '../types/campus';

interface DemoRequestModalProps {
  room: Room | null;
  filters?: SearchFilters;
  onClose: () => void;
  onSubmitBooking: (booking: LocalDemoBooking) => void;
}

export const DemoRequestModal: React.FC<DemoRequestModalProps> = ({
  room,
  filters,
  onClose,
  onSubmitBooking
}) => {
  const [organizerName, setOrganizerName] = useState('ACM Student Chapter');
  const [purpose, setPurpose] = useState(filters?.roomType === 'Lab' ? 'Project work' : 'Study group');
  const [attendees, setAttendees] = useState(filters?.minCapacity || 30);
  const [date, setDate] = useState(filters?.date || '2025-09-17');
  const [startHour, setStartHour] = useState(filters?.startHour || 10);
  const [durationHours, setDurationHours] = useState(filters?.durationHours || 2);
  const [submitted, setSubmitted] = useState(false);

  if (!room) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const demoBooking: LocalDemoBooking = {
      id: `DEMO-${Date.now().toString().slice(-6)}`,
      roomId: room.room_id,
      roomName: `Room ${room.room_id}`,
      building: room.building,
      date,
      weekday: filters?.weekday || 'Wed',
      startHour,
      durationHours,
      purpose,
      requestedBy: organizerName,
      attendees,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    onSubmitBooking(demoBooking);
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-start justify-between bg-slate-900 text-white">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">Request Room {room.room_id}</span>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Local Demo Action
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {room.building} Building · Capacity: {room.capacity} seats · Floor {room.floor}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Demo Request Logged in Local Memory</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Your request for <strong>Room {room.room_id}</strong> on {date} at {startHour}:00 has been added to the application session log.
            </p>
            <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
              Note: This is an explainable datathon simulation and does not represent an actual official campus reservation submission.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
            {/* Disclaimer Callout */}
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Simulation Notice:</strong> This action creates a local temporary request in your browser for demonstration purposes. It does not alter university live booking records.
              </p>
            </div>

            {/* Organizer Name */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Requesting Group / Individual
              </label>
              <input
                type="text"
                required
                value={organizerName}
                onChange={e => setOrganizerName(e.target.value)}
                placeholder="e.g. IEEE Student Branch or Bioengineering Group"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Purpose & Attendees */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Purpose of Booking
                </label>
                <select
                  value={purpose}
                  onChange={e => setPurpose(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Study group">Study group</option>
                  <option value="Club meeting">Club meeting</option>
                  <option value="Project work">Project work</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Class">Class</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Expected Attendees
                </label>
                <input
                  type="number"
                  min="1"
                  max={room.capacity}
                  required
                  value={attendees}
                  onChange={e => setAttendees(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 tabular-nums"
                />
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Start Hour
                </label>
                <select
                  value={startHour}
                  onChange={e => setStartHour(parseInt(e.target.value, 10))}
                  className="w-full px-2.5 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                >
                  {Array.from({ length: 14 }, (_, i) => i + 8).map(h => (
                    <option key={h} value={h}>
                      {String(h).padStart(2, '0')}:00
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Duration
                </label>
                <select
                  value={durationHours}
                  onChange={e => setDurationHours(parseInt(e.target.value, 10))}
                  className="w-full px-2.5 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value={1}>1 hour</option>
                  <option value={2}>2 hours</option>
                  <option value={3}>3 hours</option>
                  <option value={4}>4 hours</option>
                </select>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-600 flex items-center justify-between">
              <span>Facility Capacity Limit:</span>
              <span className="font-bold text-slate-900 tabular-nums">{room.capacity} seats</span>
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <BookmarkPlus className="w-3.5 h-3.5" />
                <span>Submit Demo Request</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
