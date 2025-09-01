class ProductGallery {
  constructor(container) {
    this.container = container;
    this.viewer = container.querySelector('.product-gallery__viewer');
    this.thumbs = Array.from(container.querySelectorAll('.product-gallery__thumb'));
    this.dialog = container.querySelector('dialog');
    this.registerEvents();
  }

  prefersReduced() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  registerEvents() {
    this.thumbs.forEach((btn, index) => {
      btn.addEventListener('click', () => {
        this.showSlide(index);
      });
    });

    this.viewer.addEventListener('click', (e) => {
      const slide = e.target.closest('.product-gallery__media');
      if (!slide) return;
      this.openLightbox(slide.cloneNode(true));
    });

    this.dialog.querySelector('.product-gallery__lightbox-close').addEventListener('click', () => {
      this.dialog.close();
    });

    document.addEventListener('variant:change', (e) => {
      const id = e.detail?.variant?.featured_media?.id;
      if (id) this.scrollToMedia(id);
    });
  }

  showSlide(index) {
    const slide = this.viewer.children[index];
    slide.scrollIntoView({behavior: this.prefersReduced() ? 'auto' : 'smooth'});
    this.thumbs.forEach(t => t.removeAttribute('aria-current'));
    this.thumbs[index].setAttribute('aria-current', 'true');
  }

  scrollToMedia(id) {
    const slide = this.viewer.querySelector(`[data-media-id="${id}"]`);
    if (slide) slide.scrollIntoView({behavior: this.prefersReduced() ? 'auto' : 'smooth'});
  }

  openLightbox(node) {
    this.dialog.innerHTML = '<button type="button" class="product-gallery__lightbox-close" aria-label="Close">&times;</button>';
    this.dialog.appendChild(node);
    this.dialog.showModal();
    this.dialog.querySelector('.product-gallery__lightbox-close').addEventListener('click', () => this.dialog.close(), {once:true});
  }
}

window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-product-gallery]').forEach(el => new ProductGallery(el));
});
