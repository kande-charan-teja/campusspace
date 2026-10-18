import {
  Room,
  ClassSchedule,
  CampusEvent,
  RoomRequest
} from '../types/campus';

export interface AnalyticsData {
  totalRooms: number;
  totalRequests: number;
  totalClasses: number;
  totalEvents: number;

  statusDistribution: Array<{ name: string; count: number; percentage: number }>;
  purposeDistribution: Array<{ name: string; count: number; percentage: number }>;
  hourlyDemand: Array<{ hour: string; count: number }>;
  weekdayClassLoad: Array<{ weekday: string; classCount: number; scheduledHours: number }>;
  capacityDistribution: Array<{ range: string; count: number }>;
  facilityDemand: Array<{ name: string; requestedCount: number; availableCount: number }>;
  departmentClassHours: Array<{ department: string; hours: number; classes: number }>;
  eventAttendanceComparison: Array<{
    eventType: string;
    expectedAvg: number;
    actualAvg: number;
    totalEvents: number;
    deltaRatio: number;
  }>;
  buildingBreakdown: Array<{
    building: string;
    roomCount: number;
    totalSeats: number;
    avgCapacity: number;
  }>;
}

export function computeAnalytics(
  rooms: Room[],
  classSchedules: ClassSchedule[],
  events: CampusEvent[],
  requests: RoomRequest[]
): AnalyticsData {
  const totalRooms = rooms.length;
  const totalRequests = requests.length;
  const totalClasses = classSchedules.length;
  const totalEvents = events.length;

  // 1. Status Distribution
  const statusCounts: Record<string, number> = {};
  requests.forEach(r => {
    statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
  });
  const statusDistribution = Object.entries(statusCounts).map(([name, count]) => ({
    name,
    count,
    percentage: totalRequests > 0 ? Math.round((count / totalRequests) * 100) : 0
  }));

  // 2. Demand by Purpose
  const purposeCounts: Record<string, number> = {};
  requests.forEach(r => {
    purposeCounts[r.purpose] = (purposeCounts[r.purpose] || 0) + 1;
  });
  const purposeDistribution = Object.entries(purposeCounts).map(([name, count]) => ({
    name,
    count,
    percentage: totalRequests > 0 ? Math.round((count / totalRequests) * 100) : 0
  })).sort((a, b) => b.count - a.count);

  // 3. Hourly Demand (from requests start_hour)
  const hourCounts: Record<number, number> = {};
  for (let h = 8; h <= 20; h++) hourCounts[h] = 0;
  requests.forEach(r => {
    if (r.start_hour >= 8 && r.start_hour <= 20) {
      hourCounts[r.start_hour] = (hourCounts[r.start_hour] || 0) + 1;
    }
  });
  const hourlyDemand = Object.entries(hourCounts).map(([h, count]) => ({
    hour: `${h.padStart(2, '0')}:00`,
    count
  }));

  // 4. Weekday class load
  const weekdayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weekdayStats: Record<string, { count: number; hours: number }> = {};
  weekdayOrder.forEach(day => {
    weekdayStats[day] = { count: 0, hours: 0 };
  });
  classSchedules.forEach(s => {
    if (weekdayStats[s.weekday]) {
      weekdayStats[s.weekday].count += 1;
      weekdayStats[s.weekday].hours += s.duration_hours;
    }
  });
  const weekdayClassLoad = weekdayOrder.map(day => ({
    weekday: day,
    classCount: weekdayStats[day].count,
    scheduledHours: weekdayStats[day].hours
  }));

  // 5. Capacity distribution of requests
  const capRanges = [
    { label: '1 - 25 seats', min: 1, max: 25 },
    { label: '26 - 50 seats', min: 26, max: 50 },
    { label: '51 - 75 seats', min: 51, max: 75 },
    { label: '76 - 100 seats', min: 76, max: 100 },
    { label: '101+ seats', min: 101, max: 9999 }
  ];
  const capCounts = capRanges.map(r => ({ range: r.label, count: 0 }));
  requests.forEach(req => {
    for (let i = 0; i < capRanges.length; i++) {
      if (req.required_capacity >= capRanges[i].min && req.required_capacity <= capRanges[i].max) {
        capCounts[i].count += 1;
        break;
      }
    }
  });

  // 6. Facility Demand vs Available Supply
  const reqProjector = requests.filter(r => r.projector_required).length;
  const availProjector = rooms.filter(r => r.projector).length;
  const reqComputers = requests.filter(r => r.computers_required).length;
  const availComputers = rooms.filter(r => r.computers).length;
  const availAccessible = rooms.filter(r => r.accessible).length;

  const facilityDemand = [
    {
      name: 'Projector',
      requestedCount: reqProjector,
      availableCount: availProjector
    },
    {
      name: 'Computer Stations',
      requestedCount: reqComputers,
      availableCount: availComputers
    },
    {
      name: 'Wheelchair Accessible',
      requestedCount: 0, // Requests table doesn't record accessible request directly; available in rooms
      availableCount: availAccessible
    }
  ];

  // 7. Department scheduled class hours
  const deptHours: Record<string, { hours: number; classes: number }> = {};
  classSchedules.forEach(s => {
    const d = s.department || 'Other';
    if (!deptHours[d]) deptHours[d] = { hours: 0, classes: 0 };
    deptHours[d].hours += s.duration_hours;
    deptHours[d].classes += 1;
  });
  const departmentClassHours = Object.entries(deptHours)
    .map(([department, data]) => ({
      department,
      hours: data.hours,
      classes: data.classes
    }))
    .sort((a, b) => b.hours - a.hours);

  // 8. Event Expected vs Actual Attendance
  const evTypeAgg: Record<string, { expectedSum: number; actualSum: number; count: number }> = {};
  events.forEach(ev => {
    const t = ev.event_type || 'Other';
    if (!evTypeAgg[t]) evTypeAgg[t] = { expectedSum: 0, actualSum: 0, count: 0 };
    evTypeAgg[t].expectedSum += ev.expected_attendance;
    evTypeAgg[t].actualSum += ev.actual_attendance;
    evTypeAgg[t].count += 1;
  });
  const eventAttendanceComparison = Object.entries(evTypeAgg).map(([eventType, data]) => {
    const expectedAvg = data.count > 0 ? Math.round(data.expectedSum / data.count) : 0;
    const actualAvg = data.count > 0 ? Math.round(data.actualSum / data.count) : 0;
    const deltaRatio = expectedAvg > 0 ? Math.round(((actualAvg - expectedAvg) / expectedAvg) * 100) : 0;
    return {
      eventType,
      expectedAvg,
      actualAvg,
      totalEvents: data.count,
      deltaRatio
    };
  });

  // 9. Building breakdown
  const bldgMap: Record<string, { count: number; totalCap: number }> = {};
  rooms.forEach(r => {
    const b = r.building || 'Unknown';
    if (!bldgMap[b]) bldgMap[b] = { count: 0, totalCap: 0 };
    bldgMap[b].count += 1;
    bldgMap[b].totalCap += r.capacity;
  });
  const buildingBreakdown = Object.entries(bldgMap).map(([building, data]) => ({
    building,
    roomCount: data.count,
    totalSeats: data.totalCap,
    avgCapacity: data.count > 0 ? Math.round(data.totalCap / data.count) : 0
  })).sort((a, b) => b.totalSeats - a.totalSeats);

  return {
    totalRooms,
    totalRequests,
    totalClasses,
    totalEvents,
    statusDistribution,
    purposeDistribution,
    hourlyDemand,
    weekdayClassLoad,
    capacityDistribution: capCounts,
    facilityDemand,
    departmentClassHours,
    eventAttendanceComparison,
    buildingBreakdown
  };
}
