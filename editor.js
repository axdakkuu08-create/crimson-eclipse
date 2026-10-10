(() => {
  const KEY = 'crimsonEclipseCustomChapters';
  const form = document.getElementById('chapterForm');
  const list = document.getElementById('chapterList');
  const status = document.getElementById('status');
  const importFile = document.getElementById('importFile');
  let chapters = read();

  function read() {
    try {
      const value = JSON.parse(localStorage.getItem(KEY) || '[]');
      return Array.isArray(value) ? value : [];
    } catch (e) { return []; }
  }
  function persist(message) {
    localStorage.setItem(KEY, JSON.stringify(chapters));
    render();
    status.textContent = message;
  }
  function parseSources(raw) {
    return raw.split('\n').map(line => line.trim()).filter(Boolean).map(line => {
      const parts = line.split('|');
      if (parts.length < 2) return {label: new URL(parts[0]).hostname, url: parts[0]};
      return {label: parts[0].trim(), url: parts.slice(1).join('|').trim()};
    }).filter(source => {
      try { return ['http:', 'https:'].includes(new URL(source.url).protocol); }
      catch (e) { return false; }
    });
  }
  function render() {
    list.replaceChildren();
    if (!chapters.length) {
      const empty = document.createElement('p');
      empty.className = 'hint';
      empty.textContent = 'No extra chapters yet. Add one using the form above.';
      list.appendChild(empty);
      return;
    }
    chapters.forEach((chapter, index) => {
      const item = document.createElement('div');
      item.className = 'chapter-item';
      const info = document.createElement('div');
      const heading = document.createElement('h3');
      heading.textContent = chapter.title || 'Untitled chapter';
      const description = document.createElement('p');
      description.textContent = `${chapter.kicker || 'EXTRA CHAPTER'} · ${(chapter.body || '').slice(0, 120)}${(chapter.body || '').length > 120 ? '…' : ''} · ${(chapter.sources || []).length} source link(s)`;
      info.append(heading, description);
      const actions = document.createElement('div');
      const remove = document.createElement('button');
      remove.type = 'button'; remove.className = 'small-btn'; remove.textContent = 'REMOVE';
      remove.addEventListener('click', () => {
        chapters.splice(index, 1);
        persist('Chapter removed.');
      });
      actions.appendChild(remove);
      item.append(info, actions);
      list.appendChild(item);
    });
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    const title = document.getElementById('title').value.trim();
    const body = document.getElementById('body').value.trim();
    if (!title || !body) { status.textContent = 'Please add a title and story text.'; return; }
    const image = document.getElementById('image').value.trim();
    if (image) {
      try { if (!['http:', 'https:'].includes(new URL(image).protocol)) throw new Error(); }
      catch (e) { status.textContent = 'Please enter a valid http or https image URL.'; return; }
    }
    const chapter = {
      kicker: document.getElementById('kicker').value.trim(),
      title, body, image,
      imageAlt: document.getElementById('imageAlt').value.trim(),
      sources: parseSources(document.getElementById('sources').value)
    };
    chapters.push(chapter);
    persist('Chapter added. Open the story page to view it.');
    form.reset();
  });
  document.getElementById('clearForm').addEventListener('click', () => {
    form.reset(); status.textContent = 'Form cleared.';
  });
  document.getElementById('exportButton').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(chapters, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'crimson-eclipse-content.json'; a.click();
    URL.revokeObjectURL(url);
    status.textContent = 'JSON exported. Keep a backup before replacing content.';
  });
  importFile.addEventListener('change', async () => {
    const file = importFile.files && importFile.files[0];
    if (!file) return;
    try {
      const imported = JSON.parse(await file.text());
      if (!Array.isArray(imported)) throw new Error('The JSON must contain an array of chapters.');
      const valid = imported.filter(item => item && typeof item.title === 'string' && typeof item.body === 'string')
        .map(item => ({
          kicker: String(item.kicker || '').slice(0,80),
          title: item.title.slice(0,140),
          body: item.body.slice(0,12000),
          image: typeof item.image === 'string' ? item.image : '',
          imageAlt: typeof item.imageAlt === 'string' ? item.imageAlt : '',
          sources: Array.isArray(item.sources) ? item.sources.filter(s => s && typeof s.url === 'string' && /^https?:\/\//i.test(s.url)).map(s => ({label:String(s.label || ''),url:s.url})) : []
        }));
      chapters = valid;
      persist(`Imported ${valid.length} chapter(s).`);
    } catch (error) {
      status.textContent = `Import failed: ${error.message}`;
    }
    importFile.value = '';
  });
  document.getElementById('deleteAll').addEventListener('click', () => {
    if (!confirm('Delete all added chapters saved in this browser? This cannot be undone unless you exported a backup.')) return;
    chapters = []; persist('All added chapters deleted.');
  });
  render();
})();
