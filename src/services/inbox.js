const KEY = "baysignal-inbox-v1";

export function readInbox() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? { posts: [], sent: [], read: [] };
  } catch {
    return { posts: [], sent: [], read: [] };
  }
}

export function rememberInboxItem(field, id) {
  try {
    const inbox = readInbox();
    inbox[field] = [...new Set([...inbox[field], id])];
    localStorage.setItem(KEY, JSON.stringify(inbox));
    return true;
  } catch {
    return false;
  }
}
