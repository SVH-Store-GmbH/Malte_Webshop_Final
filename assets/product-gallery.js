class ProductGallery {
  constructor(root) {
    this.root = root;
    this.stage = root.querySelector('[data-stage]');
    this.items = Array.from(root.querySelectorAll('.cg-gallery__item'));
    this.thumbs = Array.from(root.querySelectorAll('.cg-gallery__thumb'));
    this.allItems = this.items.slice();
    this.allThumbs = this.thumbs.slice();
    this.product = this.root.closest('.js-product');
    this.prev = root.querySelector('.cg-gallery__arrow--prev');
    this.next = root.querySelector('.cg-gallery__arrow--next');
    this.activeIndex = 0;
    this.activeVariantId = this.root.dataset.initialVariantId || null;

    this.prev.addEventListener('click', () => this.show(this.activeIndex - 1));
    this.next.addEventListener('click', () => this.show(this.activeIndex + 1));
    this.stage.addEventListener('click', () => this.openModal());
    this.stage.addEventListener('keydown', (e) => this.onKey(e));
    this.thumbs.forEach((btn, i) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.show(i);
      });
      btn.addEventListener('keydown', (e) => this.onKey(e));
    });

    this.filterGalleryByVariant(this.activeVariantId);

    if (this.product) {
      const variantInput = this.product.querySelector('input[name="id"]');
      if (variantInput) {
        variantInput.addEventListener('change', (e) => {
          this.activeVariantId = e.target.value;
          this.filterGalleryByVariant(this.activeVariantId);
        });
      }

      const handleVariantEvent = (e) => {
        const id = e.detail?.variant?.id || e.detail?.id;
        if (id) {
          this.activeVariantId = id;
          this.filterGalleryByVariant(this.activeVariantId);
        }
      };

      this.product.addEventListener('variant:change', handleVariantEvent);
      this.product.addEventListener('product:variant:change', handleVariantEvent);
      this.product.addEventListener('on:variant:change', handleVariantEvent);
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
    this.thumbs[this.activeIndex].scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
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

  filterGalleryByVariant(variantId) {
    const idStr = variantId ? variantId.toString() : null;

    this.allItems.forEach((item, index) => {
      const ids = item.dataset.variantIds ? item.dataset.variantIds.split(',').filter(Boolean) : [];
      const isShared = ids.length === 0;
      const visible = !idStr || isShared || ids.includes(idStr);
      item.classList.toggle('is-hidden', !visible);
      const thumb = this.allThumbs[index];
      thumb.classList.toggle('is-hidden', !visible);
      item.classList.remove('is-active');
      item.setAttribute('aria-hidden', 'true');
      thumb.classList.remove('is-active');
      thumb.removeAttribute('aria-current');
    });

    this.items = this.allItems.filter((el) => !el.classList.contains('is-hidden'));
    this.thumbs = this.allThumbs.filter((el) => !el.classList.contains('is-hidden'));

    let showIndex = 0;
    const currentVisible = this.items.findIndex((el) => el.classList.contains('is-active'));
    if (currentVisible !== -1) {
      showIndex = currentVisible;
    } else {
      const variantSpecific = this.items.find((el) => {
        const ids = el.dataset.variantIds ? el.dataset.variantIds.split(',').filter(Boolean) : [];
        return ids.length > 0 && idStr && ids.includes(idStr);
      });
      if (variantSpecific) {
        showIndex = this.items.indexOf(variantSpecific);
      } else {
        const shared = this.items.find((el) => {
          const ids = el.dataset.variantIds ? el.dataset.variantIds.split(',').filter(Boolean) : [];
          return ids.length === 0;
        });
        if (shared) {
          showIndex = this.items.indexOf(shared);
        }
      }
    }

    this.activeIndex = 0;
    if (this.items.length > 0) {
      this.show(showIndex);
    }

    const arrowsVisible = this.items.length > 1;
    this.prev.style.display = arrowsVisible ? '' : 'none';
    this.next.style.display = arrowsVisible ? '' : 'none';

    if (this.modal) {
      this.modal.remove();
      this.modal = null;
    }
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
