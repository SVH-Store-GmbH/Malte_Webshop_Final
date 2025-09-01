(function(){
  class ProductGallery{
    constructor(el){
      this.el=el;
      this.main=el.querySelector('.product-gallery__main');
      this.slides=Array.from(this.main.children);
      this.thumbsWrap=el.querySelector('.product-gallery__thumbs');
      this.thumbs=this.thumbsWrap?Array.from(this.thumbsWrap.querySelectorAll('.product-gallery__thumb')):[];
      this.lightbox=el.querySelector('.product-gallery__lightbox');
      this.lightboxBody=this.lightbox?this.lightbox.querySelector('.product-gallery__lightbox-body'):null;
      this.bind();
    }
    bind(){
      this.thumbs.forEach(t=>t.addEventListener('click',()=>this.scrollToMedia(t.dataset.mediaId)));
      this.main.addEventListener('scroll',this.onScroll.bind(this),{passive:true});
      this.slides.forEach(slide=>{
        const img=slide.querySelector('img');
        if(img){
          if(img.complete) slide.classList.remove('is-loading');
          else img.addEventListener('load',()=>slide.classList.remove('is-loading'),{once:true});
        }
        slide.addEventListener('click',()=>this.openLightbox(slide));
      });
      if(this.lightbox){
        const closeBtn=this.lightbox.querySelector('.product-gallery__lightbox-close');
        if(closeBtn) closeBtn.addEventListener('click',()=>this.lightbox.close());
        this.lightbox.addEventListener('click',e=>{if(e.target===this.lightbox) this.lightbox.close();});
      }
      document.addEventListener('variant:change',this.onVariantChange.bind(this));
    }
    onScroll(){
      const idx=Math.round(this.main.scrollLeft/this.main.clientWidth);
      const slide=this.slides[idx];
      if(slide) this.setActiveThumb(slide.dataset.mediaId);
    }
    setActiveThumb(id){
      this.thumbs.forEach(t=>{if(t.dataset.mediaId===id) t.setAttribute('aria-current','true'); else t.removeAttribute('aria-current');});
    }
    scrollToMedia(id){
      const slide=this.slides.find(s=>s.dataset.mediaId==id);
      if(slide){slide.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'});this.setActiveThumb(id);}
    }
    onVariantChange(e){
      const media=e.detail && e.detail.variant && e.detail.variant.featured_media;
      if(media) this.scrollToMedia(String(media.id));
    }
    openLightbox(slide){
      if(!this.lightbox) return;
      const clone=slide.cloneNode(true);
      clone.classList.remove('is-loading');
      this.lightboxBody.innerHTML='';
      this.lightboxBody.appendChild(clone);
      this.lightbox.showModal();
    }
  }
  document.addEventListener('DOMContentLoaded',()=>{
    document.querySelectorAll('product-media-gallery').forEach(el=>new ProductGallery(el));
  });
  if(typeof module!=='undefined') module.exports=ProductGallery;
})();
