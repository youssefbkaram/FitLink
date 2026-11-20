document.addEventListener("DOMContentLoaded", () => {
  // تحقق أن المستخدم مدرب
  const user = JSON.parse(localStorage.getItem("fitlink-current-user"));
  if (!user || user.role !== "coach") {
    window.location.href = "index.html";
    return;
  }

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
  let selectedSports = [];

  addSportBtn.onclick = () => {
    const sport = sportsSelect.value;
    if (sport && !selectedSports.includes(sport)) {
      selectedSports.push(sport);
      renderSelectedSports();
    }
  };

  function renderSelectedSports() {
    selectedSportsDiv.innerHTML = "";
    selectedSports.forEach((sport, idx) => {
      const item = document.createElement("span");
      item.className = "selected-item";
      item.innerHTML = `${sport} <button type="button" data-idx="${idx}">&times;</button>`;
      selectedSportsDiv.appendChild(item);
    });
  }

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
  let selectedLevels = [];

  addLevelBtn.onclick = () => {
    const level = levelsSelect.value;
    if (level && !selectedLevels.includes(level)) {
      selectedLevels.push(level);
      renderSelectedLevels();
    }
  };

  function renderSelectedLevels() {
    selectedLevelsDiv.innerHTML = "";
    selectedLevels.forEach((level, idx) => {
      const item = document.createElement("span");
      item.className = "selected-item";
      item.innerHTML = `${level} <button type="button" data-idx="${idx}">&times;</button>`;
      selectedLevelsDiv.appendChild(item);
    });
  }

  selectedLevelsDiv.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON") {
      const idx = +e.target.dataset.idx;
      selectedLevels.splice(idx, 1);
      renderSelectedLevels();
    }
  });

  // رفع صورة الأكاديمية (Base64)
  let imageBase64 = "";
  const imageInput = document.getElementById("academy-image");
  const previewImg = document.getElementById("preview-img");
  imageInput.addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        imageBase64 = e.target.result;
        previewImg.src = imageBase64;
        previewImg.style.display = "block";
      };
      reader.readAsDataURL(file);
    } else {
      imageBase64 = "";
      previewImg.style.display = "none";
    }
  });

  // إرسال البيانات
  const form = document.getElementById("add-academy-form");
  const msg = document.getElementById("add-academy-msg");

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

    const academy = {
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
      const res = await fetch("/api/academies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(academy)
      });
      const data = await res.json();
      if (res.ok) {
        msg.textContent = "تم إضافة الأكاديمية بنجاح!";
        msg.style.color = "green";
        form.reset();
        selectedSports = [];
        selectedLevels = [];
        renderSelectedSports();
        renderSelectedLevels();
        previewImg.style.display = "none";
      } else {
        msg.textContent = data.message || "حدث خطأ أثناء الإضافة.";
        msg.style.color = "red";
      }
    } catch (err) {
      msg.textContent = "فشل الاتصال بالخادم.";
      msg.style.color = "red";
    }
  });
});