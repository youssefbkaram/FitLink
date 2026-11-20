window.initNavbar = function() {
  const user = JSON.parse(localStorage.getItem("fitlink-current-user"));
  const authSection = document.getElementById("auth-section");
  const userInfoSection = document.getElementById("user-info-section");
  const usernameDisplay = document.getElementById("username-display");
  const dropdownToggle = document.getElementById("user-dropdown-toggle");
  const dropdownMenu = document.getElementById("user-menu-list");
  const logoutBtn = document.getElementById("logout-btn");

  // Navbar items
  const academiesNav = document.getElementById("academies-nav-item");
  const coachAcademiesNav = document.getElementById("coach-academies-nav-item");
  const addAcademyNav = document.getElementById("add-academy-nav-item");
  const dropdownCoachAcademies = document.getElementById("dropdown-coach-academies");
  const storeNav = document.getElementById("store-nav-item");
  const challengesNav = document.getElementById("challenges-nav-item");

  // Hide all by default
  if (academiesNav) academiesNav.style.display = "none";
  if (coachAcademiesNav) coachAcademiesNav.style.display = "none";
  if (addAcademyNav) addAcademyNav.style.display = "none";
  if (dropdownCoachAcademies) dropdownCoachAcademies.style.display = "none";
  if (storeNav) storeNav.style.display = "none";
  if (challengesNav) challengesNav.style.display = "none";

  if (user && user.username) {
    if (authSection) authSection.style.display = "none";
    if (userInfoSection) userInfoSection.style.display = "block";
    if (usernameDisplay) usernameDisplay.textContent = user.username;

    if (user.role === "trainee" || user.role === "متدرب") {
      if (academiesNav) academiesNav.style.display = "inline-block";
      if (storeNav) storeNav.style.display = "inline-block";
      if (challengesNav) challengesNav.style.display = "inline-block";
      // إضافة عنصر النقاط كأول عنصر في القائمة
      if (dropdownMenu && !document.getElementById("user-points-menu")) {
        const pointsLi = document.createElement("li");
        pointsLi.id = "user-points-menu";
        pointsLi.style.pointerEvents = "none";
        pointsLi.style.opacity = "1";
        pointsLi.style.cursor = "default";
        pointsLi.innerHTML = `<i class="fas fa-coins"></i> نقاطك: <span id="user-points-navbar">${user.points}</span>`;
        dropdownMenu.insertBefore(pointsLi, dropdownMenu.firstChild);
      }
    } else {
      // إذا لم يكن متدرب احذف عنصر النقاط لو موجود
      const pointsLi = document.getElementById("user-points-menu");
      if (pointsLi) pointsLi.remove();
      if (challengesNav) challengesNav.style.display = "none";
    }
    if (user.role === "coach") {
      if (coachAcademiesNav) coachAcademiesNav.style.display = "inline-block";
      if (addAcademyNav) addAcademyNav.style.display = "inline-block";
      if (dropdownCoachAcademies) dropdownCoachAcademies.style.display = "block";
    }
  }

  if (dropdownToggle && dropdownMenu) {
    dropdownToggle.addEventListener("click", () => {
      dropdownMenu.style.display =
        dropdownMenu.style.display === "block" ? "none" : "block";
    });

    document.addEventListener("click", (e) => {
      if (!dropdownToggle.contains(e.target) && !dropdownMenu.contains(e.target)) {
        dropdownMenu.style.display = "none";
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("fitlink-current-user");
      location.reload();
    });
  }
};

// تحديث النقاط في القائمة عند تغييرها من أي مكان آخر
document.addEventListener("DOMContentLoaded", function() {
  const user = JSON.parse(localStorage.getItem("fitlink-current-user"));
  if (user && (user.role === "trainee" || user.role === "متدرب")) {
    const menu = document.getElementById("user-menu-list");
    if (menu && !document.getElementById("user-points-menu")) {
      const pointsLi = document.createElement("li");
      pointsLi.id = "user-points-menu";
      pointsLi.style.pointerEvents = "none";
      pointsLi.style.opacity = "1";
      pointsLi.style.cursor = "default";
      pointsLi.innerHTML = `<i class="fas fa-coins"></i> نقاطك: <span id="user-points-navbar">${user.points}</span>`;
      menu.insertBefore(pointsLi, menu.firstChild);
    }
  }
});
