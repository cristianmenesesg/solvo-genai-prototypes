/* Tema claro/oscuro: anti-flash + toggle flotante. Cargar en <head>. */
(function () {
  var KEY = 'theme';
  var root = document.documentElement;

  var saved = 'light';
  try { saved = localStorage.getItem(KEY) || 'light'; } catch (e) {}
  root.dataset.theme = saved; // anti-flash: se setea antes del paint

  var icon = function () { return root.dataset.theme === 'dark' ? '☀️' : '🌙'; };

  function apply(t) {
    root.dataset.theme = t;
    try { localStorage.setItem(KEY, t); } catch (e) {}
    var b = document.getElementById('theme-toggle');
    if (b) b.textContent = icon();
  }

  window.toggleTheme = function () {
    apply(root.dataset.theme === 'dark' ? 'light' : 'dark');
  };

  function mount() {
    if (document.getElementById('theme-toggle')) return;
    var b = document.createElement('button');
    b.id = 'theme-toggle';
    b.type = 'button';
    b.title = 'Cambiar tema claro/oscuro';
    b.setAttribute('aria-label', 'Cambiar tema claro/oscuro');
    b.textContent = icon();
    b.addEventListener('click', window.toggleTheme);
    /* en las páginas de app va dentro del header (lo monta renderSidebar);
       en el login queda flotante */
    var slot = document.getElementById('header-controls');
    (slot || document.body).appendChild(b);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
