import { supabase } from "../../js/supabase.js"

const podioDiv = document.getElementById("podio")
const rankingDiv = document.getElementById("ranking")

const usuario = localStorage.getItem("usuario")
const juegoActual = localStorage.getItem("juego_actual") || "memoria"

// 🧠 POSICIÓN DEL JUGADOR
const posicionDiv = document.createElement("h2")
document.body.insertBefore(posicionDiv, podioDiv)

// ⏱️ FORMATEAR TIEMPO
function formatearTiempo(segundos){
let minutos = Math.floor(segundos/60)
let seg = segundos%60
return minutos + ":" + (seg<10?"0":"") + seg
}

async function cargarResultados(){

let { data } = await supabase
.from("ranking")
.select("*")
.eq("invalido", false)
.eq("juego", juegoActual) // 🔥 CLAVE
.order("tiempo", { ascending: true })

if(!data || data.length === 0){
podioDiv.innerHTML = "Sin resultados"
return
}

// =============================
// 🧠 POSICIÓN DEL JUGADOR
// =============================
let posicion = data.findIndex(j => j.usuario === usuario)

if(posicion !== -1){

let mensaje = `🎯 Quedaste #${posicion+1} de ${data.length} jugadores`

if(posicion === 0){
mensaje += " 🥇 ¡GANASTE!"
}
else if(posicion < 3){
mensaje += " 🏆 ¡Podio!"
}
else{
mensaje += " 👍 Buen intento"
}

posicionDiv.innerHTML = mensaje

}else{
posicionDiv.innerHTML = "No estás en el ranking"
}

// =============================
// 🥇 PODIO
// =============================
let top3 = data.slice(0,3)

podioDiv.innerHTML = ""

top3.forEach((j, i) => {

let emoji = ["🥇","🥈","🥉"][i]

let div = document.createElement("div")

div.innerHTML = `
<h3>${emoji} ${j.usuario}</h3>
<p>⏱️ ${formatearTiempo(j.tiempo)}</p>
`

podioDiv.appendChild(div)

})

// =============================
// 📊 RANKING COMPLETO
// =============================
rankingDiv.innerHTML = ""

data.forEach((j, i) => {

let div = document.createElement("div")

div.innerHTML = `
#${i+1} - ${j.usuario} (${formatearTiempo(j.tiempo)})
${j.sospechoso ? "⚠️" : ""}
`

rankingDiv.appendChild(div)

})

}


// 🔴 TIEMPO REAL
supabase
.channel("final-ranking")
.on(
"postgres_changes",
{ event: "*", schema: "public", table: "ranking" },
() => cargarResultados()
)
.subscribe()

cargarResultados()

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
