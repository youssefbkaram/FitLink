document.addEventListener("DOMContentLoaded", function() {
  const params = new URLSearchParams(window.location.search);
  const prodId = params.get("id");
  const box = document.getElementById("product-details-box");

  fetch("/api/products")
    .then(res => res.json())
    .then(products => {
      const prod = products.find(p => String(p.id) === String(prodId));
      if (!prod) {
        box.innerHTML = "<p>المنتج غير موجود.</p>";
        return;
      }

      box.innerHTML = `
        <button class="back-btn" onclick="window.location.href='store_main.html'">عودة</button>
        <div class="product-details-header">
          <img src="${prod.img}" alt="${prod.name}" class="product-details-img" />
          <div class="product-details-title">${prod.name}</div>
          ${prod.eco ? `<span class="eco-badge"><i class="fas fa-leaf"></i> صديق للبيئة</span>` : ""}
        </div>
        <div class="product-details-meta">
          <div class="price">السعر: ${prod.price} جنيه</div>
          <div class="points-price">أو ${prod.points} نقطة</div>
        </div>
        <div class="product-details-desc">${prod.desc}</div>
        <div class="product-details-actions">
          <button class="btn btn-primary-action" id="buy-btn">شراء</button>
          <button class="btn btn-secondary-action" id="buy-points-btn">شراء بالنقاط</button>
        </div>
      `;

      // زر الشراء العادي
      document.getElementById("buy-btn").onclick = function() {
        alert(`تم شراء ${prod.name} بنجاح!`);
      };

      // زر الشراء بالنقاط
      document.getElementById("buy-points-btn").onclick = async function() {
        let user = JSON.parse(localStorage.getItem("fitlink-current-user"));
        if (!user || user.role !== "trainee") {
          showSuccessMsg("المتجر متاح للمتدربين فقط.", false);
          return;
        }

        const res = await fetch("/api/get-user?username=" + encodeURIComponent(user.username));
        if (res.ok) {
          const userData = await res.json();
          user.points = userData.points;
        }

        if (user.points < prod.points) {
          showSuccessMsg("ليس لديك نقاط كافية!", false);
          return;
        }

        user.points -= prod.points;
        const navbarPoints = document.getElementById("user-points-navbar");
        if (navbarPoints) navbarPoints.textContent = user.points;
        localStorage.setItem("fitlink-current-user", JSON.stringify(user));
        await fetch("/api/update-user-points", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: user.username, points: user.points })
        });

        showSuccessMsg(`تم شراء ${prod.name} بنجاح!<br>عدد نقاطك الحالي: <b>${user.points}</b>`, true);
      };

      // رسالة نجاح منسقة تظهر 5 ثواني
      function showSuccessMsg(msg, success = true) {
        let msgDiv = document.getElementById("purchase-success-msg");
        if (!msgDiv) {
          msgDiv = document.createElement("div");
          msgDiv.id = "purchase-success-msg";
          document.body.appendChild(msgDiv);
        }
        msgDiv.innerHTML = msg;
        msgDiv.className = success ? "purchase-success" : "purchase-error";
        msgDiv.style.display = "block";
        setTimeout(() => {
          msgDiv.style.display = "none";
          if (success) location.reload();
        }, 3000);
      }
    })
    .catch(err => {
      console.error("فشل في جلب المنتجات:", err);
      box.innerHTML = "<p>حدث خطأ أثناء تحميل تفاصيل المنتج.</p>";
    });
});