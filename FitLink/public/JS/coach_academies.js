document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("fitlink-current-user"));
  const listDiv = document.getElementById("coach-academies-list");

  if (!user || user.role !== "coach") {
    listDiv.innerHTML = "<p style='text-align:center;'>هذه الصفحة مخصصة للمدربين فقط.</p>";
    return;
  }

  fetch("/api/academies")
    .then(res => res.json())
    .then(academies => {
      const myAcademies = academies.filter(a => a.coachUsername === user.username);
      if (!myAcademies.length) {
        listDiv.innerHTML = `<p style="text-align:center; color:#888;">لا توجد أكاديميات حتى الآن.</p>`;
        return;
      }
      listDiv.innerHTML = `
        <ul style="padding:0; list-style:none; display:flex; flex-direction:column; gap:16px;">
          ${myAcademies.map(a => `
            <li style="
              background: linear-gradient(90deg, #f7fafd 60%, #e3f0ff 100%);
              border-radius: 12px;
              box-shadow: 0 2px 8px rgba(28,77,140,0.07);
              padding: 18px 16px;
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 12px;
            ">
              <span style="font-weight:bold; color:var(--primary-color); font-size:1.08em;">
                <i class="fas fa-university" style="margin-left:7px; color:var(--accent-color);"></i>
                ${a.name}
              </span>
              <div style="display:flex; gap:8px;">
                <a href="academy_details.html?id=${a.id}" class="btn btn-secondary-action" style="font-weight:bold;">عرض</a>
                <a href="edit_academy.html?id=${a.id}" class="btn btn-primary-action" style="font-weight:bold;">تعديل</a>
              </div>
            </li>
          `).join("")}
        </ul>
      `;
    });
});