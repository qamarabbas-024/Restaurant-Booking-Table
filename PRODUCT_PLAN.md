# Product Plan & Scope — Core & Visual Companion

## 1. Product Strategy: Dual-Interface System

The **Restaurant Booking Table** system evolves into a unified dual-interface application:
1. **First-Class Console Interface**: Fast, keyboard-driven, stream-safe C++ terminal interface.
2. **Visual Companion Web Interface**: Interactive floor plan, step-by-step allocation visualizer, and live activity monitor running via an embedded C++ HTTP server.

Both interfaces share 100% of the C++ business logic and persist data to `tables.txt` and `bookings.txt`.

---

## 2. Updated Roadmap & Milestones

```
+-------------------------------------------------------------------------+
| Milestone 1 (V1) - Foundation & Correctness (Completed)                 |
| -> Slot availability bug fix, stream safety, file exception safety,    |
|    OOP encapsulation, namespace cleanup.                                |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
| Milestone 2 (V2) - Core Usability & Operations (Completed)              |
| -> Multi-criteria search, table edit/delete, slot query, cancellation   |
|    confirmation, tabular ASCII grids.                                   |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
| Milestone 3 (V3) - Visual Companion Architecture & Embedded Server      |
| -> Embedded local C++ HTTP server, REST API endpoints, Activity Logger. |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
| Milestone 4 (V4) - Visual Dashboard, Floor Plan & Booking Visualizer    |
| -> Interactive 2D restaurant layout, step-by-step allocation animation, |
|    slot matrix, live activity stream, and search panel in web UI.       |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
| Milestone 5 (V5) - Integration, End-to-End Verification & Polish        |
| -> Bi-directional sync, unified main menu launcher, full test suite.    |
+-------------------------------------------------------------------------+
```
