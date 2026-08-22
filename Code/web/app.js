// ==========================================================================
// THE ROYAL SPICE — CLEAN WHITE THEME MASTER CONTROLLER
// Seamless C++17 Core Engine REST Integration (Port 8080)
// ==========================================================================

const API_BASE = 'http://localhost:8080/api';

const state = {
  activeView: 'dashboard',
  soundEnabled: true,
  selectedOccasion: 'Dinner Reservation',
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

// ================= DOM ELEMENT REFERENCES =================
const dashboardFloorCanvas = document.getElementById('dashboard-floor-canvas');
const floorSlotSubtitle = document.getElementById('floor-slot-subtitle');
const dashboardActivityTimeline = document.getElementById('dashboard-activity-timeline');
const tablesFleetTbody = document.getElementById('tables-fleet-tbody');
const allReservationsTbody = document.getElementById('all-reservations-tbody');
const navBookingsCount = document.getElementById('nav-bookings-count');

// KPI Metrics
const metricTotalTables = document.getElementById('metric-total-tables');
const metricOpTables = document.getElementById('metric-op-tables');
const metricTotalCapacity = document.getElementById('metric-total-capacity');
const metricTotalBookings = document.getElementById('metric-total-bookings');
const metricOccupancyRate = document.getElementById('metric-occupancy-rate');
const metricOccupancyRatio = document.getElementById('metric-occupancy-ratio');

// Controls & Inputs
const slotDateInput = document.getElementById('slot-date-input');
const timeSlotsCarousel = document.getElementById('time-slots-carousel');
const zoneFilterSelect = document.getElementById('zone-filter-select');
const createBookingForm = document.getElementById('create-booking-form');
const selectTableAssignment = document.getElementById('select-table-assignment');
const reservationsSearchQuery = document.getElementById('reservations-search-query');
const soundIconSymbol = document.getElementById('sound-icon-symbol');

// Modals
const modalAddTable = document.getElementById('modal-add-table');
const modalQuickWalkin = document.getElementById('modal-quick-walkin');
const modalBookingReceipt = document.getElementById('modal-booking-receipt');
const receiptDataGrid = document.getElementById('receipt-data-grid');
const toastHub = document.getElementById('toast-hub');

// ================= SYNTHESIZED SOUND ENGINE =================
function playSound(type = 'click') {
  if (!state.soundEnabled) return;
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'clink') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1046.50, audioCtx.currentTime); // C6
      osc.frequency.exponentialRampToValueAtTime(1567.98, audioCtx.currentTime + 0.08); // G6
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } else if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, audioCtx.currentTime + 0.2); // G5
      gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } else if (type === 'pop') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.08);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.06);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.06);
    }
  } catch (e) {
    // blocked before gesture
  }
}

// ================= TOAST NOTIFICATIONS =================
function showToast(message, type = 'info') {
  const alert = document.createElement('div');
  alert.className = `toast-alert-item ${type}`;
  alert.textContent = message;
  toastHub.appendChild(alert);
  setTimeout(() => {
    alert.style.opacity = '0';
    alert.style.transform = 'translateY(8px)';
    setTimeout(() => alert.remove(), 250);
  }, 3500);
}

// ================= REST API SYNC =================
async function syncCoreEngine() {
  try {
    const res = await fetch(`${API_BASE}/state`);
    if (!res.ok) throw new Error('C++ Server Unreachable');
    const data = await res.json();

    state.metrics = data.metrics || {};
    state.tables = data.tables || [];
    state.bookings = data.bookings || [];
    state.activity = data.activity || [];

    document.getElementById('core-status-pill').style.borderColor = 'rgba(22, 163, 74, 0.3)';
    document.getElementById('core-status-pill').querySelector('.status-text').textContent = 'C++ Engine Live';

    await updateSlotAvailability();
  } catch (err) {
    document.getElementById('core-status-pill').style.borderColor = 'rgba(225, 29, 72, 0.4)';
    document.getElementById('core-status-pill').querySelector('.status-text').textContent = '⚠️ Backend Offline';
  }
}

async function updateSlotAvailability() {
  try {
    const res = await fetch(`${API_BASE}/availability?date=${encodeURIComponent(state.selectedDate)}&time=${encodeURIComponent(state.selectedTime)}`);
    if (res.ok) {
      const data = await res.json();
      state.availableTableIds = data.available || [];
      state.occupiedTableIds = data.occupied || [];
    }
  } catch (err) {
    console.error('Slot check failed:', err);
  }

  renderAllViews();
}

// ================= MASTER RENDER =================
function renderAllViews() {
  renderKpiMetrics();
  renderFloorPlanCanvas();
  renderTableDropdowns();
  renderTablesFleetTable();
  renderAllReservationsTable();
  renderActivityTimeline();

  floorSlotSubtitle.textContent = `Live availability for ${state.selectedDate} at ${state.selectedTime}`;
  navBookingsCount.textContent = state.bookings.length;
}

// 1. KPI Statistics (Scene 2 & 3)
function renderKpiMetrics() {
  const total = state.tables.length;
  const operational = state.tables.filter(t => t.status === 'Available').length;
  const capacity = state.metrics.totalCapacity || 0;
  const totalBookings = state.bookings.length;
  const occupiedCount = state.occupiedTableIds.length;
  const occRate = operational > 0 ? Math.round((occupiedCount / operational) * 100) : 0;

  metricTotalTables.textContent = total;
  metricOpTables.textContent = `${operational} Operational`;
  metricTotalCapacity.textContent = capacity;
  metricTotalBookings.textContent = totalBookings;
  metricOccupancyRate.textContent = `${occRate}%`;
  metricOccupancyRatio.textContent = `${occupiedCount}/${operational} Booked`;
}

// 2. Table CAD Geometries
function getTableShape(type, capacity) {
  const t = type.toLowerCase();
  if (t.includes('vip')) return { shape: 'shape-vip', icon: '👑' };
  if (t.includes('couple') || capacity <= 2) return { shape: 'shape-round', icon: '🍷' };
  if (t.includes('banquet') || capacity >= 8) return { shape: 'shape-banquet', icon: '🍾' };
  return { shape: 'shape-booth', icon: '🍽️' };
}

// 3. Seating Floor Plan Blueprint
function renderFloorPlanCanvas() {
  dashboardFloorCanvas.innerHTML = '';

  let filtered = state.tables;
  if (state.selectedZone !== 'ALL') {
    filtered = state.tables.filter(t => t.type.toLowerCase().includes(state.selectedZone.toLowerCase()));
  }

  if (filtered.length === 0) {
    dashboardFloorCanvas.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px;">
        No tables found for category "${state.selectedZone}".
      </div>
    `;
    return;
  }

  filtered.forEach(table => {
    const isMaintenance = table.status === 'Maintenance';
    const isOccupied = state.occupiedTableIds.includes(table.id);
    const isSelected = state.selectedTableId === table.id;

    let statusClass = 'status-available';
    let statusLabel = 'AVAILABLE';

    if (isMaintenance) {
      statusClass = 'status-offline';
      statusLabel = 'MAINTENANCE';
    } else if (isOccupied) {
      statusClass = 'status-reserved';
      statusLabel = 'BOOKED';
    }

    const { shape, icon } = getTableShape(table.type, table.capacity);

    const card = document.createElement('div');
    card.className = `table-pod-card ${statusClass} ${isSelected ? 'status-selected' : ''}`;
    card.dataset.id = table.id;

    let activeBooking = null;
    if (isOccupied) {
      activeBooking = state.bookings.find(b => b.tableId === table.id && b.date === state.selectedDate && b.time === state.selectedTime);
    }

    card.innerHTML = `
      <span class="pod-id-tag">#T-${table.id < 10 ? '0' + table.id : table.id}</span>
      <span class="pod-status-badge">${statusLabel}</span>

      <div class="table-cad-fixture">
        <div class="table-top-3d ${shape}">
          <span>${icon}</span>
        </div>
        <div class="chair-node chair-t"></div>
        <div class="chair-node chair-b"></div>
        ${table.capacity >= 4 ? '<div class="chair-node chair-l"></div><div class="chair-node chair-r"></div>' : ''}
      </div>

      <div class="pod-title">${table.type}</div>
      <div class="pod-capacity">${table.capacity} Guest Seats</div>
      ${activeBooking ? `<div class="pod-guest-tag">Reserved: ${activeBooking.guestName}</div>` : ''}
    `;

    card.addEventListener('click', () => {
      playSound('clink');
      if (isMaintenance) {
        showToast(`Table #${table.id} is currently under maintenance.`, 'error');
        return;
      }
      if (isOccupied) {
        showToast(`Table #${table.id} is booked by "${activeBooking?.guestName || 'Guest'}".`, 'info');
      } else {
        state.selectedTableId = table.id;
        selectTableAssignment.value = String(table.id);
        document.getElementById('input-guest-count').value = Math.min(table.capacity, 4);
        switchView('booking');
        showToast(`Selected Table #${table.id} (${table.type}, ${table.capacity} seats).`, 'success');
        renderFloorPlanCanvas();
      }
    });

    dashboardFloorCanvas.appendChild(card);
  });
}

// 4. Dropdowns
function renderTableDropdowns() {
  const current = selectTableAssignment.value;
  selectTableAssignment.innerHTML = '<option value="0">✨ Auto-Assign Best Fit (Smart Engine)</option>';
  const walkinSelect = document.getElementById('walkin-table-select');
  walkinSelect.innerHTML = '<option value="0">✨ Auto Best-Fit Table</option>';

  state.tables.forEach(t => {
    if (t.status === 'Available') {
      const opt = document.createElement('option');
      opt.value = t.id;
      const isOcc = state.occupiedTableIds.includes(t.id);
      opt.textContent = `Table #${t.id} - ${t.type} (${t.capacity} seats) ${isOcc ? '⚠️ Booked' : '✅ Free'}`;
      selectTableAssignment.appendChild(opt);

      const walkOpt = document.createElement('option');
      walkOpt.value = t.id;
      walkOpt.textContent = `Table #${t.id} - ${t.type} (${t.capacity} seats)`;
      walkinSelect.appendChild(walkOpt);
    }
  });

  selectTableAssignment.value = current || '0';
}

// 5. Tables Fleet Management (Scene 4)
function renderTablesFleetTable() {
  tablesFleetTbody.innerHTML = '';
  state.tables.forEach(t => {
    const isAvail = t.status === 'Available';
    const isOccupied = state.occupiedTableIds.includes(t.id);
    const tr = document.createElement('tr');

    let slotText = isOccupied ? '<span class="tag-pill red">Occupied</span>' : (isAvail ? '<span class="tag-pill green">Free</span>' : '<span class="tag-pill">Offline</span>');

    tr.innerHTML = `
      <td><strong>#T-${t.id}</strong></td>
      <td>${t.capacity} Guests</td>
      <td>${t.type}</td>
      <td>${slotText}</td>
      <td><span class="tag-pill ${isAvail ? 'green' : 'red'}">${t.status}</span></td>
      <td>
        <button class="btn-status-toggle btn-flip-status" data-id="${t.id}" data-current="${t.status}">
          ${isAvail ? 'Set Maintenance' : 'Set Available'}
        </button>
      </td>
      <td>
        <button class="btn-danger-sm btn-del-tbl" data-id="${t.id}">Delete</button>
      </td>
    `;
    tablesFleetTbody.appendChild(tr);
  });

  document.querySelectorAll('.btn-flip-status').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = parseInt(btn.dataset.id);
      const current = btn.dataset.current;
      const target = (current === 'Available') ? 'Maintenance' : 'Available';
      await handleToggleTableStatus(id, target);
    });
  });

  document.querySelectorAll('.btn-del-tbl').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = parseInt(btn.dataset.id);
      await handleDeleteTable(id);
    });
  });
}

// 6. Master Reservations Table (Scene 5 & 8: Search & Check-in)
function renderAllReservationsTable() {
  const query = reservationsSearchQuery.value.trim().toLowerCase();
  allReservationsTbody.innerHTML = '';

  const list = state.bookings.filter(b => {
    if (!query) return true;
    return b.guestName.toLowerCase().includes(query) ||
           String(b.bookingId).includes(query) ||
           b.date.includes(query) ||
           String(b.tableId).includes(query);
  });

  if (list.length === 0) {
    allReservationsTbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center; color:var(--text-muted); padding:32px;">
          No reservations found matching search.
        </td>
      </tr>
    `;
    return;
  }

  list.forEach(b => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>#${b.bookingId}</strong></td>
      <td><span class="tag-pill gold">Table #${b.tableId}</span></td>
      <td><strong>${b.guestName}</strong></td>
      <td>${b.guests} Guests</td>
      <td><code>${b.date}</code></td>
      <td><code>${b.time}</code></td>
      <td><span class="tag-pill green">CONFIRMED</span></td>
      <td>
        <div style="display:flex; gap:6px;">
          <button class="btn btn-secondary btn-sm btn-view-receipt" data-id="${b.bookingId}">View Receipt</button>
          <button class="btn-danger-sm btn-cancel-res" data-id="${b.bookingId}">Cancel</button>
        </div>
      </td>
    `;
    allReservationsTbody.appendChild(tr);
  });

  document.querySelectorAll('.btn-view-receipt').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      const b = state.bookings.find(x => x.bookingId === id);
      if (b) showBookingReceiptModal(b);
    });
  });

  document.querySelectorAll('.btn-cancel-res').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      handleCancelReservation(id);
    });
  });
}

// 7. Activity Timeline
function renderActivityTimeline() {
  dashboardActivityTimeline.innerHTML = '';
  if (state.activity.length === 0) {
    dashboardActivityTimeline.innerHTML = '<div style="color:var(--text-muted); padding:16px;">No recent audit activity.</div>';
    return;
  }

  const reversed = [...state.activity].reverse();
  reversed.forEach(item => {
    const entry = document.createElement('div');
    entry.className = 'timeline-entry';
    entry.innerHTML = `
      <div class="entry-time">${item.timestamp}</div>
      <div>
        <div class="entry-tag">${item.type}</div>
        <div class="entry-msg">${item.message}</div>
      </div>
    `;
    dashboardActivityTimeline.appendChild(entry);
  });
}

// ================= VIEW SWITCHER =================
function switchView(viewName) {
  state.activeView = viewName;
  document.querySelectorAll('.nav-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === viewName);
  });
  document.querySelectorAll('.app-view').forEach(view => {
    view.classList.toggle('active', view.id === `view-${viewName}`);
  });
}

// ================= 6-STAGE ALGORITHM PIPELINE =================
function resetPipeline() {
  for (let i = 1; i <= 5; ++i) {
    const card = document.getElementById(`pipe-step-${i}`);
    if (card) card.className = 'pipe-step-card';
  }
  document.getElementById('pipeline-status-badge').textContent = 'Allocating...';
  document.getElementById('pipeline-status-badge').className = 'pill-badge gold';
}

function setPipelineNode(step, status, text = null) {
  const card = document.getElementById(`pipe-step-${step}`);
  if (!card) return;
  card.className = `pipe-step-card step-${status}`;
  if (text) {
    document.getElementById(`pipe-sub-${step}`).textContent = text;
  }
}

async function runAllocationSequence(trace, success, createdBooking, errorMsg) {
  resetPipeline();

  setPipelineNode(1, 'running', 'Validating guest parameters');
  await new Promise(r => setTimeout(r, 180));
  setPipelineNode(1, 'success', 'Input verified');

  setPipelineNode(2, 'running', 'Checking date & time boundaries');
  await new Promise(r => setTimeout(r, 180));
  setPipelineNode(2, 'success', `${createdBooking?.date || state.selectedDate} @ ${createdBooking?.time || state.selectedTime}`);

  setPipelineNode(3, 'running', 'Scanning slot collisions');
  await new Promise(r => setTimeout(r, 220));
  setPipelineNode(3, 'success', 'No conflict detected');

  setPipelineNode(4, 'running', 'Matching best suitable capacity');
  await new Promise(r => setTimeout(r, 240));

  if (!success) {
    setPipelineNode(4, 'running', errorMsg || 'No table match');
    document.getElementById('pipeline-status-badge').textContent = 'Failed';
    document.getElementById('pipeline-status-badge').className = 'pill-badge';
    showToast(errorMsg || 'No suitable table available for this slot.', 'error');
    return;
  }

  setPipelineNode(4, 'success', `Assigned Table #${createdBooking.tableId}`);

  setPipelineNode(5, 'running', 'Saving to tables.txt & bookings.txt');
  await new Promise(r => setTimeout(r, 180));
  setPipelineNode(5, 'success', 'Saved to permanent storage');

  document.getElementById('pipeline-status-badge').textContent = 'Success';
  document.getElementById('pipeline-status-badge').className = 'pill-badge green';

  playSound('success');
  showBookingReceiptModal(createdBooking);
}

// ================= OFFICIAL RECEIPT MODAL (Scene 7) =================
function showBookingReceiptModal(b) {
  receiptDataGrid.innerHTML = `
    <div class="receipt-cell">
      <label>Booking ID</label>
      <strong>#${b.bookingId}</strong>
    </div>
    <div class="receipt-cell">
      <label>Assigned Table</label>
      <strong style="color:var(--gold-600);">Table #${b.tableId}</strong>
    </div>
    <div class="receipt-cell">
      <label>Customer Name</label>
      <strong>${b.guestName}</strong>
    </div>
    <div class="receipt-cell">
      <label>Number of Guests</label>
      <strong>${b.guests} Guests</strong>
    </div>
    <div class="receipt-cell">
      <label>Reservation Date</label>
      <strong>${b.date}</strong>
    </div>
    <div class="receipt-cell">
      <label>Reservation Time</label>
      <strong>${b.time}</strong>
    </div>
    <div class="receipt-cell">
      <label>Occasion</label>
      <strong style="color:var(--gold-700);">${state.selectedOccasion}</strong>
    </div>
    <div class="receipt-cell">
      <label>Status</label>
      <strong style="color:var(--c-emerald);">CONFIRMED</strong>
    </div>
  `;
  modalBookingReceipt.classList.add('open');
}

// ================= EVENT LISTENERS & ACTIONS =================

// Navigation Tabs
document.querySelectorAll('.nav-tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    playSound('click');
    switchView(btn.dataset.view);
  });
});

// Occasion Pills
document.querySelectorAll('.occ-pill').forEach(pill => {
  pill.addEventListener('click', () => {
    playSound('pop');
    document.querySelectorAll('.occ-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    state.selectedOccasion = pill.dataset.occ;
  });
});

// Quick Experience Buttons
document.querySelectorAll('.btn-quick-book').forEach(btn => {
  btn.addEventListener('click', () => {
    playSound('clink');
    const guests = parseInt(btn.dataset.guests);
    const type = btn.dataset.type;
    document.getElementById('input-guest-count').value = guests;

    const candidate = state.tables.find(t => t.type.toLowerCase().includes(type.toLowerCase()) && state.availableTableIds.includes(t.id));
    if (candidate) {
      state.selectedTableId = candidate.id;
      selectTableAssignment.value = String(candidate.id);
    } else {
      selectTableAssignment.value = '0';
    }
    switchView('booking');
  });
});

// Create Reservation Form Submission (Scene 6 & 7)
createBookingForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const guestName = document.getElementById('input-guest-name').value.trim();
  const guests = parseInt(document.getElementById('input-guest-count').value);
  const date = document.getElementById('input-booking-date').value.trim();
  const time = document.getElementById('select-booking-time').value;
  const tableId = parseInt(selectTableAssignment.value);

  const submitBtn = document.getElementById('btn-submit-reservation');
  submitBtn.disabled = true;

  try {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guestName, guests, date, time, tableId })
    });

    const data = await res.json();
    await runAllocationSequence(data.trace || [], data.success, data.booking, data.error);

    if (data.success) {
      createBookingForm.reset();
      document.getElementById('input-guest-count').value = '4';
      document.getElementById('input-booking-date').value = state.selectedDate;
      document.getElementById('select-booking-time').value = state.selectedTime;
      state.selectedTableId = 0;
      await syncCoreEngine();
    }
  } catch (err) {
    showToast('Failed to connect to C++ backend.', 'error');
  } finally {
    submitBtn.disabled = false;
  }
});

// Cancel Reservation (Scene 5)
async function handleCancelReservation(id) {
  if (!confirm(`Are you sure you want to cancel Reservation #${id}?`)) return;

  try {
    const res = await fetch(`${API_BASE}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId: id })
    });

    const data = await res.json();
    if (data.success) {
      showToast(`Reservation #${id} successfully cancelled.`, 'success');
      await syncCoreEngine();
    } else {
      showToast(data.error || 'Could not cancel reservation.', 'error');
    }
  } catch (err) {
    showToast('Backend error cancelling reservation.', 'error');
  }
}

// Table Status Toggle (Scene 4)
async function handleToggleTableStatus(id, status) {
  try {
    const res = await fetch(`${API_BASE}/tables/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status })
    });

    const data = await res.json();
    if (data.success) {
      showToast(`Table #${id} status updated to ${status}.`, 'success');
      await syncCoreEngine();
    } else {
      showToast(data.error || 'Failed to update table status.', 'error');
    }
  } catch (err) {
    showToast('Server communication error.', 'error');
  }
}

// Delete Table (Scene 4)
async function handleDeleteTable(id) {
  if (!confirm(`Are you sure you want to delete Table #${id}?`)) return;

  try {
    const res = await fetch(`${API_BASE}/tables/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });

    const data = await res.json();
    if (data.success) {
      showToast(`Table #${id} deleted from restaurant.`, 'success');
      await syncCoreEngine();
    } else {
      showToast(data.error || 'Cannot delete table.', 'error');
    }
  } catch (err) {
    showToast('Server error deleting table.', 'error');
  }
}

// Walk-In Seater Form
document.getElementById('form-quick-walkin-action').addEventListener('submit', async (e) => {
  e.preventDefault();
  const guestName = document.getElementById('walkin-guest-input').value.trim() || 'Walk-In Customer';
  const guests = parseInt(document.getElementById('walkin-guests-count').value);
  const tableId = parseInt(document.getElementById('walkin-table-select').value);
  const date = state.selectedDate;
  const time = state.selectedTime;

  try {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guestName, guests, date, time, tableId })
    });

    const data = await res.json();
    if (data.success) {
      showToast(`Walk-in customer seated at Table #${data.booking.tableId}!`, 'success');
      modalQuickWalkin.classList.remove('open');
      document.getElementById('form-quick-walkin-action').reset();
      playSound('success');
      await syncCoreEngine();
    } else {
      showToast(data.error || 'No table available for walk-in party.', 'error');
    }
  } catch (err) {
    showToast('Error seating walk-in customer.', 'error');
  }
});

// Add Table Form
document.getElementById('form-create-table-action').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = parseInt(document.getElementById('new-table-id-input').value);
  const capacity = parseInt(document.getElementById('new-table-capacity-input').value);
  const type = document.getElementById('new-table-type-input').value.trim();

  try {
    const res = await fetch(`${API_BASE}/tables`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, capacity, type })
    });

    const data = await res.json();
    if (data.success) {
      showToast(`Table #${id} successfully added!`, 'success');
      modalAddTable.classList.remove('open');
      document.getElementById('form-create-table-action').reset();
      await syncCoreEngine();
    } else {
      showToast(data.error || 'Could not add table.', 'error');
    }
  } catch (err) {
    showToast('Server error adding table.', 'error');
  }
});

// Stepper buttons
document.getElementById('btn-party-plus').addEventListener('click', () => {
  playSound('pop');
  const inp = document.getElementById('input-guest-count');
  inp.value = Math.min(50, parseInt(inp.value || 1) + 1);
});

document.getElementById('btn-party-minus').addEventListener('click', () => {
  playSound('pop');
  const inp = document.getElementById('input-guest-count');
  inp.value = Math.max(1, parseInt(inp.value || 2) - 1);
});

// Time Slot Carousel
timeSlotsCarousel.addEventListener('click', (e) => {
  const btn = e.target.closest('.time-slot-btn');
  if (btn) {
    playSound('clink');
    document.querySelectorAll('.time-slot-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.selectedTime = btn.dataset.time;
    document.getElementById('select-booking-time').value = state.selectedTime;
    updateSlotAvailability();
  }
});

// Date input & quick pills
slotDateInput.addEventListener('change', () => {
  state.selectedDate = slotDateInput.value.trim() || '24/05/2026';
  document.getElementById('input-booking-date').value = state.selectedDate;
  updateSlotAvailability();
});

document.querySelectorAll('.date-pill').forEach(btn => {
  btn.addEventListener('click', () => {
    playSound('click');
    document.querySelectorAll('.date-pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const preset = btn.dataset.date;
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
    slotDateInput.value = state.selectedDate;
    document.getElementById('input-booking-date').value = state.selectedDate;
    updateSlotAvailability();
  });
});

zoneFilterSelect.addEventListener('change', () => {
  state.selectedZone = zoneFilterSelect.value;
  renderFloorPlanCanvas();
});

reservationsSearchQuery.addEventListener('input', renderAllReservationsTable);

document.getElementById('btn-sync-engine').addEventListener('click', () => {
  syncCoreEngine();
  showToast('Synchronized with C++ Core Engine.', 'info');
});

document.getElementById('btn-sound-toggle').addEventListener('click', () => {
  state.soundEnabled = !state.soundEnabled;
  soundIconSymbol.textContent = state.soundEnabled ? '🔊' : '🔇';
  showToast(state.soundEnabled ? 'Sound enabled.' : 'Sound muted.', 'info');
});

// Modals
document.getElementById('btn-quick-walkin').addEventListener('click', () => modalQuickWalkin.classList.add('open'));
document.getElementById('btn-close-walkin-modal').addEventListener('click', () => modalQuickWalkin.classList.remove('open'));
document.getElementById('btn-cancel-walkin-modal').addEventListener('click', () => modalQuickWalkin.classList.remove('open'));

document.getElementById('btn-add-new-table-modal').addEventListener('click', () => modalAddTable.classList.add('open'));
document.getElementById('btn-close-table-modal').addEventListener('click', () => modalAddTable.classList.remove('open'));
document.getElementById('btn-cancel-table-modal').addEventListener('click', () => modalAddTable.classList.remove('open'));

document.getElementById('btn-close-receipt-action').addEventListener('click', () => modalBookingReceipt.classList.remove('open'));
document.getElementById('btn-print-receipt-action').addEventListener('click', () => {
  window.print();
});

// Auto-sync every 3.5s
setInterval(syncCoreEngine, 3500);

// Initial call
syncCoreEngine();
