document.addEventListener('DOMContentLoaded', () => {
  const hero = document.querySelector('.search-hero');
  if(!hero) return;

  const input = hero.querySelector('.search-hero__input');
  const submitBtn = hero.querySelector('.search-hero__submit');

  // If quick-nav is present, keep its button URL in sync with the query
  const qn = hero.querySelector('quick-nav');
  if(qn){
    const observer = new MutationObserver(() => {
      const btn = qn.querySelector('.js-submit[href]');
      if(!btn || !input) return;
      try{
        const url = new URL(btn.getAttribute('href'), window.location.origin);
        if (input.value && input.value.trim().length){
          url.searchParams.set('q', input.value.trim());
        } else {
          url.searchParams.delete('q');
        }
        btn.setAttribute('href', url.pathname + url.search);
      }catch(e){}
    });
    observer.observe(qn, { attributes:true, subtree:true, attributeFilter:['href'] });

    // Also run once when we type
    input?.addEventListener('input', () => {
      const btn = qn.querySelector('.js-submit[href]');
      if(!btn) return;
      try{
        const url = new URL(btn.getAttribute('href'), window.location.origin);
        if (input.value && input.value.trim().length){
          url.searchParams.set('q', input.value.trim());
        } else {
          url.searchParams.delete('q');
        }
        btn.setAttribute('href', url.pathname + url.search);
      }catch(e){}
    });
  }

  // Autofocus the big input on the search page
  setTimeout(() => input?.focus(), 20);
});
