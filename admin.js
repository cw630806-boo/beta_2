import { auth, db } from './firebase-init.js';
import {
  signInWithEmailAndPassword, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  collection, addDoc, getDocs, deleteDoc, doc, getDoc, setDoc, updateDoc,
  query, orderBy, serverTimestamp, where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const appModal = document.getElementById('appModal');
const appModalTitle = document.getElementById('appModalTitle');
const appModalMsg = document.getElementById('appModalMsg');
const appModalFields = document.getElementById('appModalFields');
const appModalCancel = document.getElementById('appModalCancel');
const appModalConfirm = document.getElementById('appModalConfirm');

function closeAppModal() {
  appModal.classList.remove('is-open');
  appModalFields.innerHTML = '';
  appModalMsg.style.display = 'none';
}

function appPrompt(title, fields, { message } = {}) {
  return new Promise(resolve => {
    appModalTitle.textContent = title;
    appModalConfirm.classList.remove('is-danger');
    appModalConfirm.textContent = 'تأكيد';
    if (message) { appModalMsg.textContent = message; appModalMsg.style.display = 'block'; }
    appModalFields.innerHTML = fields.map(f =>
      `<input type="${f.type || 'text'}" id="modalField_${f.id}" placeholder="${f.placeholder || ''}">`
    ).join('');
    appModal.classList.add('is-open');
    appModalFields.querySelector('input')?.focus();

    function cleanup(result) {
      appModalConfirm.removeEventListener('click', onConfirm);
      appModalCancel.removeEventListener('click', onCancel);
      closeAppModal();
      resolve(result);
    }
    function onConfirm() {
      const values = {};
      let hasEmpty = false;
      fields.forEach(f => {
        const v = document.getElementById(`modalField_${f.id}`).value.trim();
        if (!v) hasEmpty = true;
        values[f.id] = v;
      });
      if (hasEmpty) return;
      cleanup(values);
    }
    function onCancel() { cleanup(null); }
    appModalConfirm.addEventListener('click', onConfirm);
    appModalCancel.addEventListener('click', onCancel);
  });
}

function appConfirm(message, { danger = false, title = 'تأكيد' } = {}) {
  return new Promise(resolve => {
    appModalTitle.textContent = title;
    appModalMsg.textContent = message;
    appModalMsg.style.display = 'block';
    appModalFields.innerHTML = '';
    appModalConfirm.textContent = danger ? 'حذف' : 'تأكيد';
    appModalConfirm.classList.toggle('is-danger', danger);
    appModal.classList.add('is-open');

    function cleanup(result) {
      appModalConfirm.removeEventListener('click', onConfirm);
      appModalCancel.removeEventListener('click', onCancel);
      closeAppModal();
      resolve(result);
    }
    function onConfirm() { cleanup(true); }
    function onCancel() { cleanup(false); }
    appModalConfirm.addEventListener('click', onConfirm);
    appModalCancel.addEventListener('click', onCancel);
  });
}

// إذا كتب المدرب "مجانية" (أو ما يشابهها) داخل حقل السعر، تصبح الدورة مجانية تلقائياً
// حتى لو نسي تفعيل خانة "مجانية".
function isFreeText(price) {
  return /مجان|free/i.test(price || '');
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

function getYoutubeEmbedUrl(url) {
  if (!url) return '';
  if (url.includes('/embed/')) return url;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
}

const loginBox = document.getElementById('loginBox');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('loginForm');
const loginMsg = document.getElementById('loginMsg');
const userEmailEl = document.getElementById('userEmail');
const logoutBtn = document.getElementById('logoutBtn');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  loginMsg.textContent = 'جارِ الدخول...';
  try {
    await signInWithEmailAndPassword(auth, email, password);
    loginMsg.textContent = '';
    loginForm.reset();
  } catch (err) {
    loginMsg.textContent = '❌ ' + (err.message || 'خطأ في الدخول');
  }
});
logoutBtn.addEventListener('click', () => signOut(auth));

onAuthStateChanged(auth, (user) => {
  if (user) {
    loginBox.style.display = 'none';
    dashboard.style.display = 'block';
    userEmailEl.textContent = user.email;
    loadBookings();
    loadIntro();
    loadAddonPrices();
    loadDiscountCodes();
    loadCourses();
    loadVideos();
  } else {
    loginBox.style.display = 'block';
    dashboard.style.display = 'none';
  }
});

/* ===== طلبات الحجز ===== */
const GOAL_LABELS = { weightloss: 'نقص الوزن', muscle: 'بناء عضلي', general: 'الصحة العامة', other: 'هدف آخر' };
const ADDON_LABELS = { session2: 'ترقية لجلستين أسبوعياً', medical: 'مرافقة طبية' };

function bookingPackageText(b) {
  return b.packageType === 'health' ? 'الأهداف الصحية' : 'الفنون القتالية';
}
function bookingDetailsText(b) {
  if (b.packageType === 'health') {
    const goal = b.goal === 'other' ? (b.goalOther || GOAL_LABELS.other) : (GOAL_LABELS[b.goal] || '—');
    const addons = Object.keys(b.addons || {}).filter(k => b.addons[k]).map(k => ADDON_LABELS[k]);
    return `الهدف: ${goal}${addons.length ? ' — إضافات: ' + addons.join('، ') : ''}${b.duration ? ' — ' + b.duration : ''}${b.discountCode ? ' — كود: ' + b.discountCode : ''}`;
  }
  return `${b.courseTitle || '—'}${b.discountCode ? ' — كود: ' + b.discountCode : ''}`;
}
function bookingTotalText(b) {
  if (b.packageType === 'health') return b.totalPrice !== undefined ? `$${Number(b.totalPrice).toFixed(2)}` : (b.addonsTotal ? `$${b.addonsTotal}` : 'بدون إضافات');
  return b.coursePrice || '—';
}

let bookingsCache = [];
let bookingsShowAll = false;

async function loadBookings() {
  const container = document.getElementById('bookingsList');
  try {
    const snap = await getDocs(query(collection(db, 'bookings'), orderBy('createdAt', 'desc')));
    bookingsCache = [];
    snap.forEach(d => bookingsCache.push({ id: d.id, ...d.data() }));
    bookingsShowAll = false;
    renderBookings();
  } catch (err) {
    container.innerHTML = '<p style="color:var(--blood);">خطأ في تحميل الطلبات</p>';
    console.error(err);
  }
}

function renderBookings() {
  const container = document.getElementById('bookingsList');
  if (!bookingsCache.length) {
    container.innerHTML = '<p style="color:var(--chalk-dim);">لا توجد طلبات حجز حتى الآن.</p>';
    return;
  }
  const visible = bookingsShowAll ? bookingsCache : bookingsCache.slice(0, 3);
  let html = `<table class="booking-table"><thead><tr><th>#</th><th>الاسم</th><th>واتساب</th><th>البريد</th><th>الباقة</th><th>التفاصيل</th><th>الإجمالي</th><th>التاريخ</th><th>الوقت</th><th></th></tr></thead><tbody>`;
  visible.forEach((b, i) => {
    html += `<tr><td>${i + 1}</td><td>${escapeHtml(b.fullName)}</td><td>${escapeHtml(b.whatsapp)}</td><td>${escapeHtml(b.email)}</td><td>${escapeHtml(bookingPackageText(b))}</td><td>${escapeHtml(bookingDetailsText(b))}</td><td>${escapeHtml(bookingTotalText(b))}</td><td>${escapeHtml(b.date)}</td><td>${escapeHtml(b.time || '—')}</td><td><button class="btn-del-booking" data-id="${b.id}" style="background:var(--blood);color:#fff;font-size:.75rem;">حذف</button></td></tr>`;
  });
  html += '</tbody></table>';
  if (bookingsCache.length > 3) {
    html += `<div style="text-align:center;margin-top:1rem;"><button id="toggleBookingsBtn" class="btn btn--ghost">${bookingsShowAll ? 'عرض أقل' : `عرض الجميع (${bookingsCache.length})`}</button></div>`;
  }
  container.innerHTML = html;

  document.getElementById('toggleBookingsBtn')?.addEventListener('click', () => {
    bookingsShowAll = !bookingsShowAll;
    renderBookings();
  });
  container.querySelectorAll('.btn-del-booking').forEach(btn => {
    btn.addEventListener('click', async () => {
      const ok = await appConfirm('تأكيد حذف طلب الحجز هذا؟', { danger: true });
      if (!ok) return;
      await deleteDoc(doc(db, 'bookings', btn.dataset.id));
      bookingsCache = bookingsCache.filter(b => b.id !== btn.dataset.id);
      renderBookings();
      showToast('✅ تم حذف الطلب');
    });
  });
}

/* ===== فيديو التعريف ===== */
const introForm = document.getElementById('introForm');
const introUrlInput = document.getElementById('introUrl');
async function loadIntro() {
  const snap = await getDoc(doc(db, 'settings', 'site'));
  introUrlInput.value = snap.exists() ? (snap.data().introUrl || '') : '';
}
introForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const embedUrl = getYoutubeEmbedUrl(introUrlInput.value.trim());
  await setDoc(doc(db, 'settings', 'site'), { introUrl: embedUrl }, { merge: true });
  showToast('✅ تم حفظ فيديو التعريف');
});

/* ===== أسعار باقة الأهداف الصحية ===== */
const addonPricesForm = document.getElementById('addonPricesForm');
const priceHealthBase = document.getElementById('priceHealthBase');
const priceSession2 = document.getElementById('priceSession2');
const priceMedical = document.getElementById('priceMedical');

async function loadAddonPrices() {
  try {
    const snap = await getDoc(doc(db, 'settings', 'site'));
    const data = snap.exists() ? snap.data() : {};
    const d = data.addonPrices || {};
    priceHealthBase.value = data.healthBasePrice ?? 30;
    priceSession2.value = d.session2 ?? 40;
    priceMedical.value = d.medical ?? 40;
  } catch (err) { console.error(err); }
}

addonPricesForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const addonPrices = {
    session2: Number(priceSession2.value) || 0,
    medical: Number(priceMedical.value) || 0,
  };
  await setDoc(doc(db, 'settings', 'site'), {
    addonPrices,
    healthBasePrice: Number(priceHealthBase.value) || 0
  }, { merge: true });
  showToast('✅ تم حفظ الأسعار');
});

/* ===== أكواد الخصم ===== */
const addDiscountForm = document.getElementById('addDiscountForm');
const discountCodesList = document.getElementById('discountCodesList');
let discountCodesCache = {};

async function loadDiscountCodes() {
  try {
    const snap = await getDoc(doc(db, 'settings', 'site'));
    discountCodesCache = (snap.exists() && snap.data().discountCodes) || {};
    renderDiscountCodes();
  } catch (err) { console.error(err); }
}
function renderDiscountCodes() {
  const codes = Object.keys(discountCodesCache);
  if (!codes.length) {
    discountCodesList.innerHTML = '<p style="color:var(--chalk-dim);font-size:.85rem;">لا توجد أكواد خصم بعد.</p>';
    return;
  }
  discountCodesList.innerHTML = codes.map(code => `
    <div class="admin-row">
      <span>🏷️ <strong>${escapeHtml(code)}</strong> — خصم ${escapeHtml(String(discountCodesCache[code]))}%</span>
      <button class="btn-del-discount" data-code="${escapeHtml(code)}" style="background:var(--blood);color:#fff;">حذف</button>
    </div>`).join('');
  discountCodesList.querySelectorAll('.btn-del-discount').forEach(btn => {
    btn.addEventListener('click', async () => {
      const ok = await appConfirm(`حذف كود الخصم "${btn.dataset.code}"؟`, { danger: true });
      if (!ok) return;
      delete discountCodesCache[btn.dataset.code];
      await setDoc(doc(db, 'settings', 'site'), { discountCodes: discountCodesCache }, { merge: true });
      renderDiscountCodes();
      showToast('✅ تم حذف الكود');
    });
  });
}
addDiscountForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const code = document.getElementById('discountCode').value.trim().toUpperCase();
  const percent = Math.min(100, Math.max(1, Number(document.getElementById('discountPercent').value) || 0));
  if (!code || !percent) return;
  discountCodesCache[code] = percent;
  await setDoc(doc(db, 'settings', 'site'), { discountCodes: discountCodesCache }, { merge: true });
  addDiscountForm.reset();
  renderDiscountCodes();
  showToast('✅ تم إضافة كود الخصم');
});

/* ===== الدورات (إضافة، تعديل بدون حذف، حذف) ===== */
const addCourseForm = document.getElementById('addCourseForm');
const coursesList = document.getElementById('coursesList');

document.getElementById('coursePrice')?.addEventListener('input', (e) => {
  if (isFreeText(e.target.value)) document.getElementById('courseFree').checked = true;
});

async function loadCourses() {
  const snap = await getDocs(query(collection(db, 'courses'), orderBy('createdAt', 'desc')));
  coursesList.innerHTML = '';
  snap.forEach(d => {
    const c = d.data();
    const row = document.createElement('div');
    row.className = 'admin-row';
    row.innerHTML = `<span>${escapeHtml(c.image) || '📘'} ${escapeHtml(c.title)} — ${escapeHtml(c.price)} ${c.free ? '(مجانية)' : ''} ${c.incomplete ? '<span style="color:var(--gold-bright);">⏳ قيد الإكمال</span>' : ''}</span>
      <div style="display:flex;gap:.5rem;align-items:center;">
        <button class="btn-edit-course" data-id="${d.id}" style="background:var(--gold);color:#1A1305;">✏️ تعديل</button>
        <button class="btn-add-video" data-courseid="${d.id}" style="background:var(--tatami);color:#fff;">➕ فيديو</button>
        <button class="btn-delete-course" data-id="${d.id}" style="background:var(--blood);color:#fff;">حذف</button>
      </div>`;
    coursesList.appendChild(row);

    // نموذج التعديل (مخفي حتى الضغط على "تعديل") — يعدّل المستند نفسه بدون حذف/إعادة إنشاء
    const editForm = document.createElement('div');
    editForm.className = 'course-edit-form';
    editForm.style.display = 'none';
    editForm.innerHTML = `
      <input type="text" class="edit-title" placeholder="عنوان السلسلة" value="${escapeHtml(c.title || '')}">
      <textarea class="edit-desc" rows="2" placeholder="الوصف">${escapeHtml(c.desc || '')}</textarea>
      <input type="text" class="edit-price" placeholder="السعر" value="${escapeHtml(c.price || '')}">
      <input type="text" class="edit-image" placeholder="إيموجي أو رابط صورة" value="${escapeHtml(c.image || '')}">
      <input type="text" class="edit-discount" placeholder="نص خصم (اختياري)" value="${escapeHtml(c.discount || '')}">
      <div class="admin-row-check">
        <label><input type="checkbox" class="edit-free" ${c.free ? 'checked' : ''}> مجانية</label>
        <label><input type="checkbox" class="edit-incomplete" ${c.incomplete ? 'checked' : ''}> قيد الإكمال</label>
      </div>
      <div class="course-edit-form__actions">
        <button type="button" class="btn-save-course" style="background:var(--tatami);color:#fff;">💾 حفظ التعديلات</button>
        <button type="button" class="btn-cancel-edit" style="background:transparent;border:1px solid var(--border);color:var(--chalk);">إلغاء</button>
      </div>
    `;
    row.after(editForm);

    editForm.querySelector('.edit-price').addEventListener('input', (e) => {
      if (isFreeText(e.target.value)) editForm.querySelector('.edit-free').checked = true;
    });

    row.querySelector('.btn-edit-course').addEventListener('click', () => {
      editForm.style.display = editForm.style.display === 'none' ? 'grid' : 'none';
    });
    editForm.querySelector('.btn-cancel-edit').addEventListener('click', () => {
      editForm.style.display = 'none';
    });
    editForm.querySelector('.btn-save-course').addEventListener('click', async () => {
      const priceVal = editForm.querySelector('.edit-price').value.trim();
      const updated = {
        title: editForm.querySelector('.edit-title').value.trim(),
        desc: editForm.querySelector('.edit-desc').value.trim(),
        price: priceVal,
        image: editForm.querySelector('.edit-image').value.trim() || '📘',
        discount: editForm.querySelector('.edit-discount').value.trim(),
        free: editForm.querySelector('.edit-free').checked || isFreeText(priceVal),
        incomplete: editForm.querySelector('.edit-incomplete').checked,
      };
      try {
        await updateDoc(doc(db, 'courses', d.id), updated);
        showToast('✅ تم حفظ التعديلات');
        loadCourses();
      } catch (err) {
        console.error(err);
        showToast('تعذر حفظ التعديلات', { error: true });
      }
    });

    // عرض فيديوهات الدورة
    const videoContainer = document.createElement('div');
    videoContainer.className = 'video-list';
    videoContainer.id = `courseVideos_${d.id}`;
    editForm.after(videoContainer);
    loadCourseVideos(d.id, videoContainer);

    row.querySelector('.btn-add-video').addEventListener('click', async () => {
      const result = await appPrompt('إضافة فيديو للدورة', [
        { id: 'title', placeholder: 'عنوان الفيديو' },
        { id: 'url', placeholder: 'رابط الفيديو (يوتيوب أو mp4)', type: 'url' }
      ]);
      if (!result) return;
      addCourseVideo(d.id, result.title, result.url);
    });

    row.querySelector('.btn-delete-course').addEventListener('click', async () => {
      const ok = await appConfirm('تأكيد حذف الدورة؟ سيتم حذف جميع فيديوهاتها أيضاً.', { danger: true });
      if (ok) {
        await deleteDoc(doc(db, 'courses', d.id));
        const q = query(collection(db, 'courseVideos'), where('courseId', '==', d.id));
        const snapVid = await getDocs(q);
        snapVid.forEach(v => deleteDoc(doc(db, 'courseVideos', v.id)));
        loadCourses();
      }
    });
  });
}

async function loadCourseVideos(courseId, container) {
  try {
    const q = query(collection(db, 'courseVideos'), where('courseId', '==', courseId));
    const snap = await getDocs(q);
    if (snap.empty) {
      container.innerHTML = '<p style="color:var(--chalk-dim);font-size:.8rem;">لا توجد فيديوهات لهذه الدورة</p>';
      return;
    }
    let html = '<div style="margin-top:.5rem;">';
    snap.forEach(d => {
      const v = d.data();
      html += `<div class="admin-row"><span>🎬 ${escapeHtml(v.title)}</span><button class="btn-del-course-video" data-id="${d.id}" style="background:var(--blood);color:#fff;font-size:.75rem;">حذف</button></div>`;
    });
    html += '</div>';
    container.innerHTML = html;
    container.querySelectorAll('.btn-del-course-video').forEach(btn => {
      btn.addEventListener('click', async () => {
        const ok = await appConfirm('حذف هذا الفيديو؟', { danger: true });
        if (ok) {
          await deleteDoc(doc(db, 'courseVideos', btn.dataset.id));
          loadCourseVideos(courseId, container);
        }
      });
    });
  } catch (err) { console.error(err); }
}

async function addCourseVideo(courseId, title, url) {
  const embed = getYoutubeEmbedUrl(url);
  await addDoc(collection(db, 'courseVideos'), { courseId, title, embed, createdAt: serverTimestamp() });
  const container = document.getElementById(`courseVideos_${courseId}`);
  if (container) loadCourseVideos(courseId, container);
}

addCourseForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('courseTitle').value.trim();
  const desc = document.getElementById('courseDesc').value.trim();
  const price = document.getElementById('coursePrice').value.trim();
  const image = document.getElementById('courseImage').value.trim() || '📘';
  const discount = document.getElementById('courseDiscount').value.trim();
  const free = document.getElementById('courseFree').checked || isFreeText(price);
  const incomplete = document.getElementById('courseIncomplete').checked;
  await addDoc(collection(db, 'courses'), {
    title, desc, price, image, discount, free, incomplete,
    createdAt: serverTimestamp()
  });
  addCourseForm.reset();
  loadCourses();
  showToast('✅ تم إضافة الدورة');
});

/* ===== الفيديوهات الترويجية ===== */
const addVideoForm = document.getElementById('addVideoForm');
const videosList = document.getElementById('videosList');

async function loadVideos() {
  const snap = await getDocs(query(collection(db, 'videos'), orderBy('createdAt', 'desc')));
  videosList.innerHTML = '';
  snap.forEach(d => {
    const v = d.data();
    const row = document.createElement('div');
    row.className = 'admin-row';
    row.innerHTML = `<span>${escapeHtml(v.title)} — ${v.type === 'reels' ? 'ريلز' : 'فيديو طويل'}</span>`;
    const delBtn = document.createElement('button');
    delBtn.textContent = 'حذف';
    delBtn.style.cssText = 'background:var(--blood);color:#fff;';
    delBtn.addEventListener('click', async () => {
      const ok = await appConfirm('تأكيد حذف الفيديو؟', { danger: true });
      if (ok) {
        await deleteDoc(doc(db, 'videos', d.id));
        loadVideos();
      }
    });
    row.appendChild(delBtn);
    videosList.appendChild(row);
  });
}

addVideoForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('videoTitle').value.trim();
  const url = document.getElementById('videoUrl').value.trim();
  const type = document.getElementById('videoType').value;
  const embed = getYoutubeEmbedUrl(url);
  await addDoc(collection(db, 'videos'), { title, embed, type, createdAt: serverTimestamp() });
  addVideoForm.reset();
  loadVideos();
  showToast('✅ تم إضافة الفيديو');
});