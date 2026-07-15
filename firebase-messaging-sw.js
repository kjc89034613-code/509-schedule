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

  // 알림마다 고유한 tag를 사용해 서로 덮어쓰지 않도록 함 (배지 숫자 계산용)
  const uniqueTag = (payload.data?.tag || 'msg') + '-' + Date.now() + '-' + Math.random().toString(36).slice(2,7);

  const options = {
    body: body,
    tag: uniqueTag,
    vibrate: [200, 100, 200],
    requireInteraction: false,
    data: {
      url: payload.data?.url || 'https://kjc89034613-code.github.io/509-schedule/'
    }
  };

  return self.registration.showNotification(title, options).then(() => {
    // 홈 화면 아이콘 배지 업데이트: 현재 쌓인 알림 개수로 표시
    return self.registration.getNotifications().then((notifications) => {
      const count = notifications.length;
      try {
        if (self.navigator && 'setAppBadge' in self.navigator) {
          if (count > 0) self.navigator.setAppBadge(count);
          else self.navigator.clearAppBadge();
        }
      } catch (e) {
        console.warn('[SW] 배지 설정 실패:', e);
      }
    });
  });
});

// 알림 클릭 시 앱 열기 + 배지 갱신
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || 'https://kjc89034613-code.github.io/509-schedule/';

  event.waitUntil(
    self.registration.getNotifications().then((notifications) => {
      const count = notifications.length;
      try {
        if (self.navigator && 'setAppBadge' in self.navigator) {
          if (count > 0) self.navigator.setAppBadge(count);
          else self.navigator.clearAppBadge();
        }
      } catch (e) {}
    }).then(() => {
      return clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        // 이미 열린 창이 있으면 포커스
        for (const client of clientList) {
          if (client.url.includes('509-schedule') && 'focus' in client) {
            return client.focus();
          }
        }
        // 없으면 새로 열기
        if (clients.openWindow) return clients.openWindow(targetUrl);
      });
    })
  );
});

// Service Worker 즉시 활성화
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(clients.claim()));
