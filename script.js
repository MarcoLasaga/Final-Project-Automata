'use strict';
const State = {
  currentAlgo: null,
  currentMethod: 'recursive',
  darkMode: true,
  musicPlaying: false,
  lastResult: null,
};
const ALGORITHMS = [
  {
    id: 'fibonacci',
    letter: 'A',
    title: 'Fibonacci Sequence',
    desc: 'The classic sequence where each number is the sum of the two preceding ones, beginning with 0 and 1.',
    formula: 'F(n) = F(n−1) + F(n−2),  F(0)=0,  F(1)=1',
    badge: 'Recursive & Iterative',
    explanation: 'The Fibonacci sequence is one of the most celebrated sequences in mathematics, appearing in nature, art, and architecture. Each term is produced by adding the two terms before it.',
  },
  {
    id: 'lucas',
    letter: 'B',
    title: 'Lucas Sequence',
    desc: 'A companion sequence to Fibonacci with different starting values: L(0)=2, L(1)=1.',
    formula: 'L(n) = L(n−1) + L(n−2),  L(0)=2,  L(1)=1',
    badge: 'Recursive',
    explanation: 'The Lucas sequence follows the same additive rule as Fibonacci but starts with 2 and 1. Named after mathematician Édouard Lucas, it shares deep connections with the golden ratio.',
  },
  {
    id: 'tribonacci',
    letter: 'C',
    title: 'Tribonacci Sequence',
    desc: 'A generalization of Fibonacci where each term is the sum of the three preceding terms.',
    formula: 'T(n) = T(n−1) + T(n−2) + T(n−3),  T(0)=0,  T(1)=0,  T(2)=1',
    badge: 'Recursive',
    explanation: 'The Tribonacci sequence extends the Fibonacci idea from two to three predecessors. It converges to the Tribonacci constant ≈ 1.83928…, analogous to the golden ratio.',
  },
  {
    id: 'collatz',
    letter: 'D',
    title: 'Collatz Conjecture',
    desc: 'An unsolved problem: apply simple rules repeatedly — will you always reach 1?',
    formula: 'n → n/2 (even)  |  n → 3n+1 (odd)',
    badge: 'Visualization',
    explanation: 'The Collatz Conjecture (3n+1 problem) states that starting from any positive integer and applying these two rules, you will always eventually reach 1. Simple to state, yet unproven after decades.',
  },
  {
    id: 'bernoulli',
    letter: 'E',
    title: 'Bernoulli Numbers',
    desc: 'A fundamental sequence in number theory, deeply linked to the Riemann zeta function.',
    formula: 'B(n) = −Σ C(n+1,k)·B(k)/(n+1),  k=0…n−1',
    badge: 'Number Theory',
    explanation: 'Bernoulli numbers appear in Taylor series of many trigonometric functions and in the Euler–Maclaurin formula. They were the first non-trivial sequence computed by Ada Lovelace.',
  },
  {
    id: 'euclidean',
    letter: 'F',
    title: 'Euclidean Division',
    desc: 'Given two integers, compute dividend, divisor, quotient and remainder using the division algorithm.',
    formula: 'a = b·q + r,  0 ≤ r < b',
    badge: 'Division Algorithm',
    explanation: 'The Euclidean Division Algorithm expresses any integer as a multiple of another plus a remainder. It is the foundation of modular arithmetic and forms the basis of the GCD algorithm.',
  },
  {
    id: 'gcd',
    letter: 'G',
    title: 'GCD & LCM Calculator',
    desc: 'Find the Greatest Common Divisor and Least Common Multiple using the Euclidean Algorithm.',
    formula: 'GCD via repeated division;  LCM = (a×b)/GCD',
    badge: 'Euclidean Algorithm',
    explanation: 'The Euclidean Algorithm repeatedly applies division to reduce the problem of finding the GCD. The LCM follows from the identity LCM(a,b) = (a·b)/GCD(a,b).',
  },
];
const $ = id => document.getElementById(id);
const loader       = $('loader');
const splash       = $('splash');
const menu         = $('menu');
const computation  = $('computation');
const result       = $('result');
const goodbye      = $('goodbye');
const aboutModal   = $('about-modal');
const bgMusic      = $('bg-music');
const canvas       = $('particle-canvas');
const toastContainer = $('toast-container');
function fmt(n) {
  if (typeof n === 'string') return n;
  return n.toLocaleString('en-US');
}
function showScreen(id) {
  [splash, menu, computation, result, goodbye].forEach(s => {
    if (s) s.classList.add('hidden');
  });
  const target = $(id);
  if (target) {
    target.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
window.addEventListener('load', () => {
  setTimeout(() => {
    loader.classList.add('fade-out');
    setTimeout(() => {
      loader.style.display = 'none';
      showScreen('splash');
      attemptAutoplay();
    }, 800);
  }, 2600);
});
function attemptAutoplay() {
  bgMusic.volume = 0.4;
  const playPromise = bgMusic.play();
  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        State.musicPlaying = true;
        updatePlayBtn();
        $('autoplay-notice').style.display = 'none';
      })
      .catch(() => {
        State.musicPlaying = false;
        updatePlayBtn();
        $('autoplay-notice').style.display = 'block';
        
        document.addEventListener('click', enableMusicOnClick, { once: true });
      });
  }
}
function enableMusicOnClick() {
  bgMusic.play().then(() => {
    State.musicPlaying = true;
    updatePlayBtn();
    $('autoplay-notice').style.display = 'none';
  }).catch(() => {});
}
function updatePlayBtn() {
  const btn = $('play-pause-btn');
  if (btn) btn.textContent = State.musicPlaying ? '⏸' : '▶';
}
function toggleMusic() {
  if (State.musicPlaying) {
    bgMusic.pause();
    State.musicPlaying = false;
  } else {
    bgMusic.play().catch(() => {});
    State.musicPlaying = true;
  }
  updatePlayBtn();
}
(function initParticles() {
  const ctx = canvas.getContext('2d');
  let W, H, particles;
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  function createParticles() {
    particles = [];
    const count = Math.min(Math.floor(W * H / 14000), 80);
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.8 + 0.3,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.5 + 0.1,
        color: Math.random() > 0.6 ? '#d4af37' : (Math.random() > 0.5 ? '#8b5cf6' : '#c0c8d8'),
      });
    }
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;
    });
    ctx.globalAlpha = 1;
    
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = 'rgba(212,175,55,' + (0.06 * (1 - dist / 100)) + ')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  window.addEventListener('resize', () => { resize(); createParticles(); });
  resize();
  createParticles();
  draw();
})();
(function initCursor() {
  const dot  = $('cursor-dot');
  const ring = $('cursor-ring');
  let rx = 0, ry = 0;
  document.addEventListener('mousemove', e => {
    dot.style.left  = e.clientX + 'px';
    dot.style.top   = e.clientY + 'px';
    
    rx += (e.clientX - rx) * 0.18;
    ry += (e.clientY - ry) * 0.18;
  });
  function animateRing() {
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();
})();
function showToast(title, msg, type = 'info', duration = 4000) {
  const icons = { error: '✕', success: '✓', info: '♛', warning: '⚠' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="toast-icon">${icons[type] || '♛'}</div>
    <div class="toast-body">
      <div class="toast-title">${title}</div>
      <div class="toast-msg">${msg}</div>
    </div>`;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 320);
  }, duration);
}
function toggleTheme() {
  State.darkMode = !State.darkMode;
  document.body.classList.toggle('dark-mode',  State.darkMode);
  document.body.classList.toggle('light-mode', !State.darkMode);
  const icons = document.querySelectorAll('#theme-toggle, #theme-toggle-comp');
  icons.forEach(btn => { btn.textContent = State.darkMode ? '☀' : '☾'; });
  showToast('Theme', State.darkMode ? 'Dark mode activated' : 'Light mode activated', 'info', 2000);
}
function renderCardGrid() {
  const grid = $('card-grid');
  grid.innerHTML = '';
  ALGORITHMS.forEach((algo, i) => {
    const card = document.createElement('div');
    card.className = 'algo-card';
    card.style.animationDelay = (i * 0.08) + 's';
    card.innerHTML = `
      <div class="card-letter">${algo.letter}</div>
      <div class="card-title">${algo.title}</div>
      <div class="card-desc">${algo.desc}</div>
      <div class="card-formula">${algo.formula}</div>
      <span class="card-badge">${algo.badge}</span>`;
    card.addEventListener('click', () => openComputation(algo.id));
    grid.appendChild(card);
  });
}
function openComputation(algoId) {
  State.currentAlgo = algoId;
  const algo = ALGORITHMS.find(a => a.id === algoId);
  $('comp-title').textContent = algo.title;
  $('comp-subtitle').textContent = 'Enter your parameters below';
  renderFormulaCard(algo);
  renderFormCard(algo);
  showScreen('computation');
}
function renderFormulaCard(algo) {
  const card = $('comp-formula-card');
  card.innerHTML = `
    <span class="formula-label">Mathematical Formula</span>
    <div class="formula-display">${algo.formula}</div>
    <p class="formula-explain">${algo.explanation}</p>`;
}
function renderFormCard(algo) {
  const card = $('comp-form-card');
  let html = '';
  switch (algo.id) {
    case 'fibonacci':
      html = `
        <div class="method-selector">
          <button class="method-btn active" data-method="recursive">⟳ Recursive</button>
          <button class="method-btn" data-method="iterative">↺ Iterative</button>
        </div>
        <div class="form-group">
          <label class="form-label" for="fib-n">Enter the nth term (1 – 70)</label>
          <input class="form-input" id="fib-n" type="number" placeholder="e.g. 10" min="1" max="70" />
          <div class="form-hint">Enter a positive integer between 1 and 70.</div>
        </div>
        <button class="btn-royal btn-compute" id="btn-compute">✦ Compute Fibonacci</button>`;
      break;
    case 'lucas':
      html = `
        <div class="form-group">
          <label class="form-label" for="lucas-n">Enter the nth term (1 – 70)</label>
          <input class="form-input" id="lucas-n" type="number" placeholder="e.g. 10" min="1" max="70" />
          <div class="form-hint">The Lucas sequence starts: 2, 1, 3, 4, 7, 11, …</div>
        </div>
        <button class="btn-royal btn-compute" id="btn-compute">✦ Compute Lucas</button>`;
      break;
    case 'tribonacci':
      html = `
        <div class="form-group">
          <label class="form-label" for="trib-n">Enter the nth term (1 – 60)</label>
          <input class="form-input" id="trib-n" type="number" placeholder="e.g. 10" min="1" max="60" />
          <div class="form-hint">The Tribonacci sequence starts: 0, 0, 1, 1, 2, 4, 7, 13, …</div>
        </div>
        <button class="btn-royal btn-compute" id="btn-compute">✦ Compute Tribonacci</button>`;
      break;
    case 'collatz':
      html = `
        <div class="form-group">
          <label class="form-label" for="collatz-n">Enter a positive integer (1 – 100,000)</label>
          <input class="form-input" id="collatz-n" type="number" placeholder="e.g. 27" min="1" max="100000" />
          <div class="form-hint">The algorithm will keep going until it reaches 1.</div>
        </div>
        <button class="btn-royal btn-compute" id="btn-compute">✦ Start Conjecture</button>`;
      break;
    case 'bernoulli':
      html = `
        <div class="form-group">
          <label class="form-label" for="bern-n">Number of Bernoulli numbers to compute (1 – 20)</label>
          <input class="form-input" id="bern-n" type="number" placeholder="e.g. 10" min="1" max="20" />
          <div class="form-hint">Bernoulli numbers with odd index > 1 are zero by convention.</div>
        </div>
        <button class="btn-royal btn-compute" id="btn-compute">✦ Compute Bernoulli Numbers</button>`;
      break;
    case 'euclidean':
      html = `
        <div class="form-group">
          <label class="form-label" for="euc-a">First Integer</label>
          <input class="form-input" id="euc-a" type="number" placeholder="e.g. 47" />
          <div class="form-hint">Enter any non-zero integer.</div>
        </div>
        <div class="form-group">
          <label class="form-label" for="euc-b">Second Integer</label>
          <input class="form-input" id="euc-b" type="number" placeholder="e.g. 13" />
          <div class="form-hint">Enter any non-zero integer different from the first.</div>
        </div>
        <button class="btn-royal btn-compute" id="btn-compute">✦ Apply Division Algorithm</button>`;
      break;
    case 'gcd':
      html = `
        <div class="form-group">
          <label class="form-label" for="gcd-a">First Integer</label>
          <input class="form-input" id="gcd-a" type="number" placeholder="e.g. 252" />
          <div class="form-hint">Enter any positive integer.</div>
        </div>
        <div class="form-group">
          <label class="form-label" for="gcd-b">Second Integer</label>
          <input class="form-input" id="gcd-b" type="number" placeholder="e.g. 198" />
          <div class="form-hint">Enter any positive integer.</div>
        </div>
        <button class="btn-royal btn-compute" id="btn-compute">✦ Calculate GCD & LCM</button>`;
      break;
  }
  card.innerHTML = html;
  attachFormListeners(algo.id);
}
function attachFormListeners(algoId) {
  
  document.querySelectorAll('.method-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.method-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      State.currentMethod = btn.dataset.method;
    });
  });
  
  const computeBtn = $('btn-compute');
  if (computeBtn) {
    computeBtn.addEventListener('click', () => handleCompute(algoId));
  }
  
  document.querySelectorAll('.form-input').forEach(input => {
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') handleCompute(algoId);
    });
  });
}
function getInt(id, min, max, label) {
  const el = $(id);
  const raw = el.value.trim();
  if (raw === '') {
    markInvalid(el);
    showToast('Empty Field', `Please enter a value for ${label}.`, 'error');
    return null;
  }
  if (!/^-?\d+$/.test(raw)) {
    markInvalid(el);
    showToast('Invalid Input', `${label} must be a whole number — no decimals or letters.`, 'error');
    return null;
  }
  const val = parseInt(raw, 10);
  if (min !== null && val < min) {
    markInvalid(el);
    showToast('Out of Range', `${label} must be at least ${fmt(min)}.`, 'error');
    return null;
  }
  if (max !== null && val > max) {
    markInvalid(el);
    showToast('Out of Range', `${label} must be at most ${fmt(max)}.`, 'warning');
    return null;
  }
  markValid(el);
  return val;
}
function markInvalid(el) {
  el.classList.add('invalid');
  el.focus();
  setTimeout(() => el.classList.remove('invalid'), 600);
}
function markValid(el) { el.classList.remove('invalid'); }
function handleCompute(algoId) {
  switch (algoId) {
    case 'fibonacci':  computeFibonacci();  break;
    case 'lucas':      computeLucas();      break;
    case 'tribonacci': computeTribonacci(); break;
    case 'collatz':    computeCollatz();    break;
    case 'bernoulli':  computeBernoulli();  break;
    case 'euclidean':  computeEuclidean();  break;
    case 'gcd':        computeGCD();        break;
  }
}
   ═══════════════════════════════════════════════════════════════ */
function computeFibonacci() {
  const n = getInt('fib-n', 1, 70, 'n-th term');
  if (n === null) return;
  const sequence = [];
  const steps    = [];
  let nthValue;
  if (State.currentMethod === 'recursive') {
    const memo = {};
    function fibRec(k) {
      if (k in memo) return memo[k];
      if (k === 0) return 0;
      if (k === 1) return 1;
      memo[k] = fibRec(k - 1) + fibRec(k - 2);
      return memo[k];
    }
    for (let i = 0; i < n; i++) sequence.push(fibRec(i));
    nthValue = fibRec(n - 1);
    
    if (n <= 15) {
      for (let i = 0; i < n; i++) {
        if (i === 0) steps.push({ n: i, eq: 'F(0) = 0', note: 'Base case' });
        else if (i === 1) steps.push({ n: i, eq: 'F(1) = 1', note: 'Base case' });
        else steps.push({ n: i, eq: `F(${i}) = F(${i-1}) + F(${i-2}) = ${fmt(sequence[i-1])} + ${fmt(sequence[i-2])} = ${fmt(sequence[i])}`, note: 'Recursive step' });
      }
    } else {
      steps.push({ n: 0, eq: 'F(0) = 0', note: 'Base case' });
      steps.push({ n: 1, eq: 'F(1) = 1', note: 'Base case' });
      steps.push({ n: '…', eq: `… recursive calls with memoization …`, note: 'Intermediate steps' });
      steps.push({ n: n-1, eq: `F(${n-1}) = ${fmt(nthValue)}`, note: 'Final answer' });
    }
  } else {
    
    let a = 0, b = 1;
    sequence.push(a);
    if (n > 1) sequence.push(b);
    steps.push({ n: 0, eq: 'F(0) = 0', note: 'Seed value' });
    if (n > 1) steps.push({ n: 1, eq: 'F(1) = 1', note: 'Seed value' });
    for (let i = 2; i < n; i++) {
      const c = a + b;
      if (n <= 15 || i <= 3 || i >= n - 2) {
        steps.push({ n: i, eq: `F(${i}) = ${fmt(b)} + ${fmt(a)} = ${fmt(c)}`, note: 'Iterative step' });
      } else if (i === 4) {
        steps.push({ n: '…', eq: '… iterating …', note: 'Skipped for brevity' });
      }
      sequence.push(c);
      a = b; b = c;
    }
    nthValue = sequence[n - 1];
  }
  const resultData = {
    title:    'Fibonacci Sequence',
    badge:    `Method: ${State.currentMethod === 'recursive' ? 'Recursive (Memoized)' : 'Iterative'}`,
    answer:   `F(${n-1}) = ${fmt(nthValue)}`,
    sequence,
    steps,
    extra: `The ${n}-term Fibonacci sequence has been computed. The ${n}th value is ${fmt(nthValue)}.`,
  };
  showResult(resultData);
}
function computeLucas() {
  const n = getInt('lucas-n', 1, 70, 'n-th term');
  if (n === null) return;
  const memo = {};
  function lucasRec(k) {
    if (k in memo) return memo[k];
    if (k === 0) return 2;
    if (k === 1) return 1;
    memo[k] = lucasRec(k - 1) + lucasRec(k - 2);
    return memo[k];
  }
  const sequence = [];
  const steps    = [];
  for (let i = 0; i < n; i++) sequence.push(lucasRec(i));
  const nthValue = lucasRec(n - 1);
  if (n <= 15) {
    for (let i = 0; i < n; i++) {
      if (i === 0) steps.push({ n: 0, eq: 'L(0) = 2', note: 'Base case (differs from Fibonacci)' });
      else if (i === 1) steps.push({ n: 1, eq: 'L(1) = 1', note: 'Base case' });
      else steps.push({ n: i, eq: `L(${i}) = L(${i-1}) + L(${i-2}) = ${fmt(sequence[i-1])} + ${fmt(sequence[i-2])} = ${fmt(sequence[i])}`, note: 'Recursive step' });
    }
  } else {
    steps.push({ n: 0, eq: 'L(0) = 2', note: 'Base case' });
    steps.push({ n: 1, eq: 'L(1) = 1', note: 'Base case' });
    steps.push({ n: '…', eq: '… memoized recursion …', note: '' });
    steps.push({ n: n-1, eq: `L(${n-1}) = ${fmt(nthValue)}`, note: 'Final answer' });
  }
  showResult({
    title:    'Lucas Sequence',
    badge:    'Method: Recursive (Memoized)',
    answer:   `L(${n-1}) = ${fmt(nthValue)}`,
    sequence,
    steps,
    extra: `The Lucas sequence up to term ${n} has been computed.`,
  });
}
function computeTribonacci() {
  const n = getInt('trib-n', 1, 60, 'n-th term');
  if (n === null) return;
  const memo = {};
  function tribRec(k) {
    if (k in memo) return memo[k];
    if (k === 0 || k === 1) return 0;
    if (k === 2) return 1;
    memo[k] = tribRec(k-1) + tribRec(k-2) + tribRec(k-3);
    return memo[k];
  }
  const sequence = [];
  const steps    = [];
  for (let i = 0; i < n; i++) sequence.push(tribRec(i));
  const nthValue = tribRec(n - 1);
  steps.push({ n: 0, eq: 'T(0) = 0', note: 'Base case' });
  if (n > 1) steps.push({ n: 1, eq: 'T(1) = 0', note: 'Base case' });
  if (n > 2) steps.push({ n: 2, eq: 'T(2) = 1', note: 'Base case' });
  for (let i = 3; i < Math.min(n, 12); i++) {
    steps.push({ n: i, eq: `T(${i}) = T(${i-1}) + T(${i-2}) + T(${i-3}) = ${fmt(sequence[i-1])} + ${fmt(sequence[i-2])} + ${fmt(sequence[i-3])} = ${fmt(sequence[i])}`, note: 'Recursive step' });
  }
  if (n > 12) {
    steps.push({ n: '…', eq: '… continuing via memoized recursion …', note: '' });
    steps.push({ n: n-1, eq: `T(${n-1}) = ${fmt(nthValue)}`, note: 'Final answer' });
  }
  showResult({
    title:    'Tribonacci Sequence',
    badge:    'Method: Recursive (Memoized)',
    answer:   `T(${n-1}) = ${fmt(nthValue)}`,
    sequence,
    steps,
    extra: `Each Tribonacci term sums the three preceding terms.`,
  });
}
function computeCollatz() {
  const n = getInt('collatz-n', 1, 100000, 'starting integer');
  if (n === null) return;
  const seq   = [n];
  const steps = [];
  let   cur   = n;
  let   count = 0;
  while (cur !== 1) {
    if (cur % 2 === 0) {
      const prev = cur;
      cur = cur / 2;
      if (count < 20 || cur === 1) {
        steps.push({ n: count + 1, eq: `${fmt(prev)} is even → ${fmt(prev)} ÷ 2 = ${fmt(cur)}`, note: '' });
      } else if (count === 20) {
        steps.push({ n: '…', eq: '… sequence continues …', note: 'Showing first 20 and last steps' });
      }
    } else {
      const prev = cur;
      cur = 3 * cur + 1;
      if (count < 20 || cur === 1) {
        steps.push({ n: count + 1, eq: `${fmt(prev)} is odd → 3×${fmt(prev)} + 1 = ${fmt(cur)}`, note: '' });
      }
    }
    seq.push(cur);
    count++;
    if (count > 1000000) { showToast('Overflow', 'Sequence exceeded 1,000,000 steps!', 'error'); return; }
  }
  
  State.collatzSeq = seq;
  showResult({
    title:    'Collatz Conjecture',
    badge:    `Starting Value: ${fmt(n)}`,
    answer:   `Reached 1 in ${fmt(count)} steps`,
    sequence: seq.length <= 100 ? seq : [...seq.slice(0, 50), '…', ...seq.slice(-10)],
    steps,
    extra: `The maximum value reached was ${fmt(Math.max(...seq))}.`,
    isCollatz: true,
    collatzFull: seq,
  });
}
function computeBernoulli() {
  const n = getInt('bern-n', 1, 20, 'count');
  if (n === null) return;
  
  function binomial(n, k) {
    if (k === 0 || k === n) return 1;
    let result = 1;
    for (let i = 0; i < k; i++) result = result * (n - i) / (i + 1);
    return Math.round(result);
  }
  
  
  const B = [1]; 
  const EXACT = ['1'];
  for (let m = 1; m < n; m++) {
    let sum = 0;
    for (let k = 0; k < m; k++) sum += binomial(m + 1, k) * B[k];
    B[m] = -sum / (m + 1);
    
    const knownFracs = ['1', '-1/2', '1/6', '0', '-1/30', '0', '1/42', '0', '-1/30', '0', '5/66', '0', '-691/2730', '0', '7/6', '0', '-3617/510', '0', '43867/798', '0'];
    EXACT.push(m < knownFracs.length ? knownFracs[m] : B[m].toPrecision(6));
  }
  const steps = B.map((val, i) => ({
    n: i,
    eq: `B(${i}) = ${EXACT[i]}  ≈  ${val.toFixed(6)}`,
    note: i === 0 ? 'By convention' : (i % 2 === 1 && i > 1) ? 'Always 0 for odd index > 1' : 'Computed via recurrence',
  }));
  showResult({
    title:    'Bernoulli Numbers',
    badge:    `First ${n} Bernoulli Numbers`,
    answer:   `B(0) through B(${n-1}) computed`,
    sequence: B.map((v, i) => `B(${i})=${EXACT[i]}`),
    steps,
    extra:    'Bernoulli numbers with odd index greater than 1 are always zero.',
    isBernoulli: true,
    bernoulliData: B.map((v, i) => ({ index: i, exact: EXACT[i], approx: v.toFixed(8) })),
  });
}
function computeEuclidean() {
  const aRaw = getInt('euc-a', null, null, 'first integer');
  if (aRaw === null) return;
  const bRaw = getInt('euc-b', null, null, 'second integer');
  if (bRaw === null) return;
  if (aRaw === 0 && bRaw === 0) {
    showToast('Invalid Input', 'Both integers cannot be zero.', 'error');
    markInvalid($('euc-a')); markInvalid($('euc-b'));
    return;
  }
  if (bRaw === 0) {
    showToast('Division by Zero', 'The divisor cannot be zero.', 'error');
    markInvalid($('euc-b'));
    return;
  }
  if (aRaw === 0) {
    showToast('Invalid Input', 'The dividend cannot be zero.', 'error');
    markInvalid($('euc-a'));
    return;
  }
  
  const dubaichewychocolate = aRaw;
  const ilocosempanada      = bRaw;
  const dividend  = Math.max(dubaichewychocolate, ilocosempanada);
  const divisor   = Math.min(dubaichewychocolate, ilocosempanada);
  const quotient  = Math.trunc(dividend / divisor);
  const remainder = dividend % divisor;
  const equation = `${fmt(dividend)} = ${fmt(divisor)} (${fmt(quotient)}) + ${fmt(remainder)}`;
  const steps = [
    { n: 1, eq: `Inputs: ${fmt(aRaw)} and ${fmt(bRaw)}`, note: 'As entered' },
    { n: 2, eq: `Dividend = max(${fmt(aRaw)}, ${fmt(bRaw)}) = ${fmt(dividend)}`, note: 'Larger number becomes dividend' },
    { n: 3, eq: `Divisor  = min(${fmt(aRaw)}, ${fmt(bRaw)}) = ${fmt(divisor)}`, note: 'Smaller number becomes divisor' },
    { n: 4, eq: `Quotient  = ${fmt(dividend)} ÷ ${fmt(divisor)} = ${fmt(quotient)}`, note: 'Integer division' },
    { n: 5, eq: `Remainder = ${fmt(dividend)} mod ${fmt(divisor)} = ${fmt(remainder)}`, note: 'Modulo operation' },
    { n: 6, eq: equation, note: 'Final Euclidean form: a = b(q) + r' },
    { n: 7, eq: `Dividend: ${fmt(dividend)}`, note: '' },
    { n: 8, eq: `Divisor: ${fmt(divisor)}`, note: '' },
    { n: 9, eq: `Quotient: ${fmt(quotient)}`, note: '' },
    { n: 10, eq: `Remainder: ${fmt(remainder)}`, note: '' },
  ];
  showResult({
    title:    'Euclidean Division Algorithm',
    badge:    'Division Algorithm',
    answer:   equation,
    sequence: [],
    steps,
    extra:    `The quotient is ${fmt(quotient)} and the remainder is ${fmt(remainder)}.`,
  });
}
function computeGCD() {
  const xRaw = getInt('gcd-a', null, null, 'first integer');
  if (xRaw === null) return;
  const yRaw = getInt('gcd-b', null, null, 'second integer');
  if (yRaw === null) return;
  if (xRaw <= 0 || yRaw <= 0) {
    if (xRaw <= 0) markInvalid($('gcd-a'));
    if (yRaw <= 0) markInvalid($('gcd-b'));
    showToast('Invalid Input', 'Both integers must be positive.', 'error');
    return;
  }
  if (xRaw === yRaw) {
    showToast('Note', 'Both integers are equal. GCD = LCM = the number itself.', 'info');
  }
  
  const x = xRaw, y = yRaw;
  const a = Math.max(x, y);
  const b = Math.min(x, y);
  let dividend = a;
  let divisor  = b;
  let gcd      = 0;
  const steps  = [];
  while (divisor !== 0) {
    const q = Math.trunc(dividend / divisor);
    const r = dividend % divisor;
    if (r === 0) {
      steps.push({ n: steps.length + 1, eq: `${fmt(dividend)} = ${fmt(divisor)} (${fmt(q)})`, note: 'Remainder is 0 → GCD found' });
      gcd = divisor;
    } else {
      steps.push({ n: steps.length + 1, eq: `${fmt(dividend)} = ${fmt(divisor)} (${fmt(q)}) + ${fmt(r)}`, note: `Continue with ${fmt(divisor)} and ${fmt(r)}` });
    }
    dividend = divisor;
    divisor  = r;
  }
  const lcm = (a * b) / gcd;
  steps.push({ n: '✦', eq: `Integers: ${fmt(a)} and ${fmt(b)}`, note: '' });
  steps.push({ n: '✦', eq: `GCD = ${fmt(gcd)}`, note: 'Greatest Common Divisor' });
  steps.push({ n: '✦', eq: `LCM = (${fmt(a)} × ${fmt(b)}) ÷ ${fmt(gcd)} = ${fmt(lcm)}`, note: 'Least Common Multiple' });
  showResult({
    title:    'GCD & LCM Calculator',
    badge:    `Integers: ${fmt(a)} and ${fmt(b)}`,
    answer:   `GCD = ${fmt(gcd)}   |   LCM = ${fmt(lcm)}`,
    sequence: [],
    steps,
    extra:    `GCD(${fmt(a)}, ${fmt(b)}) = ${fmt(gcd)}  ·  LCM(${fmt(a)}, ${fmt(b)}) = ${fmt(lcm)}`,
  });
}
function showResult(data) {
  State.lastResult = data;
  $('result-title').textContent = data.title;
  
  const rCard = $('result-card');
  let seqHTML = '';
  if (data.sequence && data.sequence.length > 0 && !data.isBernoulli) {
    const display = data.sequence.slice(0, 80);
    seqHTML = `<div class="result-sequence">` +
      display.map((v, i) => `<span class="seq-item" style="animation-delay:${i * 0.03}s">${v}</span>`).join('') +
      `</div>`;
  }
  if (data.isBernoulli && data.bernoulliData) {
    seqHTML = `<table class="bern-table" style="margin-top:1rem">
      <thead><tr><th>Index n</th><th>Exact Value</th><th>Decimal Approx</th></tr></thead>
      <tbody>
        ${data.bernoulliData.map(d => `<tr><td>${d.index}</td><td>${d.exact}</td><td>${d.approx}</td></tr>`).join('')}
      </tbody>
    </table>`;
  }
  rCard.innerHTML = `
    <span class="result-badge">${data.badge}</span>
    <div class="result-answer">${data.answer}</div>
    <p style="color:var(--text-muted);font-size:0.95rem;margin-top:0.5rem">${data.extra}</p>
    ${seqHTML}
    ${data.isCollatz && data.collatzFull ? renderCollatzViz(data.collatzFull) : ''}`;
  
  const sCard = $('result-steps-card');
  sCard.innerHTML = `
    <span class="steps-title">✦ Step-by-Step Computation</span>
    ${data.steps.map((s, i) => `
      <div class="step-item" style="animation-delay:${i * 0.05}s">
        <div class="step-num">${s.n}</div>
        <div>
          <div class="step-eq">${s.eq}</div>
          ${s.note ? `<div class="step-note">${s.note}</div>` : ''}
        </div>
      </div>`).join('')}`;
  showScreen('result');
  showToast('Computation Complete', `${data.title} result is ready.`, 'success', 3000);
}
function renderCollatzViz(seq) {
  if (seq.length > 500) return `<p style="color:var(--text-muted);margin-top:1rem;font-size:0.85rem">Sequence too long for bar chart (${fmt(seq.length)} steps). Showing numerical sequence above.</p>`;
  const max = Math.max(...seq);
  const bars = seq.map((v, i) => {
    const h = Math.max(4, Math.round((v / max) * 140));
    return `<div class="collatz-bar" style="height:${h}px;animation-delay:${i*0.01}s" title="${fmt(v)}"></div>`;
  }).join('');
  return `
    <div style="margin-top:1.5rem">
      <span class="steps-title">✦ Sequence Visualization</span>
      <div class="collatz-viz"><div class="collatz-bars">${bars}</div></div>
      <p style="color:var(--text-muted);font-size:0.8rem;margin-top:0.4rem">Each bar represents one value in the Collatz sequence.</p>
    </div>`;
}
document.addEventListener('DOMContentLoaded', () => {
  $('btn-enter').addEventListener('click', () => {
    showScreen('menu');
    renderCardGrid();
    if (!State.musicPlaying) {
      bgMusic.play().then(() => { State.musicPlaying = true; updatePlayBtn(); }).catch(() => {});
    }
  });
  $('play-pause-btn').addEventListener('click', toggleMusic);
  $('volume-slider').addEventListener('input', e => {
    bgMusic.volume = parseFloat(e.target.value);
  });
  $('theme-toggle').addEventListener('click', toggleTheme);
  $('theme-toggle-comp') && $('theme-toggle-comp').addEventListener('click', toggleTheme);
  $('about-btn').addEventListener('click', () => { aboutModal.classList.remove('hidden'); });
  $('modal-close').addEventListener('click', () => { aboutModal.classList.add('hidden'); });
  aboutModal.addEventListener('click', e => { if (e.target === aboutModal) aboutModal.classList.add('hidden'); });
  $('comp-back').addEventListener('click', () => {
    showScreen('menu');
  });
  $('btn-yes').addEventListener('click', () => {
    showScreen('menu');
  });
  $('btn-no').addEventListener('click', () => {
    showScreen('goodbye');
    bgMusic.pause();
    State.musicPlaying = false;
    showToast('Farewell', 'Thank you for using Regnum Mathematica.', 'info', 5000);
  });
  $('btn-restart').addEventListener('click', () => {
    bgMusic.play().then(() => { State.musicPlaying = true; updatePlayBtn(); }).catch(() => {});
    showScreen('menu');
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') aboutModal.classList.add('hidden');
  });
});
bgMusic.addEventListener('ended', () => { bgMusic.play().catch(() => {}); });
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) audioCtx = new AudioCtx();
  return audioCtx;
}
function playTone(freq = 440, dur = 0.12, type = 'sine', gainVal = 0.18) {
  try {
    const ctx  = getAudioCtx();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type      = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(gainVal, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + dur);
  } catch (_) {  }
}
function sfxCardClick()   { playTone(523.25, 0.18, 'sine', 0.15); }
function sfxSuccess()     { playTone(659.25, 0.10, 'sine', 0.12); setTimeout(() => playTone(783.99, 0.14, 'sine', 0.10), 100); }
function sfxError()       { playTone(180, 0.18, 'square', 0.08); }
function sfxHover()       { playTone(880, 0.04, 'sine', 0.06); }
function sfxNavigate()    { playTone(392, 0.09, 'triangle', 0.10); }
function attachSFX() {
  
  document.querySelectorAll('.algo-card').forEach(card => {
    card.addEventListener('click', sfxCardClick);
  });
  
  document.querySelectorAll('.btn-royal, .btn-icon, .method-btn, .music-btn').forEach(btn => {
    btn.addEventListener('mouseenter', sfxHover);
    btn.addEventListener('click', sfxNavigate);
  });
  
}
const _origRenderCardGrid = renderCardGrid;
window.renderCardGridWithSFX = function () {
  _origRenderCardGrid();
  attachSFX();
};
document.addEventListener('click', function (e) {
  const btn = e.target.closest('.btn-royal, .algo-card');
  if (!btn) return;
  const ripple   = document.createElement('span');
  const rect     = btn.getBoundingClientRect();
  const size     = Math.max(rect.width, rect.height) * 1.5;
  const x        = e.clientX - rect.left - size / 2;
  const y        = e.clientY - rect.top  - size / 2;
  ripple.style.cssText = `
    position:absolute; border-radius:50%; pointer-events:none;
    width:${size}px; height:${size}px; left:${x}px; top:${y}px;
    background:rgba(212,175,55,0.25);
    transform:scale(0); animation:ripple-expand 0.55s ease-out forwards;`;
  
  const pos = getComputedStyle(btn).position;
  if (pos === 'static') btn.style.position = 'relative';
  btn.style.overflow = 'hidden';
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
}, true);
(function injectRippleStyle() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes ripple-expand {
      to { transform: scale(1); opacity: 0; }
    }`;
  document.head.appendChild(style);
})();
function buildFibTree(n, depth = 0, memo = {}) {
  if (depth > 5 || n < 0) return '';          
  const indent  = '&nbsp;'.repeat(depth * 4);
  const val     = fibVal(n, memo);
  const color   = depth === 0 ? 'var(--gold)' : (depth === 1 ? 'var(--purple-light)' : 'var(--silver)');
  const opacity = Math.max(0.4, 1 - depth * 0.15);
  let html = `<div class="tree-node" style="color:${color};opacity:${opacity};animation-delay:${depth * 0.08}s">
    ${indent}<span class="tree-label">F(${n})</span> = <span class="tree-val">${fmt(val)}</span>`;
  if (n > 1 && depth < 4) {
    html += `
    ${indent}<span style="color:var(--text-muted);font-size:0.8em">├── F(${n-1}) + F(${n-2})</span>`;
    html += buildFibTree(n - 1, depth + 1, memo);
    html += buildFibTree(n - 2, depth + 1, memo);
  }
  html += `</div>`;
  return html;
}
function fibVal(n, memo = {}) {
  if (n in memo) return memo[n];
  if (n <= 0) return 0;
  if (n === 1) return 1;
  memo[n] = fibVal(n - 1, memo) + fibVal(n - 2, memo);
  return memo[n];
}
function appendFibTree(n) {
  if (n < 2 || n > 8) return;   
  const card = $('result-steps-card');
  if (!card) return;
  const treeHTML = buildFibTree(n - 1, 0, {});
  const section  = document.createElement('div');
  section.className = 'tree-section';
  section.innerHTML = `
    <hr class="divider" style="margin:1.5rem 0"/>
    <span class="steps-title">✦ Recursion Tree  <span style="font-size:0.7em;color:var(--text-muted)">(F(${n-1}))</span></span>
    <div class="tree-container">${treeHTML}</div>
    <p style="color:var(--text-muted);font-size:0.8rem;margin-top:0.75rem">
      Tree depth capped at 4 levels for readability. Memoization avoids redundant calls.
    </p>`;
  card.appendChild(section);
}
function injectResultToolbar() {
  const actions = document.querySelector('.result-actions');
  if (!actions || document.getElementById('result-toolbar')) return;
  const toolbar = document.createElement('div');
  toolbar.id = 'result-toolbar';
  toolbar.style.cssText = 'display:flex;gap:0.75rem;justify-content:center;margin-bottom:1rem;flex-wrap:wrap;';
  toolbar.innerHTML = `
    <button class="btn-royal" id="btn-copy-result"  style="padding:0.6rem 1.4rem;font-size:0.8rem">⎘ Copy Result</button>
    <button class="btn-royal" id="btn-print-result" style="padding:0.6rem 1.4rem;font-size:0.8rem">⎙ Print Result</button>`;
  actions.insertBefore(toolbar, actions.firstChild);
  $('btn-copy-result').addEventListener('click', copyResult);
  $('btn-print-result').addEventListener('click', printResult);
}
function copyResult() {
  if (!State.lastResult) return;
  const { title, answer, extra } = State.lastResult;
  const steps = State.lastResult.steps
    .map(s => `  Step ${s.n}: ${s.eq}${s.note ? '  [' + s.note + ']' : ''}`)
    .join('\n');
  const text = `Regnum Mathematica — ${title}\n${'═'.repeat(50)}\n${answer}\n${extra}\n\nStep-by-Step:\n${steps}`;
  navigator.clipboard.writeText(text)
    .then(() => { showToast('Copied', 'Result copied to clipboard.', 'success', 2500); sfxSuccess(); })
    .catch(() => { showToast('Error', 'Could not access clipboard.', 'error'); sfxError(); });
}
function printResult() {
  const title   = State.lastResult?.title || 'Result';
  const content = document.querySelector('.result-main')?.innerHTML || '';
  const win = window.open('', '_blank');
  win.document.write(`<!DOCTYPE html><html><head>
    <title>Regnum Mathematica — ${title}</title>
    <link href="https:
    <style>
      body { font-family:'Cormorant Garamond',serif; background:#fff; color:#111; padding:2rem; max-width:800px; margin:0 auto; }
      h2   { font-family:'Cinzel',serif; color:#a08020; }
      .result-badge { font-family:'Cinzel',serif; font-size:0.7rem; letter-spacing:0.2em; text-transform:uppercase; color:#a08020; }
      .result-answer { font-family:'Cinzel',serif; font-size:1.8rem; color:#a08020; margin:0.5rem 0; }
      .seq-item { display:inline-block; border:1px solid #d4af37; border-radius:99px; padding:0.2rem 0.6rem; margin:0.2rem; font-size:0.85rem; }
      .step-item { display:flex; gap:0.75rem; padding:0.5rem 0; border-bottom:1px solid #eee; font-size:0.9rem; }
      .step-num  { min-width:2rem; font-family:'Cinzel',serif; font-size:0.7rem; color:#a08020; }
      .result-actions, #result-toolbar, .result-btns, .result-cta { display:none; }
      .bern-table { width:100%; border-collapse:collapse; } .bern-table td,.bern-table th { padding:0.4rem 0.8rem; border-bottom:1px solid #eee; font-size:0.85rem; }
      .collatz-viz { display:none; }
      .tree-section { font-family:monospace; font-size:0.8rem; }
      @media print { body { padding:0; } }
    </style>
  </head><body>
    <h2>Regnum Mathematica</h2>
    ${content}
  </body></html>`);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);
}
(function goldenEasterEgg() {
  let buffer = '';
  const secret = 'golden';
  document.addEventListener('keypress', e => {
    buffer = (buffer + e.key).slice(-secret.length);
    if (buffer.toLowerCase() === secret) {
      buffer = '';
      showToast(
        '✦ Golden Ratio',
        'φ = (1 + √5) / 2 ≈ 1.6180339887… — The divine proportion hidden within Fibonacci.',
        'info',
        6000
      );
      playTone(528, 0.5, 'sine', 0.12);
      setTimeout(() => playTone(660, 0.4, 'sine', 0.10), 200);
      setTimeout(() => playTone(792, 0.6, 'sine', 0.08), 400);
    }
  });
})();
document.addEventListener('keydown', e => {
  
  if (e.target.tagName === 'INPUT') return;
  switch (e.key) {
    case 'm': case 'M':
      
      toggleMusic();
      showToast('Music', State.musicPlaying ? 'Music resumed.' : 'Music paused.', 'info', 1800);
      break;
    case 't': case 'T':
      
      toggleTheme();
      break;
    case 'Backspace':
      
      if (!computation.classList.contains('hidden')) {
        showScreen('menu');
        sfxNavigate();
      } else if (!result.classList.contains('hidden')) {
        showScreen('menu');
        sfxNavigate();
      }
      break;
    case '?':
      
      aboutModal.classList.remove('hidden');
      break;
  }
});
function animateCounter(el, target, duration = 800) {
  if (typeof target !== 'number' || isNaN(target) || !isFinite(target)) return;
  const start = performance.now();
  const from  = 0;
  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = fmt(Math.round(from + (target - from) * eased));
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
const _baseShowResult = showResult;
function showResult(data) {
  State.lastResult = data;
  $('result-title').textContent = data.title;
  const rCard = $('result-card');
  let seqHTML = '';
  if (data.sequence && data.sequence.length > 0 && !data.isBernoulli) {
    const display = data.sequence.slice(0, 80);
    seqHTML = `<div class="result-sequence">` +
      display.map((v, i) =>
        `<span class="seq-item" style="animation-delay:${i * 0.03}s">${v === '…' ? '<em>…</em>' : fmt(v)}</span>`
      ).join('') +
      `</div>`;
  }
  if (data.isBernoulli && data.bernoulliData) {
    seqHTML = `<table class="bern-table" style="margin-top:1rem">
      <thead><tr><th>Index n</th><th>Exact Value</th><th>Decimal Approx</th></tr></thead>
      <tbody>
        ${data.bernoulliData.map(d =>
          `<tr><td>${d.index}</td><td style="font-style:italic;color:var(--gold)">${d.exact}</td><td style="font-family:monospace;font-size:0.85rem">${d.approx}</td></tr>`
        ).join('')}
      </tbody>
    </table>`;
  }
  rCard.innerHTML = `
    <span class="result-badge">${data.badge}</span>
    <div class="result-answer" id="result-answer-text">${data.answer}</div>
    <p style="color:var(--text-muted);font-size:0.95rem;margin-top:0.5rem;line-height:1.7">${data.extra}</p>
    ${seqHTML}
    ${data.isCollatz && data.collatzFull ? renderCollatzViz(data.collatzFull) : ''}`;
  const sCard = $('result-steps-card');
  sCard.innerHTML = `
    <span class="steps-title">✦ Step-by-Step Computation</span>
    ${data.steps.map((s, i) => `
      <div class="step-item" style="animation-delay:${i * 0.05}s">
        <div class="step-num">${s.n}</div>
        <div>
          <div class="step-eq">${s.eq}</div>
          ${s.note ? `<div class="step-note">${s.note}</div>` : ''}
        </div>
      </div>`).join('')}`;
  if (data.id === 'fibonacci' || State.currentAlgo === 'fibonacci') {
    const nVal = data.steps.length;
    appendFibTree(Math.min(nVal, 8));
  }
  showScreen('result');
  injectResultToolbar();
  sfxSuccess();
  showToast('Computation Complete', `${data.title} computed successfully.`, 'success', 3000);
}
function renderCardGrid() {
  const grid = $('card-grid');
  grid.innerHTML = '';
  ALGORITHMS.forEach((algo, i) => {
    const card = document.createElement('div');
    card.className = 'algo-card';
    card.style.animationDelay = (i * 0.08) + 's';
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `Open ${algo.title}`);
    card.innerHTML = `
      <div class="card-letter">${algo.letter}</div>
      <div class="card-title">${algo.title}</div>
      <div class="card-desc">${algo.desc}</div>
      <div class="card-formula">${algo.formula}</div>
      <span class="card-badge">${algo.badge}</span>`;
    card.addEventListener('click', () => {
      sfxCardClick();
      openComputation(algo.id);
    });
    
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        sfxCardClick();
        openComputation(algo.id);
      }
    });
    grid.appendChild(card);
  });
  if (!$('shortcut-hint')) {
    const hint = document.createElement('div');
    hint.id = 'shortcut-hint';
    hint.style.cssText = 'text-align:center;color:var(--text-muted);font-size:0.78rem;letter-spacing:0.1em;margin-top:1.5rem;font-family:Cinzel,serif;';
    hint.innerHTML = `
      <kbd style="border:1px solid var(--glass-border);padding:0.15rem 0.5rem;border-radius:4px">M</kbd> Music &nbsp;·&nbsp;
      <kbd style="border:1px solid var(--glass-border);padding:0.15rem 0.5rem;border-radius:4px">T</kbd> Theme &nbsp;·&nbsp;
      <kbd style="border:1px solid var(--glass-border);padding:0.15rem 0.5rem;border-radius:4px">?</kbd> About &nbsp;·&nbsp;
      Type <kbd style="border:1px solid var(--glass-border);padding:0.15rem 0.5rem;border-radius:4px">golden</kbd> for a secret`;
    $('card-grid').after(hint);
  }
}
(function splashTyping() {
  const phrases = [
    'A Royal Mathematical Computation System',
    'Where Numbers Meet Elegance',
    'Seven Algorithms of Mathematical Beauty',
    'Compute with Regal Precision',
  ];
  let pi = 0, ci = 0, deleting = false, el;
  function tick() {
    el = document.querySelector('.splash-sub');
    if (!el || !splash || splash.classList.contains('hidden')) {
      setTimeout(tick, 300);
      return;
    }
    const phrase = phrases[pi];
    if (!deleting) {
      el.textContent = phrase.slice(0, ci + 1);
      ci++;
      if (ci === phrase.length) { deleting = true; setTimeout(tick, 2200); return; }
    } else {
      el.textContent = phrase.slice(0, ci - 1);
      ci--;
      if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; }
    }
    setTimeout(tick, deleting ? 40 : 72);
  }
  
  setTimeout(tick, 3200);
})();
document.addEventListener('focusin', e => {
  if (e.target.classList.contains('form-input')) {
    e.target.style.boxShadow = '0 0 0 3px rgba(212,175,55,0.18), 0 0 16px rgba(212,175,55,0.10)';
  }
});
document.addEventListener('focusout', e => {
  if (e.target.classList.contains('form-input')) {
    e.target.style.boxShadow = '';
  }
});
document.addEventListener('keypress', e => {
  if (!e.target.classList.contains('form-input')) return;
  const allowed = /[\d\-]/;
  if (!allowed.test(e.key) && !['Backspace','Delete','ArrowLeft','ArrowRight','Tab','Enter'].includes(e.key)) {
    e.preventDefault();
    markInvalid(e.target);
    sfxError();
    showToast('Invalid Character', 'Please enter digits only.', 'error', 2000);
  }
}, true);
(function starfield() {
  const splashEl = document.getElementById('splash');
  if (!splashEl) return;
  function spawnStar() {
    if (splashEl.classList.contains('hidden')) { setTimeout(spawnStar, 800); return; }
    const star       = document.createElement('div');
    const size       = Math.random() * 3 + 1;
    const x          = Math.random() * 100;
    const y          = Math.random() * 100;
    const dur        = Math.random() * 3000 + 2000;
    star.style.cssText = `
      position:absolute; border-radius:50%; pointer-events:none; z-index:1;
      width:${size}px; height:${size}px; left:${x}%; top:${y}%;
      background:${Math.random() > 0.6 ? '#d4af37' : '#8b5cf6'};
      opacity:0; animation:star-twinkle ${dur}ms ease-in-out forwards;`;
    splashEl.appendChild(star);
    setTimeout(() => star.remove(), dur + 100);
    setTimeout(spawnStar, Math.random() * 300 + 100);
  }
  const s = document.createElement('style');
  s.textContent = `@keyframes star-twinkle {
    0%   { opacity:0; transform:scale(0.5); }
    50%  { opacity:0.8; transform:scale(1.2); }
    100% { opacity:0; transform:scale(0.5); }
  }`;
  document.head.appendChild(s);
  setTimeout(spawnStar, 3400);
})();
(function floatingSymbols() {
  const glyphs = ['∑', 'φ', 'π', '∞', '√', 'Δ', '∫', 'Ω', '≈', '∂', '∏', 'ℕ', 'ℤ', 'ℝ'];
  function spawnGlyph() {
    const screens = [menu, computation, result];
    const active  = screens.find(s => s && !s.classList.contains('hidden'));
    if (!active) { setTimeout(spawnGlyph, 1200); return; }
    const g   = document.createElement('div');
    const dur = Math.random() * 10000 + 8000;
    const x   = Math.random() * 96 + 2;
    g.textContent   = glyphs[Math.floor(Math.random() * glyphs.length)];
    g.style.cssText = `
      position:fixed; left:${x}%; bottom:-3rem; z-index:1; pointer-events:none;
      font-family:'Cinzel',serif; font-size:${Math.random() * 1.2 + 0.7}rem;
      color:rgba(212,175,55,${(Math.random() * 0.12 + 0.04).toFixed(2)});
      animation:float-up ${dur}ms linear forwards;`;
    document.body.appendChild(g);
    setTimeout(() => g.remove(), dur + 100);
    setTimeout(spawnGlyph, Math.random() * 1800 + 600);
  }
  const fs = document.createElement('style');
  fs.textContent = `@keyframes float-up {
    from { transform:translateY(0) rotate(0deg);   opacity:1; }
    to   { transform:translateY(-110vh) rotate(${Math.random() > 0.5 ? '' : '-'}${Math.floor(Math.random()*30)}deg); opacity:0; }
  }`;
  document.head.appendChild(fs);
  setTimeout(spawnGlyph, 4500);
})();
function showComputeProgress(btn) {
  btn.disabled    = true;
  btn.textContent = '✦ Computing…';
  btn.style.opacity = '0.7';
  let bar = document.getElementById('compute-progress');
  if (!bar) {
    bar       = document.createElement('div');
    bar.id    = 'compute-progress';
    bar.style.cssText = `
      position:fixed; top:0; left:0; height:3px; width:0;
      background:linear-gradient(90deg,var(--gold-dark),var(--gold-light));
      z-index:9999; transition:width 0.4s ease; border-radius:0 99px 99px 0;`;
    document.body.appendChild(bar);
  }
  bar.style.width = '0';
  requestAnimationFrame(() => { bar.style.width = '70%'; });
}
function hideComputeProgress(btn, originalText) {
  const bar = document.getElementById('compute-progress');
  if (bar) {
    bar.style.width = '100%';
    setTimeout(() => { bar.style.opacity = '0'; setTimeout(() => { bar.style.width = '0'; bar.style.opacity = '1'; }, 300); }, 200);
  }
  if (btn) {
    btn.disabled    = false;
    btn.textContent = originalText;
    btn.style.opacity = '';
  }
}
const _origHandleCompute = handleCompute;
function handleCompute(algoId) {
  const btn = $('btn-compute');
  const origText = btn ? btn.textContent : '';
  if (btn) showComputeProgress(btn);
  
  setTimeout(() => {
    _origHandleCompute(algoId);
    if (btn) hideComputeProgress(btn, origText);
  }, 30);
}
bgMusic.addEventListener('volumechange', () => {
  const slider = $('volume-slider');
  if (slider) slider.value = bgMusic.volume;
});
(function a11yFocusRing() {
  const style = document.createElement('style');
  style.textContent = `
    :focus-visible {
      outline: 2px solid var(--gold) !important;
      outline-offset: 3px !important;
    }
    :focus:not(:focus-visible) { outline: none !important; }`;
  document.head.appendChild(style);
})();
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('#theme-toggle, #theme-toggle-comp').forEach(b => {
    b.textContent = State.darkMode ? '☀' : '☾';
  });
});
(function injectTreeStyles() {
  const s = document.createElement('style');
  s.textContent = `
    .tree-section { margin-top: 0.5rem; }
    .tree-container {
      background: rgba(0,0,0,0.2);
      border: 1px solid rgba(212,175,55,0.1);
      border-radius: 10px;
      padding: 1rem 1.25rem;
      overflow-x: auto;
      font-family: 'EB Garamond', monospace;
      font-size: 0.92rem;
      line-height: 1.9;
    }
    body.light-mode .tree-container { background: rgba(0,0,0,0.04); }
    .tree-node { animation: step-slide 0.4s ease both; white-space: nowrap; }
    .tree-label { font-family: 'Cinzel', serif; font-size: 0.85em; }
    .tree-val   { color: var(--gold); font-weight: 600; }
    #compute-progress {
      transition: width 0.4s ease, opacity 0.3s ease;
    }
    kbd {
      font-family: 'Cinzel', serif;
      font-size: 0.7em;
      background: rgba(212,175,55,0.08);
      color: var(--gold);
    }
    #result-toolbar .btn-royal {
      white-space: nowrap;
    }
    .bern-table tbody tr:nth-child(even) td {
      background: rgba(212,175,55,0.025);
    }
    .collatz-bar:hover {
      background: linear-gradient(to top, var(--purple), var(--purple-light));
      filter: brightness(1.3);
    }
    .algo-card:focus-visible {
      outline: 2px solid var(--gold);
      outline-offset: 4px;
    }
    .music-player.playing .music-icon {
      color: var(--gold-light);
      text-shadow: 0 0 10px var(--gold);
    }
    .btn-enter {
      animation: enter-pulse 3s ease-in-out infinite;
    }
    @keyframes enter-pulse {
      0%,100% { box-shadow: 0 0 0 0 rgba(212,175,55,0.3), 0 0 20px rgba(212,175,55,0.1); }
      50%      { box-shadow: 0 0 0 14px rgba(212,175,55,0), 0 0 40px rgba(212,175,55,0.2); }
    }
    .goodbye-emblem {
      filter: drop-shadow(0 0 30px rgba(212,175,55,0.6));
    }
    .modal-credits li::before {
      margin-right: 0.4rem;
    }
    @media (max-width: 480px) {
      .music-player { gap: 0.5rem; }
      .volume-icon  { display: none; }
    }
  `;
  document.head.appendChild(s);
})();

