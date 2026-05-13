import { supabase } from "./supabase.js"
import { safeAlert } from "./mensajes.js"

const SAVED_NICKNAME_KEY = "savedNickname"
const SAVED_UNIQUE_CODE_KEY = "savedUniqueCode"

function getLoginFields() {
return {
usuarioInput: document.getElementById("usuario"),
codigoInput: document.getElementById("codigo")
}
}

function precargarCredencialesGuardadas() {
const { usuarioInput, codigoInput } = getLoginFields()

if(!usuarioInput || !codigoInput) return

const savedNickname = localStorage.getItem(SAVED_NICKNAME_KEY) || localStorage.getItem("usuario") || ""
const savedUniqueCode = localStorage.getItem(SAVED_UNIQUE_CODE_KEY) || ""

if(savedNickname && !usuarioInput.value){
usuarioInput.value = savedNickname
}

if(savedUniqueCode && !codigoInput.value){
codigoInput.value = savedUniqueCode
}

usuarioInput.setAttribute("autocomplete", usuarioInput.getAttribute("autocomplete") || "nickname")
codigoInput.setAttribute("autocomplete", codigoInput.getAttribute("autocomplete") || "one-time-code")
}

function guardarCredencialesLocales(usuario, codigo) {
localStorage.setItem(SAVED_NICKNAME_KEY, usuario)
localStorage.setItem(SAVED_UNIQUE_CODE_KEY, codigo)
}

async function entrar(){

let usuario = document.getElementById("usuario").value.trim()
let codigo = document.getElementById("codigo").value.trim()

if(!usuario || !codigo){
safeAlert("Completa los campos")
return
}

const { data: loginRpc, error: loginRpcError } = await supabase
.rpc("login_usuario_torneo", {
p_usuario: usuario,
p_codigo: codigo
})

if(!loginRpcError && loginRpc){
if(loginRpc.ok){
guardarCredencialesLocales(usuario, codigo)
localStorage.setItem("usuario", usuario)
window.location.href="lobby.html"
return
}

safeAlert(loginRpc.mensaje || "No se pudo entrar")
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

safeAlert("Ese apodo ya esta en uso con otro codigo")
return

}

// ENTRAR
guardarCredencialesLocales(usuario, codigo)
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
safeAlert("Codigo invalido o ya usado")
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
guardarCredencialesLocales(usuario, codigo)

window.location.href="lobby.html"

}

precargarCredencialesGuardadas()

window.entrar = entrar
