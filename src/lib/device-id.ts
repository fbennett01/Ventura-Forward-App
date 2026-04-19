import { v4 as uuidv4 } from "uuid";

const DEVICE_ID_KEY = "vf_device_id";

export function getDeviceId(): string {
  if (typeof window === "undefined") {
    throw new Error("getDeviceId can only be called in the browser");
  }

  const existingId = window.localStorage.getItem(DEVICE_ID_KEY);
  if (existingId) {
    return existingId;
  }

  const newId = uuidv4();
  window.localStorage.setItem(DEVICE_ID_KEY, newId);
  return newId;
}