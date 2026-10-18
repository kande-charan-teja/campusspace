# CampusSpace AI

> **Find the Right Space. Make Every Room Count.**  
> *The Campus Has Space. Students Don't.*

**CampusSpace AI** is a university datathon MVP designed to solve the campus space discovery and allocation problem. By reconciling recurring course timetables, dated campus events, and facility inventories, it empowers students, student club coordinators, faculty, and administrators to discover suitable, conflict-free spaces and understand true room demand patterns.

---

## 1. Discovered Dataset Schema & Relationships

The platform is designed around the 4 tables of the datathon benchmark:

| Table | Records | Primary Key | Foreign Keys / Joins | Core Attributes |
|---|---|---|---|---|
| **`rooms.csv`** | 120 | `room_id` (e.g. `R001`–`R120`) | — | `building`, `floor`, `room_type`, `capacity`, `projector`, `computers`, `accessible`, `power_outlets` |
| **`class_schedule.csv`** | 5,000 | `schedule_id` (`S00001`–`S05000`) | `room_id` &rarr; `rooms.room_id` | `course_code`, `weekday` (`Mon`–`Sat`), `start_hour` (`8`–`17`), `duration_hours` (`1`–`3`), `expected_attendance`, `department` |
| **`events.csv`** | 1,800 | `event_id` (`EV00001`–`EV01800`) | `room_id` &rarr; `rooms.room_id` | `event_type` (`Seminar`, `Workshop`, `Exam`, etc.), `start_time` (`YYYY-MM-DD HH:mm:ss`), `duration_hours`, `expected_attendance`, `actual_attendance` |
| **`room_requests.csv`** | 5,000 | `request_id` (`Q00001`–`Q05000`) | *Unallocated demand (No room_id)* | `request_date`, `start_hour`, `duration_hours`, `required_capacity`, `projector_required`, `computers_required`, `purpose`, `status` |

### Key Data Integrity Notes:
- **Unassigned Demand:** `room_requests.csv` represents pre-allocation demand tickets. Because requests do not have assigned `room_id`s, they are used strictly for demand analysis—not for claiming physical utilization of individual rooms.
- **Half-Open Intervals:** Conflict detection models time intervals as `[start, end)`. Consecutive back-to-back bookings (e.g., class ending at 11:00 and request starting at 11:00) do **not** conflict.
- **Availability Definition:** "Available" means *no conflict was detected in the supplied class schedule or event records*. It is not a real-time IoT occupancy sensor.

---

## 2. Core Implemented Features

1. **Smart Room Finder (Flagship Workflow)**
   - Multi-criteria search: calendar date / weekday, start time, duration, seating capacity, room type, building, projector, computer lab, ADA accessibility, and minimum power outlets.
   - Exact interval overlap detection against both recurring classes and dated events.
   - Transparent, mathematical scoring algorithm (0–100 pts) factoring:
     - **Capacity Efficiency (40 pts):** Penalizes oversized allocations that waste large halls on small groups.
     - **Facility Amenities (25 pts):** Match completeness plus equipment bonuses.
     - **Location & Floor Convenience (15 pts):** Ground/first floor and central hub accessibility.
     - **Day Schedule Buffer (20 pts):** Rewards rooms with lighter daily bookings to ease transitions.
   - Natural language explanations generated from actual computations.
   - Ineligible and conflict inspection mode to explain *why* rooms are blocked.

2. **Admin Demand Analytics Dashboard**
   - Interactive charts built with Recharts:
     - Request fulfillment status distribution (Approved, Waitlisted, Rejected, Cancelled).
     - Activity demand by purpose (Study groups, classes, workshops, clubs, project work).
     - Hourly demand curve revealing peak competition hours (10:00 & 14:00).
     - Weekday recurring class hours committed per day across campus.
     - Seating capacity bracket distribution.
     - Event attendance variance: Expected vs. Actual turnout.
     - Departmental teaching load across the 6 campus departments.
   - Purpose filter to isolate specific user segments.

3. **Rooms Catalog & Schedule Inspector**
   - Interactive directory of all 120 rooms.
   - Search by ID, building, room type, or feature flags.
   - Modal view showing full weekly timetable (Mon–Sat) and booked dated events.

4. **Data Management & Schema Validation**
   - Real-time in-browser CSV parsing via PapaParse.
   - Upload replacement CSVs for any of the 4 tables with schema validation, missing column checks, and row-level warning logs.
   - Instant dataset reset to default benchmark files.
   - CSV export of matching rooms and catalog reports.

5. **Methodology & Algorithmic Honesty**
   - 100% deterministic, explainable rule-based logic.
   - Explicit scientific honesty: no hallucinated machine learning models or black boxes.
   - Documented roadmap for future AI enhancements (e.g., ARIMA demand forecasting, ILP room swapping).

---

## 3. Technology Stack — 100% Free First

- **Framework:** React 19 + TypeScript
- **Bundler:** Vite
- **Styling:** Tailwind CSS
- **Visualizations:** Recharts
- **Parsing:** Papa Parse
- **Icons:** Lucide React
- **Runtime:** 100% client-side browser processing. No paid APIs, no API keys, and no database subscriptions required.

---

## 4. Local Installation & Development

To run CampusSpace AI locally:

```bash
# 1. Install dependencies
npm install

# 2. Launch development server
npm run dev

# 3. Open in browser
# http://localhost:3000
```

To build for production:

```bash
npm run build
```

---

## 5. Recommended Live Datathon Demo Workflow

1. **Overview:** Start on the Overview dashboard. Highlight the problem statement (*"The Campus Has Space. Students Don't"*), key dataset metrics, and data integrity disclosure.
2. **Smart Room Finder:**
   - Search for a 45-seat room on Wednesday at 10:00 with a projector.
   - Show the ranked candidate rooms, explainable match score breakdown, and capacity fit percentage.
   - Test a conflict case: switch time to Wednesday 14:00 with 120 capacity. Toggle "Include Conflicted / Ineligible" to show the exact class code and event interval causing the conflict.
3. **Demand Analytics:**
   - Explore peak hourly demand at 14:00.
   - Filter by "Study group" to demonstrate student space bottlenecks.
   - Point out the attendance delta between expected and actual turnout.
4. **Data Management:**
   - Show table row counts (120 rooms, 5,000 classes, 1,800 events, 5,000 requests).
   - Demonstrate the "Download Raw CSV" and "Reset to Default Datasets" controls.
