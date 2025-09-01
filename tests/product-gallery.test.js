const assert=require('assert');
let variantHandler;
const listeners={};
// Minimal DOM stubs
global.document={
  addEventListener:(ev,cb)=>{listeners[ev]=cb; if(ev==='variant:change') variantHandler=cb;},
  querySelectorAll:()=>[]
};
global.window={};
const ProductGallery=require('../assets/product-gallery.js');
function createSlide(id){return{dataset:{mediaId:String(id)},scrollIntoView(){this.called=true;},called:false,querySelector:(sel)=>sel==='img'?{complete:true,addEventListener(){}}:null,addEventListener(){},classList:{remove(){}},cloneNode(){return this;}}}
const slide1=createSlide(1);const slide2=createSlide(2);
const galleryEl={
  querySelector:(sel)=>{
    if(sel==='.product-gallery__main') return {children:[slide1,slide2],addEventListener(){},clientWidth:100,scrollLeft:0};
    if(sel==='.product-gallery__thumbs') return {querySelectorAll:()=>[]};
    return null;
  }
};
const gallery=new ProductGallery(galleryEl);
assert.strictEqual(gallery.slides.length,2,'two slides initialized');
gallery.scrollToMedia('2');
assert.ok(slide2.called,'slide2 scrolled into view');
// simulate variant change
variantHandler({detail:{variant:{featured_media:{id:'1'}}}});
assert.ok(slide1.called,'variant change scrolls to slide1');
console.log('ProductGallery tests passed');
