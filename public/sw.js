// Service Worker - Radar Narcisista BR
// Versão: 2.0.0 - LIMPEZA DE CACHE

const CACHE_NAME = 'radar-narcisista-v2';
const OFFLINE_URL = '/offline.html';

// Recursos para cache inicial
const PRECACHE_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cache aberto, adicionando recursos...');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        console.log('[SW] Recursos em cache!');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Erro ao cachear:', error);
      })
  );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Ativando Service Worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              // Remove TODOS os caches antigos, inclusive os que não começam com radar-narcisista-v2
              console.log('[SW] Verificando cache:', cacheName);
              return cacheName !== CACHE_NAME;
            })
            .map((cacheName) => {
              console.log('[SW] Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[SW] Service Worker ativado e cache limpo!');
        return self.clients.claim();
      })
  );
});

// Interceptação de requisições
self.addEventListener('fetch', (event) => {
  // Ignorar requisições não-GET
  if (event.request.method !== 'GET') return;
  
  // Ignorar requisições de API (sempre buscar da rede)
  if (event.request.url.includes('/api/')) return;
  
  // Ignorar requisições do Supabase
  if (event.request.url.includes('supabase.co')) return;
  
  // Ignorar requisições do OpenAI
  if (event.request.url.includes('openai.com')) return;

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Se está no cache, retorna do cache
        if (cachedResponse) {
          // Atualiza o cache em background (stale-while-revalidate)
          event.waitUntil(
            fetch(event.request)
              .then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                  const responseClone = networkResponse.clone();
                  caches.open(CACHE_NAME)
                    .then((cache) => cache.put(event.request, responseClone));
                }
              })
              .catch(() => {})
          );
          return cachedResponse;
        }

        // Se não está no cache, busca da rede
        return fetch(event.request)
          .then((networkResponse) => {
            // Cacheia a resposta para próximas requisições
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => cache.put(event.request, responseClone));
            }
            return networkResponse;
          })
          .catch(() => {
            // Se falhar e for uma página HTML, mostra página offline
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match(OFFLINE_URL);
            }
          });
      })
  );
});

// Notificações Push (para futuro)
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || 'Nova notificação do Radar Narcisista',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    },
    actions: [
      { action: 'open', title: 'Abrir' },
      { action: 'close', title: 'Fechar' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Radar Narcisista', options)
  );
});

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') return;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Se já tem uma janela aberta, foca nela
        for (const client of clientList) {
          if (client.url === event.notification.data.url && 'focus' in client) {
            return client.focus();
          }
        }
        // Se não, abre uma nova
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.url);
        }
      })
  );
});

// Sincronização em background (para futuro)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-diary') {
    console.log('[SW] Sincronizando diário em background...');
    // Implementar sincronização de entradas offline
  }
});

console.log('[SW] Service Worker carregado!');
