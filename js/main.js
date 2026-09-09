// =========================================================
// PORTFOLIO — INTERACTIONS
// =========================================================
document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Custom cursor ---------- */
  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (dot && ring && matchMedia('(hover:hover) and (pointer:fine)').matches) {
    let mx = 0, my = 0, rx = 0, ry = 0;
    window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`; });
    const animRing = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(animRing);
    };
    animRing();
    document.querySelectorAll('a, button, .card, .gallery-item, .filter-btn').forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => ring.classList.remove('is-hover'));
    });
  }

  /* ---------- Mobile nav toggle ---------- */
  const navEl = document.querySelector('.nav');
  const navToggle = document.querySelector('.nav-toggle');
  if (navToggle) {
    navToggle.addEventListener('click', () => navEl.classList.toggle('is-open'));
    document.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', () => navEl.classList.remove('is-open')));
  }

  /* ---------- Sliding blob behind active/hovered nav link ---------- */
  const navLinks = document.querySelector('.nav-links');
  const blob = document.querySelector('.nav-blob');
  if (navLinks && blob) {
    const placeOn = (el) => {
      if (!el) return;
      blob.style.top = el.offsetTop + 'px';
      blob.style.height = el.offsetHeight + 'px';
    };
    const active = navLinks.querySelector('.nav-link.is-active');
    requestAnimationFrame(() => placeOn(active));
    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('mouseenter', () => placeOn(link));
    });
    navLinks.addEventListener('mouseleave', () => placeOn(active));
    window.addEventListener('resize', () => placeOn(navLinks.querySelector('.nav-link.is-active')));
  }

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach((el, i) => {
      el.style.setProperty('--i', i % 8);
      io.observe(el);
    });
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* ---------- Hero parallax grid ---------- */
  const heroBg = document.querySelector('.hero-grid-bg');
  if (heroBg && matchMedia('(hover:hover)').matches) {
    const cells = heroBg.querySelectorAll('.cell');
    window.addEventListener('mousemove', (e) => {
      const px = (e.clientX / window.innerWidth - 0.5);
      const py = (e.clientY / window.innerHeight - 0.5);
      cells.forEach((cell, i) => {
        const depth = ((i % 5) + 1) * 6;
        cell.style.setProperty('--px', `${px * depth}px`);
        cell.style.setProperty('--py', `${py * depth}px`);
      });
    });
  }

  /* ---------- Gallery filters (+ pagination on the photo gallery) ---------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryEl = document.querySelector('.gallery');
  const ITEMS_PER_PAGE = 10; // ← change ce nombre pour afficher plus/moins de photos par page

  if (galleryEl) {
    // ----- Galerie photo paginée (photographie.html) -----
    const allItems = Array.from(galleryEl.querySelectorAll('.gallery-item'));

    // Conteneur de pagination, injecté juste après la galerie
    const paginationEl = document.createElement('div');
    paginationEl.className = 'pagination';
    galleryEl.insertAdjacentElement('afterend', paginationEl);

    let currentFilter = 'all';
    let currentPage = 1;

    const getFiltered = () =>
      allItems.filter(item => currentFilter === 'all' || item.dataset.cat === currentFilter);

    const renderPagination = (totalPages) => {
      paginationEl.innerHTML = '';
      if (totalPages <= 1) return;

      const makeBtn = (label, page, opts = {}) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'page-btn' + (opts.active ? ' is-active' : '');
        btn.textContent = label;
        if (opts.disabled) {
          btn.disabled = true;
        } else {
          btn.addEventListener('click', () => {
            currentPage = page;
            renderPage();
          });
        }
        return btn;
      };

      paginationEl.appendChild(makeBtn('‹', currentPage - 1, { disabled: currentPage === 1 }));
      for (let p = 1; p <= totalPages; p++) {
        paginationEl.appendChild(makeBtn(String(p), p, { active: p === currentPage }));
      }
      paginationEl.appendChild(makeBtn('›', currentPage + 1, { disabled: currentPage === totalPages }));
    };

    const renderPage = () => {
      const filtered = getFiltered();
      const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
      if (currentPage > totalPages) currentPage = totalPages;

      allItems.forEach(item => { item.style.display = 'none'; });
      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      filtered.slice(start, start + ITEMS_PER_PAGE).forEach(item => { item.style.display = ''; });

      renderPagination(totalPages);
    };

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        currentFilter = btn.dataset.filter;
        currentPage = 1;
        renderPage();
        galleryEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    renderPage();

  } else if (filterBtns.length) {
    // ----- Filtre simple, sans pagination (webdesign.html, etc.) -----
    const filterItems = document.querySelectorAll('[data-cat]');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        const cat = btn.dataset.filter;
        filterItems.forEach(item => {
          const show = cat === 'all' || item.dataset.cat === cat;
          item.style.display = show ? '' : 'none';
        });
      });
    });
  }

  /* ---------- Lightbox ---------- */
  const lightbox = document.querySelector('.lightbox');
  if (lightbox) {
    const lbImg = lightbox.querySelector('img');
    const lbCap = lightbox.querySelector('.lightbox-cap');
    let current = 0;

    // Ne navigue qu'à travers les photos actuellement visibles (filtre + page en cours)
    const getVisibleItems = () =>
      Array.from(document.querySelectorAll('.gallery-item')).filter(el => el.style.display !== 'none');

    const openAt = (index, items) => {
      const visible = items || getVisibleItems();
      if (!visible.length) return;
      current = ((index % visible.length) + visible.length) % visible.length;
      const item = visible[current];
      lbImg.src = item.querySelector('img').src;
      lbCap.textContent = item.dataset.caption || '';
      lightbox.classList.add('is-open');
    };

    document.querySelectorAll('.gallery-item').forEach(item => {
      item.addEventListener('click', () => {
        const visible = getVisibleItems();
        openAt(visible.indexOf(item), visible);
      });
    });

    lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.classList.remove('is-open'));
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.classList.remove('is-open'); });
    lightbox.querySelector('.lightbox-next')?.addEventListener('click', () => openAt(current + 1, getVisibleItems()));
    lightbox.querySelector('.lightbox-prev')?.addEventListener('click', () => openAt(current - 1, getVisibleItems()));
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape') lightbox.classList.remove('is-open');
      if (e.key === 'ArrowRight') openAt(current + 1, getVisibleItems());
      if (e.key === 'ArrowLeft') openAt(current - 1, getVisibleItems());
    });
  }

});
