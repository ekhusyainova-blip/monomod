(function (M) {
  const Autopilot = {
    enabled: false,
    interval: 30000,
    timer: null,

    start() {
      if (this.timer) return;
      this.enabled = true;
      this.timer = setInterval(() => this.tick(), this.interval);
      M.emit('mm:autopilot:start', { interval: this.interval });
    },

    stop() {
      this.enabled = false;
      if (this.timer) { clearInterval(this.timer); this.timer = null; }
      M.emit('mm:autopilot:stop', {});
    },

    toggle() {
      if (this.enabled) this.stop(); else this.start();
    },

    // выбрать шаблон с наибольшим usageCount и «ввести» его
    tick() {
      const id = M.id.current();
      const templates = M.core.templates(id);
      if (!templates.length) return;

      // выбираем лучший
      let best = null;
      for (const [k, v] of templates) {
        if (!best || (v.usageCount || 0) > (best.v.usageCount || 0)) {
          best = { key: k, v };
        }
      }
      if (!best || !best.v.words) return;

      // формируем строку из слов
      const phrase = best.v.words.join(' ');
      M.emit('mm:autopilot:tick', { phrase, key: best.key });

      // прогон через тот же конвейер
      M.query.run(phrase);
    },

    // ручной запуск одного цикла
    once() { this.tick(); },
  };

  M.autopilot = Autopilot;
  M.modules.autopilot = Autopilot;
})(window.MONOMODE);