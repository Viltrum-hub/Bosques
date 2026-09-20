(() => {
  const body = document.body;
  const header = document.getElementById('siteHeader');
  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('mainNav');
  const progress = document.getElementById('readingProgress');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Entrada inicial
  body.classList.add('page-enter');
  window.addEventListener('load', () => {
    window.setTimeout(() => body.classList.remove('page-enter'), 720);
  });

  // Ambiente dinámico
  const ambientLayer = document.createElement('div');
  ambientLayer.className = 'ambient-layer';
  ambientLayer.setAttribute('aria-hidden', 'true');
  ambientLayer.innerHTML = '<span class="ambient-orb"></span><span class="ambient-orb"></span><span class="ambient-orb"></span>';
  body.prepend(ambientLayer);

  const cursorGlow = document.createElement('div');
  cursorGlow.className = 'cursor-glow';
  cursorGlow.setAttribute('aria-hidden', 'true');
  body.appendChild(cursorGlow);

  if (!reduceMotion && window.matchMedia('(pointer:fine)').matches) {
    let glowX = window.innerWidth / 2;
    let glowY = window.innerHeight / 2;
    let targetX = glowX;
    let targetY = glowY;

    window.addEventListener('pointermove', (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
      cursorGlow.style.opacity = '1';
    });

    document.documentElement.addEventListener('mouseleave', () => {
      cursorGlow.style.opacity = '0';
    });

    const animateGlow = () => {
      glowX += (targetX - glowX) * 0.12;
      glowY += (targetY - glowY) * 0.12;
      cursorGlow.style.left = `${glowX}px`;
      cursorGlow.style.top = `${glowY}px`;
      requestAnimationFrame(animateGlow);
    };
    requestAnimationFrame(animateGlow);
  }

  // Menú móvil
  const closeMenu = () => {
    if (!mainNav || !menuToggle) return;
    mainNav.classList.remove('open');
    menuToggle.classList.remove('active');
    menuToggle.setAttribute('aria-expanded', 'false');
    body.style.overflow = '';
  };

  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
      const open = !mainNav.classList.contains('open');
      mainNav.classList.toggle('open', open);
      menuToggle.classList.toggle('active', open);
      menuToggle.setAttribute('aria-expanded', String(open));
      body.style.overflow = open ? 'hidden' : '';
    });

    mainNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  }

  // Header + barra de lectura
  const updateScrollUI = () => {
    const y = window.scrollY;
    if (header) header.classList.toggle('scrolled', y > 24);

    if (progress) {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const value = scrollable > 0 ? Math.min(100, Math.max(0, (y / scrollable) * 100)) : 0;
      progress.style.width = `${value}%`;
    }
  };

  updateScrollUI();
  window.addEventListener('scroll', updateScrollUI, { passive: true });

  // Reveals al entrar en viewport
  const revealTargets = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-up, .human-image, .solution-highlight-image, .full-image-statement, .story-row');

  if ('IntersectionObserver' in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');

        // Efecto escalonado en tarjetas hermanas
        if (entry.target.matches('.feature-panel, .impact-card, .social-card, .solution-item')) {
          const siblings = [...entry.target.parentElement.children];
          const index = siblings.indexOf(entry.target);
          entry.target.style.transitionDelay = `${Math.min(index * 80, 320)}ms`;
        }

        observer.unobserve(entry.target);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -5% 0px' });

    revealTargets.forEach(el => revealObserver.observe(el));
  } else {
    revealTargets.forEach(el => el.classList.add('is-visible'));
  }

  // Dos realidades: una sola secuencia de animación para evitar tirones o solapamientos.
  const splitShowcases = document.querySelectorAll('.split-showcase');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const splitObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-active');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });
    splitShowcases.forEach(section => splitObserver.observe(section));
  } else {
    splitShowcases.forEach(section => section.classList.add('is-active'));
  }

  // Parallax ligero
  const parallaxLayers = [...document.querySelectorAll('.parallax-layer')];
  let ticking = false;

  const renderParallax = () => {
    const viewportCenter = window.innerHeight / 2;
    parallaxLayers.forEach(layer => {
      const rect = layer.parentElement.getBoundingClientRect();
      if (rect.bottom < -120 || rect.top > window.innerHeight + 120) return;
      const speed = Number(layer.dataset.speed || 0.1);
      const offset = (rect.top + rect.height / 2 - viewportCenter) * speed;
      layer.style.transform = `translate3d(0, ${offset}px, 0) scale(1.1)`;
    });
    ticking = false;
  };

  if (!reduceMotion && parallaxLayers.length) {
    const requestParallax = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(renderParallax);
    };
    renderParallax();
    window.addEventListener('scroll', requestParallax, { passive: true });
    window.addEventListener('resize', requestParallax);
  }

  // Tilt muy sutil en tarjetas, solo escritorio
  const tiltCards = document.querySelectorAll('.feature-panel, .impact-card, .social-card, .solution-item');
  if (!reduceMotion && window.matchMedia('(pointer:fine)').matches) {
    tiltCards.forEach(card => {
      card.setAttribute('data-tilt', '');
      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(900px) rotateX(${(-y * 3).toFixed(2)}deg) rotateY(${(x * 4).toFixed(2)}deg) translateY(-7px)`;
      });
      card.addEventListener('pointerleave', () => {
        card.style.transform = '';
      });
    });
  }

  // Movimiento muy suave del hero con el mouse
  const hero = document.querySelector('.hero-home');
  const heroBg = hero?.querySelector('.hero-bg');
  if (hero && heroBg && !reduceMotion && window.matchMedia('(pointer:fine)').matches) {
    hero.addEventListener('pointermove', (event) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 14;
      const y = (event.clientY / window.innerHeight - 0.5) * 10;
      heroBg.style.marginLeft = `${x}px`;
      heroBg.style.marginTop = `${y}px`;
    });
  }

  // Transición entre páginas internas
  document.querySelectorAll('a[href]').forEach(link => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || link.target === '_blank' || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;

      const destination = new URL(link.href, window.location.href);
      if (destination.origin !== window.location.origin) return;
      if (!destination.pathname.endsWith('.html') && destination.pathname !== '/') return;

      event.preventDefault();
      closeMenu();
      body.classList.add('is-leaving');
      window.setTimeout(() => {
        window.location.href = destination.href;
      }, reduceMotion ? 20 : 500);
    });
  });

  // Año automático
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
