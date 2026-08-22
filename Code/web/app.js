// ==========================================================================
// THE ROYAL SPICE 3.0+ — MASTER RESTAURANT MANAGEMENT CONTROLLER
// Features: 3D Spatial Canvas, AI Sommelier Concierge, 5 Themes, Visual Menu & CRM
// ==========================================================================

const API_BASE = 'http://localhost:8080/api';

const STORAGE_KEYS = {
  TABLES: 'royal_spice_tables',
  BOOKINGS: 'royal_spice_bookings',
  ACTIVITY: 'royal_spice_activity',
  THEME: 'royal_spice_theme',
  SOUND: 'royal_spice_sound',
  AI_CHAT: 'royal_spice_ai_chat'
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

// Seed Visual Photo Menu
const DEFAULT_MENU_ITEMS = [
  { id: 1, title: 'Truffle Infused Wagyu Ribeye', category: 'Steaks', price: '$115', desc: 'A5 Miyazaki Wagyu, black winter truffle jus, bone marrow purée.', img: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80', tags: ['GF', 'Signature', 'Pairing: Bordeaux 2018'] },
  { id: 2, title: 'Imperial Beluga Caviar Tartlet', category: 'Starters', price: '$85', desc: 'Crème fraîche, crispy shallot croustade, 24k gold leaf.', img: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500&auto=format&fit=crop&q=80', tags: ['Raw', 'Luxury', 'Pairing: Dom Pérignon'] },
  { id: 3, title: 'Wild Pan-Seared Chilean Sea Bass', category: 'Mains', price: '$78', desc: 'Saffron beurre blanc, compressed baby leeks, finger lime pearls.', img: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500&auto=format&fit=crop&q=80', tags: ['GF', 'Seafood', 'Pairing: Chablis Premier Cru'] },
  { id: 4, title: 'Smoked Valrhona Dark Chocolate Sphere', category: 'Desserts', price: '$34', desc: 'Salted caramel core, warm bourbon espresso ganache poured tableside.', img: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500&auto=format&fit=crop&q=80', tags: ['Vegetarian', 'Pairing: Tawny Port 20yr'] },
  { id: 5, title: 'Château Margaux Grand Cru 2015', category: 'Cellar', price: '$650', desc: 'Velvety tannins, notes of cassis, violets, and cedarwood.', img: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=500&auto=format&fit=crop&q=80', tags: ['Vintage', 'Sommelier Reserve'] },
  { id: 6, title: 'Hokkaido Scallop Carpaccio', category: 'Starters', price: '$42', desc: 'Yuzu vinaigrette, shaved white truffle, micro shiso.', img: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=500&auto=format&fit=crop&q=80', tags: ['GF', 'Pairing: Sancerre Blanc'] }
];

// Seed VIP Guests
const DEFAULT_VIP_GUESTS = [
  { name: 'Lord Sterling & Lady Evelyn', tier: 'Royal Imperial Tier', visits: 18, spend: '$14,200', pref: 'Table #3 (VIP Suite)', notes: 'Nut allergy; prefers Château Margaux uncorked 30 mins early.' },
  { name: 'Dr. Sarah Jenkins', tier: 'Gold Connoisseur', visits: 9, spend: '$5,840', pref: 'Table #1 (Couples Alcove)', notes: 'Anniversary celebration on 24 May; window view.' },
  { name: 'Marcus Vance (Vance Capital)', tier: 'Executive Black Card', visits: 24, spend: '$28,900', pref: 'Table #4 (Grand Banquet)', notes: 'Private business dinners; discrete host billing.' }
];

// Master Application State
const appState = {
  currentView: 'dashboard',
  currentTheme: localStorage.getItem(STORAGE_KEYS.THEME) || 'obsidian',
  soundEnabled: localStorage.getItem(STORAGE_KEYS.SOUND) !== 'false',
  isEditLayoutMode: false,
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
  camera3D: { tilt: 40, orbit: -20, zoom: 0.95, isIsometric: true },
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
const themeSelector = document.getElementById('theme-selector');
const soundFeedbackToggle = document.getElementById('sound-feedback-toggle');
const soundIconWrap = document.getElementById('sound-icon-wrap');
const soundStatusDot = document.getElementById('sound-status-dot');

// Metrics
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

// Canvases
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

// Drawers & Modals
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

const aiConciergeDrawer = document.getElementById('ai-concierge-drawer');
const aiDrawerBackdrop = document.getElementById('ai-drawer-backdrop');
const modalWalkinDialog = document.getElementById('modal-walkin-dialog');
const modalTableDialog = document.getElementById('modal-table-dialog');
const modalReceiptPass = document.getElementById('modal-receipt-pass');
const modalHostManifest = document.getElementById('modal-host-manifest');
const toastStream = document.getElementById('toast-stream');

// ================= WEB AUDIO SYNTHESIZER =================
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) audioCtx = new AudioContext();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playAudioChime(type) {
  if (!appState.soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'success') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.08);
      osc.frequency.setValueAtTime(783.99, now + 0.16);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    }
  } catch {
    // Graceful fallback
  }
}

// ================= TOAST NOTIFICATIONS =================
function showToastNotification(message, type = 'info') {
  if (!toastStream) return;
  const alert = document.createElement('div');
  alert.className = `toast-alert ${type}`;
  alert.textContent = message;
  toastStream.appendChild(alert);
  setTimeout(() => {
    alert.style.opacity = '0';
    setTimeout(() => alert.remove(), 250);
  }, 3200);
}

// ================= 5 LUXURY THEMES =================
function applyLuxuryTheme(themeName) {
  appState.currentTheme = themeName;
  document.documentElement.setAttribute('data-theme', themeName);
  localStorage.setItem(STORAGE_KEYS.THEME, themeName);
  if (themeSelector) themeSelector.value = themeName;
  showToastNotification(`Theme: ${themeName.toUpperCase()}`, 'info');
}

function updateSoundToggleUI() {
  if (!soundFeedbackToggle || !soundIconWrap) return;
  if (appState.soundEnabled) {
    soundFeedbackToggle.classList.add('sound-active');
    soundFeedbackToggle.classList.remove('sound-muted');
    soundFeedbackToggle.title = 'Audio Feedback: ON (Click to Mute)';
    soundIconWrap.innerHTML = '<i data-lucide="volume-2"></i>';
    if (soundStatusDot) soundStatusDot.className = 'sound-status-dot active';
  } else {
    soundFeedbackToggle.classList.remove('sound-active');
    soundFeedbackToggle.classList.add('sound-muted');
    soundFeedbackToggle.title = 'Audio Feedback: MUTED (Click to Enable)';
    soundIconWrap.innerHTML = '<i data-lucide="volume-x"></i>';
    if (soundStatusDot) soundStatusDot.className = 'sound-status-dot muted';
  }
  if (window.lucide) window.lucide.createIcons();
}

// ================= NAVIGATION =================
function switchAppView(viewName) {
  playAudioChime('click');
  appState.currentView = viewName;

  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === viewName);
  });

  document.querySelectorAll('.view-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === `view-${viewName}`);
  });

  const titles = {
    dashboard: 'Live Operations Dashboard',
    floorplan: '3D Spatial Floor Plan & Table Command',
    reservations: 'Master Reservations Ledger',
    booking: 'Smart Reservation Allocation',
    menu: 'Michelin 3-Star Visual Dish Menu',
    crm: 'VIP Guest CRM & Loyalty Profiles',
    tables: 'Physical Table Fleet Management',
    activity: 'System Operational Event Log'
  };
  if (currentViewTitle) currentViewTitle.textContent = titles[viewName] || 'The Royal Spice';

  if (viewName === 'menu') renderVisualMenu('ALL');
  if (viewName === 'crm') renderVIPGuests();
  if (viewName === 'floorplan') renderFloorPlan(masterFloorCanvas, true);

  if (window.innerWidth <= 1024) {
    appSidebar.classList.remove('mobile-open');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (backdrop) backdrop.classList.remove('active');
  }
}

// ================= 3D CAMERA CONTROLLER =================
function update3DFloorTransform() {
  if (!masterFloorCanvas) return;
  const { tilt, orbit, zoom, isIsometric } = appState.camera3D;
  if (isIsometric) {
    masterFloorCanvas.style.transform = `rotateX(${tilt}deg) rotateZ(${orbit}deg) scale(${zoom})`;
  } else {
    masterFloorCanvas.style.transform = `rotateX(0deg) rotateZ(0deg) scale(${zoom})`;
  }
}

// ================= VISUAL DISH MENU & CRM =================
function renderVisualMenu(cat) {
  const container = document.getElementById('dish-cards-grid');
  if (!container) return;
  container.innerHTML = '';

  const filtered = cat === 'ALL' ? DEFAULT_MENU_ITEMS : DEFAULT_MENU_ITEMS.filter(d => d.category === cat);
  filtered.forEach(dish => {
    const card = document.createElement('div');
    card.className = 'dish-card';
    card.innerHTML = `
      <img src="${dish.img}" class="dish-card-img" alt="${dish.title}" loading="lazy">
      <div class="dish-card-body">
        <div class="dish-header-row">
          <h4 class="dish-title">${dish.title}</h4>
          <span class="dish-price">${dish.price}</span>
        </div>
        <p class="dish-desc">${dish.desc}</p>
        <div class="dish-tags">
          ${dish.tags.map(t => `<span class="dish-tag">${t}</span>`).join('')}
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderVIPGuests() {
  const container = document.getElementById('crm-guest-grid');
  if (!container) return;
  container.innerHTML = '';

  DEFAULT_VIP_GUESTS.forEach(g => {
    const card = document.createElement('div');
    card.className = 'crm-card';
    card.innerHTML = `
      <div class="crm-card-header">
        <div class="crm-avatar">${g.name[0]}</div>
        <div>
          <strong>${g.name}</strong>
          <div><span class="crm-tier-tag">${g.tier}</span></div>
        </div>
      </div>
      <p style="font-size:12px; color:var(--text-muted);">${g.notes}</p>
      <div class="crm-stats-grid">
        <div><small>Total Visits:</small> <strong>${g.visits}</strong></div>
        <div><small>Lifetime Spend:</small> <strong style="color:var(--primary-500);">${g.spend}</strong></div>
        <div style="grid-column: span 2;"><small>Preferred Seating:</small> <strong>${g.pref}</strong></div>
      </div>
    `;
    container.appendChild(card);
  });
}

// ================= AI CONCIERGE & SOMMELIER BOT =================
function handleAIChatSubmit(userText) {
  if (!userText.trim()) return;
  const chatMessages = document.getElementById('ai-chat-messages');
  if (!chatMessages) return;

  // Render User Message
  const userRow = document.createElement('div');
  userRow.className = 'ai-msg user';
  userRow.innerHTML = `<div class="msg-bubble">${userText}</div>`;
  chatMessages.appendChild(userRow);

  // Assistant Response Logic
  setTimeout(() => {
    let reply = "I am at your service. Let me arrange this for dinner service immediately.";
    const lower = userText.toLowerCase();

    if (lower.includes('wine') || lower.includes('pairing')) {
      reply = "🍷 **Sommelier Pairing:** For Wagyu Ribeye, I highly recommend our **Château Margaux 2015 Grand Cru** or a bold **Napa Valley Cabernet Sauvignon 2018** to harmonize with the rich marbling.";
    } else if (lower.includes('vip') || lower.includes('suite')) {
      reply = "👑 **Table Allocation:** Table #3 (VIP Imperial Suite, 6 seats) is available for tonight's 8:00 PM shift. Would you like me to reserve it?";
    } else if (lower.includes('book') || lower.includes('reserve')) {
      reply = "⚡ **Instant Booking Confirmed:** I have staged Table #3 for 4 guests tonight at 8:00 PM under VIP Concierge priority. Official Dining Pass generated!";
      playAudioChime('success');
    }

    const botRow = document.createElement('div');
    botRow.className = 'ai-msg bot';
    botRow.innerHTML = `
      <div class="msg-avatar">⚜️</div>
      <div class="msg-bubble">
        <strong>Chef Auguste</strong>
        <p>${reply}</p>
      </div>
    `;
    chatMessages.appendChild(botRow);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }, 600);
}

// ================= CORE DATA ENGINE & EVALUATION =================
function evaluateSlotState() {
  const slotBookings = appState.bookings.filter(b => b.date === appState.selectedDate && b.time === appState.selectedTime && b.status !== 'Cancelled');
  appState.occupiedTableIds = slotBookings.map(b => b.tableId);
  appState.availableTableIds = appState.tables
    .filter(t => t.status === 'Available' && !appState.occupiedTableIds.includes(t.id))
    .map(t => t.id);

  let seatedCovers = 0;
  slotBookings.forEach(b => {
    if (b.status === 'Seated' || b.status === 'Confirmed') seatedCovers += parseInt(b.guests || 2);
  });

  if (metricAvailableTables) metricAvailableTables.textContent = appState.availableTableIds.length;
  if (metricTotalTablesDenom) metricTotalTablesDenom.textContent = `/ ${appState.tables.length} Fleet`;
  if (metricSeatedCovers) metricSeatedCovers.textContent = seatedCovers;
  if (metricTotalBookingsCount) metricTotalBookingsCount.textContent = slotBookings.length;
  if (metricSlotBookingsTag) metricSlotBookingsTag.textContent = `Slot: ${appState.selectedTime}`;
  if (metricEstRevenue) metricEstRevenue.textContent = `$${(seatedCovers * 85).toLocaleString()}`;
  if (navOpenTablesPill) navOpenTablesPill.textContent = `${appState.availableTableIds.length} Open`;
  if (navBookingsPill) navBookingsPill.textContent = String(appState.bookings.length);
  if (miniSeatedCount) miniSeatedCount.textContent = seatedCovers;
  if (miniUpcomingCount) miniUpcomingCount.textContent = slotBookings.length;
}

// ================= RENDER FLOOR PLAN & TABLE CARDS =================
function renderFloorPlan(canvasElement, isMaster = false) {
  if (!canvasElement) return;
  canvasElement.innerHTML = '';

  appState.tables.forEach(tbl => {
    let liveStatus = tbl.status;
    const booking = appState.bookings.find(b => b.tableId === tbl.id && b.date === appState.selectedDate && b.time === appState.selectedTime && b.status !== 'Cancelled');

    if (tbl.status === 'Maintenance') liveStatus = 'Maintenance';
    else if (booking) liveStatus = booking.status === 'Seated' ? 'Seated' : 'Reserved';

    const card = document.createElement('div');
    card.className = `table-node-fixture status-${liveStatus.toLowerCase()}`;
    card.innerHTML = `
      <div class="tbl-node-header">
        <strong>Table #${tbl.id}</strong>
        <span class="tbl-node-badge" style="background:var(--c-${liveStatus.toLowerCase()}-bg, rgba(255,255,255,0.1)); color:var(--c-${liveStatus.toLowerCase()});">${liveStatus}</span>
      </div>
      <div class="tbl-node-body">
        <div>Capacity: <strong>${tbl.capacity} Guests</strong></div>
        <div>Zone: <strong>${tbl.type}</strong></div>
        ${booking ? `<div style="margin-top:6px; color:var(--primary-500); font-weight:700;">★ ${booking.name}</div>` : ''}
      </div>
    `;

    card.addEventListener('click', () => {
      playAudioChime('click');
      openTableDrawer(tbl, booking, liveStatus);
    });

    canvasElement.appendChild(card);
  });
}

function openTableDrawer(table, booking, status) {
  appState.activeDrawerTable = table;
  drawerTableHeading.textContent = `Table #T-0${table.id}`;
  drawerStatusBadge.textContent = status;
  drawerTableCapacity.textContent = `${table.capacity} Guests`;
  drawerTableCategory.textContent = table.type;
  drawerTableSlot.textContent = appState.selectedTime;

  if (booking) {
    drawerBookingSection.style.display = 'block';
    drawerGuestName.textContent = booking.name;
    drawerBookingId.textContent = String(booking.id || 'RES-' + table.id);
    drawerPartySize.textContent = `${booking.guests} Guests`;
    drawerOccasion.textContent = booking.occasion || 'Dining';
    drawerBtnReleaseTable.style.display = 'block';
  } else {
    drawerBookingSection.style.display = 'none';
    drawerBtnReleaseTable.style.display = 'none';
  }

  tableContextDrawer.classList.add('open');
  drawerBackdrop.classList.add('active');
}

function closeTableDrawer() {
  tableContextDrawer.classList.remove('open');
  drawerBackdrop.classList.remove('active');
}

// ================= PERSISTENCE & C++ ENGINE SYNC =================
async function syncWithCoreEngine() {
  try {
    const res = await fetch(`${API_BASE}/tables`, { signal: AbortSignal.timeout(1800) });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        appState.tables = data;
        localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(appState.tables));
        appState.isBackendConnected = true;
      }
    }
  } catch {
    appState.isBackendConnected = false;
  }

  if (coreSyncIndicator) {
    const dot = coreSyncIndicator.querySelector('.sync-dot');
    const lbl = coreSyncIndicator.querySelector('.sync-label');
    if (appState.isBackendConnected) {
      dot.style.background = 'var(--c-available)';
      lbl.textContent = 'C++ Live';
    } else {
      dot.style.background = 'var(--primary-500)';
      lbl.textContent = 'Local Standalone';
    }
  }

  evaluateSlotState();
  renderFloorPlan(dashboardFloorPreview, false);
  renderFloorPlan(masterFloorCanvas, true);
}

// ================= EVENT HANDLERS =================

// Navigation
document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => switchAppView(btn.dataset.view));
});

// Sidebar Responsive Toggle
document.getElementById('btn-mobile-toggle').addEventListener('click', () => {
  playAudioChime('click');
  if (window.innerWidth <= 1024) {
    appSidebar.classList.toggle('mobile-open');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (backdrop) backdrop.classList.toggle('active', appSidebar.classList.contains('mobile-open'));
  } else {
    document.getElementById('app-layout').classList.toggle('sidebar-collapsed');
  }
});

// Theme Selector
themeSelector.addEventListener('change', (e) => applyLuxuryTheme(e.target.value));

// Sound Toggle
soundFeedbackToggle.addEventListener('click', () => {
  appState.soundEnabled = !appState.soundEnabled;
  localStorage.setItem(STORAGE_KEYS.SOUND, appState.soundEnabled ? 'true' : 'false');
  updateSoundToggleUI();
  if (appState.soundEnabled) {
    playAudioChime('success');
    showToastNotification('Audio feedback ENABLED.', 'success');
  } else {
    showToastNotification('Audio feedback MUTED.', 'info');
  }
});

// 3D Camera Controls
document.getElementById('btn-toggle-3d-mode').addEventListener('click', () => {
  playAudioChime('click');
  appState.camera3D.isIsometric = !appState.camera3D.isIsometric;
  document.getElementById('btn-3d-label').textContent = appState.camera3D.isIsometric ? 'Isometric 3D' : 'Flat 2D Blueprint';
  update3DFloorTransform();
});
document.getElementById('btn-floor-orbit-left').addEventListener('click', () => { appState.camera3D.orbit -= 15; update3DFloorTransform(); });
document.getElementById('btn-floor-orbit-right').addEventListener('click', () => { appState.camera3D.orbit += 15; update3DFloorTransform(); });
document.getElementById('btn-floor-zoom-in').addEventListener('click', () => { appState.camera3D.zoom = Math.min(1.4, appState.camera3D.zoom + 0.1); update3DFloorTransform(); });
document.getElementById('btn-floor-zoom-out').addEventListener('click', () => { appState.camera3D.zoom = Math.max(0.6, appState.camera3D.zoom - 0.1); update3DFloorTransform(); });

// AI Concierge
document.getElementById('btn-open-ai-concierge').addEventListener('click', () => {
  playAudioChime('click');
  aiConciergeDrawer.classList.add('open');
  aiDrawerBackdrop.classList.add('active');
});
document.getElementById('btn-close-ai-concierge').addEventListener('click', () => {
  aiConciergeDrawer.classList.remove('open');
  aiDrawerBackdrop.classList.remove('active');
});
aiDrawerBackdrop.addEventListener('click', () => {
  aiConciergeDrawer.classList.remove('open');
  aiDrawerBackdrop.classList.remove('active');
});

document.getElementById('ai-chat-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const input = document.getElementById('ai-chat-input');
  handleAIChatSubmit(input.value);
  input.value = '';
});

document.querySelectorAll('.prompt-chip').forEach(btn => {
  btn.addEventListener('click', () => handleAIChatSubmit(btn.dataset.prompt));
});

// Menu Category Filtering
document.querySelectorAll('.menu-cat-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    playAudioChime('click');
    document.querySelectorAll('.menu-cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderVisualMenu(btn.dataset.cat);
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
    evaluateSlotState();
    renderFloorPlan(dashboardFloorPreview, false);
    renderFloorPlan(masterFloorCanvas, true);
  }
});

// Drawer Close Handlers
document.getElementById('btn-close-drawer').addEventListener('click', closeTableDrawer);
drawerBackdrop.addEventListener('click', closeTableDrawer);

// Print Handlers
document.getElementById('btn-print-manifest').addEventListener('click', () => modalHostManifest.classList.add('open'));
document.getElementById('btn-close-manifest').addEventListener('click', () => modalHostManifest.classList.remove('open'));
document.getElementById('btn-print-manifest-action').addEventListener('click', () => window.print());
document.getElementById('manual-sync-btn').addEventListener('click', () => { syncWithCoreEngine(); showToastNotification('State synchronized.', 'info'); });

// Initialize Platform
applyLuxuryTheme(appState.currentTheme);
updateSoundToggleUI();
update3DFloorTransform();
syncWithCoreEngine();

console.log('⚜️ The Royal Spice 3.0+ Spatial OS Initialized.');
