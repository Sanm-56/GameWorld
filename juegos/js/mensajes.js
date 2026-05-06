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

export function safeAlert(value, fallback = "Mensaje no disponible") {
  alert(cleanText(value, fallback) || fallback)
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
  const originalAlert = window.alert.bind(window)
  window.alert = (value) => originalAlert(cleanText(value, "Mensaje no disponible") || "Mensaje no disponible")
  window.__safeAlertInstalled = true
}
