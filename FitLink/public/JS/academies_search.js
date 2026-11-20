let allAcademies = [];
let userCountry = null;
let userSports = [];

function getUserInfo() {
  // Example: get user from localStorage
  const user = JSON.parse(localStorage.getItem("fitlink-current-user"));
  if (user) {
    userCountry = user.country || "EG";
    userSports = user.sports || [];
  }
}

function setDefaultFilters() {
  // Set default sports in filter
  const sportsSelect = document.getElementById("filter-sports");
  if (userSports.length && sportsSelect) {
    for (let i = 0; i < sportsSelect.options.length; i++) {
      if (userSports.includes(sportsSelect.options[i].value)) {
        sportsSelect.options[i].selected = true;
      }
    }
  }
}

function fetchAcademies() {
  return fetch("/api/academies")
    .then((res) => res.json())
    .then((academies) => {
      // Filter by user country automatically
      if (userCountry) {
        academies = academies.filter((a) => a.country === userCountry);
      }
      allAcademies = academies;
      renderAcademies(academies);
    });
}

function renderAcademies(academies) {
  const list = document.getElementById("academies-list");
  list.innerHTML = "";
  if (!academies.length) {
    list.innerHTML = "<p>لا توجد أكاديميات متاحة حالياً.</p>";
    return;
  }
  academies.forEach((acad) => {
    const card = document.createElement("div");
    card.className = "academy-card";
    card.innerHTML = `
      <img src="${acad.image || 'https://placehold.co/260x120/0d284a/fff?text=Academy'}" alt="Academy" />
      <h3 class="truncate">${acad.name}</h3>
      <p class="truncate">${acad.address}</p>
      <p class="truncate"><b>الرياضات:</b> ${acad.sports ? acad.sports.join(", ") : ""}</p>
      <p><b>السعر:</b> ${typeof acad.price === "number" ? acad.price + " جنيه" : "غير محدد"}</p>
      <a href="academy_details.html?id=${acad.id}" class="btn btn-primary-action">عرض التفاصيل</a>
    `;
    list.appendChild(card);
  });
}

function getSelectedValues(select) {
  return Array.from(select.selectedOptions).map((opt) => opt.value);
}

function filterAcademies() {
  let filtered = allAcademies.slice();

  // الرياضات
  const sports = getSelectedValues(document.getElementById("filter-sports"));
  if (sports.length) {
    filtered = filtered.filter(
      (a) => a.sports && sports.some((s) => a.sports.includes(s))
    );
  }

  // العنوان
  const address = document.getElementById("filter-address").value.trim();
  if (address) {
    filtered = filtered.filter((a) => a.address && a.address.includes(address));
  }

  // المستوى
  const levels = getSelectedValues(document.getElementById("filter-levels"));
  if (levels.length) {
    filtered = filtered.filter(
      (a) => a.levels && levels.some((l) => a.levels.includes(l))
    );
  }

  // العمر
  const ageFrom = parseInt(
    document.getElementById("filter-age-from").value,
    10
  );
  const ageTo = parseInt(document.getElementById("filter-age-to").value, 10);
  if (!isNaN(ageFrom)) {
    filtered = filtered.filter((a) => a.ages && typeof a.ages.to === "number" && a.ages.to >= ageFrom);
  }
  if (!isNaN(ageTo)) {
    filtered = filtered.filter((a) => a.ages && typeof a.ages.from === "number" && a.ages.from <= ageTo);
  }

  // السعر (لو أضفت price في بيانات الأكاديمية)
  const priceFrom = parseInt(
    document.getElementById("filter-price-from").value,
    10
  );
  const priceTo = parseInt(
    document.getElementById("filter-price-to").value,
    10
  );
  if (!isNaN(priceFrom)) {
    filtered = filtered.filter((a) =>
      typeof a.price === "number" ? a.price >= priceFrom : true
    );
  }
  if (!isNaN(priceTo)) {
    filtered = filtered.filter((a) =>
      typeof a.price === "number" ? a.price <= priceTo : true
    );
  }

  renderAcademies(filtered);
}

function fetchAcademiesAndRender() {
  fetch("/api/academies")
    .then((res) => res.json())
    .then((academies) => {
      const list = document.getElementById("academies-list");
      list.innerHTML = "";
      if (!academies.length) {
        list.innerHTML = "<p>لا توجد أكاديميات متاحة حالياً.</p>";
        return;
      }
      academies.forEach((acad) => {
        const card = document.createElement("div");
        card.className = "academy-card";
        card.innerHTML = `
          <img src="${acad.image || 'https://placehold.co/260x120/0d284a/fff?text=Academy'}" alt="Academy" />
          <h3 class="truncate">${acad.name}</h3>
          <p class="truncate">${acad.address}</p>
          <p class="truncate"><b>الرياضات:</b> ${acad.sports ? acad.sports.join(", ") : ""}</p>
          <p><b>السعر:</b> ${
            typeof acad.price === "number" ? acad.price + " جنيه" : "غير محدد"
          }</p>
          <a href="academy_details.html?id=${
            acad.id
          }" class="btn btn-primary-action">عرض التفاصيل</a>
        `;
        list.appendChild(card);
      });
    });
}

// عند تحميل الصفحة

// --- Modal Filter State ---
let filterState = {
  sports: [],
  address: "",
  levels: [],
  ageFrom: "",
  ageTo: "",
  priceFrom: "",
  priceTo: "",
};

function getUserInfo() {
  const user = JSON.parse(localStorage.getItem("fitlink-current-user"));
  if (user) {
    userCountry = user.country || "EG";
    userSports = user.sports || [];
  }
}

function setDefaultFilters() {
  // Set default sports in filterState
  if (userSports.length) {
    filterState.sports = [...userSports];
  }
}

function fetchAcademies() {
  return fetch("/api/academies")
    .then((res) => res.json())
    .then((academies) => {
      if (userCountry) {
        academies = academies.filter((a) => a.country === userCountry);
      }
      allAcademies = academies;
      renderAcademies(academies);
    });
}

function renderAcademies(academies) {
  const list = document.getElementById("academies-list");
  list.innerHTML = "";
  if (!academies.length) {
    list.innerHTML = "<p>لا توجد أكاديميات متاحة حالياً.</p>";
    return;
  }
  academies.forEach((acad) => {
    const card = document.createElement("div");
    card.className = "academy-card";
    card.innerHTML = `
      <img src="${acad.image || 'https://placehold.co/260x120/0d284a/fff?text=Academy'}" alt="Academy" />
      <h3 class="truncate">${acad.name}</h3>
      <p class="truncate">${acad.address}</p>
      <p class="truncate"><b>الرياضات:</b> ${acad.sports ? acad.sports.join(", ") : ""}</p>
      <p><b>السعر:</b> ${
        typeof acad.price === "number" ? acad.price + " جنيه" : "غير محدد"
      }</p>
      <a href="academy_details.html?id=${
        acad.id
      }" class="btn btn-primary-action">عرض التفاصيل</a>
    `;
    list.appendChild(card);
  });
}

function getSelectedValues(select) {
  return Array.from(select.selectedOptions).map((opt) => opt.value);
}

function applyFilterFromModal() {
  // استخدم القيم المختارة فعليًا من multi-select
  filterState.sports = [...filterSports];
  filterState.levels = [...filterLevels];
  filterState.address = document.getElementById("filter-address").value.trim();
  filterState.ageFrom = document.getElementById("filter-age-from").value;
  filterState.ageTo = document.getElementById("filter-age-to").value;
  filterState.priceFrom = document.getElementById("filter-price-from").value;
  filterState.priceTo = document.getElementById("filter-price-to").value;
}

function setModalInputsFromFilterState() {
  // عكس القيم المختارة في multi-select
  filterSports = Array.isArray(filterState.sports) ? [...filterState.sports] : [];
  filterLevels = Array.isArray(filterState.levels) ? [...filterState.levels] : [];
  renderSelectedSportsFilter();
  renderSelectedLevelsFilter();

  document.getElementById("filter-address").value = filterState.address || "";
  document.getElementById("filter-age-from").value = filterState.ageFrom || "";
  document.getElementById("filter-age-to").value = filterState.ageTo || "";
  document.getElementById("filter-price-from").value = filterState.priceFrom || "";
  document.getElementById("filter-price-to").value = filterState.priceTo || "";
}

function filterAcademies() {
  let filtered = allAcademies.slice();
  // الرياضات
  if (filterState.sports.length) {
    filtered = filtered.filter(
      (a) => a.sports && filterState.sports.some((s) => a.sports.includes(s))
    );
  }
  // العنوان
  if (filterState.address) {
    filtered = filtered.filter(
      (a) => a.address && a.address.includes(filterState.address)
    );
  }
  // المستوى
  if (filterState.levels.length) {
    filtered = filtered.filter(
      (a) => a.levels && filterState.levels.some((l) => a.levels.includes(l))
    );
  }
  // العمر
  const ageFrom = parseInt(filterState.ageFrom, 10);
  const ageTo = parseInt(filterState.ageTo, 10);
  if (!isNaN(ageFrom)) {
    filtered = filtered.filter((a) => a.ages && typeof a.ages.to === "number" && a.ages.to >= ageFrom);
  }
  if (!isNaN(ageTo)) {
    filtered = filtered.filter((a) => a.ages && typeof a.ages.from === "number" && a.ages.from <= ageTo);
  }
  // السعر
  const priceFrom = parseInt(filterState.priceFrom, 10);
  const priceTo = parseInt(filterState.priceTo, 10);
  if (!isNaN(priceFrom)) {
    filtered = filtered.filter((a) =>
      typeof a.price === "number" ? a.price >= priceFrom : true
    );
  }
  if (!isNaN(priceTo)) {
    filtered = filtered.filter((a) =>
      typeof a.price === "number" ? a.price <= priceTo : true
    );
  }
  renderAcademies(filtered);
}

// Modal logic
function openFilterModal() {
  setModalInputsFromFilterState();
  document.getElementById("filter-modal-overlay").style.display = "flex";
  document.body.style.overflow = "hidden";
}
function closeFilterModal() {
  document.getElementById("filter-modal-overlay").style.display = "none";
  document.body.style.overflow = "auto";
}

// --- Multi-select logic for sports ---
let filterSports = [];
let filterLevels = [];

function renderSelectedSportsFilter() {
  const container = document.getElementById("selected-sports-filter");
  container.innerHTML = "";
  filterSports.forEach((sport, idx) => {
    const item = document.createElement("span");
    item.className = "selected-item";
    item.innerHTML = `${sport} <button type="button" data-idx="${idx}">&times;</button>`;
    container.appendChild(item);
  });
}
document.getElementById("add-sport-filter-btn").onclick = function() {
  const val = document.getElementById("sports-options").value;
  if (val && !filterSports.includes(val)) {
    filterSports.push(val);
    renderSelectedSportsFilter();
  }
};
document.getElementById("selected-sports-filter").onclick = function(e) {
  if (e.target.tagName === "BUTTON") {
    const idx = +e.target.dataset.idx;
    filterSports.splice(idx, 1);
    renderSelectedSportsFilter();
  }
};

// --- Multi-select logic for levels ---
function renderSelectedLevelsFilter() {
  const container = document.getElementById("selected-levels-filter");
  container.innerHTML = "";
  filterLevels.forEach((level, idx) => {
    const item = document.createElement("span");
    item.className = "selected-item";
    item.innerHTML = `${level} <button type="button" data-idx="${idx}">&times;</button>`;
    container.appendChild(item);
  });
}
document.getElementById("add-level-filter-btn").onclick = function() {
  const val = document.getElementById("levels-options").value;
  if (val && !filterLevels.includes(val)) {
    filterLevels.push(val);
    renderSelectedLevelsFilter();
  }
};
document.getElementById("selected-levels-filter").onclick = function(e) {
  if (e.target.tagName === "BUTTON") {
    const idx = +e.target.dataset.idx;
    filterLevels.splice(idx, 1);
    renderSelectedLevelsFilter();
  }
};

document.addEventListener("DOMContentLoaded", () => {
  getUserInfo();
  setDefaultFilters();
  fetch("/api/academies")
  .then(res => res.json())
  .then(academies => {
    renderAcademies(academies);
  });

  // Modal events
  document
    .getElementById("open-filter-modal")
    .addEventListener("click", openFilterModal);
  document
    .getElementById("filter-cancel-btn")
    .addEventListener("click", (e) => {
      e.preventDefault();
      closeFilterModal();
    });
  document.getElementById("filter-form").addEventListener("submit", (e) => {
    e.preventDefault();
    applyFilterFromModal();
    filterAcademies();
    closeFilterModal();
  });

  // Optional: close modal on overlay click
  document
    .getElementById("filter-modal-overlay")
    .addEventListener("click", function (e) {
      if (e.target === this) closeFilterModal();
    });
});
