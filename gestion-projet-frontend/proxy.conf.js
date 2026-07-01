/**
 * Proxy de developpement Angular -> Spring Boot
 *
 * En mode "ng serve", l'application tourne sur http://localhost:4200
 * et le backend Spring Boot sur http://localhost:8088. Ce proxy assure
 * que les appels HTTP "/api/*" et les WebSockets "/api/ws/*" soient
 * forwardes correctement vers le backend, en cohérence avec le nginx.conf
 * utilise en production Docker (qui fait la meme reecriture).
 *
 * Mapping :
 *   /api/ws/notifications          ->  ws://localhost:8088/ws/notifications
 *   /api/ws/projects/X/messages    ->  ws://localhost:8088/ws/projects/X/messages
 *   /api/anything                  ->  http://localhost:8088/api/anything
 */

const BACKEND = 'http://localhost:8088';

module.exports = [
  // 1) WebSockets : doivent etre declares AVANT la regle generale /api
  //    pour que la reecriture de chemin "/api/ws" -> "/ws" soit appliquee
  //    sur le upgrade HTTP -> WS.
  {
    context: ['/api/ws'],
    target: BACKEND,
    secure: false,
    changeOrigin: true,
    ws: true,
    logLevel: 'debug',
    pathRewrite: { '^/api/ws': '/ws' }
  },

  // 2) Appels HTTP REST classiques.
  {
    context: ['/api'],
    target: BACKEND,
    secure: false,
    changeOrigin: true,
    logLevel: 'debug'
  },

  // 3) Fichiers uploads (logos d'organisation, avatars users, attachments).
  //    Le backend les sert via StaticResourceConfig sur /uploads/**.
  {
    context: ['/uploads'],
    target: BACKEND,
    secure: false,
    changeOrigin: true,
    logLevel: 'debug'
  }
];
