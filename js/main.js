/* HECKCURE — shared site behaviour */
(function(){
  "use strict";

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- Mobile nav toggle ---------------- */
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links){
    toggle.addEventListener('click', function(){
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      links.classList.toggle('is-open', !open);
    });
    links.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){
        toggle.setAttribute('aria-expanded', 'false');
        links.classList.remove('is-open');
      });
    });
  }

  /* ---------------- Active nav link ---------------- */
  var here = (location.pathname.split('/').pop() || 'index.html');
  document.querySelectorAll('.nav-links a').forEach(function(a){
    var target = a.getAttribute('href');
    if (target === here || (here === '' && target === 'index.html')){
      a.classList.add('active');
    }
  });

  /* ---------------- Footer year ---------------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------- Scroll reveal ---------------- */
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length){
    if (reduceMotion || !('IntersectionObserver' in window)){
      revealEls.forEach(function(el){ el.classList.add('is-visible'); });
    } else {
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if (entry.isIntersecting){
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -10% 0px' });
      revealEls.forEach(function(el){ io.observe(el); });

      // Safety net: never leave content permanently invisible if the observer
      // misbehaves in some environment (e.g. unusual viewport/print contexts).
      window.setTimeout(function(){
        revealEls.forEach(function(el){ el.classList.add('is-visible'); });
        io.disconnect();
      }, 2500);
    }
  }

  /* ---------------- Hero terminal typewriter ---------------- */
  var termBody = document.querySelector('[data-terminal]');
  if (termBody){
    var script = [
      { html: '<span class="tag">$</span> heckcure --initiate engagement' },
      { html: '<span class="tag">[scope]</span> mapping external attack surface&hellip;' },
      { html: '<span class="warn">[recon]</span> 14 exposed services identified' },
      { html: '<span class="tag2">[exploit]</span> session established on web-tier' },
      { html: '<span class="ok">[verified]</span> finding reproduced, impact confirmed' },
      { html: '<span class="tag">[report]</span> remediation steps delivered to client' },
      { html: '<span class="ok">[status]</span> blue team notified &mdash; patch verified' }
    ];

    if (reduceMotion){
      termBody.innerHTML = script.map(function(l){ return '<span class="terminal-line">' + l.html + '</span>'; }).join('');
    } else {
      typeScript(termBody, script);
    }
  }

  function typeScript(container, script){
    var lineIndex = 0;
    var done = [];

    function renderDone(){
      container.innerHTML = done.map(function(h){ return '<span class="terminal-line">' + h + '</span>'; }).join('');
    }

    function typeLine(){
      if (lineIndex >= script.length){
        window.setTimeout(function(){
          done = [];
          lineIndex = 0;
          renderDone();
          window.setTimeout(typeLine, 500);
        }, 1800);
        return;
      }
      var raw = script[lineIndex].html;
      // Strip tags to know the plain-text length we are "typing", but render progressively with tags intact at the end.
      var tmp = document.createElement('div');
      tmp.innerHTML = raw;
      var plain = tmp.textContent;
      var i = 0;
      var speed = 18;

      renderDone();
      var liveLine = document.createElement('span');
      liveLine.className = 'terminal-line';
      var cursor = document.createElement('span');
      cursor.className = 'cursor';
      container.appendChild(liveLine);

      function step(){
        i++;
        // progressively reveal by re-rendering substring through a temp container that keeps formatting for finished part
        if (i >= plain.length){
          liveLine.innerHTML = raw;
          done.push(raw);
          lineIndex++;
          window.setTimeout(typeLine, 260);
          return;
        }
        liveLine.textContent = plain.slice(0, i);
        liveLine.appendChild(cursor);
        window.setTimeout(step, speed);
      }
      step();
    }
    typeLine();
  }

  /* ---------------- Contact form — EmailJS -------------------------------- */
  var EMAILJS_PUBLIC_KEY  = '8zipWNQY1CijCXy7K';    // ← paste your Public Key
  var EMAILJS_SERVICE_ID  = 'service_7htxzuc';    // ← paste your Service ID
  var EMAILJS_TEMPLATE_ID = 'template_rl13qal';   // ← paste your Template ID

  if (typeof emailjs !== 'undefined') {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  }

  var form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();

      var data     = new FormData(form);
      var name     = (data.get('name')    || '').toString().trim();
      var email    = (data.get('email')   || '').toString().trim();
      var company  = (data.get('company') || '-').toString().trim();
      var service  = (data.get('service') || '-').toString().trim();
      var message  = (data.get('message') || '').toString().trim();

      var submitBtn = form.querySelector('button[type="submit"]');
      var success   = document.getElementById('form-success');
      var errorEl   = document.getElementById('form-error');

      // Disable button while sending
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending…';
      }
      if (success)  success.classList.remove('show');
      if (errorEl)  errorEl.classList.remove('show');

      var templateParams = {
        from_name : name,
        reply_to  : email,
        company   : company || '-',
        service   : service || '-',
        message   : message
      };

      emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
        .then(function() {
          if (success) success.classList.add('show');
          form.reset();
        })
        .catch(function(err) {
          console.error('EmailJS error:', err);
          if (errorEl) errorEl.classList.add('show');
        })
        .finally(function() {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Message →';
          }
        });
    });
  }
})();
