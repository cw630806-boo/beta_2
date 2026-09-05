<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <script src="theme.js"></script>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>لوحة تحكم المدرب — احمد زروال</title>
  <link rel="icon" type="image/png" sizes="192x192" href="icons/icon-192.png">
  <link href="https://fonts.googleapis.com/css2?family=Changa:wght@500;600;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
  <style>
    .admin-wrap { max-width: 960px; margin: 0 auto; padding: 6rem 1.5rem 4rem; }
    .admin-box { background: var(--ink-2); border: 1px solid var(--border); border-radius: var(--radius); padding: 1.5rem; margin-bottom: 2rem; }
    .admin-box h2 { margin-bottom: 1rem; font-size: 1.3rem; }
    .admin-box form { display: grid; gap: .8rem; }
    .admin-box input, .admin-box select, .admin-box textarea {
      background: var(--ink); border: 1px solid var(--border); border-radius: var(--radius);
      padding: .7rem .9rem; color: var(--chalk); width: 100%;
    }
    .admin-row { display: flex; align-items: center; justify-content: space-between; gap: 1rem;
      padding: .7rem 0; border-bottom: 1px solid var(--border); font-size: .92rem; }
    .admin-row:last-child { border-bottom: none; }
    .admin-row button { border: none; border-radius: var(--radius); padding: .4rem .9rem; font-size: .82rem; }
    .admin-msg { font-size: .85rem; color: var(--chalk-dim); margin-top: .6rem; }
    .admin-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    #loginBox { max-width: 400px; margin: 6rem auto 0; }
    #dashboard { display: none; }
    .booking-table { width: 100%; border-collapse: collapse; font-size: .9rem; }
    .booking-table th { background: var(--mat); padding: .6rem; text-align: right; border-bottom: 2px solid var(--gold); }
    .booking-table td { padding: .6rem; border-bottom: 1px solid var(--border); }
    .booking-table tr:hover { background: rgba(192,138,52,0.05); }
    .video-list { margin-top: .8rem; }
    .video-list .admin-row { border-bottom: 1px solid var(--border); }

    #appModal {
      display: none; position: fixed; inset: 0; z-index: 999;
      background: rgba(0,0,0,.6); align-items: center; justify-content: center; padding: 1rem;
    }
    #appModal.is-open { display: flex; }
    .app-modal__box {
      background: var(--ink-2); border: 1px solid var(--border); border-radius: var(--radius);
      padding: 1.5rem; width: 100%; max-width: 420px;
    }
    .app-modal__box h3 { margin-bottom: 1rem; font-size: 1.1rem; }
    .app-modal__box input {
      background: var(--ink); border: 1px solid var(--border); border-radius: var(--radius);
      padding: .7rem .9rem; color: var(--chalk); width: 100%; margin-bottom: .7rem;
    }
    .app-modal__msg { font-size: .85rem; color: var(--blood); margin-bottom: .5rem; display: none; }
    .app-modal__actions { display: flex; gap: .6rem; justify-content: flex-end; }
    .app-modal__actions button { border: none; border-radius: var(--radius); padding: .5rem 1.1rem; font-size: .88rem; cursor: pointer; }
    #appModalCancel { background: transparent; border: 1px solid var(--border) !important; color: var(--chalk); }
    #appModalConfirm { background: var(--tatami); color: #fff; }
    #appModalConfirm.is-danger { background: var(--blood); }

    /* ===================== مقاييس الهاتف: لوحة التحكم ===================== */
    @media (max-width: 700px) {
      .admin-wrap { padding: 5.5rem 1rem 3rem; }
      .admin-box { padding: 1.1rem; margin-bottom: 1.3rem; }
      .admin-box h2 { font-size: 1.1rem; }
      .admin-top { flex-wrap: wrap; gap: .7rem; margin-bottom: 1.4rem; }
      .admin-top h2 { font-size: 1.05rem; }

      /* صفوف الأسعار (label + input) داخل النماذج: عمود عمودي بدل جنب بعض */
      .admin-box form .admin-row { flex-direction: column; align-items: stretch; gap: .4rem; padding: .6rem 0; }
      .admin-box form .admin-row label { flex: none; }
      .admin-box form .admin-row input { max-width: 100% !important; }

      /* صف الدورة/الكود/الفيديو: العنوان فوق، الأزرار تحت وتاخذ العرض كامل بالتساوي */
      #coursesList > .admin-row,
      #discountCodesList .admin-row,
      .video-list .admin-row {
        flex-direction: column; align-items: stretch; gap: .6rem; padding: .8rem 0;
      }
      #coursesList > .admin-row > div,
      .video-list .admin-row {
        flex-wrap: wrap;
      }
      #coursesList > .admin-row > div { display: flex; gap: .5rem; width: 100%; }
      #coursesList > .admin-row > div button { flex: 1 1 0; }
      #discountCodesList .admin-row button,
      .video-list .admin-row button { align-self: flex-start; }
      .admin-row { font-size: .87rem; }
      .admin-row button { padding: .45rem .8rem; }

      .course-edit-form__actions { flex-direction: column; }
      .course-edit-form__actions button { width: 100%; }

      .booking-table { font-size: .8rem; }
      .booking-table th, .booking-table td { padding: .5rem .6rem; }

      .app-modal__box { padding: 1.2rem; }
    }
  </style>
</head>
<body>

<header class="site-header is-scrolled">
  <div class="wrap">
    <a href="index.html" class="brand">
      <span class="brand__stripes"><span></span><span></span><span></span></span>
      <span class="brand__text">
        <span class="brand__name">احمد زروال</span>
        <span class="brand__role">لوحة التحكم</span>
      </span>
    </a>
    <div style="display:flex;align-items:center;gap:1rem;">
      <a href="index.html" style="font-size:.9rem;color:var(--chalk-dim);">‹ رجوع للموقع</a>
      <button class="theme-toggle" id="themeToggle" type="button" aria-label="تبديل الوضع الليلي/النهاري"></button>
    </div>
  </div>
</header>

<div class="admin-wrap">

  <div class="admin-box" id="loginBox">
    <h2>تسجيل دخول المدرب</h2>
    <form id="loginForm">
      <input type="email" id="loginEmail" placeholder="البريد الإلكتروني" required>
      <input type="password" id="loginPassword" placeholder="كلمة السر" required>
      <button type="submit" class="btn btn--primary">دخول</button>
      <p class="admin-msg" id="loginMsg"></p>
    </form>
  </div>

  <div id="dashboard">
    <div class="admin-top">
      <h2 style="margin:0;">أهلاً، <span id="userEmail"></span></h2>
      <button class="btn btn--ghost" id="logoutBtn">تسجيل خروج</button>
    </div>

    <div class="admin-box">
      <h2>📋 طلبات الحجز</h2>
      <div id="bookingsList"><p style="color:var(--chalk-dim);">جار التحميل...</p></div>
    </div>

    <div class="admin-box">
      <h2>🎥 فيديو تعريف المدرب</h2>
      <form id="introForm">
        <input type="url" id="introUrl" placeholder="رابط فيديو التعريف (يوتيوب Embed أو رابط mp4)">
        <button type="submit" class="btn btn--primary">حفظ</button>
      </form>
    </div>

    <!-- سعر باقة الأهداف الصحية + أسعار الإضافات -->
    <div class="admin-box">
      <h2>💰 أسعار باقة "الأهداف الصحية"</h2>
      <form id="addonPricesForm">
        <div class="admin-row" style="border-bottom:none;padding-bottom:0;">
          <label style="flex:1;">السعر الأساسي للباقة ($ / 3 أشهر)</label>
          <input type="number" id="priceHealthBase" min="0" step="1" style="max-width:120px;">
        </div>
        <p class="admin-msg" style="margin:0 0 .3rem;">ملاحظة: جلسة أسبوعية واحدة مع المدرب مُضمَّنة مجاناً ضمن الباقة الأساسية.</p>
        <div class="admin-row" style="border-bottom:none;padding-bottom:0;">
          <label style="flex:1;">الترقية لجلستين أسبوعياً ($)</label>
          <input type="number" id="priceSession2" min="0" step="1" style="max-width:120px;">
        </div>
        <div class="admin-row" style="border-bottom:none;padding-bottom:0;">
          <label style="flex:1;">متابعة طبية ($)</label>
          <input type="number" id="priceMedical" min="0" step="1" style="max-width:120px;">
        </div>
        <button type="submit" class="btn btn--primary" style="margin-top:.6rem;">حفظ الأسعار</button>
      </form>
    </div>

    <!-- أكواد الخصم -->
    <div class="admin-box">
      <h2>🏷️ أكواد الخصم</h2>
      <form id="addDiscountForm">
        <div class="form-grid-2">
          <input type="text" id="discountCode" placeholder="الكود (مثال: WELCOME10)" required>
          <input type="number" id="discountPercent" placeholder="نسبة الخصم %" min="1" max="100" required>
        </div>
        <button type="submit" class="btn btn--primary">إضافة الكود</button>
      </form>
      <div id="discountCodesList" style="margin-top:1rem;"></div>
    </div>

    <!-- إضافة دورة جديدة -->
    <div class="admin-box">
      <h2>📘 إضافة دورة جديدة</h2>
      <form id="addCourseForm">
        <input type="text" id="courseTitle" placeholder="عنوان السلسلة" required>
        <textarea id="courseDesc" placeholder="وصف السلسة" rows="2"></textarea>
        <input type="text" id="coursePrice" placeholder="السعر (مثلاً: 29$ أو مجاني)">
        <input type="text" id="courseImage" placeholder="إيموجي أو رابط صورة (اختياري)">
        <input type="text" id="courseDiscount" placeholder="نص خصم (اختياري، مثلاً: خصم 20%)">
        <div class="admin-row-check">
          <label><input type="checkbox" id="courseFree"> مجانية</label>
          <label><input type="checkbox" id="courseIncomplete"> قيد الإكمال (لم تنته السلسلة بعد)</label>
        </div>
        <button type="submit" class="btn btn--primary">إضافة السلسة</button>
      </form>
    </div>

    <div class="admin-box">
      <h2>📚 الدورات الحالية</h2>
      <p class="admin-msg" style="margin-top:0;">اضغط "تعديل" لتغيير سعر أو بيانات السلسلة دون حذفها وإعادة إنشائها.</p>
      <div id="coursesList"></div>
    </div>

    <div class="admin-box">
      <h2>🎬 إضافة فيديو ترويجي</h2>
      <form id="addVideoForm">
        <input type="text" id="videoTitle" placeholder="عنوان الفيديو" required>
        <input type="url" id="videoUrl" placeholder="رابط الفيديو (يوتيوب Embed أو رابط mp4)" required>
        <select id="videoType">
          <option value="long">فيديو طويل</option>
          <option value="reels">ريلز</option>
        </select>
        <button type="submit" class="btn btn--primary">إضافة الفيديو</button>
      </form>
    </div>

    <div class="admin-box">
      <h2>🎞️ الفيديوهات الترويجية الحالية</h2>
      <div id="videosList"></div>
    </div>
  </div>
</div>

<div id="appModal">
  <div class="app-modal__box">
    <h3 id="appModalTitle">عنوان</h3>
    <p class="app-modal__msg" id="appModalMsg"></p>
    <div id="appModalFields"></div>
    <div class="app-modal__actions">
      <button type="button" id="appModalCancel">إلغاء</button>
      <button type="button" id="appModalConfirm">تأكيد</button>
    </div>
  </div>
</div>

<!-- Toast: يبدل window.alert() -->
<div id="appToast"></div>

<script type="module" src="admin.js"></script>
</body>
</html>
