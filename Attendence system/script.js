/* ============================================
   Automated Attendance System - JavaScript Interactions
   Smooth Animations & Premium Effects
   ============================================ */

// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Initialize all components
  initAOS();
  initNavbar();
  initSmoothScroll();
  initCounterAnimation();
  initCardHoverEffects();
  initBackToTop();
  initParallaxEffects();
  initThemeToggle();

  // Remove page loader after everything is ready
  setTimeout(removePageLoader, 500);
});

/* ==========================================
   Initialize AOS (Animate On Scroll)
   ========================================== */
function initAOS() {
  AOS.init({
    // Global settings
    duration: 800, // Animation duration in ms
    easing: "ease-out-cubic", // Easing function
    once: true, // Animation happens only once
    offset: 100, // Offset from the element position
    delay: 0, // Default delay
    anchorPlacement: "top-bottom", // Anchor point for triggering

    // Disable on mobile for better performance
    disable: function () {
      return window.innerWidth < 768 && "phone";
    },
  });
}

/* ==========================================
   Navbar Scroll Effects
   ========================================== */
function initNavbar() {
  const navbar = document.querySelector(".glass-nav");
  const navLinks = document.querySelectorAll(".nav-link");

  // Change navbar style on scroll
  function handleScroll() {
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  }

  // Update active nav link based on scroll position
  function updateActiveLink() {
    const sections = document.querySelectorAll("section[id]");
    const scrollPos = window.scrollY + 150;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute("id");

      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        navLinks.forEach((link) => {
          link.classList.remove("active");
          if (link.getAttribute("href") === `#${sectionId}`) {
            link.classList.add("active");
          }
        });
      }
    });
  }

  // Throttle scroll events for better performance
  let ticking = false;
  window.addEventListener("scroll", function () {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        handleScroll();
        updateActiveLink();
        ticking = false;
      });
      ticking = true;
    }
  });

  // Initial check
  handleScroll();
}

/* ==========================================
   Smooth Scroll for Navigation Links
   ========================================== */
function initSmoothScroll() {
  // Get all links that start with #
  const links = document.querySelectorAll('a[href^="#"]');

  links.forEach((link) => {
    link.addEventListener("click", function (e) {
      const href = this.getAttribute("href");

      // Skip if it's just "#" or external link
      if (href === "#" || href === "") return;

      const target = document.querySelector(href);

      if (target) {
        e.preventDefault();

        // Close mobile menu if open
        const navbarCollapse = document.querySelector(".navbar-collapse");
        if (navbarCollapse.classList.contains("show")) {
          const bsCollapse = new bootstrap.Collapse(navbarCollapse);
          bsCollapse.hide();
        }

        // Smooth scroll to target
        const navbarHeight = document.querySelector(".glass-nav").offsetHeight;
        const targetPosition = target.offsetTop - navbarHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });
      }
    });
  });
}

/* ==========================================
   Animated Number Counter
   ========================================== */
function initCounterAnimation() {
  const counters = document.querySelectorAll(".stat-number");

  // Observer options
  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.5,
  };

  // Animation function
  function animateCounter(counter) {
    const target = parseFloat(counter.getAttribute("data-count"));
    const duration = 2000; // Animation duration in ms
    const startTime = performance.now();
    const startValue = 0;

    // Determine if we need decimal places
    const hasDecimal = target % 1 !== 0;

    function updateCounter(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out-cubic)
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      const currentValue = startValue + (target - startValue) * easeProgress;

      if (hasDecimal) {
        counter.textContent = currentValue.toFixed(1);
      } else {
        counter.textContent = Math.round(currentValue);
      }

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    }

    requestAnimationFrame(updateCounter);
  }

  // Intersection Observer callback
  function handleIntersection(entries, observer) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const counter = entry.target;
        animateCounter(counter);
        observer.unobserve(counter); // Only animate once
      }
    });
  }

  // Create observer and observe all counters
  const observer = new IntersectionObserver(
    handleIntersection,
    observerOptions,
  );

  counters.forEach((counter) => {
    observer.observe(counter);
  });
}

/* ==========================================
   Card Hover Effects with Mouse Tracking
   ========================================== */
function initCardHoverEffects() {
  const cards = document.querySelectorAll(".feature-card");

  cards.forEach((card) => {
    card.addEventListener("mousemove", function (e) {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      // Update CSS custom properties for gradient effect
      card.style.setProperty("--mouse-x", `${x}%`);
      card.style.setProperty("--mouse-y", `${y}%`);
    });

    card.addEventListener("mouseleave", function () {
      // Reset to center
      card.style.setProperty("--mouse-x", "50%");
      card.style.setProperty("--mouse-y", "50%");
    });
  });

  // Add tilt effect to cards
  initTiltEffect();
}

/* ==========================================
   Subtle Tilt Effect for Cards
   ========================================== */
function initTiltEffect() {
  const tiltCards = document.querySelectorAll(
    ".feature-card, .benefit-floating-card",
  );

  tiltCards.forEach((card) => {
    card.addEventListener("mousemove", function (e) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calculate rotation (max 5 degrees)
      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
    });

    card.addEventListener("mouseleave", function () {
      card.style.transform =
        "perspective(1000px) rotateX(0) rotateY(0) translateY(0)";
    });
  });
}

/* ==========================================
   Back to Top Button
   ========================================== */
function initBackToTop() {
  const backToTopBtn = document.getElementById("backToTop");

  // Show/hide button based on scroll position
  function toggleBackToTop() {
    if (window.scrollY > 500) {
      backToTopBtn.classList.add("visible");
    } else {
      backToTopBtn.classList.remove("visible");
    }
  }

  // Scroll to top when clicked
  backToTopBtn.addEventListener("click", function () {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

  // Listen for scroll with throttling
  let scrollTicking = false;
  window.addEventListener("scroll", function () {
    if (!scrollTicking) {
      window.requestAnimationFrame(function () {
        toggleBackToTop();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  });
}

/* ==========================================
   Parallax Effects
   ========================================== */
function initParallaxEffects() {
  const shapes = document.querySelectorAll(".floating-shapes .shape");

  // Subtle parallax on mouse move
  document.addEventListener("mousemove", function (e) {
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;

    shapes.forEach((shape, index) => {
      const speed = (index + 1) * 15;
      const x = (mouseX - 0.5) * speed;
      const y = (mouseY - 0.5) * speed;

      // Add mouse-based movement to existing animation
      shape.style.transform = `translate(${x}px, ${y}px)`;
    });
  });

  // Parallax on scroll for hero section
  const heroSection = document.querySelector(".hero-section");

  if (heroSection) {
    window.addEventListener("scroll", function () {
      const scrolled = window.scrollY;
      const heroHeight = heroSection.offsetHeight;

      if (scrolled < heroHeight) {
        const heroContent = document.querySelector(".hero-content");
        if (heroContent) {
          heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
          heroContent.style.opacity = 1 - (scrolled / heroHeight) * 0.5;
        }
      }
    });
  }
}

/* ==========================================
   Remove Page Loader
   ========================================== */
function removePageLoader() {
  const loader = document.querySelector(".page-loader");
  if (loader) {
    loader.classList.add("loaded");

    // Remove from DOM after animation
    setTimeout(() => {
      loader.remove();
    }, 500);
  }
}

/* ==========================================
   Typing Effect for Hero Title (Optional)
   ========================================== */
function initTypingEffect() {
  const text = document.querySelector(".hero-title");
  if (!text) return;

  const words = ["Innovation", "Security", "Efficiency", "Accuracy"];
  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function type() {
    const currentWord = words[wordIndex];

    if (isDeleting) {
      charIndex--;
    } else {
      charIndex++;
    }

    // Logic for word changes
    if (!isDeleting && charIndex === currentWord.length) {
      isDeleting = true;
      setTimeout(type, 2000);
      return;
    }

    if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
    }

    setTimeout(type, isDeleting ? 50 : 100);
  }
}

/* ==========================================
   Form Validation (For future use)
   ========================================== */
function initFormValidation() {
  const forms = document.querySelectorAll("form");

  forms.forEach((form) => {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // Add your form validation logic here
      const inputs = form.querySelectorAll("input, textarea");
      let isValid = true;

      inputs.forEach((input) => {
        if (input.hasAttribute("required") && !input.value.trim()) {
          isValid = false;
          input.classList.add("error");
        } else {
          input.classList.remove("error");
        }
      });

      if (isValid) {
        // Form is valid, proceed with submission
        console.log("Form submitted successfully!");
      }
    });
  });
}

/* ==========================================
   Intersection Observer for Animations
   ========================================== */
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll(".animate-on-scroll");

  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.2,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animated");
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  animatedElements.forEach((el) => observer.observe(el));
}

/* ==========================================
   Ripple Effect for Buttons
   ========================================== */
function initRippleEffect() {
  const buttons = document.querySelectorAll(".btn-hero, .btn-nav");

  buttons.forEach((button) => {
    button.addEventListener("click", function (e) {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const ripple = document.createElement("span");
      ripple.className = "ripple";
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;

      button.appendChild(ripple);

      // Remove ripple after animation
      setTimeout(() => ripple.remove(), 600);
    });
  });
}

/* ==========================================
   Lazy Load Images (For future use)
   ========================================== */
function initLazyLoad() {
  const lazyImages = document.querySelectorAll("img[data-src]");

  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute("data-src");
        imageObserver.unobserve(img);
      }
    });
  });

  lazyImages.forEach((img) => imageObserver.observe(img));
}

/* ==========================================
   Prefers Reduced Motion Check
   ========================================== */
function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Disable heavy animations if user prefers reduced motion
if (prefersReducedMotion()) {
  document.documentElement.style.setProperty("--transition-normal", "0.01s");
  document.documentElement.style.setProperty("--transition-slow", "0.01s");
}

/* ==========================================
   Console Welcome Message
   ========================================== */
console.log(
  "%c🎓 Automated Attendance System for Rural Schools",
  "color: #4f46e5; font-size: 16px; font-weight: bold;",
);
console.log(
  "%cBuilt with ❤️ for modern education",
  "color: #6b7280; font-size: 12px;",
);

/* ==========================================
   Theme Toggle (Dark/Light Mode)
   ========================================== */
function initThemeToggle() {
  const themeToggle = document.getElementById("themeToggle");
  const html = document.documentElement;

  // Check for saved theme preference or default to dark
  const savedTheme = localStorage.getItem("theme") || "dark";
  html.setAttribute("data-theme", savedTheme);

  // Toggle theme on button click
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      const currentTheme = html.getAttribute("data-theme");
      const newTheme = currentTheme === "dark" ? "light" : "dark";

      // Add transition class for smooth color changes
      html.style.transition = "background-color 0.3s ease, color 0.3s ease";

      // Set new theme
      html.setAttribute("data-theme", newTheme);

      // Save preference to localStorage
      localStorage.setItem("theme", newTheme);

      // Re-initialize AOS for proper animation colors
      if (typeof AOS !== "undefined") {
        AOS.refresh();
      }
    });
  }

  // Also check system preference on first visit
  if (!localStorage.getItem("theme")) {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    html.setAttribute("data-theme", prefersDark ? "dark" : "light");
  }

  // Listen for system theme changes
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      if (!localStorage.getItem("theme")) {
        html.setAttribute("data-theme", e.matches ? "dark" : "light");
      }
    });
}
