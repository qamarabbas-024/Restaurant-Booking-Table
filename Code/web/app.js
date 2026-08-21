// The Royal Spice — Restaurant Table Management & Visual Companion Engine
const API_BASE = 'http://localhost:8080/api';

let appState = {
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
const floorBadge = document.getElementById('floor-badge');
const tbodyBookings = document.getElementById('tbody-bookings');
const tbodyFleet = document.getElementById('tbody-fleet');
const auditTimeline = document.getElementById('audit-timeline');
const typeDistributionList = document.getElementById('type-distribution-list');

// Inputs & Selectors
const filterDateInput = document.getElementById('filter-date');
const zoneFilterSelect = document.getElementById('zone-filter');
const timeslotChips = document.getElementById('timeslot-chips');
const inputSearchBookings = document.getElementById('input-search-bookings');
const bTableSelect = document.getElementById('b-table-select');

// Metrics
const mTotalTables = document.getElementById('m-total-tables');
const mOperationalBadge = document.getElementById('m-operational-badge');
const mCapacity = document.getElementById('m-capacity');
const mActiveBookings = document.getElementById('m-active-bookings');
const mOccupancyRate = document.getElementById('m-occupancy-rate');
const mOccupancySub = document.getElementById('m-occupancy-sub');
const navBookingCount = document.getElementById('nav-booking-count');
const bookingsTotalBadge = document.getElementById('bookings-total-badge');

// Forms & Modals
const formBooking = document.getElementById('form-booking');
const formAddTable = document.getElementById('form-add-table');
const modalAddTable = document.getElementById('modal-add-table');
const modalPass = document.getElementById('modal-pass');
const passGridContent = document.getElementById('pass-grid-content');
const toastStack = document.getElementById('toast-stack');

// ================= TOAST NOTIFICATIONS =================
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast-item toast-${type}`;
  toast.textContent = message;
  toastStack.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ================= STATE FETCHING & SYNC =================
async function fetchState() {
  try {
    const res = await fetch(`${API_BASE}/state`);
    if (!res.ok) throw new Error('Backend Offline');
    const data = await res.json();

    appState.metrics = data.metrics || {};
    appState.tables = data.tables || [];
    appState.bookings = data.bookings || [];
    appState.activity = data.activity || [];

    document.getElementById('core-pill').style.borderColor = 'rgba(16, 185, 129, 0.3)';
    document.getElementById('core-pill').querySelector('.status-label').textContent = 'C++ Core Online (127.0.0.1:8080)';

    await updateSlotAvailability();
  } catch (err) {
    document.getElementById('core-pill').style.borderColor = 'rgba(244, 63, 94, 0.4)';
    document.getElementById('core-pill').querySelector('.status-label').textContent = '⚠️ C++ Backend Disconnected';
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
    console.error('Availability update failed:', err);
  }

  renderAllViews();
}

// ================= RENDER ALL VIEWS =================
function renderAllViews() {
  renderMetrics();
  renderFloorPlan();
  renderTableDropdown();
  renderBookingsTable();
  renderFleetTable();
  renderTypeDistribution();
  renderAuditTimeline();

  floorBadge.textContent = `Viewing: ${appState.selectedDate} @ ${appState.selectedTime}`;
  navBookingCount.textContent = appState.bookings.length;
  bookingsTotalBadge.textContent = `${appState.bookings.length} Bookings Total`;
}

// 1. Executive Metrics Ribbon
function renderMetrics() {
  const total = appState.tables.length;
  const operational = appState.tables.filter(t => t.status === 'Available').length;
  const capacity = appState.metrics.totalCapacity || 0;
  const occupiedCount = appState.occupiedTableIds.length;
  const rate = operational > 0 ? Math.round((occupiedCount / operational) * 100) : 0;

  mTotalTables.textContent = total;
  mOperationalBadge.textContent = `${operational} Operational`;
  mCapacity.textContent = capacity;
  mActiveBookings.textContent = appState.bookings.length;
  mOccupancyRate.textContent = `${rate}%`;
  mOccupancySub.textContent = `${occupiedCount}/${operational} Reserved`;
}

// 2. Interactive Floor Plan
function getTableShape(type, capacity) {
  const lower = type.toLowerCase();
  if (lower.includes('vip')) return { shape: 'shape-vip', icon: '👑' };
  if (lower.includes('couple') || capacity <= 2) return { shape: 'shape-round', icon: '🍷' };
  if (lower.includes('banquet') || capacity >= 8) return { shape: 'shape-banquet', icon: '🍾' };
  return { shape: 'shape-booth', icon: '🍽️' };
}

function renderFloorPlan() {
  floorCanvas.innerHTML = '';

  let filteredTables = appState.tables;
  if (appState.selectedZone !== 'ALL') {
    filteredTables = appState.tables.filter(t => t.type.toLowerCase().includes(appState.selectedZone.toLowerCase()));
  }

  if (filteredTables.length === 0) {
    floorCanvas.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; color: var(--t-muted); padding: 40px;">
        No tables found matching zone "${appState.selectedZone}".
      </div>
    `;
    return;
  }

  filteredTables.forEach(table => {
    const isMaintenance = table.status === 'Maintenance';
    const isOccupied = appState.occupiedTableIds.includes(table.id);
    const isAvailable = appState.availableTableIds.includes(table.id);
    const isSelected = appState.selectedTableId === table.id;

    let statusClass = 'status-free';
    let statusText = 'FREE';

    if (isMaintenance) {
      statusClass = 'status-off';
      statusText = 'OFFLINE';
    } else if (isOccupied) {
      statusClass = 'status-busy';
      statusText = 'RESERVED';
    }

    const { shape, icon } = getTableShape(table.type, table.capacity);

    const node = document.createElement('div');
    node.className = `table-card-item ${statusClass} ${isSelected ? 'is-selected' : ''}`;
    node.dataset.id = table.id;

    // Chair layout
    let chairsHtml = '<div class="chair-node c-top"></div><div class="chair-node c-bottom"></div>';
    if (table.capacity >= 4) {
      chairsHtml += '<div class="chair-node c-left"></div><div class="chair-node c-right"></div>';
    }
    if (table.capacity >= 6) {
      chairsHtml += '<div class="chair-node c-top-left"></div><div class="chair-node c-top-right"></div>';
    }
    if (table.capacity >= 8) {
      chairsHtml += '<div class="chair-node c-bot-left"></div><div class="chair-node c-bot-right"></div>';
    }

    // Reservation tooltip
    let activeBooking = null;
    if (isOccupied) {
      activeBooking = appState.bookings.find(b => b.tableId === table.id && b.date === appState.selectedDate && b.time === appState.selectedTime);
    }

    node.innerHTML = `
      <span class="table-id-tag">#T-${table.id < 10 ? '0' + table.id : table.id}</span>
      <span class="table-status-pill">${statusText}</span>

      <div class="table-fixture">
        <div class="table-top ${shape}">
          <span>${icon}</span>
        </div>
        ${chairsHtml}
      </div>

      <div class="table-meta">
        <div class="table-name">${table.type}</div>
        <div class="table-capacity">${table.capacity} Guest Seats</div>
        ${activeBooking ? `<div style="font-size:10px; color:var(--c-rose); margin-top:2px;">Reserved: ${activeBooking.guestName}</div>` : ''}
      </div>
    `;

    // Click to select table
    node.addEventListener('click', () => {
      if (isMaintenance) {
        showToast(`Table #${table.id} is currently under maintenance.`, 'error');
        return;
      }

      if (isOccupied) {
        showToast(`Table #${table.id} is booked for "${activeBooking?.guestName || 'Guest'}" at this slot.`, 'info');
      } else {
        appState.selectedTableId = table.id;
        bTableSelect.value = String(table.id);
        document.getElementById('b-guests').value = Math.min(table.capacity, 4);
        showToast(`Selected Table #${table.id} (${table.type}, ${table.capacity} seats).`, 'success');
        renderFloorPlan();
      }
    });

    floorCanvas.appendChild(node);
  });
}

// 3. Table Dropdown in Booking Form
function renderTableDropdown() {
  const currentVal = bTableSelect.value;
  bTableSelect.innerHTML = '<option value="0">✨ Auto-Assign Best Fit (Smart Engine)</option>';

  appState.tables.forEach(t => {
    if (t.status === 'Available') {
      const opt = document.createElement('option');
      opt.value = t.id;
      const isOcc = appState.occupiedTableIds.includes(t.id);
      opt.textContent = `Table #${t.id} - ${t.type} (${t.capacity} seats) ${isOcc ? '⚠️ Occupied in slot' : '✅ Free'}`;
      bTableSelect.appendChild(opt);
    }
  });

  bTableSelect.value = currentVal || '0';
}

// 4. Reservations Table View
function renderBookingsTable() {
  const query = inputSearchBookings.value.trim().toLowerCase();
  tbodyBookings.innerHTML = '';

  const filtered = appState.bookings.filter(b => {
    if (!query) return true;
    return b.guestName.toLowerCase().includes(query) ||
           String(b.bookingId).includes(query) ||
           b.date.includes(query) ||
           String(b.tableId).includes(query);
  });

  if (filtered.length === 0) {
    tbodyBookings.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center; color:var(--t-muted); padding:32px;">
          No reservations found.
        </td>
      </tr>
    `;
    return;
  }

  filtered.forEach(b => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>#${b.bookingId}</strong></td>
      <td><span class="badge badge-amber">Table #${b.tableId}</span></td>
      <td><strong>${b.guestName}</strong></td>
      <td>${b.guests} Guests</td>
      <td><code style="font-family:var(--font-mono);">${b.date}</code></td>
      <td><code style="font-family:var(--font-mono);">${b.time}</code></td>
      <td><span class="badge badge-green">CONFIRMED</span></td>
      <td>
        <div style="display:flex; gap:6px;">
          <button class="btn btn-outline-gold btn-sm btn-view-pass" data-id="${b.bookingId}">View Pass</button>
          <button class="btn-danger-xs btn-cancel-b" data-id="${b.bookingId}">Cancel</button>
        </div>
      </td>
    `;
    tbodyBookings.appendChild(tr);
  });

  // Attach actions
  document.querySelectorAll('.btn-view-pass').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      const b = appState.bookings.find(x => x.bookingId === id);
      if (b) showReservationPass(b);
    });
  });

  document.querySelectorAll('.btn-cancel-b').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      handleCancelBooking(id);
    });
  });
}

// 5. Fleet Table in Dashboard
function renderFleetTable() {
  tbodyFleet.innerHTML = '';
  appState.tables.forEach(t => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>#T-${t.id}</strong></td>
      <td>${t.capacity} Guests</td>
      <td>${t.type}</td>
      <td><span class="badge ${t.status === 'Available' ? 'badge-green' : 'badge-rose'}">${t.status}</span></td>
      <td>
        <button class="btn btn-outline-gold btn-sm btn-book-from-fleet" data-id="${t.id}">Reserve</button>
      </td>
    `;
    tbodyFleet.appendChild(tr);
  });

  document.querySelectorAll('.btn-book-from-fleet').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      appState.selectedTableId = id;
      bTableSelect.value = String(id);
      switchTab('floor-view');
      showToast(`Selected Table #${id} for reservation.`, 'info');
    });
  });
}

// 6. Type Distribution in Dashboard
function renderTypeDistribution() {
  typeDistributionList.innerHTML = '';
  const counts = {};
  appState.tables.forEach(t => {
    counts[t.type] = (counts[t.type] || 0) + 1;
  });

  for (const [type, count] of Object.entries(counts)) {
    const row = document.createElement('div');
    row.className = 'type-stat-row';
    row.innerHTML = `
      <span><strong>${type}</strong></span>
      <span class="badge badge-amber">${count} Tables (${count * 1} unit)</span>
    `;
    typeDistributionList.appendChild(row);
  }
}

// 7. Live Audit Timeline
function renderAuditTimeline() {
  auditTimeline.innerHTML = '';
  if (appState.activity.length === 0) {
    auditTimeline.innerHTML = '<div style="color:var(--t-muted); padding:16px;">No activity logged yet.</div>';
    return;
  }

  const reversed = [...appState.activity].reverse();
  reversed.forEach(item => {
    const event = document.createElement('div');
    event.className = 'timeline-event';
    event.innerHTML = `
      <div class="event-time">${item.timestamp}</div>
      <div>
        <div class="event-type">${item.type}</div>
        <div class="event-msg">${item.message}</div>
      </div>
    `;
    auditTimeline.appendChild(event);
  });
}

// ================= STEP-BY-STEP ALGORITHM VISUALIZER =================
function resetPipelineUI() {
  for (let i = 1; i <= 5; ++i) {
    const node = document.getElementById(`pipe-${i}`);
    node.className = 'pipe-node';
  }
  document.getElementById('pipe-badge').textContent = 'Allocating...';
  document.getElementById('pipe-badge').className = 'pipeline-badge';
}

function updatePipelineStep(stepIndex, status, subText = null) {
  const node = document.getElementById(`pipe-${stepIndex}`);
  if (!node) return;
  node.className = `pipe-node ${status}`;
  if (subText) {
    document.getElementById(`pipe-${stepIndex}-sub`).textContent = subText;
  }
}

async function runAllocationAnimation(trace, success, createdBooking, errorMsg) {
  resetPipelineUI();

  // Stage 1: Sanitization
  updatePipelineStep(1, 'active', 'Validating guest parameters');
  await new Promise(r => setTimeout(r, 220));
  updatePipelineStep(1, 'completed', 'Input verified');

  // Stage 2: Slot Window
  updatePipelineStep(2, 'active', 'Checking date & time availability');
  await new Promise(r => setTimeout(r, 220));
  updatePipelineStep(2, 'completed', `${createdBooking?.date || appState.selectedDate} @ ${createdBooking?.time || appState.selectedTime}`);

  // Stage 3: Conflict Scan
  updatePipelineStep(3, 'active', 'Scanning active slot conflicts');
  await new Promise(r => setTimeout(r, 260));
  updatePipelineStep(3, 'completed', 'Conflict scan complete');

  // Stage 4: Best-Fit Match
  updatePipelineStep(4, 'active', 'Matching optimal seating capacity');
  await new Promise(r => setTimeout(r, 300));

  if (!success) {
    updatePipelineStep(4, 'active', errorMsg || 'No table match');
    document.getElementById('pipe-badge').textContent = 'Failed';
    document.getElementById('pipe-badge').style.color = '#f43f5e';
    showToast(errorMsg || 'Reservation failed: Table unavailable.', 'error');
    return;
  }

  updatePipelineStep(4, 'completed', `Assigned Table #${createdBooking.tableId}`);

  // Stage 5: Disk Persist
  updatePipelineStep(5, 'active', 'Writing to tables.txt & bookings.txt');
  await new Promise(r => setTimeout(r, 220));
  updatePipelineStep(5, 'completed', 'Data persisted');

  document.getElementById('pipe-badge').textContent = 'Success';
  document.getElementById('pipe-badge').style.color = '#10b981';

  showReservationPass(createdBooking);
}

// ================= RESERVATION PASS MODAL =================
function showReservationPass(b) {
  passGridContent.innerHTML = `
    <div class="pass-item">
      <label>Booking Reference</label>
      <strong>#${b.bookingId}</strong>
    </div>
    <div class="pass-item">
      <label>Assigned Table</label>
      <strong style="color:var(--gold-primary);">Table #${b.tableId}</strong>
    </div>
    <div class="pass-item">
      <label>Guest Name</label>
      <strong>${b.guestName}</strong>
    </div>
    <div class="pass-item">
      <label>Party Size</label>
      <strong>${b.guests} Guests</strong>
    </div>
    <div class="pass-item">
      <label>Date</label>
      <strong>${b.date}</strong>
    </div>
    <div class="pass-item">
      <label>Time Slot</label>
      <strong>${b.time}</strong>
    </div>
  `;
  modalPass.classList.add('open');
}

// ================= EVENT HANDLERS & ACTIONS =================

// 1. Tab Navigation
function switchTab(viewId) {
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.view === viewId);
  });

  document.querySelectorAll('.view-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === `view-${viewId.replace('-view', '')}`);
  });
}

document.querySelectorAll('.nav-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    switchTab(tab.dataset.view);
  });
});

// 2. Booking Form Submission
formBooking.addEventListener('submit', async (e) => {
  e.preventDefault();

  const guestName = document.getElementById('b-name').value.trim();
  const guests = parseInt(document.getElementById('b-guests').value);
  const date = document.getElementById('b-date').value.trim();
  const time = document.getElementById('b-time').value;
  const tableId = parseInt(bTableSelect.value);

  const btn = document.getElementById('btn-submit-book');
  btn.disabled = true;

  try {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guestName, guests, date, time, tableId })
    });

    const data = await res.json();
    await runAllocationAnimation(data.trace || [], data.success, data.booking, data.error);

    if (data.success) {
      formBooking.reset();
      document.getElementById('b-guests').value = '4';
      document.getElementById('b-date').value = appState.selectedDate;
      document.getElementById('b-time').value = appState.selectedTime;
      appState.selectedTableId = 0;
      await fetchState();
    }
  } catch (err) {
    showToast('Failed to communicate with C++ backend.', 'error');
  } finally {
    btn.disabled = false;
  }
});

// 3. Cancel Booking
async function handleCancelBooking(id) {
  if (!confirm(`Are you sure you want to cancel Reservation #${id}?`)) return;

  try {
    const res = await fetch(`${API_BASE}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId: id })
    });

    const data = await res.json();
    if (data.success) {
      showToast(`Reservation #${id} cancelled successfully.`, 'success');
      await fetchState();
    } else {
      showToast(data.error || 'Could not cancel reservation.', 'error');
    }
  } catch (err) {
    showToast('Backend communication error.', 'error');
  }
}

// 4. Add Table Form
formAddTable.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = parseInt(document.getElementById('add-id').value);
  const capacity = parseInt(document.getElementById('add-cap').value);
  const type = document.getElementById('add-type').value.trim();

  try {
    const res = await fetch(`${API_BASE}/tables`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, capacity, type })
    });

    const data = await res.json();
    if (data.success) {
      showToast(`Table #${id} added to the restaurant!`, 'success');
      modalAddTable.classList.remove('open');
      formAddTable.reset();
      await fetchState();
    } else {
      showToast(data.error || 'Could not add table.', 'error');
    }
  } catch (err) {
    showToast('Backend error adding table.', 'error');
  }
});

// 5. Steppers & Controls
document.getElementById('btn-guests-plus').addEventListener('click', () => {
  const inp = document.getElementById('b-guests');
  inp.value = Math.min(50, parseInt(inp.value || 1) + 1);
});

document.getElementById('btn-guests-minus').addEventListener('click', () => {
  const inp = document.getElementById('b-guests');
  inp.value = Math.max(1, parseInt(inp.value || 2) - 1);
});

timeslotChips.addEventListener('click', (e) => {
  const chip = e.target.closest('.chip');
  if (chip) {
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    appState.selectedTime = chip.dataset.time;
    document.getElementById('b-time').value = appState.selectedTime;
    updateSlotAvailability();
  }
});

filterDateInput.addEventListener('change', () => {
  appState.selectedDate = filterDateInput.value.trim() || '24/05/2026';
  document.getElementById('b-date').value = appState.selectedDate;
  updateSlotAvailability();
});

document.querySelectorAll('.preset-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const preset = btn.dataset.date;
    if (preset === 'TODAY') {
      const now = new Date();
      appState.selectedDate = `${String(now.getDate()).padStart(2,'0')}/${String(now.getMonth()+1).padStart(2,'0')}/${now.getFullYear()}`;
    } else if (preset === 'TOMORROW') {
      const tm = new Date();
      tm.setDate(tm.getDate() + 1);
      appState.selectedDate = `${String(tm.getDate()).padStart(2,'0')}/${String(tm.getMonth()+1).padStart(2,'0')}/${tm.getFullYear()}`;
    } else {
      appState.selectedDate = preset;
    }
    filterDateInput.value = appState.selectedDate;
    document.getElementById('b-date').value = appState.selectedDate;
    updateSlotAvailability();
  });
});

zoneFilterSelect.addEventListener('change', () => {
  appState.selectedZone = zoneFilterSelect.value;
  renderFloorPlan();
});

inputSearchBookings.addEventListener('input', renderBookingsTable);

document.getElementById('btn-sync').addEventListener('click', () => {
  fetchState();
  showToast('State synchronized with C++ Engine.', 'info');
});

// Modals
document.getElementById('btn-open-add-table').addEventListener('click', () => modalAddTable.classList.add('open'));
document.getElementById('btn-close-modal-table').addEventListener('click', () => modalAddTable.classList.remove('open'));
document.getElementById('btn-cancel-modal-table').addEventListener('click', () => modalAddTable.classList.remove('open'));
document.getElementById('btn-close-pass').addEventListener('click', () => modalPass.classList.remove('open'));

// Auto-sync polling every 3.5s
setInterval(fetchState, 3500);

// Initialize
fetchState();
