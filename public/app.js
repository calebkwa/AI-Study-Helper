/**
 * AI Study Helper — tabs, quiz UI, session history, API calls
 */

const QUIZ_QUESTIONS = [
  {
    question: 'What is the primary function of chlorophyll in photosynthesis?',
    options: [
      'Absorb light energy',
      'Produce glucose directly',
      'Store ATP in the nucleus',
      'Break down water in the cytoplasm',
    ],
    correctIndex: 0,
    explanation:
      'Chlorophyll absorbs light energy, which drives the conversion of carbon dioxide and water into glucose and oxygen.',
  },
  {
    question: 'Which gas is taken in by plants during photosynthesis?',
    options: ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Hydrogen'],
    correctIndex: 2,
    explanation:
      'Plants take in carbon dioxide through stomata and use it with water to build sugars during the Calvin cycle.',
  },
  {
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
    question: 'What are the main outputs of the light-dependent reactions?',
    options: ['Glucose and oxygen', 'ATP, NADPH, and oxygen', 'Only carbon dioxide', 'DNA and RNA'],
    correctIndex: 1,
    explanation:
      'Light-dependent reactions produce ATP and NADPH for the Calvin cycle, and release oxygen as a by-product of water splitting.',
  },
  {
    question: 'The Calvin cycle is also known as the ___ reactions.',
    options: ['light-dependent', 'dark / light-independent', 'glycolytic', 'fermentation'],
    correctIndex: 1,
    explanation:
      'The Calvin cycle does not directly require light; it uses ATP and NADPH from the light reactions to fix carbon.',
  },
  {
    question: 'Which molecule is split to replace electrons lost from chlorophyll?',
    options: ['CO₂', 'O₂', 'H₂O', 'NADPH'],
    correctIndex: 2,
    explanation:
      'Photolysis of water provides electrons to replace those excited in photosystem II and releases oxygen.',
  },
  {
    question: 'Where does the Calvin cycle occur?',
    options: ['Thylakoid', 'Stroma', 'Mitochondrial matrix', 'Nucleus'],
    correctIndex: 1,
    explanation: 'Carbon fixation via the Calvin cycle takes place in the stroma of the chloroplast.',
  },
  {
    question: 'What is the main sugar product of photosynthesis?',
    options: ['Sucrose only', 'Glucose', 'Starch only', 'Cellulose only'],
    correctIndex: 1,
    explanation:
      'Glucose is a primary carbohydrate product; plants convert it to sucrose, starch, or other polymers as needed.',
  },
  {
    question: 'Why are leaves typically broad and flat?',
    options: [
      'To reduce water loss only',
      'To maximize light absorption',
      'To store roots',
      'To increase heat loss at night',
    ],
    correctIndex: 1,
    explanation:
      'Broad, flat leaves increase surface area exposed to light for efficient photosynthesis.',
  },
  {
    question: 'Which pigment absorbs red and blue light most strongly?',
    options: ['Carotene only', 'Chlorophyll', 'Anthocyanin only', 'Xanthophyll only'],
    correctIndex: 1,
    explanation:
      'Chlorophyll a and b absorb strongly in the blue and red regions of the visible spectrum.',
  },
];

const SESSIONS = [
  {
    tag: 'Quiz',
    tagClass: 'tag--quiz',
    title: 'Photosynthesis – Biology 201',
    meta: 'Mode: Summary + Quiz · Date: 28 Mar 2025',
    score: '8/10',
  },
  {
    tag: 'Flashcards',
    tagClass: 'tag--flashcards',
    title: 'The French Revolution – HIST 101',
    meta: 'Mode: Flashcards · Date: 26 Mar 2025',
    score: null,
  },
  {
    tag: 'Summary',
    tagClass: 'tag--summary',
    title: 'Intro to Algorithms – CS 301',
    meta: 'Mode: Summary · Date: 24 Mar 2025',
    score: null,
  },
  {
    tag: 'Quiz',
    tagClass: 'tag--quiz',
    title: 'Macroeconomics Chapter 4',
    meta: 'Mode: Quiz · Date: 22 Mar 2025',
    score: '7/10',
  },
  {
    tag: 'All Modes',
    tagClass: 'tag--all',
    title: 'Organic Chemistry – Reactions',
    meta: 'Mode: Summary + Quiz + Flashcards · Date: 20 Mar 2025',
    score: '9/10',
  },
];

const letters = ['A', 'B', 'C', 'D'];

let currentQuizIndex = 0;
/** @type {Array<{ selectedIndex: number } | null>} */
let quizAnswers = Array(QUIZ_QUESTIONS.length).fill(null);

const el = (id) => document.getElementById(id);

function getCorrectSoFar() {
  let n = 0;
  quizAnswers.forEach((a, i) => {
    if (a && a.selectedIndex === QUIZ_QUESTIONS[i].correctIndex) {
      n += 1;
    }
  });
  return n;
}

function updateQuizHeader() {
  const total = QUIZ_QUESTIONS.length;
  const correct = getCorrectSoFar();
  const idx = currentQuizIndex;
  const progressPct = Math.round(((idx + 1) / total) * 100);

  el('quiz-score-num').textContent = String(correct);
  el('quiz-score-total').textContent = String(total);
  el('quiz-current').textContent = String(idx + 1);
  el('quiz-of').textContent = String(total);
  el('quiz-progress-fill').style.width = `${progressPct}%`;
  el('quiz-progress-pct').textContent = `${progressPct}%`;
  el('quiz-progress-wrap').setAttribute('aria-valuenow', String(progressPct));
}

function renderQuizQuestion() {
  const q = QUIZ_QUESTIONS[currentQuizIndex];
  const prev = quizAnswers[currentQuizIndex];

  el('quiz-question-text').textContent = `Q${currentQuizIndex + 1}. ${q.question}`;

  const opts = el('quiz-options');
  opts.innerHTML = '';

  q.options.forEach((text, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'quiz-option';
    btn.setAttribute('role', 'radio');
    btn.setAttribute('aria-checked', 'false');

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
      const isCorrect = i === q.correctIndex;
      const picked = prev.selectedIndex === i;
      if (isCorrect) {
        btn.classList.add('quiz-option--correct');
        letter.classList.add('quiz-option__letter--accent');
        const badge = document.createElement('span');
        badge.className = 'quiz-option__badge';
        badge.textContent = '✓ Correct';
        btn.appendChild(badge);
      } else if (picked && !isCorrect) {
        btn.classList.add('quiz-option--wrong');
      }
    } else {
      btn.addEventListener('click', () => selectQuizOption(i));
    }

    opts.appendChild(btn);
  });

  const explain = el('quiz-explanation-wrap');
  const explainText = el('quiz-explanation-text');
  if (prev) {
    explain.classList.remove('hidden');
    explainText.textContent = q.explanation;
  } else {
    explain.classList.add('hidden');
    explainText.textContent = '';
  }

  updateQuizHeader();
}

function selectQuizOption(index) {
  quizAnswers[currentQuizIndex] = { selectedIndex: index };
  renderQuizQuestion();
}

function goQuiz(delta) {
  const next = currentQuizIndex + delta;
  if (next < 0 || next >= QUIZ_QUESTIONS.length) {
    return;
  }
  currentQuizIndex = next;
  renderQuizQuestion();
}

/* Tabs */
function setTab(name) {
  document.querySelectorAll('.tab').forEach((t) => {
    const active = t.dataset.tab === name;
    t.classList.toggle('tab--active', active);
    t.setAttribute('aria-selected', active ? 'true' : 'false');
  });

  el('panel-summary').hidden = name !== 'summary';
  el('panel-quiz').hidden = name !== 'quiz';
  el('panel-flashcards').hidden = name !== 'flashcards';
}

/* Session history */
let filterTag = 'all';

function sessionMatchesFilter(s) {
  if (filterTag === 'all') {
    return true;
  }
  if (filterTag === 'Quiz') {
    return s.tag === 'Quiz';
  }
  if (filterTag === 'Flashcards') {
    return s.tag === 'Flashcards';
  }
  if (filterTag === 'Summary') {
    return s.tag === 'Summary';
  }
  return true;
}

function renderSessions() {
  const query = (el('session-search').value || '').trim().toLowerCase();
  const list = el('session-list');
  list.innerHTML = '';

  SESSIONS.filter((s) => sessionMatchesFilter(s))
    .filter((s) => !query || s.title.toLowerCase().includes(query))
    .forEach((s) => {
      const li = document.createElement('li');
      li.className = 'session-card';

      const tag = document.createElement('span');
      tag.className = `session-card__tag ${s.tagClass}`;
      tag.textContent = s.tag;

      const mid = document.createElement('div');
      mid.className = 'session-card__mid';
      const title = document.createElement('p');
      title.className = 'session-card__title';
      title.textContent = s.title;
      const meta = document.createElement('p');
      meta.className = 'session-card__meta';
      meta.textContent = s.meta;
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
      reload.innerHTML = 'Reload <span aria-hidden="true">→</span>';
      reload.addEventListener('click', () => {
        el('view-history').hidden = true;
        el('view-study').classList.add('view--active');
        if (s.tag === 'Quiz' || s.meta.includes('Quiz')) {
          setTab('quiz');
        } else if (s.tag === 'Flashcards') {
          setTab('flashcards');
        } else {
          setTab('summary');
        }
      });

      li.appendChild(tag);
      li.appendChild(mid);
      if (scoreEl) {
        li.appendChild(scoreEl);
      }
      li.appendChild(reload);
      list.appendChild(li);
    });
}

function openHistory() {
  el('view-study').classList.remove('view--active');
  el('view-history').hidden = false;
  renderSessions();
}

function closeHistory() {
  el('view-history').hidden = true;
  el('view-study').classList.add('view--active');
}

/* API */
async function postGenerate(notes, mode, language) {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notes, mode, language }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || res.statusText);
  }

  return data.result;
}

async function generateSummary() {
  const notes = el('notes').value;
  const language = el('language').value;

  const out = el('output-summary');
  const loading = el('loading-summary');

  out.textContent = '';
  loading.classList.remove('hidden');

  try {
    out.textContent = await postGenerate(notes, 'summary', language);
  } catch {
    out.textContent = 'Could not generate summary. Try again.';
  }

  loading.classList.add('hidden');
}

async function generateFlashcards() {
  const notes = el('fc-notes').value;
  const language = el('language-fc').value;  const out = el('output-fc');
  const loading = el('loading-fc');
  const fc = el('flashcard-demo');
  out.textContent = '';
  fc.hidden = true;
  loading.classList.remove('hidden');
  try {
    const text = await postGenerate(notes, 'flashcards', language);
    out.textContent = text;
    const lines = text.split('\n').filter(Boolean);
    el('fc-q').textContent = lines[0] || 'Flashcards generated — see text below.';
    el('fc-a').textContent = lines[1] || '';
    el('fc-a').classList.add('hidden');
    el('fc-flip').textContent = 'Show answer';
    fc.hidden = false;
  } catch {
    out.textContent = 'Could not generate flashcards. Try again.';
  }
  loading.classList.add('hidden');
}

function init() {
  document.body.classList.add('js-ready');

  document.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', () => setTab(tab.dataset.tab));
  });

  el('btn-generate-summary').addEventListener('click', generateSummary);
  el('btn-generate-fc').addEventListener('click', generateFlashcards);

  el('quiz-prev').addEventListener('click', () => goQuiz(-1));
  el('quiz-next').addEventListener('click', () => goQuiz(1));

  el('btn-open-history').addEventListener('click', (e) => {
    e.preventDefault();
    openHistory();
  });
  el('btn-back-study').addEventListener('click', (e) => {
    e.preventDefault();
    closeHistory();
  });
  el('logo-link').addEventListener('click', (e) => {
    e.preventDefault();
    closeHistory();
  });

  el('session-search').addEventListener('input', renderSessions);

  const filterBtn = el('btn-filter');
  const filterMenu = el('filter-menu');
  filterBtn.addEventListener('click', () => {
    const open = filterMenu.classList.toggle('hidden');
    filterBtn.setAttribute('aria-expanded', open ? 'false' : 'true');
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.filter-wrap')) {
      filterMenu.classList.add('hidden');
      filterBtn.setAttribute('aria-expanded', 'false');
    }
  });

  filterMenu.querySelectorAll('button[data-filter]').forEach((b) => {
    b.addEventListener('click', () => {
      filterTag = b.getAttribute('data-filter');
      filterMenu.classList.add('hidden');
      renderSessions();
    });
  });

  el('fc-flip').addEventListener('click', () => {
    const a = el('fc-a');
    const hidden = a.classList.toggle('hidden');
    el('fc-flip').textContent = hidden ? 'Show answer' : 'Hide answer';
  });

  renderQuizQuestion();
  renderSessions();
}

init();
