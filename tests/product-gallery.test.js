const fs = require('fs');
const assert = require('assert');

const snippet = fs.readFileSync('snippets/product-media-gallery.liquid', 'utf8');
assert(snippet.includes('data-product-gallery'), 'data-product-gallery missing');
assert(snippet.includes('deferred-media'), 'deferred-media missing');

const js = fs.readFileSync('assets/product-gallery.js', 'utf8');
assert(/class ProductGallery/.test(js), 'ProductGallery class missing');
assert(js.includes('variant:change'), 'variant change listener missing');

const css = fs.readFileSync('assets/product-gallery.css', 'utf8');
assert(css.includes('scroll-snap-type'), 'scroll-snap-type missing');

console.log('All product gallery tests passed');
