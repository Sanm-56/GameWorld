import { supabase } from "../../js/supabase.js"

const podioDiv = document.getElementById("podio")
const rankingDiv = document.getElementById("ranking")

const usuario = localStorage.getItem("usuario")
const fin = localStorage.getItem("fin_juego")

const mensajeDiv = document.createElement("h2")
document.querySelector(".contenedor").insertBefore(mensajeDiv, podioDiv)

const posicionDiv = document.createElement("h3")
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

async function cargar(){

let { data, error } = await supabase
.from("ranking")
.select("*")
.eq("juego","matematicas")

podioDiv.innerHTML = ""

if(error || !data) return

let miPos = data.findIndex(j => j.usuario === usuario)

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
podioDiv.innerHTML += `<div>2 ${data[1].usuario}<br>${data[1].tiempo}</div>`
}

if(data[0]){
podioDiv.innerHTML += `<div>1 ${data[0].usuario}<br>${data[0].tiempo}</div>`
}

if(data[2]){
podioDiv.innerHTML += `<div>3 ${data[2].usuario}<br>${data[2].tiempo}</div>`
}

rankingDiv.innerHTML = ""

data.forEach((j,i)=>{

const div = document.createElement("div")
div.className = `ranking-row${j.usuario === usuario ? " actual" : ""}`
div.innerHTML = `
<span>#${i+1}</span>
<strong>${j.usuario}</strong>
<span>${j.tiempo} pts</span>
`
rankingDiv.appendChild(div)

})

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
if(payload.new.juego === "matematicas"){
cargar()
}
})
.subscribe()

cargar()

localStorage.removeItem("fin_juego")

window.volverLobby = async function(){
let { data } = await supabase
.from("estado_torneo")
.select("estado")
.eq("id",1)
.single()

if(data?.estado !== "espera"){
alert("Torneo aun activo")
return
}

localStorage.removeItem("juego_actual")
window.location.href = "lobby.html"
}
