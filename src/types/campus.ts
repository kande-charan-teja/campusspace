export type RoomType = 'Classroom' | 'Lab' | 'Seminar' | 'Study room' | 'Auditorium';

export type Building = 'Central' | 'West' | 'North' | 'East' | 'South';

export type Weekday = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';

export type RequestStatus = 'Approved' | 'Waitlisted' | 'Rejected' | 'Cancelled';

export type RequestPurpose = 'Study group' | 'Class' | 'Workshop' | 'Club meeting' | 'Project work';

export type EventType = 'Guest lecture' | 'Seminar' | 'Club meeting' | 'Exam' | 'Workshop';

export type Department = 'EEE' | 'ECE' | 'CSE' | 'Management' | 'Sciences' | 'Mechanical';

export interface Room {
  room_id: string;
  building: Building | string;
  floor: number;
  room_type: RoomType | string;
  capacity: number;
  projector: boolean;
  computers: boolean;
  accessible: boolean;
  power_outlets: number;
}

export interface ClassSchedule {
  schedule_id: string;
  room_id: string;
  course_code: string;
  weekday: Weekday;
  start_hour: number;
  duration_hours: number;
  expected_attendance: number;
  department: Department | string;
}

export interface CampusEvent {
  event_id: string;
  room_id: string;
  event_type: EventType | string;
  start_time: string; // YYYY-MM-DD HH:mm:ss
  duration_hours: number;
  expected_attendance: number;
  actual_attendance: number;
}

export interface RoomRequest {
  request_id: string;
  request_date: string; // YYYY-MM-DD
  start_hour: number;
  duration_hours: number;
  required_capacity: number;
  projector_required: boolean;
  computers_required: boolean;
  purpose: RequestPurpose | string;
  status: RequestStatus;
}

export interface SearchFilters {
  date: string; // YYYY-MM-DD
  weekday: Weekday;
  startHour: number; // 8 to 20
  durationHours: number; // 1 to 4
  minCapacity: number;
  roomType?: string;
  building?: string;
  requireProjector: boolean;
  requireComputers: boolean;
  requireAccessible: boolean;
  minPowerOutlets: number;
}

export interface ConflictRecord {
  type: 'class' | 'event';
  title: string;
  id: string;
  timeRange: string;
  details: string;
  startHour: number;
  endHour: number;
}

export interface ScoreBreakdown {
  capacityFit: number;      // max 40
  facilityMatch: number;    // max 25
  locationConvenience: number; // max 15
  scheduleBuffer: number;   // max 20
}

export interface RoomMatchResult {
  room: Room;
  isEligible: boolean;
  hasConflict: boolean;
  conflicts: ConflictRecord[];
  disqualificationReason?: string;
  score: number; // 0 to 100
  scoreBreakdown: ScoreBreakdown;
  reasons: string[];
  limitations: string;
}

export interface ValidationIssue {
  table: string;
  rowNumber?: number;
  field?: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface DatasetSummary {
  roomsCount: number;
  classesCount: number;
  eventsCount: number;
  requestsCount: number;
  lastUpdated: string;
  isCustomLoaded: boolean;
  issues: ValidationIssue[];
}

export interface LocalDemoBooking {
  id: string;
  roomId: string;
  roomName: string;
  building: string;
  date: string;
  weekday: string;
  startHour: number;
  durationHours: number;
  purpose: string;
  requestedBy: string;
  attendees: number;
  createdAt: string;
}
