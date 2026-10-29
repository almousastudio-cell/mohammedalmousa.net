(() => {
  'use strict';
  const slides = [...document.querySelectorAll('.slide')];
  const $ = s => document.querySelector(s);
  const ar = n => String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
  let current = 0, deck = false, toastTimer;
  const dialog = $('#index');
  function reflect(n) {
    current = Math.max(0, Math.min(slides.length - 1, n));
    slides.forEach((s, i) => s.classList.toggle('active', i === current));
    $('#counter').textContent = ar(current + 1) + ' / ' + ar(slides.length);
    $('#current-title').textContent = slides[current].dataset.title;
    $('#progress').style.width = (current + 1) / slides.length * 100 + '%';
    $('#previous').disabled = current === 0;
    $('#next').disabled = current === slides.length - 1;
    document.querySelectorAll('.index-link').forEach((a,i) => {
      if (i === current) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }
  function go(n, updateHash = true) {
    reflect(n);
    if(updateHash) history.pushState(null, '', '#page-' + (current + 1));
    if(deck) window.scrollTo({top:0, behavior:'instant'});
    else slides[current].scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block:'start'});
  }
  function fromHash() {
    const match = location.hash.match(/^#page-(\d+)$/);
    if(match) go(Number(match[1])-1, false);
  }
  $('#next').addEventListener('click', () => go(current+1));
  $('#previous').addEventListener('click', () => go(current-1));
  function openIndex(){dialog.showModal();}
  $('#index-button').addEventListener('click', openIndex);
  $('#page-index').addEventListener('click', openIndex);
  $('#close-index').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => {if(e.target === dialog) {const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
  document.addEventListener('click', e => {
    const a=e.target.closest('a[href^="#page-"]');
    if(!a)return;
    e.preventDefault();
    if(dialog.open)dialog.close();
    go(Number(a.getAttribute('href').slice(6))-1);
  });
  $('#mode').addEventListener('click', () => {
    deck=!deck;
    document.body.classList.toggle('deck-mode',deck);
    $('#mode').setAttribute('aria-pressed',String(deck));
    $('#mode').textContent=deck?'قراءة متصلة':'عرض شرائح';
    go(current,false);
  });
  function toast(message){clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').classList.add('visible');toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),3200);}
  $('#fullscreen').addEventListener('click', async () => {
    try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}
    catch{toast('يمكنكم استخدام وضع ملء الشاشة من المتصفح.');}
  });
  $('#print').addEventListener('click',()=>window.print());
  $('#share').addEventListener('click', async () => {
    const url=location.href.split('#')[0];
    try {
      if(navigator.share) await navigator.share({title:'Las Olas · الاتجاه الإبداعي | Outbox',url});
      else {await navigator.clipboard.writeText(url);toast('نُسخ رابط العرض.');}
    } catch(e) {if(e.name!=='AbortError'){try{await navigator.clipboard.writeText(url);toast('نُسخ رابط العرض.');}catch{window.prompt('رابط العرض',url);}}}
  });
  document.addEventListener('keydown',e=>{
    if(dialog.open||e.altKey||e.ctrlKey||e.metaKey||e.target.closest('button,a,input,textarea,select,[contenteditable]'))return;
    if(e.key==='ArrowLeft'||e.key==='PageDown'){e.preventDefault();go(current+1);}
    if(e.key==='ArrowRight'||e.key==='PageUp'){e.preventDefault();go(current-1);}
    if(e.key==='Home'){e.preventDefault();go(0);}
    if(e.key==='End'){e.preventDefault();go(slides.length-1);}
  });
  let scheduled=false;
  window.addEventListener('scroll',()=>{
    if(deck||scheduled)return;
    scheduled=true;requestAnimationFrame(()=>{
      scheduled=false;
      let nearest=0,distance=Infinity;
      slides.forEach((slide,i)=>{const r=slide.getBoundingClientRect();const d=Math.abs(r.top-100);if(r.bottom>120&&d<distance){distance=d;nearest=i;}});
      reflect(nearest);
    });
  },{passive:true});
  window.addEventListener('popstate',fromHash);
  reflect(0);
  if(location.hash)requestAnimationFrame(fromHash);
})();
