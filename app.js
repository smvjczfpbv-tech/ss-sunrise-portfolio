(function(){
  'use strict';
  var $ = function(s,r){return (r||document).querySelector(s)};
  var $$ = function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(pointer:fine)').matches;
  var hasG = window.gsap && window.ScrollTrigger;

  /* header */
  var hdr = $('#hdr'), lastY = 0;
  addEventListener('scroll', function(){
    var y = scrollY; hdr.classList.toggle('solid', y > 40);
    if (y > 600 && y > lastY + 6) hdr.classList.add('hide'); else if (y < lastY - 6 || y < 600) hdr.classList.remove('hide');
    lastY = y;
  }, {passive:true});

  if (!hasG || reduce) {
    $$('.ln>span,.hero__h .hand,.hero__p,.hero__cta').forEach(function(e){ e.style.transform='none'; e.style.opacity=1; });
    $('#intro').style.cssText = 'position:relative;opacity:1;visibility:visible;background:#E3B023;padding:90px var(--pad)';
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  /* smooth scroll (desktop) */
  var lenis = null;
  if (fine && window.Lenis) {
    lenis = new Lenis({ lerp: .1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function(t){ lenis.raf(t * 1000); }); gsap.ticker.lagSmoothing(0);
  }

  /* anchors */
  $$('a[href^="#"]').forEach(function(a){
    a.addEventListener('click', function(e){
      var id = a.getAttribute('href'), t = id.length > 1 && $(id); if (!t) return; e.preventDefault();
      var top = t.getBoundingClientRect().top + scrollY;
      if (id === '#works') top = ScrollTrigger.getById('hero') ? ScrollTrigger.getById('hero').end : top;
      if (lenis) lenis.scrollTo(top, {duration: 1.4}); else scrollTo({top: top, behavior: 'smooth'});
    });
  });

  /* cursor */
  var cur = $('#cur'), curT = $('#curT');
  if (fine) {
    var qx = gsap.quickTo(cur, 'x', {duration: .35, ease: 'power3'}), qy = gsap.quickTo(cur, 'y', {duration: .35, ease: 'power3'});
    addEventListener('pointermove', function(e){ qx(e.clientX); qy(e.clientY); }, {passive:true});
    $$('[data-cur]').forEach(function(el){
      el.addEventListener('mouseenter', function(){ curT.textContent = el.dataset.cur; cur.classList.add('big'); });
      el.addEventListener('mouseleave', function(){ cur.classList.remove('big'); });
    });
    $$('a,button').forEach(function(el){ if (el.closest('[data-cur]')) return;
      el.addEventListener('mouseenter', function(){ gsap.to(cur, {scale: 2.2, duration: .3}); });
      el.addEventListener('mouseleave', function(){ gsap.to(cur, {scale: 1, duration: .3}); });
    });
  }

  /* hero intro */
  var sun = $('#sun');
  var intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
  intro.from([sun, '#sunSolid'], { yPercent: 45, duration: 1.8, ease: 'power2.out' }, 0)
       .to('.ln>span', { y: 0, duration: 1.1, stagger: .12 }, .2)
       .to('.hero__h .hand', { opacity: 1, duration: .8 }, .8)
       .to('.hero__p', { opacity: 1, duration: .8 }, 1)
       .to('.hero__cta', { opacity: 1, duration: .8 }, 1.1);

  /* hero -> sunrise fill */
  function sunScale(){
    var r = sun.getBoundingClientRect(), cx = r.left + r.width/2, cy = r.top + r.height/2 + scrollY - (ScrollTrigger.getById('hero') ? 0 : 0);
    var hero = $('#hero').getBoundingClientRect(), top = hero.top;
    cy = r.top - top + r.height/2; cx = r.left + r.width/2;
    var W = innerWidth, H = Math.max(innerHeight, hero.height);
    var d = Math.max(Math.hypot(cx, cy), Math.hypot(W - cx, cy), Math.hypot(cx, H - cy), Math.hypot(W - cx, H - cy));
    return d / (r.width/2) * 1.04;
  }
  var ht = gsap.timeline({ scrollTrigger: { id: 'hero', trigger: '#hero', start: 'top top', end: '+=130%', pin: true, scrub: 1, invalidateOnRefresh: true } });
  ht.to('#heroTxt', { y: -90, opacity: 0, duration: .3, ease: 'power1.in' }, 0)
    .to('#heroScroll', { opacity: 0, duration: .1 }, 0)
    .to('#sky', { clipPath: 'inset(0% 0% 0% 0%)', duration: .25 }, 0)
    .to('#sea', { opacity: 0, duration: .25 }, 0)
    .to('#sunSolid', { opacity: 1, duration: .15 }, .12)
    .to([sun, '#sunSolid'], { scale: sunScale, duration: .55, ease: 'power2.in' }, .15)
    .to('#intro', { autoAlpha: 1, duration: .2 }, .72)
    .from('#intro > *', { y: 50, stagger: .04, duration: .2 }, .72)
    .to({}, { duration: .1 });

  var mm = gsap.matchMedia();

  /* works: horizontal on desktop */
  mm.add('(min-width: 981px)', function(){
    var track = $('#track');
    var dist = function(){ return track.scrollWidth - innerWidth; };
    var tw = gsap.to(track, { x: function(){ return -dist(); }, ease: 'none',
      scrollTrigger: { trigger: '#works', start: 'top top', end: function(){ return '+=' + dist(); }, pin: true, scrub: 1, invalidateOnRefresh: true,
        onUpdate: function(s){ gsap.set('#wbar', { scaleX: s.progress }); } } });
    $$('.panel').forEach(function(p, i){
      if (i === 0) return;
      gsap.from($('.panel__txt', p), { x: 160, opacity: 0, ease: 'none', scrollTrigger: { trigger: p, containerAnimation: tw, start: 'left 85%', end: 'left 30%', scrub: true } });
      gsap.from($('.stage', p), { x: 240, rotate: 3, ease: 'none', scrollTrigger: { trigger: p, containerAnimation: tw, start: 'left 100%', end: 'left 20%', scrub: true } });
    });
  });
  mm.add('(max-width: 980px)', function(){
    $$('.panel').forEach(function(p){
      gsap.from($$('.panel__txt > *, .stage', p), { y: 40, opacity: 0, stagger: .06, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: p, start: 'top 75%' } });
    });
  });

  /* live page scroll inside device frames */
  $$('.dev__scr .long').forEach(function(img){
    function go(){
      var ratio = img.naturalHeight / img.naturalWidth; if (!ratio) return;
      var yp = -(1 - (10/16) / ratio) * 100;
      var tl = gsap.timeline({ repeat: -1, yoyo: true, repeatDelay: 1.4, paused: true });
      tl.to(img, { yPercent: yp, duration: ratio * 9, ease: 'sine.inOut' });
      ScrollTrigger.create({ trigger: img.closest('.panel'), containerAnimation: null, start: 'top bottom', end: 'bottom top',
        onToggle: function(s){ s.isActive ? tl.play() : tl.pause(); } });
      tl.play();
    }
    img.complete ? go() : img.addEventListener('load', go, { once: true });
  });

  /* process: scheme -> design */
  var steps = $$('#steps li'), mLabel = $('#mLabel');
  function proc(p){
    var k = Math.min(5, Math.floor(p * 6.2));
    steps.forEach(function(li, i){ li.classList.toggle('on', i <= k); });
    mLabel.textContent = p < .45 ? 'прототип' : p < .9 ? 'дизайн' : 'готово ✓';
  }
  mm.add('(min-width: 981px)', function(){
    gsap.timeline({ scrollTrigger: { trigger: '#process', start: 'top top', end: '+=150%', pin: true, scrub: 1, onUpdate: function(s){ proc(s.progress); } } })
      .to({}, { duration: .12 })
      .fromTo('#wire', { clipPath: 'inset(0% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 100%)', duration: .76, ease: 'none' }, .12)
      .fromTo('#seam', { left: '0%' }, { left: '100%', duration: .76, ease: 'none' }, .12)
      .to({}, { duration: .12 });
  });
  mm.add('(max-width: 980px)', function(){
    gsap.timeline({ scrollTrigger: { trigger: '#morph', start: 'top 70%', end: 'bottom 20%', scrub: 1, onUpdate: function(s){ proc(s.progress); } } })
      .fromTo('#wire', { clipPath: 'inset(0% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 100%)', ease: 'none' }, 0)
      .fromTo('#seam', { left: '0%' }, { left: '100%', ease: 'none' }, 0);
  });

  /* about parallax */
  gsap.fromTo('#aboutPh img', { yPercent: -7 }, { yPercent: 7, ease: 'none', scrollTrigger: { trigger: '#about', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.from('.about__tx > *', { y: 50, opacity: 0, stagger: .08, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.about__tx', start: 'top 85%' } });

  /* CTA: sunset rises */
  gsap.fromTo('.cta__sun', { yPercent: 35 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '#contact', start: 'top bottom', end: 'center center', scrub: true } });
  gsap.from('.cta__in > *', { y: 60, opacity: 0, stagger: .08, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.cta__in', start: 'top 75%' } });
  gsap.fromTo('.cta__word', { rotate: -8, scale: .7 }, { rotate: -3, scale: 1, ease: 'elastic.out(1,.4)', duration: 1.4, scrollTrigger: { trigger: '.cta h2', start: 'top 70%' } });

  /* magnetic */
  if (fine) $$('.mag').forEach(function(b){
    b.addEventListener('pointermove', function(e){ var r = b.getBoundingClientRect(); gsap.to(b, { x: (e.clientX - r.left - r.width/2) * .3, y: (e.clientY - r.top - r.height/2) * .4, duration: .4, ease: 'power3.out' }); });
    b.addEventListener('pointerleave', function(){ gsap.to(b, { x: 0, y: 0, duration: .8, ease: 'elastic.out(1,.35)' }); });
  });

  addEventListener('load', function(){ ScrollTrigger.refresh(); });
})();
