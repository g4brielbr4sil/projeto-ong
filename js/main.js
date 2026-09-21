import { createMenuController } from "./navigation.js";
import { createRouter, redirectLegacyPage } from "./router.js";

document.documentElement.classList.add("js");

const app = document.querySelector("#app");

if (!app) {
  redirectLegacyPage();
} else {
  const navToggle = document.querySelector(".nav-toggle");
  const siteNav = document.querySelector(".site-nav");
  const navCta = document.querySelector(".nav-cta");
  const descriptionMeta = document.querySelector('meta[name="description"]');
  const successToast = document.querySelector("#toastSucesso");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelectorAll("[data-current-year]").forEach((element) => {
    element.textContent = new Date().getFullYear();
  });

  const { closeMenu } = createMenuController({ navToggle, siteNav });
  const router = createRouter({
    app,
    navCta,
    descriptionMeta,
    successToast,
    closeMenu,
    prefersReducedMotion
  });

  router.start();
}
