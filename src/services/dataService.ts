import Papa from 'papaparse';
import {
  Room,
  ClassSchedule,
  CampusEvent,
  RoomRequest,
  ValidationIssue,
  DatasetSummary,
  Weekday
} from '../types/campus';

export interface DatasetState {
  rooms: Room[];
  classSchedules: ClassSchedule[];
  events: CampusEvent[];
  roomRequests: RoomRequest[];
  loading: boolean;
  error: string | null;
  summary: DatasetSummary;
}

class DataService {
  private state: DatasetState = {
    rooms: [],
    classSchedules: [],
    events: [],
    roomRequests: [],
    loading: true,
    error: null,
    summary: {
      roomsCount: 0,
      classesCount: 0,
      eventsCount: 0,
      requestsCount: 0,
      lastUpdated: new Date().toISOString(),
      isCustomLoaded: false,
      issues: []
    }
  };

  private listeners: Array<(state: DatasetState) => void> = [];

  constructor() {
    this.loadDefaultDatasets();
  }

  public subscribe(listener: (state: DatasetState) => void): () => void {
    this.listeners.push(listener);
    listener(this.state);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener(this.state));
  }

  public getState(): DatasetState {
    return this.state;
  }

  public async loadDefaultDatasets(): Promise<void> {
    this.state.loading = true;
    this.state.error = null;
    this.notify();

    try {
      const [roomsRes, schedulesRes, eventsRes, requestsRes] = await Promise.all([
        fetch('/data/rooms.csv'),
        fetch('/data/class_schedule.csv'),
        fetch('/data/events.csv'),
        fetch('/data/room_requests.csv')
      ]);

      if (!roomsRes.ok || !schedulesRes.ok || !eventsRes.ok || !requestsRes.ok) {
        throw new Error('Could not load base datasets from /data/. Please verify files exist or upload custom data.');
      }

      const [roomsText, schedulesText, eventsText, requestsText] = await Promise.all([
        roomsRes.text(),
        schedulesRes.text(),
        eventsRes.text(),
        requestsRes.text()
      ]);

      const issues: ValidationIssue[] = [];

      const parsedRooms = this.parseRooms(roomsText, issues);
      const parsedSchedules = this.parseClassSchedules(schedulesText, issues);
      const parsedEvents = this.parseEvents(eventsText, issues);
      const parsedRequests = this.parseRoomRequests(requestsText, issues);

      this.state = {
        rooms: parsedRooms,
        classSchedules: parsedSchedules,
        events: parsedEvents,
        roomRequests: parsedRequests,
        loading: false,
        error: null,
        summary: {
          roomsCount: parsedRooms.length,
          classesCount: parsedSchedules.length,
          eventsCount: parsedEvents.length,
          requestsCount: parsedRequests.length,
          lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          isCustomLoaded: false,
          issues
        }
      };
      this.notify();
    } catch (err) {
      console.error('DataService load error:', err);
      this.state.loading = false;
      this.state.error = err instanceof Error ? err.message : 'Unknown dataset loading failure';
      this.notify();
    }
  }

  public parseRooms(csvText: string, issues: ValidationIssue[]): Room[] {
    const parsed = Papa.parse<Record<string, string>>(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: h => h.trim()
    });

    const requiredCols = ['room_id', 'building', 'floor', 'room_type', 'capacity', 'projector', 'computers', 'accessible', 'power_outlets'];
    const missing = requiredCols.filter(col => !parsed.meta.fields?.includes(col));
    if (missing.length > 0) {
      issues.push({
        table: 'rooms',
        message: `Missing expected column(s): ${missing.join(', ')}`,
        severity: 'error'
      });
    }

    const seenIds = new Set<string>();
    const rooms: Room[] = [];

    parsed.data.forEach((row, index) => {
      const rowNum = index + 2;
      const roomId = (row.room_id || '').trim();
      if (!roomId) {
        issues.push({ table: 'rooms', rowNumber: rowNum, message: 'Row has empty room_id', severity: 'warning' });
        return;
      }
      if (seenIds.has(roomId)) {
        issues.push({ table: 'rooms', rowNumber: rowNum, message: `Duplicate room_id detected: ${roomId}`, severity: 'warning' });
      }
      seenIds.add(roomId);

      rooms.push({
        room_id: roomId,
        building: (row.building || 'Unknown').trim(),
        floor: parseInt(row.floor, 10) || 0,
        room_type: (row.room_type || 'Classroom').trim(),
        capacity: Math.max(1, parseInt(row.capacity, 10) || 1),
        projector: row.projector === '1' || row.projector?.toLowerCase() === 'true',
        computers: row.computers === '1' || row.computers?.toLowerCase() === 'true',
        accessible: row.accessible === '1' || row.accessible?.toLowerCase() === 'true',
        power_outlets: parseInt(row.power_outlets, 10) || 0
      });
    });

    return rooms;
  }

  public parseClassSchedules(csvText: string, issues: ValidationIssue[]): ClassSchedule[] {
    const parsed = Papa.parse<Record<string, string>>(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: h => h.trim()
    });

    const requiredCols = ['schedule_id', 'room_id', 'course_code', 'weekday', 'start_hour', 'duration_hours', 'expected_attendance', 'department'];
    const missing = requiredCols.filter(col => !parsed.meta.fields?.includes(col));
    if (missing.length > 0) {
      issues.push({
        table: 'class_schedule',
        message: `Missing expected column(s): ${missing.join(', ')}`,
        severity: 'error'
      });
    }

    const validWeekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const schedules: ClassSchedule[] = [];

    parsed.data.forEach((row, index) => {
      const rowNum = index + 2;
      const scheduleId = (row.schedule_id || '').trim();
      const roomId = (row.room_id || '').trim();
      if (!scheduleId || !roomId) {
        issues.push({ table: 'class_schedule', rowNumber: rowNum, message: 'Missing schedule_id or room_id', severity: 'warning' });
        return;
      }

      const weekday = (row.weekday || '').trim() as Weekday;
      if (!validWeekdays.includes(weekday)) {
        issues.push({ table: 'class_schedule', rowNumber: rowNum, message: `Invalid weekday "${weekday}"`, severity: 'warning' });
      }

      const startHour = parseInt(row.start_hour, 10) || 8;
      const durationHours = parseInt(row.duration_hours, 10) || 1;

      schedules.push({
        schedule_id: scheduleId,
        room_id: roomId,
        course_code: (row.course_code || '').trim(),
        weekday: weekday || 'Mon',
        start_hour: startHour,
        duration_hours: durationHours,
        expected_attendance: parseInt(row.expected_attendance, 10) || 0,
        department: (row.department || 'General').trim()
      });
    });

    return schedules;
  }

  public parseEvents(csvText: string, issues: ValidationIssue[]): CampusEvent[] {
    const parsed = Papa.parse<Record<string, string>>(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: h => h.trim()
    });

    const requiredCols = ['event_id', 'room_id', 'event_type', 'start_time', 'duration_hours', 'expected_attendance', 'actual_attendance'];
    const missing = requiredCols.filter(col => !parsed.meta.fields?.includes(col));
    if (missing.length > 0) {
      issues.push({
        table: 'events',
        message: `Missing expected column(s): ${missing.join(', ')}`,
        severity: 'error'
      });
    }

    const events: CampusEvent[] = [];

    parsed.data.forEach((row, index) => {
      const rowNum = index + 2;
      const eventId = (row.event_id || '').trim();
      const roomId = (row.room_id || '').trim();
      const startTime = (row.start_time || '').trim();

      if (!eventId || !roomId || !startTime) {
        issues.push({ table: 'events', rowNumber: rowNum, message: 'Missing event_id, room_id, or start_time', severity: 'warning' });
        return;
      }

      events.push({
        event_id: eventId,
        room_id: roomId,
        event_type: (row.event_type || 'Event').trim(),
        start_time: startTime,
        duration_hours: parseFloat(row.duration_hours) || 1,
        expected_attendance: parseInt(row.expected_attendance, 10) || 0,
        actual_attendance: parseInt(row.actual_attendance, 10) || 0
      });
    });

    return events;
  }

  public parseRoomRequests(csvText: string, issues: ValidationIssue[]): RoomRequest[] {
    const parsed = Papa.parse<Record<string, string>>(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: h => h.trim()
    });

    const requiredCols = ['request_id', 'request_date', 'start_hour', 'duration_hours', 'required_capacity', 'projector_required', 'computers_required', 'purpose', 'status'];
    const missing = requiredCols.filter(col => !parsed.meta.fields?.includes(col));
    if (missing.length > 0) {
      issues.push({
        table: 'room_requests',
        message: `Missing expected column(s): ${missing.join(', ')}`,
        severity: 'error'
      });
    }

    const requests: RoomRequest[] = [];

    parsed.data.forEach((row, index) => {
      const rowNum = index + 2;
      const reqId = (row.request_id || '').trim();
      const date = (row.request_date || '').trim();

      if (!reqId || !date) {
        issues.push({ table: 'room_requests', rowNumber: rowNum, message: 'Missing request_id or request_date', severity: 'warning' });
        return;
      }

      requests.push({
        request_id: reqId,
        request_date: date,
        start_hour: parseInt(row.start_hour, 10) || 8,
        duration_hours: parseInt(row.duration_hours, 10) || 1,
        required_capacity: parseInt(row.required_capacity, 10) || 1,
        projector_required: row.projector_required === '1' || row.projector_required?.toLowerCase() === 'true',
        computers_required: row.computers_required === '1' || row.computers_required?.toLowerCase() === 'true',
        purpose: (row.purpose || 'General').trim(),
        status: (row.status || 'Waitlisted').trim() as any
      });
    });

    return requests;
  }

  public updateTable(table: 'rooms' | 'class_schedule' | 'events' | 'room_requests', csvText: string): { success: boolean; message: string; issues: ValidationIssue[] } {
    const issues: ValidationIssue[] = [];

    try {
      if (table === 'rooms') {
        const rooms = this.parseRooms(csvText, issues);
        if (rooms.length === 0) return { success: false, message: 'No valid room records found in CSV.', issues };
        this.state.rooms = rooms;
        this.state.summary.roomsCount = rooms.length;
      } else if (table === 'class_schedule') {
        const schedules = this.parseClassSchedules(csvText, issues);
        if (schedules.length === 0) return { success: false, message: 'No valid schedule records found in CSV.', issues };
        this.state.classSchedules = schedules;
        this.state.summary.classesCount = schedules.length;
      } else if (table === 'events') {
        const events = this.parseEvents(csvText, issues);
        if (events.length === 0) return { success: false, message: 'No valid event records found in CSV.', issues };
        this.state.events = events;
        this.state.summary.eventsCount = events.length;
      } else if (table === 'room_requests') {
        const requests = this.parseRoomRequests(csvText, issues);
        if (requests.length === 0) return { success: false, message: 'No valid request records found in CSV.', issues };
        this.state.roomRequests = requests;
        this.state.summary.requestsCount = requests.length;
      }

      this.state.summary.isCustomLoaded = true;
      this.state.summary.lastUpdated = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      this.state.summary.issues = [...this.state.summary.issues, ...issues];
      this.notify();

      return {
        success: true,
        message: `Successfully loaded ${table} with ${issues.filter(i => i.severity === 'error').length} error(s) and ${issues.filter(i => i.severity === 'warning').length} warning(s).`,
        issues
      };
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Failed to parse CSV',
        issues
      };
    }
  }

  public exportCSV(filename: string, data: Record<string, any>[]): void {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const dataService = new DataService();
