import axios from 'axios';
import { setStoredRole } from './session';

export const MIN_GUIDE_AGE = 16;

/**
 * Withdraws a guide application that an admin hasn't acted on yet.
 * The server reverts the account to Explorer; we mirror that locally so the
 * profile stops showing a pending application straight away.
 */
export async function withdrawGuideApplication(userId) {
  const res = await axios.delete(`/api/local-guide/application/${userId}`);
  setStoredRole('Explorer');
  return res.data;
}

/** Pulls a readable message out of an axios error. */
export function messageFromError(error, fallback) {
  const data = error?.response?.data;
  if (typeof data === 'string' && data.trim()) return data;
  if (data?.message) return data.message;
  return error?.message || fallback;
}
