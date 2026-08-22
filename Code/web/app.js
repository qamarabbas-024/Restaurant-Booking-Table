// ==========================================================================
// THE ROYAL SPICE 4.5 PRO — MASTER CONTROLLER
// Three.js WebGL 3D Spatial Floor Plan, AI Sommelier & 2-Theme Engine
// ==========================================================================

const API_BASE = 'http://localhost:8080/api';

const STORAGE_KEYS = {
  TABLES: 'royal_spice_tables',
  BOOKINGS: 'royal_spice_bookings',
  ACTIVITY: 'royal_spice_activity',
  THEME: 'royal_spice_theme',
  SOUND: 'royal_spice_sound'
};

// Initial Seed Tables
const DEFAULT_TABLES = [
  { id: 1, capacity: 2, type: 'Couple Table', status: 'Available', x: -5, z: -3 },
  { id: 2, capacity: 4, type: 'Family Booth', status: 'Available', x: 0, z: -3 },
  { id: 3, capacity: 6, type: 'VIP Suite', status: 'Available', x: 5, z: -3 },
  { id: 4, capacity: 8, type: 'Banquet Table', status: 'Available', x: -5, z: 3 },
  { id: 5, capacity: 2, type: 'Couple Table', status: 'Available', x: 0, z: 3 },
  { id: 6, capacity: 4, type: 'Family Booth', status: 'Available', x: 5, z: 3 }
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
  currentTheme: localStorage.getItem(STORAGE_KEYS.THEME) === 'white' ? 'white' : 'dark-blue',
  soundEnabled: localStorage.getItem(STORAGE_KEYS.SOUND) !== 'false',
  is3DViewMode: true,
  selectedOccasion: 'Romantic Dinner',
  selectedZone: 'ALL',
  selectedDate: '24/05/2026',
  selectedTime: '8:00 PM',
  activeDrawerTable: null,
  isBackendConnected: false,
  tables: JSON.parse(localStorage.getItem(STORAGE_KEYS.TABLES) || 'null') || DEFAULT_TABLES,
  bookings: JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || 'null') || [],
  activity: JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVITY) || 'null') || [
    { timestamp: '17:30', type: 'SYSTEM_INIT', message: 'Shift started. 3D WebGL spatial engine initialized.' },
    { timestamp: '17:35', type: 'TABLE_STATUS', message: 'VIP Suite prepared for dinner service.' }
  ],
  availableTableIds: [],
  occupiedTableIds: []
};

// ================= DOM REFERENCES =================
const appSidebar = document.getElementById('app-sidebar');
const currentViewTitle = document.getElementById('current-view-title');
const headerDateBadge = document.getElementById('header-date-badge');
const globalDateInput = document.getElementById('global-date-input');
const headerSlotChips = document.getElementById('header-slot-chips');
const coreSyncIndicator = document.getElementById('core-sync-indicator');
const btnThemeToggle = document.getElementById('btn-theme-toggle');
const themeBtnIcon = document.getElementById('theme-btn-icon');
const themeBtnLabel = document.getElementById('theme-btn-label');
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
const threeCanvasContainer = document.getElementById('three-canvas-container');
const threeHoverTooltip = document.getElementById('three-hover-tooltip');
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
      osc.frequency.setValueAtTime(920, now);
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

// ================= 2-THEME ENGINE =================
function applyTheme(themeName) {
  appState.currentTheme = themeName;
  document.documentElement.setAttribute('data-theme', themeName);
  localStorage.setItem(STORAGE_KEYS.THEME, themeName);

  if (themeBtnIcon && themeBtnLabel) {
    if (themeName === 'white') {
      themeBtnIcon.innerHTML = '<i data-lucide="moon"></i>';
      themeBtnLabel.textContent = 'Dark Blue';
    } else {
      themeBtnIcon.innerHTML = '<i data-lucide="sun"></i>';
      themeBtnLabel.textContent = 'Pure White';
    }
    if (window.lucide) window.lucide.createIcons();
  }

  // Update Three.js 3D scene background if initialized
  if (threeScene) {
    threeScene.background = new THREE.Color(themeName === 'white' ? 0xe2e8f0 : 0x060b18);
  }
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
    floorplan: 'Photorealistic 3D Spatial Floor Plan',
    reservations: 'Master Reservations Ledger',
    booking: 'Smart Reservation Allocation',
    menu: 'Michelin 3-Star Visual Dish Menu',
    crm: 'VIP Guest CRM & Loyalty Profiles',
    tables: 'Physical Table Fleet Management',
    activity: 'System Operational Event Log'
  };
  if (currentViewTitle) currentViewTitle.textContent = titles[viewName] || 'The Royal Spice';

  if (viewName === 'floorplan') {
    setTimeout(handleResize3DScene, 100);
  }

  if (window.innerWidth <= 1024) {
    appSidebar.classList.remove('mobile-open');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (backdrop) backdrop.classList.remove('active');
  }
}

// ================= THREE.JS PHOTOREALISTIC 3D ENGINE =================
let threeScene, threeCamera, threeRenderer, tableMeshes = [];
let raycaster, mouseVector, hoveredTableMesh = null;
let isDragging3D = false, prevMouseX = 0, prevMouseY = 0;
let cameraRadius = 14, cameraTheta = Math.PI / 4, cameraPhi = Math.PI / 3.5;

function initThreeScene() {
  if (!threeCanvasContainer || !window.THREE) return;

  threeScene = new THREE.Scene();
  threeScene.background = new THREE.Color(appState.currentTheme === 'white' ? 0xe2e8f0 : 0x060b18);

  const aspect = threeCanvasContainer.clientWidth / (threeCanvasContainer.clientHeight || 480);
  threeCamera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
  update3DCameraPosition();

  threeRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  threeRenderer.setSize(threeCanvasContainer.clientWidth, threeCanvasContainer.clientHeight || 480);
  threeRenderer.setPixelRatio(window.devicePixelRatio || 1);
  threeRenderer.shadowMap.enabled = true;
  threeRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
  threeCanvasContainer.appendChild(threeRenderer.domElement);

  raycaster = new THREE.Raycaster();
  mouseVector = new THREE.Vector2();

  // Ambient Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  threeScene.add(ambientLight);

  // Main Chandelier Directional Light
  const dirLight = new THREE.DirectionalLight(0xffeedd, 1.2);
  dirLight.position.set(10, 20, 10);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 1024;
  dirLight.shadow.mapSize.height = 1024;
  threeScene.add(dirLight);

  // Dining Room Parquet Floor Mesh
  const floorGeo = new THREE.PlaneGeometry(24, 18);
  const floorMat = new THREE.MeshStandardMaterial({
    color: appState.currentTheme === 'white' ? 0xd1d5db : 0x0b1329,
    roughness: 0.3,
    metalness: 0.2
  });
  const floorMesh = new THREE.Mesh(floorGeo, floorMat);
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.receiveShadow = true;
  threeScene.add(floorMesh);

  // Grid Floor Details
  const gridHelper = new THREE.GridHelper(24, 24, 0xf59e0b, 0x1e2f58);
  gridHelper.position.y = 0.01;
  threeScene.add(gridHelper);

  // Build 3D Tables
  rebuild3DTables();

  // Mouse & Orbit Events
  setup3DInteractionEvents();

  // Animation Loop
  function animate() {
    requestAnimationFrame(animate);
    threeRenderer.render(threeScene, threeCamera);
  }
  animate();
}

function update3DCameraPosition() {
  if (!threeCamera) return;
  threeCamera.position.x = cameraRadius * Math.sin(cameraPhi) * Math.sin(cameraTheta);
  threeCamera.position.y = cameraRadius * Math.cos(cameraPhi);
  threeCamera.position.z = cameraRadius * Math.sin(cameraPhi) * Math.cos(cameraTheta);
  threeCamera.lookAt(0, 0, 0);
}

function rebuild3DTables() {
  if (!threeScene) return;

  // Clear existing table meshes
  tableMeshes.forEach(mesh => threeScene.remove(mesh));
  tableMeshes = [];

  const statusColors = {
    Available: 0x10b981,
    Reserved: 0xf59e0b,
    Seated: 0x38bdf8,
    Cleaning: 0xa855f7,
    Maintenance: 0xef4444
  };

  appState.tables.forEach(tbl => {
    let liveStatus = tbl.status;
    const booking = appState.bookings.find(b => b.tableId === tbl.id && b.date === appState.selectedDate && b.time === appState.selectedTime && b.status !== 'Cancelled');
    if (tbl.status === 'Maintenance') liveStatus = 'Maintenance';
    else if (booking) liveStatus = booking.status === 'Seated' ? 'Seated' : 'Reserved';

    const group = new THREE.Group();
    group.userData = { table: tbl, booking: booking, status: liveStatus };

    const statusHex = statusColors[liveStatus] || 0x10b981;

    // Table Top Mesh
    let topGeo;
    if (tbl.capacity <= 2) {
      topGeo = new THREE.CylinderGeometry(1.0, 1.0, 0.15, 32);
    } else if (tbl.capacity <= 4) {
      topGeo = new THREE.BoxGeometry(2.2, 0.15, 1.4);
    } else if (tbl.capacity <= 6) {
      topGeo = new THREE.CylinderGeometry(1.8, 1.8, 0.15, 32);
    } else {
      topGeo = new THREE.BoxGeometry(3.6, 0.15, 1.6);
    }

    const tableMat = new THREE.MeshStandardMaterial({
      color: liveStatus === 'Maintenance' ? 0x475569 : 0x1e293b,
      roughness: 0.2,
      metalness: 0.4
    });
    const topMesh = new THREE.Mesh(topGeo, tableMat);
    topMesh.position.y = 1.0;
    topMesh.castShadow = true;
    topMesh.receiveShadow = true;
    group.add(topMesh);

    // Table Pedestal Leg
    const legGeo = new THREE.CylinderGeometry(0.15, 0.25, 1.0, 16);
    const legMat = new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.8, roughness: 0.2 });
    const legMesh = new THREE.Mesh(legGeo, legMat);
    legMesh.position.y = 0.5;
    legMesh.castShadow = true;
    group.add(legMesh);

    // Glowing 3D Status Lantern
    const lanternGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const lanternMat = new THREE.MeshBasicMaterial({ color: statusHex });
    const lanternMesh = new THREE.Mesh(lanternGeo, lanternMat);
    lanternMesh.position.y = 1.35;
    group.add(lanternMesh);

    const pointLight = new THREE.PointLight(statusHex, 1.8, 4.0);
    pointLight.position.y = 1.4;
    group.add(pointLight);

    // Positioning
    const posX = tbl.x !== undefined ? tbl.x : (tbl.id % 3 - 1) * 5;
    const posZ = tbl.z !== undefined ? tbl.z : (Math.floor(tbl.id / 3) - 1) * 5;
    group.position.set(posX, 0, posZ);

    threeScene.add(group);
    tableMeshes.push(group);
  });
}

function setup3DInteractionEvents() {
  if (!threeCanvasContainer) return;

  threeCanvasContainer.addEventListener('mousedown', (e) => {
    isDragging3D = true;
    prevMouseX = e.clientX;
    prevMouseY = e.clientY;
  });

  window.addEventListener('mouseup', () => { isDragging3D = false; });

  threeCanvasContainer.addEventListener('mousemove', (e) => {
    const rect = threeCanvasContainer.getBoundingClientRect();
    mouseVector.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseVector.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    if (isDragging3D) {
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      cameraTheta -= deltaX * 0.008;
      cameraPhi = Math.max(0.2, Math.min(Math.PI / 2.1, cameraPhi - deltaY * 0.008));
      update3DCameraPosition();
      return;
    }

    // Raycast table hover
    if (threeCamera && raycaster) {
      raycaster.setFromCamera(mouseVector, threeCamera);
      const intersects = raycaster.intersectObjects(tableMeshes, true);

      if (intersects.length > 0) {
        let parentGroup = intersects[0].object;
        while (parentGroup.parent && parentGroup.parent !== threeScene) {
          parentGroup = parentGroup.parent;
        }

        if (hoveredTableMesh !== parentGroup) {
          if (hoveredTableMesh) hoveredTableMesh.position.y = 0;
          hoveredTableMesh = parentGroup;
          hoveredTableMesh.position.y = 0.35;

          const data = hoveredTableMesh.userData;
          if (threeHoverTooltip) {
            threeHoverTooltip.style.display = 'block';
            threeHoverTooltip.style.left = `${e.clientX - rect.left}px`;
            threeHoverTooltip.style.top = `${e.clientY - rect.top}px`;
            document.getElementById('tt-title').textContent = `Table #${data.table.id} (${data.table.type})`;
            document.getElementById('tt-body').textContent = `Capacity: ${data.table.capacity} &bull; Status: ${data.status}`;
          }
        }
      } else {
        if (hoveredTableMesh) {
          hoveredTableMesh.position.y = 0;
          hoveredTableMesh = null;
        }
        if (threeHoverTooltip) threeHoverTooltip.style.display = 'none';
      }
    }
  });

  threeCanvasContainer.addEventListener('wheel', (e) => {
    e.preventDefault();
    cameraRadius = Math.max(6, Math.min(26, cameraRadius + e.deltaY * 0.015));
    update3DCameraPosition();
  });

  threeCanvasContainer.addEventListener('click', () => {
    if (hoveredTableMesh && hoveredTableMesh.userData) {
      playAudioChime('click');
      const { table, booking, status } = hoveredTableMesh.userData;
      openTableDrawer(table, booking, status);
    }
  });
}

function handleResize3DScene() {
  if (!threeRenderer || !threeCamera || !threeCanvasContainer) return;
  const width = threeCanvasContainer.clientWidth || 800;
  const height = threeCanvasContainer.clientHeight || 480;
  threeCamera.aspect = width / height;
  threeCamera.updateProjectionMatrix();
  threeRenderer.setSize(width, height);
}
window.addEventListener('resize', handleResize3DScene);

// ================= CORE DATA EVALUATION =================
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

  renderUpcomingArrivalsList(slotBookings);
  rebuild3DTables();
}

// ================= 2D CAD FALLBACK & DRAWER =================
function renderFloorPlan(canvasElement) {
  if (!canvasElement) return;
  canvasElement.innerHTML = '';

  appState.tables.forEach(tbl => {
    let liveStatus = tbl.status;
    const booking = appState.bookings.find(b => b.tableId === tbl.id && b.date === appState.selectedDate && b.time === appState.selectedTime && b.status !== 'Cancelled');

    if (tbl.status === 'Maintenance') liveStatus = 'Maintenance';
    else if (booking) liveStatus = booking.status === 'Seated' ? 'Seated' : 'Reserved';

    const pod = document.createElement('div');
    pod.className = `cad-table-pod status-${liveStatus.toLowerCase()}`;
    pod.innerHTML = `
      <div class="cad-pod-header">
        <span class="cad-table-num">Table #${tbl.id}</span>
        <span class="cad-status-tag">${liveStatus}</span>
      </div>
      <div class="cad-geometry-visual">
        <div class="cad-geo-round"><span>T-${tbl.id}</span></div>
      </div>
      <div class="cad-pod-meta">
        <span><strong>${tbl.capacity} Seats</strong> &bull; ${tbl.type}</span>
        ${booking ? `<span style="color:var(--primary-500); font-weight:700;">★ ${booking.name}</span>` : `<span style="color:var(--c-available);">Available</span>`}
      </div>
    `;

    pod.addEventListener('click', () => {
      playAudioChime('click');
      openTableDrawer(tbl, booking, liveStatus);
    });

    canvasElement.appendChild(pod);
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
    drawerToggleStatusText.textContent = table.status === 'Maintenance' ? 'Reactivate Table' : 'Set Maintenance';
  } else {
    drawerBookingSection.style.display = 'none';
    drawerBtnReleaseTable.style.display = 'none';
    drawerToggleStatusText.textContent = table.status === 'Maintenance' ? 'Reactivate Table' : 'Set Maintenance';
  }

  tableContextDrawer.classList.add('open');
  drawerBackdrop.classList.add('active');
}

function closeTableDrawer() {
  tableContextDrawer.classList.remove('open');
  drawerBackdrop.classList.remove('active');
}

// ================= UPCOMING ARRIVALS & ACTIVITY =================
function renderUpcomingArrivalsList(slotBookings) {
  if (!dashboardUpcomingList) return;
  dashboardUpcomingList.innerHTML = '';

  if (slotBookings.length === 0) {
    dashboardUpcomingList.innerHTML = `<div style="text-align:center; padding: 24px; color:var(--text-muted); font-size:12.5px;">No reservations scheduled for ${appState.selectedTime}. Walk-in seating ready.</div>`;
    return;
  }

  slotBookings.forEach(b => {
    const item = document.createElement('div');
    item.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding:10px 12px; background:var(--bg-canvas); border-radius:var(--radius-xs); border:1px solid var(--border-subtle); margin-bottom:8px;';
    item.innerHTML = `
      <div>
        <strong style="color:var(--text-main); font-size:13px;">${b.name}</strong>
        <div style="font-size:11px; color:var(--text-muted);">Table #${b.tableId} &bull; ${b.guests} Guests &bull; ${b.occasion || 'Dinner'}</div>
      </div>
      <div>
        <span class="badge-pill ${b.status === 'Seated' ? 'blue' : 'gold'}">${b.status}</span>
      </div>
    `;
    dashboardUpcomingList.appendChild(item);
  });
}

function renderActivityTimeline() {
  if (!fullActivityStream) return;
  fullActivityStream.innerHTML = '';

  appState.activity.forEach(act => {
    const row = document.createElement('div');
    row.style.cssText = 'padding:12px 16px; background:var(--bg-surface); border-radius:var(--radius-xs); border:1px solid var(--border-subtle); margin-bottom:10px; display:flex; gap:14px; align-items:center;';
    row.innerHTML = `
      <span style="font-family:var(--font-mono); font-size:11px; color:var(--primary-500); font-weight:700;">${act.timestamp}</span>
      <div style="flex:1;">
        <strong style="color:var(--text-main); font-size:12.5px;">${act.type}</strong>
        <p style="color:var(--text-muted); font-size:11.5px; margin-top:2px;">${act.message}</p>
      </div>
    `;
    fullActivityStream.appendChild(row);
  });
}

// ================= RESERVATIONS LEDGER =================
function renderReservationsTable() {
  if (!masterReservationsTbody) return;
  masterReservationsTbody.innerHTML = '';

  const query = (reservationsSearchInput ? reservationsSearchInput.value : '').toLowerCase();
  const filter = reservationsStatusFilter ? reservationsStatusFilter.value : 'ALL';

  const filtered = appState.bookings.filter(b => {
    const matchQuery = b.name.toLowerCase().includes(query) || String(b.tableId).includes(query) || String(b.id || '').toLowerCase().includes(query);
    const matchStatus = filter === 'ALL' || b.status === filter;
    return matchQuery && matchStatus;
  });

  if (filtered.length === 0) {
    masterReservationsTbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:24px; color:var(--text-muted);">No reservations found matching search filters.</td></tr>`;
    return;
  }

  filtered.forEach(b => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${b.id || 'RES-' + b.tableId}</strong></td>
      <td><span class="badge-pill gold">Table #${b.tableId}</span></td>
      <td><strong>${b.name}</strong></td>
      <td>${b.guests} Guests</td>
      <td>${b.date}</td>
      <td>${b.time}</td>
      <td>${b.occasion || 'Dinner'}</td>
      <td><span class="badge-pill ${b.status === 'Seated' ? 'green' : 'gold'}">${b.status}</span></td>
      <td>
        <button class="btn btn-secondary btn-sm" onclick="handleCancelReservation('${b.id}')">Cancel</button>
      </td>
    `;
    masterReservationsTbody.appendChild(tr);
  });
}

// ================= TABLE FLEET TABLE =================
function renderFleetTableList() {
  if (!fleetTablesTbody) return;
  fleetTablesTbody.innerHTML = '';

  appState.tables.forEach(t => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>Table #${t.id}</strong></td>
      <td>${t.capacity} Guests</td>
      <td>${t.type}</td>
      <td><span class="badge-pill ${t.status === 'Available' ? 'green' : 'red'}">${t.status}</span></td>
      <td>${t.status === 'Maintenance' ? 'Offline' : 'Online Operational'}</td>
      <td>
        <button class="btn btn-secondary btn-sm" onclick="handleToggleTableStatus(${t.id}, '${t.status === 'Available' ? 'Maintenance' : 'Available'}')">
          ${t.status === 'Available' ? 'Set Maintenance' : 'Reactivate'}
        </button>
      </td>
      <td>
        <button class="btn btn-danger-sm btn-sm" onclick="handleDeleteTable(${t.id})">&times;</button>
      </td>
    `;
    fleetTablesTbody.appendChild(tr);
  });
}

// ================= VISUAL MENU & CRM =================
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

  const userRow = document.createElement('div');
  userRow.className = 'ai-msg user';
  userRow.innerHTML = `<div class="msg-bubble">${userText}</div>`;
  chatMessages.appendChild(userRow);

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

// ================= ACTIONS & MUTATIONS =================
window.handleToggleTableStatus = async function(tableId, targetStatus) {
  playAudioChime('click');
  const target = appState.tables.find(t => t.id === tableId);
  if (target) {
    target.status = targetStatus;
    localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(appState.tables));

    appState.activity.unshift({
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'TABLE_STATUS_FLIP',
      message: `Table #${tableId} operational status changed to ${targetStatus}.`
    });
    localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(appState.activity));

    showToastNotification(`Table #${tableId} set to ${targetStatus}.`, 'info');
    evaluateSlotState();
    renderFleetTableList();
    closeTableDrawer();
  }
};

window.handleCancelReservation = async function(bookingId) {
  playAudioChime('click');
  appState.bookings = appState.bookings.filter(b => String(b.id) !== String(bookingId));
  localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(appState.bookings));
  showToastNotification(`Reservation cancelled successfully.`, 'info');
  evaluateSlotState();
  renderReservationsTable();
  closeTableDrawer();
};

window.handleDeleteTable = function(tableId) {
  playAudioChime('click');
  appState.tables = appState.tables.filter(t => t.id !== tableId);
  localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(appState.tables));
  showToastNotification(`Table #${tableId} removed from fleet.`, 'info');
  evaluateSlotState();
  renderFleetTableList();
};

function populateBookingFormDropdown() {
  if (!formTableSelect) return;
  formTableSelect.innerHTML = '<option value="0">✨ Auto-Assign Best Fit (Smart Engine)</option>';
  appState.tables.forEach(t => {
    const isAvail = appState.availableTableIds.includes(t.id);
    formTableSelect.innerHTML += `<option value="${t.id}" ${!isAvail ? 'disabled' : ''}>Table #${t.id} (${t.capacity} Seats - ${t.type}) ${!isAvail ? '[Booked]' : ''}</option>`;
  });
}

// ================= NEW RESERVATION SUBMIT =================
if (masterBookingForm) {
  masterBookingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    playAudioChime('success');

    const name = document.getElementById('form-guest-name').value.trim();
    const guests = parseInt(document.getElementById('form-guest-count').value || 2);
    const date = document.getElementById('form-booking-date').value.trim();
    const time = document.getElementById('form-booking-time').value;
    const occasion = appState.selectedOccasion;
    const special = document.getElementById('form-special-notes').value.trim();
    let chosenTableId = parseInt(formTableSelect.value);

    if (chosenTableId === 0) {
      const candidates = appState.tables
        .filter(t => t.status === 'Available' && t.capacity >= guests && !appState.occupiedTableIds.includes(t.id))
        .sort((a, b) => a.capacity - b.capacity);
      if (candidates.length > 0) {
        chosenTableId = candidates[0].id;
      } else {
        showToastNotification('No suitable free table found for this party size.', 'error');
        return;
      }
    }

    const newBooking = {
      id: 'RES-' + Math.floor(1000 + Math.random() * 9000),
      tableId: chosenTableId,
      name: name,
      guests: guests,
      date: date,
      time: time,
      occasion: occasion,
      special: special,
      status: 'Confirmed'
    };

    appState.bookings.push(newBooking);
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(appState.bookings));

    appState.activity.unshift({
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'BOOKING_CREATED',
      message: `Reservation ${newBooking.id} confirmed for ${name} at Table #${chosenTableId}.`
    });
    localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(appState.activity));

    // Render Official Printable Pass
    const passGrid = document.getElementById('pass-grid-data');
    if (passGrid) {
      passGrid.innerHTML = `
        <div><small>Guest Name</small><strong>${name}</strong></div>
        <div><small>Booking Ref</small><strong>${newBooking.id}</strong></div>
        <div><small>Table Assigned</small><strong>Table #${chosenTableId}</strong></div>
        <div><small>Party Size</small><strong>${guests} Guests</strong></div>
        <div><small>Date & Time</small><strong>${date} at ${time}</strong></div>
        <div><small>Occasion</small><strong>${occasion}</strong></div>
      `;
    }
    modalReceiptPass.classList.add('open');

    evaluateSlotState();
    masterBookingForm.reset();
  });
}

// Express Walk-In Seating Form
const formWalkinAction = document.getElementById('form-walkin-action');
if (formWalkinAction) {
  formWalkinAction.addEventListener('submit', (e) => {
    e.preventDefault();
    playAudioChime('success');
    const name = document.getElementById('walkin-guest-name').value.trim();
    const guests = parseInt(document.getElementById('walkin-guest-count').value || 2);
    let chosenId = parseInt(document.getElementById('walkin-table-choice').value || 0);

    if (chosenId === 0) {
      const candidates = appState.tables
        .filter(t => t.status === 'Available' && t.capacity >= guests && !appState.occupiedTableIds.includes(t.id))
        .sort((a, b) => a.capacity - b.capacity);
      if (candidates.length > 0) chosenId = candidates[0].id;
      else { showToastNotification('No table available for walk-in party size.', 'error'); return; }
    }

    const booking = {
      id: 'WALKIN-' + Math.floor(100 + Math.random() * 900),
      tableId: chosenId,
      name: name,
      guests: guests,
      date: appState.selectedDate,
      time: appState.selectedTime,
      occasion: 'Walk-In Seating',
      status: 'Seated'
    };

    appState.bookings.push(booking);
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(appState.bookings));
    modalWalkinDialog.classList.remove('open');
    showToastNotification(`Walk-in guest ${name} seated at Table #${chosenId}.`, 'success');
    evaluateSlotState();
  });
}

// ================= C++ REST ENGINE SYNC =================
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
}

// ================= EVENT LISTENERS =================

// Navigation
document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => switchAppView(btn.dataset.view));
});

// Sidebar Toggle
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

// 2-Theme Switch Button
btnThemeToggle.addEventListener('click', () => {
  playAudioChime('click');
  const nextTheme = appState.currentTheme === 'white' ? 'dark-blue' : 'white';
  applyTheme(nextTheme);
  showToastNotification(`Switched to ${nextTheme === 'white' ? 'Pristine White' : 'Midnight Sapphire'} theme.`, 'info');
});

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

// 3D View Toggle (WebGL 3D vs 2D CAD)
document.getElementById('btn-toggle-3d-view').addEventListener('click', () => {
  playAudioChime('click');
  appState.is3DViewMode = !appState.is3DViewMode;
  document.getElementById('btn-3d-view-label').textContent = appState.is3DViewMode ? '3D WebGL View' : '2D CAD Blueprint';
  threeCanvasContainer.style.display = appState.is3DViewMode ? 'block' : 'none';
  masterFloorCanvas.style.display = appState.is3DViewMode ? 'none' : 'grid';
  if (!appState.is3DViewMode) renderFloorPlan(masterFloorCanvas);
});

// 3D Camera Buttons
document.getElementById('btn-camera-orbit-left').addEventListener('click', () => { cameraTheta -= 0.3; update3DCameraPosition(); });
document.getElementById('btn-camera-orbit-right').addEventListener('click', () => { cameraTheta += 0.3; update3DCameraPosition(); });
document.getElementById('btn-camera-zoom-in').addEventListener('click', () => { cameraRadius = Math.max(6, cameraRadius - 1.5); update3DCameraPosition(); });
document.getElementById('btn-camera-zoom-out').addEventListener('click', () => { cameraRadius = Math.min(26, cameraRadius + 1.5); update3DCameraPosition(); });
document.getElementById('btn-camera-reset').addEventListener('click', () => { cameraRadius = 14; cameraTheta = Math.PI / 4; cameraPhi = Math.PI / 3.5; update3DCameraPosition(); });

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

// Experience Shortcuts
document.querySelectorAll('.exp-preset-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    playAudioChime('click');
    const guests = parseInt(btn.dataset.guests);
    document.getElementById('form-guest-count').value = guests;
    switchAppView('booking');
  });
});

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
  const inp = document.getElementById('ai-chat-input');
  handleAIChatSubmit(inp.value);
  inp.value = '';
});
document.querySelectorAll('.prompt-chip').forEach(btn => {
  btn.addEventListener('click', () => handleAIChatSubmit(btn.dataset.prompt));
});

// Menu Filtering
document.querySelectorAll('.menu-cat-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    playAudioChime('click');
    document.querySelectorAll('.menu-cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderVisualMenu(btn.dataset.cat);
  });
});

// Zone Filtering on Floor Plan
document.querySelectorAll('.zone-pill').forEach(pill => {
  pill.addEventListener('click', () => {
    playAudioChime('click');
    document.querySelectorAll('.zone-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    appState.selectedZone = pill.dataset.zone;
    rebuild3DTables();
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
  }
});

// Modals
document.getElementById('btn-open-walkin-dialog').addEventListener('click', () => modalWalkinDialog.classList.add('open'));
document.getElementById('btn-close-walkin-dialog').addEventListener('click', () => modalWalkinDialog.classList.remove('open'));
document.getElementById('btn-cancel-walkin-dialog').addEventListener('click', () => modalWalkinDialog.classList.remove('open'));
document.getElementById('btn-floor-walkin-seat').addEventListener('click', () => modalWalkinDialog.classList.add('open'));

document.getElementById('btn-floor-add-table').addEventListener('click', () => modalTableDialog.classList.add('open'));
document.getElementById('btn-open-add-table-dialog').addEventListener('click', () => modalTableDialog.classList.add('open'));
document.getElementById('btn-close-table-dialog').addEventListener('click', () => modalTableDialog.classList.remove('open'));
document.getElementById('btn-cancel-table-dialog').addEventListener('click', () => modalTableDialog.classList.remove('open'));

document.getElementById('btn-close-pass-action').addEventListener('click', () => modalReceiptPass.classList.remove('open'));
document.getElementById('btn-print-pass-action').addEventListener('click', () => window.print());

document.getElementById('btn-print-manifest').addEventListener('click', () => modalHostManifest.classList.add('open'));
document.getElementById('btn-close-manifest').addEventListener('click', () => modalHostManifest.classList.remove('open'));
document.getElementById('btn-print-manifest-action').addEventListener('click', () => window.print());

document.getElementById('manual-sync-btn').addEventListener('click', () => { syncWithCoreEngine(); showToastNotification('State synchronized.', 'info'); });
document.getElementById('btn-close-drawer').addEventListener('click', closeTableDrawer);
drawerBackdrop.addEventListener('click', closeTableDrawer);

// Global Date
globalDateInput.addEventListener('change', () => {
  appState.selectedDate = globalDateInput.value.trim() || '24/05/2026';
  evaluateSlotState();
});

// Search & Filter in Reservations
if (reservationsSearchInput) reservationsSearchInput.addEventListener('input', renderReservationsTable);
if (reservationsStatusFilter) reservationsStatusFilter.addEventListener('change', renderReservationsTable);

// CSV Export
document.getElementById('btn-export-csv').addEventListener('click', () => {
  let csv = 'Reservation ID,Table ID,Guest Name,Party Size,Date,Time,Occasion,Status\n';
  appState.bookings.forEach(b => {
    csv += `"${b.id}","${b.tableId}","${b.name}","${b.guests}","${b.date}","${b.time}","${b.occasion || ''}","${b.status}"\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `Royal_Spice_Manifest_${Date.now()}.csv`;
  a.click();
  showToastNotification('Downloaded reservations CSV manifest.', 'success');
});

// Pre-render ALL view components on load
evaluateSlotState();
renderFloorPlan(dashboardFloorPreview);
renderVisualMenu('ALL');
renderVIPGuests();
renderReservationsTable();
renderFleetTableList();
renderActivityTimeline();
populateBookingFormDropdown();

// Auto Background Polling every 3.5s
setInterval(syncWithCoreEngine, 3500);

// Initialize Platform & Three.js 3D Scene
applyTheme(appState.currentTheme);
updateSoundToggleUI();
syncWithCoreEngine();

window.addEventListener('DOMContentLoaded', () => {
  initThreeScene();
});

console.log('⚜️ The Royal Spice 4.5 Pro Initialized with Three.js 3D WebGL Engine.');
