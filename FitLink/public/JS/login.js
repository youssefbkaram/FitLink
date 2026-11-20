document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form-actual");
  const msgBox = document.getElementById("login-msg");

  // دالة لعرض رسالة بشكل جميل ومؤقت
  const flash = (text, type = "error") => {
    msgBox.textContent = text;
    msgBox.className = `flash-msg flash-${type} flash-show`;
    msgBox.style.opacity = "1";

    // إعادة تعيين بعد 4 ثوانٍ
    setTimeout(() => {
      msgBox.style.opacity = "0";
      setTimeout(() => {
        msgBox.className = "flash-msg";
        msgBox.textContent = "";
      }, 400);
    }, 4000);
  };

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value;

    if (!username || !password) {
      return flash("يرجى ملء كل الحقول.");
    }

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const result = await response.json();

      if (response.ok) {
        flash(`مرحبًا بك يا ${result.username}!`, "success");
        localStorage.setItem("fitlink-current-user", JSON.stringify(result));
        setTimeout(() => {
          window.location.href = "index.html";
        }, 1000);
      } else {
        flash(result.error || "اسم المستخدم أو كلمة المرور غير صحيحة.");
      }
    } catch (err) {
      console.error(err);
      flash("فشل الاتصال بالخادم. تأكد من تشغيل السيرفر.");
    }
  });
});
