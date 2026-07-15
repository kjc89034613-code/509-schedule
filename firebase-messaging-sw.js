// Firebase Messaging Service Worker
// 이 파일은 반드시 사이트의 최상위 경로에 있어야 합니다.
// 예: https://kjc89034613-code.github.io/509-schedule/firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

// Firebase 설정 (509-schedule 프로젝트)
firebase.initializeApp({
  apiKey: "AIzaSyByck4ER9ZTwZep7_sQg4p1L32RBO8oIyQ",
  authDomain: "schedule-fd7f0.firebaseapp.com",
  projectId: "schedule-fd7f0",
  storageBucket: "schedule-fd7f0.firebasestorage.app",
  messagingSenderId: "595202670396",
  appId: "1:595202670396:web:0e02e940de2a4b50fb6839"
});

const messaging = firebase.messaging();

// 백그라운드 메시지 수신 처리
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] 백그라운드 메시지 수신:', payload);

  const title = payload.notification?.title || payload.data?.title || '직원 일정 공유';
  const body  = payload.notification?.body  || payload.data?.body  || '새 알림이 도착했습니다';

  const options = {
    body: body,
    tag: payload.data?.tag || 'default',
    vibrate: [200, 100, 200],
    requireInteraction: false,
    data: {
      url: payload.data?.url || 'https://kjc89034613-code.github.io/509-schedule/'
    }
  };

  return self.registration.showNotification(title, options);
});

// 알림 클릭 시 앱 열기
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || 'https://kjc89034613-code.github.io/509-schedule/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // 이미 열린 창이 있으면 포커스
      for (const client of clientList) {
        if (client.url.includes('509-schedule') && 'focus' in client) {
          return client.focus();
        }
      }
      // 없으면 새로 열기
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});

// Service Worker 즉시 활성화
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(clients.claim()));
