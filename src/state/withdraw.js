// Withdrawing must feel instant. The browser clears itself at once and remembers what still has to be deleted on the
// server; the delete is retried (now, and on every later visit) until the server confirms it.
const KEY = "lid.withdraw.v1";

const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } };
const write = (list) => { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* ignore */ } };

export function queueWithdrawal({ id, code }) {
  const list = read();
  if (!list.some((x) => x.id === id)) write([...list, { id, code }]);
  flushWithdrawals();
}

let running = false;
export async function flushWithdrawals() {
  if (running) return;
  running = true;
  try {
    for (const item of read()) {
      try {
        const res = await fetch("/api/sessions", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify(item), keepalive: true });
        if (res.ok || res.status === 400 || res.status === 503) write(read().filter((x) => x.id !== item.id));   // done, or nothing to delete
      } catch { /* offline: try again next time */ }
    }
  } finally { running = false; }
}
