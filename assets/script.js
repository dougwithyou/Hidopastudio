(() => {
  const heroScroll = document.getElementById('hero');
  const dotLinks = Array.from(heroScroll.querySelectorAll('.dot-link'));
  const splitSets = Array.from(heroScroll.querySelectorAll('.split-set'));

  let ticking = false;
  let activeIndex = -1;

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

  function updateFromScroll() {
    const total = heroScroll.offsetHeight - window.innerHeight;
    const rect = heroScroll.getBoundingClientRect();
    const scrolled = Math.min(Math.max(-rect.top, 0), total);
    const progress = total > 0 ? scrolled / total : 0;
    const steps = dotLinks.length;
    const index = Math.min(steps - 1, Math.floor(progress * steps));
    setActive(index);
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(updateFromScroll);
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  // Init
  setActive(0);
  updateFromScroll();
})();
