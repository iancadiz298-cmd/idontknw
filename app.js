const $ = (id) => document.getElementById(id);

const DEFAULTS = {
  name: "Krizzia",
  nick: "Love",
  head: "Happy Valentine’s Day.",
  sub: "I made this for you. Open the surprises. Save the notes. Keep it forever.",
  letter:
    "I love you. Thank you for choosing me. I promise I will keep showing up for you. Today is yours. Always.",
  reasons: [
    "You make me feel calm",
    "You listen",
    "You laugh with your whole heart",
    "You care for people",
    "You keep going",
    "You love in real ways"
  ],
  footer: "Made with love."
};

const STORAGE_KEY = "feb14_gift_v1";

function loadConfig(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return {...DEFAULTS};
    const parsed = JSON.parse(raw);
    return {...DEFAULTS, ...parsed};
  }catch{
    return {...DEFAULTS};
  }
}

function saveConfig(cfg){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
}

function toast(msg){
  const t = $("toast");
  t.textContent = msg;
  t.style.display = "block";
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { t.style.display = "none"; }, 1800);
}

function setText(id, text){
  const el = $(id);
  if(el) el.textContent = text;
}

function tryLoadPhoto(){
  const img = $("heroPhoto");
  const hint = $("photoHint");
  if(!img || !hint) return;

  img.src = "Photo/photo.jpg";
  img.onload = () => { img.style.display = "block"; hint.style.display = "none"; };
  img.onerror = () => { img.style.display = "none"; hint.style.display = "flex"; };
}

function buildReasons(reasons){
  const box = $("reasons");
  if(!box) return;

  box.innerHTML = "";
  reasons.forEach((r) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "reason hidden";
    b.textContent = r;
    b.addEventListener("click", () => b.classList.toggle("hidden"));
    box.appendChild(b);
  });
}

function countdownTo(targetDate){
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();
  if(diff <= 0) return "Today";

  const s = Math.floor(diff / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);

  if(d > 0) return `${d}d ${h}h ${m}m`;
  return `${h}h ${m}m`;
}

function tickCountdown(){
  const target = new Date("2026-02-14T00:00:00+08:00");
  setText("countdown", countdownTo(target));
}

function openSettings(cfg){
  $("setName").value = cfg.name;
  $("setNick").value = cfg.nick;
  $("setHead").value = cfg.head;
  $("setLetter").value = cfg.letter;
  $("setReasons").value = cfg.reasons.join(", ");
  $("settings").showModal();
}

function applyConfig(cfg){
  setText("brandTitle", `For ${cfg.name}`);
  setText("nickname", cfg.nick);
  setText("headline", cfg.head);
  setText("subline", cfg.sub);
  setText("letterText", cfg.letter);
  setText("footerLine", cfg.footer);
  buildReasons(cfg.reasons);
}

function saveFromSettings(cfg){
  const name = ($("setName").value || "").trim() || DEFAULTS.name;
  const nick = ($("setNick").value || "").trim() || DEFAULTS.nick;
  const head = ($("setHead").value || "").trim() || DEFAULTS.head;
  const letter = ($("setLetter").value || "").trim() || DEFAULTS.letter;

  const reasonsRaw = ($("setReasons").value || "").trim();
  const reasons = reasonsRaw
    ? reasonsRaw.split(",").map(s => s.trim()).filter(Boolean).slice(0, 18)
    : [...DEFAULTS.reasons];

  const next = {...cfg, name, nick, head, letter, reasons};
  saveConfig(next);
  applyConfig(next);
  toast("Saved.");
  $("settings").close();
  return next;
}

/* Canvas FX */
const fx = $("fx");
const ctx = fx.getContext("2d");
let particles = [];

function resizeFx(){
  fx.width = window.innerWidth;
  fx.height = window.innerHeight;
}
window.addEventListener("resize", resizeFx);

function popConfetti(){
  const w = fx.width, h = fx.height;
  const n = 160;
  const cx = w * 0.5;
  const cy = h * 0.22;

  for(let i=0;i<n;i++){
    particles.push({
      x: cx,
      y: cy,
      vx: (Math.random() - 0.5) * 10,
      vy: Math.random() * -10 - 6,
      g: 0.22 + Math.random() * 0.18,
      r: 3 + Math.random() * 4,
      a: 1
    });
  }
}

function stepFx(){
  ctx.clearRect(0,0,fx.width,fx.height);
  particles = particles.filter(p => p.a > 0.02 && p.y < fx.height + 30);

  particles.forEach(p => {
    p.vy += p.g;
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.99;
    p.a *= 0.985;

    ctx.globalAlpha = p.a;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
  });

  ctx.globalAlpha = 1;
  requestAnimationFrame(stepFx);
}

function surprise(cfg){
  const lines = [
    `Hi ${cfg.name}.`,
    "Tap the reasons.",
    "Press Celebrate."
  ];
  toast(lines[Math.floor(Math.random() * lines.length)]);
}

/* Bouquet animation */
function bouquetBurst(ms = 6000){
  const w = fx.width, h = fx.height;
  const blurOverlay = $("blurOverlay");

  // Activate blur effect
  if(blurOverlay){
    blurOverlay.classList.add("active");
  }

  const start = performance.now();
  const centerX = w * 0.5;
  const baseY = h * 0.82;

  const flowers = [];
  const flowerCount = Math.min(21, Math.max(12, Math.floor(w / 70)));

  // Sunflower yellow and gold palette
  const colors = [
    {petals: "rgba(255,215,0,.95)", center: "rgba(180,100,20,.95)"},
    {petals: "rgba(255,223,0,.95)", center: "rgba(160,90,15,.95)"},
    {petals: "rgba(255,230,20,.96)", center: "rgba(170,105,25,.96)"},
    {petals: "rgba(240,200,0,.95)", center: "rgba(175,110,30,.95)"},
    {petals: "rgba(255,220,10,.97)", center: "rgba(155,85,10,.97)"},
    {petals: "rgba(245,210,5,.94)", center: "rgba(165,95,20,.94)"}
  ];

  for(let i=0;i<flowerCount;i++){
    const angle = (Math.PI * 2) * (i / flowerCount);
    const radiusOffset = 35 + Math.random() * 45;
    const offsetX = Math.cos(angle) * radiusOffset;
    const offsetY = Math.sin(angle) * radiusOffset * 0.6;
    
    const stemH = h * (0.28 + Math.random() * 0.16);
    const bloomY = baseY - stemH;
    const colorIdx = Math.floor(Math.random() * colors.length);

    flowers.push({
      x: centerX + offsetX,
      y0: baseY + offsetY * 0.3,
      y1: bloomY,
      sway: (Math.random() * 1.1 + 0.2) * (Math.random() < 0.5 ? -1 : 1),
      head: 13 + Math.random() * 16,
      petals: 12 + Math.floor(Math.random() * 8),
      phase: Math.random() * Math.PI * 2,
      color: colors[colorIdx],
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.0015 + Math.random() * 0.001
    });
  }

  const sparks = [];
  const sparkCount = 280;

  for(let i=0;i<sparkCount;i++){
    sparks.push({
      x: centerX,
      y: h * 0.26,
      vx: (Math.random()-0.5) * 10.5,
      vy: Math.random() * -11 - 6,
      g: 0.18 + Math.random() * 0.18,
      r: 1.8 + Math.random() * 4,
      a: 1,
      hue: Math.random() * 40 - 20
    });
  }

  function rr(x,y,w2,h2,r){
    const r2 = Math.min(r, w2/2, h2/2);
    ctx.beginPath();
    ctx.moveTo(x+r2, y);
    ctx.arcTo(x+w2, y, x+w2, y+h2, r2);
    ctx.arcTo(x+w2, y+h2, x, y+h2, r2);
    ctx.arcTo(x, y+h2, x, y, r2);
    ctx.arcTo(x, y, x+w2, y, r2);
    ctx.closePath();
  }

  function drawFlower(f, t){
    const grow = Math.min(1, (t - start) / 850);
    const wobbleAmount = Math.sin((t - start) * f.wobbleSpeed + f.wobble) * (8 * f.sway);
    const sway = Math.sin((t - start) / 240 + f.phase) * (14 * f.sway);
    const totalSway = sway + wobbleAmount;
    const x1 = f.x + totalSway * grow;
    const y1 = f.y0 + (f.y1 - f.y0) * grow;

    // Draw stem
    ctx.globalAlpha = 0.88;
    ctx.lineWidth = 2.8;
    ctx.strokeStyle = "rgba(100,150,60,.65)";
    ctx.beginPath();
    ctx.moveTo(f.x, f.y0);
    ctx.quadraticCurveTo(f.x + totalSway * 0.4, (f.y0 + y1) * 0.5, x1, y1);
    ctx.stroke();

    // Draw leaves
    const leafY = f.y0 - (f.y0 - y1) * 0.42;
    ctx.lineWidth = 2.4;
    ctx.strokeStyle = "rgba(120,160,70,.60)";
    ctx.beginPath();
    ctx.moveTo(f.x + totalSway * 0.1, leafY);
    ctx.quadraticCurveTo(f.x + 26, leafY - 14, f.x + 13, leafY + 18);
    ctx.stroke();

    const leafY2 = f.y0 - (f.y0 - y1) * 0.58;
    ctx.beginPath();
    ctx.moveTo(f.x - totalSway * 0.1, leafY2);
    ctx.quadraticCurveTo(f.x - 24, leafY2 - 11, f.x - 11, leafY2 + 19);
    ctx.stroke();

    const pulse = 0.92 + 0.08 * Math.sin((t - start) / 140);
    const head = f.head * (0.5 + 0.5 * grow) * pulse;

    // Draw sunflower petals radiating outward
    // Yellow petals arranged in a circle
    const petalCount = 20 + Math.floor(Math.random() * 8);
    for(let p=0;p<petalCount;p++){
      const ang = (Math.PI * 2) * (p / petalCount) + (t - start) * 0.0004;
      const petalRadius = head * 0.95;
      const px = x1 + Math.cos(ang) * petalRadius;
      const py = y1 + Math.sin(ang) * petalRadius;
      
      // Draw petal as elongated shape
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(ang);
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = f.color.petals;
      ctx.beginPath();
      ctx.ellipse(0, 0, head * 0.48, head * 0.32, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Inner ring of lighter yellow petals
    for(let p=0;p<petalCount;p++){
      const ang = (Math.PI * 2) * (p / petalCount) + (t - start) * 0.0005 + Math.PI / petalCount;
      const petalRadius = head * 0.65;
      const px = x1 + Math.cos(ang) * petalRadius;
      const py = y1 + Math.sin(ang) * petalRadius;
      
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(ang);
      ctx.globalAlpha = 0.70;
      ctx.fillStyle = "rgba(255,240,60,.90)";
      ctx.beginPath();
      ctx.ellipse(0, 0, head * 0.35, head * 0.24, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Sunflower brown center
    ctx.globalAlpha = 0.98;
    ctx.fillStyle = f.color.center;
    ctx.beginPath();
    ctx.arc(x1, y1, head * 0.35, 0, Math.PI * 2);
    ctx.fill();

    // Add texture detail to center
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = "rgba(139,69,19,.50)";
    for(let i=0;i<12;i++){
      const ang = (Math.PI * 2) * (i / 12);
      const dotX = x1 + Math.cos(ang) * head * 0.2;
      const dotY = y1 + Math.sin(ang) * head * 0.2;
      ctx.beginPath();
      ctx.arc(dotX, dotY, head * 0.05, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function frame(t){
    ctx.clearRect(0,0,w,h);

    const elapsed = t - start;

    sparks.forEach(s => {
      s.vy += s.g;
      s.x += s.vx;
      s.y += s.vy;
      s.vx *= 0.989;
      s.a *= 0.984;

      ctx.globalAlpha = Math.max(0, s.a);
      const hue = s.hue;
      if(hue > 0){
        ctx.fillStyle = `hsl(${350 + hue}, 100%, 80%)`;
      } else {
        ctx.fillStyle = `hsl(${330 + hue}, 95%, 75%)`;
      }
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalAlpha = 1;

    const wrapW = w * 0.28;
    const wrapH = h * 0.22;
    const wrapX = centerX - wrapW * 0.5;
    const wrapY = baseY - wrapH * 0.08;

    ctx.globalAlpha = 0.42;
    ctx.fillStyle = "rgba(255,255,255,.8)";
    rr(wrapX, wrapY, wrapW, wrapH, 20);
    ctx.fill();
    
    ctx.globalAlpha = 0.25;
    ctx.strokeStyle = "rgba(255,255,255,.4)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    ctx.globalAlpha = 1;

    const ribbonW = wrapW * 0.42;
    const ribbonX = centerX - ribbonW * 0.5;
    const ribbonY = wrapY + wrapH * 0.48;

    ctx.globalAlpha = 0.65;
    ctx.fillStyle = "rgba(255,200,220,.75)";
    rr(ribbonX, ribbonY, ribbonW, wrapH * 0.18, 999);
    ctx.fill();
    
    ctx.globalAlpha = 0.40;
    ctx.fillStyle = "rgba(255,160,190,.55)";
    rr(ribbonX - ribbonW * 0.05, ribbonY + wrapH * 0.12, ribbonW * 0.35, wrapH * 0.14, 999);
    ctx.fill();
    
    ctx.globalAlpha = 1;

    flowers.forEach(f => drawFlower(f, t));

    if(elapsed < ms){
      requestAnimationFrame(frame);
      return;
    }

    ctx.clearRect(0,0,w,h);
    
    // Remove blur effect when animation ends
    if(blurOverlay){
      blurOverlay.classList.remove("active");
    }
  }

  requestAnimationFrame(frame);
}

/* Valentine gate */
function setupValentineGate(){
  const gate = $("valentineGate");
  const yes = $("gateYes");
  const no = $("gateNo");
  const hint = $("gateHint");
  const card = gate ? gate.querySelector(".gateCard") : null;

  if(!gate || !yes || !no || !hint || !card) return;

  function openGate(){
    hint.textContent = "";
    gate.showModal();
  }

  no.addEventListener("click", () => {
    hint.textContent = "Error. Wrong answer.";
    toast("Error. Wrong answer.");

    card.classList.remove("shake");
    void card.offsetWidth;
    card.classList.add("shake");
  });

  yes.addEventListener("click", () => {
    gate.close();
    toast("Yay. Happy Valentine's Day.");
    bouquetBurst(6000);
  });

  openGate();
}

function main(){
  resizeFx();
  stepFx();

  let cfg = loadConfig();
  applyConfig(cfg);
  tryLoadPhoto();

  tickCountdown();
  setInterval(tickCountdown, 1000);

  $("openSettings").addEventListener("click", () => openSettings(cfg));
  $("saveBtn").addEventListener("click", () => { cfg = saveFromSettings(cfg); });

  $("surpriseBtn").addEventListener("click", () => surprise(cfg));
  $("confettiBtn").addEventListener("click", () => { popConfetti(); toast("Happy Feb 14."); });

  setupValentineGate();
}

main();
