document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-product-gallery]').forEach(gallery => {
    const images = gallery.querySelectorAll('[data-gallery-image]');
    const thumbs = gallery.querySelectorAll('[data-gallery-target]');
    let active = 0;

    const show = index => {
      if (index < 0 || index >= images.length) return;
      images[active].classList.remove('is-active');
      thumbs[active].classList.remove('is-active');
      active = index;
      images[active].classList.add('is-active');
      thumbs[active].classList.add('is-active');
      thumbs[active].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    };

    thumbs.forEach((thumb, i) => {
      thumb.addEventListener('click', () => show(i));
    });

    gallery.addEventListener('keydown', e => {
      switch (e.key) {
        case 'ArrowRight':
          show((active + 1) % images.length);
          break;
        case 'ArrowLeft':
          show((active - 1 + images.length) % images.length);
          break;
        case 'Home':
          show(0);
          break;
        case 'End':
          show(images.length - 1);
          break;
      }
    });

    gallery.setAttribute('tabindex', '0');
  });
});
