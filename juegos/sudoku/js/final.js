import { supabase } from "../../js/supabase.js"

const podioDiv = document.getElementById("podio")
const rankingDiv = document.getElementById("ranking")

const usuario = localStorage.getItem("usuario")

// 🧠 POSICIÓN DEL JUGADOR (FIX 🔥)
const posicionDiv = document.createElement("h2")
document.querySelector(".contenedor").insertBefore(posicionDiv, podioDiv)

// ⏱️ FORMATEAR TIEMPO
function formatearTiempo(segundos){
let minutos = Math.floor(segundos/60)
let seg = segundos%60
return minutos + ":" + (seg<10?"0":"") + seg
}

async function cargarResultados(){

let juegoActual = localStorage.getItem("juego_actual") || "sudoku"

let { data } = await supabase
.from("ranking")
.select("*")
.eq("invalido", false)
.eq("juego", juegoActual)
.order("tiempo", { ascending: true })

if(!data) return

// 🎯 POSICIÓN
let posicion = data.findIndex(j => j.usuario === usuario)

if(posicion !== -1){

let mensaje = `Quedaste #${posicion+1} de ${data.length}`

if(posicion === 0){
mensaje += " 🥇 ¡GANASTE!"
setTimeout(lanzarConfeti,500)
}
else if(posicion < 3){
mensaje += " 🏆 Podio"
}
else{
mensaje += " 👍"
}

posicionDiv.innerHTML = "🎯 " + mensaje

}else{
posicionDiv.innerHTML = "No estás en el ranking"
}

// 🏆 PODIO
podioDiv.innerHTML = ""

let top3 = data.slice(0,3)

top3.forEach((j,i)=>{

let emoji = ["🥇","🥈","🥉"][i]

let div = document.createElement("div")

div.innerHTML = `
<h3>${emoji} ${j.usuario}</h3>
<p>⏱️ ${formatearTiempo(j.tiempo)}</p>
`

podioDiv.appendChild(div)

})

// 📊 RANKING
rankingDiv.innerHTML = ""

data.forEach((j,i)=>{

let destacado = j.usuario === usuario 
? "style='color:#22c55e; font-weight:bold'" 
: ""

rankingDiv.innerHTML += `
<div ${destacado}>
#${i+1} - ${j.usuario} (${formatearTiempo(j.tiempo)})
</div>
`

})

}

// 🎉 CONFETI
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

// 🔴 TIEMPO REAL
supabase
.channel("final-ranking")
.on("postgres_changes",
{ event: "*", schema: "public", table: "ranking" },
() => cargarResultados()
)
.subscribe()

cargarResultados()

// 🔙 BOTÓN
window.volverLobby = async function(){
const { data } = await supabase
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
