// Visual Companion Engine (Connected to C++17 Core via REST API)
const API_BASE = 'http://localhost:8080/api';

let appState = {
  metrics: {},
  tables: [],
  bookings: [],
  activity: [],
  selectedDate: '24/05/2026',
  selectedTime: '8:00 PM',
  availableTableIds: [],
  occupiedTableIds: []
};

// ================= DOM ELEMENTS =================
const floorCanvas = document.getElementById('floor-canvas');
const bookingsTbody = document.getElementById('bookings-tbody');
const activityList = document.getElementById('activity-list');
const bookingSearch = document.getElementById('booking-search');
const slotDateInput = document.getElementById('slot-date');
const timeSlotChips = document.getElementById('time-slot-chips');
const floorSlotBadge = document.getElementById('floor-slot-badge');
const bookingForm = document.getElementById('booking-form');
const addTableForm = document.getElementById('add-table-form');
const modalTable = document.getElementById('modal-table');
const modalReceipt = document.getElementById('modal-receipt');
const receiptContent = document.getElementById('receipt-content');
const toastContainer = document.getElementById('toast-container');

// Metrics
const metricTotalTables = document.getElementById('metric-total-tables');
const metricCapacity = document.getElementById('metric-capacity');
const metricBookings = document.getElementById('metric-bookings');
const metricOccupancy = document.getElementById('metric-occupancy');

// ================= TOAST NOTIFICATIONS =================
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ================= INITIALIZATION & FETCHING =================
async function fetchState() {
  try {
    const res = await fetch(`${API_BASE}/state`);
    if (!res.ok) throw new Error('C++ Server unreachable');
    const data = await res.json();
    
    appState.metrics = data.metrics || {};
    appState.tables = data.tables || [];
    appState.bookings = data.bookings || [];
    appState.activity = data.activity || [];

    await updateSlotAvailability();
  } catch (err) {
    console.error('Fetch State Error:', err);
    document.getElementById('backend-status').textContent = '⚠️ C++ Server Disconnected';
    document.getElementById('backend-status').style.color = '#f43f5e';
  }
}

async function updateSlotAvailability() {
  try {
    const res = await fetch(`${API_BASE}/availability?date=${encodeURIComponent(appState.selectedDate)}&time=${encodeURIComponent(appState.selectedTime)}`);
    if (res.ok) {
      const data = await res.json();
      appState.availableTableIds = data.available || [];
      appState.occupiedTableIds = data.occupied || [];
    }
  } catch (err) {
    console.error('Availability Error:', err);
  }

  renderAll();
}

// ================= RENDERING =================
function renderAll() {
  renderMetrics();
  renderFloorPlan();
  renderBookings();
  renderActivity();
  floorSlotBadge.textContent = `Viewing: ${appState.selectedDate} @ ${appState.selectedTime}`;
}

function renderMetrics() {
  metricTotalTables.textContent = appState.tables.length;
  metricCapacity.textContent = `${appState.metrics.totalCapacity || 0} Seats`;
  metricBookings.textContent = appState.bookings.length;

  const operationalCount = appState.tables.filter(t => t.status === 'Available').length;
  const occupiedInSlot = appState.occupiedTableIds.length;
  const rate = operationalCount > 0 ? Math.round((occupiedInSlot / operationalCount) * 100) : 0;
  metricOccupancy.textContent = `${rate}%`;
}

function getTableShapeClass(type, capacity) {
  if (capacity <= 2 || type.toLowerCase().includes('couple')) return 'table-shape-round';
  if (capacity <= 4 || type.toLowerCase().includes('family')) return 'table-shape-rect';
  return 'table-shape-large';
}

function renderFloorPlan() {
  floorCanvas.innerHTML = '';

  if (appState.tables.length === 0) {
    floorCanvas.innerHTML = '<div style="color:var(--text-muted); grid-column:1/-1; text-align:center; padding:40px;">No tables installed in restaurant. Click "+ Add Table" to begin.</div>';
    return;
  }

  appState.tables.forEach(table => {
    const isOccupied = appState.occupiedTableIds.includes(table.id);
    const isAvailable = appState.availableTableIds.includes(table.id);
    const isMaintenance = table.status === 'Maintenance';

    let statusClass = 'is-available';
    let statusText = 'FREE';

    if (isMaintenance) {
      statusClass = 'is-maintenance';
      statusText = 'OFFLINE';
    } else if (isOccupied) {
      statusClass = 'is-occupied';
      statusText = 'RESERVED';
    }

    const node = document.createElement('div');
    node.className = `table-node ${statusClass}`;
    node.dataset.tableId = table.id;

    // Chairs count
    let chairsHtml = '<div class="chair chair-top"></div><div class="chair chair-bottom"></div>';
    if (table.capacity > 2) {
      chairsHtml += '<div class="chair chair-left"></div><div class="chair chair-right"></div>';
    }

    const shapeClass = getTableShapeClass(table.type, table.capacity);

    node.innerHTML = `
      <span class="table-badge-id">#T-${table.id < 10 ? '0' + table.id : table.id}</span>
      <span class="table-status-pill">${statusText}</span>
      
      <div class="table-graphic">
        <div class="table-surface ${shapeClass}">
          <span>🍽️</span>
        </div>
        ${chairsHtml}
      </div>

      <div class="table-details">
        <div class="table-type">${table.type}</div>
        <div class="table-cap">${table.capacity} Guest Seats</div>
      </div>
    `;

    // Click on table to autofill booking
    node.addEventListener('click', () => {
      if (!isOccupied && !isMaintenance) {
        document.getElementById('guest-count').value = Math.min(table.capacity, 4);
        showToast(`Selected Table #${table.id} (${table.type}, ${table.capacity} seats).`, 'info');
      } else if (isOccupied) {
        const b = appState.bookings.find(x => x.tableId === table.id && x.date === appState.selectedDate && x.time === appState.selectedTime);
        if (b) {
          showToast(`Table #${table.id} is booked for "${b.guestName}" (${b.guests} guests).`, 'info');
        }
      }
    });

    floorCanvas.appendChild(node);
  });
}

function renderBookings() {
  const query = bookingSearch.value.trim().toLowerCase();
  bookingsTbody.innerHTML = '';

  const filtered = appState.bookings.filter(b => {
    if (!query) return true;
    return b.guestName.toLowerCase().includes(query) ||
           String(b.bookingId).includes(query) ||
           b.date.includes(query) ||
           String(b.tableId).includes(query);
  });

  if (filtered.length === 0) {
    bookingsTbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:var(--text-muted); padding:24px;">No reservations found.</td></tr>';
    return;
  }

  filtered.forEach(b => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>#${b.bookingId}</strong></td>
      <td><span class="badge badge-info">Table #${b.tableId}</span></td>
      <td><strong>${b.guestName}</strong></td>
      <td>${b.guests} Guests</td>
      <td><code>${b.date}</code></td>
      <td><code>${b.time}</code></td>
      <td>
        <button class="btn btn-danger-sm btn-cancel-booking" data-id="${b.bookingId}">Cancel</button>
      </td>
    `;
    bookingsTbody.appendChild(tr);
  });

  // Attach cancel buttons
  document.querySelectorAll('.btn-cancel-booking').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      cancelBooking(id);
    });
  });
}

function renderActivity() {
  activityList.innerHTML = '';
  if (appState.activity.length === 0) {
    activityList.innerHTML = '<div style="color:var(--text-muted); font-size:11px;">No recent events logged.</div>';
    return;
  }

  // Show recent first
  const reversed = [...appState.activity].reverse();
  reversed.forEach(item => {
    const el = document.createElement('div');
    el.className = 'activity-item';
    el.innerHTML = `
      <span class="activity-time">[${item.timestamp}]</span>
      <span class="activity-msg">${item.message}</span>
    `;
    activityList.appendChild(el);
  });
}

// ================= PIPELINE VISUALIZER ANIMATION =================
function resetPipeline() {
  for (let i = 1; i <= 5; ++i) {
    const step = document.getElementById(`step-${i}`);
    step.className = 'pipeline-step';
  }
  document.getElementById('pipeline-status-badge').textContent = 'Allocating...';
  document.getElementById('pipeline-status-badge').className = 'badge badge-info';
}

function setPipelineStep(stepNum, status, descText = null) {
  const step = document.getElementById(`step-${stepNum}`);
  if (!step) return;
  step.className = `pipeline-step ${status}`;
  if (descText) {
    document.getElementById(`step-${stepNum}-desc`).textContent = descText;
  }
}

async function runVisualizerAnimation(trace, success, createdBooking, errorMsg) {
  resetPipeline();

  // Step 1: Input Validation
  setPipelineStep(1, 'active', 'Validating guest parameters');
  await new Promise(r => setTimeout(r, 250));
  setPipelineStep(1, 'completed', 'Input validated');

  // Step 2: Slot Window
  setPipelineStep(2, 'active', 'Checking requested time window');
  await new Promise(r => setTimeout(r, 250));
  setPipelineStep(2, 'completed', `${createdBooking?.date || appState.selectedDate} @ ${createdBooking?.time || appState.selectedTime}`);

  // Step 3: Conflict Scan
  setPipelineStep(3, 'active', 'Scanning active slot conflicts');
  await new Promise(r => setTimeout(r, 300));
  setPipelineStep(3, 'completed', 'Conflict check complete');

  // Step 4: Best-Fit Match
  setPipelineStep(4, 'active', 'Matching optimal table capacity');
  await new Promise(r => setTimeout(r, 350));

  if (!success) {
    setPipelineStep(4, 'active', errorMsg || 'No table match');
    document.getElementById('pipeline-status-badge').textContent = 'Failed';
    document.getElementById('pipeline-status-badge').className = 'badge';
    document.getElementById('pipeline-status-badge').style.backgroundColor = 'rgba(244,63,94,0.2)';
    document.getElementById('pipeline-status-badge').style.color = '#f43f5e';
    showToast(errorMsg || 'Booking failed: No table available.', 'error');
    return;
  }

  setPipelineStep(4, 'completed', `Assigned Table #${createdBooking.tableId}`);

  // Step 5: Disk Persist
  setPipelineStep(5, 'active', 'Writing to tables.txt & bookings.txt');
  await new Promise(r => setTimeout(r, 250));
  setPipelineStep(5, 'completed', 'Persisted to disk');

  document.getElementById('pipeline-status-badge').textContent = 'Success';
  document.getElementById('pipeline-status-badge').className = 'badge';
  document.getElementById('pipeline-status-badge').style.backgroundColor = 'rgba(16,185,129,0.2)';
  document.getElementById('pipeline-status-badge').style.color = '#10b981';

  // Show receipt modal
  showReceiptModal(createdBooking);
}

function showReceiptModal(b) {
  receiptContent.innerHTML = `
================================================================
                    OFFICIAL BOOKING RECEIPT
================================================================
  Booking ID   : #${b.bookingId}
  Guest Name   : ${b.guestName}
  Table Number : Table #${b.tableId}
  Party Size   : ${b.guests} Guest(s)
  Date         : ${b.date}
  Time Slot    : ${b.time}
  Status       : CONFIRMED (Persisted to C++ Engine)
================================================================
  Thank you for choosing Le Bistro!
  `;
  modalReceipt.classList.add('open');
}

// ================= ACTIONS =================
bookingForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const guestName = document.getElementById('guest-name').value.trim();
  const guests = parseInt(document.getElementById('guest-count').value);
  const date = document.getElementById('book-date').value.trim();
  const time = document.getElementById('book-time').value;

  const btn = document.getElementById('btn-submit-booking');
  btn.disabled = true;

  try {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guestName, guests, date, time })
    });

    const data = await res.json();
    await runVisualizerAnimation(data.trace || [], data.success, data.booking, data.error);

    if (data.success) {
      bookingForm.reset();
      document.getElementById('guest-count').value = '4';
      document.getElementById('book-date').value = appState.selectedDate;
      await fetchState();
    }
  } catch (err) {
    showToast('Failed to connect to C++ backend.', 'error');
  } finally {
    btn.disabled = false;
  }
});

async function cancelBooking(id) {
  if (!confirm(`Are you sure you want to cancel Reservation #${id}?`)) return;

  try {
    const res = await fetch(`${API_BASE}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId: id })
    });

    const data = await res.json();
    if (data.success) {
      showToast(`Reservation #${id} has been cancelled.`, 'success');
      await fetchState();
    } else {
      showToast(data.error || 'Failed to cancel reservation.', 'error');
    }
  } catch (err) {
    showToast('Error communicating with backend.', 'error');
  }
}

addTableForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = parseInt(document.getElementById('new-table-id').value);
  const capacity = parseInt(document.getElementById('new-table-cap').value);
  const type = document.getElementById('new-table-type').value.trim();

  try {
    const res = await fetch(`${API_BASE}/tables`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, capacity, type })
    });

    const data = await res.json();
    if (data.success) {
      showToast(`Table #${id} added successfully!`, 'success');
      modalTable.classList.remove('open');
      addTableForm.reset();
      await fetchState();
    } else {
      showToast(data.error || 'Could not add table.', 'error');
    }
  } catch (err) {
    showToast('Backend communication error.', 'error');
  }
});

// ================= CONTROLS & EVENTS =================
timeSlotChips.addEventListener('click', (e) => {
  if (e.target.classList.contains('slot-chip')) {
    document.querySelectorAll('.slot-chip').forEach(c => c.classList.remove('active'));
    e.target.classList.add('active');
    appState.selectedTime = e.target.dataset.time;
    document.getElementById('book-time').value = appState.selectedTime;
    updateSlotAvailability();
  }
});

slotDateInput.addEventListener('change', () => {
  appState.selectedDate = slotDateInput.value.trim() || '24/05/2026';
  document.getElementById('book-date').value = appState.selectedDate;
  updateSlotAvailability();
});

bookingSearch.addEventListener('input', renderBookings);

document.getElementById('btn-refresh').addEventListener('click', () => {
  fetchState();
  showToast('State synchronized with C++ Engine.', 'info');
});

// Modals
document.getElementById('btn-new-table').addEventListener('click', () => modalTable.classList.add('open'));
document.getElementById('btn-close-table-modal').addEventListener('click', () => modalTable.classList.remove('open'));
document.getElementById('btn-cancel-table').addEventListener('click', () => modalTable.classList.remove('open'));
document.getElementById('btn-close-receipt').addEventListener('click', () => modalReceipt.classList.remove('open'));
document.getElementById('btn-receipt-done').addEventListener('click', () => modalReceipt.classList.remove('open'));

// Auto-sync polling every 3.5 seconds
setInterval(fetchState, 3500);

// Initial Load
fetchState();
