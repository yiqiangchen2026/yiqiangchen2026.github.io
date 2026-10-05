document.getElementById("year").textContent = new Date().getFullYear();

const sections = document.querySelectorAll(".section");

if (!("IntersectionObserver" in window)) {
  sections.forEach((section) => section.classList.add("is-visible"));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  sections.forEach((section) => observer.observe(section));
}


const themeToggle = document.getElementById("theme-toggle");
const themeMenu = document.getElementById("theme-options");
const themeOptions = [...themeMenu.querySelectorAll("[data-theme-option]")];
const themeLabels = { light: "浅色", dark: "深色", system: "跟随系统" };
const themeIcons = { light: "☀", dark: "☾", system: "◐" };
const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
let themePreference = document.documentElement.dataset.themePreference || "system";

function applyTheme() {
  const theme = themePreference === "system"
    ? (systemTheme.matches ? "dark" : "light")
    : themePreference;
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.themePreference = themePreference;
  themeToggle.setAttribute("aria-label", `选择外观，当前：${themeLabels[themePreference]}`);
  themeToggle.querySelector(".theme-icon").textContent = themeIcons[themePreference];
  themeOptions.forEach(option => option.setAttribute("aria-checked", String(option.dataset.themeOption === themePreference)));
  document.querySelector('meta[name="theme-color"]').content = theme === "dark" ? "#171d19" : "#f7f8f3";
}

function setThemeMenu(open, focusOption = false) {
  themeMenu.hidden = !open;
  themeToggle.setAttribute("aria-expanded", String(open));
  if (open && focusOption) themeOptions.find(option => option.dataset.themeOption === themePreference).focus();
}

themeToggle.addEventListener("click", () => setThemeMenu(themeMenu.hidden, true));
themeOptions.forEach(option => option.addEventListener("click", () => {
  themePreference = option.dataset.themeOption;
  try { localStorage.setItem("yc-theme", themePreference); } catch {}
  applyTheme();
  setThemeMenu(false);
  themeToggle.focus();
}));
document.addEventListener("click", event => {
  if (!event.target.closest(".theme-control")) setThemeMenu(false);
});
document.addEventListener("focusin", event => {
  if (!event.target.closest(".theme-control")) setThemeMenu(false);
});
themeToggle.addEventListener("keydown", event => {
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    setThemeMenu(true, true);
  }
});
themeMenu.addEventListener("keydown", event => {
  const index = themeOptions.indexOf(document.activeElement);
  if (event.key === "Escape") {
    event.preventDefault();
    setThemeMenu(false);
    themeToggle.focus();
  } else if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
    event.preventDefault();
    const next = event.key === "Home" ? 0 : event.key === "End" ? themeOptions.length - 1
      : (index + (event.key === "ArrowDown" ? 1 : -1) + themeOptions.length) % themeOptions.length;
    themeOptions[next].focus();
  }
});
systemTheme.addEventListener("change", () => {
  if (themePreference === "system") applyTheme();
});
window.addEventListener("storage", (event) => {
  if (event.key !== "yc-theme" && event.key !== null) return;
  themePreference = ["light", "dark", "system"].includes(event.newValue) ? event.newValue : "system";
  applyTheme();
});
applyTheme();
