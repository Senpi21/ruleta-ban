/* Chats oficiales dentro de la ruleta; compatible con GitHub Pages. */
(() => {
  const canales = {twitch: "zidoshifu", kick: "zidoshifu"};
  const pestañas = [...document.querySelectorAll("[data-chat-platform]")];
  if(!pestañas.length) return;

  const paneles = {
    twitch: document.getElementById("chatPanelTwitch"),
    kick: document.getElementById("chatPanelKick"),
  };
  const marcos = {
    twitch: document.getElementById("chatFrameTwitch"),
    kick: document.getElementById("chatFrameKick"),
  };
  const avisoTwitch = document.getElementById("chatTwitchNotice");
  const recargar = document.getElementById("chatReload");
  const pie = document.getElementById("chatFooterText");
  const contenido = document.getElementById("chatContent");
  const minimizar = document.getElementById("chatToggle");
  let activa = "twitch";
  let minimizado = false;

  function direccionChat(plataforma){
    if(plataforma === "kick"){
      return "https://kick.com/popout/" + encodeURIComponent(canales.kick) + "/chat";
    }
    // Twitch valida el dominio real, incluido usuario.github.io y dominios propios.
    if(!["http:", "https:"].includes(window.location.protocol) || !window.location.hostname){
      return null;
    }
    const url = new URL("https://www.twitch.tv/embed/" + encodeURIComponent(canales.twitch) + "/chat");
    url.searchParams.set("parent", window.location.hostname);
    url.searchParams.set("darkpopout", "");
    return url.href;
  }

  function cargarChat(plataforma){
    const marco = marcos[plataforma];
    const direccion = direccionChat(plataforma);
    if(!direccion){
      marco.hidden = true;
      avisoTwitch.hidden = false;
      return false;
    }
    if(plataforma === "twitch") avisoTwitch.hidden = true;
    marco.hidden = false;
    // Mantiene cada iframe para conservar el chat al cambiar de pestaña.
    if(!marco.dataset.chatLoaded){
      marco.src = direccion;
      marco.dataset.chatLoaded = "true";
    }
    return true;
  }

  function seleccionarChat(plataforma, enfocar = false){
    if(!paneles[plataforma]) return;
    activa = plataforma;
    pestañas.forEach(pestaña => {
      const seleccionada = pestaña.dataset.chatPlatform === plataforma;
      pestaña.setAttribute("aria-selected", String(seleccionada));
      pestaña.tabIndex = seleccionada ? 0 : -1;
      if(seleccionada && enfocar) pestaña.focus();
    });
    Object.entries(paneles).forEach(([nombre, panel]) => {
      panel.hidden = nombre !== plataforma;
    });
    const nombre = plataforma === "twitch" ? "Twitch" : "Kick";
    pie.textContent = "Chat de " + nombre;
    recargar.setAttribute("aria-label", "Recargar chat de " + nombre);
    recargar.disabled = !cargarChat(plataforma);
  }

  pestañas.forEach((pestaña, indice) => {
    pestaña.addEventListener("click", () => seleccionarChat(pestaña.dataset.chatPlatform));
    pestaña.addEventListener("keydown", event => {
      let siguiente;
      if(event.key === "ArrowRight") siguiente = (indice + 1) % pestañas.length;
      else if(event.key === "ArrowLeft") siguiente = (indice - 1 + pestañas.length) % pestañas.length;
      else if(event.key === "Home") siguiente = 0;
      else if(event.key === "End") siguiente = pestañas.length - 1;
      else return;
      event.preventDefault();
      seleccionarChat(pestañas[siguiente].dataset.chatPlatform, true);
    });
  });
  recargar.addEventListener("click", () => {
    const direccion = direccionChat(activa);
    if(direccion) marcos[activa].src = direccion;
  });
  // GitHub o el navegador pueden conservar el HTML previo durante una actualización.
  // El control opcional no debe impedir que se carguen los chats.
  if(minimizar && contenido){
    minimizar.addEventListener("click", () => {
      minimizado = !minimizado;
      contenido.hidden = minimizado;
      document.body.classList.toggle("chat-collapsed", minimizado);
      minimizar.setAttribute("aria-expanded", String(!minimizado));
      const accion = minimizado ? "Mostrar chats" : "Minimizar chats";
      minimizar.setAttribute("aria-label", accion);
      minimizar.title = accion;
      minimizar.textContent = minimizado ? "+" : "−";
    });
  }
  seleccionarChat(activa);
})();
