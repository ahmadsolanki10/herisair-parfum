(function(){
 const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];
 const products=window.HERISAIR_PRODUCTS||[];
 const storeProducts=window.HERISAIR_STORE_PRODUCTS||products;
 const root=document.documentElement;
 const header=$('[data-header]');
 if(header) header.innerHTML=`<a class="skip" href="#main">Skip to content</a><div class="notice">Complimentary UAE delivery on the inaugural collection</div><div class="nav"><button class="menu" aria-label="Open menu" aria-expanded="false"><i></i><i></i></button><a class="brand" href="index.html" aria-label="Hérisair home"><img src="assets/images/herisair-header-logo.png" alt="Hérisair"></a><nav aria-label="Main navigation"><a href="our-house.html">The House</a><a href="collection.html">Launch Collection</a><div class="shop-menu"><button type="button" class="shop-trigger" aria-haspopup="true">Discover</button><div class="shop-dropdown"><a href="unity.html">Unity</a><a href="ascent.html">Ascent</a><a href="eminence.html">Eminence</a></div></div><a href="store.html">Store</a></nav><div class="nav-actions"><a class="nav-icon" href="contact.html" aria-label="Client account"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="7.5" r="3.5"></circle><path d="M5.5 20c.5-4 2.7-6 6.5-6s6 2 6.5 6"></path></svg></a><button class="bag-open nav-icon" aria-label="Open shopping bag"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8.5h14l1 12H4l1-12Z"></path><path d="M9 9V6.5a3 3 0 0 1 6 0V9"></path></svg><span class="sr-only" data-bag-count>0</span></button></div></div><div class="mobile-nav"><div class="mobile-nav-panel" data-mobile-menu-main><a href="our-house.html">The House</a><a href="collection.html">Launch Collection</a><button type="button" class="mobile-discover-open" aria-expanded="false">Discover <span aria-hidden="true">→</span></button><a href="store.html">Store</a><a href="contact.html">Client care</a></div><div class="mobile-nav-panel mobile-nav-discover" data-mobile-menu-discover hidden><button type="button" class="mobile-discover-back"><span aria-hidden="true">←</span> Back</button><a href="unity.html">Unity</a><a href="ascent.html">Ascent</a><a href="eminence.html">Eminence</a></div></div>`;
 const footer=$('[data-footer]');
 if(footer) footer.innerHTML=`<div class="footer-grid"><div><a class="brand" href="index.html">HÉRISAIR</a><p>Automotive fragrance,<br>composed in the UAE.</p></div><div><b>Explore</b><a href="our-house.html">The House</a><a href="collection.html">Launch Collection</a><a href="quiz.html">Scent Discovery</a></div><div><b>Contact Us</b><a href="contact.html">Contact</a><a href="faq.html">Care & FAQs</a><a href="shipping.html">Shipping & delivery</a><a href="returns.html">Returns</a></div><div><b>Socials</b><a href="https://www.instagram.com/herisair.parfum/" target="_blank" rel="noopener noreferrer">Instagram</a><a href="https://www.tiktok.com/@herisair.parfum" target="_blank" rel="noopener noreferrer">TikTok</a></div><div><b>Legal</b><a href="privacy.html">Privacy</a><a href="terms.html">Terms</a><a href="cookies.html">Cookies</a></div></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} Hérisair</span><span>Dubai, United Arab Emirates</span></div>`;
 document.body.insertAdjacentHTML('beforeend',`<aside class="bag" aria-hidden="true"><div class="bag-head"><h2>Your selection</h2><button class="bag-close" aria-label="Close shopping bag">×</button></div><div class="bag-items"></div><div class="bag-total"><span>Total</span><strong data-total>AED 0</strong><button class="btn checkout">Proceed to secure checkout</button><small>Checkout connection required before launch.</small></div></aside><div class="scrim"></div><div class="toast" role="status"></div>`);
 const menu=$('.menu');
 const mobileMenuMain=$('[data-mobile-menu-main]');
 const mobileMenuDiscover=$('[data-mobile-menu-discover]');
 const mobileDiscoverOpen=$('.mobile-discover-open');
 const mobileDiscoverBack=$('.mobile-discover-back');
 function setMobileDiscover(on){
  if(mobileMenuMain)mobileMenuMain.hidden=on;
  if(mobileMenuDiscover)mobileMenuDiscover.hidden=!on;
  if(mobileDiscoverOpen)mobileDiscoverOpen.setAttribute('aria-expanded',String(on));
 }
 if(menu)menu.onclick=()=>{const on=document.body.classList.toggle('menu-on');menu.setAttribute('aria-expanded',on);if(!on)setMobileDiscover(false)};
 if(mobileDiscoverOpen)mobileDiscoverOpen.onclick=()=>setMobileDiscover(true);
 if(mobileDiscoverBack)mobileDiscoverBack.onclick=()=>setMobileDiscover(false);
 let bag=[];
 try{bag=JSON.parse(localStorage.getItem('herisairBag')||'[]')}catch{bag=[]}
 if(!Array.isArray(bag))bag=[];
 const productBySlug=slug=>storeProducts.find(x=>x.slug===slug);
 const priceLabel=p=>Number.isFinite(p.price)?`AED ${p.price}`:(p.priceLabel||'Price to be confirmed');
 function save(){localStorage.setItem('herisairBag',JSON.stringify(bag));renderBag()}
 function addToBag(slug,qty=1){
  if(!productBySlug(slug))return;
  const item=bag.find(i=>i.slug===slug);
  item?item.qty+=qty:bag.push({slug,qty});
  save();
  bagOpen();
 }
 function renderBag(){
  bag=bag.filter(i=>productBySlug(i.slug)&&Number.isFinite(i.qty)&&i.qty>0);
  $$('[data-bag-count]').forEach(x=>x.textContent=bag.reduce((n,i)=>n+i.qty,0));
  const box=$('.bag-items');
  if(!box)return;
  box.innerHTML=bag.length?bag.map(i=>{const p=productBySlug(i.slug);return `<article class="bag-item"><img src="assets/images/${p.image}" alt=""><div><h3>${p.name}</h3><p>${priceLabel(p)}</p><div class="qty"><button data-dec="${p.slug}" aria-label="Decrease ${p.name} quantity">−</button><span>${i.qty}</span><button data-inc="${p.slug}" aria-label="Increase ${p.name} quantity">+</button></div></div><button class="remove" data-remove="${p.slug}" aria-label="Remove ${p.name}">×</button></article>`}).join(''):'<p class="empty">Your selection is currently empty.</p>';
  const hasPending=bag.some(i=>!Number.isFinite(productBySlug(i.slug).price));
  const total=bag.reduce((n,i)=>n+(Number.isFinite(productBySlug(i.slug).price)?productBySlug(i.slug).price:0)*i.qty,0);
  $('[data-total]').textContent=hasPending?'Price pending':`AED ${total}`;
  $$('[data-inc]').forEach(b=>b.onclick=()=>{bag.find(i=>i.slug===b.dataset.inc).qty++;save()});
  $$('[data-dec]').forEach(b=>b.onclick=()=>{const i=bag.find(x=>x.slug===b.dataset.dec);i.qty--;if(i.qty<1)bag=bag.filter(x=>x!==i);save()});
  $$('[data-remove]').forEach(b=>b.onclick=()=>{bag=bag.filter(x=>x.slug!==b.dataset.remove);save()});
 }
 function bagOpen(on=true){document.body.classList.toggle('bag-on',on);$('.bag').setAttribute('aria-hidden',!on)}
 document.addEventListener('click',e=>{
  const adjust=e.target.closest('[data-store-adjust]');
  if(adjust){
   const card=adjust.closest('[data-store-card]'),value=$('[data-store-qty]',card);
   value.textContent=Math.max(1,Math.min(99,Number(value.textContent)+Number(adjust.dataset.storeAdjust)));
  }
  const add=e.target.closest('[data-add]');
  if(add){
   const card=add.closest('[data-store-card]');
   const qty=card?Number($('[data-store-qty]',card)?.textContent||1):1;
   addToBag(add.dataset.add,qty);
  }
  if(e.target.closest('.bag-open'))bagOpen();
  if(e.target.closest('.bag-close')||e.target.classList.contains('scrim'))bagOpen(false);
 });
 renderBag();
 const grid=$('[data-products]'); if(grid) grid.innerHTML=products.map(p=>`<article class="product-card reveal"><a href="${p.slug}.html"><figure><img src="assets/images/${p.image}" loading="lazy" alt="Hérisair ${p.name} automotive fragrance"><figcaption>${p.number}</figcaption></figure><div class="product-meta"><div><p class="eyebrow">${p.family}</p><h3>${p.name}</h3></div><span>AED ${p.price}</span></div><p>${p.tagline}</p></a><button class="text-link" data-add="${p.slug}">Add to bag <span>↗</span></button></article>`).join('');
 function storeNotesMarkup(p){
  if(!p.storeNotes)return `<p>${p.tagline}</p>`;
  return `<dl class="store-note-pyramid" aria-label="${p.name} fragrance notes"><div><dt>Top</dt><dd>${p.storeNotes.top.join(' · ')}</dd></div><div><dt>Heart</dt><dd>${p.storeNotes.heart.join(' · ')}</dd></div><div><dt>Base</dt><dd>${p.storeNotes.base.join(' · ')}</dd></div></dl>`;
 }
 function storeCardMarkup(p,detailLink=true){
  const figure=`<figure><img src="assets/images/${p.image}" loading="lazy" alt="${p.name} by Hérisair"></figure>`;
  const meta=`<p class="eyebrow">${p.storeFamily||p.family}</p><h3>${detailLink?`<a class="store-card-title-link" href="${p.slug}.html">${p.name}</a>`:p.name}</h3>${storeNotesMarkup(p)}<strong>${priceLabel(p)}</strong>`;
  const details=detailLink?`<a class="store-card-link" href="${p.slug}.html" aria-label="Discover ${p.name}">${figure}</a><div class="store-card-meta">${meta}</div>`:`<div class="store-card-link">${figure}<div class="store-card-meta">${meta}</div></div>`;
  return `<article class="store-card reveal" data-store-card>${details}<div class="store-purchase"><div class="store-quantity" aria-label="Quantity"><button type="button" data-store-adjust="-1" aria-label="Decrease quantity">−</button><span data-store-qty>1</span><button type="button" data-store-adjust="1" aria-label="Increase quantity">+</button></div><button type="button" class="btn store-add" data-add="${p.slug}">Add to bag</button></div></article>`;
 }
 function storeFragranceRowMarkup(p,index){
  const direction=index%2?' store-fragrance-row-reverse':'';
  return `<article class="store-card store-fragrance-row${direction} reveal" id="store-${p.slug}" data-store-card><a class="store-fragrance-media" href="${p.slug}.html" aria-label="Discover ${p.name}"><figure><img src="assets/images/${p.image}" loading="lazy" alt="${p.name} by Hérisair"></figure></a><div class="store-fragrance-details"><div class="store-card-meta"><p class="eyebrow">${p.storeFamily||p.family}</p><h3><a class="store-card-title-link" href="${p.slug}.html">${p.name}</a></h3>${storeNotesMarkup(p)}<strong>${priceLabel(p)}</strong></div><div class="store-purchase"><div class="store-quantity" aria-label="Quantity"><button type="button" data-store-adjust="-1" aria-label="Decrease quantity">−</button><span data-store-qty>1</span><button type="button" data-store-adjust="1" aria-label="Increase quantity">+</button></div><button type="button" class="btn store-add" data-add="${p.slug}">Add to bag</button></div></div></article>`;
 }
 const storeFragrances=$('[data-store-fragrances]');
 if(storeFragrances){
  storeFragrances.innerHTML=products.map((p,index)=>storeFragranceRowMarkup(p,index)).join('');
  const storeTarget=document.getElementById(location.hash.slice(1));
  if(storeTarget)requestAnimationFrame(()=>storeTarget.scrollIntoView({block:'start'}));
 }
 const storeDiscovery=$('[data-store-discovery]');
 if(storeDiscovery&&window.HERISAIR_DISCOVERY_SET)storeDiscovery.innerHTML=storeCardMarkup(window.HERISAIR_DISCOVERY_SET,false);
 const detail=$('[data-product-detail]'); if(detail){const slug=document.body.dataset.product,p=products.find(x=>x.slug===slug);if(p){detail.innerHTML=`<section class="product-detail-hero"><div class="product-visual"><img src="assets/images/${p.image}" alt="Hérisair ${p.name} fragrance bottle"></div><div class="product-buy"><p class="eyebrow">${p.number} · ${p.family}</p><h1>${p.name}</h1><p class="product-tagline">${p.tagline}</p><p>${p.description}</p><div class="price">AED ${p.price}</div><button class="btn" data-add="${p.slug}">Add to bag</button><p class="micro">Complimentary UAE delivery · Secure checkout</p></div></section><section class="notes"><div><p class="eyebrow">The composition</p><h2>${p.character}</h2><p>${p.description}</p><ol>${p.notes.map((n,i)=>`<li><span>0${i+1}</span>${n}</li>`).join('')}</ol></div><img src="assets/images/${p.detail}" loading="lazy" alt="The notes of ${p.name}"></section><section class="ritual-banner" style="background-image:url('assets/images/${p.interior}')"><div><p class="eyebrow">The private atmosphere</p><h2>Composed for<br>the journey within</h2></div></section>`}}
 const observer=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in')}),{threshold:.12});$$('.reveal:not(.house-scroll-reveal)').forEach(e=>observer.observe(e));
 const homeScrollSections=$$('.home main>section.scroll-reveal');
 const homeHero=$('.home .hero');
 if(homeScrollSections.length||homeHero){
  let homeSectionsArmed=false,homeSectionsTicking=false,homeLastScrollY=window.scrollY;
  const updateHomeSections=()=>{
   homeSectionsTicking=false;
   if(!homeSectionsArmed){
    homeScrollSections.forEach(section=>section.classList.remove('in'));
    if(homeHero)homeHero.classList.remove('section-away');
    return;
   }
   const sections=homeHero?[homeHero,...homeScrollSections]:homeScrollSections;
   const scrollingDown=window.scrollY>=homeLastScrollY;
   const handoffLine=window.innerHeight*(scrollingDown?.7:.25);
   let activeSection=sections.find(section=>{
    const rect=section.getBoundingClientRect();
    return rect.top<=handoffLine&&rect.bottom>handoffLine;
   })||null;
   if(!activeSection){
    activeSection=scrollingDown
     ?sections.find(section=>section.getBoundingClientRect().bottom>handoffLine)||sections.at(-1)
     :[...sections].reverse().find(section=>section.getBoundingClientRect().top<=handoffLine)||sections[0];
   }
   homeScrollSections.forEach(section=>section.classList.toggle('in',section===activeSection));
   if(homeHero)homeHero.classList.toggle('section-away',homeHero!==activeSection);
   homeLastScrollY=window.scrollY;
  };
  const handleHomeSectionScroll=()=>{
   if(window.scrollY>0)homeSectionsArmed=true;
   if(!homeSectionsTicking){homeSectionsTicking=true;requestAnimationFrame(updateHomeSections)}
  };
  window.addEventListener('scroll',handleHomeSectionScroll,{passive:true});
  window.addEventListener('resize',handleHomeSectionScroll,{passive:true});
 }
 const homeChapterSections=$$('.home .home-chapter-scroll');
 if(homeChapterSections.length){
  let homeChaptersTicking=false;
  const updateHomeChapters=()=>{
   homeChaptersTicking=false;
   let activeSection=null;
   let greatestVisibleArea=0;
   homeChapterSections.forEach(section=>{
    const rect=section.getBoundingClientRect();
    const visibleArea=Math.max(0,Math.min(rect.bottom,window.innerHeight)-Math.max(rect.top,0));
    if(visibleArea>greatestVisibleArea){
     greatestVisibleArea=visibleArea;
     activeSection=section;
    }
   });
   const minimumVisibleArea=Math.min(window.innerHeight*.18,(activeSection?.getBoundingClientRect().height||0)*.22);
   if(greatestVisibleArea<minimumVisibleArea)activeSection=null;
   homeChapterSections.forEach(section=>section.classList.toggle('in',section===activeSection));
  };
  const handleHomeChapterScroll=()=>{
   if(!homeChaptersTicking){homeChaptersTicking=true;requestAnimationFrame(updateHomeChapters)}
  };
  updateHomeChapters();
  window.addEventListener('scroll',handleHomeChapterScroll,{passive:true});
  window.addEventListener('resize',handleHomeChapterScroll,{passive:true});
 }
 const houseScrollSections=$$('.house-page main>section.house-scroll-reveal');
 if(houseScrollSections.length){
  let houseSectionsTicking=false,houseLastScrollY=window.scrollY;
  const updateHouseSections=()=>{
   houseSectionsTicking=false;
   const scrollingDown=window.scrollY>=houseLastScrollY;
   const handoffLine=window.innerHeight*(scrollingDown?.7:.25);
   let activeSection=houseScrollSections.find(section=>{
    const rect=section.getBoundingClientRect();
    return rect.top<=handoffLine&&rect.bottom>handoffLine;
   })||null;
   if(!activeSection){
    activeSection=scrollingDown
     ?houseScrollSections.find(section=>section.getBoundingClientRect().bottom>handoffLine)||houseScrollSections.at(-1)
     :[...houseScrollSections].reverse().find(section=>section.getBoundingClientRect().top<=handoffLine)||houseScrollSections[0];
   }
   houseScrollSections.forEach(section=>section.classList.toggle('in',section===activeSection));
   houseLastScrollY=window.scrollY;
  };
  const handleHouseSectionScroll=()=>{
   if(!houseSectionsTicking){houseSectionsTicking=true;requestAnimationFrame(updateHouseSections)}
  };
  updateHouseSections();
  window.addEventListener('scroll',handleHouseSectionScroll,{passive:true});
  window.addEventListener('resize',handleHouseSectionScroll,{passive:true});
 }
 const contact=$('[data-contact]');if(contact)contact.onsubmit=async e=>{e.preventDefault();const note=$('.form-note',contact),btn=$('button',contact);if(!contact.checkValidity()){contact.reportValidity();return}btn.disabled=true;btn.textContent='Sending…';try{const endpoint=contact.dataset.endpoint;if(!endpoint)throw Error();const res=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(new FormData(contact)))});if(!res.ok)throw Error();note.textContent='Thank you. A client advisor will be in touch shortly.';contact.reset()}catch{note.textContent='The form is ready, but its secure mail connection must be configured before launch.'}finally{btn.disabled=false;btn.textContent='Send enquiry'}};
 const checkout=$('.checkout');if(checkout)checkout.onclick=()=>{const toast=$('.toast');toast.textContent=bag.length?'Secure checkout must be connected before orders can be accepted.':'Your selection is empty.';toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),3500)};
 const quiz=$('[data-quiz]');if(quiz){
  let step=0,scores={unity:0,ascent:0,eminence:0};
  const questions=[
   {q:'What should your car feel like?',a:[['A familiar sanctuary','unity'],['A place of momentum','ascent'],['A private statement','eminence']]},
   {q:'Which trail draws you in?',a:[['Warm spice and soft sweetness','unity'],['Citrus, musk and amber','ascent'],['Oud, earth and aromatic woods','eminence']]},
   {q:'Choose the impression you leave',a:[['Grounded and composed','unity'],['Bright and assured','ascent'],['Distinguished and commanding','eminence']]}
  ];
  const resultDetails={
   unity:{chapter:'Chapter I · The Awakening',family:'Oud · Amber · Spicy',desktop:'collection-unity-v1.jpeg',mobile:'mobile-hero-unity-v2.png'},
   ascent:{chapter:'Chapter II · The Rise',family:'Citrus · Fruity · Fresh',desktop:'collection-ascent-v1.png',mobile:'mobile-hero-ascent-v2.png'},
   eminence:{chapter:'Chapter III · The Achievement',family:'Oriental · Leather · Woody',desktop:'collection-eminence-v1.png',mobile:'mobile-hero-eminence-v2.png'}
  };
  const restart=()=>{step=0;scores={unity:0,ascent:0,eminence:0};showIntro()};
  const bindStart=()=>{const start=$('[data-quiz-start]',quiz);if(start)start.onclick=()=>showQuestion()};
  function showIntro(){
   quiz.innerHTML=`<div class="scent-quiz-intro scent-quiz-enter"><p class="eyebrow">A private consultation</p><h1 id="quiz-title">Your atmosphere<br>considered</h1><p class="scent-quiz-lead">Three considered questions reveal the fragrance that belongs in your interior.</p><button class="scent-quiz-button" type="button" data-quiz-start>Begin the consultation</button><p class="scent-quiz-meta">03 questions <span aria-hidden="true">·</span> About one minute</p></div>`;
   bindStart();
  }
  function showQuestion(){
   if(step>=questions.length){showResult();return}
   const x=questions[step],current=String(step+1).padStart(2,'0'),progress=((step+1)/questions.length)*100;
   quiz.innerHTML=`<div class="scent-quiz-question scent-quiz-enter"><div class="scent-quiz-progress"><span>Question ${current}</span><span>${current} / 03</span></div><div class="scent-quiz-progress-track" role="progressbar" aria-label="Consultation progress" aria-valuemin="1" aria-valuemax="3" aria-valuenow="${step+1}"><i style="width:${progress}%"></i></div><p class="eyebrow">Scent discovery</p><h2>${x.q}</h2><div class="scent-quiz-answers">${x.a.map((a,i)=>`<button type="button" data-choice="${a[1]}"><span class="scent-quiz-answer-number">0${i+1}</span><span>${a[0]}</span><span class="scent-quiz-arrow" aria-hidden="true">→</span></button>`).join('')}</div></div>`;
   $$('[data-choice]',quiz).forEach(b=>b.onclick=()=>{scores[b.dataset.choice]++;step++;showQuestion()});
  }
  function showResult(){
   const slug=Object.keys(scores).sort((a,b)=>scores[b]-scores[a])[0],p=products.find(x=>x.slug===slug),detail=resultDetails[slug];
   quiz.innerHTML=`<article class="scent-quiz-result scent-quiz-enter"><picture class="scent-quiz-result-media"><source media="(max-width: 850px)" srcset="assets/images/${detail.mobile}"><img src="assets/images/${detail.desktop}" alt="Hérisair ${p.name} fragrance"></picture><div class="scent-quiz-result-copy"><p class="eyebrow">Your fragrance</p><p class="scent-quiz-chapter">${detail.chapter}</p><h2>${p.name}</h2><p class="scent-quiz-family">${detail.family}</p><p class="scent-quiz-result-description">${p.description}</p><div class="scent-quiz-result-actions"><a class="scent-quiz-button" href="${p.slug}.html">Discover ${p.name}</a><button class="scent-quiz-restart" type="button" data-restart>Begin again</button></div></div></article>`;
   $('[data-restart]',quiz).onclick=restart;
  }
  bindStart();
 }
 window.addEventListener('scroll',()=>root.style.setProperty('--scroll',window.scrollY));
})();
