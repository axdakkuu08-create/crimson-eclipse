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
  chapterTwo.hidden = false;
  continueBtn.textContent = 'CHAPTER TWO UNLOCKED';
  continueBtn.disabled = true;
  continueBtn.style.opacity = '.7';
  chapterTwo.scrollIntoView({behavior: 'smooth', block: 'center'});
});

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
      section.appendChild(img);
    }

    const body = document.createElement('p');
    body.textContent = chapter.body || '';
    section.appendChild(body);

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
