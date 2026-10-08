(function (M) {
  const UI = {
    refresh() {
      const id = M.id.current();
      const cur = M.spheres.list().find(s => s.id === id);
      // badge
      let b = document.getElementById('mm-badge');
      if (!b) {
        b = document.createElement('div');
        b.id = 'mm-badge';
        b.style.cssText = 'position:absolute;top:12px;right:16px;font-size:11px;color:#4dd0c7;opacity:.6;z-index:10;';
        document.body.appendChild(b);
      }
      b.textContent = id.slice(0, 16) + '…' + (cur && cur.isRoot ? ' ★' : '');

      // кнопка
      let nb = document.getElementById('mm-new');
      if (!nb) {
        nb = document.createElement('button');
        nb.id = 'mm-new';
        nb.textContent = '＋ новая сфера';
        nb.style.cssText = 'position:absolute;top:12px;left:16px;background:transparent;border:1px solid #4dd0c7;color:#4dd0c7;padding:6px 12px;font-family:inherit;font-size:12px;border-radius:6px;cursor:pointer;z-index:10;';
        nb.onclick = () => { M.spheres.add(M.id.current()); UI.refresh(); };
        document.body.appendChild(nb);
      }
    },
    authOverlay() {
      if (document.getElementById('mm-auth')) return;
      const o = document.createElement('div');
      o.id = 'mm-auth';
      o.style.cssText = 'position:fixed;inset:0;background:rgba(10,10,12,.95);z-index:100;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#c8c8d4;font-family:inherit;';
      o.innerHTML = `
        <div style="font-size:20px;color:#4dd0c7;letter-spacing:4px;margin-bottom:24px;">MONOMOD</div>
        <div style="font-size:13px;opacity:.6;margin-bottom:16px;">введите ID или получите новый</div>
        <input id="mm-auth-input" placeholder="MID-..." style="background:transparent;border:1px solid #333;color:#c8c8d4;padding:10px 16px;font-family:inherit;font-size:14px;border-radius:6px;text-align:center;width:340px;outline:none;">
        <div style="margin-top:20px;">
          <button id="mm-auth-ok" style="background:transparent;border:1px solid #4dd0c7;color:#4dd0c7;padding:10px 20px;font-family:inherit;border-radius:6px;cursor:pointer;margin:0 8px;">войти</button>
          <button id="mm-auth-new" style="background:transparent;border:1px solid #ffd700;color:#ffd700;padding:10px 20px;font-family:inherit;border-radius:6px;cursor:pointer;margin:0 8px;">получить ID</button>
        </div>`;
      document.body.appendChild(o);
      document.getElementById('mm-auth-ok').onclick = () => {
        const v = document.getElementById('mm-auth-input').value.trim();
        if (/^MID-[0-9a-f]{32}$/.test(v)) {
          M.id.setCurrent(v); M.core.reload(v); o.remove(); UI.refresh();
        }
      };
      document.getElementById('mm-auth-new').onclick = () => {
        M.id.setCurrent(M.id.root()); o.remove(); UI.refresh();
      };
    },
  };
  M.ui = UI;
  M.modules.ui = UI;
  M.on('mm:auth:prompt', () => UI.authOverlay());
  M.on('mm:sphere:add', () => UI.refresh());
  M.on('mm:sphere:switch', () => UI.refresh());
  M.on('mm:core:reload', () => UI.refresh());
})(window.MONOMODE);