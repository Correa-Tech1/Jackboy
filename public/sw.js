/* JACKBOY Service Worker
 * Papel nesta fase: registrar o SW e já responder a PUSH e a cliques em notificação.
 * O "carteiro" (cron no servidor que dispara o push na hora da agenda/tarefa) entra
 * na próxima sessão — este arquivo já está pronto pra recebê-lo.
 */

// Ativa o SW novo imediatamente (sem esperar recarregar todas as abas)
self.addEventListener("install", (event) => {
  self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// PUSH: o servidor manda um empurrão (agenda/tarefa) mesmo com o app fechado.
// Espera um JSON: { title, body, tag, url }
self.addEventListener("push", (event) => {
  let dados = {};
  try { dados = event.data ? event.data.json() : {}; } catch (e) {
    try { dados = { title: "JACKBOY", body: event.data ? event.data.text() : "" }; } catch (e2) { dados = {}; }
  }
  const titulo = dados.title || "JACKBOY";
  const opcoes = {
    body: dados.body || "",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: dados.tag || undefined,       // tag evita empilhar o mesmo lembrete
    renotify: !!dados.tag,
    data: { url: dados.url || "/" },
    vibrate: [80, 40, 80],
  };
  event.waitUntil(self.registration.showNotification(titulo, opcoes));
});

// Clique na notificação: abre/foca o app (na URL indicada, se houver)
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const destino = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((lista) => {
      for (const cli of lista) {
        if ("focus" in cli) { try { cli.navigate(destino); } catch (e) {} return cli.focus(); }
      }
      if (self.clients.openWindow) return self.clients.openWindow(destino);
    })
  );
});

// Permite que a página peça ao SW pra mostrar uma notificação (ponte usada hoje,
// enquanto o push do servidor não está montado). Espera { type, title, body, tag, url }
self.addEventListener("message", (event) => {
  const msg = event.data || {};
  if (msg && msg.type === "JACKBOY_NOTIF") {
    const opcoes = {
      body: msg.body || "",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: msg.tag || undefined,
      renotify: !!msg.tag,
      data: { url: msg.url || "/" },
      vibrate: [80, 40, 80],
    };
    try { self.registration.showNotification(msg.title || "JACKBOY", opcoes); } catch (e) {}
  }
});
