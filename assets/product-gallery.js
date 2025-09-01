document.addEventListener('DOMContentLoaded', () => {
  const gallery = document.querySelector('[data-product-gallery]');
  if (!gallery) return;
  const mains = Array.from(gallery.querySelectorAll('.product-gallery__media'));
  const thumbs = Array.from(gallery.querySelectorAll('.product-gallery__thumb'));
  let index = mains.findIndex(el => el.classList.contains('is-active'));
  const activate = newIndex => {
    if (newIndex < 0 || newIndex >= mains.length) return;
    mains[index].classList.remove('is-active');
    thumbs[index].classList.remove('is-active');
    index = newIndex;
    mains[index].classList.add('is-active');
    thumbs[index].classList.add('is-active');
    thumbs[index].scrollIntoView({behavior:'smooth', inline:'center', block:'nearest'});
  };
  thumbs.forEach((thumb, i) => {
    thumb.addEventListener('click', () => activate(i));
  });
  gallery.addEventListener('keydown', e => {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        activate(index - 1);
        break;
      case 'ArrowRight':
        e.preventDefault();
        activate(index + 1);
        break;
      case 'Home':
        e.preventDefault();
        activate(0);
        break;
      case 'End':
        e.preventDefault();
        activate(mains.length - 1);
        break;
    }
  });
});
