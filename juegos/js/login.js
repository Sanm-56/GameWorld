import { supabase } from "./supabase.js"

async function entrar(){

let usuario = document.getElementById("usuario").value.trim()
let codigo = document.getElementById("codigo").value.trim()

if(!usuario || !codigo){
alert("Completa los campos")
return
}

// BUSCAR USUARIO
let { data:user } = await supabase
.from("usuarios")
.select("*")
.eq("usuario",usuario)
.maybeSingle()

// SI EL USUARIO YA EXISTE
if(user){

// VERIFICAR QUE EL CODIGO COINCIDA
if(user.codigo !== codigo){

alert("Ese apodo ya está en uso con otro código")
return

}

// ENTRAR
localStorage.setItem("usuario",usuario)
window.location.href="lobby.html"
return

}

// VALIDAR CODIGO
let { data:codigoValido } = await supabase
.from("codigos_invitacion")
.select("*")
.eq("codigo",codigo)
.eq("usado",false)
.maybeSingle()

if(!codigoValido){
alert("Código inválido o ya usado")
return
}

// CREAR USUARIO
await supabase
.from("usuarios")
.insert([
{
usuario:usuario,
codigo:codigo
}
])

// MARCAR CODIGO USADO
await supabase
.from("codigos_invitacion")
.update({usado:true})
.eq("codigo",codigo)

localStorage.setItem("usuario",usuario)

window.location.href="lobby.html"

}

window.entrar = entrar
