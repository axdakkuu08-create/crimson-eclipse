const progressBar = document.getElementById('progressBar');
const soundToggle = document.getElementById('soundToggle');
const contrastToggle = document.getElementById('contrastToggle');
const continueBtn = document.getElementById('continueBtn');
const chapterTwo = document.getElementById('chapterTwo');

function updateProgress(){
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
}
window.addEventListener('scroll', updateProgress, {passive:true});
window.addEventListener('resize', updateProgress);
updateProgress();

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, {threshold: 0.12});
document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

contrastToggle.addEventListener('click', () => {
  const active = document.body.classList.toggle('high-contrast');
  contrastToggle.setAttribute('aria-pressed', String(active));
});

let audioContext = null;
let oscillator = null;
let gain = null;
soundToggle.addEventListener('click', () => {
  const isOn = soundToggle.getAttribute('aria-pressed') === 'true';
  if (!isOn) {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) throw new Error('Audio unavailable');
      audioContext = new AudioContextClass();
      oscillator = audioContext.createOscillator();
      gain = audioContext.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = 55;
      gain.gain.value = 0.018;
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start();
      soundToggle.setAttribute('aria-pressed', 'true');
      soundToggle.innerHTML = '♫ <span>Sound on</span>';
    } catch (error) {
      soundToggle.innerHTML = '♫ <span>Sound unavailable</span>';
    }
  } else {
    if (oscillator) { try { oscillator.stop(); } catch (e) {} }
    if (audioContext) { audioContext.close(); }
    oscillator = null; audioContext = null; gain = null;
    soundToggle.setAttribute('aria-pressed', 'false');
    soundToggle.innerHTML = '♫ <span>Sound off</span>';
  }
});

continueBtn.addEventListener('click', () => {
  const chapterContent = document.getElementById('chapterTwoContent');
  if (chapterContent) {
    chapterContent.hidden = false;
    chapterContent.classList.add('revealed');
    chapterContent.scrollIntoView({behavior: 'smooth', block: 'start'});
  }
  chapterTwo.hidden = false;
  chapterTwo.textContent = 'CHAPTER TWO UNLOCKED — THE GATE IS OPEN.';
  continueBtn.textContent = 'CHAPTER TWO UNLOCKED';
  continueBtn.disabled = true;
  continueBtn.style.opacity = '.7';
});

(function setupComicSlideshow(){
  const root = document.querySelector('.comic-slideshow');
  if (!root) return;
  const slides = Array.from(root.querySelectorAll('.slide'));
  const dots = Array.from(root.querySelectorAll('.slide-dot'));
  const prev = root.querySelector('#slidePrev');
  const next = root.querySelector('#slideNext');
  let active = 0;
  function showSlide(index) {
    active = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.hidden = i !== active;
      slide.classList.toggle('is-active', i === active);
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === active);
      dot.setAttribute('aria-pressed', String(i === active));
    });
  }
  prev.addEventListener('click', () => showSlide(active - 1));
  next.addEventListener('click', () => showSlide(active + 1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => showSlide(i)));
  showSlide(0);
})();


document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', event => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      event.preventDefault();
      target.scrollIntoView({behavior: 'smooth'});
    }
  });
});


// Render chapters added through editor.html on this same website origin.
(function renderCustomChapters(){
  const target = document.getElementById('customChapters');
  if (!target) return;
  let chapters = [];
  try { chapters = JSON.parse(localStorage.getItem('crimsonEclipseCustomChapters') || '[]'); }
  catch (e) { chapters = []; }
  if (!Array.isArray(chapters)) return;

  chapters.forEach((chapter, index) => {
    const section = document.createElement('section');
    section.className = 'custom-chapter';
    section.dataset.reveal = '';
    const label = document.createElement('div');
    label.className = 'custom-label';
    label.textContent = chapter.kicker || `EXTRA CHAPTER ${String(index + 1).padStart(2, '0')}`;
    section.appendChild(label);

    const heading = document.createElement('h2');
    heading.textContent = chapter.title || 'Untitled chapter';
    section.appendChild(heading);

    if (chapter.image) {
      const img = document.createElement('img');
      img.src = chapter.image;
      img.alt = chapter.imageAlt || chapter.title || 'Story illustration';
      img.loading = 'lazy';
      img.referrerPolicy = 'no-referrer';
      img.onerror = () => img.remove();
      img.className = 'chapter-cover';
      section.appendChild(img);
    }

    const body = document.createElement('p');
    body.textContent = chapter.body || '';
    section.appendChild(body);

    if (Array.isArray(chapter.panels)) {
      chapter.panels.forEach((panel, panelIndex) => {
        const panelWrap = document.createElement('article');
        panelWrap.className = 'published-comic-panel';
        if (panel.caption) {
          const caption = document.createElement('h3');
          caption.className = 'published-panel-caption';
          caption.textContent = panel.caption;
          panelWrap.appendChild(caption);
        }
        if (panel.image) {
          const img = document.createElement('img');
          img.src = panel.image;
          img.alt = panel.imageAlt || panel.caption || ('Comic panel ' + (panelIndex + 1));
          img.loading = 'lazy';
          img.onerror = () => img.remove();
          panelWrap.appendChild(img);
        }
        if (panel.narration) {
          const narration = document.createElement('p');
          narration.className = 'published-panel-narration';
          narration.textContent = panel.narration;
          panelWrap.appendChild(narration);
        }
        if (panel.dialogue) {
          const dialogue = document.createElement('blockquote');
          dialogue.className = 'published-panel-dialogue';
          dialogue.textContent = panel.dialogue;
          panelWrap.appendChild(dialogue);
        }
        section.appendChild(panelWrap);
      });
    }
    if (chapter.ending) {
      const ending = document.createElement('p');
      ending.className = 'published-chapter-ending';
      ending.textContent = chapter.ending;
      section.appendChild(ending);
    }

    if (Array.isArray(chapter.sources) && chapter.sources.length) {
      const sourceList = document.createElement('div');
      sourceList.className = 'source-list';
      chapter.sources.forEach(source => {
        if (!source || !source.url) return;
        try {
          const parsed = new URL(source.url);
          if (!['http:', 'https:'].includes(parsed.protocol)) return;
          const a = document.createElement('a');
          a.href = parsed.href;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          a.textContent = source.label || parsed.hostname;
          sourceList.appendChild(a);
        } catch (e) {}
      });
      if (sourceList.childElementCount) section.appendChild(sourceList);
    }
    target.appendChild(section);
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {threshold: 0.12});
    target.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
  } else {
    target.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('revealed'));
  }
})();


// Chapter Two cinematic motion + interactive relic panel (vanilla JS, no dependencies).
(function enhanceChapterTwo(){
  const chapter = document.getElementById('chapterTwoContent');
  if (!chapter) return;
  const style = document.createElement('style');
  style.textContent = `
    #chapterTwoContent .comic-slideshow{perspective:1000px}
    #chapterTwoContent .slide svg{transform-origin:center;animation:ceSceneDrift 9s ease-in-out infinite alternate;transition:filter .35s,transform .5s}
    #chapterTwoContent .slide:nth-child(2) svg{animation-delay:-3s}
    #chapterTwoContent .slide:nth-child(3) svg{animation-delay:-6s}
    #chapterTwoContent .slide.is-active svg{filter:contrast(1.04) saturate(1.08)}
    #chapterTwoContent .slide.is-active figcaption{animation:ceCaptionIn .5s both}
    #chapterTwoContent .relic-console{margin:24px 0 34px;padding:clamp(18px,4vw,30px);background:#171619;color:#f7f4ed;border:1px solid #4a4142;box-shadow:8px 8px 0 rgba(217,13,43,.2)}
    #chapterTwoContent .relic-console h3{margin:0 0 8px;color:#ff5268;font:11px monospace;letter-spacing:.14em}
    #chapterTwoContent .relic-console p{color:#d8d0c8;margin:0;max-width:700px}
    #chapterTwoContent .relic-action{display:inline-flex;align-items:center;gap:12px;margin-top:18px;padding:13px 16px;background:#d90d2b;color:white;border:1px solid #ff6478;font:11px monospace;letter-spacing:.06em;cursor:pointer;transition:transform .2s,background .2s}
    #chapterTwoContent .relic-action:hover{transform:translateY(-2px);background:#f01a3b}
    #chapterTwoContent .relic-orb{display:inline-block;width:11px;height:11px;border-radius:50%;background:#ff334b;box-shadow:0 0 0 5px #d90d2b33,0 0 20px #ff334b;animation:ceOrbPulse 1.8s ease-in-out infinite}
    #chapterTwoContent .relic-console.is-awake{border-color:#d90d2b;background:linear-gradient(120deg,#171619,#29151b)}
    #chapterTwoContent .relic-console.is-awake .relic-orb{background:#fff0ed;box-shadow:0 0 0 7px #d90d2b55,0 0 34px #ff334b}
    #chapterTwoContent .relic-response{margin-top:14px!important;color:#ffb5be!important;min-height:1.5em}
    @keyframes ceOrbPulse{50%{transform:scale(1.22);box-shadow:0 0 0 9px #d90d2b22,0 0 32px #ff334b}}
    @keyframes ceSceneDrift{from{transform:scale(1) translateY(0)}to{transform:scale(1.025) translateY(-3px)}}
    @keyframes ceCaptionIn{from{opacity:.25;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
    @media(prefers-reduced-motion:reduce){#chapterTwoContent .slide svg,#chapterTwoContent .relic-orb{animation:none!important}}
  `;
  document.head.appendChild(style);
  const slideshow = chapter.querySelector('.comic-slideshow');
  if (!slideshow) return;
  const consolePanel = document.createElement('section');
  consolePanel.className = 'relic-console';
  consolePanel.setAttribute('aria-label','Interactive moon relic');
  consolePanel.innerHTML = '<h3>INTERACTIVE ARTIFACT / 001</h3><p><span class="relic-orb" aria-hidden="true"></span> The compass is reacting to the gate. The inscription seems to be waiting for a memory.</p><button class="relic-action" type="button" aria-pressed="false"><span>TOUCH THE RED SEAL</span><span aria-hidden="true">↗</span></button><p class="relic-response" aria-live="polite">The relic is dormant. Choose to awaken it.</p>';
  slideshow.insertAdjacentElement('afterend', consolePanel);
  const action = consolePanel.querySelector('button');
  const response = consolePanel.querySelector('.relic-response');
  let awake = false;
  action.addEventListener('click', () => {
    awake = !awake;
    consolePanel.classList.toggle('is-awake', awake);
    action.setAttribute('aria-pressed', String(awake));
    action.querySelector('span').textContent = awake ? 'SEAL AWAKENED — TOUCH TO RESET' : 'TOUCH THE RED SEAL';
    response.textContent = awake
      ? 'A voice rises from the stone: “Mara Vale. The moon remembers you. What memory will you give it?”'
      : 'The red light fades. The gate falls silent, but the compass keeps pointing forward.';
    const activeSlide = chapter.querySelector('.slide.is-active');
    if (activeSlide) activeSlide.classList.toggle('relic-awake', awake);
  });
})();
