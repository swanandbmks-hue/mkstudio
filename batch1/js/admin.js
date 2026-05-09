/**
 * MK Studio Pune — Admin Panel JavaScript
 * Full CMS: manage content, upload images/videos, edit all sections
 */
(function () {
  'use strict';

  let data = null;
  let currentPanel = 'dashboard';
  let uploadedFiles = { equipment: [], productions: [], gallery: [] };

  // ─── INIT ─────────────────────────────────────────────
  async function init() {
    await loadData();
    renderDashboard();
    renderServicesList();
    renderEquipmentList();
    renderProductionsList();
    renderGalleryMedia();
    renderTestimonialsList();
    populateSiteSettings();
    bindNav();
    bindForms();
    bindUploads();
    showPanel('dashboard');
  }

  async function loadData() {
    try {
      const res = await fetch('../data/content.json');
      data = await res.json();
    } catch (e) {
      data = getDefaultData();
    }
  }

  function saveData() {
    localStorage.setItem('mkstudio_content', JSON.stringify(data));
    showToast('Changes saved!', 'success');
    // In production: POST to save.php → writes to data/content.json
    saveToPHP();
  }

  function saveToPHP() {
    fetch('../admin/save.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).catch(() => {/* PHP not available in preview */});
  }

  // ─── NAV ──────────────────────────────────────────────
  function bindNav() {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const panel = item.dataset.panel;
        if (!panel) return;
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        item.classList.add('active');
        showPanel(panel);
        document.querySelector('.topbar-title').textContent = item.querySelector('.nav-label')?.textContent || 'Dashboard';
      });
    });
  }

  function showPanel(name) {
    currentPanel = name;
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.getElementById(`panel-${name}`)?.classList.add('active');
  }

  // ─── DASHBOARD ────────────────────────────────────────
  function renderDashboard() {
    const liveProds = data.productions?.filter(p => p.status === 'live').length || 0;
    const liveEquip = data.equipment?.filter(e => e.status === 'live').length || 0;
    const liveGallery = data.gallery?.length || 0;
    const liveTesti = data.testimonials?.filter(t => t.status === 'live').length || 0;
    document.getElementById('stat-productions').textContent = liveProds;
    document.getElementById('stat-equipment').textContent = liveEquip;
    document.getElementById('stat-gallery').textContent = liveGallery;
    document.getElementById('stat-testimonials').textContent = liveTesti;
  }

  // ─── SERVICES ─────────────────────────────────────────
  function renderServicesList() {
    const el = document.getElementById('servicesList');
    if (!el) return;
    el.innerHTML = (data.services || []).map(s => `
      <tr>
        <td><span style="font-size:1.4rem">${s.icon}</span></td>
        <td><strong>${s.title}</strong></td>
        <td style="max-width:300px;color:var(--sub);font-size:0.82rem">${s.description.substring(0,80)}…</td>
        <td><span class="badge badge-${s.status}">${s.status}</span></td>
        <td>
          <button class="tbl-action" onclick="editService('${s.id}')">Edit</button>
          <button class="tbl-action tbl-del" onclick="toggleStatus('services','${s.id}')">${s.status === 'live' ? 'Hide' : 'Show'}</button>
        </td>
      </tr>
    `).join('');
  }

  window.editService = function (id) {
    const s = data.services.find(x => x.id === id);
    if (!s) return;
    document.getElementById('svc-id').value = s.id;
    document.getElementById('svc-icon').value = s.icon;
    document.getElementById('svc-title').value = s.title;
    document.getElementById('svc-desc').value = s.description;
    document.getElementById('serviceEditCard').style.display = 'block';
    document.getElementById('serviceEditCard').scrollIntoView({ behavior: 'smooth' });
  };

  // ─── EQUIPMENT ────────────────────────────────────────
  function renderEquipmentList() {
    const el = document.getElementById('equipList');
    if (!el) return;
    el.innerHTML = (data.equipment || []).map(e => `
      <tr>
        <td><span style="font-size:1.4rem">${e.icon}</span></td>
        <td><strong>${e.title}</strong></td>
        <td style="max-width:260px;color:var(--sub);font-size:0.82rem">${e.description.substring(0,70)}…</td>
        <td>
          ${e.image ? `<img src="${e.image}" style="width:44px;height:44px;object-fit:cover;border-radius:8px;" alt="">` : '<span style="color:var(--sub);font-size:0.78rem">No image</span>'}
        </td>
        <td><span class="badge badge-${e.status}">${e.status}</span></td>
        <td>
          <button class="tbl-action" onclick="editEquipment('${e.id}')">Edit</button>
          <button class="tbl-action tbl-del" onclick="toggleStatus('equipment','${e.id}')">${e.status === 'live' ? 'Hide' : 'Show'}</button>
        </td>
      </tr>
    `).join('');
  }

  window.editEquipment = function (id) {
    const e = data.equipment.find(x => x.id === id);
    if (!e) return;
    document.getElementById('equip-id').value = e.id;
    document.getElementById('equip-icon').value = e.icon;
    document.getElementById('equip-title').value = e.title;
    document.getElementById('equip-desc').value = e.description;
    document.getElementById('equipEditCard').style.display = 'block';
    document.getElementById('equipEditCard').scrollIntoView({ behavior: 'smooth' });
  };

  // ─── PRODUCTIONS ──────────────────────────────────────
  function renderProductionsList() {
    const el = document.getElementById('prodList');
    if (!el) return;
    const labels = { film: 'Feature Film', short: 'Short Film', web: 'Web Series', ad: 'Advertisement' };
    el.innerHTML = (data.productions || []).map(p => `
      <tr>
        <td>
          ${p.image ? `<img src="${p.image}" style="width:60px;height:40px;object-fit:cover;border-radius:6px;" alt="">` : '<div style="width:60px;height:40px;background:var(--bg);border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:1.2rem">🎬</div>'}
        </td>
        <td><strong>${p.title}</strong><div style="font-size:0.75rem;color:var(--sub)">${p.year}</div></td>
        <td><span class="badge badge-${p.status === 'live' ? 'live' : 'draft'}" style="font-size:0.7rem">${labels[p.category] || p.category}</span></td>
        <td style="max-width:220px;font-size:0.82rem;color:var(--sub)">${(p.description||'').substring(0,60)}…</td>
        <td><span class="badge badge-${p.status}">${p.status}</span></td>
        <td>
          <button class="tbl-action" onclick="editProduction('${p.id}')">Edit</button>
          <button class="tbl-action tbl-del" onclick="toggleStatus('productions','${p.id}')">${p.status === 'live' ? 'Hide' : 'Show'}</button>
          <button class="tbl-action tbl-del" onclick="deleteItem('productions','${p.id}')">Delete</button>
        </td>
      </tr>
    `).join('');
  }

  window.editProduction = function (id) {
    const p = data.productions.find(x => x.id === id);
    if (!p) return;
    document.getElementById('prod-id').value = p.id;
    document.getElementById('prod-title').value = p.title;
    document.getElementById('prod-year').value = p.year;
    document.getElementById('prod-category').value = p.category;
    document.getElementById('prod-description').value = p.description;
    document.getElementById('prod-youtube').value = p.youtube || '';
    document.getElementById('prodEditCard').style.display = 'block';
    document.getElementById('prodEditCard').scrollIntoView({ behavior: 'smooth' });
  };

  window.addNewProduction = function () {
    const newId = 'p' + Date.now();
    data.productions.push({ id: newId, category: 'film', title: 'New Production', year: new Date().getFullYear().toString(), description: '', image: '', youtube: '', status: 'draft' });
    renderProductionsList();
    window.editProduction(newId);
  };

  // ─── GALLERY ──────────────────────────────────────────
  function renderGalleryMedia() {
    const el = document.getElementById('galleryMediaGrid');
    if (!el) return;
    if (!data.gallery || data.gallery.length === 0) {
      el.innerHTML = '<p style="color:var(--sub);grid-column:1/-1;text-align:center;padding:30px">No gallery items yet. Upload images or videos above.</p>';
      return;
    }
    el.innerHTML = data.gallery.map(item => `
      <div class="media-thumb">
        <div class="thumb-placeholder">
          ${item.thumb ? `<img src="${item.thumb}" alt="" style="width:100%;height:100%;object-fit:cover;">` : (item.type === 'video' ? '🎞️' : '🖼️')}
        </div>
        <div class="thumb-name">${item.caption || item.url.split('/').pop()}</div>
        <div class="thumb-actions">
          <button class="thumb-btn thumb-btn-del" onclick="removeGalleryItem('${item.id}')">✕</button>
        </div>
      </div>
    `).join('');
  }

  window.removeGalleryItem = function (id) {
    if (!confirm('Remove this item from gallery?')) return;
    data.gallery = data.gallery.filter(g => g.id !== id);
    renderGalleryMedia();
    renderDashboard();
    showToast('Item removed', 'success');
  };

  // ─── TESTIMONIALS ─────────────────────────────────────
  function renderTestimonialsList() {
    const el = document.getElementById('testiList');
    if (!el) return;
    el.innerHTML = (data.testimonials || []).map(t => `
      <tr>
        <td><strong>${t.name}</strong><div style="font-size:0.75rem;color:var(--sub)">${t.role}</div></td>
        <td style="max-width:300px;font-size:0.82rem;font-style:italic;color:var(--sub)">"${t.text.substring(0,80)}…"</td>
        <td style="color:#FF9F0A;letter-spacing:2px">${'★'.repeat(t.stars)}</td>
        <td><span class="badge badge-${t.status}">${t.status}</span></td>
        <td>
          <button class="tbl-action" onclick="editTestimonial('${t.id}')">Edit</button>
          <button class="tbl-action tbl-del" onclick="toggleStatus('testimonials','${t.id}')">${t.status === 'live' ? 'Hide' : 'Show'}</button>
          <button class="tbl-action tbl-del" onclick="deleteItem('testimonials','${t.id}')">Delete</button>
        </td>
      </tr>
    `).join('');
  }

  window.editTestimonial = function (id) {
    const t = data.testimonials.find(x => x.id === id);
    if (!t) return;
    document.getElementById('testi-id').value = t.id;
    document.getElementById('testi-name').value = t.name;
    document.getElementById('testi-role').value = t.role;
    document.getElementById('testi-text').value = t.text;
    document.getElementById('testi-stars').value = t.stars;
    document.getElementById('testiEditCard').style.display = 'block';
    document.getElementById('testiEditCard').scrollIntoView({ behavior: 'smooth' });
  };

  window.addNewTestimonial = function () {
    const newId = 't' + Date.now();
    data.testimonials.push({ id: newId, name: 'Client Name', role: 'Role, City', text: 'Write testimonial here...', stars: 5, status: 'draft' });
    renderTestimonialsList();
    window.editTestimonial(newId);
  };

  // ─── SITE SETTINGS ────────────────────────────────────
  function populateSiteSettings() {
    if (!data.site) return;
    document.getElementById('set-name')?.setAttribute('value', data.site.name || '');
    document.getElementById('set-tagline')?.setAttribute('value', data.site.tagline || '');
    document.getElementById('set-phone')?.setAttribute('value', data.site.phone || '');
    document.getElementById('set-email')?.setAttribute('value', data.site.email || '');
    document.getElementById('set-address')?.setAttribute('value', data.site.address || '');
    document.getElementById('set-hours')?.setAttribute('value', data.site.hours || '');
    ['name','tagline','phone','email','address','hours'].forEach(k => {
      const el = document.getElementById(`set-${k}`);
      if (el) el.value = data.site[k] || '';
    });
    // Hero fields
    if (data.hero) {
      const heroSub = document.getElementById('set-hero-sub');
      if (heroSub) heroSub.value = data.hero.subtitle || '';
    }
  }

  // ─── FORM BINDINGS ────────────────────────────────────
  function bindForms() {
    // Site settings
    document.getElementById('formSiteSettings')?.addEventListener('submit', (e) => {
      e.preventDefault();
      data.site.name = document.getElementById('set-name').value;
      data.site.tagline = document.getElementById('set-tagline').value;
      data.site.phone = document.getElementById('set-phone').value;
      data.site.email = document.getElementById('set-email').value;
      data.site.address = document.getElementById('set-address').value;
      data.site.hours = document.getElementById('set-hours').value;
      if (data.hero) data.hero.subtitle = document.getElementById('set-hero-sub').value;
      saveData();
    });

    // Service edit
    document.getElementById('formServiceEdit')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('svc-id').value;
      const s = data.services.find(x => x.id === id);
      if (s) {
        s.icon = document.getElementById('svc-icon').value;
        s.title = document.getElementById('svc-title').value;
        s.description = document.getElementById('svc-desc').value;
        renderServicesList();
        saveData();
        document.getElementById('serviceEditCard').style.display = 'none';
      }
    });

    // Equipment edit
    document.getElementById('formEquipEdit')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('equip-id').value;
      const eq = data.equipment.find(x => x.id === id);
      if (eq) {
        eq.icon = document.getElementById('equip-icon').value;
        eq.title = document.getElementById('equip-title').value;
        eq.description = document.getElementById('equip-desc').value;
        renderEquipmentList();
        saveData();
        document.getElementById('equipEditCard').style.display = 'none';
      }
    });

    // Production edit
    document.getElementById('formProdEdit')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('prod-id').value;
      const p = data.productions.find(x => x.id === id);
      if (p) {
        p.title = document.getElementById('prod-title').value;
        p.year = document.getElementById('prod-year').value;
        p.category = document.getElementById('prod-category').value;
        p.description = document.getElementById('prod-description').value;
        p.youtube = document.getElementById('prod-youtube').value;
        p.status = 'live';
        renderProductionsList();
        saveData();
        document.getElementById('prodEditCard').style.display = 'none';
      }
    });

    // Testimonial edit
    document.getElementById('formTestiEdit')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('testi-id').value;
      const t = data.testimonials.find(x => x.id === id);
      if (t) {
        t.name = document.getElementById('testi-name').value;
        t.role = document.getElementById('testi-role').value;
        t.text = document.getElementById('testi-text').value;
        t.stars = parseInt(document.getElementById('testi-stars').value);
        t.status = 'live';
        renderTestimonialsList();
        saveData();
        document.getElementById('testiEditCard').style.display = 'none';
      }
    });
  }

  // ─── FILE UPLOADS ─────────────────────────────────────
  function bindUploads() {
    // Gallery upload
    const galleryUpload = document.getElementById('galleryUploadInput');
    if (galleryUpload) {
      galleryUpload.addEventListener('change', (e) => {
        handleFileUpload(e.target.files, 'gallery');
      });
    }
    // Equipment image upload
    const equipUpload = document.getElementById('equipImageInput');
    if (equipUpload) {
      equipUpload.addEventListener('change', (e) => {
        handleEquipImageUpload(e.target.files);
      });
    }
    // Production image upload
    const prodUpload = document.getElementById('prodImageInput');
    if (prodUpload) {
      prodUpload.addEventListener('change', (e) => {
        handleProdImageUpload(e.target.files);
      });
    }
    // Drag-drop for gallery zone
    setupDragDrop('galleryDropZone', (files) => handleFileUpload(files, 'gallery'));
  }

  function setupDragDrop(zoneId, callback) {
    const zone = document.getElementById(zoneId);
    if (!zone) return;
    zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', (e) => {
      e.preventDefault(); zone.classList.remove('drag-over');
      callback(e.dataTransfer.files);
    });
  }

  function handleFileUpload(files, context) {
    const validImages = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const validVideos = ['video/mp4', 'video/webm', 'video/quicktime'];

    Array.from(files).forEach(file => {
      const isImage = validImages.includes(file.type);
      const isVideo = validVideos.includes(file.type);
      if (!isImage && !isVideo) { showToast(`Skipped: ${file.name} (unsupported type)`, 'error'); return; }

      const reader = new FileReader();
      reader.onload = (ev) => {
        const url = ev.target.result;
        if (context === 'gallery') {
          const newItem = {
            id: 'g' + Date.now() + Math.random().toString(36).substr(2,5),
            url: url,
            thumb: isImage ? url : '',
            type: isVideo ? 'video' : 'image',
            caption: file.name.replace(/\.[^.]+$/, ''),
            filename: file.name
          };
          if (!data.gallery) data.gallery = [];
          data.gallery.push(newItem);
          renderGalleryMedia();
          renderDashboard();
          showToast(`${file.name} added to gallery!`, 'success');
        }
      };
      reader.readAsDataURL(file);
    });
  }

  function handleEquipImageUpload(files) {
    const id = document.getElementById('equip-id').value;
    const eq = data.equipment.find(x => x.id === id);
    if (!eq || !files[0]) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      eq.image = ev.target.result;
      document.getElementById('equipImgPreview').innerHTML = `<img src="${ev.target.result}" style="width:100%;height:100px;object-fit:cover;border-radius:8px;margin-top:8px;">`;
      showToast('Equipment image updated!', 'success');
    };
    reader.readAsDataURL(files[0]);
  }

  function handleProdImageUpload(files) {
    const id = document.getElementById('prod-id').value;
    const p = data.productions.find(x => x.id === id);
    if (!p || !files[0]) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      p.image = ev.target.result;
      document.getElementById('prodImgPreview').innerHTML = `<img src="${ev.target.result}" style="width:100%;height:120px;object-fit:cover;border-radius:8px;margin-top:8px;">`;
      showToast('Production image updated!', 'success');
    };
    reader.readAsDataURL(files[0]);
  }

  // ─── HELPERS ──────────────────────────────────────────
  window.toggleStatus = function (section, id) {
    const item = data[section]?.find(x => x.id === id);
    if (!item) return;
    item.status = item.status === 'live' ? 'draft' : 'live';
    if (section === 'services') renderServicesList();
    else if (section === 'equipment') renderEquipmentList();
    else if (section === 'productions') renderProductionsList();
    else if (section === 'testimonials') renderTestimonialsList();
    saveData();
  };

  window.deleteItem = function (section, id) {
    if (!confirm('Permanently delete this item?')) return;
    data[section] = data[section].filter(x => x.id !== id);
    if (section === 'productions') renderProductionsList();
    else if (section === 'testimonials') renderTestimonialsList();
    renderDashboard();
    saveData();
  };

  window.cancelEdit = function (cardId) {
    document.getElementById(cardId).style.display = 'none';
  };

  window.previewSite = function () {
    window.open('../index.html', '_blank');
  };

  function showToast(msg, type = 'success') {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.className = `toast ${type} show`;
    setTimeout(() => t.className = 'toast', 3000);
  }

  function getDefaultData() {
    return { site: {}, hero: { stats: [] }, services: [], equipment: [], productions: [], gallery: [], testimonials: [] };
  }

  document.addEventListener('DOMContentLoaded', init);
})();
