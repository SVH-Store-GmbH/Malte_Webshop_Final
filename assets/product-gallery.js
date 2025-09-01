class ProductGallery {
  constructor(root) {
    this.root = root;
    this.stage = root.querySelector('[data-stage]');
    this.allItems = Array.from(root.querySelectorAll('.cg-gallery__item'));
    this.allThumbs = Array.from(root.querySelectorAll('.cg-gallery__thumb'));
    this.items = this.allItems;
    this.thumbs = this.allThumbs;
    this.prev = root.querySelector('.cg-gallery__arrow--prev');
    this.next = root.querySelector('.cg-gallery__arrow--next');
    this.activeIndex = 0;
    this.activeVariantId = root.dataset.initialVariantId;

    this.prev.addEventListener('click', () => this.show(this.activeIndex - 1));
    this.next.addEventListener('click', () => this.show(this.activeIndex + 1));
    this.stage.addEventListener('click', () => this.openModal());
    this.stage.addEventListener('keydown', (e) => this.onKey(e));
    this.thumbs.forEach((btn, i) => {
      btn.addEventListener('click', () => this.show(i));
      btn.addEventListener('keydown', (e) => this.onKey(e));
    });

    if (root.hasAttribute('data-variant-media') && this.activeVariantId) {
      this.filterGalleryByVariant(this.activeVariantId);
    }

    const section = root.closest('.js-product') || document;
    section.addEventListener('on:variant:change', (e) => {
      const variantId = e.detail?.variant?.id;
      if (variantId) this.filterGalleryByVariant(String(variantId));
    });

    const variantInput = section.querySelector('[name="id"]');
    if (variantInput) {
      variantInput.addEventListener('change', (e) => this.filterGalleryByVariant(e.target.value));
    }
  }

  filterGalleryByVariant(variantId) {
    this.activeVariantId = variantId;
    const currentMediaId = this.items[this.activeIndex]?.dataset.mediaId;
    const visibleVariant = [];
    const visibleShared = [];

    this.allItems.forEach((item, idx) => {
      const thumb = this.allThumbs[idx];
      const ids = item.dataset.variantIds ? item.dataset.variantIds.split(',').filter(Boolean) : [];
      const isShared = ids.length === 0;
      const match = isShared || ids.includes(String(variantId));
      if (match) {
        item.classList.remove('is-hidden');
        thumb.classList.remove('is-hidden');
        if (isShared) {
          visibleShared.push({ item, thumb });
        } else {
          visibleVariant.push({ item, thumb });
        }
      } else {
        item.classList.add('is-hidden');
        item.setAttribute('aria-hidden', 'true');
        thumb.classList.add('is-hidden');
      }
    });

    const combined = visibleVariant.concat(visibleShared);
    this.items = combined.map((v) => v.item);
    this.thumbs = combined.map((v) => v.thumb);

    let newIndex = this.items.findIndex((item) => item.dataset.mediaId === currentMediaId);
    if (newIndex === -1) {
      if (visibleVariant.length > 0) {
        newIndex = 0;
      } else if (visibleShared.length > 0) {
        newIndex = visibleVariant.length; // first shared
      } else {
        const featuredId = this.root.dataset.featuredMediaId;
        const featuredIdx = this.allItems.findIndex((i) => i.dataset.mediaId === featuredId);
        if (featuredIdx !== -1) {
          const fItem = this.allItems[featuredIdx];
          const fThumb = this.allThumbs[featuredIdx];
          fItem.classList.remove('is-hidden');
          fThumb.classList.remove('is-hidden');
          this.items = [fItem];
          this.thumbs = [fThumb];
          newIndex = 0;
        }
      }
    }

    this.allItems.forEach((item) => {
      item.classList.remove('is-active');
      item.setAttribute('aria-hidden', 'true');
    });
    this.allThumbs.forEach((thumb) => {
      thumb.classList.remove('is-active');
      thumb.removeAttribute('aria-current');
    });

    if (this.items.length > 0) {
      this.activeIndex = newIndex >= 0 ? newIndex : 0;
      this.items[this.activeIndex].classList.add('is-active');
      this.items[this.activeIndex].setAttribute('aria-hidden', 'false');
      this.thumbs[this.activeIndex].classList.add('is-active');
      this.thumbs[this.activeIndex].setAttribute('aria-current', 'true');
      this.thumbs[this.activeIndex].scrollIntoView({ inline: 'center', behavior: 'smooth' });
    } else {
      this.activeIndex = 0;
    }

    if (document.activeElement.classList.contains('is-hidden')) {
      this.stage.focus();
    }

    if (this.modal) {
      this.modal.remove();
      this.modal = null;
    }
  }

  onKey(e) {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        this.show(this.activeIndex - 1);
        break;
      case 'ArrowRight':
        e.preventDefault();
        this.show(this.activeIndex + 1);
        break;
      case 'Home':
        e.preventDefault();
        this.show(0);
        break;
      case 'End':
        e.preventDefault();
        this.show(this.items.length - 1);
        break;
    }
  }

  show(i) {
    if (i < 0) i = this.items.length - 1;
    if (i >= this.items.length) i = 0;
    this.items[this.activeIndex].classList.remove('is-active');
    this.items[this.activeIndex].setAttribute('aria-hidden', 'true');
    this.thumbs[this.activeIndex].classList.remove('is-active');
    this.thumbs[this.activeIndex].removeAttribute('aria-current');

    this.activeIndex = i;

    this.items[this.activeIndex].classList.add('is-active');
    this.items[this.activeIndex].setAttribute('aria-hidden', 'false');
    this.thumbs[this.activeIndex].classList.add('is-active');
    this.thumbs[this.activeIndex].setAttribute('aria-current', 'true');
    this.thumbs[this.activeIndex].scrollIntoView({ inline: 'center', behavior: 'smooth' });
  }

  buildModal() {
    const modal = document.createElement('div');
    modal.className = 'cg-lightbox';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.tabIndex = -1;

    const stage = document.createElement('div');
    stage.className = 'cg-lightbox__stage';
    modal.appendChild(stage);

    this.items.forEach((item) => {
      const clone = item.cloneNode(true);
      clone.classList.remove('is-active');
      stage.appendChild(clone);
    });

    const closeBtn = document.createElement('button');
    closeBtn.className = 'cg-lightbox__close';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.innerHTML = '&times;';
    modal.appendChild(closeBtn);

    const prevBtn = document.createElement('button');
    prevBtn.className = 'cg-lightbox__prev';
    prevBtn.setAttribute('aria-label', 'Previous');
    prevBtn.innerHTML = this.prev.innerHTML;
    modal.appendChild(prevBtn);

    const nextBtn = document.createElement('button');
    nextBtn.className = 'cg-lightbox__next';
    nextBtn.setAttribute('aria-label', 'Next');
    nextBtn.innerHTML = this.next.innerHTML;
    modal.appendChild(nextBtn);

    document.body.appendChild(modal);

    this.modal = modal;
    this.modalItems = Array.from(stage.children);

    closeBtn.addEventListener('click', () => this.closeModal());
    modal.addEventListener('click', (e) => { if (e.target === modal) this.closeModal(); });
    prevBtn.addEventListener('click', () => this.modalShow(this.activeIndex - 1));
    nextBtn.addEventListener('click', () => this.modalShow(this.activeIndex + 1));
    modal.addEventListener('keydown', (e) => this.modalKeydown(e));

    let startX;
    stage.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; });
    stage.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) {
        if (dx > 0) {
          this.modalShow(this.activeIndex - 1);
        } else {
          this.modalShow(this.activeIndex + 1);
        }
      }
    });
  }

  modalKeydown(e) {
    if (e.key === 'Escape') {
      this.closeModal();
    } else if (e.key === 'ArrowLeft') {
      this.modalShow(this.activeIndex - 1);
    } else if (e.key === 'ArrowRight') {
      this.modalShow(this.activeIndex + 1);
    } else if (e.key === 'Tab') {
      const focusable = this.modal.querySelectorAll('button');
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  openModal() {
    if (!this.modal) this.buildModal();
    this.modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    this.modalShow(this.activeIndex);
    this.modal.querySelector('.cg-lightbox__close').focus();
  }

  modalShow(i) {
    if (i < 0) i = this.modalItems.length - 1;
    if (i >= this.modalItems.length) i = 0;
    this.modalItems[this.activeIndex].classList.remove('is-active');
    this.modalItems[i].classList.add('is-active');
    this.show(i);
  }

  closeModal() {
    if (!this.modal) return;
    this.modal.classList.remove('is-open');
    document.body.style.overflow = '';
    this.modalItems[this.activeIndex].classList.remove('is-active');
    this.stage.focus();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-gallery]').forEach((el) => new ProductGallery(el));
});
