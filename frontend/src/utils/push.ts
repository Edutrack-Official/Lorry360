
// const VAPID_PUBLIC_KEY =
//   "BOdLlP7NcuJyyzpEvzsNhj5oCVc3EpW7sMwUqn-2SSKVglaixJXif8n27ffBt6z_v0zn1ERIEA02WQkQi73VvaM";

// function urlBase64ToUint8Array(base64String: string) {
//   const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
//   const base64 = (base64String + padding)
//     .replace(/-/g, "+")
//     .replace(/_/g, "/");

//   const rawData = window.atob(base64);
//   const outputArray = new Uint8Array(rawData.length);

//   for (let i = 0; i < rawData.length; ++i) {
//     outputArray[i] = rawData.charCodeAt(i);
//   }
//   return outputArray;
// }

// export async function registerForPush(api: any) {
//   if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
//     console.warn("Push not supported");
//     return;
//   }

//   // Register service worker
//   const registration = await navigator.serviceWorker.register("/sw.js");

//   // Ask permission
//   const permission = await Notification.requestPermission();
//   if (permission !== "granted") {
//     console.warn("Push permission denied");
//     return;
//   }

//   // Subscribe
//   const subscription = await registration.pushManager.subscribe({
//     userVisibleOnly: true,
//     applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
//   });

//   // Send to backend
//   await api.post("/push/subscribe", {
//     subscription
//   });

//   console.log("✅ Push subscription saved");
// }


// const VAPID_PUBLIC_KEY =
//   "BOdLlP7NcuJyyzpEvzsNhj5oCVc3EpW7sMwUqn-2SSKVglaixJXif8n27ffBt6z_v0zn1ERIEA02WQkQi73VvaM";

// // ✅ Device ID (one per browser)
// function getDeviceId(): string {
//   let deviceId = localStorage.getItem("device_id");
//   if (!deviceId) {
//     deviceId = crypto.randomUUID();
//     localStorage.setItem("device_id", deviceId);
//   }
//   return deviceId;
// }

// function urlBase64ToUint8Array(base64String: string) {
//   const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
//   const base64 = (base64String + padding)
//     .replace(/-/g, "+")
//     .replace(/_/g, "/");

//   const rawData = window.atob(base64);
//   return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
// }

// export async function registerForPush() {
//   if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
//     console.warn("Push not supported");
//     return;
//   }

//   const deviceId = getDeviceId();

//   // Register service worker
//   const registration = await navigator.serviceWorker.register("/sw.js");

//   // Ask permission
//   const permission = await Notification.requestPermission();
//   if (permission !== "granted") {
//     console.warn("Push permission denied");
//     return;
//   }

//   // Reuse existing subscription if present
//   let subscription = await registration.pushManager.getSubscription();

//   if (!subscription) {
//     subscription = await registration.pushManager.subscribe({
//       userVisibleOnly: true,
//       applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
//     });
//   }

//   // 🔥 Zomato-style rebind on every login
//   await api.post("/push/subscribe", {
//     deviceId,
//     subscription
//   });

//   console.log("✅ Push registered & rebound to device:", deviceId);
// }


import api from "../api/client";

const VAPID_PUBLIC_KEY =
  "BOdLlP7NcuJyyzpEvzsNhj5oCVc3EpW7sMwUqn-2SSKVglaixJXif8n27ffBt6z_v0zn1ERIEA02WQkQi73VvaM";

/**
 * ✅ One deviceId per browser profile
 */
function getDeviceId(): string {
  let deviceId = localStorage.getItem("device_id");

  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem("device_id", deviceId);
  }

  return deviceId;
}

/**
 * 🔑 Convert VAPID key
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const output = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i++) {
    output[i] = rawData.charCodeAt(i);
  }

  return output;
}

/**
 * 🔔 Register & rebind push subscription (Zomato-style)
 */
export async function registerForPush(): Promise<void> {
  try {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.warn("❌ Push not supported");
      return;
    }

    const deviceId = getDeviceId();

    const registration = await navigator.serviceWorker.register("/sw.js");

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("❌ Push permission denied");
      return;
    }

    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        // 🔥 IMPORTANT CAST (fixes TS2322 permanently)
        applicationServerKey:
          urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource
      });
    }

    await api.post("/push/subscribe", {
      deviceId,
      subscription
    });

    console.log("✅ Push registered", {
      deviceId,
      endpoint: subscription.endpoint
    });

  } catch (err) {
    console.error("❌ Push registration failed", err);
  }
}
