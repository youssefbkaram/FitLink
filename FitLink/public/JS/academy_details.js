document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const academyId = params.get("id");
  const detailsBox = document.getElementById("academy-details");

  if (!academyId) {
    detailsBox.innerHTML = "<p>لم يتم تحديد أكاديمية.</p>";
    return;
  }

  fetch("/api/academies")
    .then(res => res.json())
    .then(academies => {
      const academy = academies.find(a => String(a.id) === String(academyId));
      if (!academy) {
        detailsBox.innerHTML = "<p>الأكاديمية غير موجودة.</p>";
        return;
      }

      detailsBox.innerHTML = `
        <button class="back-btn" onclick="window.history.back()">عودة</button>
        <div class="academy-details-header">
          <img class="academy-details-img" src="${academy.image || 'https://placehold.co/260x120/0d284a/fff?text=Academy'}" alt="صورة الأكاديمية" />
          <div class="academy-details-title">${academy.name}</div>
        </div>
        <div class="academy-details-meta">
          <span><i class="fas fa-map-marker-alt"></i> ${academy.address}</span>
          <span><i class="fas fa-flag"></i> ${academy.country === "EG" ? "مصر" : academy.country === "SA" ? "السعودية" : "الإمارات"}</span>
          <span><i class="fas fa-phone"></i> ${academy.countryCode || ""} ${academy.phone || ""}</span>
          <span><i class="fas fa-money-bill-wave"></i> ${academy.price ? academy.price + " جنيه" : "غير محدد"}</span>
        </div>
        <div class="academy-details-section">
          <h4><i class="fas fa-dumbbell"></i> الرياضات المتاحة</h4>
          <ul>
            ${(academy.sports || []).map(s => `<li>${s}</li>`).join("")}
          </ul>
        </div>
        <div class="academy-details-section">
          <h4><i class="fas fa-layer-group"></i> مستويات التدريب</h4>
          <ul>
            ${(academy.levels || []).map(l => `<li>${l}</li>`).join("")}
          </ul>
        </div>
        <div class="academy-details-section">
          <h4><i class="fas fa-users"></i> الفئة العمرية</h4>
          <p>${academy.ages ? `${academy.ages.from} إلى ${academy.ages.to} سنة` : "غير محدد"}</p>
        </div>
        <div class="academy-details-section">
          <h4><i class="fas fa-align-right"></i> الوصف</h4>
          <div class="academy-details-desc">${academy.description || "لا يوجد وصف."}</div>
        </div>
        <div class="academy-details-section" style="text-align:center;">
          <a href="payment.html?academy=${academy.id}" class="btn btn-primary-action" style="width:auto;display:inline-flex;">
            <i class="fas fa-credit-card"></i> اشترك
          </a>
        </div>
      `;
    })
    .catch(() => {
      detailsBox.innerHTML = "<p>حدث خطأ أثناء تحميل بيانات الأكاديمية.</p>";
    });
});