document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("fitlink-current-user"));
  const box = document.getElementById("profile-box");
  if (!user) {
    box.innerHTML = "<p>يجب تسجيل الدخول أولاً.</p>";
    return;
  }

  let editMode = false;
  let selectedSports = user.sports ? [...user.sports] : [];

  function renderSportsList() {
    const container = document.getElementById("selected-sports");
    if (!container) return;
    container.innerHTML = "";
    selectedSports.forEach((sport, idx) => {
      const item = document.createElement("span");
      item.className = "selected-item";
      item.innerHTML = `${sport} <button type="button" data-idx="${idx}">&times;</button>`;
      container.appendChild(item);
    });
  }

  function renderProfile() {
    box.innerHTML = `
      <div class="profile-header">
        <div class="profile-avatar"><i class="fas fa-user"></i></div>
        <div class="profile-title">${user.username}</div>
      </div>
      <form id="profile-form">
        <div class="profile-fields">
          <label>البريد الإلكتروني</label>
          <input type="email" id="profile-email" value="${user.email}" ${editMode ? "" : "readonly"} required />
          <label>السن</label>
          <input type="number" id="profile-age" value="${user.age || ""}" ${editMode ? "" : "readonly"} min="5" max="100" required />
          <label>الدولة</label>
          <select id="profile-country" ${editMode ? "" : "disabled"} required>
            <option value="">اختر الدولة</option>
            <option value="EG" ${user.country === "EG" ? "selected" : ""}>مصر 🇪🇬</option>
            <option value="SA" ${user.country === "SA" ? "selected" : ""}>السعودية 🇸🇦</option>
            <option value="AE" ${user.country === "AE" ? "selected" : ""}>الإمارات 🇦🇪</option>
          </select>
          ${editMode ? `
            <label>كلمة المرور الجديدة</label>
            <input type="password" id="profile-password" placeholder="اتركها فارغة إذا لا تريد التغيير" minlength="8" />
          ` : ""}
          <label>الرياضات المفضلة</label>
          ${editMode ? `
            <div class="multi-select" id="profile-sports-multiselect">
              <select id="sports-options">
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
          ` : `
            <input type="text" id="profile-sports" value="${(user.sports || []).join(', ')}" readonly />
          `}
        </div>
        <div class="profile-actions">
          ${editMode
            ? `<button type="submit" class="btn btn-primary-action">حفظ التعديلات</button>
               <button type="button" id="cancel-edit-btn" class="btn">إلغاء</button>`
            : `<button type="button" id="edit-profile-btn" class="btn btn-primary-action">تعديل</button>`
          }
        </div>
      </form>
      <div class="profile-msg" id="profile-msg"></div>
      ${!editMode ? `
        <div style="text-align:center; margin-top:24px;">
          <button type="button" id="delete-account-btn" class="btn" style="background:#d32f2f; color:#fff;">حذف الحساب</button>
        </div>
      ` : ""}
    `;
    if (editMode) renderSportsList();
  }

  renderProfile();

  // تفعيل وضع التعديل
  box.addEventListener("click", function(e) {
    if (e.target.id === "edit-profile-btn") {
      editMode = true;
      selectedSports = user.sports ? [...user.sports] : [];
      renderProfile();
    }
    if (e.target.id === "cancel-edit-btn") {
      editMode = false;
      renderProfile();
    }
    // إضافة رياضة
    if (e.target.id === "add-sport-btn") {
      const val = document.getElementById("sports-options").value;
      if (val && !selectedSports.includes(val)) {
        selectedSports.push(val);
        renderSportsList();
      }
    }
    // حذف رياضة
    if (e.target.parentElement?.className === "selected-item") {
      const idx = +e.target.dataset.idx;
      selectedSports.splice(idx, 1);
      renderSportsList();
    }
    // حذف الحساب
    if (e.target.id === "delete-account-btn") {
      if (confirm("هل أنت متأكد أنك تريد حذف الحساب؟ سيتم حذف كل بياناتك نهائياً!")) {
        fetch("/api/delete-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: user.username })
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            localStorage.removeItem("fitlink-current-user");
            window.location.href = "index.html";
          } else {
            document.getElementById("profile-msg").textContent = data.message || "حدث خطأ أثناء حذف الحساب.";
          }
        });
      }
    }
  });

  // حفظ التعديلات
  box.addEventListener("submit", function(e) {
    e.preventDefault();
    if (!editMode) return;

    const newEmail = document.getElementById("profile-email").value.trim();
    const newAge = parseInt(document.getElementById("profile-age").value, 10);
    const newCountry = document.getElementById("profile-country").value;
    const newPassword = document.getElementById("profile-password")?.value.trim();

    if (!newEmail || !newAge || !newCountry || selectedSports.length === 0) {
      document.getElementById("profile-msg").textContent = "يرجى ملء جميع الحقول.";
      return;
    }

    // تحقق من الباسوورد إذا تم إدخاله
    if (newPassword) {
      const valid = /^(?=.*\d).{8,}$/.test(newPassword);
      if (!valid) {
        document.getElementById("profile-msg").textContent = "كلمة المرور يجب أن تكون 8 أحرف على الأقل وتحتوي على رقم.";
        return;
      }
    }

    // تحقق من توفر البريد الإلكتروني
    fetch("/api/check-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: newEmail, username: user.username })
    })
    .then(res => res.json())
    .then(data => {
      if (!data.available) {
        document.getElementById("profile-msg").textContent = "البريد الإلكتروني مستخدم بالفعل.";
        return;
      }

      // تحديث البيانات في السيرفر
      fetch("/api/update-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user.username,
          email: newEmail,
          age: newAge,
          sports: selectedSports,
          country: newCountry,
          password: newPassword
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          user.email = newEmail;
          user.age = newAge;
          user.sports = [...selectedSports];
          user.country = newCountry;
          localStorage.setItem("fitlink-current-user", JSON.stringify(user));
          editMode = false;
          renderProfile();
          document.getElementById("profile-msg").textContent = "تم حفظ التعديلات بنجاح!";
        } else {
          document.getElementById("profile-msg").textContent = data.message || "حدث خطأ أثناء الحفظ.";
        }
      });
    });
  });
});