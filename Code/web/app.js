// ==========================================================================
// THE ROYAL SPICE — VISUAL COMPANION APP CONTROLLER
// Seamless C++17 Core Engine REST Integration
// ==========================================================================

const API_ROOT = 'http://localhost:8080/api';

const state = {
  metrics: {},
  tables: [],
  bookings: [],
  activity: [],
  selectedDate: '24/05/2026',
  selectedTime: '8:00 PM',
  selectedZone: 'ALL',
  selectedTableId: 0,
  availableTableIds: [],
  occupiedTableIds: []
};

// ================= DOM ELEMENTS =================
const floorCanvas = document.getElementById('floor-canvas');
const floorViewIndicator = document.getElementById('floor-view-indicator');
const bookingsTbody = document.getElementById('bookings-tbody');
const fleetTbody = document.getElementById('fleet-tbody');
const zoneBreakdownList = document.getElementById('zone-breakdown-list');
const activityTimeline = document.getElementById('activity-stream-timeline');

// Metrics Elements
const statTables = document.getElementById('stat-tables');
const statTablesOp = document.getElementById('stat-tables-op');
const statCapacity = document.getElementById('stat-capacity');
const statBookings = document.getElementById('stat-bookings');
const statOccupancy = document.getElementById('stat-occupancy');
const statOccupancyRatio = document.getElementById('stat-occupancy-ratio');
const badgeBookingsCount = document.getElementById('badge-bookings-count');

// Inputs & Selectors
const inputDate = document.getElementById('input-date');
const filterZoneSelect = document.getElementById('filter-zone-select');
const timeCarousel = document.getElementById('time-carousel');
const searchBookingsQuery = document.getElementById('search-bookings-query');
const selectAssignedTable = document.getElementById('select-assigned-table');

// Forms & Modals
const bookingWizardForm = document.getElementById('booking-wizard-form');
const formCreateTable = document.getElementById('form-create-table');
const modalAddTable = document.getElementById('modal-add-table');
const modalPass = document.getElementById('modal-pass');
const ticketInfoGrid = document.getElementById('ticket-info-grid');
const toastHub = document.getElementById('toast-hub');

// ================= AUDIO FEEDBACK (OPTIONAL SYNTH) =================
function playChime(type = 'click') {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'success') {
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else {
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    }
  } catch (e) {
    // AudioContext not allowed before user gesture
  }
}

// ================= TOAST SYSTEM =================
function notify(text, type = 'info') {
  const t = document.createElement('div');
  t.className = `toast-msg t-${type}`;
  t.textContent = text;
  toastHub.appendChild(t);
  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translateY(10px)';
    setTimeout(() => t.remove(), 300);
  }, 3500);
}

// ================= DATA FETCHING =================
async function syncBackendState() {
  try {
    const res = await fetch(`${API_ROOT}/state`);
    if (!res.ok) throw new Error('C++ Server Offline');
    const data = await res.json();

    state.metrics = data.metrics || {};
    state.tables = data.tables || [];
    state.bookings = data.bookings || [];
    state.activity = data.activity || [];

    document.getElementById('core-badge').style.borderColor = 'rgba(16, 185, 129, 0.3)';
    document.getElementById('core-badge').querySelector('.engine-label').textContent = 'C++ Engine Live';

    await refreshSlotAvailability();
  } catch (err) {
    document.getElementById('core-badge').style.borderColor = 'rgba(244, 63, 94, 0.4)';
    document.getElementById('core-badge').querySelector('.engine-label').textContent = '⚠️ Backend Disconnected';
  }
}

async function refreshSlotAvailability() {
  try {
    const res = await fetch(`${API_ROOT}/availability?date=${encodeURIComponent(state.selectedDate)}&time=${encodeURIComponent(state.selectedTime)}`);
    if (res.ok) {
      const data = await res.json();
      state.availableTableIds = data.available || [];
      state.occupiedTableIds = data.occupied || [];
    }
  } catch (err) {
    console.error('Availability fetch error:', err);
  }

  renderAllComponents();
}

// ================= RENDER EVERYTHING =================
function renderAllComponents() {
  renderMetrics();
  renderFloorPlan();
  renderTableDropdown();
  renderBookingsGrid();
  renderFleetGrid();
  renderZoneBreakdown();
  renderActivityTrail();

  floorViewIndicator.textContent = `Viewing: ${state.selectedDate} at ${state.selectedTime}`;
  badgeBookingsCount.textContent = state.bookings.length;
}

// 1. Render Metrics Strip
function renderMetrics() {
  const total = state.tables.length;
  const operational = state.tables.filter(t => t.status === 'Available').length;
  const capacity = state.metrics.totalCapacity || 0;
  const occupiedCount = state.occupiedTableIds.length;
  const rate = operational > 0 ? Math.round((occupiedCount / operational) * 100) : 0;

  statTables.textContent = total;
  statTablesOp.textContent = `${operational} Open`;
  statCapacity.textContent = capacity;
  statBookings.textContent = state.bookings.length;
  statOccupancy.textContent = `${rate}%`;
  statOccupancyRatio.textContent = `${occupiedCount}/${operational} Booked`;
}

// 2. Table Geometry & Fixture Icons
function getFixtureMeta(type, capacity) {
  const t = type.toLowerCase();
  if (t.includes('vip')) return { shape: 'shape-vip', icon: '👑', label: 'VIP Royal Suite' };
  if (t.includes('couple') || capacity <= 2) return { shape: 'shape-round', icon: '🍷', label: 'Couples Alcove' };
  if (t.includes('banquet') || capacity >= 8) return { shape: 'shape-banquet', icon: '🍾', label: 'Grand Banquet' };
  return { shape: 'shape-booth', icon: '🍽️', label: 'Family Dining Booth' };
}

// 3. Render 2D Floor Plan Canvas
function renderFloorPlan() {
  floorCanvas.innerHTML = '';

  let filtered = state.tables;
  if (state.selectedZone !== 'ALL') {
    filtered = state.tables.filter(t => t.type.toLowerCase().includes(state.selectedZone.toLowerCase()));
  }

  if (filtered.length === 0) {
    floorCanvas.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 50px;">
        No tables found in section "${state.selectedZone}".
      </div>
    `;
    return;
  }

  filtered.forEach(table => {
    const isMaintenance = table.status === 'Maintenance';
    const isOccupied = state.occupiedTableIds.includes(table.id);
    const isSelected = state.selectedTableId === table.id;

    let podClass = 'pod-free';
    let statusText = 'FREE';

    if (isMaintenance) {
      podClass = 'pod-off';
      statusText = 'OFFLINE';
    } else if (isOccupied) {
      podClass = 'pod-busy';
      statusText = 'RESERVED';
    }

    const { shape, icon, label } = getFixtureMeta(table.type, table.capacity);

    const pod = document.createElement('div');
    pod.className = `table-pod ${podClass} ${isSelected ? 'pod-selected' : ''}`;
    pod.dataset.id = table.id;

    // Symmetrical Chairs around perimeter
    let chairsHtml = '<div class="chair-item ch-top"></div><div class="chair-item ch-bottom"></div>';
    if (table.capacity >= 4) {
      chairsHtml += '<div class="chair-item ch-left"></div><div class="chair-item ch-right"></div>';
    }
    if (table.capacity >= 6) {
      chairsHtml += '<div class="chair-item ch-top-l"></div><div class="chair-item ch-top-r"></div>';
    }
    if (table.capacity >= 8) {
      chairsHtml += '<div class="chair-item ch-bot-l"></div><div class="chair-item ch-bot-r"></div>';
    }

    // Reservation Tooltip
    let currentBooking = null;
    if (isOccupied) {
      currentBooking = state.bookings.find(b => b.tableId === table.id && b.date === state.selectedDate && b.time === state.selectedTime);
    }

    pod.innerHTML = `
      <span class="pod-id-tag">#T-${table.id < 10 ? '0' + table.id : table.id}</span>
      <span class="pod-status-badge">${statusText}</span>

      <div class="pod-fixture">
        <div class="fixture-surface ${shape}">
          <span>${icon}</span>
        </div>
        ${chairsHtml}
      </div>

      <div class="pod-info">
        <div class="pod-name">${table.type}</div>
        <div class="pod-cap">${table.capacity} Guest Seats</div>
        ${currentBooking ? `<div class="pod-guest-tag">Reserved: ${currentBooking.guestName}</div>` : ''}
      </div>
    `;

    // Click handler to select table
    pod.addEventListener('click', () => {
      playChime('click');

      if (isMaintenance) {
        notify(`Table #${table.id} is currently under maintenance.`, 'error');
        return;
      }

      if (isOccupied) {
        notify(`Table #${table.id} is occupied by "${currentBooking?.guestName || 'Guest'}" at this time slot.`, 'info');
      } else {
        state.selectedTableId = table.id;
        selectAssignedTable.value = String(table.id);
        document.getElementById('input-party-size').value = Math.min(table.capacity, 4);
        notify(`Table #${table.id} selected for reservation.`, 'success');
        renderFloorPlan();
      }
    });

    floorCanvas.appendChild(pod);
  });
}

// 4. Render Table Dropdown in Wizard
function renderTableDropdown() {
  const currentVal = selectAssignedTable.value;
  selectAssignedTable.innerHTML = '<option value="0">✨ Auto-Assign Best Fit (Smart Engine)</option>';

  state.tables.forEach(t => {
    if (t.status === 'Available') {
      const opt = document.createElement('option');
      opt.value = t.id;
      const isOcc = state.occupiedTableIds.includes(t.id);
      opt.textContent = `Table #${t.id} - ${t.type} (${t.capacity} seats) ${isOcc ? '⚠️ Occupied in slot' : '✅ Free'}`;
      selectAssignedTable.appendChild(opt);
    }
  });

  selectAssignedTable.value = currentVal || '0';
}

// 5. Render Reservations Table
function renderBookingsGrid() {
  const query = searchBookingsQuery.value.trim().toLowerCase();
  bookingsTbody.innerHTML = '';

  const list = state.bookings.filter(b => {
    if (!query) return true;
    return b.guestName.toLowerCase().includes(query) ||
           String(b.bookingId).includes(query) ||
           b.date.includes(query) ||
           String(b.tableId).includes(query);
  });

  if (list.length === 0) {
    bookingsTbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center; color:var(--text-muted); padding:36px;">
          No reservations found.
        </td>
      </tr>
    `;
    return;
  }

  list.forEach(b => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>#${b.bookingId}</strong></td>
      <td><span class="badge-tag badge-gold">Table #${b.tableId}</span></td>
      <td><strong>${b.guestName}</strong></td>
      <td>${b.guests} Guests</td>
      <td><code>${b.date}</code></td>
      <td><code>${b.time}</code></td>
      <td><span class="badge-tag badge-emerald">CONFIRMED</span></td>
      <td>
        <div style="display:flex; gap:8px;">
          <button class="btn btn-secondary btn-sm btn-view-ticket" data-id="${b.bookingId}">View Pass</button>
          <button class="btn-danger-sm btn-cancel-booking" data-id="${b.bookingId}">Cancel</button>
        </div>
      </td>
    `;
    bookingsTbody.appendChild(tr);
  });

  document.querySelectorAll('.btn-view-ticket').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      const b = state.bookings.find(x => x.bookingId === id);
      if (b) showTicketPass(b);
    });
  });

  document.querySelectorAll('.btn-cancel-booking').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      cancelReservation(id);
    });
  });
}

// 6. Render Fleet Table in Analytics View
function renderFleetGrid() {
  fleetTbody.innerHTML = '';
  state.tables.forEach(t => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>#T-${t.id}</strong></td>
      <td>${t.capacity} Guests</td>
      <td>${t.type}</td>
      <td><span class="badge-tag ${t.status === 'Available' ? 'badge-emerald' : 'badge-ruby'}">${t.status}</span></td>
      <td>
        <button class="btn btn-secondary btn-sm btn-book-table" data-id="${t.id}">Select</button>
      </td>
    `;
    fleetTbody.appendChild(tr);
  });

  document.querySelectorAll('.btn-book-table').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      state.selectedTableId = id;
      selectAssignedTable.value = String(id);
      switchNavigationTab('floor-view');
      notify(`Table #${id} selected in booking wizard.`, 'info');
    });
  });
}

// 7. Render Zone Breakdown
function renderZoneBreakdown() {
  zoneBreakdownList.innerHTML = '';
  const counts = {};
  state.tables.forEach(t => {
    counts[t.type] = (counts[t.type] || 0) + 1;
  });

  for (const [type, count] of Object.entries(counts)) {
    const div = document.createElement('div');
    div.className = 'zone-stat-card';
    div.innerHTML = `
      <span><strong>${type}</strong></span>
      <span class="badge-tag badge-gold">${count} Tables</span>
    `;
    zoneBreakdownList.appendChild(div);
  }
}

// 8. Render Activity Timeline
function renderActivityTrail() {
  activityTimeline.innerHTML = '';
  if (state.activity.length === 0) {
    activityTimeline.innerHTML = '<div style="color:var(--text-muted); padding:20px;">No audit events recorded yet.</div>';
    return;
  }

  const reversed = [...state.activity].reverse();
  reversed.forEach(item => {
    const card = document.createElement('div');
    card.className = 'activity-event-card';
    card.innerHTML = `
      <div class="event-clock">${item.timestamp}</div>
      <div>
        <div class="event-label">${item.type}</div>
        <div class="event-text">${item.message}</div>
      </div>
    `;
    activityTimeline.appendChild(card);
  });
}

// ================= 6-STAGE ALGORITHM VISUALIZER ANIMATION =================
function resetPipelineAnimation() {
  for (let i = 1; i <= 5; ++i) {
    const node = document.getElementById(`step-${i}`);
    node.className = 'flow-step';
  }
  document.getElementById('pipeline-status-badge').textContent = 'Allocating...';
  document.getElementById('pipeline-status-badge').style.color = '#fbbf24';
}

function setPipelineStepState(step, status, text = null) {
  const node = document.getElementById(`step-${step}`);
  if (!node) return;
  node.className = `flow-step step-${status}`;
  if (text) {
    document.getElementById(`step-${step}-sub`).textContent = text;
  }
}

async function runAllocationSequence(trace, success, createdBooking, errorMsg) {
  resetPipelineAnimation();

  // Step 1: Sanitization
  setPipelineStepState(1, 'active', 'Validating guest parameters');
  await new Promise(r => setTimeout(r, 200));
  setPipelineStepState(1, 'complete', 'Input verified');

  // Step 2: Slot Window
  setPipelineStepState(2, 'active', 'Checking date & time boundaries');
  await new Promise(r => setTimeout(r, 200));
  setPipelineStepState(2, 'complete', `${createdBooking?.date || state.selectedDate} @ ${createdBooking?.time || state.selectedTime}`);

  // Step 3: Conflict Scan
  setPipelineStepState(3, 'active', 'Scanning slot collisions in active records');
  await new Promise(r => setTimeout(r, 240));
  setPipelineStepState(3, 'complete', 'Slot conflict scan complete');

  // Step 4: Best-Fit Match
  setPipelineStepState(4, 'active', 'Matching optimal seating capacity');
  await new Promise(r => setTimeout(r, 280));

  if (!success) {
    setPipelineStepState(4, 'active', errorMsg || 'No table match');
    document.getElementById('pipeline-status-badge').textContent = 'Allocation Failed';
    document.getElementById('pipeline-status-badge').style.color = '#f43f5e';
    notify(errorMsg || 'Reservation failed: No table available.', 'error');
    return;
  }

  setPipelineStepState(4, 'complete', `Matched Table #${createdBooking.tableId}`);

  // Step 5: Disk Persist
  setPipelineStepState(5, 'active', 'Writing to tables.txt & bookings.txt');
  await new Promise(r => setTimeout(r, 200));
  setPipelineStepState(5, 'complete', 'Disk persistence confirmed');

  document.getElementById('pipeline-status-badge').textContent = 'Confirmed';
  document.getElementById('pipeline-status-badge').style.color = '#10b981';

  playChime('success');
  showTicketPass(createdBooking);
}

// ================= LUXURY RESERVATION PASS MODAL =================
function showTicketPass(b) {
  ticketInfoGrid.innerHTML = `
    <div class="ticket-field">
      <label>Booking Reference</label>
      <strong>#${b.bookingId}</strong>
    </div>
    <div class="ticket-field">
      <label>Assigned Dining Table</label>
      <strong style="color:var(--gold-400);">Table #${b.tableId}</strong>
    </div>
    <div class="ticket-field">
      <label>Guest Full Name</label>
      <strong>${b.guestName}</strong>
    </div>
    <div class="ticket-field">
      <label>Party Size</label>
      <strong>${b.guests} Guest(s)</strong>
    </div>
    <div class="ticket-field">
      <label>Reservation Date</label>
      <strong>${b.date}</strong>
    </div>
    <div class="ticket-field">
      <label>Dining Time Slot</label>
      <strong>${b.time}</strong>
    </div>
  `;
  modalPass.classList.add('is-visible');
}

// ================= USER INTERACTIONS & EVENTS =================

// 1. Segmented Tab Navigation
function switchNavigationTab(viewId) {
  document.querySelectorAll('.nav-segment').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.view === viewId);
  });

  document.querySelectorAll('.view-stage').forEach(panel => {
    panel.classList.toggle('active', panel.id === `view-${viewId.replace('-view', '')}`);
  });
}

document.querySelectorAll('.nav-segment').forEach(tab => {
  tab.addEventListener('click', () => {
    playChime('click');
    switchNavigationTab(tab.dataset.view);
  });
});

// 2. Booking Submission
bookingWizardForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const guestName = document.getElementById('input-guest-name').value.trim();
  const guests = parseInt(document.getElementById('input-party-size').value);
  const date = document.getElementById('input-booking-date').value.trim();
  const time = document.getElementById('select-booking-time').value;
  const tableId = parseInt(selectAssignedTable.value);

  const btn = document.getElementById('btn-submit-booking');
  btn.disabled = true;

  try {
    const res = await fetch(`${API_ROOT}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guestName, guests, date, time, tableId })
    });

    const data = await res.json();
    await runAllocationSequence(data.trace || [], data.success, data.booking, data.error);

    if (data.success) {
      bookingWizardForm.reset();
      document.getElementById('input-party-size').value = '4';
      document.getElementById('input-booking-date').value = state.selectedDate;
      document.getElementById('select-booking-time').value = state.selectedTime;
      state.selectedTableId = 0;
      await syncBackendState();
    }
  } catch (err) {
    notify('Failed to reach C++ backend server.', 'error');
  } finally {
    btn.disabled = false;
  }
});

// 3. Cancel Reservation
async function cancelReservation(id) {
  if (!confirm(`Cancel Reservation #${id}?`)) return;

  try {
    const res = await fetch(`${API_ROOT}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId: id })
    });

    const data = await res.json();
    if (data.success) {
      notify(`Reservation #${id} has been cancelled.`, 'success');
      await syncBackendState();
    } else {
      notify(data.error || 'Could not cancel reservation.', 'error');
    }
  } catch (err) {
    notify('Backend communication error.', 'error');
  }
}

// 4. Create New Table
formCreateTable.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = parseInt(document.getElementById('new-table-id').value);
  const capacity = parseInt(document.getElementById('new-table-cap').value);
  const type = document.getElementById('new-table-type').value.trim();

  try {
    const res = await fetch(`${API_ROOT}/tables`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, capacity, type })
    });

    const data = await res.json();
    if (data.success) {
      notify(`Table #${id} added to the restaurant!`, 'success');
      modalAddTable.classList.remove('is-visible');
      formCreateTable.reset();
      await syncBackendState();
    } else {
      notify(data.error || 'Could not add table.', 'error');
    }
  } catch (err) {
    notify('Error adding table.', 'error');
  }
});

// 5. Stepper & Controls
document.getElementById('btn-party-plus').addEventListener('click', () => {
  const inp = document.getElementById('input-party-size');
  inp.value = Math.min(50, parseInt(inp.value || 1) + 1);
});

document.getElementById('btn-party-minus').addEventListener('click', () => {
  const inp = document.getElementById('input-party-size');
  inp.value = Math.max(1, parseInt(inp.value || 2) - 1);
});

timeCarousel.addEventListener('click', (e) => {
  const chip = e.target.closest('.time-slot-chip');
  if (chip) {
    playChime('click');
    document.querySelectorAll('.time-slot-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    state.selectedTime = chip.dataset.time;
    document.getElementById('select-booking-time').value = state.selectedTime;
    refreshSlotAvailability();
  }
});

inputDate.addEventListener('change', () => {
  state.selectedDate = inputDate.value.trim() || '24/05/2026';
  document.getElementById('input-booking-date').value = state.selectedDate;
  refreshSlotAvailability();
});

document.querySelectorAll('.date-pill').forEach(btn => {
  btn.addEventListener('click', () => {
    playChime('click');
    document.querySelectorAll('.date-pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const preset = btn.dataset.preset;
    if (preset === 'TODAY') {
      const now = new Date();
      state.selectedDate = `${String(now.getDate()).padStart(2,'0')}/${String(now.getMonth()+1).padStart(2,'0')}/${now.getFullYear()}`;
    } else if (preset === 'TOMORROW') {
      const tm = new Date();
      tm.setDate(tm.getDate() + 1);
      state.selectedDate = `${String(tm.getDate()).padStart(2,'0')}/${String(tm.getMonth()+1).padStart(2,'0')}/${tm.getFullYear()}`;
    } else {
      state.selectedDate = preset;
    }
    inputDate.value = state.selectedDate;
    document.getElementById('input-booking-date').value = state.selectedDate;
    refreshSlotAvailability();
  });
});

filterZoneSelect.addEventListener('change', () => {
  state.selectedZone = filterZoneSelect.value;
  renderFloorPlan();
});

searchBookingsQuery.addEventListener('input', renderBookingsGrid);

document.getElementById('btn-sync-core').addEventListener('click', () => {
  syncBackendState();
  notify('State synced with C++ Core Engine.', 'info');
});

// Modals
document.getElementById('btn-show-add-table').addEventListener('click', () => modalAddTable.classList.add('is-visible'));
document.getElementById('btn-close-table-modal').addEventListener('click', () => modalAddTable.classList.remove('is-visible'));
document.getElementById('btn-cancel-table-modal').addEventListener('click', () => modalAddTable.classList.remove('is-visible'));
document.getElementById('btn-close-ticket').addEventListener('click', () => modalPass.classList.remove('is-visible'));

// Auto-sync polling every 3.5s
setInterval(syncBackendState, 3500);

// Initialize on Load
syncBackendState();
