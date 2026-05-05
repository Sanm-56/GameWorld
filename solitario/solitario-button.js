const menu = document.querySelector(".menu")
const actions = document.querySelector(".acciones")

if (!document.querySelector("[data-solitario-style]")) {
  const style = document.createElement("style")
  style.dataset.solitarioStyle = "true"
  style.textContent = `
    .solitario-menu-btn{
      display:none;
      background:linear-gradient(135deg, #0ea5e9, #eab308);
    }

    @media (max-width: 980px){
      .solitario-sidebar-btn{
        display:none !important;
      }

      .solitario-menu-btn{
        display:block;
        grid-column:1 / -1;
        margin-top:8px;
      }
    }
  `
  document.head.appendChild(style)
}

if (actions && !document.querySelector("[data-solitario-sidebar-button]")) {
  const sidebarButton = document.createElement("button")
  sidebarButton.type = "button"
  sidebarButton.className = "boton profile-btn solitario-sidebar-btn"
  sidebarButton.dataset.solitarioSidebarButton = "true"
  sidebarButton.textContent = "Solitario"
  sidebarButton.addEventListener("click", openSolitario)
  actions.appendChild(sidebarButton)
}

if (menu && !document.querySelector("[data-solitario-menu-button]")) {
  const menuButton = document.createElement("button")
  menuButton.type = "button"
  menuButton.className = "boton solitario-menu-btn"
  menuButton.dataset.solitarioMenuButton = "true"
  menuButton.innerHTML = `
    <span class="emoji">S</span>
    <span class="titulo">Solitario</span>
    <span class="detalle">Mapa de niveles, salas privadas y ranking propio.</span>
  `
  menuButton.addEventListener("click", openSolitario)
  menu.appendChild(menuButton)
}

function openSolitario() {
  window.location.href = "solitario/solitario.html"
}
