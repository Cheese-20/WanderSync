// Pure helpers for the post ⋮ report menu.
// Mirrors the inline logic in ExplorerHome.jsx (toggleMenu, handleReport and the
// menu visibility check) so GuideHome can share it and it can be tested in isolation.

// True when a logged-in user is viewing someone else's post.
export function shouldShowReportMenu(loggedInUserId, postAuthorId) {
  if (loggedInUserId === null || loggedInUserId === undefined || loggedInUserId === '') return false;
  return Number(loggedInUserId) !== Number(postAuthorId);
}

// Single-valued open state: clicking the open menu closes it, clicking another opens that one.
export function nextOpenMenuId(currentOpenId, clickedPostId) {
  return currentOpenId === clickedPostId ? null : clickedPostId;
}

// Returns the navigation state for /report, or null when the user owns the post.
export function buildReportState(type, post, loggedInUserId) {
  if (Number(loggedInUserId) === Number(post.userID)) return null;
  return { reportType: type, reportedUserID: post.userID, postID: post.postID };
}
