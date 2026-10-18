import React, { useState, useEffect, useMemo } from 'react';
import {
  Navigation,
  NavTab
} from './components/Navigation';
import { OverviewView } from './components/OverviewView';
import { SmartRoomFinderView } from './components/SmartRoomFinderView';
import { DemandAnalyticsView } from './components/DemandAnalyticsView';
import { RoomsCatalogView } from './components/RoomsCatalogView';
import { DataManagementView } from './components/DataManagementView';
import { MethodologyView } from './components/MethodologyView';
import { RoomDetailModal } from './components/RoomDetailModal';
import { DemoRequestModal } from './components/DemoRequestModal';
import { dataService, DatasetState } from './services/dataService';
import { computeAnalytics } from './services/analyticsService';
import { Room, SearchFilters, LocalDemoBooking } from './types/campus';
import {
  Sparkles,
  Calendar,
  Layers,
  Search,
  CheckCircle2,
  AlertCircle,
  Database
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [dataState, setDataState] = useState<DatasetState>(dataService.getState());
  const [inspectedRoom, setInspectedRoom] = useState<Room | null>(null);
  const [requestingRoom, setRequestingRoom] = useState<{ room: Room; filters?: SearchFilters } | null>(null);
  const [demoBookings, setDemoBookings] = useState<LocalDemoBooking[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Subscribe to reactive data service
  useEffect(() => {
    const unsubscribe = dataService.subscribe(newState => {
      setDataState(newState);
    });
    return unsubscribe;
  }, []);

  const analytics = useMemo(() => {
    return computeAnalytics(
      dataState.rooms,
      dataState.classSchedules,
      dataState.events,
      dataState.roomRequests
    );
  }, [dataState.rooms, dataState.classSchedules, dataState.events, dataState.roomRequests]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleDemoBookingSubmit = (booking: LocalDemoBooking) => {
    setDemoBookings(prev => [booking, ...prev]);
    showToast(`Demo request logged for Room ${booking.roomId} (${booking.date} at ${booking.startHour}:00)`);
  };

  const handleResetDefault = () => {
    dataService.loadDefaultDatasets();
    showToast('Reset to original standard datathon benchmark datasets.');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row antialiased">
      {/* Navigation Sidebar */}
      <Navigation
        activeTab={activeTab}
        onTabChange={tab => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        datasetLoaded={!dataState.loading && dataState.rooms.length > 0}
        isCustomData={dataState.summary.isCustomLoaded}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top Header / Breadcrumbs Bar */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 overflow-hidden">
            <span className="font-semibold text-slate-900 whitespace-nowrap">CampusSpace AI</span>
            <span>/</span>
            <span className="capitalize font-medium text-slate-700 truncate">
              {activeTab === 'finder'
                ? 'Smart Room Finder'
                : activeTab === 'analytics'
                ? 'Demand Analytics'
                : activeTab === 'rooms'
                ? 'Rooms Catalog'
                : activeTab === 'data'
                ? 'Data Management'
                : activeTab === 'methodology'
                ? 'Methodology & Ethics'
                : 'Campus Overview'}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {demoBookings.length > 0 && (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-lg font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                <span>{demoBookings.length} Demo Booking{demoBookings.length > 1 ? 's' : ''}</span>
              </span>
            )}

            {activeTab !== 'finder' && (
              <button
                onClick={() => setActiveTab('finder')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Find Room</span>
              </button>
            )}
          </div>
        </header>

        {/* Dynamic Workspace View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {dataState.loading ? (
            <div className="h-96 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-teal-600 border-t-transparent animate-spin" />
              <p className="text-xs font-medium text-slate-600">
                Loading campus datasets (120 rooms, 5K classes, 1.8K events, 5K requests)...
              </p>
            </div>
          ) : dataState.error ? (
            <div className="p-6 rounded-xl bg-red-50 border border-red-200 max-w-lg mx-auto text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
              <h2 className="text-base font-bold text-red-900">Failed to Load Dataset</h2>
              <p className="text-xs text-red-700 leading-relaxed">{dataState.error}</p>
              <button
                onClick={handleResetDefault}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700"
              >
                Retry Loading Default Data
              </button>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <OverviewView
                  analytics={analytics}
                  summary={dataState.summary}
                  onNavigate={setActiveTab}
                  onQuickSearch={() => setActiveTab('finder')}
                />
              )}

              {activeTab === 'finder' && (
                <SmartRoomFinderView
                  rooms={dataState.rooms}
                  classSchedules={dataState.classSchedules}
                  events={dataState.events}
                  onInspectRoom={room => setInspectedRoom(room)}
                  onRequestRoom={(room, currentFilters) => setRequestingRoom({ room, filters: currentFilters })}
                />
              )}

              {activeTab === 'analytics' && (
                <DemandAnalyticsView
                  analytics={analytics}
                  roomRequests={dataState.roomRequests}
                />
              )}

              {activeTab === 'rooms' && (
                <RoomsCatalogView
                  rooms={dataState.rooms}
                  onSelectRoom={room => setInspectedRoom(room)}
                />
              )}

              {activeTab === 'data' && (
                <DataManagementView
                  summary={dataState.summary}
                  onResetDefault={handleResetDefault}
                />
              )}

              {activeTab === 'methodology' && (
                <MethodologyView />
              )}
            </>
          )}
        </main>

        {/* Global Footer */}
        <footer className="mt-auto px-4 sm:px-8 py-5 border-t border-slate-200 bg-white text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="font-semibold text-slate-800">CampusSpace AI</span> · Find the Right Space. Make Every Room Count.
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Synthetic Datathon Sandbox</span>
            <span>·</span>
            <span>Deterministic Scoring Engine</span>
          </div>
        </footer>
      </div>

      {/* Room Detail Modal */}
      <RoomDetailModal
        room={inspectedRoom}
        classSchedules={dataState.classSchedules}
        events={dataState.events}
        onClose={() => setInspectedRoom(null)}
        onRequestRoom={room => {
          setInspectedRoom(null);
          setRequestingRoom({ room });
        }}
      />

      {/* Demo Request Booking Modal */}
      <DemoRequestModal
        room={requestingRoom?.room || null}
        filters={requestingRoom?.filters}
        onClose={() => setRequestingRoom(null)}
        onSubmitBooking={handleDemoBookingSubmit}
      />

      {/* Floating Action Feedback Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 p-3.5 rounded-xl bg-slate-900 text-white border border-slate-700 shadow-lg text-xs font-medium flex items-center gap-2 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
