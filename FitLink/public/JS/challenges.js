document.addEventListener("DOMContentLoaded", async function() {
  // مثال تحديات ثابتة (يمكنك جلبها من backend لاحقاً)
  const challenges = [
    {
      id: 1,
      title: "المشي 10,000 خطوة يومياً",
      desc: "حاول أن تمشي 10,000 خطوة كل يوم هذا الأسبوع.",
      points: 50
    },
    {
      id: 2,
      title: "شرب 2 لتر ماء يومياً",
      desc: "اشرب 2 لتر ماء يومياً للحفاظ على صحتك.",
      points: 30
    },
    {
      id: 3,
      title: "تمرين رياضي 5 أيام",
      desc: "قم بأي تمرين رياضي لمدة 30 دقيقة على الأقل في 5 أيام.",
      points: 70
    }
  ];

  // جلب بيانات المستخدم الحالي
  let user = JSON.parse(localStorage.getItem("fitlink-current-user"));
  if (!user || user.role !== "trainee") {
    document.getElementById("challenges-list").innerHTML = "<p>هذه الصفحة متاحة للمتدربين فقط.</p>";
    return;
  }

  // جلب حالة التحديات من قاعدة البيانات (backend)
  let completedChallenges = [];
  try {
    const res = await fetch(`/api/user-challenges?username=${encodeURIComponent(user.username)}`);
    if (res.ok) {
      completedChallenges = await res.json();
    }
  } catch { /* إذا لم يوجد سجل، اعتبره فارغ */ }

  // عرض التحديات
  const listDiv = document.getElementById("challenges-list");
  listDiv.innerHTML = challenges.map(challenge => {
    const isCompleted = completedChallenges.includes(challenge.id);
    return `
      <div class="challenge-card${isCompleted ? " completed" : ""}">
        ${isCompleted ? `<div class="challenge-status"><i class="fas fa-check-circle"></i> تم الإنجاز</div>` : ""}
        <div class="challenge-title">${challenge.title}</div>
        <div class="challenge-desc">${challenge.desc}</div>
        <div class="challenge-points"><i class="fas fa-coins"></i> ${challenge.points} نقطة</div>
        <div class="challenge-action">
          ${!isCompleted ? `<button class="btn btn-primary-action" data-id="${challenge.id}">أنجزت التحدي</button>` : ""}
        </div>
      </div>
    `;
  }).join("");

  // عند الضغط على زر "أنجزت التحدي"
  listDiv.addEventListener("click", async function(e) {
    if (e.target.classList.contains("btn-primary-action")) {
      const challengeId = Number(e.target.dataset.id);
      // أرسل للباك اند أن المستخدم أنجز التحدي
      const res = await fetch("/api/complete-challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user.username, challengeId })
      });
      if (res.ok) {
        // حدث النقاط في localStorage وفي الـ navbar
        const data = await res.json();
        user.points = data.points;
        localStorage.setItem("fitlink-current-user", JSON.stringify(user));
        if (document.getElementById("user-points-navbar"))
          document.getElementById("user-points-navbar").textContent = user.points;
        // أعد تحميل الصفحة لإظهار الحالة الجديدة
        location.reload();
      }
    }
  });

  // بعد عرض التحديات
  // تحقق هل أنجز كل التحديات
  const allCompleted = challenges.every(ch => completedChallenges.includes(ch.id));
  const rewardDiv = document.getElementById("weekly-reward-box");
  if (rewardDiv) {
    if (allCompleted) {
      // تحقق هل أخذ الجائزة بالفعل
      let rewardTaken = false;
      try {
        const res = await fetch(`/api/weekly-reward-status?username=${encodeURIComponent(user.username)}`);
        if (res.ok) {
          const data = await res.json();
          rewardTaken = data.taken;
        }
      } catch {}
      if (!rewardTaken) {
        rewardDiv.innerHTML = `
          <div>
            <i class="fas fa-gift fa-2x"></i><br>
            <span>🎁 جائزة الأسبوع الكبرى متاحة الآن!</span><br>
            <button class="reward-btn" id="take-weekly-reward-btn">احصل على الجائزة</button>
          </div>
        `;
        document.getElementById("take-weekly-reward-btn").onclick = async function() {
          const res = await fetch("/api/take-weekly-reward", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: user.username })
          });
          if (res.ok) {
            rewardDiv.innerHTML = `<i class="fas fa-gift fa-2x"></i><br><span>🎉 حصلت على جائزة الأسبوع! تم إضافة 200 نقطة لرصيدك.</span>`;
            user.points += 200;
            localStorage.setItem("fitlink-current-user", JSON.stringify(user));
            if (document.getElementById("user-points-navbar"))
              document.getElementById("user-points-navbar").textContent = user.points;
          }
        };
      } else {
        rewardDiv.innerHTML = `<i class="fas fa-gift fa-2x"></i><br><span>✅ حصلت بالفعل على جائزة الأسبوع!</span>`;
      }
    } else {
      rewardDiv.innerHTML = `<i class="fas fa-gift fa-2x"></i><br><span>أكمل جميع تحديات الأسبوع لتحصل على الجائزة الكبرى!</span>`;
    }
  }
});