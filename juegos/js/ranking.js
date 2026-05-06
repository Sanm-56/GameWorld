import { supabase } from "./supabase.js"
import { cleanText } from "./mensajes.js"

async function cargarRanking(){

let { data , error } = await supabase
.from("ranking")
.select("*")
.eq("invalido", false) // fuera tramposos duros
.order("tiempo",{ascending:true})

if(error){
console.error(error)
return
}

let tabla=document.getElementById("tablaRanking")

tabla.innerHTML=""

data.forEach((jugador,index)=>{

let fila=document.createElement("tr")

let posicion=document.createElement("td")
posicion.textContent=index+1

let usuario=document.createElement("td")
usuario.textContent = cleanText(jugador.usuario, "Jugador") + (jugador.sospechoso ? " Aviso" : "")

let tiempo=document.createElement("td")
tiempo.textContent=formatearTiempo(jugador.tiempo)

fila.appendChild(posicion)
fila.appendChild(usuario)
fila.appendChild(tiempo)

tabla.appendChild(fila)

})

}

function formatearTiempo(segundos){

let minutos=Math.floor(segundos/60)
let seg=segundos%60

return minutos+":"+(seg<10?"0":"")+seg

}

cargarRanking()
