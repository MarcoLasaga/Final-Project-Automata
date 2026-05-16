'use strict';

const State = {
  currentAlgo:   null,
  currentMethod: 'recursive',
  darkMode:      true,
  musicPlaying:  false,
  lastResult:    null,
};

const ALGORITHMS = [
  {
    id: 'fibonacci', letter: 'A', title: 'Fibonacci Sequence',
    desc: 'Each number is the sum of the two preceding ones, beginning with 0 and 1.',
    formula: 'F(n) = F(n−1) + F(n−2),  F(0)=0,  F(1)=1',
    badge: 'Recursive & Iterative',
    explanation: 'The Fibonacci sequence is one of the most celebrated sequences in mathematics, appearing in nature, art, and architecture. Each term is produced by adding the two terms before it.',
  },
  {
    id: 'lucas', letter: 'B', title: 'Lucas Sequence',
    desc: 'A companion to Fibonacci with different starting values: L(0)=2, L(1)=1.',
    formula: 'L(n) = L(n−1) + L(n−2),  L(0)=2,  L(1)=1',
    badge: 'Recursive',
    explanation: 'The Lucas sequence follows the same additive rule as Fibonacci but starts with 2 and 1. Named after Edouard Lucas, it shares deep connections with the golden ratio phi.',
  },
  {
    id: 'tribonacci', letter: 'C', title: 'Tribonacci Sequence',
    desc: 'Each term is the sum of the three preceding terms.',
    formula: 'T(n) = T(n−1) + T(n−2) + T(n−3),  T(0)=0, T(1)=0, T(2)=1',
    badge: 'Recursive',
    explanation: 'The Tribonacci sequence extends the Fibonacci idea from two to three predecessors. It converges to the Tribonacci constant approximately 1.83928, analogous to the golden ratio.',
  },
  {
    id: 'collatz', letter: 'D', title: 'Collatz Conjecture',
    desc: 'Apply simple rules repeatedly — will you always reach 1?',
    formula: 'n / 2 (if even)  |  3n + 1 (if odd)',
    badge: 'Visualization',
    explanation: 'Starting from any positive integer, if even divide by 2; if odd multiply by 3 and add 1. The conjecture states you always eventually reach 1. Unproven for decades.',
  },
  {
    id: 'bernoulli', letter: 'E', title: 'Bernoulli Numbers',
    desc: 'A sequence deeply linked to the Riemann zeta function and number theory.',
    formula: 'B(n) = -Sum C(n+1,k) * B(k) / (n+1),  k=0 to n-1',
    badge: 'Number Theory',
    explanation: 'Bernoulli numbers appear in Taylor series of trigonometric functions and in the Euler-Maclaurin formula. They were the first non-trivial sequence computed by Ada Lovelace.',
  },
  {
    id: 'euclidean', letter: 'F', title: 'Euclidean Division',
    desc: 'Compute dividend, divisor, quotient, and remainder for two integers.',
    formula: 'a = b * q + r,   0 <= r < b',
    badge: 'Division Algorithm',
    explanation: 'The Euclidean Division Algorithm expresses any integer as a multiple of another plus a remainder. It is the foundation of modular arithmetic and the basis of the GCD algorithm.',
  },
  {
    id: 'gcd', letter: 'G', title: 'GCD & LCM Calculator',
    desc: 'Find Greatest Common Divisor and Least Common Multiple via the Euclidean Algorithm.',
    formula: 'GCD via repeated division;  LCM = (a x b) / GCD',
    badge: 'Euclidean Algorithm',
    explanation: 'The Euclidean Algorithm repeatedly applies division to find the GCD. The LCM follows from LCM(a,b) = (a times b) / GCD(a,b).',
  },
];

/* ═══════════════════════════════════════════════════════════════
   3. DOM HELPER
   ═══════════════════════════════════════════════════════════════ */
const $ = id => document.getElementById(id);

function fmt(n) {
  if (typeof n === 'string') return n;
  if (!isFinite(n)) return String(n);
  return n.toLocaleString('en-US');
}

const SCREEN_IDS = ['splash', 'menu', 'computation', 'result', 'goodbye'];

function showScreen(id) {
  SCREEN_IDS.forEach(function(sid) {
    var el = $(sid);
    if (el) el.classList.add('hidden');
  });
  var target = $(id);
  if (target) {
    target.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

window.addEventListener('load', function() {
  var loader = $('loader');
  setTimeout(function() {
    if (loader) loader.classList.add('fade-out');
    setTimeout(function() {
      if (loader) loader.style.display = 'none';
      showScreen('splash');
      attemptAutoplay();
    }, 400);
  }, 800);
});

function attemptAutoplay() {
  var bgMusic = $('bg-music');
  if (!bgMusic) return;
  bgMusic.volume = 0.4;
  var p = bgMusic.play();
  if (p !== undefined) {
    p.then(function() {
      State.musicPlaying = true;
      updatePlayBtn();
    }).catch(function() {
      State.musicPlaying = false;
      updatePlayBtn();
      var notice = $('autoplay-notice');
      if (notice) notice.style.display = 'block';
      document.addEventListener('click', function enableOnce() {
        bgMusic.play().then(function() {
          State.musicPlaying = true;
          updatePlayBtn();
          if (notice) notice.style.display = 'none';
        }).catch(function() {});
        document.removeEventListener('click', enableOnce);
      });
    });
  }
}

function updatePlayBtn() {
  var btn = $('play-pause-btn');
  if (btn) btn.textContent = State.musicPlaying ? '\u23F8' : '\u25B6';
}

function toggleMusic() {
  var bgMusic = $('bg-music');
  if (!bgMusic) return;
  if (State.musicPlaying) {
    bgMusic.pause();
    State.musicPlaying = false;
  } else {
    bgMusic.play().catch(function() {});
    State.musicPlaying = true;
  }
  updatePlayBtn();
}

function initParticles() {
  var canvas = $('particle-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var W, H, particles;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function makeParticles() {
    var count = Math.min(Math.floor(W * H / 14000), 70);
    particles = [];
    for (var i = 0; i < count; i++) {
      particles.push({
        x:     Math.random() * W,
        y:     Math.random() * H,
        r:     Math.random() * 1.8 + 0.3,
        vx:    (Math.random() - 0.5) * 0.3,
        vy:    (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.5 + 0.1,
        color: Math.random() > 0.6 ? '#d4af37' : (Math.random() > 0.5 ? '#8b5cf6' : '#c0c8d8'),
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
      p.x = (p.x + p.vx + W) % W;
      p.y = (p.y + p.vy + H) % H;
    }
    ctx.globalAlpha = 1;
    for (var a = 0; a < particles.length; a++) {
      for (var b = a + 1; b < particles.length; b++) {
        var dx = particles[a].x - particles[b].x;
        var dy = particles[a].y - particles[b].y;
        var d  = Math.sqrt(dx * dx + dy * dy);
        if (d < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.strokeStyle = 'rgba(212,175,55,' + (0.06 * (1 - d / 100)).toFixed(3) + ')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', function() { resize(); makeParticles(); });
  resize();
  makeParticles();
  draw();
}

function initCursor() {
  var dot  = $('cursor-dot');
  var ring = $('cursor-ring');
  if (!dot || !ring) return;
  var rx = 0, ry = 0;

  document.addEventListener('mousemove', function(e) {
    dot.style.left = e.clientX + 'px';
    dot.style.top  = e.clientY + 'px';
    rx += (e.clientX - rx) * 0.18;
    ry += (e.clientY - ry) * 0.18;
  });

  (function animRing() {
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animRing);
  })();
}

function showToast(title, msg, type, duration) {
  type     = type     || 'info';
  duration = duration || 4000;
  var icons = { error: '&#10005;', success: '&#10003;', info: '&#9819;', warning: '&#9888;' };
  var container = $('toast-container');
  if (!container) return;
  var toast = document.createElement('div');
  toast.className = 'toast ' + type;
  toast.innerHTML = '<div class="toast-icon">' + (icons[type] || '&#9819;') + '</div>' +
    '<div class="toast-body">' +
      '<div class="toast-title">' + title + '</div>' +
      '<div class="toast-msg">' + msg + '</div>' +
    '</div>';
  container.appendChild(toast);
  setTimeout(function() {
    toast.classList.add('removing');
    setTimeout(function() { toast.remove(); }, 320);
  }, duration);
}

function toggleTheme() {
  State.darkMode = !State.darkMode;
  document.body.classList.toggle('dark-mode',  State.darkMode);
  document.body.classList.toggle('light-mode', !State.darkMode);
  document.querySelectorAll('.theme-toggle-btn').forEach(function(b) {
    b.textContent = State.darkMode ? '\u2600' : '\u263E';
  });
  showToast('Theme', State.darkMode ? 'Dark mode activated' : 'Light mode activated', 'info', 1800);
}

var _audioCtx = null;
function getAudioCtx() {
  if (!_audioCtx) {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (AC) _audioCtx = new AC();
  }
  return _audioCtx;
}
function playTone(freq, dur, type, gain) {
  freq = freq || 440; dur = dur || 0.12; type = type || 'sine'; gain = gain || 0.13;
  try {
    var ctx = getAudioCtx();
    if (!ctx) return;
    var osc = ctx.createOscillator();
    var g   = ctx.createGain();
    osc.connect(g); g.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    g.gain.setValueAtTime(gain, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + dur);
  } catch (e) {}
}
function sfxCardClick() { playTone(523, 0.18, 'sine', 0.12); }
function sfxSuccess()   { playTone(659, 0.10, 'sine', 0.09); setTimeout(function(){ playTone(784, 0.14, 'sine', 0.07); }, 110); }
function sfxError()     { playTone(180, 0.18, 'square', 0.07); }
function sfxHover()     { playTone(880, 0.04, 'sine', 0.04); }
function sfxNavigate()  { playTone(392, 0.09, 'triangle', 0.08); }

function markInvalid(el) {
  if (!el) return;
  el.classList.add('invalid');
  el.focus();
  setTimeout(function() { el.classList.remove('invalid'); }, 700);
}
function markValid(el) { if (el) el.classList.remove('invalid'); }

function getInt(id, min, max, label) {
  var el  = $(id);
  var raw = el ? el.value.trim() : '';

  if (raw === '') {
    markInvalid(el);
    showToast('Empty Field', 'Please enter a value for ' + label + '.', 'error');
    sfxError();
    return null;
  }
  if (!/^-?\d+$/.test(raw)) {
    markInvalid(el);
    showToast('Invalid Input', label + ' must be a whole number — no decimals or letters.', 'error');
    sfxError();
    return null;
  }
  var val = parseInt(raw, 10);
  if (min !== null && val < min) {
    markInvalid(el);
    showToast('Out of Range', label + ' must be at least ' + fmt(min) + '.', 'error');
    sfxError();
    return null;
  }
  if (max !== null && val > max) {
    markInvalid(el);
    showToast('Out of Range', label + ' must be at most ' + fmt(max) + '.', 'warning');
    sfxError();
    return null;
  }
  markValid(el);
  return val;
}

function initRipple() {
  document.addEventListener('click', function(e) {
    var btn = e.target.closest('.btn-royal, .algo-card');
    if (!btn) return;
    var ripple = document.createElement('span');
    var rect   = btn.getBoundingClientRect();
    var size   = Math.max(rect.width, rect.height) * 1.5;
    ripple.style.cssText =
      'position:absolute;border-radius:50%;pointer-events:none;' +
      'width:' + size + 'px;height:' + size + 'px;' +
      'left:' + (e.clientX - rect.left - size / 2) + 'px;' +
      'top:'  + (e.clientY - rect.top  - size / 2) + 'px;' +
      'background:rgba(212,175,55,0.22);' +
      'transform:scale(0);animation:ripple-expand 0.55s ease-out forwards;';
    if (getComputedStyle(btn).position === 'static') btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.appendChild(ripple);
    setTimeout(function() { ripple.remove(); }, 600);
  }, true);
}

function showProgress() {
  var bar = $('compute-progress');
  if (!bar) {
    bar    = document.createElement('div');
    bar.id = 'compute-progress';
    document.body.appendChild(bar);
  }
  bar.style.width   = '0';
  bar.style.opacity = '1';
  requestAnimationFrame(function() { bar.style.width = '65%'; });
}
function hideProgress() {
  var bar = $('compute-progress');
  if (!bar) return;
  bar.style.width = '100%';
  setTimeout(function() {
    bar.style.opacity = '0';
    setTimeout(function() { bar.style.width = '0'; bar.style.opacity = '1'; }, 300);
  }, 180);
}

function renderCardGrid() {
  var grid = $('card-grid');
  if (!grid) return;
  grid.innerHTML = '';

  ALGORITHMS.forEach(function(algo, i) {
    var card = document.createElement('div');
    card.className = 'algo-card';
    card.style.animationDelay = (i * 0.07) + 's';
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', 'Open ' + algo.title);
    card.innerHTML =
      '<div class="card-letter">' + algo.letter + '</div>' +
      '<div class="card-title">'  + algo.title  + '</div>' +
      '<div class="card-desc">'   + algo.desc   + '</div>' +
      '<div class="card-formula">' + algo.formula + '</div>' +
      '<span class="card-badge">' + algo.badge  + '</span>';

    (function(id) {
      card.addEventListener('click', function() { sfxCardClick(); openComputation(id); });
      card.addEventListener('mouseenter', sfxHover);
      card.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sfxCardClick(); openComputation(id); }
      });
    })(algo.id);

    grid.appendChild(card);
  });

  var old = $('shortcut-hint');
  if (old) old.remove();
  var hint = document.createElement('div');
  hint.id = 'shortcut-hint';
  hint.innerHTML = '<kbd>M</kbd> Music &nbsp;&middot;&nbsp; <kbd>T</kbd> Theme &nbsp;&middot;&nbsp; <kbd>?</kbd> About &nbsp;&middot;&nbsp; Type <kbd>golden</kbd> for a secret &#10022;';
  grid.after(hint);
}

function openComputation(algoId) {
  State.currentAlgo   = algoId;
  State.currentMethod = 'recursive';
  var algo = ALGORITHMS.find(function(a) { return a.id === algoId; });

  var titleEl = $('comp-title');
  var subEl   = $('comp-subtitle');
  if (titleEl) titleEl.textContent = algo.title;
  if (subEl)   subEl.textContent   = 'Enter your parameters below';

  renderFormulaCard(algo);
  renderFormCard(algo);
  showScreen('computation');
  sfxNavigate();
}

function renderFormulaCard(algo) {
  var card = $('comp-formula-card');
  if (!card) return;
  card.innerHTML =
    '<span class="formula-label">Mathematical Formula</span>' +
    '<div class="formula-display">' + algo.formula + '</div>' +
    '<p class="formula-explain">' + algo.explanation + '</p>';
}

function renderFormCard(algo) {
  var card = $('comp-form-card');
  if (!card) return;
  var html = '';

  if (algo.id === 'fibonacci') {
    html =
      '<div class="method-selector">' +
        '<button class="method-btn active" data-method="recursive">&#8635; Recursive</button>' +
        '<button class="method-btn" data-method="iterative">&#8634; Iterative</button>' +
      '</div>' +
      '<div class="form-group">' +
        '<label class="form-label" for="fib-n">Enter the nth term (1 to 70)</label>' +
        '<input class="form-input" id="fib-n" type="number" placeholder="e.g. 10" min="1" max="70" />' +
        '<div class="form-hint">Enter a positive integer from 1 to 70.</div>' +
      '</div>' +
      '<button class="btn-royal btn-compute" id="btn-compute">&#10022; Compute Fibonacci</button>';

  } else if (algo.id === 'lucas') {
    html =
      '<div class="form-group">' +
        '<label class="form-label" for="lucas-n">Enter the nth term (1 to 70)</label>' +
        '<input class="form-input" id="lucas-n" type="number" placeholder="e.g. 10" min="1" max="70" />' +
        '<div class="form-hint">Sequence starts: 2, 1, 3, 4, 7, 11, 18 ...</div>' +
      '</div>' +
      '<button class="btn-royal btn-compute" id="btn-compute">&#10022; Compute Lucas</button>';

  } else if (algo.id === 'tribonacci') {
    html =
      '<div class="form-group">' +
        '<label class="form-label" for="trib-n">Enter the nth term (1 to 60)</label>' +
        '<input class="form-input" id="trib-n" type="number" placeholder="e.g. 10" min="1" max="60" />' +
        '<div class="form-hint">Sequence starts: 0, 0, 1, 1, 2, 4, 7, 13 ...</div>' +
      '</div>' +
      '<button class="btn-royal btn-compute" id="btn-compute">&#10022; Compute Tribonacci</button>';

  } else if (algo.id === 'collatz') {
    html =
      '<div class="form-group">' +
        '<label class="form-label" for="collatz-n">Enter a positive integer (1 to 100000)</label>' +
        '<input class="form-input" id="collatz-n" type="number" placeholder="e.g. 27" min="1" max="100000" />' +
        '<div class="form-hint">The algorithm runs until it reaches 1.</div>' +
      '</div>' +
      '<button class="btn-royal btn-compute" id="btn-compute">&#10022; Start Conjecture</button>';

  } else if (algo.id === 'bernoulli') {
    html =
      '<div class="form-group">' +
        '<label class="form-label" for="bern-n">How many Bernoulli numbers? (1 to 20)</label>' +
        '<input class="form-input" id="bern-n" type="number" placeholder="e.g. 10" min="1" max="20" />' +
        '<div class="form-hint">Odd-indexed values beyond B(1) are always zero.</div>' +
      '</div>' +
      '<button class="btn-royal btn-compute" id="btn-compute">&#10022; Compute Bernoulli Numbers</button>';

  } else if (algo.id === 'euclidean') {
    html =
      '<div class="form-group">' +
        '<label class="form-label" for="euc-a">First Integer</label>' +
        '<input class="form-input" id="euc-a" type="number" placeholder="e.g. 47" />' +
        '<div class="form-hint">Any non-zero integer.</div>' +
      '</div>' +
      '<div class="form-group">' +
        '<label class="form-label" for="euc-b">Second Integer</label>' +
        '<input class="form-input" id="euc-b" type="number" placeholder="e.g. 13" />' +
        '<div class="form-hint">Any non-zero integer.</div>' +
      '</div>' +
      '<button class="btn-royal btn-compute" id="btn-compute">&#10022; Apply Division Algorithm</button>';

  } else if (algo.id === 'gcd') {
    html =
      '<div class="form-group">' +
        '<label class="form-label" for="gcd-a">First Integer</label>' +
        '<input class="form-input" id="gcd-a" type="number" placeholder="e.g. 252" />' +
        '<div class="form-hint">Any positive integer.</div>' +
      '</div>' +
      '<div class="form-group">' +
        '<label class="form-label" for="gcd-b">Second Integer</label>' +
        '<input class="form-input" id="gcd-b" type="number" placeholder="e.g. 198" />' +
        '<div class="form-hint">Any positive integer.</div>' +
      '</div>' +
      '<button class="btn-royal btn-compute" id="btn-compute">&#10022; Calculate GCD &amp; LCM</button>';
  }

  card.innerHTML = html;

  /* Method toggle buttons */
  card.querySelectorAll('.method-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      card.querySelectorAll('.method-btn').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      State.currentMethod = btn.dataset.method;
    });
  });

  /* Compute button */
  var computeBtn = $('btn-compute');
  if (computeBtn) {
    computeBtn.addEventListener('click', function() { handleCompute(algo.id); });
    computeBtn.addEventListener('mouseenter', sfxHover);
  }

  card.querySelectorAll('.form-input').forEach(function(inp) {
    inp.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') handleCompute(algo.id);
    });
  });
}

function handleCompute(algoId) {
  var btn      = $('btn-compute');
  var origText = btn ? btn.textContent : '';

  if (btn) { btn.disabled = true; btn.textContent = '... Computing'; btn.style.opacity = '0.7'; }
  showProgress();

  setTimeout(function() {
    try {
      if      (algoId === 'fibonacci')  computeFibonacci();
      else if (algoId === 'lucas')      computeLucas();
      else if (algoId === 'tribonacci') computeTribonacci();
      else if (algoId === 'collatz')    computeCollatz();
      else if (algoId === 'bernoulli')  computeBernoulli();
      else if (algoId === 'euclidean')  computeEuclidean();
      else if (algoId === 'gcd')        computeGCD();
    } catch (err) {
      showToast('Error', 'An unexpected error occurred. Please try again.', 'error');
      console.error('Compute error:', err);
    }
    hideProgress();
    if (btn) { btn.disabled = false; btn.textContent = origText; btn.style.opacity = ''; }
  }, 0);
}

function computeFibonacci() {
  var n = getInt('fib-n', 1, 70, 'n-th term');
  if (n === null) return;

  var sequence = [];
  var steps    = [];
  var nthValue;

  if (State.currentMethod === 'recursive') {
    var memo = {};
    function fibRec(k) {
      if (k in memo) return memo[k];
      if (k === 0) return 0;
      if (k === 1) return 1;
      memo[k] = fibRec(k - 1) + fibRec(k - 2);
      return memo[k];
    }
    for (var i = 0; i < n; i++) sequence.push(fibRec(i));
    nthValue = fibRec(n - 1);

    var showAll = (n <= 15);
    var limit   = showAll ? n : 4;
    for (var i = 0; i < limit; i++) {
      if (i === 0) steps.push({ n: 0, eq: 'F(0) = 0', note: 'Base case' });
      else if (i === 1) steps.push({ n: 1, eq: 'F(1) = 1', note: 'Base case' });
      else steps.push({ n: i, eq: 'F(' + i + ') = F(' + (i-1) + ') + F(' + (i-2) + ') = ' + fmt(sequence[i-1]) + ' + ' + fmt(sequence[i-2]) + ' = ' + fmt(sequence[i]), note: 'Recursive step' });
    }
    if (!showAll) {
      steps.push({ n: '...', eq: '... memoized recursion for intermediate terms ...', note: '' });
      steps.push({ n: n - 1, eq: 'F(' + (n-1) + ') = ' + fmt(nthValue), note: 'Final answer' });
    }

  } else {
    var a = 0, b = 1;
    sequence.push(a);
    if (n > 1) sequence.push(b);
    steps.push({ n: 0, eq: 'F(0) = 0', note: 'Seed value' });
    if (n > 1) steps.push({ n: 1, eq: 'F(1) = 1', note: 'Seed value' });

    for (var i = 2; i < n; i++) {
      var c = a + b;
      sequence.push(c);
      if (i <= 12 || i === n - 1) {
        steps.push({ n: i, eq: 'F(' + i + ') = ' + fmt(b) + ' + ' + fmt(a) + ' = ' + fmt(c), note: 'Iterative step' });
      } else if (i === 13) {
        steps.push({ n: '...', eq: '... continuing iteration ...', note: '' });
      }
      a = b; b = c;
    }
    nthValue = sequence[n - 1];
  }

  showResult({
    title:    'Fibonacci Sequence',
    badge:    'Method: ' + (State.currentMethod === 'recursive' ? 'Recursive (Memoized)' : 'Iterative'),
    answer:   'F(' + (n-1) + ') = ' + fmt(nthValue),
    sequence: sequence,
    steps:    steps,
    extra:    'The ' + n + '-term Fibonacci sequence computed. The ' + n + 'th value is ' + fmt(nthValue) + '.',
    showTree: (n >= 2 && n <= 9),
    treeN:    n - 1,
  });
}

function computeLucas() {
  var n = getInt('lucas-n', 1, 70, 'n-th term');
  if (n === null) return;

  var memo = {};
  function lucasRec(k) {
    if (k in memo) return memo[k];
    if (k === 0) return 2;
    if (k === 1) return 1;
    memo[k] = lucasRec(k - 1) + lucasRec(k - 2);
    return memo[k];
  }

  var sequence = [];
  var steps    = [];
  for (var i = 0; i < n; i++) sequence.push(lucasRec(i));
  var nthValue = lucasRec(n - 1);

  var showAll = (n <= 15);
  var limit   = showAll ? n : 4;
  for (var i = 0; i < limit; i++) {
    if (i === 0) steps.push({ n: 0, eq: 'L(0) = 2', note: 'Base case — differs from Fibonacci' });
    else if (i === 1) steps.push({ n: 1, eq: 'L(1) = 1', note: 'Base case' });
    else steps.push({ n: i, eq: 'L(' + i + ') = L(' + (i-1) + ') + L(' + (i-2) + ') = ' + fmt(sequence[i-1]) + ' + ' + fmt(sequence[i-2]) + ' = ' + fmt(sequence[i]), note: 'Recursive step' });
  }
  if (!showAll) {
    steps.push({ n: '...', eq: '... memoized recursion ...', note: '' });
    steps.push({ n: n - 1, eq: 'L(' + (n-1) + ') = ' + fmt(nthValue), note: 'Final answer' });
  }

  showResult({
    title:    'Lucas Sequence',
    badge:    'Method: Recursive (Memoized)',
    answer:   'L(' + (n-1) + ') = ' + fmt(nthValue),
    sequence: sequence,
    steps:    steps,
    extra:    'Lucas sequence computed up to term ' + n + '. The ' + n + 'th value is ' + fmt(nthValue) + '.',
  });
}

function computeTribonacci() {
  var n = getInt('trib-n', 1, 60, 'n-th term');
  if (n === null) return;

  var memo = {};
  function tribRec(k) {
    if (k in memo) return memo[k];
    if (k === 0 || k === 1) return 0;
    if (k === 2) return 1;
    memo[k] = tribRec(k-1) + tribRec(k-2) + tribRec(k-3);
    return memo[k];
  }

  var sequence = [];
  var steps    = [];
  for (var i = 0; i < n; i++) sequence.push(tribRec(i));
  var nthValue = tribRec(n - 1);

  steps.push({ n: 0, eq: 'T(0) = 0', note: 'Base case' });
  if (n > 1) steps.push({ n: 1, eq: 'T(1) = 0', note: 'Base case' });
  if (n > 2) steps.push({ n: 2, eq: 'T(2) = 1', note: 'Base case' });
  for (var i = 3; i < Math.min(n, 13); i++) {
    steps.push({ n: i, eq: 'T(' + i + ') = T(' + (i-1) + ') + T(' + (i-2) + ') + T(' + (i-3) + ') = ' + fmt(sequence[i-1]) + ' + ' + fmt(sequence[i-2]) + ' + ' + fmt(sequence[i-3]) + ' = ' + fmt(sequence[i]), note: 'Recursive step' });
  }
  if (n > 13) {
    steps.push({ n: '...', eq: '... continuing via memoized recursion ...', note: '' });
    steps.push({ n: n - 1, eq: 'T(' + (n-1) + ') = ' + fmt(nthValue), note: 'Final answer' });
  }

  showResult({
    title:    'Tribonacci Sequence',
    badge:    'Method: Recursive (Memoized)',
    answer:   'T(' + (n-1) + ') = ' + fmt(nthValue),
    sequence: sequence,
    steps:    steps,
    extra:    'Each term sums its three predecessors. The ' + n + 'th Tribonacci value is ' + fmt(nthValue) + '.',
  });
}

function computeCollatz() {
  var n = getInt('collatz-n', 1, 100000, 'starting integer');
  if (n === null) return;

  var seq   = [n];
  var steps = [];
  var cur   = n;
  var count = 0;

  while (cur !== 1) {
    if (count > 1000000) {
      showToast('Overflow', 'Sequence exceeded 1,000,000 steps!', 'error');
      return;
    }
    var prev = cur;
    if (cur % 2 === 0) {
      cur = cur / 2;
      if (count < 20 || cur === 1) {
        steps.push({ n: count + 1, eq: fmt(prev) + ' is even  ->  ' + fmt(prev) + ' / 2 = ' + fmt(cur), note: '' });
      } else if (count === 20) {
        steps.push({ n: '...', eq: '... sequence continues ...', note: 'Showing first 20 + final steps' });
      }
    } else {
      cur = 3 * cur + 1;
      if (count < 20 || cur === 1) {
        steps.push({ n: count + 1, eq: fmt(prev) + ' is odd  ->  3 x ' + fmt(prev) + ' + 1 = ' + fmt(cur), note: '' });
      }
    }
    seq.push(cur);
    count++;
  }

  var maxVal = Math.max.apply(null, seq);

  showResult({
    title:       'Collatz Conjecture',
    badge:       'Starting Value: ' + fmt(n),
    answer:      'Reached 1 in ' + fmt(count) + ' steps',
    sequence:    seq.length <= 80 ? seq : seq.slice(0, 50).concat(['...']).concat(seq.slice(-10)),
    steps:       steps,
    extra:       'Maximum value reached: ' + fmt(maxVal) + '. Total steps: ' + fmt(count) + '.',
    isCollatz:   true,
    collatzFull: seq,
  });
}

function computeBernoulli() {
  var n = getInt('bern-n', 1, 20, 'count');
  if (n === null) return;

  function binomial(nn, k) {
    if (k === 0 || k === nn) return 1;
    var r = 1;
    for (var i = 0; i < k; i++) r = r * (nn - i) / (i + 1);
    return Math.round(r);
  }

  var B     = [1];
  var EXACT = ['1'];
  var KNOWN = ['1','-1/2','1/6','0','-1/30','0','1/42','0','-1/30','0','5/66','0','-691/2730','0','7/6','0','-3617/510','0','43867/798','0'];

  for (var m = 1; m < n; m++) {
    var sum = 0;
    for (var k = 0; k < m; k++) sum += binomial(m + 1, k) * B[k];
    B[m] = -sum / (m + 1);
    EXACT.push(m < KNOWN.length ? KNOWN[m] : B[m].toPrecision(6));
  }

  var steps = [];
  var bernoulliData = [];
  for (var i = 0; i < B.length; i++) {
    var note = i === 0 ? 'By convention' : (i % 2 === 1 && i > 1 ? 'Always 0 for odd index > 1' : 'Via recurrence formula');
    steps.push({ n: i, eq: 'B(' + i + ') = ' + EXACT[i] + '  approx  ' + B[i].toFixed(8), note: note });
    bernoulliData.push({ index: i, exact: EXACT[i], approx: B[i].toFixed(8) });
  }

  showResult({
    title:        'Bernoulli Numbers',
    badge:        'First ' + n + ' Bernoulli Number' + (n > 1 ? 's' : ''),
    answer:       'B(0)=1,  B(1)=-1/2,  B(2)=1/6 ...',
    sequence:     [],
    steps:        steps,
    extra:        'Bernoulli numbers with odd index > 1 are always zero. Computed B(0) through B(' + (n-1) + ').',
    isBernoulli:  true,
    bernoulliData: bernoulliData,
  });
}

function computeEuclidean() {
  var aRaw = getInt('euc-a', null, null, 'first integer');
  if (aRaw === null) return;
  var bRaw = getInt('euc-b', null, null, 'second integer');
  if (bRaw === null) return;

  if (aRaw === 0 && bRaw === 0) {
    showToast('Invalid Input', 'Both integers cannot be zero.', 'error');
    markInvalid($('euc-a')); markInvalid($('euc-b'));
    return;
  }
  if (bRaw === 0) { showToast('Division by Zero', 'The second integer cannot be zero.', 'error'); markInvalid($('euc-b')); return; }
  if (aRaw === 0) { showToast('Invalid Input',   'The first integer cannot be zero.',  'error'); markInvalid($('euc-a')); return; }

  var dubaichewychocolate = aRaw;
  var ilocosempanada      = bRaw;
  var dividend  = Math.max(Math.abs(dubaichewychocolate), Math.abs(ilocosempanada));
  var divisor   = Math.min(Math.abs(dubaichewychocolate), Math.abs(ilocosempanada));
  var quotient  = Math.trunc(dividend / divisor);
  var remainder = dividend % divisor;
  var equation  = fmt(dividend) + ' = ' + fmt(divisor) + ' (' + fmt(quotient) + ') + ' + fmt(remainder);

  var steps = [
    { n: 1,   eq: 'Inputs: ' + fmt(aRaw) + ' and ' + fmt(bRaw),                                         note: 'As entered' },
    { n: 2,   eq: 'Dividend  = max(|' + fmt(aRaw) + '|, |' + fmt(bRaw) + '|) = ' + fmt(dividend),      note: 'Larger absolute value' },
    { n: 3,   eq: 'Divisor   = min(|' + fmt(aRaw) + '|, |' + fmt(bRaw) + '|) = ' + fmt(divisor),       note: 'Smaller absolute value' },
    { n: 4,   eq: 'Quotient  = ' + fmt(dividend) + ' / ' + fmt(divisor) + ' = ' + fmt(quotient),        note: 'Integer division (truncated)' },
    { n: 5,   eq: 'Remainder = ' + fmt(dividend) + ' mod ' + fmt(divisor) + ' = ' + fmt(remainder),     note: 'Modulo operation' },
    { n: 6,   eq: equation,                                                                               note: 'Euclidean form: a = b(q) + r' },
    { n: '*', eq: 'The dividend is ' + fmt(dividend),   note: '' },
    { n: '*', eq: 'The divisor is '  + fmt(divisor),    note: '' },
    { n: '*', eq: 'The quotient is ' + fmt(quotient),   note: '' },
    { n: '*', eq: 'The remainder is ' + fmt(remainder), note: '' },
  ];

  showResult({
    title:    'Euclidean Division Algorithm',
    badge:    'Division Algorithm',
    answer:   equation,
    sequence: [],
    steps:    steps,
    extra:    'The quotient is ' + fmt(quotient) + ' and the remainder is ' + fmt(remainder) + '.',
  });
}

function computeGCD() {
  var xRaw = getInt('gcd-a', null, null, 'first integer');
  if (xRaw === null) return;
  var yRaw = getInt('gcd-b', null, null, 'second integer');
  if (yRaw === null) return;

  if (xRaw <= 0 || yRaw <= 0) {
    if (xRaw <= 0) markInvalid($('gcd-a'));
    if (yRaw <= 0) markInvalid($('gcd-b'));
    showToast('Invalid Input', 'Both integers must be positive.', 'error');
    sfxError();
    return;
  }

  var x = xRaw, y = yRaw;
  var a = Math.max(x, y);
  var b = Math.min(x, y);

  var dividend = a;
  var divisor  = b;
  var gcd      = 0;
  var steps    = [];

  while (divisor !== 0) {
    var q = Math.trunc(dividend / divisor);
    var r = dividend % divisor;

    if (r === 0) {
      steps.push({ n: steps.length + 1, eq: fmt(dividend) + ' = ' + fmt(divisor) + ' (' + fmt(q) + ')', note: 'Remainder = 0  ->  GCD found!' });
      gcd = divisor;
    } else {
      steps.push({ n: steps.length + 1, eq: fmt(dividend) + ' = ' + fmt(divisor) + ' (' + fmt(q) + ') + ' + fmt(r), note: 'Continue: dividend=' + fmt(divisor) + ', divisor=' + fmt(r) });
    }

    dividend = divisor;
    divisor  = r;
  }

  var lcm = (a * b) / gcd;

  steps.push({ n: '*', eq: 'The integers are ' + fmt(a) + ' and ' + fmt(b),                               note: '' });
  steps.push({ n: '*', eq: 'The GCD is ' + fmt(gcd),                                                      note: 'Greatest Common Divisor' });
  steps.push({ n: '*', eq: 'The LCM is (' + fmt(a) + ' x ' + fmt(b) + ') / ' + fmt(gcd) + ' = ' + fmt(lcm), note: 'Least Common Multiple' });

  showResult({
    title:    'GCD & LCM Calculator',
    badge:    'Integers: ' + fmt(a) + ' and ' + fmt(b),
    answer:   'GCD = ' + fmt(gcd) + '   |   LCM = ' + fmt(lcm),
    sequence: [],
    steps:    steps,
    extra:    'GCD(' + fmt(a) + ', ' + fmt(b) + ') = ' + fmt(gcd) + '   LCM(' + fmt(a) + ', ' + fmt(b) + ') = ' + fmt(lcm),
  });
}

function renderCollatzViz(seq) {
  if (seq.length > 600) {
    return '<p style="color:var(--text-muted);margin-top:1rem;font-size:0.85rem">Sequence too long for bar chart (' + fmt(seq.length) + ' steps). Values shown above.</p>';
  }
  var maxV = Math.max.apply(null, seq);
  var bars = seq.map(function(v, i) {
    var h = Math.max(4, Math.round((v / maxV) * 140));
    return '<div class="collatz-bar" style="height:' + h + 'px;animation-delay:' + Math.min(i * 0.008, 2) + 's" title="' + fmt(v) + '"></div>';
  }).join('');
  return '<div style="margin-top:1.5rem">' +
    '<span class="steps-title">&#10022; Sequence Visualization</span>' +
    '<div class="collatz-viz"><div class="collatz-bars">' + bars + '</div></div>' +
    '<p style="color:var(--text-muted);font-size:0.8rem;margin-top:0.4rem">Each bar = one value in the sequence. Hover for exact number.</p>' +
  '</div>';
}

function fibVal(k, memo) {
  if (k in memo) return memo[k];
  if (k <= 0) return 0;
  if (k === 1) return 1;
  memo[k] = fibVal(k-1, memo) + fibVal(k-2, memo);
  return memo[k];
}

function buildFibTree(n, depth, memo) {
  if (depth > 4 || n < 0) return '';
  var val     = fibVal(n, memo);
  var colors  = ['var(--gold)','var(--purple-light)','var(--silver)','#7ab','#aab'];
  var color   = colors[Math.min(depth, colors.length - 1)];
  var opacity = Math.max(0.45, 1 - depth * 0.14).toFixed(2);
  var indent  = '';
  for (var i = 0; i < depth * 5; i++) indent += '&nbsp;';

  var html = '<div class="tree-node" style="color:' + color + ';opacity:' + opacity + '">' +
    indent + '<span class="tree-label">F(' + n + ')</span> = <span class="tree-val">' + fmt(val) + '</span>';

  if (n > 1 && depth < 4) {
    html += '<br>' + indent + '<span style="color:var(--text-muted);font-size:0.8em">&nbsp;&nbsp;+-- F(' + (n-1) + ') + F(' + (n-2) + ')</span>';
    html += buildFibTree(n - 1, depth + 1, memo);
    html += buildFibTree(n - 2, depth + 1, memo);
  }
  return html + '</div>';
}

function appendFibTree(treeN) {
  if (treeN < 1 || treeN > 8) return;
  var card = $('result-steps-card');
  if (!card) return;
  var memo = {};
  fibVal(treeN, memo);
  var section = document.createElement('div');
  section.className = 'tree-section';
  section.innerHTML =
    '<hr class="divider" style="margin:1.5rem 0"/>' +
    '<span class="steps-title">&#10022; Recursion Tree &mdash; F(' + treeN + ')</span>' +
    '<div class="tree-container">' + buildFibTree(treeN, 0, memo) + '</div>' +
    '<p style="color:var(--text-muted);font-size:0.8rem;margin-top:0.6rem">Depth capped at 4 levels. Memoization eliminates redundant sub-calls.</p>';
  card.appendChild(section);
}

function showResult(data) {
  State.lastResult = data;

  var titleEl = $('result-title');
  if (titleEl) titleEl.textContent = data.title;

  var seqHTML = '';
  if (data.isBernoulli && data.bernoulliData) {
    seqHTML = '<table class="bern-table" style="margin-top:1rem">' +
      '<thead><tr><th>Index n</th><th>Exact Value</th><th>Decimal Approx</th></tr></thead>' +
      '<tbody>' +
      data.bernoulliData.map(function(d) {
        return '<tr><td>' + d.index + '</td>' +
          '<td style="font-style:italic;color:var(--gold)">' + d.exact + '</td>' +
          '<td style="font-family:monospace;font-size:0.82rem">' + d.approx + '</td></tr>';
      }).join('') +
      '</tbody></table>';
  } else if (data.sequence && data.sequence.length > 0) {
    seqHTML = '<div class="result-sequence">' +
      data.sequence.slice(0, 80).map(function(v, i) {
        var display = (v === '...') ? '<em>...</em>' : fmt(v);
        return '<span class="seq-item" style="animation-delay:' + Math.min(i * 0.025, 1.5) + 's">' + display + '</span>';
      }).join('') + '</div>';
  }

  var rCard = $('result-card');
  if (rCard) {
    rCard.innerHTML =
      '<span class="result-badge">' + data.badge + '</span>' +
      '<div class="result-answer">' + data.answer + '</div>' +
      '<p style="color:var(--text-muted);font-size:0.95rem;margin-top:0.5rem;line-height:1.7">' + data.extra + '</p>' +
      seqHTML +
      (data.isCollatz && data.collatzFull ? renderCollatzViz(data.collatzFull) : '');
  }

  var sCard = $('result-steps-card');
  if (sCard) {
    sCard.innerHTML = '<span class="steps-title">&#10022; Step-by-Step Computation</span>' +
      data.steps.map(function(s, i) {
        return '<div class="step-item" style="animation-delay:' + Math.min(i * 0.04, 1.5) + 's">' +
          '<div class="step-num">' + s.n + '</div>' +
          '<div>' +
            '<div class="step-eq">' + s.eq + '</div>' +
            (s.note ? '<div class="step-note">' + s.note + '</div>' : '') +
          '</div>' +
        '</div>';
      }).join('');

    if (data.showTree && data.treeN) {
      appendFibTree(data.treeN);
    }
  }

  showScreen('result');
  injectResultToolbar();
  sfxSuccess();
  showToast('Complete', data.title + ' computed successfully.', 'success', 3000);
}

function injectResultToolbar() {
  var old = $('result-toolbar');
  if (old) old.remove();

  var actions = document.querySelector('.result-actions');
  if (!actions) return;

  var toolbar = document.createElement('div');
  toolbar.id = 'result-toolbar';
  toolbar.innerHTML =
    '<button class="btn-royal" id="btn-copy-result"  style="padding:0.6rem 1.4rem;font-size:0.8rem">&#9096; Copy Result</button>' +
    '<button class="btn-royal" id="btn-print-result" style="padding:0.6rem 1.4rem;font-size:0.8rem">&#9113; Print Result</button>';
  actions.insertBefore(toolbar, actions.firstChild);
  $('btn-copy-result').addEventListener('click',  copyResult);
  $('btn-print-result').addEventListener('click', printResult);
}

function copyResult() {
  if (!State.lastResult) return;
  var d        = State.lastResult;
  var stepText = d.steps.map(function(s) { return '  [' + s.n + '] ' + s.eq + (s.note ? ' -- ' + s.note : ''); }).join('\n');
  var text     = 'Regnum Mathematica -- ' + d.title + '\n' + '='.repeat(50) + '\n' + d.answer + '\n' + d.extra + '\n\nSteps:\n' + stepText;
  navigator.clipboard.writeText(text)
    .then(function() { showToast('Copied', 'Result copied to clipboard.', 'success', 2500); sfxSuccess(); })
    .catch(function() { showToast('Error', 'Could not access clipboard.', 'error'); sfxError(); });
}

function printResult() {
  var title   = State.lastResult ? State.lastResult.title : 'Result';
  var content = (document.querySelector('.result-main') || {}).innerHTML || '';
  var win     = window.open('', '_blank');
  if (!win) { showToast('Error', 'Pop-up blocked. Allow pop-ups and try again.', 'error'); return; }
  win.document.write('<!DOCTYPE html><html><head>' +
    '<title>Regnum Mathematica -- ' + title + '</title>' +
    '<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Cormorant+Garamond:ital,wght@0,400;1,400&display=swap" rel="stylesheet"/>' +
    '<style>' +
      'body{font-family:\'Cormorant Garamond\',serif;background:#fff;color:#111;padding:2rem;max-width:800px;margin:0 auto}' +
      '.result-badge{font-family:\'Cinzel\',serif;font-size:.7rem;letter-spacing:.2em;text-transform:uppercase;color:#a08020}' +
      '.result-answer{font-family:\'Cinzel\',serif;font-size:1.6rem;color:#a08020;margin:.5rem 0}' +
      '.seq-item{display:inline-block;border:1px solid #d4af37;border-radius:99px;padding:.2rem .5rem;margin:.2rem;font-size:.82rem}' +
      '.step-item{display:flex;gap:.5rem;padding:.4rem 0;border-bottom:1px solid #eee;font-size:.88rem}' +
      '.step-num{min-width:2rem;font-family:\'Cinzel\',serif;font-size:.7rem;color:#a08020}' +
      '.result-actions,#result-toolbar,.result-btns,.result-cta{display:none}' +
      '.bern-table{width:100%;border-collapse:collapse}.bern-table td,.bern-table th{padding:.35rem .7rem;border-bottom:1px solid #eee;font-size:.83rem}' +
      '.collatz-viz,.tree-section{display:none}' +
    '</style></head><body>' +
    '<h2 style="font-family:Cinzel,serif;color:#a08020">Regnum Mathematica</h2>' +
    content +
  '</body></html>');
  win.document.close();
  setTimeout(function() { win.print(); }, 500);
}

function initFloatingSymbols() {
  var glyphs = ['\u2211','\u03C6','\u03C0','\u221E','\u221A','\u0394','\u222B','\u03A9','\u2248','\u2202','\u220F','\u2115','\u2124','\u211D'];
  function spawn() {
    var active = ['menu','computation','result'].some(function(id) {
      var el = $(id); return el && !el.classList.contains('hidden');
    });
    if (!active) { setTimeout(spawn, 1000); return; }
    var g   = document.createElement('div');
    var dur = Math.random() * 10000 + 8000;
    g.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
    g.style.cssText =
      'position:fixed;left:' + (Math.random() * 96 + 2) + '%;bottom:-3rem;z-index:1;' +
      'pointer-events:none;font-family:Cinzel,serif;' +
      'font-size:' + (Math.random() * 1.2 + 0.7).toFixed(1) + 'rem;' +
      'color:rgba(212,175,55,' + (Math.random() * 0.1 + 0.03).toFixed(2) + ');' +
      'animation:float-up ' + dur + 'ms linear forwards;';
    document.body.appendChild(g);
    setTimeout(function() { g.remove(); }, dur + 100);
    setTimeout(spawn, Math.random() * 1800 + 600);
  }
  setTimeout(spawn, 5000);
}

function initSplashTyping() {
  var phrases = [
    'A Royal Mathematical Computation System',
    'Where Numbers Meet Elegance',
    'Seven Algorithms of Mathematical Beauty',
    'Compute with Regal Precision',
  ];
  var pi = 0, ci = 0, deleting = false;
  function tick() {
    var el = document.querySelector('.splash-sub');
    var sp = $('splash');
    if (!el || !sp || sp.classList.contains('hidden')) { setTimeout(tick, 400); return; }
    var phrase = phrases[pi];
    if (!deleting) {
      el.textContent = phrase.slice(0, ++ci);
      if (ci === phrase.length) { deleting = true; setTimeout(tick, 2000); return; }
    } else {
      el.textContent = phrase.slice(0, --ci);
      if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; }
    }
    setTimeout(tick, deleting ? 38 : 68);
  }
  setTimeout(tick, 1200);
}

function initGoldenEgg() {
  var buf = '';
  document.addEventListener('keypress', function(e) {
    buf = (buf + e.key).slice(-6);
    if (buf.toLowerCase() === 'golden') {
      buf = '';
      showToast('\u2726 Golden Ratio', '\u03C6 = (1 + \u221A5) / 2 \u2248 1.6180339887\u2026 The divine proportion hidden within Fibonacci.', 'info', 6000);
      playTone(528, 0.5, 'sine', 0.09);
      setTimeout(function(){ playTone(660, 0.4, 'sine', 0.07); }, 200);
      setTimeout(function(){ playTone(792, 0.5, 'sine', 0.06); }, 420);
    }
  });
}

function initKeyboardShortcuts() {
  document.addEventListener('keydown', function(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    var modal = $('about-modal');
    var comp  = $('computation');
    var res   = $('result');
    switch (e.key) {
      case 'm': case 'M':
        toggleMusic();
        showToast('Music', State.musicPlaying ? 'Resumed.' : 'Paused.', 'info', 1600);
        break;
      case 't': case 'T':
        toggleTheme();
        break;
      case 'Escape':
        if (modal) modal.classList.add('hidden');
        break;
      case '?':
        if (modal) modal.classList.remove('hidden');
        break;
      case 'Backspace':
        if (comp && !comp.classList.contains('hidden')) { e.preventDefault(); showScreen('menu'); sfxNavigate(); }
        else if (res && !res.classList.contains('hidden')) { e.preventDefault(); showScreen('menu'); sfxNavigate(); }
        break;
    }
  });
}

function injectDynamicStyles() {
  var s = document.createElement('style');
  s.textContent =
    '@keyframes ripple-expand { to { transform: scale(1); opacity: 0; } }' +
    '@keyframes float-up { from { transform:translateY(0); opacity:1; } to { transform:translateY(-110vh) rotate(20deg); opacity:0; } }' +
    '@keyframes star-twinkle { 0%{opacity:0;transform:scale(0.5)} 50%{opacity:0.75;transform:scale(1.2)} 100%{opacity:0;transform:scale(0.5)} }' +
    '#compute-progress { position:fixed;top:0;left:0;height:3px;width:0;background:linear-gradient(90deg,var(--gold-dark),var(--gold-light));z-index:9999;border-radius:0 99px 99px 0;transition:width 0.35s ease,opacity 0.3s ease; }' +
    '#shortcut-hint { text-align:center;color:var(--text-muted);font-size:0.77rem;letter-spacing:0.08em;margin-top:1.5rem;font-family:Cinzel,serif; }' +
    '#shortcut-hint kbd { border:1px solid var(--glass-border);padding:0.15rem 0.45rem;border-radius:4px;font-family:Cinzel,serif;background:rgba(212,175,55,0.08);color:var(--gold);font-size:0.75em; }' +
    '#result-toolbar { display:flex;gap:0.75rem;justify-content:center;margin-bottom:1rem;flex-wrap:wrap; }' +
    '.tree-container { background:rgba(0,0,0,0.2);border:1px solid rgba(212,175,55,0.1);border-radius:10px;padding:1rem 1.25rem;overflow-x:auto;font-family:"EB Garamond",serif;font-size:0.9rem;line-height:1.9; }' +
    'body.light-mode .tree-container { background:rgba(0,0,0,0.04); }' +
    '.tree-node { white-space:nowrap;animation:step-slide 0.4s ease both; }' +
    '.tree-label { font-family:Cinzel,serif;font-size:0.85em; }' +
    '.tree-val { color:var(--gold);font-weight:600; }' +
    ':focus-visible { outline:2px solid var(--gold) !important;outline-offset:3px !important; }' +
    ':focus:not(:focus-visible) { outline:none !important; }';
  document.head.appendChild(s);
}

function initStarfield() {
  function spawnStar() {
    var sp = $('splash');
    if (!sp || sp.classList.contains('hidden')) { setTimeout(spawnStar, 500); return; }
    var star = document.createElement('div');
    var dur  = Math.random() * 3000 + 2000;
    star.style.cssText =
      'position:absolute;border-radius:50%;pointer-events:none;z-index:1;' +
      'width:' + (Math.random() * 3 + 1).toFixed(1) + 'px;' +
      'height:' + (Math.random() * 3 + 1).toFixed(1) + 'px;' +
      'left:' + Math.random() * 100 + '%;top:' + Math.random() * 100 + '%;' +
      'background:' + (Math.random() > 0.6 ? '#d4af37' : '#8b5cf6') + ';' +
      'opacity:0;animation:star-twinkle ' + dur + 'ms ease-in-out forwards;';
    sp.appendChild(star);
    setTimeout(function() { star.remove(); }, dur + 100);
    setTimeout(spawnStar, Math.random() * 250 + 80);
  }
  setTimeout(spawnStar, 900);
}

function initInputGuard() {
  document.addEventListener('input', function(e) {
    if (!e.target.classList.contains('form-input')) return;
    var el    = e.target;
    var clean = el.value.replace(/[^0-9\-]/g, '').replace(/(.)-/g, '$1');
    if (clean !== el.value) { el.value = clean; markInvalid(el); }
  });
}

document.addEventListener('DOMContentLoaded', function() {

  injectDynamicStyles();
  initParticles();
  initCursor();
  initRipple();
  initInputGuard();
  initFloatingSymbols();
  initStarfield();
  initSplashTyping();
  initGoldenEgg();
  initKeyboardShortcuts();

  var btnEnter = $('btn-enter');
  if (btnEnter) {
    btnEnter.addEventListener('click', function() {
      sfxNavigate();
      showScreen('menu');
      renderCardGrid();
      var bgMusic = $('bg-music');
      if (bgMusic && !State.musicPlaying) {
        bgMusic.play().then(function() { State.musicPlaying = true; updatePlayBtn(); }).catch(function() {});
      }
    });
  }

  var playPauseBtn = $('play-pause-btn');
  if (playPauseBtn) playPauseBtn.addEventListener('click', toggleMusic);

  var volSlider = $('volume-slider');
  if (volSlider) {
    volSlider.addEventListener('input', function(e) {
      var bgMusic = $('bg-music');
      if (bgMusic) bgMusic.volume = parseFloat(e.target.value);
    });
  }

  document.addEventListener('click', function(e) {
    if (e.target && e.target.classList.contains('theme-toggle-btn')) toggleTheme();
  });

  var aboutBtn   = $('about-btn');
  var modalClose = $('modal-close');
  var aboutModal = $('about-modal');
  if (aboutBtn)   aboutBtn.addEventListener('click', function() { if (aboutModal) aboutModal.classList.remove('hidden'); });
  if (modalClose) modalClose.addEventListener('click', function() { if (aboutModal) aboutModal.classList.add('hidden'); });
  if (aboutModal) aboutModal.addEventListener('click', function(e) { if (e.target === aboutModal) aboutModal.classList.add('hidden'); });

  var compBack = $('comp-back');
  if (compBack) compBack.addEventListener('click', function() { sfxNavigate(); showScreen('menu'); });

  var btnYes = $('btn-yes');
  var btnNo  = $('btn-no');
  if (btnYes) btnYes.addEventListener('click', function() { sfxNavigate(); showScreen('menu'); });
  if (btnNo)  btnNo.addEventListener('click', function() {
    sfxNavigate();
    showScreen('goodbye');
    var bgMusic = $('bg-music');
    if (bgMusic) { bgMusic.pause(); State.musicPlaying = false; updatePlayBtn(); }
    showToast('Farewell', 'Thank you for using Regnum Mathematica.', 'info', 5000);
  });

  var btnRestart = $('btn-restart');
  if (btnRestart) btnRestart.addEventListener('click', function() {
    sfxNavigate();
    var bgMusic = $('bg-music');
    if (bgMusic) bgMusic.play().then(function() { State.musicPlaying = true; updatePlayBtn(); }).catch(function() {});
    showScreen('menu');
    renderCardGrid();
  });

  document.querySelectorAll('.theme-toggle-btn').forEach(function(b) { b.textContent = '\u2600'; });

  
  var bgMusic = $('bg-music');
  if (bgMusic) {
    bgMusic.addEventListener('ended', function() { bgMusic.play().catch(function() {}); });
    if (volSlider) bgMusic.addEventListener('volumechange', function() { volSlider.value = bgMusic.volume; });
  }
});