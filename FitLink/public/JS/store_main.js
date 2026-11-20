document.addEventListener("DOMContentLoaded", async function() {
  let user = JSON.parse(localStorage.getItem("fitlink-current-user"));
  if (!user || user.role !== "trainee") {
    document.getElementById("store-products").innerHTML = "<p>المتجر متاح للمتدربين فقط.</p>";
    return;
  }

  // جلب النقاط الحقيقية من قاعدة البيانات
  const res = await fetch("/api/get-user?username=" + encodeURIComponent(user.username));
  if (res.ok) {
    const userData = await res.json();
    user.points = userData.points;
    localStorage.setItem("fitlink-current-user", JSON.stringify(user));
  }

  document.getElementById("user-points").textContent = user.points;

  fetch("/api/products")
    .then(res => res.json())
    .then(products => {
      const storeDiv = document.getElementById("store-products");
      storeDiv.innerHTML = products.map(prod => `
        <div class="product-card" data-id="${prod.id}" tabindex="0">
          ${prod.eco ? `<span class="eco-badge"><i class="fas fa-leaf"></i> صديق للبيئة</span>` : ""}
          <img src="${prod.img}" alt="${prod.name}" />
          <h3>${prod.name}</h3>
          <p>${prod.desc}</p>
          <div class="price">السعر: ${prod.price} جنيه</div>
          <div class="points-price">أو ${prod.points} نقطة</div>
          <button class="buy-btn" data-id="${prod.id}">شراء</button>
        </div>
      `).join("");

      // التنقل عند الضغط على الكارت أو الزر
      storeDiv.addEventListener("click", function(e) {
        const card = e.target.closest(".product-card");
        if (card) {
          const prodId = card.dataset.id;
          window.location.href = `product_details.html?id=${prodId}`;
        }
      });
    });
});