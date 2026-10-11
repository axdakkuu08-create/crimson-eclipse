(() => {
  const KEY = 'crimsonEclipseCustomChapters';
  const form = document.getElementById('chapterForm');
  const list = document.getElementById('chapterList');
  const status = document.getElementById('status');
  const importFile = document.getElementById('importFile');
  const panelList = document.getElementById('panelEditorList');
  const panelDrafts = [];
  let chapters = read();
  let editingIndex = -1;

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
      if (parts.length < 2) {
        try { return {label: new URL(parts[0]).hostname, url: parts[0]}; }
        catch (e) { return {label: parts[0], url: parts[0]}; }
      }
      return {label: parts[0].trim(), url: parts.slice(1).join('|').trim()};
    }).filter(source => {
      try { return ['http:', 'https:'].includes(new URL(source.url).protocol); }
      catch (e) { return false; }
    });
  }
  function safeUrl(value) {
    if (!value) return true;
    if (/^(\.\.\/|\.\/|assets\/|images\/)/i.test(value)) return !value.includes('..');
    try { return ['http:', 'https:'].includes(new URL(value).protocol); }
    catch (e) { return false; }
  }
  function makePanelCard(panel = {}) {
    const card = document.createElement('div');
    card.className = 'panel-edit-card';
    card.innerHTML = '<div class="panel-edit-top"><strong class="panel-count">COMIC PANEL</strong><button type="button" class="small-btn panel-remove">REMOVE</button></div><label>Image URL</label><input class="panel-image" type="url" placeholder="https://... or assets/panel-1.jpg"><label>Image description</label><input class="panel-alt" maxlength="250" placeholder="Describe what appears in the panel"><label>Caption / scene heading</label><input class="panel-caption-input" maxlength="180" placeholder="THE GATE OPENS"><label>Narration</label><textarea class="panel-narration-input" maxlength="2500" placeholder="What the reader sees or hears..."></textarea><label>Character dialogue</label><textarea class="panel-dialogue-input" maxlength="2500" placeholder="Mara: I can hear the sea breathing."></textarea>';
    card.querySelector('.panel-image').value = panel.image || '';
    card.querySelector('.panel-alt').value = panel.imageAlt || '';
    card.querySelector('.panel-caption-input').value = panel.caption || '';
    card.querySelector('.panel-narration-input').value = panel.narration || '';
    card.querySelector('.panel-dialogue-input').value = panel.dialogue || '';
    card.querySelector('.panel-remove').addEventListener('click', () => {
      card.remove(); renumberPanels();
    });
    panelList.appendChild(card);
    renumberPanels();
  }
  function renumberPanels() {
    [...panelList.querySelectorAll('.panel-edit-card')].forEach((card, i) => {
      card.querySelector('.panel-count').textContent = 'PANEL ' + String(i + 1).padStart(2, '0');
    });
  }
  function getPanels() {
    return [...panelList.querySelectorAll('.panel-edit-card')].map(card => ({
      image: card.querySelector('.panel-image').value.trim(),
      imageAlt: card.querySelector('.panel-alt').value.trim(),
      caption: card.querySelector('.panel-caption-input').value.trim(),
      narration: card.querySelector('.panel-narration-input').value.trim(),
      dialogue: card.querySelector('.panel-dialogue-input').value.trim()
    })).filter(p => p.image || p.caption || p.narration || p.dialogue);
  }
  function loadPanels(panels) {
    panelList.replaceChildren();
    (Array.isArray(panels) ? panels : []).forEach(makePanelCard);
  }
  function clearEditor() {
    form.reset(); loadPanels([]); editingIndex = -1;
    document.getElementById('saveButton').textContent = 'ADD CHAPTER';
  }
  function render() {
    list.replaceChildren();
    if (!chapters.length) {
      const empty = document.createElement('p');
      empty.className = 'hint';
      empty.textContent = 'No extra chapters yet. Add one using the form above.';
      list.appendChild(empty); return;
    }
    chapters.forEach((chapter, index) => {
      const item = document.createElement('div'); item.className = 'chapter-item';
      const info = document.createElement('div');
      const heading = document.createElement('h3'); heading.textContent = chapter.title || 'Untitled chapter';
      const description = document.createElement('p');
      const panels = Array.isArray(chapter.panels) ? chapter.panels.length : 0;
      description.textContent = (chapter.kicker || 'EXTRA CHAPTER') + ' · ' + (chapter.body || '').slice(0, 100) + ((chapter.body || '').length > 100 ? '…' : '') + ' · ' + panels + ' panel(s) · ' + ((chapter.sources || []).length) + ' source link(s)';
      info.append(heading, description);
      const actions = document.createElement('div'); actions.className = 'chapter-item-actions';
      const edit = document.createElement('button'); edit.type = 'button'; edit.className = 'small-btn'; edit.textContent = 'EDIT';
      edit.addEventListener('click', () => {
        const c = chapters[index]; editingIndex = index;
        document.getElementById('kicker').value = c.kicker || '';
        document.getElementById('title').value = c.title || '';
        document.getElementById('body').value = c.body || '';
        document.getElementById('image').value = c.image || '';
        document.getElementById('imageAlt').value = c.imageAlt || '';
        document.getElementById('sources').value = (c.sources || []).map(s => (s.label || '') + ' | ' + s.url).join('\n');
        document.getElementById('ending').value = c.ending || '';
        loadPanels(c.panels || []);
        document.getElementById('saveButton').textContent = 'SAVE CHANGES';
        form.scrollIntoView({behavior:'smooth', block:'start'});
        status.textContent = 'Editing "' + (c.title || 'Untitled chapter') + '".';
      });
      const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'small-btn'; remove.textContent = 'REMOVE';
      remove.addEventListener('click', () => {
        chapters.splice(index, 1); persist('Chapter removed.');
        if (editingIndex === index) clearEditor();
      });
      actions.append(edit, remove); item.append(info, actions); list.appendChild(item);
    });
  }
  document.getElementById('addPanel').addEventListener('click', () => makePanelCard());
  form.addEventListener('submit', event => {
    event.preventDefault();
    const title = document.getElementById('title').value.trim();
    const body = document.getElementById('body').value.trim();
    if (!title || !body) { status.textContent = 'Please add a title and story text.'; return; }
    const image = document.getElementById('image').value.trim();
    if (!safeUrl(image)) { status.textContent = 'Cover image must use a valid http or https URL or a relative repository path.'; return; }
    const panels = getPanels();
    if (panels.some(p => p.image && !safeUrl(p.image))) { status.textContent = 'Panel image URLs must be valid http or https URLs or relative paths.'; return; }
    const chapter = {
      kicker: document.getElementById('kicker').value.trim(), title, body, image,
      imageAlt: document.getElementById('imageAlt').value.trim(),
      ending: document.getElementById('ending').value.trim(),
      panels, sources: parseSources(document.getElementById('sources').value)
    };
    if (editingIndex >= 0 && editingIndex < chapters.length) {
      chapters[editingIndex] = chapter; persist('Chapter updated in this browser. Export or publish the data to share it.'); 
    } else {
      chapters.push(chapter); persist('Chapter added in this browser. Export or publish the data to share it.');
    }
    clearEditor();
  });
  document.getElementById('clearForm').addEventListener('click', () => {
    clearEditor(); status.textContent = 'Form cleared.';
  });
  document.getElementById('exportButton').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(chapters, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href = url; a.download = 'crimson-eclipse-content.json'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    status.textContent = 'JSON exported. Keep a backup before replacing content.';
  });
  importFile.addEventListener('change', async () => {
    const file = importFile.files && importFile.files[0]; if (!file) return;
    try {
      const imported = JSON.parse(await file.text());
      if (!Array.isArray(imported)) throw new Error('The JSON must contain an array of chapters.');
      const valid = imported.filter(c => c && typeof c.title === 'string' && typeof c.body === 'string').map(c => ({
        kicker: String(c.kicker || '').slice(0,80), title: c.title.slice(0,140), body: c.body.slice(0,12000),
        image: typeof c.image === 'string' ? c.image : '', imageAlt: typeof c.imageAlt === 'string' ? c.imageAlt : '',
        ending: typeof c.ending === 'string' ? c.ending.slice(0,2500) : '',
        panels: Array.isArray(c.panels) ? c.panels.filter(p => p && typeof p === 'object').slice(0,50).map(p => ({
          image: typeof p.image === 'string' ? p.image : '', imageAlt: String(p.imageAlt || '').slice(0,250),
          caption: String(p.caption || '').slice(0,180), narration: String(p.narration || '').slice(0,2500),
          dialogue: String(p.dialogue || '').slice(0,2500)
        })) : [],
        sources: Array.isArray(c.sources) ? c.sources.filter(s => s && typeof s.url === 'string' && /^https?:\/\//i.test(s.url)).map(s => ({label:String(s.label || ''),url:s.url})) : []
      }));
      chapters = valid; editingIndex = -1; persist('Imported ' + valid.length + ' chapter(s).'); clearEditor();
    } catch (error) { status.textContent = 'Import failed: ' + error.message; }
    importFile.value = '';
  });
  document.getElementById('deleteAll').addEventListener('click', () => {
    if (!confirm('Delete all added chapters saved in this browser? This cannot be undone unless you exported a backup.')) return;
    chapters = []; editingIndex = -1; persist('All added chapters deleted.'); clearEditor();
  });
  render();
})();