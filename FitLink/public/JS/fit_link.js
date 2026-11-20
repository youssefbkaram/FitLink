// document.addEventListener("DOMContentLoaded", () => {

//   const navLinks = document.querySelectorAll(

//     ".main-nav .nav-item, .close-detail-btn, .btn-more"

//   );

//   const pageSections = document.querySelectorAll(".page-section");

//   const authSection = document.getElementById("auth-section");

//   const userInfoSection = document.getElementById("user-info-section");

//   const usernameDisplay = document.getElementById("username-display");

//   const logoutBtn = document.getElementById("logout-btn");

//   const authRequiredItems = document.querySelectorAll(".auth-required-item");

//   const authRequiredButtons = document.querySelectorAll(

//     ".auth-required-button"

//   );

//   const loginForm = document.getElementById("login-form-actual");

//   const registerForm = document.getElementById("register-form-actual");



//   let isLoggedIn = false;

//   let currentUsername = "";



//   // Function to update UI based on login status

//   const updateUI = () => {

//     if (isLoggedIn) {

//       authSection.style.display = "none";

//       userInfoSection.style.display = "flex";

//       usernameDisplay.textContent = currentUsername;



//       authRequiredItems.forEach((item) => {

//         item.style.display = "block";

//       });

//       authRequiredButtons.forEach((button) => {

//         button.style.display = "block";

//       });

//     } else {

//       authSection.style.display = "flex";

//       userInfoSection.style.display = "none";



//       authRequiredItems.forEach((item) => {

//         item.style.display = "none";

//       });

//       authRequiredButtons.forEach((button) => {

//         button.style.display = "none";

//       });

//     }

//   };



//   // Function to handle page navigation

//   const navigateToPage = (targetId) => {

//     pageSections.forEach((section) => {

//       section.classList.remove("active-page");

//       section.style.display = "none";

//     });



//     const targetPage = document.getElementById(targetId);

//     if (targetPage) {

//       targetPage.classList.add("active-page");

//       targetPage.style.display = "block";

//       window.scrollTo({ top: 0, behavior: "smooth" });

//     }

//   };



//   // Event listeners for navigation links

//   navLinks.forEach((link) => {

//     link.addEventListener("click", (e) => {

//       e.preventDefault();

//       const href = link.getAttribute("href");

//       if (href && href.startsWith("#")) {

//         const targetId = href.substring(1);



//         if (

//           (targetId === "academies-page" || targetId === "trainers-page") &&

//           !isLoggedIn

//         ) {

//           alert("يجب تسجيل الدخول لعرض هذه الصفحة.");

//           navigateToPage("login-form");

//           return;

//         }

//         navigateToPage(targetId);

//       }

//     });

//   });



//   // Handle initial page load to show home page and correct auth state

//   const initialHash = window.location.hash.substring(1);

//   if (initialHash) {

//     navigateToPage(initialHash);

//   } else {

//     navigateToPage("home-page");

//   }

//   updateUI(); // Set initial UI state



//   // Simulate Login (for demonstration)

//   if (loginForm) {

//     loginForm.addEventListener("submit", (e) => {

//       e.preventDefault();

//       const usernameInput = loginForm.querySelector("#login-username");

//       const passwordInput = loginForm.querySelector("#login-password");

//       const username = usernameInput.value;

//       const password = passwordInput.value;



//       // Basic validation (for demo purposes)

//       if (username && password) {

//         isLoggedIn = true;

//         currentUsername = username;

//         updateUI();

//         navigateToPage("home-page");

//         alert("أهلاً بك، ${username}! لقد تم تسجيل دخولك بنجاح.");

//         loginForm.reset();

//       } else {

//         alert("الرجاء إدخال اسم المستخدم وكلمة المرور.");

//       }

//     });

//   }

//   // Handle Logout

//   if (logoutBtn) {

//     logoutBtn.addEventListener("click", (e) => {

//       e.preventDefault();

//       isLoggedIn = false;

//       currentUsername = "";

//       updateUI();

//       navigateToPage("home-page");

//       alert("تم تسجيل الخروج بنجاح.");

//     });

//   }



//   // Handle direct link clicks for academy/trainer cards to show detail pages

//   document.querySelectorAll(".academy-card, .trainer-card").forEach((card) => {

//     card.addEventListener("click", (e) => {

//       const href = card.getAttribute("href");

//       if (href && href.startsWith("#")) {

//         const targetId = href.substring(1);

//         navigateToPage(targetId);

//       }

//     });

//   });

// });


document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll(
    ".main-nav .nav-item, .close-detail-btn, .btn-more"
  );
  const pageSections = document.querySelectorAll(".page-section");
  const authSection = document.getElementById("auth-section");
  const userInfoSection = document.getElementById("user-info-section");
  const usernameDisplay = document.getElementById("username-display");
  const logoutBtn = document.getElementById("logout-btn");
  const authRequiredItems = document.querySelectorAll(".auth-required-item");
  const authRequiredButtons = document.querySelectorAll(".auth-required-button");
  const loginForm = document.getElementById("login-form-actual");
  const registerForm = document.getElementById("register-form-actual");

  // Get user from localStorage
  function getCurrentUser() {
    const userJson = localStorage.getItem("fitlink-current-user");
    return userJson ? JSON.parse(userJson) : null;
  }

  // Update UI based on login state
  function updateUI() {
    const user = getCurrentUser();
    if (user && user.username) {
      if (authSection) authSection.style.display = "none";
      if (userInfoSection) userInfoSection.style.display = "flex";
      if (usernameDisplay) usernameDisplay.textContent = user.username;
      authRequiredItems.forEach((item) => (item.style.display = "block"));
      authRequiredButtons.forEach((button) => (button.style.display = "block"));
    } else {
      if (authSection) authSection.style.display = "flex";
      if (userInfoSection) userInfoSection.style.display = "none";
      authRequiredItems.forEach((item) => (item.style.display = "none"));
      authRequiredButtons.forEach((button) => (button.style.display = "none"));
    }
  }

  // Navigation
  function navigateToPage(targetId) {
    pageSections.forEach((section) => {
      section.classList.remove("active-page");
      section.style.display = "none";
    });
    const targetPage = document.getElementById(targetId);
    if (targetPage) {
      targetPage.classList.add("active-page");
      targetPage.style.display = "block";
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  // Navigation link events
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (href && href.startsWith("#")) {
        e.preventDefault();
        const targetId = href.substring(1);
        const user = getCurrentUser();
        if (
          (targetId === "academies-page" || targetId === "trainers-page") &&
          !(user && user.username)
        ) {
          alert("يجب تسجيل الدخول لعرض هذه الصفحة.");
          navigateToPage("login-form");
          return;
        }
        navigateToPage(targetId);
      }
    });
  });

  // Initial page load
  const initialHash = window.location.hash.substring(1);
  if (initialHash) {
    navigateToPage(initialHash);
  } else {
    navigateToPage("home-page");
  }
  updateUI();

  // Login form
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const usernameInput = loginForm.querySelector("#login-username");
      const passwordInput = loginForm.querySelector("#login-password");
      const username = usernameInput.value.trim();
      const password = passwordInput.value.trim();
      if (username && password) {
        // Save user object to localStorage
        localStorage.setItem(
          "fitlink-current-user",
          JSON.stringify({ username: username })
        );
        updateUI();
        navigateToPage("home-page");
        alert(`أهلاً بك، ${username}! لقد تم تسجيل دخولك بنجاح.`);
        loginForm.reset();
      } else {
        alert("الرجاء إدخال اسم المستخدم وكلمة المرور.");
      }
    });
  }

  // Logout
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("fitlink-current-user");
      updateUI();
      navigateToPage("home-page");
      alert("تم تسجيل الخروج بنجاح.");
    });
  }

  // Card click navigation
  document.querySelectorAll(".academy-card, .trainer-card").forEach((card) => {
    card.addEventListener("click", (e) => {
      const href = card.getAttribute("href");
      if (href && href.startsWith("#")) {
        e.preventDefault();
        const targetId = href.substring(1);
        navigateToPage(targetId);
      }
    });
  });
});