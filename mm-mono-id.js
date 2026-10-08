(function (M) {
  /* ==========================================================================
     MM-MONO-ID — генератор и перехватчик mono id
     Перехватывает только:
       - "mono id"        → показать надпись, клик = копировать ID
       - "создать mono id" → показать надпись, клик = отправить ID
     Всё остальное не трогает.
     ========================================================================== */

  const MonoID = {

    // -----------------------------------------------------------------------
    // перехват ввода
    // -----------------------------------------------------------------------
    intercept(value) {
      const v = String(value || '').trim().toLowerCase();

      if (v === 'mono id') {
        this.showCopy();
        return true;
      }

      if (v === 'создать mono id') {
        this.showShare();
        return true;
      }

      return false;
    },

    // -----------------------------------------------------------------------
    // показать "mono id" — клик = копировать
    // -----------------------------------------------------------------------
    showCopy() {
      const el = this.badge('mono id');
      el.onclick = async () => {
        const id = M.id.current();
        try {
          await navigator.clipboard.writeText(id);
          el.textContent = 'скопировано ✓';
        } catch (e) {
          // fallback: нативный prompt
          window.prompt('mono id', id);
        }
        setTimeout(() => el.textContent = 'mono id', 1500);
      };
    },

    // -----------------------------------------------------------------------
    // показать "создать mono id" — клик = отправить
    // -----------------------------------------------------------------------
    showShare() {
      const el = this.badge('создать mono id');
      el.onclick = async () => {
        const id = M.id.current();
        if (navigator.share) {
          try {
            await navigator.share({
              title: 'mono id',
              text: 'mono id: ' + id,
            });
            el.textContent = 'отправлено ✓';
          } catch (e) {
            // отмена — не ошибка
            el.textContent = 'создать mono id';
          }
        } else {
          // fallback: копирование
          try {
            await navigator.clipboard.writeText(id);
            el.textContent = 'скопировано ✓';
          } catch (e) {
            window.prompt('mono id', id);
          }
        }
        setTimeout(() => el.textContent = 'создать mono id', 1500);
      };
    },

    // -----------------------------------------------------------------------
    // элемент на экране
    // -----------------------------------------------------------------------
    badge(text) {
      let el = document.getElementById('mm-mono-id');
      if (!el) {
        el = document.createElement('div');
        el.id = 'mm-mono-id';
        el.style.cssText = [
          'position:absolute',
          'top:12px',
          'right:16px',
          'font-size:11px',
          'color:#4dd0c7',
          'opacity:.5',
          'z-index:12',
          'cursor:pointer',
          'letter-spacing:1px',
          'user-select:none',
          '-webkit-user-select:none',
          'padding:4px 8px',
        ].join(';');
        document.body.appendChild(el);
      }
      el.textContent = text;
      return el;
    },

    // -----------------------------------------------------------------------
    // скрыть
    // -----------------------------------------------------------------------
    hide() {
      const el = document.getElementById('mm-mono-id');
      if (el) el.remove();
    },
  };

  M.monoId = MonoID;
  M.modules.monoId = MonoID;

  // перехват ввода — раньше остальных
  M.on('mm:graph:input', (e) => {
    const caught = MonoID.intercept(e.detail.value);
    if (caught) {
      // перехвачено — не идёт дальше
      e.stopImmediatePropagation?.();
    }
  });

})(window.MONOMODE);