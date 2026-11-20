document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const academyId = params.get("academy");
  const summaryBox = document.getElementById("academy-summary");
  const paymentForm = document.getElementById("payment-form");
  const msg = document.getElementById("payment-msg");

  // جلب بيانات الأكاديمية
  let academy = null;
  if (academyId) {
    try {
      const res = await fetch("/api/academies");
      const academies = await res.json();
      academy = academies.find(a => String(a.id) === String(academyId));
    } catch {
      // ignore
    }
  }
  if (!academy) {
    summaryBox.innerHTML = "<p>لم يتم العثور على الأكاديمية.</p>";
    paymentForm.style.display = "none";
    return;
  }

  summaryBox.innerHTML = `
    <h3>${academy.name}</h3>
    <p><i class="fas fa-map-marker-alt"></i> ${academy.address}</p>
    <p><i class="fas fa-flag"></i> ${academy.country === "EG" ? "مصر" : academy.country === "SA" ? "السعودية" : "الإمارات"}</p>
    <p><i class="fas fa-money-bill-wave"></i> ${academy.price ? academy.price + " جنيه شهرياً" : "غير محدد"}</p>
    <p><i class="fas fa-dumbbell"></i> الرياضات: ${(academy.sports || []).join(", ")}</p>
  `;

  // تبديل الحقول حسب طريقة الدفع
  const cardFields = document.getElementById("card-fields");
  const bankFields = document.getElementById("bank-fields");
  paymentForm.paymentMethod = "card";
  function setRequiredFields(method) {
    // بطاقة بنكية
    document.getElementById("card-number").required = method === "card";
    document.getElementById("card-expiry").required = method === "card";
    document.getElementById("card-cvc").required = method === "card";
    document.getElementById("card-holder").required = method === "card";
    // تحويل بنكي
    document.getElementById("bank-name").required = method === "bank";
    document.getElementById("bank-ref").required = method === "bank";
  }

  paymentForm.addEventListener("change", (e) => {
    if (e.target.name === "payment-method") {
      cardFields.style.display = e.target.value === "card" ? "block" : "none";
      bankFields.style.display = e.target.value === "bank" ? "block" : "none";
      paymentForm.paymentMethod = e.target.value;
      setRequiredFields(e.target.value); // تحديث required حسب الطريقة
    }
  });

  // عند أول تحميل الصفحة
  setRequiredFields(paymentForm.paymentMethod || "card");

  // التحقق وإرسال الطلب
  async function registerSubscription(academy) {
    const currentUser = JSON.parse(localStorage.getItem("fitlink-current-user"));
    if (!currentUser) return false;
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: currentUser.username,
          academyId: academy.id,
          subscribeDate: Date.now()
        })
      });
      const data = await res.json();
      return data.success;
    } catch {
      return false;
    }
  }

  paymentForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "";

    const method = paymentForm.paymentMethod || "card";
    if (method === "card") {
      // تحقق من بيانات البطاقة فقط
      const cardNumber = document.getElementById("card-number").value.replace(/\s+/g, "");
      const cardExpiry = document.getElementById("card-expiry").value.trim();
      const cardCvc = document.getElementById("card-cvc").value.trim();
      const cardHolder = document.getElementById("card-holder").value.trim();
      if (!/^\d{16}$/.test(cardNumber)) {
        msg.textContent = "رقم البطاقة غير صحيح.";
        return;
      }
      if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
        msg.textContent = "تاريخ الانتهاء غير صحيح (MM/YY).";
        return;
      }
      if (!/^\d{3,4}$/.test(cardCvc)) {
        msg.textContent = "رمز الأمان غير صحيح.";
        return;
      }
      if (!cardHolder) {
        msg.textContent = "يرجى إدخال اسم حامل البطاقة.";
        return;
      }
      msg.style.color = "green";
      msg.textContent = "تم الدفع بنجاح! ✅";
      setTimeout(() => paymentForm.reset(), 1200); // تأخير بسيط
    } else if (method === "bank") {
      const bankName = document.getElementById("bank-name").value.trim();
      const bankRef = document.getElementById("bank-ref").value.trim();
      if (!bankName || !bankRef) {
        msg.textContent = "يرجى إدخال جميع بيانات التحويل البنكي.";
        return;
      }
      msg.style.color = "green";
      msg.textContent = "تم إرسال طلب الدفع بنجاح! سيتم مراجعة التحويل خلال 24 ساعة.";
      setTimeout(() => paymentForm.reset(), 1200); // تأخير بسيط
    }
  });
});