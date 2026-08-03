const MAPBOX_ACCESS_TOKEN = window.SPIDERTRACKER_CONFIG?.mapboxAccessToken || '';
const MAPBOX_STYLES = {
  explore: 'mapbox://styles/mapbox/navigation-night-v1',
  driving: 'mapbox://styles/mapbox/navigation-day-v1',
  transit: 'mapbox://styles/mapbox/streets-v12',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12'
};
const worldwideView = { coords: [20, 0], zoom: 1.8 };
const hamburgView = { coords: [53.5511, 9.9937], zoom: 13.8 };
const hamburgSearchPlaces = [
  { label: 'Hamburg', coords: [53.5511, 9.9937], zoom: 13.8 },
  { label: 'St. Pauli', coords: [53.5510, 9.9660], zoom: 15 },
  { label: 'Elbphilharmonie', coords: [53.5413, 9.9847], zoom: 16 },
  { label: 'Altona', coords: [53.5506, 9.9350], zoom: 14 },
  { label: 'Harburg', coords: [53.4569, 9.9811], zoom: 14 },
  { label: 'Landungsbrücken', coords: [53.5444, 9.9772], zoom: 15 }
];

const mapScreen = document.querySelector('.map-screen');
const mapDock = document.querySelector('#map-dock');
const worldwideToggle = document.querySelector('#worldwide-toggle');
const searchPanel = document.querySelector('#search-panel');
const profilePanel = document.querySelector('#profile-panel');
const mapStylePanel = document.querySelector('#map-style-panel');
const searchInput = document.querySelector('#hamburg-search');
const toast = document.querySelector('#toast');
const locationNotice = document.querySelector('#location-notice');
const temperatureValue = document.querySelector('#temperature-value');
const dockToggle = document.querySelector('#dock-toggle');

let map = null;
let isHamburgView = true;
let activeMapStyle = 'explore';
let userMarker = null;
let pulseMarkers = [];
let pulseInterval = null;
let locationNoticeTimer = null;
let dockPointerStart = null;
let skipDockClick = false;

function hasMapboxToken() {
  return MAPBOX_ACCESS_TOKEN.startsWith('pk.');
}

function initialiseMap() {
  if (!hasMapboxToken() || typeof mapboxgl === 'undefined') {
    document.querySelector('#map').classList.add('token-required');
    return;
  }

  mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
  map = new mapboxgl.Map({
    container: 'map',
    style: MAPBOX_STYLES[activeMapStyle],
    center: [hamburgView.coords[1], hamburgView.coords[0]],
    zoom: hamburgView.zoom,
    pitch: 46,
    bearing: -18,
    attributionControl: false,
    logoPosition: 'bottom-left',
    dragRotate: false,
    touchPitch: false,
    pitchWithRotate: false,
    cooperativeGestures: false
  });
  map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right');
  map.on('style.load', enable3DMap);
}

function enable3DMap() {
  if (!map || !map.getSource('composite')) return;

  if (!map.getSource('mapbox-dem')) {
    map.addSource('mapbox-dem', {
      type: 'raster-dem',
      url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
      tileSize: 512,
      maxzoom: 14
    });
  }
  map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.1 });

  if (map.getLayer('spidertracker-3d-buildings')) return;
  const labelLayer = map.getStyle().layers.find((layer) => layer.type === 'symbol' && layer.layout?.['text-field']);
  map.addLayer({
    id: 'spidertracker-3d-buildings',
    source: 'composite',
    'source-layer': 'building',
    type: 'fill-extrusion',
    minzoom: 13.5,
    filter: ['==', 'extrude', 'true'],
    paint: {
      'fill-extrusion-color': activeMapStyle === 'explore' ? '#5c6b79' : '#b5bbc3',
      'fill-extrusion-height': ['interpolate', ['linear'], ['zoom'], 13.5, 0, 15.5, ['get', 'height']],
      'fill-extrusion-base': ['case', ['has', 'min_height'], ['get', 'min_height'], 0],
      'fill-extrusion-opacity': .86
    }
  }, labelLayer?.id);
}

function updateMapHeader() {
  worldwideToggle.querySelector('span').textContent = isHamburgView ? 'Hamburg' : 'Worldwide';
  worldwideToggle.setAttribute('aria-pressed', String(isHamburgView));
}

function flyToView(view) {
  if (!map) return;
  const show3D = view.zoom >= 13.5;
  map.flyTo({ center: [view.coords[1], view.coords[0]], zoom: view.zoom, pitch: show3D ? 46 : 0, bearing: show3D ? -18 : 0, duration: 1050, essential: true });
}

function stopPulseMarkers() {
  if (pulseInterval) clearInterval(pulseInterval);
  pulseInterval = null;
  pulseMarkers.forEach((marker) => marker.remove());
  pulseMarkers = [];
}

function getSightingLocation() {
  const regions = [
    { lat: 40.7128, lng: -74.0060, label: 'New York' },
    { lat: 48.8566, lng: 2.3522, label: 'Paris' },
    { lat: 35.6762, lng: 139.6503, label: 'Tokyo' },
    { lat: -33.8688, lng: 151.2093, label: 'Sydney' },
    { lat: 19.0760, lng: 72.8777, label: 'Mumbai' },
    { lat: -1.2921, lng: 36.8219, label: 'Nairobi' }
  ];
  return regions[Math.floor(Math.random() * regions.length)];
}

function createPulseMarker() {
  if (!map || isHamburgView || pulseMarkers.length >= 7) return;
  const location = getSightingLocation();
  const element = document.createElement('div');
  element.className = 'pulse-marker';
  element.innerHTML = '<span class="spider-emoji">🕷️</span>';
  const marker = new mapboxgl.Marker({ element, anchor: 'center' })
    .setLngLat([location.lng, location.lat])
    .setPopup(new mapboxgl.Popup({ offset: 20, closeButton: false }).setHTML(`<strong>${location.label}</strong><br>A community sighting was reported here.`))
    .addTo(map);
  pulseMarkers.push(marker);
  setTimeout(() => {
    const index = pulseMarkers.indexOf(marker);
    if (index > -1) {
      pulseMarkers.splice(index, 1);
      marker.remove();
    }
  }, 8500);
}

function startPulseMarkers() {
  if (pulseInterval || isHamburgView || !map) return;
  createPulseMarker();
  createPulseMarker();
  pulseInterval = setInterval(createPulseMarker, 1900);
}

function setMapMode(hamburgMode, targetView = null) {
  isHamburgView = hamburgMode;
  flyToView(targetView || (hamburgMode ? hamburgView : worldwideView));
  updateMapHeader();
  if (hamburgMode) stopPulseMarkers();
  else startPulseMarkers();
}

function setDockExpanded(shouldExpand) {
  mapDock.classList.toggle('expanded', shouldExpand);
  mapScreen.classList.toggle('dock-is-expanded', shouldExpand);
  dockToggle.setAttribute('aria-expanded', String(shouldExpand));
  document.querySelector('.dock-expanded').setAttribute('aria-hidden', String(!shouldExpand));
}

function closeDock() { setDockExpanded(false); }
function toggleDock() { setDockExpanded(!mapDock.classList.contains('expanded')); }

function setModalState() {
  const isOpen = searchPanel.classList.contains('open') || profilePanel.classList.contains('open') || mapStylePanel.classList.contains('open') || characterPanel.classList.contains('open') || settingsPanel.classList.contains('open');
  mapScreen.classList.toggle('modal-open', isOpen);
}

/* Click anywhere outside an open panel to dismiss it. */
mapScreen.addEventListener('click', (event) => {
  if (!mapScreen.classList.contains('modal-open')) return;
  const clickedInsidePanel = event.target.closest('.search-panel, .profile-panel, .map-style-panel, .character-panel, .settings-panel');
  if (clickedInsidePanel) return;
  /* Let controls (buttons, inputs, links) with their own handlers work
     without immediately closing the panel that opening them just opened. */
  if (event.target.closest('button, a, input, textarea, select, label')) return;
  closeSearchPanel();
  closeProfilePanel();
  closeMapStylePanel();
  closeCharacterPanel();
  closeSettingsPanel();
});

function openSearchPanel(query = '') {
  closeDock();
  closeProfilePanel();
  closeMapStylePanel();
  searchInput.value = query;
  searchPanel.classList.add('open');
  searchPanel.setAttribute('aria-hidden', 'false');
  setModalState();
  setTimeout(() => searchInput.focus(), 280);
}

function closeSearchPanel() {
  searchPanel.classList.remove('open');
  searchPanel.setAttribute('aria-hidden', 'true');
  setModalState();
}

function openProfilePanel() {
  closeDock();
  closeSearchPanel();
  closeMapStylePanel();
  profilePanel.classList.add('open');
  profilePanel.setAttribute('aria-hidden', 'false');
  setModalState();
}

function closeProfilePanel() {
  profilePanel.classList.remove('open');
  profilePanel.setAttribute('aria-hidden', 'true');
  setModalState();
}

function openMapStylePanel() {
  closeDock();
  closeSearchPanel();
  closeProfilePanel();
  mapStylePanel.classList.add('open');
  mapStylePanel.setAttribute('aria-hidden', 'false');
  setModalState();
}

function closeMapStylePanel() {
  mapStylePanel.classList.remove('open');
  mapStylePanel.setAttribute('aria-hidden', 'true');
  setModalState();
}

function searchForPlace(rawQuery) {
  const query = rawQuery.trim().toLowerCase();
  const target = hamburgSearchPlaces.find((place) => place.label.toLowerCase().includes(query)) || hamburgSearchPlaces[0];
  setMapMode(true, target);
  closeSearchPanel();
}

function locateUser() {
  if (!navigator.geolocation) return showToast('Location is not supported by this browser.');
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      if (!map) return showToast('Add your Mapbox token to show the map.');
      if (userMarker) userMarker.remove();
      const element = document.createElement('div');
      element.className = 'user-marker';
      userMarker = new mapboxgl.Marker({ element, anchor: 'center' })
        .setLngLat([coords.longitude, coords.latitude])
        .setPopup(new mapboxgl.Popup({ offset: 18, closeButton: false }).setText('You are here'))
        .addTo(map);
      map.flyTo({ center: [coords.longitude, coords.latitude], zoom: 15, pitch: 52, bearing: -18, duration: 1000, essential: true });
      updateTemperature(coords.latitude, coords.longitude);
      hideLocationNotice();
    },
    () => showLocationNotice(),
    { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
  );
}

function setMapStyle(styleName) {
  if (!map) return showToast('Add your Mapbox token to switch map appearance.');
  activeMapStyle = styleName;
  map.setStyle(MAPBOX_STYLES[styleName]);
  document.querySelectorAll('.map-mode').forEach((button) => button.classList.toggle('active', button.dataset.mapStyle === styleName));
  closeMapStylePanel();
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}

function showLocationNotice() {
  clearTimeout(locationNoticeTimer);
  locationNotice.classList.add('show');
  locationNoticeTimer = setTimeout(hideLocationNotice, 6500);
}

function hideLocationNotice() {
  clearTimeout(locationNoticeTimer);
  locationNotice.classList.remove('show');
}

function getWeatherSymbol(weatherCode) {
  if ([0, 1].includes(weatherCode)) return '☀︎';
  if ([2, 3, 45, 48].includes(weatherCode)) return '☁︎';
  if ([51, 53, 55, 56, 57, 61, 63, 65, 80, 81, 82].includes(weatherCode)) return '☂︎';
  return '☀︎';
}

async function updateTemperature(latitude = hamburgView.coords[0], longitude = hamburgView.coords[1]) {
  try {
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`);
    if (!response.ok) throw new Error('Weather service unavailable');
    const data = await response.json();
    if (typeof data.current?.temperature_2m !== 'number') return;
    temperatureValue.textContent = `${Math.round(data.current.temperature_2m)}°`;
    document.querySelector('.weather-symbol').textContent = getWeatherSymbol(data.current.weather_code);
  } catch (error) {
    console.warn('Temperature could not be loaded:', error);
  }
}

function addSwipeToDismiss(panel, closePanel) {
  let startY = null;
  panel.addEventListener('pointerdown', (event) => {
    if (event.target.closest('button, input, a')) return;
    startY = event.clientY;
  });
  panel.addEventListener('pointerup', (event) => {
    if (startY === null) return;
    const distance = event.clientY - startY;
    startY = null;
    if (distance > 60) closePanel();
  });
  panel.addEventListener('pointercancel', () => { startY = null; });
}

worldwideToggle.addEventListener('click', () => setMapMode(!isHamburgView));
document.querySelector('#locate-me').addEventListener('click', locateUser);
document.querySelector('#map-style').addEventListener('click', openMapStylePanel);
dockToggle.addEventListener('click', () => {
  if (skipDockClick) { skipDockClick = false; return; }
  toggleDock();
});
document.querySelector('#close-dock').addEventListener('click', closeDock);
document.querySelector('#search-toggle').addEventListener('click', () => openSearchPanel());
document.querySelector('#search-close').addEventListener('click', closeSearchPanel);
document.querySelector('#profile-toggle').addEventListener('click', openProfilePanel);
document.querySelector('#profile-close').addEventListener('click', closeProfilePanel);
document.querySelector('#map-style-close').addEventListener('click', closeMapStylePanel);
document.querySelector('#location-notice-close').addEventListener('click', hideLocationNotice);
document.querySelector('#report-sighting').addEventListener('click', () => showToast('Sighting reporting is coming soon.'));
document.querySelector('#mobile-report-sighting').addEventListener('click', () => showToast('Sighting reporting is coming soon.'));
document.querySelector('#view-sightings').addEventListener('click', () => showToast('No sightings nearby yet.'));

document.querySelector('#search-form').addEventListener('submit', (event) => {
  event.preventDefault();
  searchForPlace(searchInput.value);
});
document.querySelectorAll('.recent-item').forEach((button) => button.addEventListener('click', () => searchForPlace(button.dataset.place)));
document.querySelectorAll('.nearby-item, .quick-action').forEach((button) => button.addEventListener('click', () => openSearchPanel(button.dataset.search)));
document.querySelectorAll('.map-mode').forEach((button) => button.addEventListener('click', () => setMapStyle(button.dataset.mapStyle)));

dockToggle.addEventListener('pointerdown', (event) => {
  dockPointerStart = event.clientY;
  event.currentTarget.setPointerCapture?.(event.pointerId);
});
dockToggle.addEventListener('pointerup', (event) => {
  if (dockPointerStart === null) return;
  const movement = event.clientY - dockPointerStart;
  dockPointerStart = null;
  if (Math.abs(movement) < 28) return;
  setDockExpanded(movement < 0);
  skipDockClick = true;
});
dockToggle.addEventListener('pointercancel', () => { dockPointerStart = null; });

addSwipeToDismiss(searchPanel, closeSearchPanel);
addSwipeToDismiss(profilePanel, closeProfilePanel);
addSwipeToDismiss(mapStylePanel, closeMapStylePanel);

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  closeSearchPanel();
  closeProfilePanel();
  closeMapStylePanel();
  closeCharacterPanel();
  closeSettingsPanel();
  closeDock();
});

initialiseMap();
updateMapHeader();
updateTemperature();

const welcomeScreen = document.querySelector('#welcome-screen');
const authScreen = document.querySelector('#auth-screen');
const authForm = document.querySelector('#auth-form');
const characterPanel = document.querySelector('#character-panel');
const settingsPanel = document.querySelector('#settings-panel');
const appConfig = window.SPIDERTRACKER_CONFIG || {};
let supabaseClient = null;
let authMode = 'signup';
let currentUser = null;
let character = {
  displayName: 'Explorer',
  username: 'explorer',
  pronouns: '',
  bio: '',
  avatarUrl: '',
  bannerUrl: '',
  color: 'violet',
  style: 'orbit'
};

function normalizeSupabaseUrl(value) {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.includes('supabase.co')) return `https://${trimmed}`;
  return `https://${trimmed}.supabase.co`;
}

function getSupabaseConfig() {
  const url = normalizeSupabaseUrl(appConfig.supabaseUrl);
  const anonKey = typeof appConfig.supabaseAnonKey === 'string' ? appConfig.supabaseAnonKey.trim() : '';
  return { url, anonKey };
}

function isSupabaseConfigured() {
  const { url, anonKey } = getSupabaseConfig();
  return url.startsWith('https://')
    && url.includes('supabase.co')
    && anonKey.length > 20
    && !anonKey.includes('PASTE_');
}

function getAuthRedirectUrl() {
  if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
    return `${window.location.origin}${window.location.pathname}${window.location.search}`;
  }
  return 'http://localhost:3000/';
}

const supabaseConfig = getSupabaseConfig();
supabaseClient = isSupabaseConfigured() && window.supabase
  ? window.supabase.createClient(supabaseConfig.url, supabaseConfig.anonKey)
  : null;

function showWelcome() { welcomeScreen.classList.add('show'); }
function hideWelcome() { welcomeScreen.classList.remove('show'); }
function openAuth(mode = 'signup') {
  authMode = mode;
  const isSignIn = mode === 'signin';
  document.querySelector('#auth-title').textContent = isSignIn ? 'Welcome back' : 'Create account';
  document.querySelector('#auth-copy').textContent = isSignIn ? 'Sign in to continue your sightings.' : 'Save sightings and make your profile yours.';
  document.querySelector('#auth-submit').textContent = isSignIn ? 'Sign in' : 'Create account';
  document.querySelector('#auth-switch').textContent = isSignIn ? 'New here? Create an account' : 'Already have an account? Sign in';
  authScreen.classList.add('show');
  authScreen.setAttribute('aria-hidden', 'false');
}
function closeAuth() {
  authScreen.classList.remove('show');
  authScreen.setAttribute('aria-hidden', 'true');
}
function updateImageElement(element, imageUrl, fallbackText) {
  if (!element) return;
  if (imageUrl) {
    element.style.backgroundImage = `url("${imageUrl}")`;
    element.classList.add('has-image');
  } else {
    element.style.backgroundImage = '';
    element.classList.remove('has-image');
  }
  const initial = element.querySelector('#character-initial');
  if (initial) {
    initial.textContent = fallbackText;
  } else {
    element.textContent = fallbackText;
  }
}

function updateBannerElement(element, imageUrl) {
  if (!element) return;
  if (imageUrl) {
    element.style.backgroundImage = `url("${imageUrl}")`;
    element.classList.add('has-image');
  } else {
    element.style.backgroundImage = '';
    element.classList.remove('has-image');
  }
}

async function uploadProfileImage(file, folder, fieldLabel) {
  if (!supabaseClient) {
    showToast('Sign in and add your Supabase URL in config.js first.');
    return null;
  }
  if (!currentUser) {
    showToast('Sign in to upload pictures.');
    return null;
  }
  if (!file) return null;
  const extension = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
  const safeExtension = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'].includes(extension) ? extension : 'jpg';
  const filePath = `${currentUser.id}/${folder}-${Date.now()}.${safeExtension}`;
  const { error } = await supabaseClient.storage
    .from('profile-images')
    .upload(filePath, file, { cacheControl: '3600', upsert: false });
  if (error) {
    console.error('Upload failed:', error);
    showToast(error.message === 'The resource already exists' ? 'Upload failed, try again.' : `Upload failed: ${error.message}`);
    return null;
  }
  const { data: { publicUrl } } = supabaseClient.storage.from('profile-images').getPublicUrl(filePath);
  return publicUrl;
}

function updateTextDisplay(selector, text, prefix = '') {
  const element = document.querySelector(selector);
  if (!element) return;
  element.textContent = text ? `${prefix}${text}` : '';
  element.style.display = text ? '' : 'none';
}

function applyCharacter(nextCharacter) {
  character = { ...character, ...nextCharacter };
  const initial = character.displayName.trim().charAt(0).toUpperCase() || 'E';
  const accentClass = `panel-accent-${character.color}`;
  const styleClass = `panel-style-${character.style}`;
  const profilePanel = document.querySelector('#profile-panel');
  if (profilePanel) {
    profilePanel.classList.remove(
      'panel-accent-violet', 'panel-accent-coral', 'panel-accent-ocean', 'panel-accent-moss',
      'panel-style-orbit', 'panel-style-glow', 'panel-style-sunset'
    );
    profilePanel.classList.add(accentClass, styleClass);
  }
  document.querySelector('#profile-name').textContent = character.displayName;
  const characterPreview = document.querySelector('#character-preview');
  let initialElement = document.querySelector('#character-initial');
  if (!initialElement && characterPreview) {
    initialElement = document.createElement('span');
    initialElement.id = 'character-initial';
    characterPreview.appendChild(initialElement);
  }
  if (initialElement) initialElement.textContent = initial;
  document.querySelector('#character-name').value = character.displayName;
  document.querySelector('#character-username').value = character.username;
  document.querySelector('#character-pronouns').value = character.pronouns;
  document.querySelector('#character-bio').value = character.bio;
  updateTextDisplay('#profile-pronouns', character.pronouns);
  updateTextDisplay('#profile-username', character.username ? `@${character.username}` : '');
  updateTextDisplay('#profile-bio', character.bio);
  updateImageElement(document.querySelector('#profile-avatar'), character.avatarUrl, initial);
  updateImageElement(document.querySelector('#character-preview'), character.avatarUrl, initial);
  updateBannerElement(document.querySelector('#profile-banner'), character.bannerUrl);
  updateBannerElement(document.querySelector('#character-banner-preview'), character.bannerUrl);
  const profileTrigger = document.querySelector('#profile-toggle');
  const triggerInitial = profileTrigger?.querySelector('span');
  if (profileTrigger) {
    if (character.avatarUrl) {
      profileTrigger.style.backgroundImage = `url("${character.avatarUrl}")`;
      profileTrigger.classList.add('has-image');
      if (triggerInitial) triggerInitial.textContent = '';
    } else {
      profileTrigger.style.backgroundImage = '';
      profileTrigger.classList.remove('has-image');
      if (triggerInitial) triggerInitial.textContent = initial;
    }
  }
  [document.querySelector('#profile-avatar'), document.querySelector('#character-preview')].forEach((element) => {
    if (!element) return;
    element.classList.remove('character-color-violet', 'character-color-coral', 'character-color-ocean', 'character-color-moss', 'character-style-orbit', 'character-style-glow', 'character-style-sunset');
    element.classList.add(`character-color-${character.color}`, `character-style-${character.style}`);
  });
  document.querySelectorAll('.swatch').forEach((button) => button.classList.toggle('active', button.dataset.value === character.color));
  document.querySelectorAll('.style-choice').forEach((button) => button.classList.toggle('active', button.dataset.value === character.style));
}

async function loadProfile(user) {
  const fallbackName = user.user_metadata?.display_name || user.email?.split('@')[0] || 'Explorer';
  const fallbackUsername = fallbackName.toLowerCase().replace(/\s+/g, '') || 'explorer';
  let profile = {
    displayName: fallbackName,
    username: fallbackUsername,
    pronouns: '',
    bio: '',
    avatarUrl: '',
    bannerUrl: '',
    color: 'violet',
    style: 'orbit'
  };
  if (supabaseClient) {
    const { data, error } = await supabaseClient.from('profiles').select('display_name, username, pronouns, bio, avatar_url, banner_url, character_color, character_style').eq('id', user.id).maybeSingle();
    if (data) profile = {
      displayName: data.display_name,
      username: data.username || fallbackUsername,
      pronouns: data.pronouns || '',
      bio: data.bio || '',
      avatarUrl: data.avatar_url || '',
      bannerUrl: data.banner_url || '',
      color: data.character_color,
      style: data.character_style
    };
    else if (error && error.code !== 'PGRST116') console.warn('Profile could not be loaded:', error.message);
  }
  applyCharacter(profile);
}

async function setSignedInUser(user) {
  currentUser = user;
  localStorage.removeItem('spidertracker-guest');
  hideWelcome();
  closeAuth();
  await loadProfile(user);
}

async function initialiseAccounts() {
  if (supabaseClient) {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session?.user) {
      await setSignedInUser(session.user);
      return;
    }
    supabaseClient.auth.onAuthStateChange((_event, session) => {
      if (session?.user) setSignedInUser(session.user);
    });
  }
  if (localStorage.getItem('spidertracker-guest') === 'true') {
    return;
  }
  showWelcome();
}

async function submitAuth(event) {
  event.preventDefault();
  if (!supabaseClient) return showToast('Add your Supabase URL and anon key in config.js first.');
  const email = document.querySelector('#auth-email').value.trim();
  const password = document.querySelector('#auth-password').value;
  const submit = document.querySelector('#auth-submit');
  submit.disabled = true;
  submit.textContent = authMode === 'signin' ? 'Signing in…' : 'Creating account…';
  const result = authMode === 'signin'
    ? await supabaseClient.auth.signInWithPassword({ email, password })
    : await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: email.split('@')[0] },
          emailRedirectTo: getAuthRedirectUrl()
        }
      });
  submit.disabled = false;
  submit.textContent = authMode === 'signin' ? 'Sign in' : 'Create account';
  if (result.error) return showToast(result.error.message);
  if (result.data?.session) {
    await setSignedInUser(result.data.session.user);
    return;
  }
  if (result.data?.user && authMode === 'signup') {
    closeAuth();
    showToast('Check your email to confirm your account.');
  }
}

async function signInWithDiscord() {
  if (!supabaseClient) return showToast('Add your Supabase URL and anon key in config.js first.');
  const { error } = await supabaseClient.auth.signInWithOAuth({
    provider: 'discord',
    options: {
      redirectTo: getAuthRedirectUrl(),
      scopes: 'identify email'
    }
  });
  if (error) showToast(error.message);
}

function openCharacterPanel() {
  closeSettingsPanel();
  if (!currentUser) {
    closeProfilePanel();
    openAuth('signup');
    return;
  }
  characterPanel.classList.add('open');
  characterPanel.setAttribute('aria-hidden', 'false');
  setModalState();
}
function closeCharacterPanel() {
  characterPanel.classList.remove('open');
  characterPanel.setAttribute('aria-hidden', 'true');
  setModalState();
}

function openSettingsPanel() {
  closeCharacterPanel();
  closeProfilePanel();
  populateSystemConsole();
  settingsPanel.classList.add('open');
  settingsPanel.setAttribute('aria-hidden', 'false');
  setModalState();
}
function closeSettingsPanel() {
  settingsPanel.classList.remove('open');
  settingsPanel.setAttribute('aria-hidden', 'true');
  setModalState();
}

function setSysValue(id, text, className = 'ok') {
  const element = document.querySelector(`#${id}`);
  if (!element) return;
  element.textContent = text;
  element.className = className;
}

function populateSystemConsole() {
  const appConfigState = window.SPIDERTRACKER_CONFIG || {};
  const mapboxConfigured = hasMapboxToken();
  const supabaseReady = Boolean(supabaseClient);
  const networkOnline = navigator.onLine;
  const guestFlag = localStorage.getItem('spidertracker-guest') === 'true';
  const locationSvc = localStorage.getItem('spidertracker-location-services') === 'true';
  const labMode = localStorage.getItem('spidertracker-lab-mode') === 'true';
  const mapEngine = typeof mapboxgl !== 'undefined' && mapboxgl.version ? `mapbox-gl ${mapboxgl.version}` : 'not loaded';
  const sessionLabel = currentUser
    ? currentUser.email
    : guestFlag
      ? 'guest session'
      : 'no session';

  /* SYS.INFO */
  setSysValue('sys-version', '1.0.0');
  setSysValue('sys-runtime', `${navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop'} · ${navigator.platform || 'unknown'}`);
  setSysValue('sys-viewport', `${window.innerWidth}×${window.innerHeight}`);
  setSysValue('sys-locale', navigator.language || 'unknown');
  setSysValue('sys-network', networkOnline ? 'online' : 'offline', networkOnline ? 'ok' : 'err');

  /* SYS.CONFIG */
  setSysValue('sys-mapbox', mapboxConfigured ? 'configured' : 'missing', mapboxConfigured ? 'ok' : 'err');
  setSysValue('sys-map-engine', mapEngine, typeof mapboxgl !== 'undefined' ? 'ok' : 'warn');
  setSysValue(
    'sys-supabase',
    supabaseReady ? 'connected' : appConfigState.supabaseUrl ? 'not configured' : 'no keys',
    supabaseReady ? 'ok' : 'warn'
  );
  setSysValue('sys-weather', 'open-meteo · reachable', networkOnline ? 'ok' : 'warn');

  /* SYS.MAP */
  setSysValue('sys-map-style', activeMapStyle);
  setSysValue('sys-region', isHamburgView ? 'Hamburg' : 'Worldwide', isHamburgView ? 'ok' : 'warn');
  setSysValue('sys-terrain', map && typeof map.getTerrain === 'function' && map.getTerrain() ? 'enabled' : 'disabled', map && map.getTerrain ? 'ok' : 'muted');
  setSysValue('sys-markers', `${pulseMarkers.length} live · ${userMarker ? '1 user' : 'no user marker'}`, pulseMarkers.length > 0 ? 'ok' : 'muted');

  /* SYS.USER */
  setSysValue('sys-session', currentUser ? 'authenticated' : guestFlag ? 'guest' : 'anonymous', currentUser ? 'ok' : guestFlag ? 'warn' : 'muted');
  setSysValue(
    'sys-identity',
    currentUser
      ? currentUser.email || currentUser.id?.slice(0, 8) || 'unknown'
      : guestFlag
        ? 'local only'
        : 'not signed in',
    currentUser ? 'ok' : 'muted'
  );
  setSysValue('sys-character', `${character.displayName} · ${character.style}`, 'ok');
  setSysValue('sys-guest', guestFlag ? 'true' : 'false', guestFlag ? 'warn' : 'muted');

  /* SYS.STORE */
  setSysValue('sys-location', locationSvc ? 'enabled' : 'disabled', locationSvc ? 'ok' : 'muted');
  setSysValue('sys-lab', labMode ? 'enabled' : 'disabled', labMode ? 'warn' : 'muted');
}

function setSettingsTab(tabName) {
  document.querySelectorAll('.settings-tab').forEach((button) => button.classList.toggle('active', button.dataset.settingsTab === tabName));
  document.querySelectorAll('.settings-content').forEach((panel) => {
    const isActive = panel.dataset.settingsView === tabName;
    panel.hidden = !isActive;
  });
}

function updateSettingsToggles() {
  const locationEnabled = localStorage.getItem('spidertracker-location-services') === 'true';
  const labEnabled = localStorage.getItem('spidertracker-lab-mode') === 'true';
  const locationToggle = document.querySelector('#location-services-toggle');
  const labToggle = document.querySelector('#lab-mode-toggle');
  locationToggle?.setAttribute('aria-pressed', String(locationEnabled));
  labToggle?.setAttribute('aria-pressed', String(labEnabled));
}

async function saveCharacter() {
  const displayName = document.querySelector('#character-name').value.trim() || 'Explorer';
  const username = document.querySelector('#character-username').value.trim() || 'explorer';
  const pronouns = document.querySelector('#character-pronouns').value.trim();
  const bio = document.querySelector('#character-bio').value.trim();
  applyCharacter({ displayName, username, pronouns, bio });
  if (!currentUser || !supabaseClient) return showToast('Sign in to save your character.');
  const { error } = await supabaseClient.from('profiles').upsert({
    id: currentUser.id,
    display_name: character.displayName,
    username: character.username,
    pronouns: character.pronouns,
    bio: character.bio,
    avatar_url: character.avatarUrl,
    banner_url: character.bannerUrl,
    character_color: character.color,
    character_style: character.style,
    updated_at: new Date().toISOString()
  });
  if (error) return showToast('Run supabase-schema.sql, then try again.');
  closeCharacterPanel();
  showToast('Character saved.');
}

document.querySelectorAll('[data-auth-mode]').forEach((button) => button.addEventListener('click', () => openAuth(button.dataset.authMode)));
document.querySelector('#continue-guest').addEventListener('click', () => {
  localStorage.setItem('spidertracker-guest', 'true');
  hideWelcome();
});
document.querySelector('#auth-close').addEventListener('click', () => { closeAuth(); showWelcome(); });
document.querySelector('#auth-switch').addEventListener('click', () => openAuth(authMode === 'signin' ? 'signup' : 'signin'));
authForm.addEventListener('submit', submitAuth);
document.querySelector('#discord-login').addEventListener('click', signInWithDiscord);
document.querySelector('#profile-avatar').addEventListener('click', openCharacterPanel);
document.querySelector('#open-character').addEventListener('click', openCharacterPanel);
document.querySelector('#open-settings').addEventListener('click', openSettingsPanel);
document.querySelector('#character-close').addEventListener('click', closeCharacterPanel);
document.querySelector('#settings-close').addEventListener('click', closeSettingsPanel);
document.querySelector('#save-character').addEventListener('click', saveCharacter);
function bindUploadPreview(previewSelector, inputSelector, folder, label) {
  const preview = document.querySelector(previewSelector);
  const input = document.querySelector(inputSelector);
  preview.addEventListener('click', () => input.click());
  preview.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      input.click();
    }
  });
  input.addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const publicUrl = await uploadProfileImage(file, folder, label);
    if (publicUrl) {
      applyCharacter({ [folder === 'avatar' ? 'avatarUrl' : 'bannerUrl']: publicUrl });
      showToast(`${label} uploaded. Save your profile to keep it.`);
    }
    event.target.value = '';
  });
}
bindUploadPreview('#character-preview', '#avatar-upload-input', 'avatar', 'Avatar');
bindUploadPreview('#character-banner-preview', '#banner-upload-input', 'banner', 'Banner');
function readCharacterForm() {
  return {
    displayName: document.querySelector('#character-name').value.trim() || 'Explorer',
    username: document.querySelector('#character-username').value.trim() || 'explorer',
    pronouns: document.querySelector('#character-pronouns').value.trim(),
    bio: document.querySelector('#character-bio').value.trim()
  };
}

document.querySelectorAll('.swatch').forEach((button) => button.addEventListener('click', () => applyCharacter({ ...readCharacterForm(), color: button.dataset.value })));
document.querySelectorAll('.style-choice').forEach((button) => button.addEventListener('click', () => applyCharacter({ ...readCharacterForm(), style: button.dataset.value })));
document.querySelectorAll('.settings-tab').forEach((button) => button.addEventListener('click', () => setSettingsTab(button.dataset.settingsTab)));
document.querySelector('#location-services-toggle').addEventListener('click', () => {
  const nextState = document.querySelector('#location-services-toggle').getAttribute('aria-pressed') !== 'true';
  document.querySelector('#location-services-toggle').setAttribute('aria-pressed', String(nextState));
  localStorage.setItem('spidertracker-location-services', String(nextState));
  showToast(nextState ? 'Location services enabled.' : 'Location services disabled.');
});
document.querySelector('#lab-mode-toggle').addEventListener('click', () => {
  const nextState = document.querySelector('#lab-mode-toggle').getAttribute('aria-pressed') !== 'true';
  document.querySelector('#lab-mode-toggle').setAttribute('aria-pressed', String(nextState));
  localStorage.setItem('spidertracker-lab-mode', String(nextState));
  showToast(nextState ? 'Labs enabled for early access.' : 'Labs disabled.');
});

document.querySelector('#change-email').addEventListener('click', async () => {
  if (!currentUser || !supabaseClient) return showToast('Sign in to change your email.');
  const nextEmail = window.prompt('Enter a new email address');
  if (!nextEmail) return;
  const { error } = await supabaseClient.auth.updateUser({ email: nextEmail.trim() });
  if (error) return showToast(error.message);
  showToast('Email update requested. Check your inbox.');
});

document.querySelector('#change-password').addEventListener('click', async () => {
  if (!currentUser || !supabaseClient) return showToast('Sign in to change your password.');
  const nextPassword = window.prompt('Enter a new password');
  if (!nextPassword) return;
  const { error } = await supabaseClient.auth.updateUser({ password: nextPassword });
  if (error) return showToast(error.message);
  showToast('Password updated.');
});

document.querySelector('#sign-out').addEventListener('click', async () => {
  if (supabaseClient) await supabaseClient.auth.signOut();
  currentUser = null;
  localStorage.removeItem('spidertracker-guest');
  closeSettingsPanel();
  showWelcome();
  showToast('Signed out.');
});

document.querySelector('#delete-account').addEventListener('click', async () => {
  if (!currentUser && !supabaseClient) {
    showToast('No active account to remove.');
    return;
  }
  const confirmed = window.confirm('This will clear your local account session and remove the profile from this device.');
  if (!confirmed) return;
  if (supabaseClient) await supabaseClient.auth.signOut();
  currentUser = null;
  localStorage.removeItem('spidertracker-guest');
  closeSettingsPanel();
  showWelcome();
  showToast('Account removed from this device.');
});
addSwipeToDismiss(characterPanel, closeCharacterPanel);
addSwipeToDismiss(settingsPanel, closeSettingsPanel);
applyCharacter(character);
updateSettingsToggles();
setSettingsTab('account');
initialiseAccounts();
