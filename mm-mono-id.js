(function (M) {
  const MonoID = {
    _timer: null,

    intercept(value) {
      const v = String(value || '').trim().toLowerCase();
      if (v === 'mono id')       { this.showCopy();  return true; }
      if (v === 'создать mono id') { this.showShare(); return true; }
      return false;
    },

    showCopy() {
      const el = this.badge('mono id');
      el.onclick = async () => {
        const id = M.id.current();
        try {
          await navigator.clipboard.writeText(id);
          el.textContent = 'скопировано ✓';
        } catch {
          window.prompt('mono id', id);
        }
        this.scheduleHide();
      };
      this.scheduleHide(10000);
    },

    showShare() {
      const el = this.badge('создать mono id');
      el.onclick = async () => {
        const id = M.id.current();
        if (navigator.share) {
          try {
            await navigator.share({ title: 'mono id', text: 'mono id: ' + id });
            el.textContent = 'отправлено ✓';
          } catch {
            el.textContent = 'создать mono id';
          }
        } else {
          try {
            await navigator.clipboard.writeText(id);
            el.textContent = 'скопировано ✓';
          } catch {
            window.prompt('mono id', id);
          }
        }
        this.scheduleHide();
      };
      this.scheduleHide(10000);
    },

    scheduleHide(ms = 1500) {
      clearTimeout(this._timer);
      this._timer = setTimeout(() => this.hide(), ms);
    },

    badge(text) {
      let el = document.getElementById('mm-mono-id');
      if (!el) {
        el = document.createElement('div');
        el.id = 'mm-mono-id';
        el.style.cssText = 'position:absolute;top:12px;right:16px;font-size:11px;color:#4dd0c7;opacity:.5;z-index:12;cursor:pointer;letter-spacing:1px;user-select:none;-webkit-user-select:none;padding:4px 8px;';
        document.body.appendChild(el);
      }
      el.textContent = text;
      return el;
    },

    hide() {
      const el = document.getElementById('mm-mono-id');
      if (el) el.remove();
      clearTimeout(this._timer);
    },
  };

  M.monoId = MonoID;
  M.modules.monoId = MonoID;

  M.on('mm:graph:input', (e) => {
    if (MonoID.intercept(e.detail.value)) {
      e.stopImmediatePropagation?.();
    }
  });
})(window.MONOMODE);