const listeners = new Set();

export function navigate(path) {
  if (window.location.hash.slice(1) === path) {
    listeners.forEach((fn) => fn(path));
    return;
  }
  window.location.hash = path;
}

export function currentPath() {
  return window.location.hash.slice(1) || '/';
}

export function onRoute(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

window.addEventListener('hashchange', () => {
  const path = currentPath();
  listeners.forEach((fn) => fn(path));
});
