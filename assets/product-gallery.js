class ProductGallery {
  constructor(root) {
    this.root = root;
    this.stage = root.querySelector('[data-stage]');
    this.items = Array.from(root.querySelectorAll('.cg-gallery__item'));
    this.thumbs = Array.from(root.querySelectorAll('.cg-gallery__thumb'));
    this.prev = root.querySelector('.cg-gallery__arrow--prev');
    this.next = root.querySelector('.cg-gallery__arrow--next');
    this.activeIndex = 0;
    this.visibleIndices = this.items.map((_, i) => i);
    this.activeVisibleIndex = 0;

    this.prev.addEventListener('click', () => this.showPrev());
    this.next.addEventListener('click', () => this.showNext());
    this.stage.addEventListener('click', () => this.openModal());
    this.stage.addEventListener('keydown', (e) => this.onKey(e));
    this.thumbs.forEach((btn, i) => {
      btn.addEventListener('click', () => this.show(i));
      btn.addEventListener('keydown', (e) => this.onKey(e));
    });

    if (this.root.dataset.variantMedia !== undefined) {
      const initialId = this.root.dataset.initialVariantId;
      if (initialId) this.filterGalleryByVariant(initialId);
      document.addEventListener('on:variant:change', (evt) => {
        if (!this.root.closest('.js-product').contains(evt.target)) return;
        const variant = evt.detail.variant;
        if (variant?.id) {
          this.filterGalleryByVariant(variant.id, variant.featured_media?.id);
        }
      });
    }
  }

  showPrev() {
    if (!this.visibleIndices.length) return;
    const idx = (this.activeVisibleIndex - 1 + this.visibleIndices.length) % this.visibleIndices.length;
    this.show(this.visibleIndices[idx]);
  }

  showNext() {
    if (!this.visibleIndices.length) return;
    const idx = (this.activeVisibleIndex + 1) % this.visibleIndices.length;
    this.show(this.visibleIndices[idx]);
  }

  onKey(e) {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        this.showPrev();
        break;
      case 'ArrowRight':
        e.preventDefault();
        this.showNext();
        break;
      case 'Home':
        e.preventDefault();
        this.show(this.visibleIndices[0]);
        break;
      case 'End':
        e.preventDefault();
        this.show(this.visibleIndices[this.visibleIndices.length - 1]);
        break;
    }
  }

  show(i) {
    if (!this.visibleIndices.length) return;
    if (!this.visibleIndices.includes(i)) i = this.visibleIndices[0];

    const prevIndex = this.activeIndex;

    this.items[prevIndex].classList.remove('is-active');
    this.items[prevIndex].setAttribute('aria-hidden', 'true');
    this.thumbs[prevIndex].classList.remove('is-active');
    this.thumbs[prevIndex].removeAttribute('aria-current');

    this.items[i].classList.add('is-active');
    this.items[i].setAttribute('aria-hidden', 'false');
    this.thumbs[i].classList.add('is-active');
    this.thumbs[i].setAttribute('aria-current', 'true');
    this.thumbs[i].scrollIntoView({ inline: 'center', behavior: 'smooth' });

    this.activeIndex = i;
    this.activeVisibleIndex = this.visibleIndices.indexOf(i);
  }

  filterGalleryByVariant(variantId, featuredMediaId) {
    const vid = String(variantId);
    this.visibleIndices = [];
    let firstVariantSpecific = null;
    let firstShared = null;

    this.items.forEach((item, index) => {
      const ids = item.dataset.variantIds ? item.dataset.variantIds.split(',').filter(Boolean) : [];
      const isShared = ids.length === 0;
      const visible = isShared || ids.includes(vid);
      item.classList.toggle('is-hidden', !visible);
      this.thumbs[index].classList.toggle('is-hidden', !visible);
      if (this.modalItems) {
        this.modalItems[index].classList.toggle('is-hidden', !visible);
      }
      if (visible) {
        this.visibleIndices.push(index);
        if (!isShared && firstVariantSpecific === null) firstVariantSpecific = index;
        if (isShared && firstShared === null) firstShared = index;
      }
    });

    if (!this.visibleIndices.length) {
      this.items[0].classList.remove('is-hidden');
      this.thumbs[0].classList.remove('is-hidden');
      if (this.modalItems) this.modalItems[0].classList.remove('is-hidden');
      this.visibleIndices = [0];
    }

    let newIndex = this.activeIndex;
    const prevActive = this.activeIndex;
    if (!this.visibleIndices.includes(this.activeIndex)) {
      if (featuredMediaId) {
        const fIndex = this.items.findIndex(
          (item) => item.dataset.mediaId === String(featuredMediaId) && !item.classList.contains('is-hidden')
        );
        if (fIndex !== -1) newIndex = fIndex;
      }
      if (!this.visibleIndices.includes(newIndex)) {
        newIndex = firstVariantSpecific ?? firstShared ?? this.visibleIndices[0];
      }
      this.show(newIndex);
      if (document.activeElement === this.items[prevActive] || document.activeElement === this.thumbs[prevActive]) {
        this.stage.focus();
      }
    } else {
      this.activeVisibleIndex = this.visibleIndices.indexOf(this.activeIndex);
    }
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
      if (item.classList.contains('is-hidden')) clone.classList.add('is-hidden');
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
    if (!this.visibleIndices.length) return;
    if (!this.visibleIndices.includes(i)) {
      const currentVisible = this.visibleIndices.indexOf(this.activeIndex);
      const dir = i > this.activeIndex ? 1 : -1;
      const idx = (currentVisible + dir + this.visibleIndices.length) % this.visibleIndices.length;
      i = this.visibleIndices[idx];
    }
    const prevIndex = this.activeIndex;
    this.modalItems[prevIndex].classList.remove('is-active');
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
