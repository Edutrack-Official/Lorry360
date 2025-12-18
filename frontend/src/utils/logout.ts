import api from "../api/client";
import { getDeviceId } from "../utils/device";

export async function detachPushOnLogout() {
  const deviceId = getDeviceId();
  await api.post("/push/detach", { deviceId });
}
