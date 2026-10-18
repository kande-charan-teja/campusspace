import {
  Room,
  ClassSchedule,
  CampusEvent,
  SearchFilters,
  RoomMatchResult,
  ConflictRecord,
  Weekday
} from '../types/campus';

export function getWeekdayFromDate(dateStr: string): Weekday {
  if (!dateStr) return 'Mon';
  const d = new Date(dateStr + 'T00:00:00');
  const dayIndex = d.getDay(); // 0 is Sun, 1 is Mon, 6 is Sat
  const dayMap: Record<number, Weekday> = {
    1: 'Mon',
    2: 'Tue',
    3: 'Wed',
    4: 'Thu',
    5: 'Fri',
    6: 'Sat',
    0: 'Mon' // Sunday default to Mon as university schedule dataset is Mon-Sat
  };
  return dayMap[dayIndex] || 'Mon';
}

export function validateFilters(filters: SearchFilters): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (filters.minCapacity < 1) {
    errors.push('Minimum seating capacity must be at least 1.');
  }
  if (filters.startHour < 7 || filters.startHour > 22) {
    errors.push('Start time must be between 07:00 and 22:00.');
  }
  if (filters.durationHours < 1 || filters.durationHours > 6) {
    errors.push('Duration must be between 1 and 6 hours.');
  }
  if (filters.startHour + filters.durationHours > 24) {
    errors.push('Requested time block exceeds midnight boundary.');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function findMatchingRooms(
  rooms: Room[],
  classSchedules: ClassSchedule[],
  events: CampusEvent[],
  filters: SearchFilters
): RoomMatchResult[] {
  const searchStart = filters.startHour;
  const searchEnd = filters.startHour + filters.durationHours;
  const targetWeekday = filters.weekday || getWeekdayFromDate(filters.date);
  const targetDateStr = filters.date;

  // Pre-index schedules and events by roomId for fast lookup
  const scheduleByRoom = new Map<string, ClassSchedule[]>();
  classSchedules.forEach(s => {
    const list = scheduleByRoom.get(s.room_id) || [];
    list.push(s);
    scheduleByRoom.set(s.room_id, list);
  });

  const eventsByRoom = new Map<string, CampusEvent[]>();
  events.forEach(e => {
    const list = eventsByRoom.get(e.room_id) || [];
    list.push(e);
    eventsByRoom.set(e.room_id, list);
  });

  const results: RoomMatchResult[] = rooms.map(room => {
    const conflicts: ConflictRecord[] = [];
    const reasons: string[] = [];

    // 1. Mandatory requirement checks
    let isEligible = true;
    let disqualificationReason: string | undefined = undefined;

    if (room.capacity < filters.minCapacity) {
      isEligible = false;
      disqualificationReason = `Capacity is ${room.capacity} seats (requires ${filters.minCapacity})`;
    } else if (filters.requireProjector && !room.projector) {
      isEligible = false;
      disqualificationReason = 'Does not have required projector';
    } else if (filters.requireComputers && !room.computers) {
      isEligible = false;
      disqualificationReason = 'Does not have required computer workstations';
    } else if (filters.requireAccessible && !room.accessible) {
      isEligible = false;
      disqualificationReason = 'Lacks barrier-free wheelchair accessibility';
    } else if (filters.minPowerOutlets > 0 && room.power_outlets < filters.minPowerOutlets) {
      isEligible = false;
      disqualificationReason = `Only ${room.power_outlets} power outlets (requires ${filters.minPowerOutlets})`;
    } else if (filters.roomType && filters.roomType !== 'All' && room.room_type !== filters.roomType) {
      isEligible = false;
      disqualificationReason = `Room type is ${room.room_type} (requested ${filters.roomType})`;
    } else if (filters.building && filters.building !== 'All' && room.building !== filters.building) {
      isEligible = false;
      disqualificationReason = `Located in ${room.building} Building (requested ${filters.building})`;
    }

    // 2. Conflict Checks:
    // Check recurring class schedule for targetWeekday
    const roomSchedules = scheduleByRoom.get(room.room_id) || [];
    const dayClasses = roomSchedules.filter(s => s.weekday === targetWeekday);
    let totalScheduledHoursToday = 0;

    dayClasses.forEach(s => {
      totalScheduledHoursToday += s.duration_hours;
      const classStart = s.start_hour;
      const classEnd = s.start_hour + s.duration_hours;

      // Strict interval overlap check (endpoints touching do NOT overlap)
      if (searchStart < classEnd && classStart < searchEnd) {
        conflicts.push({
          type: 'class',
          title: `Class ${s.course_code}`,
          id: s.schedule_id,
          timeRange: `${classStart}:00 – ${classEnd}:00`,
          details: `Dept: ${s.department} · Exp. Attendance: ${s.expected_attendance}`,
          startHour: classStart,
          endHour: classEnd
        });
      }
    });

    // Check dated campus events
    const roomEvents = eventsByRoom.get(room.room_id) || [];
    roomEvents.forEach(ev => {
      // ev.start_time format: "YYYY-MM-DD HH:mm:ss"
      const [evDate, evTime] = ev.start_time.split(' ');
      if (targetDateStr && evDate === targetDateStr) {
        const evStartHour = parseInt((evTime || '00').split(':')[0], 10);
        const evEndHour = evStartHour + ev.duration_hours;

        if (searchStart < evEndHour && evStartHour < searchEnd) {
          conflicts.push({
            type: 'event',
            title: ev.event_type,
            id: ev.event_id,
            timeRange: `${evStartHour}:00 – ${evEndHour}:00`,
            details: `Booked event (${ev.expected_attendance} exp. attendance)`,
            startHour: evStartHour,
            endHour: evEndHour
          });
        }
      }
    });

    const hasConflict = conflicts.length > 0;

    // 3. Transparent scoring calculation (0 to 100)
    // Only available and eligible rooms receive positive ranking
    let capacityFit = 0;
    let facilityMatch = 0;
    let locationConvenience = 0;
    let scheduleBuffer = 0;

    if (isEligible && !hasConflict) {
      // Capacity Fit (Max 40 points)
      // High score for tighter capacity ratio (minimizes space wastage)
      const ratio = filters.minCapacity / room.capacity;
      // ratio is in range (0, 1]. Closer to 1 is more efficient.
      capacityFit = Math.round(ratio * 40);
      reasons.push(`Capacity efficiency: ${Math.round(ratio * 100)}% (${room.capacity} seats for ${filters.minCapacity} attendees, +${capacityFit} pts)`);

      // Facility Match (Max 25 points)
      // 15 base points for meeting mandatory specs
      let facScore = 15;
      if (room.projector) {
        facScore += 3;
        reasons.push('Equipped with presentation projector');
      }
      if (room.computers) {
        facScore += 3;
        reasons.push('Features computer workstation bank');
      }
      if (room.accessible) {
        facScore += 2;
        reasons.push('Verified step-free / ADA accessible entry');
      }
      if (room.power_outlets >= 15) {
        facScore += 2;
        reasons.push(`High outlet density (${room.power_outlets} outlets)`);
      }
      facilityMatch = Math.min(25, facScore);

      // Location & Floor Convenience (Max 15 points)
      let locScore = 6;
      if (room.building === 'Central') {
        locScore += 4;
        reasons.push('Central campus hub location');
      }
      if (room.floor <= 1) {
        locScore += 5;
        reasons.push(`Ground or first floor accessibility (Floor ${room.floor})`);
      } else if (room.floor === 2) {
        locScore += 3;
      }
      locationConvenience = Math.min(15, locScore);

      // Schedule Buffer (Max 20 points)
      // Rooms with fewer total hours booked on the day offer greater buffer for setup/teardown
      if (totalScheduledHoursToday <= 2) {
        scheduleBuffer = 20;
        reasons.push(`Light daily load (${totalScheduledHoursToday} hrs scheduled on ${targetWeekday}, +20 pts buffer)`);
      } else if (totalScheduledHoursToday <= 5) {
        scheduleBuffer = 14;
        reasons.push(`Moderate daily load (${totalScheduledHoursToday} hrs scheduled on ${targetWeekday}, +14 pts)`);
      } else {
        scheduleBuffer = 8;
        reasons.push(`Active room with ${totalScheduledHoursToday} hrs scheduled on ${targetWeekday}`);
      }

      reasons.unshift('Zero conflicting recurring classes or dated events detected');
    } else if (hasConflict) {
      reasons.push(`Schedule conflict with ${conflicts.length} overlapping record(s)`);
    } else if (!isEligible) {
      reasons.push(disqualificationReason || 'Does not meet mandatory search criteria');
    }

    const totalScore = isEligible && !hasConflict
      ? capacityFit + facilityMatch + locationConvenience + scheduleBuffer
      : 0;

    return {
      room,
      isEligible,
      hasConflict,
      conflicts,
      disqualificationReason,
      score: totalScore,
      scoreBreakdown: {
        capacityFit,
        facilityMatch,
        locationConvenience,
        scheduleBuffer
      },
      reasons,
      limitations: 'Availability computed from supplied class schedules & event records; does not reflect live foot-traffic or uncatalogued bookings.'
    };
  });

  // Sort: First available & eligible with highest score, then conflicted, then ineligible
  results.sort((a, b) => {
    if (a.isEligible && !a.hasConflict && (!b.isEligible || b.hasConflict)) return -1;
    if (b.isEligible && !b.hasConflict && (!a.isEligible || a.hasConflict)) return 1;
    if (a.score !== b.score) return b.score - a.score;
    // Tie-break by closer capacity
    return a.room.capacity - b.room.capacity;
  });

  return results;
}
