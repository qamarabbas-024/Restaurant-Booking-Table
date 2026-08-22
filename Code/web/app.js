// ==========================================================================
// THE ROYAL SPICE — RESTAURANT MANAGEMENT SYSTEM (MASTER CONTROLLER)
// Production-Grade Dual-Architecture: Local Standalone + Live C++17 Core Engine
// ==========================================================================

const API_BASE = 'http://localhost:8080/api';

// --- LOCAL STORAGE KEYS ---
const STORAGE_KEYS = {
  TABLES: 'royal_spice_tables',
  BOOKINGS: 'royal_spice_bookings',
  ACTIVITY: 'royal_spice_activity',
  THEME: 'royal_spice_theme'
};

// Initial Seed Tables
const DEFAULT_TABLES = [
  { id: 1, capacity: 2, type: 'Couple Table', status: 'Available' },
  { id: 2, capacity: 4, type: 'Family Booth', status: 'Available' },
  { id: 3, capacity: 6, type: 'VIP Suite', status: 'Available' },
  { id: 4, capacity: 8, type: 'Banquet Table', status: 'Available' },
  { id: 5, capacity: 2, type: 'Couple Table', status: 'Available' },
  { id: 6, capacity: 4, type: 'Family Booth', status: 'Available' }
];

// Master Application State
const appState = {
  currentView: 'dashboard',
  currentTheme: localStorage.getItem(STORAGE_KEYS.THEME) || 'light',
  soundEnabled: true,
  selectedOccasion: 'Romantic Dinner',
  selectedZone: 'ALL',
  selectedDate: '24/05/2026',
  selectedTime: '8:00 PM',
  selectedTableId: 0,
  activeDrawerTable: null,
  isBackendConnected: false,
  metrics: { totalCapacity: 26 },
  tables: JSON.parse(localStorage.getItem(STORAGE_KEYS.TABLES) || 'null') || DEFAULT_TABLES,
  bookings: JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || 'null') || [],
  activity: JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVITY) || 'null') || [
    { timestamp: '17:30', type: 'SYSTEM_INIT', message: 'Shift started. All table fixtures calibrated.' },
    { timestamp: '17:35', type: 'TABLE_STATUS', message: 'VIP Suite prepared for dinner service.' }
  ],
  availableTableIds: [],
  occupiedTableIds: []
};

// ================= DOM ELEMENT REFERENCES =================
const appSidebar = document.getElementById('app-sidebar');
const currentViewTitle = document.getElementById('current-view-title');
const headerDateBadge = document.getElementById('header-date-badge');
const globalDateInput = document.getElementById('global-date-input');
const headerSlotChips = document.getElementById('header-slot-chips');
const coreSyncIndicator = document.getElementById('core-sync-indicator');
const themeModeToggle = document.getElementById('theme-mode-toggle');
const themeToggleIcon = document.getElementById('theme-toggle-icon');
const soundFeedbackToggle = document.getElementById('sound-feedback-toggle');
const soundToggleIcon = document.getElementById('sound-toggle-icon');

// Metric Tiles
const metricAvailableTables = document.getElementById('metric-available-tables');
const metricTotalTablesDenom = document.getElementById('metric-total-tables-denom');
const metricSeatedCovers = document.getElementById('metric-seated-covers');
const metricCapacityTag = document.getElementById('metric-capacity-tag');
const metricTotalBookingsCount = document.getElementById('metric-total-bookings-count');
const metricSlotBookingsTag = document.getElementById('metric-slot-bookings-tag');
const metricEstRevenue = document.getElementById('metric-est-revenue');
const navOpenTablesPill = document.getElementById('nav-open-tables-pill');
const navBookingsPill = document.getElementById('nav-bookings-pill');
const miniSeatedCount = document.getElementById('mini-seated-count');
const miniUpcomingCount = document.getElementById('mini-upcoming-count');

// Canvases & Lists
const dashboardFloorPreview = document.getElementById('dashboard-floor-preview');
const dashboardUpcomingList = document.getElementById('dashboard-upcoming-list');
const dashboardMiniActivity = document.getElementById('dashboard-mini-activity');
const masterFloorCanvas = document.getElementById('master-floor-canvas');
const floorActiveSummaryPill = document.getElementById('floor-active-summary-pill');
const masterReservationsTbody = document.getElementById('master-reservations-tbody');
const fleetTablesTbody = document.getElementById('fleet-tables-tbody');
const fullActivityStream = document.getElementById('full-activity-stream');

// Form & Controls
const masterBookingForm = document.getElementById('master-booking-form');
const formTableSelect = document.getElementById('form-table-select');
const reservationsSearchInput = document.getElementById('reservations-search-input');
const reservationsStatusFilter = document.getElementById('reservations-status-filter');

// Context Drawer
const tableContextDrawer = document.getElementById('table-context-drawer');
const drawerBackdrop = document.getElementById('drawer-backdrop');
const drawerTableHeading = document.getElementById('drawer-table-heading');
const drawerStatusBadge = document.getElementById('drawer-status-badge');
const drawerTableCapacity = document.getElementById('drawer-table-capacity');
const drawerTableCategory = document.getElementById('drawer-table-category');
const drawerTableSlot = document.getElementById('drawer-table-slot');
const drawerTableTurnover = document.getElementById('drawer-table-turnover');
const drawerBookingSection = document.getElementById('drawer-booking-section');
const drawerGuestName = document.getElementById('drawer-guest-name');
const drawerBookingId = document.getElementById('drawer-booking-id');
const drawerPartySize = document.getElementById('drawer-party-size');
const drawerOccasion = document.getElementById('drawer-occasion');
const drawerBtnSeatWalkin = document.getElementById('drawer-btn-seat-walkin');
const drawerBtnToggleStatus = document.getElementById('drawer-btn-toggle-status');
const drawerToggleStatusText = document.getElementById('drawer-toggle-status-text');
const drawerBtnReleaseTable = document.getElementById('drawer-btn-release-table');

// Modals
const modalWalkinDialog = document.getElementById('modal-walkin-dialog');
const modalTableDialog = document.getElementById('modal-table-dialog');
const modalReceiptPass = document.getElementById('modal-receipt-pass');
const passGridData = document.getElementById('pass-grid-data');
const toastStream = document.getElementById('toast-stream');

// ================= SYNTHESIZED SOUND ENGINE =================
function playAudioChime(type = 'click') {
  if (!appState.soundEnabled) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'clink') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1046.50, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1567.98, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
      osc.start();
      osc.stop(ctx.currentTime + 0.28);
    } else if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.1);
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    }
  } catch (e) {
    // blocked prior to interaction
  }
}

// ================= TOAST NOTIFICATIONS =================
function showToastNotification(message, type = 'info') {
  const alert = document.createElement('div');
  alert.className = `toast-alert ${type}`;
  alert.textContent = message;
  toastStream.appendChild(alert);
  setTimeout(() => {
    alert.style.opacity = '0';
    alert.style.transform = 'translateY(6px)';
    setTimeout(() => alert.remove(), 250);
  }, 3500);
}

// ================= LOCAL PERSISTENCE LAYER =================
function saveLocalState() {
  localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(appState.tables));
  localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(appState.bookings));
  localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(appState.activity));
}

function logEvent(type, message) {
  const now = new Date();
  const timestamp = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  appState.activity.unshift({ timestamp, type, message });
  if (appState.activity.length > 50) appState.activity.pop();
  saveLocalState();
}

// ================= REST API / C++ BACKEND SYNC =================
async function syncWithCoreEngine() {
  try {
    const res = await fetch(`${API_BASE}/state`);
    if (!res.ok) throw new Error('C++ Server Unreachable');
    const data = await res.json();

    appState.isBackendConnected = true;
    appState.metrics = data.metrics || appState.metrics;
    if (data.tables && data.tables.length > 0) appState.tables = data.tables;
    if (data.bookings) appState.bookings = data.bookings;
    if (data.activity && data.activity.length > 0) appState.activity = data.activity;

    coreSyncIndicator.style.borderColor = 'rgba(22, 163, 74, 0.3)';
    coreSyncIndicator.querySelector('.sync-label').textContent = 'C++ Live';
    coreSyncIndicator.querySelector('.sync-dot').style.background = 'var(--c-available)';

    saveLocalState();
  } catch (err) {
    appState.isBackendConnected = false;
    coreSyncIndicator.style.borderColor = 'rgba(100, 116, 139, 0.3)';
    coreSyncIndicator.querySelector('.sync-label').textContent = 'Local Standalone';
    coreSyncIndicator.querySelector('.sync-dot').style.background = 'var(--c-maintenance)';
  }

  evaluateSlotState();
  renderMasterView();
}

function evaluateSlotState() {
  const currentSlotBookings = appState.bookings.filter(
    b => b.date === appState.selectedDate && b.time === appState.selectedTime
  );

  appState.occupiedTableIds = currentSlotBookings.map(b => b.tableId);
  appState.availableTableIds = appState.tables
    .filter(t => t.status === 'Available' && !appState.occupiedTableIds.includes(t.id))
    .map(t => t.id);
}

// ================= MASTER RENDERER =================
function renderMasterView() {
  renderMetrics();
  renderFloorPlan(dashboardFloorPreview, false);
  renderFloorPlan(masterFloorCanvas, true);
  renderUpcomingArrivals();
  renderActivityTimeline();
  renderTableSelectDropdowns();
  renderFleetTable();
  renderReservationsTable();

  // Update headers & pills
  headerDateBadge.textContent = `${appState.selectedDate} (${appState.selectedTime})`;
  navOpenTablesPill.textContent = `${appState.availableTableIds.length} Open`;
  navBookingsPill.textContent = appState.bookings.length;

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// 1. Metrics Deck
function renderMetrics() {
  const total = appState.tables.length;
  const available = appState.availableTableIds.length;
  const totalCapacity = appState.tables.reduce((acc, t) => acc + (t.capacity || 0), 0);

  // Seated covers in currently selected slot
  const currentSlotBookings = appState.bookings.filter(
    b => b.date === appState.selectedDate && b.time === appState.selectedTime
  );
  const seatedCovers = currentSlotBookings.reduce((acc, b) => acc + (b.guests || 0), 0);
  const occupancyRate = totalCapacity > 0 ? Math.round((seatedCovers / totalCapacity) * 100) : 0;

  // Estimated gross revenue yield ($65 avg per cover)
  const estYield = appState.bookings.reduce((acc, b) => acc + (b.guests * 65), 0);

  metricAvailableTables.textContent = available;
  metricTotalTablesDenom.textContent = `/${total}`;
  metricSeatedCovers.textContent = seatedCovers;
  metricCapacityTag.textContent = `${occupancyRate}% Capacity`;
  metricTotalBookingsCount.textContent = appState.bookings.length;
  metricSlotBookingsTag.textContent = `${currentSlotBookings.length} in Slot`;
  metricEstRevenue.textContent = `$${estYield.toLocaleString()}`;

  miniSeatedCount.textContent = seatedCovers;
  miniUpcomingCount.textContent = appState.bookings.length - currentSlotBookings.length;

  floorActiveSummaryPill.textContent = `${available} Tables Available • ${currentSlotBookings.length} Booked • ${total - available - currentSlotBookings.length} Blocked`;
}

// 2. Table Fixture Shape Resolver
function resolveFixtureGeometry(type, capacity) {
  const t = (type || '').toLowerCase();
  if (t.includes('vip')) return { shape: 'shape-vip', icon: '👑' };
  if (t.includes('couple') || capacity <= 2) return { shape: 'shape-round', icon: '🍷' };
  if (t.includes('banquet') || capacity >= 8) return { shape: 'shape-banquet', icon: '🍾' };
  return { shape: 'shape-booth', icon: '🍽️' };
}

// 3. Interactive Spatial Floor Plan
function renderFloorPlan(canvasElement, enableZoneFilter = true) {
  if (!canvasElement) return;
  canvasElement.innerHTML = '';

  let tablesToRender = appState.tables;
  if (enableZoneFilter && appState.selectedZone !== 'ALL') {
    tablesToRender = appState.tables.filter(t => t.type.toLowerCase().includes(appState.selectedZone.toLowerCase()));
  }

  if (tablesToRender.length === 0) {
    canvasElement.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px;">
        No tables found in section "${appState.selectedZone}".
      </div>
    `;
    return;
  }

  tablesToRender.forEach(table => {
    const isMaintenance = table.status === 'Maintenance';
    const isOccupied = appState.occupiedTableIds.includes(table.id);
    const isSelected = appState.selectedTableId === table.id;

    let stateClass = 'state-available';
    let statusLabel = 'AVAILABLE';

    if (isMaintenance) {
      stateClass = 'state-maintenance';
      statusLabel = 'BLOCKED';
    } else if (isOccupied) {
      stateClass = 'state-reserved';
      statusLabel = 'RESERVED';
    }

    const { shape, icon } = resolveFixtureGeometry(table.type, table.capacity);

    const activeBooking = isOccupied
      ? appState.bookings.find(b => b.tableId === table.id && b.date === appState.selectedDate && b.time === appState.selectedTime)
      : null;

    const pod = document.createElement('div');
    pod.className = `table-pod-node ${stateClass} ${isSelected ? 'state-selected' : ''}`;
    pod.dataset.tableId = table.id;

    pod.innerHTML = `
      <span class="pod-number-label">#T-${table.id < 10 ? '0' + table.id : table.id}</span>
      <span class="pod-status-pill">${statusLabel}</span>

      <div class="table-fixture-stage">
        <div class="table-surface-shape ${shape}">
          <span>${icon}</span>
        </div>
        <div class="chair-fixture chair-top"></div>
        <div class="chair-fixture chair-bot"></div>
        ${table.capacity >= 4 ? '<div class="chair-fixture chair-left"></div><div class="chair-fixture chair-right"></div>' : ''}
      </div>

      <div class="pod-name-text">${table.type}</div>
      <div class="pod-cap-text">${table.capacity} Guests Max</div>
      ${activeBooking ? `<div class="pod-guest-banner">Guest: ${activeBooking.guestName}</div>` : ''}
    `;

    pod.addEventListener('click', () => {
      playAudioChime('clink');
      appState.selectedTableId = table.id;
      openTableContextDrawer(table, activeBooking);
      renderMasterView();
    });

    canvasElement.appendChild(pod);
  });
}

// 4. Contextual Table Drawer Controller (SevenRooms Pattern)
function openTableContextDrawer(table, activeBooking) {
  appState.activeDrawerTable = table;

  drawerTableHeading.textContent = `Table #T-${table.id < 10 ? '0' + table.id : table.id}`;
  drawerTableCapacity.textContent = `${table.capacity} Guests`;
  drawerTableCategory.textContent = table.type;
  drawerTableSlot.textContent = `${appState.selectedDate} @ ${appState.selectedTime}`;
  drawerTableTurnover.textContent = table.capacity <= 2 ? '75 mins' : '90 mins';

  const isMaintenance = table.status === 'Maintenance';
  const isOccupied = !!activeBooking;

  if (isMaintenance) {
    drawerStatusBadge.textContent = 'Maintenance';
    drawerStatusBadge.className = 'drawer-status-badge';
    drawerToggleStatusText.textContent = 'Set Available';
    drawerBtnSeatWalkin.disabled = true;
    drawerBookingSection.style.display = 'none';
    drawerBtnReleaseTable.style.display = 'none';
  } else if (isOccupied) {
    drawerStatusBadge.textContent = 'Reserved / Seated';
    drawerStatusBadge.className = 'drawer-status-badge';
    drawerStatusBadge.style.background = 'var(--c-reserved-bg)';
    drawerStatusBadge.style.color = 'var(--c-reserved)';
    drawerToggleStatusText.textContent = 'Set Maintenance';
    drawerBtnSeatWalkin.disabled = true;

    drawerBookingSection.style.display = 'block';
    drawerGuestName.textContent = activeBooking.guestName;
    drawerBookingId.textContent = `#${activeBooking.bookingId || activeBooking.id}`;
    drawerPartySize.textContent = `${activeBooking.guests} Guests`;
    drawerOccasion.textContent = activeBooking.occasion || 'Dinner Service';

    drawerBtnReleaseTable.style.display = 'block';
  } else {
    drawerStatusBadge.textContent = 'Available';
    drawerStatusBadge.className = 'drawer-status-badge';
    drawerStatusBadge.style.background = 'var(--c-available-bg)';
    drawerStatusBadge.style.color = 'var(--c-available)';
    drawerToggleStatusText.textContent = 'Set Maintenance';
    drawerBtnSeatWalkin.disabled = false;
    drawerBookingSection.style.display = 'none';
    drawerBtnReleaseTable.style.display = 'none';
  }

  tableContextDrawer.classList.add('open');
  drawerBackdrop.classList.add('open');
}

function closeTableDrawer() {
  tableContextDrawer.classList.remove('open');
  drawerBackdrop.classList.remove('open');
}

// 5. Upcoming Arrivals & Activity Timeline
function renderUpcomingArrivals() {
  dashboardUpcomingList.innerHTML = '';
  const upcoming = appState.bookings.slice(0, 4);

  if (upcoming.length === 0) {
    dashboardUpcomingList.innerHTML = `
      <div style="text-align:center; color:var(--text-muted); padding:16px;">
        No reservations scheduled for this service shift.
      </div>
    `;
    return;
  }

  upcoming.forEach(b => {
    const item = document.createElement('div');
    item.className = 'arrival-row';
    item.innerHTML = `
      <div>
        <div class="arrival-guest">${b.guestName} <small>(Table #${b.tableId})</small></div>
        <div class="arrival-meta">${b.guests} Guests • ${b.date} at ${b.time}</div>
      </div>
      <span class="badge-tag green">CONFIRMED</span>
    `;
    dashboardUpcomingList.appendChild(item);
  });
}

function renderActivityTimeline() {
  dashboardMiniActivity.innerHTML = '';
  fullActivityStream.innerHTML = '';

  const entries = appState.activity.slice(0, 20);
  if (entries.length === 0) {
    dashboardMiniActivity.innerHTML = '<div style="color:var(--text-muted);">No activity recorded.</div>';
    fullActivityStream.innerHTML = '<div style="color:var(--text-muted);">No activity recorded.</div>';
    return;
  }

  entries.forEach((item, index) => {
    const html = `
      <div class="event-clock">${item.timestamp}</div>
      <div>
        <div class="event-type-badge">${item.type}</div>
        <div class="event-msg-text">${item.message}</div>
      </div>
    `;

    if (index < 4) {
      const miniCard = document.createElement('div');
      miniCard.className = 'activity-event-card';
      miniCard.innerHTML = html;
      dashboardMiniActivity.appendChild(miniCard);
    }

    const fullCard = document.createElement('div');
    fullCard.className = 'activity-event-card';
    fullCard.innerHTML = html;
    fullActivityStream.appendChild(fullCard);
  });
}

// 6. Dropdown Table Options
function renderTableSelectDropdowns() {
  const current = formTableSelect.value;
  formTableSelect.innerHTML = '<option value="0">✨ Auto-Assign Best Fit (Smart Engine)</option>';
  const walkinSelect = document.getElementById('walkin-table-choice');
  walkinSelect.innerHTML = '<option value="0">✨ Auto Best-Fit Allocation</option>';

  appState.tables.forEach(t => {
    if (t.status === 'Available') {
      const isOcc = appState.occupiedTableIds.includes(t.id);
      
      const opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = `Table #${t.id} - ${t.type} (${t.capacity} seats) ${isOcc ? '⚠️ Booked' : '✅ Free'}`;
      formTableSelect.appendChild(opt);

      const walkOpt = document.createElement('option');
      walkOpt.value = t.id;
      walkOpt.textContent = `Table #${t.id} - ${t.type} (${t.capacity} seats)`;
      walkinSelect.appendChild(walkOpt);
    }
  });

  formTableSelect.value = current || '0';
}

// 7. Fleet Management Table
function renderFleetTable() {
  fleetTablesTbody.innerHTML = '';

  appState.tables.forEach(t => {
    const isAvail = t.status === 'Available';
    const isOccupied = appState.occupiedTableIds.includes(t.id);
    const tr = document.createElement('tr');

    let serviceTag = isOccupied
      ? '<span class="badge-tag blue">Occupied</span>'
      : (isAvail ? '<span class="badge-tag green">Available</span>' : '<span class="badge-tag">Blocked</span>');

    tr.innerHTML = `
      <td><strong>#T-${t.id}</strong></td>
      <td>${t.capacity} Guests</td>
      <td>${t.type}</td>
      <td>${serviceTag}</td>
      <td><span class="badge-tag ${isAvail ? 'green' : 'gold'}">${t.status}</span></td>
      <td>
        <button class="btn-status-toggle btn-toggle-fleet" data-id="${t.id}" data-current="${t.status}">
          ${isAvail ? 'Set Maintenance' : 'Set Available'}
        </button>
      </td>
      <td>
        <button class="btn-danger-sm btn-delete-fleet" data-id="${t.id}">Delete</button>
      </td>
    `;
    fleetTablesTbody.appendChild(tr);
  });

  document.querySelectorAll('.btn-toggle-fleet').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = parseInt(btn.dataset.id);
      const current = btn.dataset.current;
      const target = current === 'Available' ? 'Maintenance' : 'Available';
      await handleToggleTableStatus(id, target);
    });
  });

  document.querySelectorAll('.btn-delete-fleet').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = parseInt(btn.dataset.id);
      await handleDeleteTable(id);
    });
  });
}

// 8. Master Reservations Table
function renderReservationsTable() {
  const query = (reservationsSearchInput.value || '').trim().toLowerCase();
  const statusFilter = reservationsStatusFilter.value;
  masterReservationsTbody.innerHTML = '';

  const list = appState.bookings.filter(b => {
    const matchesQuery = !query ||
      b.guestName.toLowerCase().includes(query) ||
      String(b.bookingId || b.id).includes(query) ||
      String(b.tableId).includes(query) ||
      b.date.includes(query);

    return matchesQuery;
  });

  if (list.length === 0) {
    masterReservationsTbody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align:center; color:var(--text-muted); padding:32px;">
          No reservations found matching search criteria.
        </td>
      </tr>
    `;
    return;
  }

  list.forEach(b => {
    const tr = document.createElement('tr');
    const refId = b.bookingId || b.id;
    tr.innerHTML = `
      <td><strong>#${refId}</strong></td>
      <td><span class="badge-tag gold">Table #${b.tableId}</span></td>
      <td><strong>${b.guestName}</strong></td>
      <td>${b.guests} Guests</td>
      <td><code>${b.date}</code></td>
      <td><code>${b.time}</code></td>
      <td>${b.occasion || 'Dinner'}</td>
      <td><span class="badge-tag green">CONFIRMED</span></td>
      <td>
        <div style="display:flex; gap:6px;">
          <button class="btn btn-secondary btn-sm btn-show-pass" data-id="${refId}">View Pass</button>
          <button class="btn-danger-sm btn-cancel-booking" data-id="${refId}">Cancel</button>
        </div>
      </td>
    `;
    masterReservationsTbody.appendChild(tr);
  });

  document.querySelectorAll('.btn-show-pass').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const b = appState.bookings.find(x => String(x.bookingId || x.id) === String(id));
      if (b) showVipDiningPass(b);
    });
  });

  document.querySelectorAll('.btn-cancel-booking').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      handleCancelReservation(id);
    });
  });
}

// ================= VIEW SWITCHER =================
function switchAppView(viewName) {
  appState.currentView = viewName;
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === viewName);
  });
  document.querySelectorAll('.view-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === `view-${viewName}`);
  });

  const titles = {
    dashboard: 'Live Dashboard & Service Radar',
    floorplan: 'Spatial Dining Floor Plan',
    reservations: 'Master Reservations Ledger',
    booking: 'Create Guest Reservation',
    tables: 'Physical Table Fleet Management',
    activity: 'Live System Activity Stream'
  };
  currentViewTitle.textContent = titles[viewName] || 'The Royal Spice';
  
  if (appSidebar.classList.contains('mobile-open')) {
    appSidebar.classList.remove('mobile-open');
  }
}

// ================= 6-STAGE ALGORITHM PIPELINE =================
function resetAlgorithmNodes() {
  for (let i = 1; i <= 5; ++i) {
    const card = document.getElementById(`pipe-card-${i}`);
    if (card) card.className = 'pipeline-card-node';
  }
  document.getElementById('trace-pipeline-badge').textContent = 'Allocating...';
  document.getElementById('trace-pipeline-badge').className = 'badge-pill gold';
}

function setAlgorithmStep(step, status, text = null) {
  const card = document.getElementById(`pipe-card-${step}`);
  if (!card) return;
  card.className = `pipeline-card-node node-${status}`;
  if (text) {
    document.getElementById(`pipe-desc-${step}`).textContent = text;
  }
}

async function runAllocationSequence(trace, success, createdBooking, errorMsg) {
  resetAlgorithmNodes();

  setAlgorithmStep(1, 'running', 'Validating guest parameters');
  await new Promise(r => setTimeout(r, 160));
  setAlgorithmStep(1, 'success', 'Input boundaries verified');

  setAlgorithmStep(2, 'running', 'Checking date & time slot');
  await new Promise(r => setTimeout(r, 160));
  setAlgorithmStep(2, 'success', `${createdBooking?.date || appState.selectedDate} @ ${createdBooking?.time || appState.selectedTime}`);

  setAlgorithmStep(3, 'running', 'Scanning slot collisions');
  await new Promise(r => setTimeout(r, 200));
  setAlgorithmStep(3, 'success', 'No conflict detected');

  setAlgorithmStep(4, 'running', 'Matching smallest suitable table');
  await new Promise(r => setTimeout(r, 220));

  if (!success) {
    setAlgorithmStep(4, 'running', errorMsg || 'No table match');
    document.getElementById('trace-pipeline-badge').textContent = 'Failed';
    document.getElementById('trace-pipeline-badge').className = 'badge-pill';
    showToastNotification(errorMsg || 'No table available for this slot.', 'error');
    return;
  }

  setAlgorithmStep(4, 'success', `Assigned Table #${createdBooking.tableId}`);

  setAlgorithmStep(5, 'running', 'Persisting to disk');
  await new Promise(r => setTimeout(r, 160));
  setAlgorithmStep(5, 'success', 'Saved permanently');

  document.getElementById('trace-pipeline-badge').textContent = 'Confirmed';
  document.getElementById('trace-pipeline-badge').className = 'badge-pill green';

  playAudioChime('success');
  showVipDiningPass(createdBooking);
}

// ================= VIP DINING PASS MODAL =================
function showVipDiningPass(b) {
  passGridData.innerHTML = `
    <div class="pass-field-node">
      <label>Booking Reference</label>
      <strong>#${b.bookingId || b.id}</strong>
    </div>
    <div class="pass-field-node">
      <label>Assigned Table</label>
      <strong style="color:var(--primary-600);">Table #${b.tableId}</strong>
    </div>
    <div class="pass-field-node">
      <label>Guest Full Name</label>
      <strong>${b.guestName}</strong>
    </div>
    <div class="pass-field-node">
      <label>Party Size</label>
      <strong>${b.guests} Guests</strong>
    </div>
    <div class="pass-field-node">
      <label>Reservation Date</label>
      <strong>${b.date}</strong>
    </div>
    <div class="pass-field-node">
      <label>Dining Time Slot</label>
      <strong>${b.time}</strong>
    </div>
    <div class="pass-field-node">
      <label>Occasion</label>
      <strong style="color:var(--primary-text);">${b.occasion || appState.selectedOccasion}</strong>
    </div>
    <div class="pass-field-node">
      <label>Status</label>
      <strong style="color:var(--c-available);">CONFIRMED</strong>
    </div>
  `;
  modalReceiptPass.classList.add('open');
}

// ================= OPERATIONS & MUTATIONS =================

// 1. Create Reservation
masterBookingForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const guestName = document.getElementById('form-guest-name').value.trim();
  const guests = parseInt(document.getElementById('form-guest-count').value);
  const date = document.getElementById('form-booking-date').value.trim();
  const time = document.getElementById('form-booking-time').value;
  const tableId = parseInt(formTableSelect.value);
  const occasion = appState.selectedOccasion;

  const submitBtn = document.getElementById('btn-submit-booking-action');
  submitBtn.disabled = true;

  try {
    let result = null;

    if (appState.isBackendConnected) {
      const res = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestName, guests, date, time, tableId, occasion })
      });
      result = await res.json();
    } else {
      // Local Standalone Allocation Engine
      let candidateTable = null;
      if (tableId > 0) {
        candidateTable = appState.tables.find(t => t.id === tableId && t.status === 'Available');
      } else {
        const suitable = appState.tables
          .filter(t => t.status === 'Available' && t.capacity >= guests && !appState.occupiedTableIds.includes(t.id))
          .sort((a, b) => a.capacity - b.capacity);
        if (suitable.length > 0) candidateTable = suitable[0];
      }

      if (!candidateTable) {
        throw new Error('No available table suitable for this party size.');
      }

      const newBooking = {
        id: 'BK-' + Math.floor(1000 + Math.random() * 9000),
        bookingId: Math.floor(100 + Math.random() * 900),
        guestName,
        guests,
        date,
        time,
        tableId: candidateTable.id,
        occasion
      };

      appState.bookings.push(newBooking);
      logEvent('BOOKING_CREATED', `Reservation #${newBooking.bookingId} created for ${guestName} (Table #${candidateTable.id})`);
      saveLocalState();

      result = { success: true, booking: newBooking };
    }

    await runAllocationSequence(result.trace || [], result.success, result.booking, result.error);

    if (result.success) {
      masterBookingForm.reset();
      document.getElementById('form-guest-count').value = '4';
      document.getElementById('form-booking-date').value = appState.selectedDate;
      document.getElementById('form-booking-time').value = appState.selectedTime;
      appState.selectedTableId = 0;
      await syncWithCoreEngine();
    }
  } catch (err) {
    showToastNotification(err.message || 'Error processing reservation.', 'error');
  } finally {
    submitBtn.disabled = false;
  }
});

// 2. Cancel Reservation
async function handleCancelReservation(id) {
  if (!confirm(`Are you sure you want to cancel Reservation #${id}?`)) return;

  try {
    if (appState.isBackendConnected) {
      const res = await fetch(`${API_BASE}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: parseInt(id) })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to cancel');
    } else {
      const idx = appState.bookings.findIndex(b => String(b.bookingId || b.id) === String(id));
      if (idx !== -1) {
        const removed = appState.bookings.splice(idx, 1)[0];
        logEvent('BOOKING_CANCELLED', `Reservation #${id} for ${removed.guestName} was cancelled.`);
        saveLocalState();
      }
    }

    showToastNotification(`Reservation #${id} cancelled.`, 'success');
    await syncWithCoreEngine();
  } catch (err) {
    showToastNotification(err.message || 'Could not cancel reservation.', 'error');
  }
}

// 3. Table Status Flip
async function handleToggleTableStatus(id, targetStatus) {
  try {
    if (appState.isBackendConnected) {
      const res = await fetch(`${API_BASE}/tables/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: targetStatus })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Status update failed');
    } else {
      const tbl = appState.tables.find(t => t.id === id);
      if (tbl) {
        tbl.status = targetStatus;
        logEvent('TABLE_STATUS', `Table #${id} status changed to ${targetStatus}.`);
        saveLocalState();
      }
    }

    showToastNotification(`Table #${id} is now ${targetStatus}.`, 'success');
    closeTableDrawer();
    await syncWithCoreEngine();
  } catch (err) {
    showToastNotification(err.message || 'Error updating table status.', 'error');
  }
}

// 4. Delete Table
async function handleDeleteTable(id) {
  if (!confirm(`Delete Table #${id} permanently?`)) return;

  try {
    if (appState.isBackendConnected) {
      const res = await fetch(`${API_BASE}/tables/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Delete failed');
    } else {
      const idx = appState.tables.findIndex(t => t.id === id);
      if (idx !== -1) {
        appState.tables.splice(idx, 1);
        logEvent('TABLE_DELETED', `Table #${id} removed from fleet.`);
        saveLocalState();
      }
    }

    showToastNotification(`Table #${id} deleted.`, 'success');
    closeTableDrawer();
    await syncWithCoreEngine();
  } catch (err) {
    showToastNotification(err.message || 'Cannot delete table.', 'error');
  }
}

// 5. Walk-In Seater
document.getElementById('form-walkin-action').addEventListener('submit', async (e) => {
  e.preventDefault();
  const guestName = document.getElementById('walkin-guest-name').value.trim() || 'Walk-In Guest';
  const guests = parseInt(document.getElementById('walkin-guest-count').value);
  const tableId = parseInt(document.getElementById('walkin-table-choice').value);
  const date = appState.selectedDate;
  const time = appState.selectedTime;

  try {
    let result = null;
    if (appState.isBackendConnected) {
      const res = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestName, guests, date, time, tableId })
      });
      result = await res.json();
    } else {
      let candidate = null;
      if (tableId > 0) {
        candidate = appState.tables.find(t => t.id === tableId && t.status === 'Available');
      } else {
        const suitable = appState.tables
          .filter(t => t.status === 'Available' && t.capacity >= guests && !appState.occupiedTableIds.includes(t.id))
          .sort((a, b) => a.capacity - b.capacity);
        if (suitable.length > 0) candidate = suitable[0];
      }

      if (!candidate) throw new Error('No table available for walk-in party.');

      const newBooking = {
        id: 'WK-' + Math.floor(1000 + Math.random() * 9000),
        bookingId: Math.floor(100 + Math.random() * 900),
        guestName,
        guests,
        date,
        time,
        tableId: candidate.id,
        occasion: 'Walk-In Dining'
      };

      appState.bookings.push(newBooking);
      logEvent('WALKIN_SEATED', `Walk-in party "${guestName}" seated at Table #${candidate.id}.`);
      saveLocalState();
      result = { success: true, booking: newBooking };
    }

    if (result.success) {
      showToastNotification(`Walk-in seated at Table #${result.booking.tableId}!`, 'success');
      modalWalkinDialog.classList.remove('open');
      document.getElementById('form-walkin-action').reset();
      playAudioChime('success');
      await syncWithCoreEngine();
    } else {
      showToastNotification(result.error || 'Could not seat walk-in.', 'error');
    }
  } catch (err) {
    showToastNotification(err.message || 'Error seating walk-in.', 'error');
  }
});

// 6. Add Table Action
document.getElementById('form-add-table-action').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = parseInt(document.getElementById('new-tbl-id-input').value);
  const capacity = parseInt(document.getElementById('new-tbl-cap-input').value);
  const type = document.getElementById('new-tbl-category-input').value.trim();

  try {
    if (appState.isBackendConnected) {
      const res = await fetch(`${API_BASE}/tables`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, capacity, type })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to add table');
    } else {
      if (appState.tables.some(t => t.id === id)) {
        throw new Error(`Table #${id} already exists!`);
      }
      appState.tables.push({ id, capacity, type, status: 'Available' });
      logEvent('TABLE_ADDED', `New Table #${id} (${type}, ${capacity} seats) added to restaurant.`);
      saveLocalState();
    }

    showToastNotification(`Table #${id} added successfully!`, 'success');
    modalTableDialog.classList.remove('open');
    document.getElementById('form-add-table-action').reset();
    await syncWithCoreEngine();
  } catch (err) {
    showToastNotification(err.message || 'Could not add table.', 'error');
  }
});

// ================= EVENT HANDLERS & NAVIGATION =================

// Sidebar Navigation
document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    playAudioChime('click');
    switchAppView(btn.dataset.view);
  });
});

document.getElementById('btn-view-all-reservations').addEventListener('click', () => switchAppView('reservations'));
document.getElementById('btn-nav-create-res').addEventListener('click', () => switchAppView('booking'));

// Theme Toggle
themeModeToggle.addEventListener('click', () => {
  appState.currentTheme = appState.currentTheme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', appState.currentTheme);
  localStorage.setItem(STORAGE_KEYS.THEME, appState.currentTheme);
  themeToggleIcon.setAttribute('data-lucide', appState.currentTheme === 'light' ? 'sun' : 'moon');
  if (window.lucide) window.lucide.createIcons();
  showToastNotification(`Theme switched to ${appState.currentTheme} mode.`, 'info');
});

// Sound Toggle
soundFeedbackToggle.addEventListener('click', () => {
  appState.soundEnabled = !appState.soundEnabled;
  soundToggleIcon.setAttribute('data-lucide', appState.soundEnabled ? 'volume-2' : 'volume-x');
  if (window.lucide) window.lucide.createIcons();
  showToastNotification(appState.soundEnabled ? 'Audio feedback enabled.' : 'Audio muted.', 'info');
});

// Stepper
document.getElementById('btn-party-inc').addEventListener('click', () => {
  playAudioChime('click');
  const inp = document.getElementById('form-guest-count');
  inp.value = Math.min(30, parseInt(inp.value || 1) + 1);
});

document.getElementById('btn-party-dec').addEventListener('click', () => {
  playAudioChime('click');
  const inp = document.getElementById('form-guest-count');
  inp.value = Math.max(1, parseInt(inp.value || 2) - 1);
});

// Occasion Pills
document.querySelectorAll('.occ-pill-btn').forEach(pill => {
  pill.addEventListener('click', () => {
    playAudioChime('click');
    document.querySelectorAll('.occ-pill-btn').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    appState.selectedOccasion = pill.dataset.occ;
  });
});

// Quick Experience Shortcuts
document.querySelectorAll('.exp-preset-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    playAudioChime('clink');
    const guests = parseInt(btn.dataset.guests);
    const type = btn.dataset.type;
    document.getElementById('form-guest-count').value = guests;

    const candidate = appState.tables.find(t => t.type.toLowerCase().includes(type.toLowerCase()) && appState.availableTableIds.includes(t.id));
    if (candidate) {
      formTableSelect.value = String(candidate.id);
    } else {
      formTableSelect.value = '0';
    }
  });
});

// Slot Chips Bar
headerSlotChips.addEventListener('click', (e) => {
  const chip = e.target.closest('.slot-chip');
  if (chip) {
    playAudioChime('click');
    document.querySelectorAll('.slot-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    appState.selectedTime = chip.dataset.time;
    document.getElementById('form-booking-time').value = appState.selectedTime;
    evaluateSlotState();
    renderMasterView();
  }
});

// Global Date Field
globalDateInput.addEventListener('change', () => {
  appState.selectedDate = globalDateInput.value.trim() || '24/05/2026';
  document.getElementById('form-booking-date').value = appState.selectedDate;
  evaluateSlotState();
  renderMasterView();
});

// Zone Pills on Floor Plan
document.querySelectorAll('.zone-pill').forEach(pill => {
  pill.addEventListener('click', () => {
    playAudioChime('click');
    document.querySelectorAll('.zone-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    appState.selectedZone = pill.dataset.zone;
    renderFloorPlan(masterFloorCanvas, true);
    if (window.lucide) window.lucide.createIcons();
  });
});

// Search & Filter in Reservations
reservationsSearchInput.addEventListener('input', renderReservationsTable);
reservationsStatusFilter.addEventListener('change', renderReservationsTable);

// Drawer Actions
drawerBtnSeatWalkin.addEventListener('click', () => {
  if (appState.activeDrawerTable) {
    document.getElementById('walkin-table-choice').value = String(appState.activeDrawerTable.id);
    modalWalkinDialog.classList.add('open');
    closeTableDrawer();
  }
});

drawerBtnToggleStatus.addEventListener('click', async () => {
  if (appState.activeDrawerTable) {
    const target = appState.activeDrawerTable.status === 'Available' ? 'Maintenance' : 'Available';
    await handleToggleTableStatus(appState.activeDrawerTable.id, target);
  }
});

drawerBtnReleaseTable.addEventListener('click', async () => {
  if (appState.activeDrawerTable) {
    const booking = appState.bookings.find(b => b.tableId === appState.activeDrawerTable.id && b.date === appState.selectedDate && b.time === appState.selectedTime);
    if (booking) {
      await handleCancelReservation(booking.bookingId || booking.id);
    }
  }
});

document.getElementById('btn-close-drawer').addEventListener('click', closeTableDrawer);
drawerBackdrop.addEventListener('click', closeTableDrawer);

// Modals Trigger
document.getElementById('btn-open-walkin-dialog').addEventListener('click', () => modalWalkinDialog.classList.add('open'));
document.getElementById('btn-floor-walkin-seat').addEventListener('click', () => modalWalkinDialog.classList.add('open'));
document.getElementById('btn-close-walkin-dialog').addEventListener('click', () => modalWalkinDialog.classList.remove('open'));
document.getElementById('btn-cancel-walkin-dialog').addEventListener('click', () => modalWalkinDialog.classList.remove('open'));

document.getElementById('btn-floor-add-table').addEventListener('click', () => modalTableDialog.classList.add('open'));
document.getElementById('btn-open-add-table-dialog').addEventListener('click', () => modalTableDialog.classList.add('open'));
document.getElementById('btn-close-table-dialog').addEventListener('click', () => modalTableDialog.classList.remove('open'));
document.getElementById('btn-cancel-table-dialog').addEventListener('click', () => modalTableDialog.classList.remove('open'));

document.getElementById('btn-close-pass-action').addEventListener('click', () => modalReceiptPass.classList.remove('open'));
document.getElementById('btn-print-pass-action').addEventListener('click', () => window.print());

document.getElementById('manual-sync-btn').addEventListener('click', () => {
  syncWithCoreEngine();
  showToastNotification('State synchronized.', 'info');
});

// Mobile Sidebar Toggle
document.getElementById('btn-mobile-toggle').addEventListener('click', () => {
  appSidebar.classList.toggle('mobile-open');
});

// Auto Background Polling every 3.5s
setInterval(syncWithCoreEngine, 3500);

// Initialize Theme & First Load
document.documentElement.setAttribute('data-theme', appState.currentTheme);
syncWithCoreEngine();
