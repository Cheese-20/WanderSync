// Session helpers.
//
// An account has a *role* (stored in the database: Explorer / PendingGuide / Guide / admin)
// and a *mode* (what the user chose to log in as on the login screen).
//
// The two are deliberately separate: a verified Local Guide can log in as an Explorer,
// in which case they get the explorer experience even though their role is still "Guide".
// Guide mode always requires the Guide role, so choosing Explorer never grants extra access.

export const MODE_EXPLORER = 'explorer';
export const MODE_GUIDE = 'guide';
export const MODE_ADMIN = 'admin';

const USER_KEY = 'user';
const TOKEN_KEY = 'authToken';
const MODE_KEY = 'activeMode';

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function isLoggedIn() {
  return getStoredUser() !== null;
}

/** The account's real role, lowercased. Reads localStorage when no user is passed. */
export function roleOf(user = getStoredUser()) {
  return (user?.role || '').trim().toLowerCase();
}

/** Approved guide. Deliberately an exact match so "PendingGuide" does not qualify. */
export function isVerifiedGuide(user) {
  return roleOf(user) === MODE_GUIDE;
}

export function isPendingGuide(user) {
  return roleOf(user) === 'pendingguide';
}

export function isAdminAccount(user) {
  return roleOf(user) === MODE_ADMIN;
}

/** Mode used when the user never made an explicit choice (e.g. a session from before modes existed). */
export function defaultModeForAccount(user) {
  if (isAdminAccount(user)) return MODE_ADMIN;
  if (isVerifiedGuide(user)) return MODE_GUIDE;
  return MODE_EXPLORER;
}

/** Turns the login screen's radio choice into the mode to persist. */
export function resolveLoginMode(user, selectedRole) {
  if (isAdminAccount(user)) return MODE_ADMIN;
  const wantsGuide = (selectedRole || '').trim().toLowerCase() === MODE_GUIDE;
  return wantsGuide && isVerifiedGuide(user) ? MODE_GUIDE : MODE_EXPLORER;
}

/**
 * The mode currently in effect. Always re-checked against the account role, so a stored
 * mode can never outrank the account (e.g. guide mode without the Guide role falls back
 * to explorer).
 */
export function getActiveMode() {
  const stored = (localStorage.getItem(MODE_KEY) || '').trim().toLowerCase();
  if (stored === MODE_GUIDE) return isVerifiedGuide() ? MODE_GUIDE : MODE_EXPLORER;
  if (stored === MODE_ADMIN) return isAdminAccount() ? MODE_ADMIN : MODE_EXPLORER;
  if (stored === MODE_EXPLORER) return MODE_EXPLORER;
  return defaultModeForAccount();
}

export function setActiveMode(mode) {
  localStorage.setItem(MODE_KEY, mode);
}

export function isGuideMode() {
  return getActiveMode() === MODE_GUIDE;
}

export function isExplorerMode() {
  return getActiveMode() === MODE_EXPLORER;
}

export function isAdminMode() {
  return getActiveMode() === MODE_ADMIN;
}

/**
 * Updates the cached role after a server-side role change (applying to be a guide,
 * withdrawing that application) so the UI doesn't wait for the next login to catch up.
 */
export function setStoredRole(role) {
  const user = getStoredUser();
  if (!user) return;
  localStorage.setItem(USER_KEY, JSON.stringify({ ...user, role }));
}

/** Wipes everything session related so a stale mode can't leak into the next login. */
export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(MODE_KEY);
}
