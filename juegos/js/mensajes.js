const MOJIBAKE_MAP = new Map([
  ["\u00c3\u00a1", "a"],
  ["\u00c3\u00a9", "e"],
  ["\u00c3\u00ad", "i"],
  ["\u00c3\u00b3", "o"],
  ["\u00c3\u00ba", "u"],
  ["\u00c3\u00b1", "n"],
  ["\u00c3\u0081", "A"],
  ["\u00c3\u0089", "E"],
  ["\u00c3\u008d", "I"],
  ["\u00c3\u0093", "O"],
  ["\u00c3\u009a", "U"],
  ["\u00c3\u0091", "N"],
  ["\u00c2\u00bf", ""],
  ["\u00c2\u00a1", ""],
  ["\u00e2\u009d\u008c", "X"],
  ["\u00e2\u009c\u0085", "OK"],
  ["\u00e2\u009a\u00a0\u00ef\u00b8\u008f", "Aviso"],
  ["\u00f0\u009f\u00a7\u00b9", ""],
  ["\u00c3\u00b0\u00c5\u00b8\u00c2\u00a7\u00c2\u00b9", ""],
  ["\u00f0\u009f\u0094\u00a5", ""],
  ["\u00c3\u00b0\u00c5\u00b8\u00e2\u0080\u009d\u00c2\u00a5", ""],
  ["\u00f0\u009f\u009b\u0091", ""],
  ["\u00c3\u00b0\u00c5\u00b8\u00e2\u0080\u00ba\u00e2\u0080\u0098", ""],
  ["\u00f0\u009f\u0091\u00a5", ""],
  ["\u00f0\u009f\u008e\u00ae", ""],
  ["\u00f0\u009f\u00a5\u0087", "1."],
  ["\u00f0\u009f\u00a5\u0088", "2."],
  ["\u00f0\u009f\u00a5\u0089", "3."],
])

export function cleanText(value, fallback = "") {
  let text = valueToString(value, fallback)

  for (const [bad, good] of MOJIBAKE_MAP) {
    text = text.replaceAll(bad, good)
  }

  return text
    .replace(/\[object Object\]/g, fallback || "Dato no disponible")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/[^\S\r\n]+/g, " ")
    .trim()
}

export function valueToString(value, fallback = "") {
  if (typeof value === "string") return value
  if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") return String(value)
  if (value instanceof Error) return value.message || fallback

  if (value && typeof value === "object") {
    if (typeof value.message === "string") return value.message
    if (typeof value.mensaje === "string") return value.mensaje
    try {
      return JSON.stringify(value)
    } catch {
      return fallback
    }
  }

  return fallback
}

export function errorMessage(error, fallback = "Error desconocido") {
  return cleanText(error?.message || error?.mensaje || error, fallback) || fallback
}

export function setCleanText(element, value, fallback = "") {
  if (element) element.textContent = cleanText(value, fallback)
}

let modalPendiente = Promise.resolve()

function ensureDialogStyles() {
  if (document.getElementById("modernDialogStyles")) return
  const style = document.createElement("style")
  style.id = "modernDialogStyles"
  style.textContent = `
    .modern-dialog-overlay{position:fixed;inset:0;z-index:9999;display:none;place-items:center;padding:18px;background:rgba(2,6,23,.72);backdrop-filter:blur(12px)}
    .modern-dialog-overlay.open{display:grid}
    .modern-dialog-modal{width:min(430px,100%);display:grid;gap:16px;padding:20px;border:1px solid rgba(56,189,248,.28);border-radius:20px;background:radial-gradient(circle at 90% 0%,rgba(56,189,248,.18),transparent 34%),linear-gradient(145deg,rgba(15,23,42,.98),rgba(2,6,23,.96));box-shadow:0 28px 90px rgba(0,0,0,.48),inset 0 1px 0 rgba(255,255,255,.06);color:#f8fafc;transform:translateY(8px) scale(.98);opacity:0;animation:modernDialogIn .18s ease forwards;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif}
    .modern-dialog-icon{width:42px;height:42px;display:grid;place-items:center;border:1px solid rgba(125,211,252,.34);border-radius:14px;color:#e0f2fe;background:rgba(8,47,73,.52);font-weight:900}
    .modern-dialog-title{margin:0;color:#f8fafc;font-size:1.12rem;line-height:1.2}
    .modern-dialog-message{margin:6px 0 0;color:#cbd5e1;font-size:.94rem;line-height:1.45;overflow-wrap:anywhere}
    .modern-dialog-input{width:100%;min-height:44px;border:1px solid rgba(125,211,252,.24);border-radius:12px;background:rgba(2,6,23,.72);color:#f8fafc;padding:11px 12px;outline:none}
    .modern-dialog-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px}
    .modern-dialog-actions.single{grid-template-columns:1fr}
    .modern-dialog-btn{min-height:42px;border:0;border-radius:10px;padding:10px 12px;color:#fff;font-weight:900;cursor:pointer;background:#2563eb}
    .modern-dialog-btn.secondary{background:rgba(15,23,42,.72);border:1px solid rgba(148,163,184,.2)}
    .modern-dialog-btn.danger{background:#dc2626}
    @keyframes modernDialogIn{to{opacity:1;transform:translateY(0) scale(1)}}
    @media (max-width:560px){.modern-dialog-modal{padding:16px;border-radius:16px}.modern-dialog-actions{grid-template-columns:1fr}}
  `
  document.head.appendChild(style)
}

function createDialogShell() {
  ensureDialogStyles()
  const overlay = document.createElement("div")
  overlay.className = "modern-dialog-overlay"
  overlay.innerHTML = `
    <div class="modern-dialog-modal" role="dialog" aria-modal="true">
      <div class="modern-dialog-icon" aria-hidden="true">!</div>
      <div>
        <h3 class="modern-dialog-title"></h3>
        <p class="modern-dialog-message"></p>
      </div>
      <div class="modern-dialog-input-wrap"></div>
      <div class="modern-dialog-actions"></div>
    </div>
  `
  document.body.appendChild(overlay)
  return overlay
}

function showModernDialog({ title = "Aviso", message = "", acceptText = "Aceptar", cancelText = "Cancelar", confirm = false, prompt = false, danger = false } = {}) {
  if (typeof document === "undefined") return Promise.resolve(prompt ? null : confirm ? false : true)

  modalPendiente = modalPendiente.then(() => new Promise((resolve) => {
    const overlay = createDialogShell()
    const titleEl = overlay.querySelector(".modern-dialog-title")
    const messageEl = overlay.querySelector(".modern-dialog-message")
    const inputWrap = overlay.querySelector(".modern-dialog-input-wrap")
    const actions = overlay.querySelector(".modern-dialog-actions")
    const input = prompt ? document.createElement("input") : null

    titleEl.textContent = cleanText(title, "Aviso")
    messageEl.textContent = cleanText(message, "Mensaje no disponible")
    inputWrap.innerHTML = ""
    actions.innerHTML = ""
    actions.classList.toggle("single", !confirm && !prompt)

    if (input) {
      input.className = "modern-dialog-input"
      input.autocomplete = "off"
      inputWrap.appendChild(input)
    }

    const close = (value) => {
      overlay.classList.remove("open")
      overlay.remove()
      document.removeEventListener("keydown", onKey)
      resolve(value)
    }
    const cancel = document.createElement("button")
    cancel.type = "button"
    cancel.className = "modern-dialog-btn secondary"
    cancel.textContent = cancelText
    cancel.addEventListener("click", () => close(prompt ? null : false))

    const accept = document.createElement("button")
    accept.type = "button"
    accept.className = `modern-dialog-btn${danger ? " danger" : ""}`
    accept.textContent = acceptText
    accept.addEventListener("click", () => close(prompt ? input.value : true))

    if (confirm || prompt) actions.appendChild(cancel)
    actions.appendChild(accept)

    const onKey = (event) => {
      if (event.key === "Escape") close(prompt ? null : false)
      if (event.key === "Enter") close(prompt ? input.value : true)
    }
    document.addEventListener("keydown", onKey)
    overlay.classList.add("open")
    setTimeout(() => (input || accept).focus(), 0)
  }))

  return modalPendiente
}

export function safeAlert(value, fallback = "Mensaje no disponible") {
  return showModernDialog({
    title: "Aviso",
    message: cleanText(value, fallback) || fallback,
    acceptText: "Aceptar",
  })
}

export function confirmAction(message, { title = "Confirmar accion", acceptText = "Aceptar", cancelText = "Cancelar", danger = true } = {}) {
  return showModernDialog({ title, message, acceptText, cancelText, confirm: true, danger })
}

export function promptAction(message, { title = "Completar accion", acceptText = "Aceptar", cancelText = "Cancelar", danger = false } = {}) {
  return showModernDialog({ title, message, acceptText, cancelText, prompt: true, danger })
}

export function escapeHtml(value) {
  return cleanText(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

export function installSafeAlert() {
  if (window.__safeAlertInstalled) return
  window.alert = (value) => safeAlert(value)
  window.__safeAlertInstalled = true
}
