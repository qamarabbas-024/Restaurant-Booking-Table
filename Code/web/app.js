// ==========================================================================
// THE ROYAL SPICE — VISUAL COMPANION MASTER CONTROLLER
// Seamless C++17 Core Engine REST Integration (Port 8080)
// ==========================================================================

const API_ENDPOINT = 'http://localhost:8080/api';

const appState = {
  activeMode: 'guest', // 'guest' | 'staff'
  staffView: 'staff-reservations', // 'staff-reservations' | 'staff-fleet' | 'staff-analytics' | 'staff-activity'
  soundEnabled: true,
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
const guestFloorCanvas = document.getElementById('guest-floor-canvas');
const guestSlotLabel = document.getElementById('guest-slot-label');
const staffReservationsTbody = document.getElementById('staff-reservations-tbody');
const staffFleetTbody = document.getElementById('staff-fleet-tbody');
const staffZoneBreakdown = document.getElementById('staff-zone-breakdown');
const staffSlotDemand = document.getElementById('staff-slot-demand');
const staffActivityTimeline = document.getElementById('staff-activity-timeline');

// Metrics
const metricTotalTables = document.getElementById('metric-total-tables');
const metricOpTables = document.getElementById('metric-op-tables');
const metricTotalCapacity = document.getElementById('metric-total-capacity');
const metricActiveBookings = document.getElementById('metric-active-bookings');
const metricOccupancyRate = document.getElementById('metric-occupancy-rate');
const metricOccupancyRatio = document.getElementById('metric-occupancy-ratio');
const staffBookingBadge = document.getElementById('staff-booking-badge');

// Controls & Inputs
const slotDateInput = document.getElementById('slot-date-input');
const slotCarousel = document.getElementById('slot-carousel');
const zoneFilterSelect = document.getElementById('zone-filter-select');
const guestReservationForm = document.getElementById('guest-reservation-form');
const guestTableSelect = document.getElementById('guest-table-select');
const staffSearchInput = document.getElementById('staff-search-input');
const soundIcon = document.getElementById('sound-icon');

// Modals
const modalTableCreate = document.getElementById('modal-table-create');
const modalVipPass = document.getElementById('modal-vip-pass');
const passDataGrid = document.getElementById('pass-data-grid');
const toastHub = document.getElementById('toast-hub');

// ================= SOUND ENGINE (WEB AUDIO API) =================
function playSound(type = 'click') {
  if (!appState.soundEnabled) return;
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, audioCtx.currentTime + 0.12); // G5
      osc.frequency.exponentialRampToValueAtTime(1046.50, audioCtx.currentTime + 0.25); // C6
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
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
    // AudioContext blocked before first user interaction
  }
}

// ================= TOAST ALERTS =================
function showToastAlert(message, type = 'info') {
  const alert = document.createElement('div');
  alert.className = `toast-item-alert ${type}`;
  alert.textContent = message;
  toastHub.appendChild(alert);
  setTimeout(() => {
    alert.style.opacity = '0';
    alert.style.transform = 'translateY(10px)';
    setTimeout(() => alert.remove(), 300);
  }, 3500);
}

// ================= REST API SYNC WITH C++ CORE =================
async function syncCoreEngine() {
  try {
    const res = await fetch(`${API_ENDPOINT}/state`);
    if (!res.ok) throw new Error('C++ Server Unreachable');
    const data = await res.json();

    appState.metrics = data.metrics || {};
    appState.tables = data.tables || [];
    appState.bookings = data.bookings || [];
    appState.activity = data.activity || [];

    document.getElementById('core-beacon-pill').style.borderColor = 'rgba(16, 185, 129, 0.3)';
    document.getElementById('core-beacon-pill').querySelector('.beacon-text').textContent = 'C++ Engine Live';

    await updateSlotMatrix();
  } catch (err) {
    document.getElementById('core-beacon-pill').style.borderColor = 'rgba(244, 63, 94, 0.4)';
    document.getElementById('core-beacon-pill').querySelector('.beacon-text').textContent = '⚠️ Backend Offline';
  }
}

async function updateSlotMatrix() {
  try {
    const res = await fetch(`${API_ENDPOINT}/availability?date=${encodeURIComponent(appState.selectedDate)}&time=${encodeURIComponent(appState.selectedTime)}`);
    if (res.ok) {
      const data = await res.json();
      appState.availableTableIds = data.available || [];
      appState.occupiedTableIds = data.occupied || [];
    }
  } catch (err) {
    console.error('Failed to update slot matrix:', err);
  }

  renderAllViews();
}

// ================= MASTER RENDER =================
function renderAllViews() {
  renderMetricsRow();
  renderGuestFloorPlan();
  renderTableDropdownOptions();
  renderStaffReservations();
  renderStaffFleet();
  renderStaffAnalytics();
  renderStaffActivityTrail();

  guestSlotLabel.textContent = `Viewing availability for ${appState.selectedDate} at ${appState.selectedTime}`;
  staffBookingBadge.textContent = appState.bookings.length;
}

// 1. KPI Metrics Ribbon
function renderMetricsRow() {
  const total = appState.tables.length;
  const operational = appState.tables.filter(t => t.status === 'Available').length;
  const capacity = appState.metrics.totalCapacity || 0;
  const occupiedCount = appState.occupiedTableIds.length;
  const rate = operational > 0 ? Math.round((occupiedCount / operational) * 100) : 0;

  metricTotalTables.textContent = total;
  metricOpTables.textContent = `${operational} Open`;
  metricTotalCapacity.textContent = capacity;
  metricActiveBookings.textContent = appState.bookings.length;
  metricOccupancyRate.textContent = `${rate}%`;
  metricOccupancyRatio.textContent = `${occupiedCount}/${operational} Booked`;
}

// 2. Table Geometry & Fixture Icons
function getFixtureDetails(type, capacity) {
  const t = type.toLowerCase();
  if (t.includes('vip')) return { shape: 'shape-vip', icon: '👑' };
  if (t.includes('couple') || capacity <= 2) return { shape: 'shape-round', icon: '🍷' };
  if (t.includes('banquet') || capacity >= 8) return { shape: 'shape-banquet', icon: '🍾' };
  return { shape: 'shape-booth', icon: '🍽️' };
}

// 3. Guest Floor Plan Canvas
function renderGuestFloorPlan() {
  guestFloorCanvas.innerHTML = '';

  let filtered = appState.tables;
  if (appState.selectedZone !== 'ALL') {
    filtered = appState.tables.filter(t => t.type.toLowerCase().includes(appState.selectedZone.toLowerCase()));
  }

  if (filtered.length === 0) {
    guestFloorCanvas.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 50px;">
        No tables found in section "${appState.selectedZone}".
      </div>
    `;
    return;
  }

  filtered.forEach(table => {
    const isMaintenance = table.status === 'Maintenance';
    const isOccupied = appState.occupiedTableIds.includes(table.id);
    const isSelected = appState.selectedTableId === table.id;

    let podClass = 'pod-available';
    let statusText = 'FREE';

    if (isMaintenance) {
      podClass = 'pod-offline';
      statusText = 'OFFLINE';
    } else if (isOccupied) {
      podClass = 'pod-reserved';
      statusText = 'RESERVED';
    }

    const { shape, icon } = getFixtureDetails(table.type, table.capacity);

    const pod = document.createElement('div');
    pod.className = `table-pod-fixture ${podClass} ${isSelected ? 'pod-locked' : ''}`;
    pod.dataset.id = table.id;

    // Realistic Leather Chairs around perimeter
    let chairsHtml = '<div class="chair-piece seat-top"></div><div class="chair-piece seat-bot"></div>';
    if (table.capacity >= 4) {
      chairsHtml += '<div class="chair-piece seat-left"></div><div class="chair-piece seat-right"></div>';
    }
    if (table.capacity >= 6) {
      chairsHtml += '<div class="chair-piece seat-tl"></div><div class="chair-piece seat-tr"></div>';
    }
    if (table.capacity >= 8) {
      chairsHtml += '<div class="chair-piece seat-bl"></div><div class="chair-piece seat-br"></div>';
    }

    // Reservation Tooltip
    let activeBooking = null;
    if (isOccupied) {
      activeBooking = appState.bookings.find(b => b.tableId === table.id && b.date === appState.selectedDate && b.time === appState.selectedTime);
    }

    pod.innerHTML = `
      <span class="fixture-top-tag">#T-${table.id < 10 ? '0' + table.id : table.id}</span>
      <span class="fixture-status-pill">${statusText}</span>

      <div class="table-geometry-wrap">
        <div class="table-surface-3d ${shape}">
          <span>${icon}</span>
        </div>
        ${chairsHtml}
      </div>

      <div class="fixture-caption">
        <div class="fixture-name">${table.type}</div>
        <div class="fixture-cap">${table.capacity} Guest Seats</div>
        ${activeBooking ? `<div class="fixture-guest-name">Reserved: ${activeBooking.guestName}</div>` : ''}
      </div>
    `;

    // Click handler to select table directly
    pod.addEventListener('click', () => {
      playSound('pop');

      if (isMaintenance) {
        showToastAlert(`Table #${table.id} is currently under maintenance.`, 'error');
        return;
      }

      if (isOccupied) {
        showToastAlert(`Table #${table.id} is booked by "${activeBooking?.guestName || 'Guest'}" for this time slot.`, 'info');
      } else {
        appState.selectedTableId = table.id;
        guestTableSelect.value = String(table.id);
        document.getElementById('party-size-input').value = Math.min(table.capacity, 4);
        showToastAlert(`Table #${table.id} (${table.type}, ${table.capacity} seats) selected.`, 'success');
        renderGuestFloorPlan();
      }
    });

    guestFloorCanvas.appendChild(pod);
  });
}

// 4. Dropdown Table Options
function renderTableDropdownOptions() {
  const current = guestTableSelect.value;
  guestTableSelect.innerHTML = '<option value="0">✨ Auto-Assign Best Fit (Smart Engine)</option>';

  appState.tables.forEach(t => {
    if (t.status === 'Available') {
      const opt = document.createElement('option');
      opt.value = t.id;
      const isOcc = appState.occupiedTableIds.includes(t.id);
      opt.textContent = `Table #${t.id} - ${t.type} (${t.capacity} seats) ${isOcc ? '⚠️ Booked in slot' : '✅ Free'}`;
      guestTableSelect.appendChild(opt);
    }
  });

  guestTableSelect.value = current || '0';
}

// 5. Staff Reservations Ledger
function renderStaffReservations() {
  const query = staffSearchInput.value.trim().toLowerCase();
  staffReservationsTbody.innerHTML = '';

  const list = appState.bookings.filter(b => {
    if (!query) return true;
    return b.guestName.toLowerCase().includes(query) ||
           String(b.bookingId).includes(query) ||
           b.date.includes(query) ||
           String(b.tableId).includes(query);
  });

  if (list.length === 0) {
    staffReservationsTbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center; color:var(--text-muted); padding:32px;">
          No reservations found matching criteria.
        </td>
      </tr>
    `;
    return;
  }

  list.forEach(b => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>#${b.bookingId}</strong></td>
      <td><span class="pill-tag gold">Table #${b.tableId}</span></td>
      <td><strong>${b.guestName}</strong></td>
      <td>${b.guests} Guests</td>
      <td><code>${b.date}</code></td>
      <td><code>${b.time}</code></td>
      <td><span class="pill-tag green">CONFIRMED</span></td>
      <td>
        <div style="display:flex; gap:6px;">
          <button class="btn btn-glass btn-xs btn-view-pass" data-id="${b.bookingId}">View Pass</button>
          <button class="btn-danger-xs btn-cancel-b" data-id="${b.bookingId}">Cancel</button>
        </div>
      </td>
    `;
    staffReservationsTbody.appendChild(tr);
  });

  document.querySelectorAll('.btn-view-pass').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      const b = appState.bookings.find(x => x.bookingId === id);
      if (b) showVipPassModal(b);
    });
  });

  document.querySelectorAll('.btn-cancel-b').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      handleCancelReservation(id);
    });
  });
}

// 6. Staff Physical Table Fleet Controls
function renderStaffFleet() {
  staffFleetTbody.innerHTML = '';
  appState.tables.forEach(t => {
    const isAvail = t.status === 'Available';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>#T-${t.id}</strong></td>
      <td>${t.capacity} Guests</td>
      <td>${t.type}</td>
      <td><span class="pill-tag ${isAvail ? 'green' : 'red'}">${t.status}</span></td>
      <td>
        <button class="btn-status-toggle btn-toggle-status" data-id="${t.id}" data-current="${t.status}">
          ${isAvail ? 'Set Maintenance' : 'Set Available'}
        </button>
      </td>
      <td>
        <button class="btn-danger-xs btn-delete-table" data-id="${t.id}">Delete</button>
      </td>
    `;
    staffFleetTbody.appendChild(tr);
  });

  document.querySelectorAll('.btn-toggle-status').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = parseInt(btn.dataset.id);
      const current = btn.dataset.current;
      const target = (current === 'Available') ? 'Maintenance' : 'Available';
      await handleToggleTableStatus(id, target);
    });
  });

  document.querySelectorAll('.btn-delete-table').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = parseInt(btn.dataset.id);
      await handleDeleteTable(id);
    });
  });
}

// 7. Staff Analytics & Zone Breakdown
function renderStaffAnalytics() {
  staffZoneBreakdown.innerHTML = '';
  const counts = {};
  appState.tables.forEach(t => {
    counts[t.type] = (counts[t.type] || 0) + 1;
  });

  for (const [type, count] of Object.entries(counts)) {
    const div = document.createElement('div');
    div.className = 'breakdown-row';
    div.innerHTML = `
      <span><strong>${type}</strong></span>
      <span class="pill-tag gold">${count} Tables (${count * 1} unit)</span>
    `;
    staffZoneBreakdown.appendChild(div);
  }

  // Slot demand
  staffSlotDemand.innerHTML = '';
  const slotCounts = {};
  appState.bookings.forEach(b => {
    slotCounts[b.time] = (slotCounts[b.time] || 0) + 1;
  });

  ['12:00 PM', '2:00 PM', '4:00 PM', '6:00 PM', '8:00 PM', '10:00 PM'].forEach(slot => {
    const count = slotCounts[slot] || 0;
    const div = document.createElement('div');
    div.className = 'breakdown-row';
    div.innerHTML = `
      <span><strong>${slot}</strong></span>
      <span class="pill-tag ${count > 0 ? 'green' : 'gold'}">${count} Bookings</span>
    `;
    staffSlotDemand.appendChild(div);
  });
}

// 8. Staff Activity Audit Trail
function renderStaffActivityTrail() {
  staffActivityTimeline.innerHTML = '';
  if (appState.activity.length === 0) {
    staffActivityTimeline.innerHTML = '<div style="color:var(--text-muted); padding:16px;">No audit events recorded.</div>';
    return;
  }

  const reversed = [...appState.activity].reverse();
  reversed.forEach(item => {
    const card = document.createElement('div');
    card.className = 'timeline-card';
    card.innerHTML = `
      <div class="time-stamp">${item.timestamp}</div>
      <div>
        <div class="event-type-badge">${item.type}</div>
        <div class="event-desc">${item.message}</div>
      </div>
    `;
    staffActivityTimeline.appendChild(card);
  });
}

// ================= 6-STAGE ALGORITHM VISUALIZER ANIMATION =================
function resetPipelineAnimation() {
  for (let i = 1; i <= 5; ++i) {
    const node = document.getElementById(`pipe-node-${i}`);
    node.className = 'pipeline-node';
  }
  document.getElementById('pipeline-status').textContent = 'Allocating...';
  document.getElementById('pipeline-status').style.color = '#fbbf24';
}

function setPipelineStep(step, status, text = null) {
  const node = document.getElementById(`pipe-node-${step}`);
  if (!node) return;
  node.className = `pipeline-node node-${status}`;
  if (text) {
    document.getElementById(`pipe-sub-${step}`).textContent = text;
  }
}

async function runAllocationSequence(trace, success, createdBooking, errorMsg) {
  resetPipelineAnimation();

  // Step 1: Sanitization
  setPipelineStep(1, 'running', 'Validating guest parameters');
  await new Promise(r => setTimeout(r, 200));
  setPipelineStep(1, 'success', 'Input verified');

  // Step 2: Slot Window
  setPipelineStep(2, 'running', 'Checking date & time boundaries');
  await new Promise(r => setTimeout(r, 200));
  setPipelineStep(2, 'success', `${createdBooking?.date || appState.selectedDate} @ ${createdBooking?.time || appState.selectedTime}`);

  // Step 3: Conflict Scan
  setPipelineStep(3, 'running', 'Scanning slot collisions in active records');
  await new Promise(r => setTimeout(r, 240));
  setPipelineStep(3, 'success', 'Slot conflict scan complete');

  // Step 4: Best-Fit Match
  setPipelineStep(4, 'running', 'Matching optimal seating capacity');
  await new Promise(r => setTimeout(r, 280));

  if (!success) {
    setPipelineStep(4, 'running', errorMsg || 'No table match');
    document.getElementById('pipeline-status').textContent = 'Allocation Failed';
    document.getElementById('pipeline-status').style.color = '#f43f5e';
    showToastAlert(errorMsg || 'Reservation failed: No table available.', 'error');
    return;
  }

  setPipelineStep(4, 'success', `Matched Table #${createdBooking.tableId}`);

  // Step 5: Disk Persist
  setPipelineStep(5, 'running', 'Writing to tables.txt & bookings.txt');
  await new Promise(r => setTimeout(r, 200));
  setPipelineStep(5, 'success', 'Disk persistence confirmed');

  document.getElementById('pipeline-status').textContent = 'Confirmed';
  document.getElementById('pipeline-status').style.color = '#10b981';

  playSound('success');
  showVipPassModal(createdBooking);
}

// ================= VIP DINING PASS MODAL =================
function showVipPassModal(b) {
  passDataGrid.innerHTML = `
    <div class="pass-field-cell">
      <label>Booking Reference</label>
      <strong>#${b.bookingId}</strong>
    </div>
    <div class="pass-field-cell">
      <label>Assigned Dining Table</label>
      <strong style="color:var(--gold-400);">Table #${b.tableId}</strong>
    </div>
    <div class="pass-field-cell">
      <label>Guest Full Name</label>
      <strong>${b.guestName}</strong>
    </div>
    <div class="pass-field-cell">
      <label>Party Size</label>
      <strong>${b.guests} Guest(s)</strong>
    </div>
    <div class="pass-field-cell">
      <label>Reservation Date</label>
      <strong>${b.date}</strong>
    </div>
    <div class="pass-field-cell">
      <label>Dining Time Slot</label>
      <strong>${b.time}</strong>
    </div>
  `;
  modalVipPass.classList.add('open');
}

// ================= ACTIONS & EVENT HANDLERS =================

// 1. Dual Mode Switching (Guest Portal vs Staff Host Stand)
document.getElementById('btn-mode-guest').addEventListener('click', () => {
  playSound('click');
  document.getElementById('btn-mode-guest').classList.add('active');
  document.getElementById('btn-mode-staff').classList.remove('active');
  document.getElementById('view-mode-guest').classList.add('active');
  document.getElementById('view-mode-staff').classList.remove('active');
});

document.getElementById('btn-mode-staff').addEventListener('click', () => {
  playSound('click');
  document.getElementById('btn-mode-staff').classList.add('active');
  document.getElementById('btn-mode-guest').classList.remove('active');
  document.getElementById('view-mode-staff').classList.add('active');
  document.getElementById('view-mode-guest').classList.remove('active');
});

// Staff Subview Switching
document.querySelectorAll('.staff-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    playSound('click');
    document.querySelectorAll('.staff-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const view = tab.dataset.staffView;
    document.querySelectorAll('.staff-subview').forEach(sv => {
      sv.classList.toggle('active', sv.id === `subview-${view}`);
    });
  });
});

// 2. Quick Experience Booking Buttons
document.querySelectorAll('.btn-quick-experience').forEach(btn => {
  btn.addEventListener('click', () => {
    playSound('pop');
    const guests = parseInt(btn.dataset.guests);
    const type = btn.dataset.type;
    document.getElementById('party-size-input').value = guests;
    
    // Find free table matching type
    const candidate = appState.tables.find(t => t.type.toLowerCase().includes(type.toLowerCase()) && appState.availableTableIds.includes(t.id));
    if (candidate) {
      appState.selectedTableId = candidate.id;
      guestTableSelect.value = String(candidate.id);
      showToastAlert(`Selected Table #${candidate.id} (${candidate.type}).`, 'success');
      renderGuestFloorPlan();
    } else {
      guestTableSelect.value = '0';
      showToastAlert(`Auto-assigning optimal ${type} table.`, 'info');
    }
  });
});

// 3. Guest Booking Submission
guestReservationForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const guestName = document.getElementById('guest-name-input').value.trim();
  const guests = parseInt(document.getElementById('party-size-input').value);
  const date = document.getElementById('guest-date-input').value.trim();
  const time = document.getElementById('guest-time-select').value;
  const tableId = parseInt(guestTableSelect.value);

  const btn = document.getElementById('btn-book-submit');
  btn.disabled = true;

  try {
    const res = await fetch(`${API_ENDPOINT}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guestName, guests, date, time, tableId })
    });

    const data = await res.json();
    await runAllocationSequence(data.trace || [], data.success, data.booking, data.error);

    if (data.success) {
      guestReservationForm.reset();
      document.getElementById('party-size-input').value = '4';
      document.getElementById('guest-date-input').value = appState.selectedDate;
      document.getElementById('guest-time-select').value = appState.selectedTime;
      appState.selectedTableId = 0;
      await syncCoreEngine();
    }
  } catch (err) {
    showToastAlert('Failed to communicate with C++ backend.', 'error');
  } finally {
    btn.disabled = false;
  }
});

// 4. Cancel Reservation Action
async function handleCancelReservation(id) {
  if (!confirm(`Are you sure you want to cancel Reservation #${id}?`)) return;

  try {
    const res = await fetch(`${API_ENDPOINT}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId: id })
    });

    const data = await res.json();
    if (data.success) {
      showToastAlert(`Reservation #${id} cancelled.`, 'success');
      await syncCoreEngine();
    } else {
      showToastAlert(data.error || 'Could not cancel reservation.', 'error');
    }
  } catch (err) {
    showToastAlert('Backend communication error.', 'error');
  }
}

// 5. Staff Table Operational Status Toggle
async function handleToggleTableStatus(id, status) {
  try {
    const res = await fetch(`${API_ENDPOINT}/tables/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status })
    });

    const data = await res.json();
    if (data.success) {
      showToastAlert(`Table #${id} status updated to ${status}.`, 'success');
      await syncCoreEngine();
    } else {
      showToastAlert(data.error || 'Failed to update table status.', 'error');
    }
  } catch (err) {
    showToastAlert('Server communication error.', 'error');
  }
}

// 6. Staff Delete Table Action
async function handleDeleteTable(id) {
  if (!confirm(`Are you sure you want to delete Table #${id}?`)) return;

  try {
    const res = await fetch(`${API_ENDPOINT}/tables/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });

    const data = await res.json();
    if (data.success) {
      showToastAlert(`Table #${id} deleted from restaurant.`, 'success');
      await syncCoreEngine();
    } else {
      showToastAlert(data.error || 'Cannot delete table.', 'error');
    }
  } catch (err) {
    showToastAlert('Server communication error.', 'error');
  }
}

// 7. Add Table Form
document.getElementById('form-add-new-table').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = parseInt(document.getElementById('new-tbl-id').value);
  const capacity = parseInt(document.getElementById('new-tbl-capacity').value);
  const type = document.getElementById('new-tbl-type').value.trim();

  try {
    const res = await fetch(`${API_ENDPOINT}/tables`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, capacity, type })
    });

    const data = await res.json();
    if (data.success) {
      showToastAlert(`Table #${id} successfully added!`, 'success');
      modalTableCreate.classList.remove('open');
      document.getElementById('form-add-new-table').reset();
      await syncCoreEngine();
    } else {
      showToastAlert(data.error || 'Could not add table.', 'error');
    }
  } catch (err) {
    showToastAlert('Backend error adding table.', 'error');
  }
});

// 8. Party Size Steppers & Filters
document.getElementById('btn-stepper-plus').addEventListener('click', () => {
  playSound('pop');
  const inp = document.getElementById('party-size-input');
  inp.value = Math.min(50, parseInt(inp.value || 1) + 1);
});

document.getElementById('btn-stepper-minus').addEventListener('click', () => {
  playSound('pop');
  const inp = document.getElementById('party-size-input');
  inp.value = Math.max(1, parseInt(inp.value || 2) - 1);
});

slotCarousel.addEventListener('click', (e) => {
  const chip = e.target.closest('.slot-chip');
  if (chip) {
    playSound('click');
    document.querySelectorAll('.slot-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    appState.selectedTime = chip.dataset.time;
    document.getElementById('guest-time-select').value = appState.selectedTime;
    updateSlotMatrix();
  }
});

slotDateInput.addEventListener('change', () => {
  appState.selectedDate = slotDateInput.value.trim() || '24/05/2026';
  document.getElementById('guest-date-input').value = appState.selectedDate;
  updateSlotMatrix();
});

document.querySelectorAll('.pill').forEach(btn => {
  btn.addEventListener('click', () => {
    playSound('click');
    document.querySelectorAll('.pill').forEach(b => b.classList.remove('active'));
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
    slotDateInput.value = appState.selectedDate;
    document.getElementById('guest-date-input').value = appState.selectedDate;
    updateSlotMatrix();
  });
});

zoneFilterSelect.addEventListener('change', () => {
  appState.selectedZone = zoneFilterSelect.value;
  renderGuestFloorPlan();
});

staffSearchInput.addEventListener('input', renderStaffReservations);

document.getElementById('btn-refresh-state').addEventListener('click', () => {
  syncCoreEngine();
  showToastAlert('Synchronized with C++ Core Engine.', 'info');
});

document.getElementById('btn-toggle-sound').addEventListener('click', () => {
  appState.soundEnabled = !appState.soundEnabled;
  soundIcon.textContent = appState.soundEnabled ? '🔊' : '🔇';
  showToastAlert(appState.soundEnabled ? 'Audio feedback enabled.' : 'Audio feedback muted.', 'info');
});

// Modal Toggles
document.getElementById('btn-open-table-modal').addEventListener('click', () => modalTableCreate.classList.add('open'));
document.getElementById('btn-staff-add-table').addEventListener('click', () => modalTableCreate.classList.add('open'));
document.getElementById('btn-close-table-modal').addEventListener('click', () => modalTableCreate.classList.remove('open'));
document.getElementById('btn-cancel-table-modal').addEventListener('click', () => modalTableCreate.classList.remove('open'));
document.getElementById('btn-dismiss-pass').addEventListener('click', () => modalVipPass.classList.remove('open'));

// Background auto-sync every 3.5s
setInterval(syncCoreEngine, 3500);

// Initialize on page load
syncCoreEngine();
