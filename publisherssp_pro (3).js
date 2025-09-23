// --- State ---
const state = {
  step: 1,
  websites: [],
  selections: {
    desktopFormats: [],
    mobileFormats: []
  },
  user: { name: '', email: '', phone: '' }
};

// --- Helpers ---
const safeUUID = () => {
  try { return (crypto && crypto.randomUUID) ? crypto.randomUUID() : null; } catch(e){ return null; }
};
const fallbackUUID = () => ('xxxxxxxy').replace(/[xy]/g, c => {
  const r = Math.random() * 16 | 0;
  const v = c === 'x' ? r : (r & 0x3 | 0x8);
  return v.toString(16);
});
const genId = () => (safeUUID() || fallbackUUID()).slice(0,8);
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const toast = (msg) => {
  const el = $('#toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2200);
};

// --- Demo Data (defaults) ---
const categories = ['News', 'Music', 'Sports', 'Finance'];
const countries = [
  { code: 'BR', name: 'Brazil' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'TH', name: 'Thailand' },
  { code: 'RO', name: 'Romania' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'Other', name: 'Other / Global' }
];
const adFormats = {
  desktop: [
    { name: 'Desktop Cube', demoUrl: 'https://cleveradvertising.com/demo/formats/cube/', value: 'desktop_cube' },
    { name: 'Desktop Offerwall', demoUrl: 'https://cleveradvertising.com/demo/formats/offerwall/inverted.html?v=2', value: 'desktop_offerwall' },
  ],
  mobile: [
    { name: 'Mobile Cube', demoUrl: 'https://cleveradvertising.com/demo/formats/mobile/cube/', value: 'mobile_cube' },
    { name: 'Mobile Offerwall', demoUrl: 'https://cleveradvertising.com/demo/formats/mobile/offerwall/inverted.html?v=2', value: 'mobile_offerwall' },
  ]
};


// --- CPM defaults (kept as fallback if external json doesn't include cpmData) ---
const cpmDataTable = [
  { category: 'Other', geo: 'Other', adFormat: 'desktop_cube', freqCap: 'Any', cpm: 0.46 },
  { category: 'Other', geo: 'Other', adFormat: 'mobile_cube',  freqCap: 'Any', cpm: 0.49 },
  { category: 'Other', geo: 'Other', adFormat: 'desktop_offerwall', freqCap: 'Any', cpm: 0.55 },
  { category: 'Other', geo: 'Other', adFormat: 'mobile_offerwall',  freqCap: 'Any', cpm: 0.63 },
];

// --- Dynamic Data Loader ---
async function loadExternalData() {
  try {
    const res = await fetch('publisherssp_data.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('No external data file found');
    const data = await res.json();

    if (Array.isArray(data.categories) && data.categories.length) {
      categories.splice(0, categories.length, ...data.categories);
    }
    if (Array.isArray(data.countries) && data.countries.length) {
      countries.splice(0, countries.length, ...data.countries);
    }

    if (Array.isArray(data.formats) && data.formats.length) {
      const d = data.formats.filter(f => f.group === 'desktop');
      const m = data.formats.filter(f => f.group === 'mobile');
      adFormats.desktop.splice(0, adFormats.desktop.length, ...d);
      adFormats.mobile.splice(0, adFormats.mobile.length, ...m);
    }
    if (Array.isArray(data.cpmData) && data.cpmData.length) {
      cpmDataTable.splice(0, cpmDataTable.length, ...data.cpmData);
    }

    // Rebuild UI with new datasets
    renderFormats();
    renderWebsites(); // Repaint cards to use updated GEO list/options
    toast('Data table loaded.');
  } catch (e) {
    console.warn('[SSP] External data not loaded, using defaults:', e.message);
  }
}

// --- Preview Functions ---
let previewIframe = null;

function showPreview(url, linkElement) {
  hidePreview();
  
  previewIframe = document.createElement('div');
  previewIframe.className = 'demo-preview';
  previewIframe.innerHTML = `
    <iframe src="${url}" frameborder="0" width="300" height="200"></iframe>
    <div class="preview-close">×</div>
  `;
  
  const rect = linkElement.getBoundingClientRect();
  previewIframe.style.cssText = `
    position: fixed;
    top: ${rect.bottom + 10}px;
    left: ${rect.left}px;
    background: white;
    border: 1px solid #ccc;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 1000;
    padding: 8px;
  `;
  
  document.body.appendChild(previewIframe);
  
  const closeBtn = previewIframe.querySelector('.preview-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', hidePreview);
    closeBtn.style.cssText = `
      position: absolute;
      top: 4px;
      right: 8px;
      cursor: pointer;
      font-size: 18px;
      color: #666;
    `;
  }
}

function hidePreview() {
  if (previewIframe) {
    previewIframe.remove();
    previewIframe = null;
  }
}

// --- UI Builders (created after DOM is ready) ---

function chip(format, group) {
  const el = document.createElement('button');
  el.type = 'button';
  el.className = 'chip';
  el.innerHTML = `${format.name} <a href="${format.demoUrl}" target="_blank" rel="noopener" class="demo-link">(demo)</a>`;
  
  const demoLink = el.querySelector('.demo-link');
  if (demoLink) {
    demoLink.addEventListener('mouseenter', (e) => {
      e.preventDefault();
      showPreview(format.demoUrl, e.target);
    });
    demoLink.addEventListener('mouseleave', hidePreview);
  }
  
  el.addEventListener('click', (e) => {
    if (e.target.classList.contains('demo-link')) return;
    const arr = state.selections[group];
    const idx = arr.indexOf(format.value);
    if (idx === -1) arr.push(format.value); else arr.splice(idx, 1);
    el.classList.toggle('selected');
    recalc();
    persist();
  });
  return el;
}

function renderFormats() {
  const desk = document.getElementById('desktopFormats');
  const mob  = document.getElementById('mobileFormats');
  if (!desk || !mob) return;
  desk.innerHTML = ''; mob.innerHTML = '';
  adFormats.desktop.forEach(f => desk.appendChild(chip(f, 'desktopFormats')));
  adFormats.mobile.forEach(f => mob.appendChild(chip(f, 'mobileFormats')));
  // Restore selections
  $$('.chip').forEach(ch => {
    const label = ch.textContent.split('(demo)')[0].trim();
    const fmt = [...adFormats.desktop, ...adFormats.mobile].find(f => f.name === label);
    if (fmt && (state.selections.desktopFormats.includes(fmt.value) || state.selections.mobileFormats.includes(fmt.value))) {
      ch.classList.add('selected');
    }
  });
}

// CPM logic
const findCpmMatch = (category, geo, adFormat) => {
  return cpmDataTable.find(row =>
    row.category === category &&
    row.geo === geo &&
    row.adFormat === adFormat
  );
};

function recalc() {
  console.log('Recalc called, websites:', state.websites.length); // Debug
  let totalMonthlyRevenue = 0;
  let totalImpressions = 0;
  let totalCpmWeighted = 0;

  state.websites.forEach(site => {
    console.log('Processing site:', site.category, site.mainGeo, site.desktopShare, site.mobileShare); // Debug
    const allFormats = [...state.selections.desktopFormats, ...state.selections.mobileFormats];
    
    let cpm = 0;
    let monthlyRevenue = 0;
    let siteImpressions = 0;
    
    // Only calculate if category, mainGeo, traffic shares are selected and formats exist
    if (site.category && site.mainGeo && allFormats.length && (site.desktopShare || site.mobileShare)) {
      const monthlyUsers = Number(site.uniqueUsers) || 0;
      const monthlyImps = monthlyUsers * 1.5;
      
      let totalRevenue = 0;
      let totalSiteImps = 0;
      let totalSiteCpmWeighted = 0;
      
      // Calculate desktop revenue
      if (site.desktopShare > 0) {
        const desktopFormats = state.selections.desktopFormats;
        if (desktopFormats.length) {
          let desktopCPM = 0;
          desktopFormats.forEach(adFormat => {
            let match = findCpmMatch(site.category, site.mainGeo, adFormat);
            if (!match) match = findCpmMatch('Other','Other', adFormat);
            desktopCPM += match ? match.cpm : 0.46; // fallback from divided values
          });
          desktopCPM = desktopCPM / desktopFormats.length;
          const desktopImps = monthlyImps * (site.desktopShare / 100);
          totalRevenue += (desktopImps * desktopCPM) / 1000;
          totalSiteImps += desktopImps;
          totalSiteCpmWeighted += desktopCPM * desktopImps;
        }
      }
      
      // Calculate mobile revenue
      if (site.mobileShare > 0) {
        const mobileFormats = state.selections.mobileFormats;
        if (mobileFormats.length) {
          let mobileCPM = 0;
          mobileFormats.forEach(adFormat => {
            let match = findCpmMatch(site.category, site.mainGeo, adFormat);
            if (!match) match = findCpmMatch('Other','Other', adFormat);
            mobileCPM += match ? match.cpm : 0.49; // fallback from divided values
          });
          mobileCPM = mobileCPM / mobileFormats.length;
          const mobileImps = monthlyImps * (site.mobileShare / 100);
          totalRevenue += (mobileImps * mobileCPM) / 1000;
          totalSiteImps += mobileImps;
          totalSiteCpmWeighted += mobileCPM * mobileImps;
        }
      }
      
      monthlyRevenue = totalRevenue;
      siteImpressions = totalSiteImps;
      cpm = siteImpressions > 0 ? totalSiteCpmWeighted / siteImpressions : 0;
      
      totalMonthlyRevenue += monthlyRevenue;
      totalImpressions += siteImpressions;
      totalCpmWeighted += totalSiteCpmWeighted;
    }

    const row = document.querySelector(`.website-card[data-id="${site.id}"]`);
    if (row) {
      const cpmEl = row.querySelector('.cpm');
      if (cpmEl) cpmEl.textContent = `$${cpm.toFixed(2)}`;
    }
    
    // Store revenue for review
    site.monthlyRevenue = monthlyRevenue;
    site.avgCpm = cpm;
  });

  const avgCpm = totalImpressions > 0 ? totalCpmWeighted / totalImpressions : 0;
  const yearly = totalMonthlyRevenue * 12;

  const kpiM = document.getElementById('kpiMonthly');
  const kpiY = document.getElementById('kpiYearly');
  const kpiC = document.getElementById('kpiCpm');
  if (kpiM) kpiM.textContent = `$${totalMonthlyRevenue.toFixed(2)}`;
  if (kpiY) kpiY.textContent = `$${yearly.toFixed(2)}`;
  if (kpiC) kpiC.textContent = `$${avgCpm.toFixed(2)}`;

  return { totalMonthlyRevenue, yearly, avgCpm };
}

// Persist (disabled)
function persist() {
  // Persistence disabled - always start fresh
}

// Websites
let websitesList;
function websiteRow(site) {
  const card = document.createElement('div');
  card.className = 'website-card';
  card.dataset.id = site.id;

  const meta = document.createElement('div');
  meta.className = 'meta';
  meta.innerHTML = `
    <div class="field">
      <label>Website URL</label>
      <input class="input-url" type="url" placeholder="https://www.example.com" value="${site.url || ''}" />
    </div>
    <div class="field">
      <label>Category</label>
      <select class="select-category">
        <option value="">Select category</option>
        ${categories.map(c => `<option ${site.category === c ? 'selected' : ''}>${c}</option>`).join('')}
      </select>
    </div>
    <div class="field">
      <label>Unique Users (30d)</label>
      <input class="input-users" type="number" min="1000" step="1000" placeholder="100000" value="${site.uniqueUsers || ''}" />
    </div>
  `;

  const geo = document.createElement('div');
  geo.className = 'geo';
  const opts = (sel) => countries.map(c => `<option value="${c.code}" ${sel === c.code ? 'selected' : ''}>${c.name}</option>`).join('');
  geo.innerHTML = `
    <div class="field">
      <label>Main GEO</label>
      <select class="geo-main"><option value="">Select</option>${opts(site.mainGeo)}</select>
      <input class="share-main" type="number" min="1" max="100" placeholder="% share" value="${site.mainGeoShare || ''}" />
    </div>
    <div class="field">
      <label>Secondary</label>
      <select class="geo-secondary"><option value="">Select</option>${opts(site.secondaryGeo)}</select>
      <input class="share-secondary" type="number" min="0" max="100" placeholder="% share" value="${site.secondaryGeoShare || ''}" />
    </div>
    <div class="field">
      <label>Other</label>
      <select class="geo-other"><option value="">Select</option>${opts(site.otherGeo)}</select>
      <input class="share-other" type="number" min="0" max="100" placeholder="% share" value="${site.otherGeoShare || ''}" />
    </div>
  `;

  const traffic = document.createElement('div');
  traffic.className = 'traffic';
  traffic.innerHTML = `
    <div class="field">
      <label>Desktop Traffic</label>
      <input class="desktop-share" type="number" min="0" max="100" placeholder="% desktop" value="${site.desktopShare || ''}" />
    </div>
    <div class="field">
      <label>Mobile Traffic</label>
      <input class="mobile-share" type="number" min="0" max="100" placeholder="% mobile" value="${site.mobileShare || ''}" />
    </div>
  `;

  const indicators = document.createElement('div');
  indicators.innerHTML = `
    <span class="badge"><span class="dot"></span><span class="sum-label">Share total: <strong class="sum">0%</strong></span></span>
    <span class="badge"><span class="dot"></span><span>Est. Avg CPM: <strong class="cpm">$0.00</strong></span></span>
  `;

  const actions = document.createElement('div');
  actions.className = 'actions';
  const rm = document.createElement('button');
  rm.className = 'btn';
  rm.textContent = 'Remove';
  rm.addEventListener('click', () => {
    state.websites = state.websites.filter(w => w.id !== site.id);
    renderWebsites();
    recalc();
  });
  actions.appendChild(rm);

  card.append(meta, geo, traffic, indicators, actions);

  const bind = () => {
    const urlEl = card.querySelector('.input-url');
    const catEl = card.querySelector('.select-category');
    const usersEl = card.querySelector('.input-users');
    const mainGeoEl = card.querySelector('.geo-main');
    const secGeoEl = card.querySelector('.geo-secondary');
    const otherGeoEl = card.querySelector('.geo-other');
    const mainShareEl = card.querySelector('.share-main');
    const secShareEl = card.querySelector('.share-secondary');
    const otherShareEl = card.querySelector('.share-other');
    const desktopEl = card.querySelector('.desktop-share');
    const mobileEl = card.querySelector('.mobile-share');
    
    if (!urlEl || !catEl || !usersEl) return;
    
    site.url = urlEl.value.trim();
    site.category = catEl.value;
    site.uniqueUsers = Number(usersEl.value || 0);
    site.mainGeo = mainGeoEl ? mainGeoEl.value : '';
    site.secondaryGeo = secGeoEl ? secGeoEl.value : '';
    site.otherGeo = otherGeoEl ? otherGeoEl.value : '';
    site.mainGeoShare = Number((mainShareEl ? mainShareEl.value : '') || 0);
    site.secondaryGeoShare = Number((secShareEl ? secShareEl.value : '') || 0);
    site.otherGeoShare = Number((otherShareEl ? otherShareEl.value : '') || 0);
    site.desktopShare = Number((desktopEl ? desktopEl.value : '') || 0);
    site.mobileShare = Number((mobileEl ? mobileEl.value : '') || 0);

    const totalGeoShare = (site.mainGeoShare || 0) + (site.secondaryGeoShare || 0) + (site.otherGeoShare || 0);
    const totalTrafficShare = (site.desktopShare || 0) + (site.mobileShare || 0);
    
    const sumEl = card.querySelector('.sum');
    const lblEl = card.querySelector('.sum-label');
    if (sumEl) sumEl.textContent = `GEO: ${totalGeoShare}% | Traffic: ${totalTrafficShare}%`;
    if (lblEl) lblEl.style.color = (totalGeoShare > 100 || totalTrafficShare > 100) ? 'var(--danger)' : 'inherit';
    
    console.log('Site updated:', site); // Debug
    recalc();
    persist();
  };
  
  card.addEventListener('input', bind);
  card.addEventListener('change', bind);
  bind();
  return card;
}

function renderWebsites() {
  if (!websitesList) websitesList = document.getElementById('websitesList');
  if (!websitesList) return;
  websitesList.innerHTML = '';
  state.websites.forEach(site => websitesList.appendChild(websiteRow(site)));
}

// Review
function review() {
  const block = document.getElementById('reviewBlock');
  if (!block) return;
  const { totalMonthlyRevenue, yearly, avgCpm } = recalc();
  const fmt = (arr) => arr.length ? arr.join(', ') : 'None';
  
  const websitesHtml = state.websites.map((w,i)=>`
    <div class="kpi-card">
      <div><strong>Website ${i+1}:</strong> ${w.url || '—'}</div>
      <div><small>${w.category || '—'} • Main: ${w.mainGeo || '—'} (${w.mainGeoShare||0}%) • ${w.uniqueUsers || 0} users</small></div>
      <div><small>Desktop: ${w.desktopShare||0}% • Mobile: ${w.mobileShare||0}%</small></div>
      <div><strong>CPM:</strong> $${(w.avgCpm || 0).toFixed(2)} • <strong>Monthly Revenue:</strong> $${(w.monthlyRevenue || 0).toFixed(2)}</div>
    </div>
  `).join('');
  
  block.innerHTML = `
    <div>
      <strong>Desktop Formats:</strong> ${fmt(state.selections.desktopFormats)}<br/>
      <strong>Mobile Formats:</strong> ${fmt(state.selections.mobileFormats)}
    </div>
    <hr/>
    ${websitesHtml}
    <hr/>
    <div class="kpi-grid">
      <div class="kpi-card"><div class="label">Total Monthly Revenue</div><div class="value">$${totalMonthlyRevenue.toFixed(2)}</div></div>
      <div class="kpi-card"><div class="label">Total Yearly Revenue</div><div class="value">$${yearly.toFixed(2)}</div></div>
      <div class="kpi-card"><div class="label">Avg CPM</div><div class="value">$${avgCpm.toFixed(2)}</div></div>
    </div>
  `;
}

// --- Validation ---
function validateStepTransition(currentStep, targetStep) {
  // Allow going backwards
  if (targetStep < currentStep) return true;
  
  // Validate step 1 -> 2
  if (currentStep === 1 && targetStep > 1) {
    if (!state.user.name || !state.user.email) {
      toast('Please fill in your name and email before continuing.');
      return false;
    }
  }
  
  // Validate step 2 -> 3
  if (currentStep === 2 && targetStep > 2) {
    if (!state.websites.length) {
      toast('Please add at least one website before continuing.');
      return false;
    }
    
    for (const [i, site] of state.websites.entries()) {
      if (!site.category) {
        toast(`Website ${i+1}: Please select a category.`);
        return false;
      }
      if (!site.mainGeo) {
        toast(`Website ${i+1}: Please select the main GEO.`);
        return false;
      }
      if (!site.uniqueUsers || site.uniqueUsers <= 0) {
        toast(`Website ${i+1}: Please enter the number of unique users.`);
        return false;
      }
      const trafficTotal = (site.desktopShare || 0) + (site.mobileShare || 0);
      if (trafficTotal === 0) {
        toast(`Website ${i+1}: Please fill in desktop and mobile traffic percentages.`);
        return false;
      }
      if (trafficTotal !== 100) {
        toast(`Website ${i+1}: Desktop + Mobile traffic must total exactly 100% (currently ${trafficTotal}%).`);
        return false;
      }
      
      const geoTotal = (site.mainGeoShare || 0) + (site.secondaryGeoShare || 0) + (site.otherGeoShare || 0);
      if (geoTotal !== 100) {
        toast(`Website ${i+1}: GEO shares must total exactly 100% (currently ${geoTotal}%).`);
        return false;
      }
    }
  }
  
  // Validate step 3 -> 4
  if (currentStep === 3 && targetStep > 3) {
    const allFormats = [...state.selections.desktopFormats, ...state.selections.mobileFormats];
    if (!allFormats.length) {
      toast('Please select at least one ad format before continuing.');
      return false;
    }
  }
  
  return true;
}

// --- Global Step Navigation ---
function setStep(n) {
  state.step = n;
  $$('.panel').forEach(p => p.classList.add('hidden'));
  const next = $(`.panel[data-step="${n}"]`);
  if (next) next.classList.remove('hidden');
  $$('.step').forEach(li => li.classList.toggle('active', Number(li.dataset.step) === n));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- Bootstrapping after DOM is ready ---

document.addEventListener('DOMContentLoaded', () => {
  // Cache elements
  websitesList = document.getElementById('websitesList');

  // Theme toggle
  const root = document.documentElement;
  const themeBtn = document.getElementById('themeToggle');
  if (themeBtn) themeBtn.addEventListener('click', () => root.classList.toggle('light'));
  
  // Close preview on click outside
  document.addEventListener('click', (e) => {
    if (previewIframe && !previewIframe.contains(e.target) && !e.target.classList.contains('demo-link')) {
      hidePreview();
    }
  });

  // Initialize step navigation
  setStep(1);
  
  // Stepper event listeners
  $$('.step').forEach(li => li.addEventListener('click', () => {
    const targetStep = Number(li.dataset.step);
    if (validateStepTransition(state.step, targetStep)) {
      setStep(targetStep);
    }
  }));
  $$('.panel .next').forEach(btn => btn.addEventListener('click', () => {
    if (validateStepTransition(state.step, state.step + 1)) {
      setStep(state.step + 1);
    }
  }));
  $$('.panel .prev').forEach(btn => btn.addEventListener('click', () => setStep(state.step - 1)));

  // Forms
  const nameEl = document.getElementById('name');
  const emailEl = document.getElementById('email');
  const phoneEl = document.getElementById('phone');

  const saveUser = () => {
    state.user.name = nameEl ? nameEl.value.trim() : '';
    state.user.email = emailEl ? emailEl.value.trim() : '';
    state.user.phone = phoneEl ? phoneEl.value.trim() : '';
    persist();
  };
  const publisherForm = document.getElementById('publisherForm');
  if (publisherForm) publisherForm.addEventListener('input', saveUser);

  // Always start fresh - no saved state restoration

  // Render baseline UI
  renderFormats();
  if (state.websites.length === 0) {
    addWebsiteCard();
  } else {
    renderWebsites();
  }

  // Apply defaults to avoid empty UI
  ensureDefaultFormats();
  renderFormats();
  recalc();

  // Add URL button
  const addBtn = document.getElementById('addWebsite');
  if (addBtn) addBtn.addEventListener('click', () => { addWebsiteCard(); highlightMissingUsers(); });

  // Review trigger
  const reviewPanelHeader = $$('.panel[data-step="4"] .panel-header')[0];
  if (reviewPanelHeader) reviewPanelHeader.addEventListener('click', review);
  $$('.panel .next').forEach(b => b.addEventListener('click', () => { if (state.step+1===4) review(); }));

  // Generate proposal with stronger validation
  const genBtn = document.getElementById('generateProposalBtn');
  if (genBtn) genBtn.addEventListener('click', () => {
    if (!state.user.name || !state.user.email) {
      toast('Please complete your contact details first.'); setStep(1); return;
    }
    if (!state.websites.length) {
      toast('Add at least one website.'); setStep(2); return;
    }
    ensureDefaultFormats();
    const allFormats = [...state.selections.desktopFormats, ...state.selections.mobileFormats];
    if (!allFormats.length) {
      toast('Select at least one ad format.'); setStep(3); return;
    }
    let missingUsers = false;
    for (const [i, w] of state.websites.entries()) {
      const geoTotal = (w.mainGeoShare||0)+(w.secondaryGeoShare||0)+(w.otherGeoShare||0);
      const trafficTotal = (w.desktopShare||0)+(w.mobileShare||0);
      if (geoTotal>100) { toast(`Website ${i+1}: GEO shares exceed 100% (${geoTotal}%).`); setStep(2); return; }
      if (trafficTotal>100) { toast(`Website ${i+1}: Traffic shares exceed 100% (${trafficTotal}%).`); setStep(2); return; }
      if (trafficTotal>0 && trafficTotal<100) { toast(`Website ${i+1}: Traffic shares must total 100% (currently ${trafficTotal}%).`); setStep(2); return; }
      if (!w.uniqueUsers || Number(w.uniqueUsers) <= 0) { missingUsers = true; }
    }
    if (missingUsers) {
      highlightMissingUsers();
      toast('Please fill "Unique users (30d)" for all websites.'); setStep(2); return;
    }

    const { totalMonthlyRevenue, yearly } = recalc();
    const result = document.getElementById('proposalResult');
    if (result) {
      result.classList.remove('hidden');
      result.innerHTML = `
        <h3>Estimated Proposal • ${state.user.name}</h3>
        <div class="grid">
          <div class="kpi-card"><div class="label">Total Monthly Revenue</div><div class="value">$${totalMonthlyRevenue.toFixed(2)}</div></div>
          <div class="kpi-card"><div class="label">Total Yearly Revenue</div><div class="value">$${yearly.toFixed(2)}</div></div>
          <div class="kpi-card"><div class="label">Contact</div><div class="value">${state.user.email}</div></div>
        </div>
        <hr/>
        ${state.websites.map((w,i)=>`
          <div class="kpi-card">
            <div><strong>Website ${i+1}:</strong> ${w.url || '—'}</div>
            <div><small>Category: ${w.category || '—'} | Unique users: ${w.uniqueUsers || 0}</small></div>
          </div>
        `).join('')}
        <p style="margin-top:12px;color:var(--muted)"><em>This is an automatic estimate. An account manager will follow up within 3 business days.</em></p>
      `;
      toast('Proposal generated.');
      result.scrollIntoView({ behavior: 'smooth' });
    }
  });

  // External data (JSON) loads last and repaints UI
  loadExternalData().then(() => { 
    ensureDefaultFormats(); 
    renderFormats(); 
    renderWebsites(); 
    recalc(); 
    highlightMissingUsers(); 
  }).catch(() => {
    // If external data fails, still initialize
    ensureDefaultFormats(); 
    renderFormats(); 
    renderWebsites(); 
    recalc();
  });

}); // DOMContentLoaded end


// Add Website helper
function addWebsiteCard(preset) {
  const id = genId();
  const site = Object.assign({
    id,
    url: '',
    category: '',
    uniqueUsers: '',
    mainGeo: '',
    mainGeoShare: '',
    secondaryGeo: '',
    secondaryGeoShare: '',
    otherGeo: '',
    otherGeoShare: '',
    desktopShare: '',
    mobileShare: ''
  }, preset || {});
  state.websites.push(site);
  renderWebsites();
  persist();
}

// Ensure default formats
function ensureDefaultFormats() {
  if (!state.selections.desktopFormats.length && !state.selections.mobileFormats.length) {
    if (adFormats.desktop[0]) state.selections.desktopFormats.push(adFormats.desktop[0].value);
    if (adFormats.mobile[0]) state.selections.mobileFormats.push(adFormats.mobile[0].value);
  }
}

// Highlight missing users
function highlightMissingUsers() {
  $$('.website-card').forEach(card => {
    const input = card.querySelector('.input-users');
    if (input && (!input.value || Number(input.value) <= 0)) {
      input.style.borderColor = 'var(--danger)';
      setTimeout(() => input.style.borderColor = '', 3000);
    }
  });
}
