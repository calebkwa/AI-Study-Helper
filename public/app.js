/**
 * AI Study Helper — Screens 01–05: landing, input, summary results, quiz, history
 */

const LOCAL_QUIZ = [
  {
    id: 'q-1',
    question: 'Where do the light-dependent reactions of photosynthesis occur?',
    options: [
      'In the stroma of the chloroplast',
      'In the thylakoid membrane',
      'In the cytoplasm of the cell',
      'In the mitochondria',
    ],
    correctIndex: 1,
    explanation:
      'The thylakoid membranes contain chlorophyll and other pigments that absorb light, driving the light-dependent reactions.',
  },
  {
    id: 'q-2',
    question: 'Which gas is taken in by plants during photosynthesis?',
    options: ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Hydrogen'],
    correctIndex: 2,
    explanation: 'Plants use CO₂ with water to build sugars in the Calvin cycle.',
  },
  {
    id: 'q-3',
    question: 'What is the primary output of the light-dependent reactions?',
    options: ['Only glucose', 'ATP, NADPH, and O₂', 'Only CO₂', 'DNA'],
    correctIndex: 1,
    explanation: 'Light reactions produce ATP and NADPH and release O₂ from water splitting.',
  },
  {
    id: 'q-4',
    question: 'Where does the Calvin cycle occur?',
    options: ['Thylakoid', 'Stroma', 'Nucleus', 'Mitochondria'],
    correctIndex: 1,
    explanation: 'Carbon fixation happens in the stroma of the chloroplast.',
  },
  {
    id: 'q-5',
    question: 'What pigment absorbs light for photosynthesis?',
    options: ['Hemoglobin', 'Chlorophyll', 'Melanin', 'Keratin'],
    correctIndex: 1,
    explanation: 'Chlorophyll captures photon energy to drive electron transport.',
  },
];

const letters = ['A', 'B', 'C', 'D'];

let quizApiMode = false;
let quizId = null;
let quizItems = [];
/** @type {Array<null | { selectedIndex: number, correct?: boolean }>} */
let quizAnswers = [];
let currentQuizIndex = 0;

let lastSummaryNotes = '';
let lastSummaryResult = '';

const el = (id) => document.getElementById(id);

function showView(name) {
  el('view-landing').classList.toggle('hidden', name !== 'landing');
  el('view-workspace').classList.toggle('hidden', name !== 'workspace');
  el('view-history').classList.toggle('hidden', name !== 'history');
}

function showWorkspaceScreen(screen) {
  el('screen-input').classList.toggle('hidden', screen !== 'input');
  el('screen-summary-results').classList.toggle('hidden', screen !== 'summary-results');
  el('screen-quiz').classList.toggle('hidden', screen !== 'quiz');
  el('btn-new-session').classList.toggle('hidden', screen !== 'summary-results');
}

function openAbout() {
  el('modal-about').classList.remove('hidden');
}

function closeAbout() {
  el('modal-about').classList.add('hidden');
}

function enterWorkspace() {
  showView('workspace');
  showWorkspaceScreen('input');
  document.querySelectorAll('.tab[data-tab]').forEach((t) => {
    const active = t.dataset.tab === 'summary';
    t.classList.toggle('tab--active', active);
    t.setAttribute('aria-selected', active ? 'true' : 'false');
  });
  el('wrap-max-q').classList.add('hidden');
}

function enterLanding() {
  showView('landing');
}

function splitSummaryBlocks(text) {
  const t = text.trim();
  const paras = t.split(/\n\n+/).filter(Boolean);
  if (paras.length >= 3) {
    return { key: paras[0], process: paras[1], outputs: paras.slice(2).join('\n\n') };
  }
  const lines = t.split('\n').filter(Boolean);
  const n = lines.length;
  const a = Math.max(1, Math.floor(n / 3));
  const b = Math.max(a + 1, Math.floor((2 * n) / 3));
  return {
    key: lines.slice(0, a).join(' '),
    process: lines.slice(a, b).join('\n'),
    outputs: lines.slice(b).join('\n') || '—',
  };
}

function setInputTab(name) {
  document.querySelectorAll('.tab[data-tab]').forEach((t) => {
    const active = t.dataset.tab === name;
    t.classList.toggle('tab--active', active);
    t.setAttribute('aria-selected', active ? 'true' : 'false');
  });
  el('wrap-max-q').classList.toggle('hidden', name !== 'quiz');
}

function getCorrectCount() {
  let n = 0;
  quizAnswers.forEach((a, i) => {
    if (!a) return;
    if (quizApiMode) {
      if (a.correct === true) n += 1;
    } else if (quizItems[i] && a.selectedIndex === quizItems[i].correctIndex) {
      n += 1;
    }
  });
  return n;
}

function updateQuizHeader() {
  const total = quizItems.length || 1;
  const correct = getCorrectCount();
  const idx = currentQuizIndex;
  const progressPct = Math.min(100, Math.round(((idx + 1) / total) * 100));

  el('quiz-score-num').textContent = String(correct);
  el('quiz-score-total').textContent = String(total);
  el('quiz-current').textContent = String(idx + 1);
  el('quiz-of').textContent = String(total);
  el('quiz-progress-fill').style.width = `${progressPct}%`;
  el('quiz-progress-pct').textContent = `${progressPct}%`;
}

function renderQuizQuestion() {
  const q = quizItems[currentQuizIndex];
  if (!q) return;

  const prev = quizAnswers[currentQuizIndex];

  el('quiz-question-text').textContent = `Q${currentQuizIndex + 1}. ${q.question}`;

  const opts = el('quiz-options');
  opts.innerHTML = '';

  q.options.forEach((text, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'quiz-option';
    const letter = document.createElement('span');
    letter.className = 'quiz-option__letter';
    letter.textContent = letters[i];
    const span = document.createElement('span');
    span.className = 'quiz-option__text';
    span.textContent = text;
    btn.appendChild(letter);
    btn.appendChild(span);

    if (prev) {
      btn.disabled = true;
      const correctIdx = quizApiMode ? prev.correctIndex : q.correctIndex;
      const picked = prev.selectedIndex === i;
      const isCorrectOption = i === correctIdx;
      if (isCorrectOption) {
        btn.classList.add('quiz-option--correct');
        letter.classList.add('quiz-option__letter--accent');
        const badge = document.createElement('span');
        badge.className = 'quiz-option__badge';
        badge.textContent = '✓ Correct';
        btn.appendChild(badge);
      } else if (picked) {
        btn.classList.add('quiz-option--wrong');
      }
    } else {
      btn.addEventListener('click', () => onQuizOption(i));
    }
    opts.appendChild(btn);
  });

  const explain = el('quiz-explanation-wrap');
  const explainText = el('quiz-explanation-text');
  if (prev) {
    explain.classList.remove('hidden');
    explainText.textContent =
      prev.explanation ||
      q.explanation ||
      'Review the material and try the next question.';
  } else {
    explain.classList.add('hidden');
    explainText.textContent = '';
  }
  updateQuizHeader();
}

async function onQuizOption(index) {
  const q = quizItems[currentQuizIndex];

  if (quizApiMode && quizId) {
    try {
      const res = await fetch('/api/quiz/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId,
          questionId: q.id,
          selectedIndex: index,
        }),
      });
      const data = await res.json();
      quizAnswers[currentQuizIndex] = {
        selectedIndex: index,
        correct: data.correct,
        explanation: data.explanation,
        correctIndex: data.correctIndex,
      };
    } catch {
      quizAnswers[currentQuizIndex] = { selectedIndex: index, correct: false };
    }
  } else {
    const correct = index === q.correctIndex;
    quizAnswers[currentQuizIndex] = {
      selectedIndex: index,
      correct,
      explanation: q.explanation,
      correctIndex: q.correctIndex,
    };
  }
  renderQuizQuestion();
}

function goQuiz(delta) {
  const next = currentQuizIndex + delta;
  if (next < 0 || next >= quizItems.length) return;
  currentQuizIndex = next;
  renderQuizQuestion();
}

function startLocalQuiz() {
  quizApiMode = false;
  quizId = null;
  quizItems = LOCAL_QUIZ.map((x) => ({ ...x }));
  quizAnswers = quizItems.map(() => null);
  currentQuizIndex = 0;
  showWorkspaceScreen('quiz');
  renderQuizQuestion();
}

async function startQuizFromApi(topic, material, count) {
  try {
    const res = await fetch('/api/quiz/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic,
        material,
        questionCount: count,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Quiz failed');

    quizApiMode = true;
    quizId = data.quizId;
    quizItems = data.questions;
    quizAnswers = quizItems.map(() => null);
    currentQuizIndex = 0;
    showWorkspaceScreen('quiz');
    renderQuizQuestion();
  } catch {
    startLocalQuiz();
  }
}

async function postGenerate(notes, mode, language) {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notes, mode, language }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data.result;
}

function showSummaryResults(notes, result) {
  lastSummaryNotes = notes;
  lastSummaryResult = result;
  el('summary-notes-display').textContent = notes;
  const parts = splitSummaryBlocks(result);
  el('block-key').textContent = parts.key;
  el('block-process').textContent = parts.process;
  el('block-outputs').textContent = parts.outputs;
  showWorkspaceScreen('summary-results');
}

async function apiFetchHistory() {
  const res = await fetch('/api/history');
  const data = await res.json();
  return data.sessions || [];
}

function tagForMode(mode) {
  const m = (mode || 'summary').toLowerCase();
  if (m === 'quiz') return { tag: 'Quiz', tagClass: 'tag--quiz' };
  if (m === 'flashcards') return { tag: 'Flashcards', tagClass: 'tag--flashcards' };
  return { tag: 'Summary', tagClass: 'tag--summary' };
}

function titleFromSession(s) {
  if (s.title) return s.title;
  const line = (s.notes || '').split('\n')[0];
  return line && line.length < 80 ? line : 'Untitled session';
}

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
}

let filterTag = 'all';

function sessionMatchesFilter(s) {
  const { tag: t } = tagForMode(s.mode);
  if (filterTag === 'all') return true;
  return t === filterTag;
}

async function renderSessions() {
  const query = (el('session-search').value || '').trim().toLowerCase();
  const list = el('session-list');
  list.innerHTML = '';

  let sessions = [];
  try {
    sessions = await apiFetchHistory();
  } catch {
    return;
  }

  sessions
    .filter((s) => sessionMatchesFilter(s, filterTag))
    .filter((s) => !query || titleFromSession(s).toLowerCase().includes(query))
    .forEach((s) => {
      const { tag, tagClass } = tagForMode(s.mode);
      const li = document.createElement('li');
      li.className = 'session-card';

      const tagEl = document.createElement('span');
      tagEl.className = `session-card__tag ${tagClass}`;
      tagEl.textContent = tag;

      const mid = document.createElement('div');
      mid.className = 'session-card__mid';
      const title = document.createElement('p');
      title.className = 'session-card__title';
      title.textContent = titleFromSession(s);
      const meta = document.createElement('p');
      meta.className = 'session-card__meta';
      meta.textContent = `Mode: ${s.mode || 'summary'} · Date: ${formatDate(s.date)}`;
      mid.appendChild(title);
      mid.appendChild(meta);

      let scoreEl = null;
      if (s.score) {
        scoreEl = document.createElement('span');
        scoreEl.className = 'session-card__score';
        scoreEl.textContent = `Score: ${s.score}`;
      }

      const reload = document.createElement('button');
      reload.type = 'button';
      reload.className = 'session-card__reload';
      reload.innerHTML = 'Reload →';
      reload.addEventListener('click', () => {
        showView('workspace');
        el('notes-main').value = s.notes || '';
        if ((s.mode || 'summary') === 'quiz') {
          setInputTab('quiz');
        } else if (s.mode === 'flashcards') {
          setInputTab('flashcards');
        } else {
          setInputTab('summary');
        }
        showSummaryResults(s.notes || '', s.result || '');
      });

      li.appendChild(tagEl);
      li.appendChild(mid);
      if (scoreEl) li.appendChild(scoreEl);
      li.appendChild(reload);
      list.appendChild(li);
    });
}

function exportPdf() {
  const w = window.jspdf;
  if (!w || !w.jsPDF) {
    alert('PDF library not loaded.');
    return;
  }
  const { jsPDF } = w;
  const doc = new jsPDF();
  const lineH = 7;
  let y = 20;
  doc.setFontSize(16);
  doc.text('AI Study Helper — Summary', 20, y);
  y += lineH * 2;
  doc.setFontSize(10);
  const lines = doc.splitTextToSize(lastSummaryResult || '', 170);
  lines.forEach((line) => {
    if (y > 280) {
      doc.addPage();
      y = 20;
    }
    doc.text(line, 20, y);
    y += lineH;
  });
  doc.save('study-summary.pdf');
}

async function saveSessionManual() {
  try {
    await fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notes: lastSummaryNotes,
        result: lastSummaryResult,
        mode: 'summary',
        title: lastSummaryNotes.split('\n')[0]?.slice(0, 60) || 'Saved summary',
      }),
    });
    alert('Session saved.');
  } catch {
    alert('Could not save session.');
  }
}

async function onGenerateMain() {
  const notes = el('notes-main').value.trim();
  const language = el('language-main').value;
  const tab = document.querySelector('.tab[data-tab].tab--active')?.dataset.tab || 'summary';

  el('loading-main').classList.remove('hidden');
  el('panel-flash-inline').classList.add('hidden');

  try {
    if (tab === 'summary') {
      if (!notes) {
        alert('Paste some notes first.');
        return;
      }
      const result = await postGenerate(notes, 'summary', language);
      showSummaryResults(notes, result);
    } else if (tab === 'quiz') {
      const topic = notes.split('\n')[0]?.slice(0, 200) || 'General study topic';
      const count = parseInt(el('max-questions').value, 10) || 10;
      await startQuizFromApi(topic, notes, count);
    } else {
      if (!notes) {
        alert('Paste some notes first.');
        return;
      }
      const text = await postGenerate(notes, 'flashcards', language);
      el('output-fc').textContent = text;
      const lines = text.split('\n').filter(Boolean);
      el('fc-q').textContent = lines[0] || 'Flashcards';
      el('fc-a').textContent = lines[1] || '';
      el('fc-a').classList.add('hidden');
      el('fc-flip').textContent = 'Show answer';
      el('panel-flash-inline').classList.remove('hidden');
    }
  } catch {
    alert('Something went wrong. Try again.');
  } finally {
    el('loading-main').classList.add('hidden');
  }
}

function init() {
  document.body.classList.add('js-ready');

  el('btn-start-studying').addEventListener('click', enterWorkspace);
  el('btn-landing-get-started').addEventListener('click', enterWorkspace);
  el('btn-see-how').addEventListener('click', () => {
    document.querySelector('.landing-features')?.scrollIntoView({ behavior: 'smooth' });
  });

  ['landing-nav-home', 'ws-nav-home', 'ws-logo', 'hist-back-logo'].forEach((id) => {
    el(id).addEventListener('click', (e) => {
      e.preventDefault();
      enterLanding();
    });
  });

  ['landing-nav-history', 'ws-nav-history'].forEach((id) => {
    el(id).addEventListener('click', (e) => {
      e.preventDefault();
      showView('history');
      renderSessions();
    });
  });

  ['landing-nav-about', 'ws-nav-about'].forEach((id) => {
    el(id).addEventListener('click', (e) => {
      e.preventDefault();
      openAbout();
    });
  });

  el('about-close').addEventListener('click', closeAbout);
  el('about-backdrop').addEventListener('click', closeAbout);

  document.querySelectorAll('.tab[data-tab]').forEach((tab) => {
    tab.addEventListener('click', () => setInputTab(tab.dataset.tab));
  });

  el('btn-generate-main').addEventListener('click', onGenerateMain);

  el('file-upload-main').addEventListener('change', (ev) => {
    const f = ev.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      el('notes-main').value = String(reader.result || '');
    };
    reader.readAsText(f);
  });

  el('btn-new-session').addEventListener('click', () => {
    showWorkspaceScreen('input');
    el('notes-main').value = '';
  });

  el('btn-save-session').addEventListener('click', saveSessionManual);
  el('btn-export-pdf').addEventListener('click', exportPdf);

  el('quiz-prev').addEventListener('click', () => goQuiz(-1));
  el('quiz-next').addEventListener('click', () => goQuiz(1));

  el('fc-flip').addEventListener('click', () => {
    const a = el('fc-a');
    const hidden = a.classList.toggle('hidden');
    el('fc-flip').textContent = hidden ? 'Show answer' : 'Hide answer';
  });

  document.querySelectorAll('[data-results-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.resultsTab;
      document.querySelectorAll('[data-results-tab]').forEach((b) => {
        b.classList.toggle('tab--active', b.dataset.resultsTab === name);
      });
      if (name === 'summary') {
        showWorkspaceScreen('summary-results');
      } else if (name === 'quiz') {
        if (quizItems.length === 0) startLocalQuiz();
        else showWorkspaceScreen('quiz');
      } else {
        showWorkspaceScreen('input');
        setInputTab('flashcards');
      }
    });
  });

  document.querySelectorAll('[data-quiz-nav]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.quizNav;
      if (name === 'summary') {
        showWorkspaceScreen('summary-results');
      } else if (name === 'flashcards') {
        showWorkspaceScreen('input');
        setInputTab('flashcards');
      }
    });
  });

  const filterBtn = el('btn-filter');
  const filterMenu = el('filter-menu');
  filterBtn.addEventListener('click', () => {
    filterMenu.classList.toggle('hidden');
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.filter-wrap')) filterMenu.classList.add('hidden');
  });
  filterMenu.querySelectorAll('button[data-filter]').forEach((b) => {
    b.addEventListener('click', () => {
      filterTag = b.getAttribute('data-filter');
      filterMenu.classList.add('hidden');
      renderSessions();
    });
  });

  el('session-search').addEventListener('input', () => renderSessions());
}

init();
