document.addEventListener("DOMContentLoaded", async () => {
  const user = JSON.parse(localStorage.getItem("fitlink-current-user"));
  if (!user || user.role !== "coach") {
    window.location.href = "index.html";
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const academyId = params.get("id");
  const form = document.getElementById("edit-academy-form");
  const msg = document.getElementById("edit-academy-msg");

  if (!academyId) {
    form.innerHTML = "<p>لم يتم تحديد أكاديمية.</p>";
    return;
  }

  // جلب بيانات الأكاديمية
  let academy;
  try {
    const res = await fetch("/api/academies");
    const academies = await res.json();
    academy = academies.find(a => String(a.id) === String(academyId) && a.coachUsername === user.username);
    if (!academy) {
      form.innerHTML = "<p>لا يمكنك تعديل هذه الأكاديمية أو الأكاديمية غير موجودة.</p>";
      return;
    }
  } catch {
    form.innerHTML = "<p>حدث خطأ أثناء تحميل بيانات الأكاديمية.</p>";
    return;
  }

  // إعداد القيم الافتراضية
  let selectedSports = [...(academy.sports || [])];
  let selectedLevels = [...(academy.levels || [])];
  let imageBase64 = academy.image || "";

  // بناء النموذج
  form.innerHTML = `
    <div class="form-group">
      <label>اسم الأكاديمية</label>
      <input type="text" id="academy-name" value="${academy.name || ""}" required />
    </div>
    <div class="form-group">
      <label>الدولة</label>
      <select id="academy-country" required>
        <option value="EG" ${academy.country === "EG" ? "selected" : ""}>مصر 🇪🇬</option>
        <option value="SA" ${academy.country === "SA" ? "selected" : ""}>السعودية 🇸🇦</option>
        <option value="AE" ${academy.country === "AE" ? "selected" : ""}>الإمارات 🇦🇪</option>
      </select>
    </div>
    <div class="form-group">
      <label>رقم الهاتف</label>
      <div class="form-inline">
        <span id="country-code">${academy.countryCode || "+20"}</span>
        <input type="tel" id="academy-phone" pattern="[0-9]{8,15}" maxlength="15" required placeholder="رقم الهاتف" value="${academy.phone || ""}" />
      </div>
    </div>
    <div class="form-group">
      <label>العنوان</label>
      <input type="text" id="academy-address" value="${academy.address || ""}" required />
    </div>
    <div class="form-group">
      <label>الرياضات المتاحة</label>
      <div class="form-inline">
        <select id="sports-select">
          <option value="">اختر رياضة</option>
          <option value="كرة القدم">كرة القدم</option>
          <option value="سباحة">سباحة</option>
          <option value="كاراتيه">كاراتيه</option>
          <option value="كرة السلة">كرة السلة</option>
          <option value="جيم">جيم</option>
          <option value="يوجا">يوجا</option>
          <option value="تايكوندو">تايكوندو</option>
          <option value="تنس">تنس</option>
        </select>
        <button type="button" id="add-sport-btn">إضافة</button>
      </div>
      <div class="selected-list" id="selected-sports"></div>
    </div>
    <div class="form-group">
      <label>الفئة العمرية</label>
      <div class="form-inline">
        <input type="number" id="age-from" min="1" max="99" step="1" required placeholder="من" value="${academy.ages?.from || ""}" />
        <span>إلى</span>
        <input type="number" id="age-to" min="1" max="99" required placeholder="إلى" value="${academy.ages?.to || ""}" />
        <span>سنة</span>
      </div>
    </div>
    <div class="form-group">
      <label>مستوى التدريب</label>
      <div class="form-inline">
        <select id="levels-select">
          <option value="">اختر مستوى</option>
          <option value="مبتدئ">مبتدئ</option>
          <option value="متوسط">متوسط</option>
          <option value="متقدم">متقدم</option>
          <option value="محترف">محترف</option>
        </select>
        <button type="button" id="add-level-btn">إضافة</button>
      </div>
      <div class="selected-list" id="selected-levels"></div>
    </div>
    <div class="form-group">
      <label>سعر الاشتراك الشهري (جنيه)</label>
      <input type="number" id="academy-price" min="50" required placeholder="مثال: 500" value="${academy.price || ""}" />
    </div>
    <div class="form-group">
      <label>الوصف</label>
      <textarea id="academy-description" required>${academy.description || ""}</textarea>
    </div>
    <div class="form-group">
      <label>صورة الأكاديمية</label>
      <input type="file" id="academy-image" accept="image/*" />
      <img id="preview-img" class="preview-img" style="display: ${imageBase64 ? "block" : "none"}" src="${imageBase64}" />
    </div>
    <button type="submit" class="btn btn-primary">
      <i class="fas fa-save"></i> حفظ التعديلات
    </button>
  `;

  // تحديث كود الدولة تلقائياً
  const countrySelect = document.getElementById("academy-country");
  const countryCodeSpan = document.getElementById("country-code");
  const countryCodes = { EG: "+20", SA: "+966", AE: "+971" };
  countrySelect.addEventListener("change", () => {
    countryCodeSpan.textContent = countryCodes[countrySelect.value] || "+20";
  });

  // منع إدخال غير الأرقام في رقم الهاتف
  document.getElementById("academy-phone").addEventListener("input", function () {
    this.value = this.value.replace(/\D/g, "");
  });

  // الرياضات المتاحة
  const sportsSelect = document.getElementById("sports-select");
  const addSportBtn = document.getElementById("add-sport-btn");
  const selectedSportsDiv = document.getElementById("selected-sports");
  function renderSelectedSports() {
    selectedSportsDiv.innerHTML = "";
    selectedSports.forEach((sport, idx) => {
      const item = document.createElement("span");
      item.className = "selected-item";
      item.innerHTML = `${sport} <button type="button" data-idx="${idx}">&times;</button>`;
      selectedSportsDiv.appendChild(item);
    });
  }
  renderSelectedSports();
  addSportBtn.onclick = () => {
    const sport = sportsSelect.value;
    if (sport && !selectedSports.includes(sport)) {
      selectedSports.push(sport);
      renderSelectedSports();
    }
  };
  selectedSportsDiv.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON") {
      const idx = +e.target.dataset.idx;
      selectedSports.splice(idx, 1);
      renderSelectedSports();
    }
  });

  // مستويات التدريب
  const levelsSelect = document.getElementById("levels-select");
  const addLevelBtn = document.getElementById("add-level-btn");
  const selectedLevelsDiv = document.getElementById("selected-levels");
  function renderSelectedLevels() {
    selectedLevelsDiv.innerHTML = "";
    selectedLevels.forEach((level, idx) => {
      const item = document.createElement("span");
      item.className = "selected-item";
      item.innerHTML = `${level} <button type="button" data-idx="${idx}">&times;</button>`;
      selectedLevelsDiv.appendChild(item);
    });
  }
  renderSelectedLevels();
  addLevelBtn.onclick = () => {
    const level = levelsSelect.value;
    if (level && !selectedLevels.includes(level)) {
      selectedLevels.push(level);
      renderSelectedLevels();
    }
  };
  selectedLevelsDiv.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON") {
      const idx = +e.target.dataset.idx;
      selectedLevels.splice(idx, 1);
      renderSelectedLevels();
    }
  });

  // رفع صورة الأكاديمية (Base64)
  let previewImg = document.getElementById("preview-img");
  document.getElementById("academy-image").addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        imageBase64 = e.target.result;
        previewImg.src = imageBase64;
        previewImg.style.display = "block";
      };
      reader.readAsDataURL(file);
    }
  });

  // إرسال التعديلات
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // تحقق من العمر
    const ageFrom = parseInt(document.getElementById("age-from").value, 10);
    const ageTo = parseInt(document.getElementById("age-to").value, 10);
    if (isNaN(ageFrom) || isNaN(ageTo) || ageFrom > ageTo) {
      msg.textContent = "يرجى إدخال عمر صحيح (من - إلى).";
      msg.style.color = "red";
      return;
    }

    // تحقق من الرياضات والمستويات
    if (selectedSports.length === 0) {
      msg.textContent = "يرجى اختيار رياضة واحدة على الأقل.";
      msg.style.color = "red";
      return;
    }
    if (selectedLevels.length === 0) {
      msg.textContent = "يرجى اختيار مستوى واحد على الأقل.";
      msg.style.color = "red";
      return;
    }

    // تحقق من السعر
    const price = parseInt(document.getElementById("academy-price").value, 10);
    if (isNaN(price) || price < 0) {
      msg.textContent = "يرجى إدخال سعر صحيح.";
      msg.style.color = "red";
      return;
    }

    const updatedAcademy = {
      id: academy.id,
      name: document.getElementById("academy-name").value.trim(),
      country: countrySelect.value,
      countryCode: countryCodeSpan.textContent,
      phone: document.getElementById("academy-phone").value.trim(),
      address: document.getElementById("academy-address").value.trim(),
      sports: selectedSports,
      ages: { from: ageFrom, to: ageTo },
      levels: selectedLevels,
      description: document.getElementById("academy-description").value.trim(),
      image: imageBase64,
      coachUsername: user.username,
      price: price
    };

    try {
      const res = await fetch("/api/update-academy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedAcademy)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        msg.textContent = "تم حفظ التعديلات بنجاح!";
        msg.style.color = "green";
      } else {
        msg.textContent = data.message || "حدث خطأ أثناء الحفظ.";
        msg.style.color = "red";
      }
    } catch (err) {
      msg.textContent = "فشل الاتصال بالخادم.";
      msg.style.color = "red";
    }
  });
});