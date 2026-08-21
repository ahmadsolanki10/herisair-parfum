(function(){
 const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];
 const products=window.HERISAIR_PRODUCTS||[];
 const root=document.documentElement;
 const header=$('[data-header]');
 if(header) header.innerHTML=`<a class="skip" href="#main">Skip to content</a><div class="notice">Complimentary UAE delivery on the inaugural collection</div><div class="nav"><button class="menu" aria-label="Open menu" aria-expanded="false"><i></i><i></i></button><a class="brand" href="index.html" aria-label="Hérisair home"><img src="assets/images/herisair-header-logo.png" alt="Hérisair"></a><nav aria-label="Main navigation"><a href="our-house.html">The House</a><a href="collection.html">Launch Collection</a><div class="shop-menu"><a class="shop-trigger" href="collection.html" aria-haspopup="true">Shop</a><div class="shop-dropdown"><a href="unity.html">Unity</a><a href="ascent.html">Ascent</a><a href="eminence.html">Eminence</a><a href="collection.html#discovery-set">Discovery Set</a></div></div></nav><div class="nav-actions"><a class="nav-icon" href="contact.html" aria-label="Client account"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="7.5" r="3.5"></circle><path d="M5.5 20c.5-4 2.7-6 6.5-6s6 2 6.5 6"></path></svg></a><button class="bag-open nav-icon" aria-label="Open shopping bag"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8.5h14l1 12H4l1-12Z"></path><path d="M9 9V6.5a3 3 0 0 1 6 0V9"></path></svg><span class="sr-only" data-bag-count>0</span></button></div></div><div class="mobile-nav"><a href="our-house.html">The House</a><a href="collection.html">Launch Collection</a><a href="collection.html">Shop</a><a href="contact.html">Client care</a></div>`;
 const footer=$('[data-footer]');
 if(footer) footer.innerHTML=`<section class="footer-lead"><p class="eyebrow">The private list</p><h2>Enter the world<br>of Hérisair.</h2><form class="signup" data-signup><label class="sr-only" for="footer-email">Email address</label><input id="footer-email" type="email" placeholder="Email address" required><button>Request access</button><p class="form-note" aria-live="polite"></p></form></section><div class="footer-grid"><div><a class="brand" href="index.html">HÉRISAIR</a><p>Automotive fragrance,<br>composed in the UAE.</p></div><div><b>Explore</b><a href="collection.html">Collection</a><a href="quiz.html">Scent discovery</a><a href="our-house.html">Our house</a></div><div><b>Client care</b><a href="contact.html">Contact</a><a href="faq.html">Care & FAQs</a><a href="shipping.html">Shipping</a><a href="returns.html">Returns</a></div><div><b>Legal</b><a href="privacy.html">Privacy</a><a href="terms.html">Terms</a><a href="cookies.html">Cookies</a></div></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} Hérisair</span><span>Dubai, United Arab Emirates</span></div>`;
 document.body.insertAdjacentHTML('beforeend',`<aside class="bag" aria-hidden="true"><div class="bag-head"><h2>Your selection</h2><button class="bag-close" aria-label="Close shopping bag">×</button></div><div class="bag-items"></div><div class="bag-total"><span>Total</span><strong>AED <span data-total>0</span></strong><button class="btn checkout">Proceed to secure checkout</button><small>Checkout connection required before launch.</small></div></aside><div class="scrim"></div><div class="toast" role="status"></div>`);
 const menu=$('.menu'); if(menu) menu.onclick=()=>{const on=document.body.classList.toggle('menu-on');menu.setAttribute('aria-expanded',on)};
 let bag=JSON.parse(localStorage.getItem('herisairBag')||'[]');
 function save(){localStorage.setItem('herisairBag',JSON.stringify(bag)); renderBag()}
 function renderBag(){$$('[data-bag-count]').forEach(x=>x.textContent=bag.reduce((n,i)=>n+i.qty,0)); const box=$('.bag-items'); if(!box)return; box.innerHTML=bag.length?bag.map(i=>{const p=products.find(x=>x.slug===i.slug);return `<article class="bag-item"><img src="assets/images/${p.image}" alt=""><div><h3>${p.name}</h3><p>AED ${p.price}</p><div class="qty"><button data-dec="${p.slug}">−</button><span>${i.qty}</span><button data-inc="${p.slug}">+</button></div></div><button class="remove" data-remove="${p.slug}" aria-label="Remove ${p.name}">×</button></article>`}).join(''):'<p class="empty">Your selection is currently empty.</p>'; $('[data-total]').textContent=bag.reduce((n,i)=>n+(products.find(x=>x.slug===i.slug)?.price||0)*i.qty,0); $$('[data-inc]').forEach(b=>b.onclick=()=>{bag.find(i=>i.slug===b.dataset.inc).qty++;save()});$$('[data-dec]').forEach(b=>b.onclick=()=>{const i=bag.find(x=>x.slug===b.dataset.dec);i.qty--;if(i.qty<1)bag=bag.filter(x=>x!==i);save()});$$('[data-remove]').forEach(b=>b.onclick=()=>{bag=bag.filter(x=>x.slug!==b.dataset.remove);save()})}
 function bagOpen(on=true){document.body.classList.toggle('bag-on',on);$('.bag').setAttribute('aria-hidden',!on)}
 document.addEventListener('click',e=>{const add=e.target.closest('[data-add]');if(add){const slug=add.dataset.add,item=bag.find(i=>i.slug===slug);item?item.qty++:bag.push({slug,qty:1});save();bagOpen();}if(e.target.closest('.bag-open'))bagOpen();if(e.target.closest('.bag-close')||e.target.classList.contains('scrim'))bagOpen(false)});
 renderBag();
 const grid=$('[data-products]'); if(grid) grid.innerHTML=products.map(p=>`<article class="product-card reveal"><a href="${p.slug}.html"><figure><img src="assets/images/${p.image}" loading="lazy" alt="Hérisair ${p.name} automotive fragrance"><figcaption>${p.number}</figcaption></figure><div class="product-meta"><div><p class="eyebrow">${p.family}</p><h3>${p.name}</h3></div><span>AED ${p.price}</span></div><p>${p.tagline}</p></a><button class="text-link" data-add="${p.slug}">Add to bag <span>↗</span></button></article>`).join('');
 const detail=$('[data-product-detail]'); if(detail){const slug=document.body.dataset.product,p=products.find(x=>x.slug===slug);if(p){detail.innerHTML=`<section class="product-detail-hero"><div class="product-visual"><img src="assets/images/${p.image}" alt="Hérisair ${p.name} fragrance bottle"></div><div class="product-buy"><p class="eyebrow">${p.number} · ${p.family}</p><h1>${p.name}</h1><p class="product-tagline">${p.tagline}</p><p>${p.description}</p><div class="price">AED ${p.price}</div><button class="btn" data-add="${p.slug}">Add to bag</button><p class="micro">Complimentary UAE delivery · Secure checkout</p></div></section><section class="notes"><div><p class="eyebrow">The composition</p><h2>${p.character}</h2><p>${p.description}</p><ol>${p.notes.map((n,i)=>`<li><span>0${i+1}</span>${n}</li>`).join('')}</ol></div><img src="assets/images/${p.detail}" loading="lazy" alt="The notes of ${p.name}"></section><section class="ritual-banner" style="background-image:url('assets/images/${p.interior}')"><div><p class="eyebrow">The private atmosphere</p><h2>Composed for<br>the journey within.</h2></div></section>`}}
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
 $$('[data-signup]').forEach(f=>f.onsubmit=e=>{e.preventDefault();$('.form-note',f).textContent='Thank you. Your request has been received.';f.reset()});
 const contact=$('[data-contact]');if(contact)contact.onsubmit=async e=>{e.preventDefault();const note=$('.form-note',contact),btn=$('button',contact);if(!contact.checkValidity()){contact.reportValidity();return}btn.disabled=true;btn.textContent='Sending…';try{const endpoint=contact.dataset.endpoint;if(!endpoint)throw Error();const res=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(new FormData(contact)))});if(!res.ok)throw Error();note.textContent='Thank you. A client advisor will be in touch shortly.';contact.reset()}catch{note.textContent='The form is ready, but its secure mail connection must be configured before launch.'}finally{btn.disabled=false;btn.textContent='Send enquiry'}};
 const checkout=$('.checkout');if(checkout)checkout.onclick=()=>{const toast=$('.toast');toast.textContent=bag.length?'Secure checkout must be connected before orders can be accepted.':'Your selection is empty.';toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),3500)};
 const quiz=$('[data-quiz]');if(quiz){let step=0,scores={unity:0,ascent:0,eminence:0};const questions=[{q:'What should your car feel like?',a:[['A familiar sanctuary','unity'],['A place of momentum','ascent'],['A private statement','eminence']]},{q:'Which trail draws you in?',a:[['Warm spice and soft sweetness','unity'],['Citrus, musk and amber','ascent'],['Oud, earth and aromatic woods','eminence']]},{q:'Choose the impression you leave.',a:[['Grounded and composed','unity'],['Bright and assured','ascent'],['Distinguished and commanding','eminence']]}];function show(){if(step<questions.length){const x=questions[step];quiz.innerHTML=`<p class="quiz-step">0${step+1} / 03</p><h2>${x.q}</h2><div class="quiz-answers">${x.a.map(a=>`<button data-choice="${a[1]}">${a[0]}<span>→</span></button>`).join('')}</div>`;$$('[data-choice]',quiz).forEach(b=>b.onclick=()=>{scores[b.dataset.choice]++;step++;show()})}else{const slug=Object.keys(scores).sort((a,b)=>scores[b]-scores[a])[0],p=products.find(x=>x.slug===slug);quiz.innerHTML=`<p class="eyebrow">Your fragrance</p><h2>${p.name}</h2><p class="quiz-result">${p.description}</p><img src="assets/images/${p.image}" alt="Hérisair ${p.name}"><div><a class="btn" href="${p.slug}.html">Experience ${p.name}</a><button class="text-link" data-restart>Begin again</button></div>`;$('[data-restart]').onclick=()=>{step=0;scores={unity:0,ascent:0,eminence:0};show()}}}show()}
 window.addEventListener('scroll',()=>root.style.setProperty('--scroll',window.scrollY));
})();
