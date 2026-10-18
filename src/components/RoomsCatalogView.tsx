import React, { useState, useMemo } from 'react';
import {
  Search,
  Building2,
  Users,
  Monitor,
  Projector,
  Accessibility,
  Zap,
  Filter,
  Calendar,
  Layers,
  ArrowUpDown,
  Download
} from 'lucide-react';
import { Room } from '../types/campus';
import { dataService } from '../services/dataService';

interface RoomsCatalogViewProps {
  rooms: Room[];
  onSelectRoom: (room: Room) => void;
}

export const RoomsCatalogView: React.FC<RoomsCatalogViewProps> = ({
  rooms,
  onSelectRoom
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [onlyAccessible, setOnlyAccessible] = useState(false);
  const [onlyProjector, setOnlyProjector] = useState(false);
  const [onlyComputers, setOnlyComputers] = useState(false);
  const [sortBy, setSortBy] = useState<'id' | 'capacity' | 'outlets'>('id');

  const filteredRooms = useMemo(() => {
    return rooms.filter(r => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = r.room_id.toLowerCase().includes(q);
        const matchesBldg = r.building.toLowerCase().includes(q);
        const matchesType = r.room_type.toLowerCase().includes(q);
        if (!matchesId && !matchesBldg && !matchesType) return false;
      }
      if (selectedBuilding !== 'All' && r.building !== selectedBuilding) return false;
      if (selectedType !== 'All' && r.room_type !== selectedType) return false;
      if (onlyAccessible && !r.accessible) return false;
      if (onlyProjector && !r.projector) return false;
      if (onlyComputers && !r.computers) return false;
      return true;
    }).sort((a, b) => {
      if (sortBy === 'capacity') return b.capacity - a.capacity;
      if (sortBy === 'outlets') return b.power_outlets - a.power_outlets;
      return a.room_id.localeCompare(b.room_id);
    });
  }, [rooms, searchQuery, selectedBuilding, selectedType, onlyAccessible, onlyProjector, onlyComputers, sortBy]);

  const handleExportRooms = () => {
    const data = filteredRooms.map(r => ({
      Room_ID: r.room_id,
      Building: r.building,
      Floor: r.floor,
      Type: r.room_type,
      Capacity: r.capacity,
      Projector: r.projector ? 'Yes' : 'No',
      Computers: r.computers ? 'Yes' : 'No',
      Accessible: r.accessible ? 'Yes' : 'No',
      Power_Outlets: r.power_outlets
    }));
    dataService.exportCSV('campusspace_rooms_catalog.csv', data);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            Campus Rooms Catalog
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              120 Verified Spaces
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse and inspect all physical learning environments, technical labs, seminar rooms, and auditoriums.
          </p>
        </div>

        <button
          onClick={handleExportRooms}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors shadow-2xs cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Export Catalog (CSV)</span>
        </button>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Text Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by Room ID (e.g. R014)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Building Filter */}
          <div>
            <select
              value={selectedBuilding}
              onChange={e => setSelectedBuilding(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="All">All Buildings</option>
              <option value="Central">Central</option>
              <option value="North">North</option>
              <option value="South">South</option>
              <option value="East">East</option>
              <option value="West">West</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="All">All Room Types</option>
              <option value="Classroom">Classroom</option>
              <option value="Lab">Lab</option>
              <option value="Seminar">Seminar</option>
              <option value="Study room">Study room</option>
              <option value="Auditorium">Auditorium</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="id">Sort by Room ID (Ascending)</option>
              <option value="capacity">Sort by Capacity (Highest First)</option>
              <option value="outlets">Sort by Power Outlets (Most Outlets)</option>
            </select>
          </div>
        </div>

        {/* Feature Checkboxes */}
        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-100 text-xs text-slate-700">
          <span className="text-slate-400 font-medium">Filter Features:</span>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyProjector}
              onChange={e => setOnlyProjector(e.target.checked)}
              className="rounded text-teal-600 focus:ring-teal-500 w-3.5 h-3.5 border-slate-300"
            />
            <span>Projector</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyComputers}
              onChange={e => setOnlyComputers(e.target.checked)}
              className="rounded text-teal-600 focus:ring-teal-500 w-3.5 h-3.5 border-slate-300"
            />
            <span>Computer Lab</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyAccessible}
              onChange={e => setOnlyAccessible(e.target.checked)}
              className="rounded text-teal-600 focus:ring-teal-500 w-3.5 h-3.5 border-slate-300"
            />
            <span>Wheelchair Accessible</span>
          </label>

          <span className="ml-auto text-xs text-slate-500">
            Showing <strong className="text-slate-900 tabular-nums">{filteredRooms.length}</strong> of {rooms.length} rooms
          </span>
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredRooms.map(room => (
          <div
            key={room.room_id}
            onClick={() => onSelectRoom(room)}
            className="bg-white rounded-xl border border-slate-200 hover:border-teal-500 hover:shadow-xs p-4.5 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    Room {room.room_id}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {room.building} Building · Floor {room.floor}
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                  {room.room_type}
                </span>
              </div>

              <div className="my-3 space-y-2 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Seating Capacity:</span>
                  </span>
                  <span className="font-bold text-slate-900 tabular-nums">{room.capacity} seats</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-slate-400" />
                    <span>Power Outlets:</span>
                  </span>
                  <span className="font-semibold text-slate-800 tabular-nums">{room.power_outlets}</span>
                </div>
              </div>

              {/* Amenity Badges */}
              <div className="flex flex-wrap gap-1.5 my-2">
                {room.projector && (
                  <span className="text-[10px] font-medium bg-teal-50 text-teal-800 border border-teal-200/60 px-1.5 py-0.5 rounded">
                    Projector
                  </span>
                )}
                {room.computers && (
                  <span className="text-[10px] font-medium bg-blue-50 text-blue-800 border border-blue-200/60 px-1.5 py-0.5 rounded">
                    Computers
                  </span>
                )}
                {room.accessible && (
                  <span className="text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/60 px-1.5 py-0.5 rounded">
                    ADA Accessible
                  </span>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-teal-600 font-medium">
              <span>Inspect Schedule</span>
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
