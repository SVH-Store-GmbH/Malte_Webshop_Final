document.addEventListener('DOMContentLoaded',()=>{
  const gallery=document.querySelector('.product-gallery');
  if(!gallery) return;
  const images=[...gallery.querySelectorAll('.product-gallery__image')];
  const thumbs=[...gallery.querySelectorAll('.product-gallery__thumb')];
  let index=0;
  function show(i){
    images[index].classList.remove('is-active');
    thumbs[index].classList.remove('is-active');
    index=i;
    images[index].classList.add('is-active');
    thumbs[index].classList.add('is-active');
    thumbs[index].scrollIntoView({behavior:'smooth',inline:'center',block:'nearest'});
  }
  thumbs.forEach((btn,i)=>btn.addEventListener('click',()=>show(i)));
  gallery.addEventListener('keydown',e=>{
    if(e.key==='ArrowRight'){show((index+1)%images.length);e.preventDefault();}
    else if(e.key==='ArrowLeft'){show((index-1+images.length)%images.length);e.preventDefault();}
    else if(e.key==='Home'){show(0);e.preventDefault();}
    else if(e.key==='End'){show(images.length-1);e.preventDefault();}
  });
});
