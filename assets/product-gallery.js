(function() {
  function init() {
    var gallery = document.querySelector('.product-gallery');
    if (!gallery) return;
    var images = gallery.querySelectorAll('.product-gallery__image');
    var thumbs = gallery.querySelectorAll('.product-gallery__thumb');
    var index = 0;

    function show(i) {
      if (i < 0 || i >= images.length) return;
      images[index].classList.remove('is-active');
      thumbs[index].classList.remove('is-active');
      index = i;
      images[index].classList.add('is-active');
      thumbs[index].classList.add('is-active');
      thumbs[index].scrollIntoView({behavior: 'smooth', inline: 'center', block: 'nearest'});
    }

    thumbs.forEach(function(thumb, i) {
      thumb.addEventListener('click', function() {
        show(i);
      });
    });

    gallery.addEventListener('keydown', function(e) {
      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          show((index + 1) % images.length);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          show((index - 1 + images.length) % images.length);
          break;
        case 'Home':
          e.preventDefault();
          show(0);
          break;
        case 'End':
          e.preventDefault();
          show(images.length - 1);
          break;
      }
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
