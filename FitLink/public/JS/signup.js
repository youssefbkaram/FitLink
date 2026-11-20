// auth.js — now connected to backend!

const registerForm = document.getElementById("register-form-actual");

const sportsSelect = document.getElementById("sports-select");
const customSportInput = document.getElementById("custom-sport-input");
const sportsListContainer = document.getElementById("selected-sports-list");

const roleSelect = document.getElementById("reg-role");
const ageInput = document.getElementById("reg-age");
const usernameInput = document.getElementById("reg-username");
const emailInput = document.getElementById("reg-email");
const passwordInput = document.getElementById("reg-password");
const confirmPasswordInput = document.getElementById("reg-confirm-password");

let selectedSports = [];

const renderSportsList = () => {
  sportsListContainer.innerHTML = "";
  selectedSports.forEach((sport, index) => {
    const tag = document.createElement("div");
    tag.className = "sport-tag";
    tag.innerHTML = `${sport} <button class="remove-sport" data-index="${index}">×</button>`;
    sportsListContainer.appendChild(tag);
  });
};

sportsSelect.addEventListener("change", () => {
  const chosen = sportsSelect.value;
  if (chosen === "other") {
    customSportInput.style.display = "block";
    customSportInput.focus();
  } else if (chosen && !selectedSports.includes(chosen)) {
    selectedSports.push(chosen);
    renderSportsList();
    customSportInput.style.display = "none";
  }
  sportsSelect.selectedIndex = 0;
});

customSportInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && customSportInput.value.trim()) {
    e.preventDefault();
    const sport = customSportInput.value.trim();
    if (!selectedSports.includes(sport)) {
      selectedSports.push(sport);
      renderSportsList();
    }
    customSportInput.value = "";
    customSportInput.style.display = "none";
  }
});

sportsListContainer.addEventListener("click", (e) => {
  if (e.target.classList.contains("remove-sport")) {
    const idx = parseInt(e.target.dataset.index, 10);
    selectedSports.splice(idx, 1);
    renderSportsList();
  }
});

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();
    const age = ageInput.value.trim();
    const userRole = roleSelect ? roleSelect.value : "";
    const country = document.getElementById("country").value;

    if (!username || !email || !password || !confirmPassword || !age || !userRole) {
      alert("يرجى ملء جميع الحقول المطلوبة.");
      return;
    }

    if (password !== confirmPassword) {
      alert("كلمتا المرور غير متطابقتين.");
      return;
    }

    const pwdRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!pwdRegex.test(password)) {
      alert("كلمة المرور يجب أن تكون 8 أحرف على الأقل وتحتوي على أرقام وحروف.");
      return;
    }

    if (selectedSports.length === 0) {
      alert("اختر رياضة واحدة على الأقل.");
      return;
    }

    // 🟢 إرسال البيانات إلى الخادم
    try {
      const bodyData = {
        username,
        email,
        password,
        age,
        role: userRole,
        sports: selectedSports,
        country
      };

      // أضف النقاط فقط إذا كان الدور متدرب
      if (userRole === "trainee" || userRole === "متدرب") {
        bodyData.points = 0;
      }

      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData)
      });

      const data = await res.json();
      if (res.ok) {
        alert("تم إنشاء الحساب بنجاح! يمكنك تسجيل الدخول الآن.");
        registerForm.reset();
        selectedSports = [];
        renderSportsList();
        window.location.hash = "#login-form";
      } else {
        alert("خطأ: " + data.message);
      }
    } catch (err) {
      alert("حدث خطأ أثناء الاتصال بالخادم.");
      console.error(err);
    }
  });
}