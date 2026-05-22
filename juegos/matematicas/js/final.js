import { supabase } from "../../js/supabase.js"
import { redirigirFinalNivelSolitario, volverDesdeFinal } from "../../js/mini-torneo.js"
import { escapeHtml } from "../../js/mensajes.js"
import { aplicarPersonalizacionUsuario, instalarEstilosPersonalizacion } from "../../js/personalizacion-visual.js"
import { limpiarFinalProtegido, validarFinalReciente } from "../../js/final-guard.js"

if (redirigirFinalNivelSolitario()) await new Promise(() => {})
if (!validarFinalReciente("matematicas")) await new Promise(() => {})

const podioDiv = document.getElementById("podio")
const rankingDiv = document.getElementById("ranking")
const resumenDiv = document.getElementById("resumenFinal")

const usuario = localStorage.getItem("usuario")
const resultadoLocal = leerResultadoFinalLocal()
const fin = localStorage.getItem("fin_juego") || resultadoLocal?.estado || ""

const mensajeDiv = document.createElement("h2")
document.querySelector(".contenedor").insertBefore(mensajeDiv, podioDiv)

const posicionDiv = document.createElement("h3")
instalarEstilosPersonalizacion()
document.querySelector(".contenedor").insertBefore(posicionDiv, podioDiv)

if(fin === "tiempo"){
mensajeDiv.textContent = "Terminaste por tiempo"
}
else if(fin === "descalificado"){
mensajeDiv.textContent = "Descalificado por actividad sospechosa"
}
else{
mensajeDiv.textContent = "Juego finalizado"
}

renderResumenFinal()

async function cargar(){

let { data, error } = await supabase
.from("ranking")
.select("*")
.eq("juego","matematicas")
.eq("invalido", false)
.order("tiempo", { ascending: false })

podioDiv.innerHTML = ""

if(error || !data) return

data = data.sort(ordenarRankingMatematicas)

let miPos = fin === "descalificado" ? -1 : data.findIndex(j => j.usuario === usuario)

if(miPos >= 0){
posicionDiv.innerHTML = `Puesto #${miPos+1}`
if(miPos === 0){
setTimeout(lanzarConfeti,500)
}
}
else{
posicionDiv.innerHTML = "Sin posicion"
}

podioDiv.innerHTML = ""

if(data[1]){
podioDiv.innerHTML += `<div>2 ${escapeHtml(data[1].usuario)}<br>${formatearResumenRanking(data[1])}</div>`
}

if(data[0]){
podioDiv.innerHTML += `<div>1 ${escapeHtml(data[0].usuario)}<br>${formatearResumenRanking(data[0])}</div>`
}

if(data[2]){
podioDiv.innerHTML += `<div>3 ${escapeHtml(data[2].usuario)}<br>${formatearResumenRanking(data[2])}</div>`
}

rankingDiv.innerHTML = ""

data.forEach((j,i)=>{

const div = document.createElement("div")
div.className = `ranking-row${j.usuario === usuario ? " actual" : ""}`
div.innerHTML = `
<span>#${i+1}</span>
<strong>${escapeHtml(j.usuario)}</strong>
<span>${formatearResumenRanking(j)}</span>
`
rankingDiv.appendChild(div)
aplicarPersonalizacionUsuario(div, j.usuario)

})

}

function normalizarNumero(valor){
const numero = Number(valor)
return Number.isFinite(numero) ? numero : 0
}

function ordenarRankingMatematicas(a, b){
const puntosDiff = normalizarNumero(b.tiempo) - normalizarNumero(a.tiempo)
if(puntosDiff !== 0) return puntosDiff

const correctasDiff = normalizarNumero(b.correctas) - normalizarNumero(a.correctas)
if(correctasDiff !== 0) return correctasDiff

const erroresDiff = normalizarNumero(a.errores) - normalizarNumero(b.errores)
if(erroresDiff !== 0) return erroresDiff

return new Date(a.fecha || 0) - new Date(b.fecha || 0)
}

function formatearResumenRanking(j){
const puntos = normalizarNumero(j.tiempo)
const totalCorrectas = normalizarNumero(j.correctas)
const totalErrores = normalizarNumero(j.errores)
return `${puntos} pts | ${totalCorrectas} C | ${totalErrores} E`
}

function leerResultadoFinalLocal(){
try{
const data = JSON.parse(localStorage.getItem("matematicas_resultado_final") || "null")
return data && data.usuario === usuario ? data : null
}catch{
return null
}
}

function renderResumenFinal(){
if(!resumenDiv) return

if(fin === "descalificado"){
resumenDiv.innerHTML = `
<div>
  <span>Resultado</span>
  <strong>Descalificado</strong>
</div>
`
return
}

if(!resultadoLocal){
resumenDiv.innerHTML = `
<div>
  <span>Resultado</span>
  <strong>Sin resumen local</strong>
</div>
`
return
}

resumenDiv.innerHTML = `
<div>
  <span>Puntos</span>
  <strong>${normalizarNumero(resultadoLocal.puntos)}</strong>
</div>
<div>
  <span>Correctas</span>
  <strong>${normalizarNumero(resultadoLocal.correctas)}</strong>
</div>
<div>
  <span>Errores</span>
  <strong>${normalizarNumero(resultadoLocal.errores)}</strong>
</div>
<div>
  <span>Precision</span>
  <strong>${normalizarNumero(resultadoLocal.precision)}%</strong>
</div>
`
}

function lanzarConfeti(){
for(let i=0;i<80;i++){
let c = document.createElement("div")
c.classList.add("confeti")
c.style.left = Math.random()*100 + "vw"
c.style.background = `hsl(${Math.random()*360},100%,50%)`
c.style.animationDuration = (Math.random()*2+2)+"s"
document.body.appendChild(c)
setTimeout(()=>c.remove(),4000)
}
}

supabase
.channel("mate-ranking")
.on("postgres_changes",
{ event:"*", schema:"public", table:"ranking" },
payload=>{
if(payload.new?.juego === "matematicas"){
cargar()
}
})
.subscribe()

cargar()

localStorage.removeItem("fin_juego")

window.volverLobby = async function(){
limpiarFinalProtegido("matematicas")
localStorage.removeItem("matematicas_resultado_final")
await volverDesdeFinal(supabase)
}
