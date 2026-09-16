(() => {
  const hero = document.getElementById('hero');
  const dotLinks = Array.from(hero.querySelectorAll('.dot-link'));
  const splitSets = Array.from(hero.querySelectorAll('.split-set'));
  const AUTOPLAY_MS = 2600;

  let activeIndex = -1;
  let timer = null;

  function setActive(index) {
    if (index === activeIndex) return;
    activeIndex = index;

    dotLinks.forEach((link) => {
      link.classList.toggle('active', Number(link.dataset.index) === index);
    });

    splitSets.forEach((set) => {
      set.classList.toggle('active', Number(set.dataset.set) === index);
    });
  }

  function goToNext() {
    setActive((activeIndex + 1) % dotLinks.length);
  }

  function startAutoplay() {
    stopAutoplay();
    timer = setInterval(goToNext, AUTOPLAY_MS);
  }

  function stopAutoplay() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  // Init
  setActive(0);
  startAutoplay();

  // Pause while the tab is hidden, resume when it's visible again
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAutoplay();
    } else {
      startAutoplay();
    }
  });
})();
