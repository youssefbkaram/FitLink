function initFooter() {
  // Adjust spacing for footer columns (responsive)
  const footerGrid = document.querySelector('.footer-grid');
  if (footerGrid) {
    footerGrid.style.display = 'flex';
    footerGrid.style.flexWrap = 'wrap';
    footerGrid.style.justifyContent = 'space-between';
    footerGrid.style.gap = '32px';
  }

  // Make social links open real pages (replace # with actual URLs)
  const socialLinks = document.querySelectorAll('.social-links a');
  if (socialLinks.length) {
    socialLinks[0].href = "https://facebook.com";
    socialLinks[1].href = "https://instagram.com";
    socialLinks[2].href = "https://twitter.com";
    socialLinks.forEach(link => link.target = "_blank");
  }
}

window.initFooter = initFooter;
document.addEventListener("DOMContentLoaded", initFooter, { once: true });