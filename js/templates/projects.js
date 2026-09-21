function pillarTemplate(project) {
  return `
    <article class="pillar-item reveal">
      <span class="pillar-number">${project.number}</span>
      <div class="pillar-icon" aria-hidden="true">${project.icon}</div>
      <div><h3>${project.category}</h3><p>${project.pillarDescription}</p></div>
      <a href="#projetos/${project.id}" aria-label="Conhecer o projeto de ${project.category.toLowerCase()}">↗</a>
    </article>`;
}

function projectPreviewTemplate(project, isLarge = false) {
  const { preview } = project;
  const description = preview.description ? `<p>${preview.description}</p>` : "";

  return `
    <article class="project-preview${isLarge ? " project-preview-large" : ""} reveal">
      <a href="#projetos/${project.id}" aria-label="Conhecer ${preview.title}">
        <picture>
          <source srcset="../imagens/${preview.image}.webp" type="image/webp">
          <img src="../imagens/${preview.image}.jpg" alt="${preview.alt}" width="${preview.width}" height="${preview.height}">
        </picture>
        <div class="preview-overlay"><span>${preview.label}</span><h3>${preview.title}</h3>${description}</div>
      </a>
    </article>`;
}

function projectBadgeTemplate(project) {
  return `<li><span class="feedback-badge feedback-badge-${project.badge.modifier}">${project.badge.label}</span></li>`;
}

function activityTemplate(activity, index) {
  return `<li><span>${String(index + 1).padStart(2, "0")}</span> ${activity}</li>`;
}

function projectDetailTemplate(project, index, totalProjects) {
  const { detail } = project;
  const activities = detail.activities.map(activityTemplate).join("");

  return `
    <div class="project-detail${index % 2 === 1 ? " project-detail-alt" : ""}" id="${project.id}">
      <div class="container project-detail-grid">
        <div class="project-detail-media reveal">
          <span class="project-index">${project.number} / ${String(totalProjects).padStart(2, "0")}</span>
          <picture>
            <source srcset="../imagens/${detail.image}.webp" type="image/webp">
            <img src="../imagens/${detail.image}.jpg" alt="${detail.alt}" width="900" height="720">
          </picture>
        </div>
        <article class="project-detail-copy reveal reveal-delay">
          <p class="eyebrow"><span></span> ${project.category}</p>
          <h2 id="${project.id}-titulo">${detail.title}</h2>
          <p class="project-lead">${detail.lead}</p>
          <div class="project-objective"><h3>Nosso objetivo</h3><p>${detail.objective}</p></div>
          <ul class="impact-list" aria-label="Atividades do projeto">${activities}</ul>
          <a class="button button-primary" href="#voluntariado?area=${detail.formArea}">Quero contribuir <span aria-hidden="true">↗</span></a>
        </article>
      </div>
    </div>`;
}

function renderPillars(projects) {
  return projects.map(pillarTemplate).join("");
}

function renderFeaturedProjects(projects) {
  const [featuredProject, ...otherProjects] = projects;
  const featured = projectPreviewTemplate(featuredProject, true);
  const stack = otherProjects.map((project) => projectPreviewTemplate(project)).join("");

  return `${featured}<div class="featured-stack">${stack}</div>`;
}

function renderProjectBadges(projects) {
  return projects.map(projectBadgeTemplate).join("");
}

function renderProjectDetails(projects) {
  return projects.map((project, index) => projectDetailTemplate(project, index, projects.length)).join("");
}

export function renderDynamicComponents(container, projects) {
  const componentRenderers = {
    "home-pillars": renderPillars,
    "featured-projects": renderFeaturedProjects,
    "project-badges": renderProjectBadges,
    "project-details": renderProjectDetails
  };

  container.querySelectorAll("[data-component]").forEach((component) => {
    const renderComponent = componentRenderers[component.dataset.component];
    if (renderComponent) component.innerHTML = renderComponent(projects);
  });
}
