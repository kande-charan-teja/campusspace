const fs = require('fs');
const path = require('path');

const publicDataDir = path.join(__dirname, '../public/data');
if (!fs.existsSync(publicDataDir)) {
  fs.mkdirSync(publicDataDir, { recursive: true });
}

// Simple seeded pseudo-random number generator (Mulberry32) for perfectly reproducible data
function mulberry32(a) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
}

// 1. Generate class_schedule.csv (5000 rows)
const rngSchedule = mulberry32(1001);
const roomsList = Array.from({ length: 120 }, (_, i) => `R${String(i + 1).padStart(3, '0')}`);
const coursesList = Array.from({ length: 60 }, (_, i) => `CS${String(i + 1).padStart(3, '0')}`);
const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const departments = ['EEE', 'ECE', 'CSE', 'Management', 'Sciences', 'Mechanical'];

// Known initial rows from the prompt
const initialSchedules = [
  "S00001,R065,CS040,Fri,9,1,122,EEE",
  "S00002,R120,CS030,Mon,12,2,83,ECE",
  "S00003,R086,CS024,Wed,10,2,42,CSE",
  "S00004,R084,CS050,Mon,12,2,85,Management",
  "S00005,R061,CS058,Wed,10,1,135,EEE",
  "S00006,R098,CS040,Wed,14,3,59,EEE",
  "S00007,R014,CS052,Mon,14,2,125,CSE",
  "S00008,R034,CS038,Tue,12,1,70,Management",
  "S00009,R097,CS031,Fri,16,1,111,CSE",
  "S00010,R033,CS027,Wed,10,2,46,Management"
];

const scheduleRows = ['schedule_id,room_id,course_code,weekday,start_hour,duration_hours,expected_attendance,department'];
for (let i = 1; i <= 5000; i++) {
  if (i <= initialSchedules.length) {
    scheduleRows.push(initialSchedules[i - 1]);
  } else {
    const id = `S${String(i).padStart(5, '0')}`;
    const room = roomsList[Math.floor(rngSchedule() * roomsList.length)];
    const course = coursesList[Math.floor(rngSchedule() * coursesList.length)];
    const day = weekdays[Math.floor(rngSchedule() * weekdays.length)];
    const startHour = 8 + Math.floor(rngSchedule() * 10); // 8 to 17
    const duration = [1, 2, 3][Math.floor(rngSchedule() * 3)];
    const attendance = 10 + Math.floor(rngSchedule() * 140);
    const dept = departments[Math.floor(rngSchedule() * departments.length)];
    scheduleRows.push(`${id},${room},${course},${day},${startHour},${duration},${attendance},${dept}`);
  }
}
fs.writeFileSync(path.join(publicDataDir, 'class_schedule.csv'), scheduleRows.join('\n'));
console.log('Saved class_schedule.csv with', scheduleRows.length - 1, 'records');

// 2. Generate events.csv (1800 rows)
const rngEvents = mulberry32(2002);
const eventTypes = ['Guest lecture', 'Seminar', 'Club meeting', 'Exam', 'Workshop'];
const initialEvents = [
  "EV00001,R051,Guest lecture,2025-09-13 07:00:00,1,65,55",
  "EV00002,R060,Seminar,2025-08-06 21:00:00,2,104,6",
  "EV00003,R023,Seminar,2025-11-18 02:00:00,2,144,41",
  "EV00004,R003,Club meeting,2025-10-26 11:00:00,4,91,81",
  "EV00005,R022,Club meeting,2025-09-29 04:00:00,3,99,67",
  "EV00006,R104,Exam,2025-08-24 23:00:00,3,92,83",
  "EV00007,R088,Workshop,2025-11-22 07:00:00,3,16,87",
  "EV00008,R027,Seminar,2025-11-15 21:00:00,4,18,105",
  "EV00009,R033,Guest lecture,2025-08-29 06:00:00,3,130,114",
  "EV00010,R071,Workshop,2025-09-10 09:00:00,3,12,42"
];

const eventRows = ['event_id,room_id,event_type,start_time,duration_hours,expected_attendance,actual_attendance'];
// Aug 1, 2025 to Nov 28, 2025 timestamp bounds
const startTimestamp = new Date('2025-08-01T00:00:00Z').getTime();
const endTimestamp = new Date('2025-11-28T23:00:00Z').getTime();

for (let i = 1; i <= 1800; i++) {
  if (i <= initialEvents.length) {
    eventRows.push(initialEvents[i - 1]);
  } else {
    const id = `EV${String(i).padStart(5, '0')}`;
    const room = roomsList[Math.floor(rngEvents() * roomsList.length)];
    const type = eventTypes[Math.floor(rngEvents() * eventTypes.length)];
    const randTime = new Date(startTimestamp + rngEvents() * (endTimestamp - startTimestamp));
    // Round to hour
    randTime.setUTCMinutes(0, 0, 0);
    const dateStr = randTime.toISOString().slice(0, 10);
    const hourStr = String(randTime.getUTCHours()).padStart(2, '0');
    const startTimeStr = `${dateStr} ${hourStr}:00:00`;
    const duration = [1, 2, 3, 4][Math.floor(rngEvents() * 4)];
    const expected = 10 + Math.floor(rngEvents() * 140);
    const actual = Math.max(5, Math.floor(expected * (0.4 + rngEvents() * 0.9)));
    eventRows.push(`${id},${room},${type},${startTimeStr},${duration},${expected},${actual}`);
  }
}
fs.writeFileSync(path.join(publicDataDir, 'events.csv'), eventRows.join('\n'));
console.log('Saved events.csv with', eventRows.length - 1, 'records');

// 3. Generate room_requests.csv (5000 rows)
const rngRequests = mulberry32(3003);
const purposes = ['Study group', 'Class', 'Workshop', 'Club meeting', 'Project work'];
const statuses = ['Approved', 'Waitlisted', 'Rejected', 'Cancelled'];
const initialRequests = [
  "Q00001,2025-08-03,13,1,94,1,0,Study group,Cancelled",
  "Q00002,2025-09-11,16,1,107,0,0,Class,Approved",
  "Q00003,2025-09-24,9,2,7,0,0,Workshop,Waitlisted",
  "Q00004,2025-10-31,13,2,89,1,1,Club meeting,Approved",
  "Q00005,2025-11-24,19,1,116,0,0,Workshop,Approved",
  "Q00006,2025-10-07,12,2,69,0,0,Study group,Waitlisted",
  "Q00007,2025-10-06,10,1,93,0,0,Club meeting,Approved",
  "Q00008,2025-10-02,12,3,13,0,0,Workshop,Waitlisted",
  "Q00009,2025-09-08,13,1,79,0,0,Study group,Waitlisted",
  "Q00010,2025-08-31,17,2,77,0,0,Class,Rejected"
];

const requestRows = ['request_id,request_date,start_hour,duration_hours,required_capacity,projector_required,computers_required,purpose,status'];
for (let i = 1; i <= 5000; i++) {
  if (i <= initialRequests.length) {
    requestRows.push(initialRequests[i - 1]);
  } else {
    const id = `Q${String(i).padStart(5, '0')}`;
    const randTime = new Date(startTimestamp + rngRequests() * (endTimestamp - startTimestamp));
    const dateStr = randTime.toISOString().slice(0, 10);
    const startHour = 8 + Math.floor(rngRequests() * 13); // 8 to 20
    const duration = [1, 2, 3, 4][Math.floor(rngRequests() * 4)];
    const capacity = 5 + Math.floor(rngRequests() * 115);
    const projector = rngRequests() > 0.5 ? 1 : 0;
    const computers = rngRequests() > 0.75 ? 1 : 0;
    const purpose = purposes[Math.floor(rngRequests() * purposes.length)];
    const statusRoll = rngRequests();
    const status = statusRoll < 0.45 ? 'Approved' : (statusRoll < 0.70 ? 'Waitlisted' : (statusRoll < 0.88 ? 'Rejected' : 'Cancelled'));
    requestRows.push(`${id},${dateStr},${startHour},${duration},${capacity},${projector},${computers},${purpose},${status}`);
  }
}
fs.writeFileSync(path.join(publicDataDir, 'room_requests.csv'), requestRows.join('\n'));
console.log('Saved room_requests.csv with', requestRows.length - 1, 'records');
