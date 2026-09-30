(function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)');
  var observer = null;

  function originalItems() {
    return Array.prototype.filter.call(
      document.querySelectorAll('section.rGeu6w ._mXnjA > .DF_utQ'),
      function (item) {
        return !item.closest('.demo2-migrated-sections') &&
          !item.matches('#LBtVr4xjMcLknz6J, #LBjJ4T4Qy9r60xjN, #LBq6qkCK3LxfqpZM, #LB42vlPZ5JwQd7Hs');
      }
    );
  }

  function reveal(item) {
    item.classList.add('demo2-motion-visible');
    if (observer) observer.unobserve(item);
  }

  function install() {
    var items = originalItems();
    if (!items.length) return;

    document.documentElement.classList.add('demo2-motion-ready');
    if (REDUCED.matches || !('IntersectionObserver' in window)) {
      items.forEach(reveal);
      return;
    }

    if (!observer) {
      observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) reveal(entry.target);
        });
      }, { threshold: .08, rootMargin: '0px 0px -5% 0px' });
    }

    items.forEach(function (item, index) {
      if (item.dataset.demo2MotionBound === 'true') return;
      item.dataset.demo2MotionBound = 'true';
      item.classList.add('demo2-motion-item');
      item.style.setProperty('--demo2-motion-delay', Math.min(index % 7, 5) * 85 + 'ms');
      observer.observe(item);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
  else install();

  window.setTimeout(install, 250);
  window.setTimeout(install, 900);
  window.addEventListener('hashchange', install, { passive: true });
})();
