import { db } from './firebase-init.js';
import {
  collection, getDocs, doc, getDoc, query, orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let toastTimer = null;
function showToast(message, { error = false, duration = 3000 } = {}) {
  const el = document.getElementById('appToast');
  if (!el) { console.log(message); return; }
  el.textContent = message;
  el.classList.toggle('is-error', error);
  el.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-visible'), duration);
}

function escapeHtml(str) {
  if (str === undefined || str === null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ===== تأثير fade-in (بطاقات + نصوص)، مع تأخير متدرّج ناعم لكل مجموعة =====
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
function initFadeGroup(selector, className = 'fade-in', maxDelay = 5, step = 0.08) {
  document.querySelectorAll(selector).forEach((el, i) => {
    el.classList.add(className);
    el.style.setProperty('--fade-delay', `${Math.min(i, maxDelay) * step}s`);
    fadeObserver.observe(el);
  });
}

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playSound(type) {
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    gain.gain.value = 0.06;
    if (type === 'success') {
      osc.frequency.value = 880;
      osc.start();
      setTimeout(() => { osc.frequency.value = 1100; }, 100);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
      osc.stop(audioCtx.currentTime + 0.3);
    } else if (type === 'click') {
      osc.frequency.value = 600;
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
      osc.stop(audioCtx.currentTime + 0.08);
    }
  } catch (_) { /* تجاهل */ }
}

const canvas = document.createElement('canvas');
canvas.id = 'particlesCanvas';
document.body.prepend(canvas);
const ctx = canvas.getContext('2d');
let w, h;
function resize() { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }
resize();
window.addEventListener('resize', resize);
const particles = Array.from({ length: 60 }, () => ({
  x: Math.random() * w, y: Math.random() * h,
  r: 1.5 + Math.random() * 2,
  dx: (Math.random() - 0.5) * 0.3,
  dy: (Math.random() - 0.5) * 0.3,
  color: `hsla(${40 + Math.random() * 20}, 60%, 60%, ${0.2 + Math.random() * 0.2})`
}));
function drawParticles() {
  ctx.clearRect(0, 0, w, h);
  particles.forEach(p => {
    p.x += p.dx; p.y += p.dy;
    if (p.x < 0 || p.x > w) p.dx *= -1;
    if (p.y < 0 || p.y > h) p.dy *= -1;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
  });
  requestAnimationFrame(drawParticles);
}
drawParticles();

const header = document.getElementById('siteHeader');
window.addEventListener('scroll', () => {
  header.classList.toggle('is-scrolled', window.scrollY > 40);
});

const navToggle = document.getElementById('navToggle');
const nav = document.getElementById('siteNav');
const iconMenu = document.getElementById('iconMenu');
const iconClose = document.getElementById('iconClose');
navToggle.addEventListener('click', () => {
  const open = nav.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', open);
  iconMenu.style.display = open ? 'none' : 'block';
  iconClose.style.display = open ? 'block' : 'none';
  document.body.style.overflow = open ? 'hidden' : '';
  if (open) playSound('click');
});
nav.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', false);
    iconMenu.style.display = 'block';
    iconClose.style.display = 'none';
    document.body.style.overflow = '';
  });
});

/* ===== الترجمة (عربي / إنجليزي) ===== */
const translations = {
  ar: {
    brand_role: 'مدرب فنون قتالية و مرافق', nav_intro: 'تعريف المدرب', nav_features: 'المميزات',
    nav_promo: 'فيديوهات مجانية', nav_packages: 'الباقات', nav_testimonials: 'آراء الطلاب', nav_cta: 'استكشف الباقات',
    hero_h1_line1: 'معك خطوة بخطوة لنصنع أفضل نسخة منك',
    hero_p: 'دروس مفصّلة، برنامج تدريجي، متابعة شخصية، مدربين محترفين.',
    hero_cta1: 'شاهد فيديوهات مجانية', hero_cta2: 'تصفح الباقات',
    score_years: 'سنة تدريب', score_students: 'طالب متدرّب', score_followers: 'ألف متابع عبر التواصل',
    intro_h2: 'تعريف المدرب', features_h2: 'لماذا هذا التطبيق؟',
    features_sub: 'مميزات مصمّمة خصيصاً لتوصلك لأهدافك بشكل منظم ومستدام.',
    feat1_title: 'انضباط ذكي', feat1_desc: 'باقات مرنة مناسبة ليومك.',
    feat2_title: 'نتائج ملموسة', feat2_desc: 'اختبارات وأسئلة بعد كل دورة.',
    feat3_title: 'تعلم تفاعلي', feat3_desc: 'دروس فيديو تفاعلية.',
    feat5_title: 'أفضل الأسعار', feat5_desc: 'باقات مدروسة بأسعار تنافسية تناسب الجميع، مع عروض وأكواد خصم بين الحين والآخر.',
    promo_h2: 'فيديوهات مجانية', promo_sub: 'تعرف على أسلوب التدريب من خلال محتوى مجاني متنوع.',
    promo_tab_long: 'فيديوهات طويلة', promo_tab_reels: 'ريلز', promo_empty: 'لا توجد فيديوهات بعد بهذا التصنيف.',
    pkg_h2: 'الباقات التدريبية', pkg_sub: 'اختر الباقة المناسبة لهدفك، وابدأ رحلتك معنا خطوة بخطوة.',
    pkg_martial_title: 'الفنون القتالية',
    pkg_martial_desc: 'دورات تدريجية في القرابلينغ والفنون القتالية، خطوة بخطوة مع متابعة المدرب.',
    pkg_martial_pt1: 'دورات مصورة حسب المستوى', pkg_martial_pt2: 'تصحيح تقني مع المدرب / شروحات تفصيلية',
    pkg_martial_pt4: 'أسئلة تفاعلية على شكل كويز بعد كل درس', pkg_martial_pt5: 'إمكانية طرح الأسئلة على المدرب',
    pkg_martial_price_note: 'أسعار متعددة حسب السلسلة المختارة',
    pkg_health_title: 'الأهداف الصحية',
    pkg_health_desc: 'برنامج مخصص للوصول إلى هدفك الرياضي.',
    pkg_health_price_unit: '/ لمدة 3 أشهر',
    pkg_health_pt1: 'نظام غذائي متكامل ومحسوب السعرات', pkg_health_pt2: 'برامج تدريبية متنوعة',
    pkg_health_pt3: 'دعم ومتابعة متواصلة', pkg_health_pt4: 'جلسة أسبوعية واحدة مع المدرب — مجاناً ضمن الباقة',
    pkg_health_pt5: 'إمكانية إضافة جلسات أو متابعة طبية إضافية', pkg_choose: 'اختر هذه الباقة',
    testi_h2: 'آراء الطلاب',
    testi1_text: 'ex: بديت مع الكوتش احمد من الزيرو و اليوم راني في الحزامة الزرقا', testi1_belt: 'حزام أزرق',
    testi2_text: 'ex: الايكيب بارفي و الشرح تاع الفيديو يخليك تفهم و تتبع حتى للتالي', testi2_belt: 'بناء عضلي',
    testi3_text: 'الجلسات الخاصة بدلت المستوى تاعي قبل البطولة بشكل كبير.', testi3_belt: 'بطل في مسابقة',
    footer_copy: '© 2026 احمد زروال. جميع الحقوق محفوظة.',
  },
  en: {
    brand_role: 'Combat Sports Coach & Trainer', nav_intro: 'Coach Intro', nav_features: 'Features',
    nav_promo: 'Free Videos', nav_packages: 'Packages', nav_testimonials: 'Testimonials', nav_cta: 'Explore Packages',
    hero_h1_line1: 'With you step by step to build the best version of you',
    hero_p: 'Detailed lessons, a progressive program, personal follow-up, professional coaches.',
    hero_cta1: 'Watch Free Videos', hero_cta2: 'Browse Packages',
    score_years: 'Years of coaching', score_students: 'Trained students', score_followers: 'K followers online',
    intro_h2: 'Coach Introduction', features_h2: 'Why This App?',
    features_sub: 'Features designed to help you reach your goals in an organized, sustainable way.',
    feat1_title: 'Smart Discipline', feat1_desc: 'Flexible packages that fit your day.',
    feat2_title: 'Real Results', feat2_desc: 'Tests and questions after every course.',
    feat3_title: 'Interactive Learning', feat3_desc: 'Interactive video lessons.',
    feat5_title: 'Best Prices', feat5_desc: 'Well-priced, competitive packages for everyone, with occasional offers and discount codes.',
    promo_h2: 'Free Videos', promo_sub: 'Get to know the coaching style through varied free content.',
    promo_tab_long: 'Long Videos', promo_tab_reels: 'Reels', promo_empty: 'No videos in this category yet.',
    pkg_h2: 'Training Packages', pkg_sub: 'Choose the package that fits your goal, and start your journey with us step by step.',
    pkg_martial_title: 'Martial Arts',
    pkg_martial_desc: 'Progressive grappling and martial arts courses, step by step with coach follow-up.',
    pkg_martial_pt1: 'Video courses by level', pkg_martial_pt2: 'Technical correction with the coach / detailed explanations',
    pkg_martial_pt4: 'Interactive quiz-style questions after every lesson', pkg_martial_pt5: 'Ask the coach questions',
    pkg_martial_price_note: 'Multiple prices depending on the course',
    pkg_health_title: 'Health Goals',
    pkg_health_desc: 'A program tailored to reach your fitness goal.',
    pkg_health_price_unit: '/ for 3 months',
    pkg_health_pt1: 'Complete nutrition plan with calorie tracking', pkg_health_pt2: 'Varied training programs',
    pkg_health_pt3: 'Continuous support & follow-up', pkg_health_pt4: 'One weekly coach session — free with the package',
    pkg_health_pt5: 'Option to add extra sessions or medical follow-up', pkg_choose: 'Choose This Package',
    testi_h2: 'Testimonials',
    testi1_text: 'ex: I started with coach Ahmed from zero and today I\u2019m at blue belt.', testi1_belt: 'Blue Belt',
    testi2_text: 'ex: The team is great and the video explanations make it easy to follow through.', testi2_belt: 'Muscle Building',
    testi3_text: 'The private sessions greatly improved my level before the championship.', testi3_belt: 'Competition Champion',
    footer_copy: '© 2026 Ahmed Zeroual. All rights reserved.',
  }
};

let currentLang = localStorage.getItem('siteLang') === 'en' ? 'en' : 'ar';
function t(key) {
  return (translations[currentLang] && translations[currentLang][key] !== undefined)
    ? translations[currentLang][key]
    : (translations.ar[key] !== undefined ? translations.ar[key] : key);
}

function applyTranslations() {
  document.documentElement.lang = currentLang === 'ar' ? 'ar' : 'en';
  document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
  document.body.classList.toggle('lang-en', currentLang === 'en');

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (translations[currentLang] && translations[currentLang][key] !== undefined) {
      el.textContent = translations[currentLang][key];
    }
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.dataset.i18nHtml;
    if (translations[currentLang] && translations[currentLang][key] !== undefined) {
      el.innerHTML = translations[currentLang][key];
    }
  });

  const langBtn = document.getElementById('langToggle');
  if (langBtn) langBtn.textContent = currentLang === 'ar' ? 'EN' : 'AR';

  const activeTab = document.querySelector('.promo-tab.is-active')?.dataset.tab || 'long';
  renderPromoVideos(activeTab);
}

function setLanguage(lang) {
  currentLang = lang === 'en' ? 'en' : 'ar';
  localStorage.setItem('siteLang', currentLang);
  applyTranslations();
  initHeroTyping();
}

document.getElementById('langToggle')?.addEventListener('click', () => {
  setLanguage(currentLang === 'ar' ? 'en' : 'ar');
  playSound('click');
});
document.getElementById('themeToggle')?.addEventListener('click', () => playSound('click'));

function getYoutubeEmbedUrl(url) {
  if (!url) return '';
  if (url.includes('/embed/')) return url;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube-nocookie\.com\/embed\/)([\w-]{11})/);
  return match ? `https://www.youtube-nocookie.com/embed/${match[1]}` : url;
}

const videoModal = document.getElementById('videoModal');
const modalPlayer = document.getElementById('modalPlayer');
const modalTitle = document.getElementById('modalTitle');
const modalClose = document.getElementById('modalClose');

function openVideoModal(title, embedUrl, type = 'long') {
  modalTitle.textContent = title;
  const finalUrl = getYoutubeEmbedUrl(embedUrl);
  modalPlayer.classList.toggle('video-modal__player--reels', type === 'reels');
  modalPlayer.innerHTML = `<iframe src="${finalUrl}" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen style="width:100%;height:100%;border:0;border-radius:4px;"></iframe>`;
  videoModal.classList.add('is-open');
  document.body.style.overflow = 'hidden';
  playSound('click');
}
function closeVideoModal() {
  videoModal.classList.remove('is-open');
  document.body.style.overflow = '';
  modalPlayer.innerHTML = '';
  modalPlayer.classList.remove('video-modal__player--reels');
}
modalClose.addEventListener('click', closeVideoModal);
videoModal.addEventListener('click', e => { if (e.target === videoModal) closeVideoModal(); });
window.openVideoModal = openVideoModal;

const introPlayer = document.getElementById('introPlayer');
async function loadIntroVideo() {
  try {
    const snap = await getDoc(doc(db, 'settings', 'site'));
    const url = snap.exists() ? (snap.data().introUrl || '') : '';
    if (url) {
      const finalUrl = getYoutubeEmbedUrl(url);
      introPlayer.innerHTML = `<iframe src="${finalUrl}" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;"></iframe>`;
    } else {
      introPlayer.innerHTML = `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:var(--chalk-dim);font-size:.9rem;">لا يوجد فيديو تعريفي بعد</div>`;
    }
  } catch (err) {
    introPlayer.innerHTML = `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:var(--chalk-dim);font-size:.9rem;">تعذر تحميل الفيديو</div>`;
  }
}

let promoData = { long: [], reels: [] };
const promoGrid = document.getElementById('promoGrid');
const promoButtons = document.querySelectorAll('.promo-tab');

function renderPromoVideos(type) {
  const videos = promoData[type] || [];
  if (!videos.length) {
    promoGrid.innerHTML = `<p style="color:var(--chalk-dim);grid-column:1/-1;text-align:center;">${t('promo_empty')}</p>`;
    return;
  }
  promoGrid.classList.toggle('promo-grid--reels', type === 'reels');
  promoGrid.innerHTML = videos.map((v, i) => {
    const vid = v.embed.match(/(?:embed\/|v=|\/)([\w-]{11})(?:\?|&|$)/)?.[1] || '';
    const thumbUrl = vid ? `https://img.youtube.com/vi/${vid}/hqdefault.jpg` : '';
    return `
      <div class="promo-item ${type === 'reels' ? 'promo-item--reels' : ''}" data-index="${i}">
        <div class="promo-item__thumb">
          ${thumbUrl ? `<img class="promo-item__thumb-img" src="${thumbUrl}" alt="${escapeHtml(v.title)}">` : ''}
          <span class="promo-item__play-btn" aria-hidden="true">▶</span>
        </div>
        <div class="promo-item__body"><h4>${escapeHtml(v.title)}</h4></div>
      </div>
    `;
  }).join('');
  promoGrid.querySelectorAll('.promo-item').forEach((el, i) => {
    el.addEventListener('click', () => {
      const v = videos[Number(el.dataset.index)];
      openVideoModal(v.title, v.embed, type);
    });
    el.classList.add('fade-in');
    el.style.setProperty('--fade-delay', `${Math.min(i, 5) * 0.06}s`);
    fadeObserver.observe(el);
  });
}

async function loadPromoVideos() {
  try {
    const snap = await getDocs(query(collection(db, 'videos'), orderBy('createdAt', 'desc')));
    promoData = { long: [], reels: [] };
    snap.forEach(d => {
      const v = d.data();
      const bucket = v.type === 'reels' ? 'reels' : 'long';
      promoData[bucket].push({ title: v.title, embed: v.embed });
    });
  } catch (err) { console.error(err); }
  const activeTab = document.querySelector('.promo-tab.is-active')?.dataset.tab || 'long';
  renderPromoVideos(activeTab);
}
promoButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    promoButtons.forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    renderPromoVideos(btn.dataset.tab);
    playSound('click');
  });
});

// ===== تفعيل مجموعات fade-in الثابتة فـ الصفحة =====
initFadeGroup('.feature-card, .package-card, .testi-card');
initFadeGroup('.heading-row, .section > .wrap > .eyebrow-mark', 'fade-in-text', 0);

// ===== أرقام لوحة النتائج تتصاعد (Count-up) =====
function animateCount(el) {
  const target = Number(el.dataset.countTo || 0);
  const prefix = el.dataset.prefix || '';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || !target) { el.textContent = prefix + target; return; }
  const duration = 1400;
  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = prefix + Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
const scoreboardEl = document.querySelector('.scoreboard');
if (scoreboardEl) {
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('[data-count-to]').forEach(animateCount);
        countObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  countObserver.observe(scoreboardEl);
}

// ===== سعر باقة "الأهداف الصحية" الأساسي (يديره المدرب من لوحة التحكم) =====
async function loadHealthPackagePrice() {
  const el = document.getElementById('healthPackagePrice');
  if (!el) return;
  try {
    const snap = await getDoc(doc(db, 'settings', 'site'));
    const price = snap.exists() && snap.data().healthBasePrice !== undefined ? snap.data().healthBasePrice : 30;
    el.textContent = price;
  } catch (err) { /* يبقى السعر الافتراضي 30 عند الخطأ */ }
}

// ===== تأثير الكتابة والمحو للكلمة المتغيّرة في عنوان الهيرو =====
const HERO_TYPED_WORDS = {
  ar: ['حرق الدهون', 'بناء عضلي', 'تحسين الصفات البدنية', 'Grappling', 'Striking', 'Judo', 'Boxing'],
  en: ['Fat Burning', 'Muscle Building', 'Better Fitness', 'Grappling', 'Striking', 'Judo', 'Boxing']
};
let heroTypeTimer = null;
let heroTypeToken = 0;
function initHeroTyping() {
  const el = document.getElementById('heroTyped');
  if (!el) return;
  clearTimeout(heroTypeTimer);
  const myToken = ++heroTypeToken;
  const words = HERO_TYPED_WORDS[currentLang] || HERO_TYPED_WORDS.ar;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) { el.textContent = words[0]; return; }

  let wordIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function step() {
    if (myToken !== heroTypeToken) return; // تم إيقاف هذه الدورة (تبديل لغة مثلاً)
    const word = words[wordIndex % words.length];
    const isEnglish = /^[A-Za-z]/.test(word);
    el.classList.toggle('hero-typed--en', isEnglish);

    let delay;
    if (!deleting) {
      charIndex++;
      el.textContent = word.slice(0, charIndex);
      delay = 90;
      if (charIndex >= word.length) { deleting = true; delay = 1300; }
    } else {
      charIndex--;
      el.textContent = word.slice(0, charIndex);
      delay = 45;
      if (charIndex <= 0) {
        deleting = false;
        wordIndex++;
        delay = 350;
      }
    }
    heroTypeTimer = setTimeout(step, delay);
  }
  step();
}

loadIntroVideo();
loadPromoVideos();
loadHealthPackagePrice();
applyTranslations();
initHeroTyping();