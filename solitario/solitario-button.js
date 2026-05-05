const menu = document.querySelector(".menu")

if (menu && !document.querySelector("[data-solitario-button]")) {
  const button = document.createElement("button")
  button.type = "button"
  button.className = "boton"
  button.dataset.solitarioButton = "true"
  button.style.background = "linear-gradient(135deg, #0ea5e9, #eab308)"
  button.innerHTML = `
    <span class="emoji">S</span>
    <span class="titulo">Solitario</span>
    <span class="detalle">Mapa de niveles, salas privadas y ranking propio.</span>
  `
  button.addEventListener("click", () => {
    window.location.href = "solitario/solitario.html"
  })
  menu.appendChild(button)
}
