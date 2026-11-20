document.addEventListener("DOMContentLoaded", () => {

  // navbar
fetch("../HTML/navbar.html")
  .then((res) => res.text())
  .then((data) => {
    document.getElementById("navbar-container").innerHTML = data;
    // Instead of injecting the script, just call the function if it exists
    if (window.initNavbar) {
      window.initNavbar();
    } else {
      // If navbar.js isn't loaded yet, load it then call initNavbar
      const script = document.createElement("script");
      script.src = "navbar.js";
      script.onload = function () {
        if (window.initNavbar) window.initNavbar();
      };
      document.body.appendChild(script);
    }
  });


    // footer
  fetch("footer.html")
    .then((res) => res.text())
    .then((data) => {
      document.getElementById("footer-container").innerHTML = data;
      const script = document.createElement("script");
      script.src = "footer.js"; // عشان يشتغل الـ JavaScript بعد ما يتحمل الـ navbar
      document.body.appendChild(script);
    });
});
