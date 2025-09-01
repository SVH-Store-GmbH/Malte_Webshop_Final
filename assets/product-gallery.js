document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-product-gallery]').forEach(gallery => {
    const medias = gallery.querySelectorAll('.product-gallery__media');
    const thumbs = gallery.querySelectorAll('.product-gallery__thumb');
    let activeIndex = 0;

    function setActive(index) {
      medias[activeIndex].classList.remove('is-active');
      thumbs[activeIndex].classList.remove('is-active');

      activeIndex = index;

      medias[activeIndex].classList.add('is-active');
      thumbs[activeIndex].classList.add('is-active');
      thumbs[activeIndex].scrollIntoView({behavior: 'smooth', inline: 'center', block: 'nearest'});
    }

    thumbs.forEach((thumb, i) => {
      thumb.addEventListener('click', () => setActive(i));
    });

    gallery.addEventListener('keydown', e => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          setActive((activeIndex - 1 + medias.length) % medias.length);
          break;
        case 'ArrowRight':
          e.preventDefault();
          setActive((activeIndex + 1) % medias.length);
          break;
        case 'Home':
          e.preventDefault();
          setActive(0);
          break;
        case 'End':
          e.preventDefault();
          setActive(medias.length - 1);
          break;
      }
    });
  });
});
