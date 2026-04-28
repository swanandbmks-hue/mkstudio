/**
 * MK Studio Pune — Main Site JavaScript
 * Loads content from data/content.json and renders dynamically
 */

(function () {
  'use strict';

  // ─── STATE ───────────────────────────────────────────
  let siteData = null;

  // ─── INIT ────────────────────────────────────────────
  async function init() {
    try {
      const res = await fetch('data/content.json');
      siteData = await res.json();
    } catch (e) {
      // Fallback: content is embedded via static HTML
      console.warn('Could not load content.json — using static content.');
    }
    renderAll();
    bindEvents();
    initScrollReveal();
    initNavbar();
  }

  // ─── RENDER ALL ──────────────────────────────────────
  function renderAll() {
    if (!siteData) return;
    renderHeroStats();
    renderServices();
    renderEquipment();
    renderProductions();
    renderGallery();
    renderTestimonials();
  }

  function renderHeroStats() {
    const el = document.getElementById('heroStats');
    if (!el || !siteData.hero) return;
    el.innerHTML = siteData.hero.stats.map(s => `
      <div class="h-stat">
        <div class="h-stat-num">${s.num}</div>
        <div class="h-stat-label">${s.label}</div>
      </div>
    `).join('');
  }

  function renderServices() {
    const el = document.getElementById('servicesGrid');
    if (!el || !siteData.services) return;
    el.innerHTML = siteData.services
      .filter(s => s.status === 'live')
      .map(s => `
        <div class="svc-card reveal">
          <div class="svc-icon ${s.color}">${s.icon}</div>
          <h3>${s.title}</h3>
          <p>${s.description}</p>
          <a href="#contact" class="svc-link">Learn More →</a>
        </div>
      `).join('');
    initScrollReveal();
  }

  function renderEquipment() {
    const el = document.getElementById('equipGrid');
    if (!el || !siteData.equipment) return;
    el.innerHTML = siteData.equipment
      .filter(e => e.status === 'live')
      .map(e => `
        <div class="equip-card reveal">
          <div class="equip-img">
            ${e.image ? `<img src="${e.image}" alt="${e.title}" loading="lazy">` : e.icon}
          </div>
          <h4>${e.title}</h4>
          <p>${e.description}</p>
          <span class="equip-badge">Rental Available</span>
        </div>
      `).join('');
    initScrollReveal();
  }

  function renderProductions(filter = 'all') {
    const el = document.getElementById('prodGrid');
    if (!el || !siteData.productions) return;
    const filtered = siteData.productions.filter(p =>
      p.status === 'live' && (filter === 'all' || p.category === filter)
    );
    const emojis = { film: '🎬', short: '🌟', web: '📺', ad: '📣' };
    const labels = { film: 'Feature Film', short: 'Short Film', web: 'Web Series', ad: 'Advertisement' };
    el.innerHTML = filtered.map(p => `
      <div class="prod-card reveal" onclick="openYT('${p.youtube || '#'}')">
        <div class="prod-card-media">
          ${p.image
            ? `<img src="${p.image}" alt="${p.title}" loading="lazy" style="width:100%;height:100%;object-fit:cover;">`
            : `<span style="font-size:3.5rem;opacity:0.25">${emojis[p.category] || '🎬'}</span>`
          }
        </div>
        <div class="prod-overlay"></div>
        <div class="prod-info">
          <div class="prod-type">${labels[p.category] || p.category}</div>
          <div class="prod-title">${p.title}</div>
          <div class="prod-year">${p.year}</div>
        </div>
        ${p.youtube && p.youtube !== '#' ? '<div style="position:absolute;top:16px;right:16px;width:36px;height:36px;background:rgba(255,255,255,0.15);border-radius:50%;backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;font-size:0.9rem;">▶</div>' : ''}
      </div>
    `).join('');
    initScrollReveal();
  }

  function renderGallery() {
    const el = document.getElementById('galleryGrid');
    if (!el || !siteData.gallery || siteData.gallery.length === 0) return;
    const layouts = ['', 'wide', '', 'tall', '', '', 'wide', '', ''];
    el.innerHTML = siteData.gallery.map((item, i) => {
      const cls = layouts[i % layouts.length] || '';
      const isVideo = item.type === 'video';
      return `
        <div class="gallery-item ${cls}" onclick="openLightbox('${item.url}','${item.type || 'image'}')">
          <div class="gallery-img">
            ${item.thumb
              ? `<img src="${item.thumb}" alt="${item.caption || ''}" loading="lazy" style="width:100%;height:100%;object-fit:cover;">`
              : `<span>${isVideo ? '🎞️' : '🖼️'}</span>`
            }
          </div>
          <div class="gallery-item-overlay">
            <span class="gallery-plus">${isVideo ? '▶' : '+'}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderTestimonials() {
    const el = document.getElementById('testiGrid');
    if (!el || !siteData.testimonials) return;
    el.innerHTML = siteData.testimonials
      .filter(t => t.status === 'live')
      .map(t => `
        <div class="testi-card reveal">
          <div class="stars">${'★'.repeat(t.stars)}${'☆'.repeat(5 - t.stars)}</div>
          <p class="testi-text">"${t.text}"</p>
          <div class="testi-author">
            <div class="testi-av">${t.name[0]}</div>
            <div>
              <div class="testi-name">${t.name}</div>
              <div class="testi-role">${t.role}</div>
            </div>
          </div>
        </div>
      `).join('');
    initScrollReveal();
  }

  // ─── NAVBAR ──────────────────────────────────────────
  function initNavbar() {
    const nav = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    });
  }

  // ─── SCROLL REVEAL ───────────────────────────────────
  function initScrollReveal() {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('visible'), i * 80);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal:not(.visible)').forEach(el => obs.observe(el));
  }

  // ─── EVENTS ──────────────────────────────────────────
  function bindEvents() {
    // Mobile menu
    const mobileMenu = document.getElementById('mobileMenu');
    document.getElementById('hamburgerBtn')?.addEventListener('click', () => {
      mobileMenu?.classList.toggle('open');
      document.body.style.overflow = mobileMenu?.classList.contains('open') ? 'hidden' : '';
    });
    document.getElementById('mobileClose')?.addEventListener('click', closeMobileMenu);
    mobileMenu?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobileMenu));

    // Production filter tabs
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        renderProductions(this.dataset.filter);
      });
    });

    // Contact form
    document.getElementById('contactForm')?.addEventListener('submit', handleFormSubmit);

    // Lightbox close
    document.getElementById('lightboxOverlay')?.addEventListener('click', closeLightbox);
  }

  function closeMobileMenu() {
    document.getElementById('mobileMenu')?.classList.remove('open');
    document.body.style.overflow = '';
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    const btn = e.target.querySelector('.btn-submit');
    btn.textContent = '✓ Message Sent! We\'ll be in touch shortly.';
    btn.style.background = '#34C759';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = 'Send Enquiry';
      btn.style.background = '';
      btn.disabled = false;
      e.target.reset();
    }, 5000);
  }

  // ─── LIGHTBOX ────────────────────────────────────────
  window.openLightbox = function (url, type) {
    const lb = document.getElementById('lightboxOverlay');
    const lbInner = document.getElementById('lightboxInner');
    if (!lb || !lbInner) return;
    lbInner.innerHTML = type === 'video'
      ? `<video src="${url}" controls autoplay style="max-width:90vw;max-height:85vh;border-radius:12px;"></video>`
      : `<img src="${url}" alt="" style="max-width:90vw;max-height:85vh;border-radius:12px;">`;
    lb.classList.add('open');
  };

  window.closeLightbox = function () {
    const lb = document.getElementById('lightboxOverlay');
    lb?.classList.remove('open');
    document.getElementById('lightboxInner').innerHTML = '';
  };

  window.openYT = function (url) {
    if (url && url !== '#') window.open(url, '_blank');
  };

  // ─── START ───────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', init);
})();
