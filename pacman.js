<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Rebeldía IN.AR — Noticias</title>

<!-- Fuentes -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=Creepster&display=swap" rel="stylesheet">

<!-- Dependencias -->
<script src="https://unpkg.com/@supabase/supabase-js"></script>

<style>
:root{
  --text: #f5f3f4;
  --accent-orange: #ff8a33;
  --accent-purple: #6b2a7a;
}

/* Reset base */
*{margin:0;padding:0;box-sizing:border-box;}
html,body{height:100%; overflow-x:hidden; font-family:"Inter", Arial, sans-serif; color:var(--text);}
body {
  position:relative;
  padding:50px 20px 140px;
  background: linear-gradient(180deg,#1b0b2b 0%,#3a103a 50%,#0b0b0b 100%);
  overflow-x:hidden;
}

/* ---------- MOON ---------- */
.moon {
  position:fixed;
  top:50px;
  left:60px;
  width:130px;
  height:130px;
  border-radius:50%;
  background: radial-gradient(circle at 30% 25%, rgba(255,255,230,0.95) 0%, rgba(255,255,220,0.85) 20%, rgba(240,240,200,0.55) 30%, rgba(220,220,200,0.15) 50%, transparent 70%);
  box-shadow:0 0 90px rgba(255,240,180,0.08), 0 6px 40px rgba(0,0,0,0.6) inset;
  z-index:2;
}
.moon::after {
  content:"";
  position:absolute;
  inset:-20px;
  border-radius:50%;
  background: radial-gradient(circle, rgba(255,230,160,0.06), transparent 35%);
  filter: blur(12px);
}

/* ---------- FOG LAYERS ---------- */
.fog-layer {
  position:fixed;
  left:-20%;
  width:140%;
  height:35vh;
  bottom:-8%;
  background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.0));
  filter: blur(22px);
  opacity:0.45;
  z-index:3;
  pointer-events:none;
  animation: fogShift 28s linear infinite;
}
.fog-layer.layer2 { bottom:-4%; opacity:0.28; height:30vh; filter: blur(28px); animation-duration:36s }
.fog-layer.layer3 { bottom:-16%; opacity:0.18; height:40vh; filter: blur(36px); animation-duration:46s; transform: scaleX(1.1) }
@keyframes fogShift {
  0%{ transform:translateX(0) }
  50%{ transform:translateX(-8%) }
  100%{ transform:translateX(0) }
}

/* ---------- PARTICULAS ---------- */
.particles { position:fixed; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:3; }
.particle { position:absolute; width:6px; height:6px; background:orange; border-radius:50%; opacity:0.6; animation: rise 8s linear infinite; }
@keyframes rise {0%{transform:translateY(0)}100%{transform:translateY(-120vh)}}

/* ---------- BOTONES ---------- */
.btn { font-weight:600; padding:12px 22px; border-radius:12px; border:none; cursor:pointer; transition:all .25s ease; display:inline-flex; align-items:center; gap:10px; color:white; background:linear-gradient(180deg,#f39c12,#f57c00); }
.btn:hover { transform: scale(1.1) translateY(-3px); box-shadow:0 0 50px 18px rgba(255,160,70,0.9),0 18px 60px rgba(0,0,0,0.7); }

/* ---------- CARDS ---------- */
.container {text-align: center; max-width:1100px; margin:0 auto; display:flex; flex-direction:column; gap:26px; align-items:center; z-index:5; position:relative; }
.card { width:100%; background: rgba(255,255,255,0.02); border-radius:14px; padding:18px; box-shadow: 0 6px 30px rgba(0,0,0,0.6); backdrop-filter: blur(4px); border:1px solid rgba(255,255,255,0.03); color: #eae8e8; z-index:5; text-align: center; }
.lead { font-size:16px; line-height:1.5; color:#eae8e8; }
.header h1 { text-align: center; font-family:"Creepster",cursive; font-size:48px; color:var(--accent-orange); text-shadow:0 4px 26px rgba(0,0,0,0.6),0 0 18px rgba(255,140,50,0.08); }

/* ---------- EDITOR ---------- */
#publicarContainer { display:none; text-align:left; margin-top:20px; }
#editorToolbar button { margin:2px; padding:4px 8px; border-radius:4px; border:none; cursor:pointer; }
#editor { background:#333; padding:10px; border-radius:8px; min-height:150px; border:1px solid #555; overflow:auto; color:#fff; }
#noticiasList { list-style:none; padding:0; margin-top:10px; }
.noticia-item { background:#222; padding:10px; border-radius:8px; margin-bottom:10px; text-align:left; }
.noticia-item img { max-width:100%; margin-top:6px; display:block; }

/* ---------- AUTH ---------- */
.auth-container, .user-info { position:fixed; top:16px; right:16px; display:flex; align-items:center; gap:10px; z-index:10; }
.auth-button { padding:10px 18px; font-size:1em; color:white; background-color:#333; border:none; cursor:pointer; border-radius:6px; text-decoration:none; }
.user-info { display:none; cursor:pointer; }
#userLogo { width:40px; height:40px; border-radius:50%; }
#userName { font-weight:600; font-size:1em; color:white; }
.dropdown-menu { display:none; position:absolute; top:56px; right:0; background-color:#000; border-radius:6px; box-shadow:0 4px 12px rgba(0,0,0,0.4); width:160px; text-align:left; z-index:10; }
.dropdown-menu td { padding:10px; cursor:pointer; color:white; }
.dropdown-menu td:hover { background-color: #333; }
</style>
</head>
<body>

<div class="moon"></div>
<div class="fog-layer layer1"></div>
<div class="fog-layer layer2"></div>
<div class="fog-layer layer3"></div>
<div class="particles">
  <div class="particle" style="left:10%;animation-delay:0s"></div>
  <div class="particle" style="left:20%;animation-delay:2s"></div>
  <div class="particle" style="left:35%;animation-delay:1s"></div>
  <div class="particle" style="left:55%;animation-delay:3s"></div>
  <div class="particle" style="left:70%;animation-delay:2.5s"></div>
  <div class="particle" style="left:85%;animation-delay:4s"></div>
</div>

<div class="container">

  <div class="header card">
    <h1>Rebeldía IN.AR</h1>
    <p class="lead">Un lugar para el alumnado — ahora con noticias y editor estilo documento 🎃</p>
  </div>

  <div id="publicarContainer">
    <h3>📢 Crear Noticia</h3>
    <input type="text" id="noticiaTitulo" placeholder="Título de la noticia" style="width:100%; margin-bottom:8px; padding:6px; border-radius:6px; border:1px solid #555; background:#333; color:#fff;">
    <div id="editorToolbar" style="margin-bottom:8px;">
      <button data-cmd="bold">B</button>
      <button data-cmd="italic"><i>I</i></button>
      <button data-cmd="underline"><u>U</u></button>
      <button data-cmd="insertOrderedList">1.</button>
      <button data-cmd="insertUnorderedList">•</button>
      <button data-cmd="createLink">🔗</button>
      <button data-cmd="insertImage">🖼️ URL</button>
      <button id="uploadImageBtn">🖼️ Subir</button>
      <button data-cmd="formatBlock" onclick="document.execCommand('formatBlock', false, 'h3')">H3</button>
    </div>
    <div id="editor" contenteditable="true">✏️ Escribe tu noticia aquí...</div>
    <button class="btn" style="margin-top:8px;" onclick="publicarNoticia()">Publicar Noticia</button>
    <input type="file" id="uploadImageInput" style="display:none;" accept="image/*">
  </div>

  <h2 style="color:var(--accent-orange); margin-top:20px;">Noticias Recientes</h2>
  <ul id="noticiasList"></ul>

</div>

<!-- AUTH -->
<div class="auth-container" id="authContainer">
  <button class="auth-button" onclick="window.location.href='l.html'">Iniciar sesión / Registrarse</button>
</div>

<div class="user-info" id="userInfo">
  <img id="userLogo" src="logoDefault.png" alt="Logo del usuario">
  <div style="text-align:left">
    <div id="userName">Usuario</div>
    <div style="font-size:12px;color:#cfcacd">Ver perfil</div>
  </div>
</div>

<div class="dropdown-menu" id="dropdownMenu">
  <table>
    <tr><td onclick="logout()">🚪 Cerrar sesión</td></tr>
  </table>
</div>

<script>
const SUPABASE_URL = "https://jdvwlfogkzrzovepzjqa.supabase.co";
const SUPABASE_KEY = "TU_SUPABASE_KEY";
const { createClient } = window.supabase;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let currentUser = { id:"1", username:"Peketruli" }; // temporal para test
document.getElementById("publicarContainer").style.display="block"; // temporal para test

// Toolbar
document.querySelectorAll("#editorToolbar button[data-cmd]").forEach(btn=>{
    btn.addEventListener("click",()=>{
        const cmd=btn.dataset.cmd;
        if(cmd==="createLink"){ const url=prompt("Introduce la URL"); if(url) document.execCommand(cmd,false,url);}
        else if(cmd==="insertImage"){ const url=prompt("URL imagen"); if(url) document.execCommand(cmd,false,url);}
        else{document.execCommand(cmd,false,null);}
        document.getElementById("editor").focus();
    });
});

// Subir imagen desde PC
const uploadBtn = document.getElementById("uploadImageBtn");
const uploadInput = document.getElementById("uploadImageInput");
uploadBtn.addEventListener("click",()=>uploadInput.click());
uploadInput.addEventListener("change",()=> {
    const file = uploadInput.files[0];
    if(file){
        const reader = new FileReader();
        reader.onload = e => {
            const img = document.createElement("img");
            img.src = e.target.result;
            document.getElementById("editor").appendChild(img);
        };
        reader.readAsDataURL(file);
    }
});

// Publicar noticia
async function publicarNoticia(){
    const titulo=document.getElementById("noticiaTitulo").value.trim();
    const contenido=document.getElementById("editor").innerHTML.trim();
    if(!titulo||!contenido) return alert("Completa título y noticia");
    alert("📰 Noticia publicada (temporal, sin DB en demo)");
    document.getElementById("noticiaTitulo").value="";
    document.getElementById("editor").innerHTML="";
}

// Logout
function logout(){
    localStorage.removeItem("currentUser");
    window.location.href="l.html";
}
</script>
</body>
</html>
