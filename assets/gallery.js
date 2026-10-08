function embedUrlFor(url) {
  if (!url) return null;
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=|youtube\.com\/shorts\/)([\w-]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

function renderGallery(items) {
  const grid = document.getElementById('gallery-grid');
  if (!grid) return;
  grid.innerHTML = '';

  items.forEach((item, idx) => {
    const tile = document.createElement('button');
    tile.type = 'button';
    tile.className = 'hv2-gallery__tile';
    tile.dataset.type = item.type;
    tile.style.backgroundImage = `url('${item.image}')`;

    if (item.type === 'video') {
      const play = document.createElement('span');
      play.className = 'hv2-gallery__play';
      play.innerHTML = '&#9658;';
      tile.appendChild(play);
    }

    const caption = document.createElement('span');
    caption.className = 'hv2-gallery__caption';
    caption.textContent = item.caption || '';
    tile.appendChild(caption);

    tile.addEventListener('click', () => openLightbox(item));
    grid.appendChild(tile);
  });

  const filters = document.querySelectorAll('.hv2-filter');
  filters.forEach((btn) => {
    btn.addEventListener('click', () => {
      filters.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      grid.querySelectorAll('.hv2-gallery__tile').forEach((tile) => {
        tile.style.display = filter === 'all' || tile.dataset.type === filter ? '' : 'none';
      });
    });
  });
}

function openLightbox(item) {
  const lightbox = document.getElementById('lightbox');
  const content = document.getElementById('lightbox-content');
  content.innerHTML = '';

  if (item.type === 'video') {
    const embed = embedUrlFor(item.video_url);
    if (embed) {
      const iframe = document.createElement('iframe');
      iframe.src = embed;
      iframe.allow = 'autoplay; fullscreen; picture-in-picture';
      iframe.allowFullscreen = true;
      content.appendChild(iframe);
    } else if (item.video_url) {
      window.open(item.video_url, '_blank', 'noopener');
      return;
    } else {
      const p = document.createElement('p');
      p.className = 'hv2-lightbox__note';
      p.textContent = 'Video próximamente.';
      content.appendChild(p);
    }
  } else {
    const img = document.createElement('img');
    img.src = item.image;
    img.alt = item.caption || '';
    content.appendChild(img);
  }

  lightbox.classList.add('open');
}

document.addEventListener('DOMContentLoaded', () => {
  const lightbox = document.getElementById('lightbox');
  const closeBtn = document.getElementById('lightbox-close');
  if (!lightbox) return;
  const close = () => {
    lightbox.classList.remove('open');
    document.getElementById('lightbox-content').innerHTML = '';
  };
  closeBtn.addEventListener('click', close);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });
});
