// ============================================================================
// MONOMODE · РАСШИРЕНИЕ (Спираль + Активация шаблонов)
// ============================================================================
const MONOMODE = {
    version: '9.0.0',
    modules: new Map(),
    queryCount: 0,
    spiralLevel: 0,
    
    bus: new EventTarget(),
    emit(name, detail) { this.bus.dispatchEvent(new CustomEvent(name, { detail })); },
    on(name, fn) { this.bus.addEventListener(name, fn); },
    
    registerModule(name, module) {
        this.modules.set(name, module);
        this.updateUI();
        this.emit('mm:module:registered', { name });
    },
    
    queryMonomod(type, pattern) {
        this.queryCount++;
        this.updateUI();
        
        if (type === 'graph') return LINK_GRAPH.query(pattern);
        if (type === 'template') return TemplateArchive.query(pattern);
        return [];
    },
    
    // ========================================================================
    // АКТИВАЦИЯ ШАБЛОНОВ (интерпретация action)
    // ========================================================================
    activateTemplates(input) {
        const words = input.toLowerCase().split(/\s+/).filter(w => w.length > 2);
        const activated = [];
        
        for (const [id, template] of TemplateArchive.archive) {
            // Проверяем, есть ли пересечение между вводом и шаблоном
            const intersection = template.words.filter(w => words.includes(w));
            
            if (intersection.length > 0 && template.action) {
                activated.push(template);
                this.executeAction(template);
            }
        }
        
        return activated;
    },
    
    executeAction(template) {
        showStatus(`АКТИВАЦИЯ: ${template.action} · ${template.words.join(' ')}`);
        
        switch (template.action) {
            case 'spiral_next':
                this.spiralNext();
                break;
            case 'compress':
                this.compress();
                break;
            case 'unfold':
                this.unfold(template.target);
                break;
            case 'meta_level':
                this.setMetaLevel(template.level);
                break;
        }
        
        this.emit('mm:action:executed', { action: template.action, template });
    },
    
    // ========================================================================
    // СПИРАЛЬ (формула S(n+1) = Φ(S(n) ⊕ Δ(n)))
    // ========================================================================
    spiralNext() {
        this.spiralLevel++;
        showStatus(`СПИРАЛЬ L${this.spiralLevel} · META+1`);
        
        // Сжимаем текущий цикл в точку
        const compressed = this.compress();
        
        // Сохраняем как шаблон для следующего цикла
        TemplateArchive.tryCreate(
            ['spiral', `L${this.spiralLevel}`, 'compressed'],
            'meta',
            1.0
        );
        
        this.emit('mm:spiral:next', { level: this.spiralLevel, compressed });
    },
    
    compress() {
        const pack = this.modules.get('pack');
        if (pack) {
            const seed = pack.compress();
            showStatus(`СЖАТИЕ: ${seed}`);
            return seed;
        }
        return null;
    },
    
    unfold(seed) {
        showStatus(`РАЗВЁРТКА: ${seed}`);
        // Здесь можно добавить логику развёртки из семени
        this.emit('mm:unfold', { seed });
    },
    
    setMetaLevel(level) {
        this.spiralLevel = level;
        showStatus(`META-УРОВЕНЬ: L${level}`);
    },
    
    // Проверка замкнутости цикла
    checkClosure() {
        const edges = LINK_GRAPH.edges.size;
        const topWeight = Math.max(...Array.from(LINK_GRAPH.edges.values()).map(l => l.weight), 0);
        
        // Условие замкнутости: много связей + высокий вес
        if (edges > 50 && topWeight > 0.9) {
            showStatus('ЗАМКНУТОСТЬ · ЦИКЛ ЗАВЕРШЁН · СПИРАЛЬ META+1');
            this.spiralNext();
            return true;
        }
        return false;
    },
    
    // ========================================================================
    // МОДУЛИ (воспроизведение из 9.0.0)
    // ========================================================================
    initModules() {
        // Ψ · ИНИЦИАЦИЯ
        this.registerModule('conveyer', {
            process(input) {
                const words = input.split(/\s+/).filter(w => w.length > 2);
                for (let i = 0; i < words.length; i++) {
                    for (let j = i + 1; j < words.length; j++) {
                        LINK_GRAPH.strengthen(words[i], words[j], '3D');
                    }
                }
                LINK_GRAPH.save();
                return { words, edges: LINK_GRAPH.edges.size };
            }
        });
        
        this.registerModule('state', {
            get(key) { return localStorage.getItem('mm_' + key); },
            set(key, value) { localStorage.setItem('mm_' + key, value); }
        });
        
        this.registerModule('spiral', {
            level: 0,
            next() { this.level++; return this.level; }
        });
        
        // Λ · ВСТРЕЧА
        this.registerModule('viz', {
            render(state) {
                showStatus(`VIZ: ${state}`);
            }
        });
        
        // Ω · КРИСТАЛЛИЗАЦИЯ
        this.registerModule('pack', {
            compress() {
                const topEdges = Array.from(LINK_GRAPH.edges.entries())
                    .sort((a, b) => b[1].weight - a[1].weight)
                    .slice(0, 8)
                    .map(e => e[0])
                    .join(',');
                let hash = 0;
                for (let i = 0; i < topEdges.length; i++) {
                    hash = ((hash << 5) - hash) + topEdges.charCodeAt(i);
                    hash |= 0;
                }
                return 'SEED-' + Math.abs(hash).toString(16).padStart(8, '0').toUpperCase();
            }
        });
        
        this.registerModule('canon', {
            verify() {
                const triad = { psi: 1/3, lambda: 1/3, omega: 1/3 };
                const sum = triad.psi + triad.lambda + triad.omega;
                return Math.abs(sum - 1.0) < 1e-3;
            }
        });
        
        this.cache();
    },
    
    cache() {
        const moduleNames = Array.from(this.modules.keys());
        localStorage.setItem('mm_monomode_cache', JSON.stringify({
            version: this.version,
            modules: moduleNames,
            spiralLevel: this.spiralLevel,
            ts: Date.now()
        }));
    },
    
    loadCache() {
        const cached = localStorage.getItem('mm_monomode_cache');
        if (cached) {
            const data = JSON.parse(cached);
            this.spiralLevel = data.spiralLevel || 0;
            showStatus(`MONOMODE ${data.version} · L${this.spiralLevel} · ${data.modules.length} модулей`);
            return true;
        }
        return false;
    },
    
    updateUI() {
        document.getElementById('module-count').textContent = `модули: ${this.modules.size}`;
        document.getElementById('query-count').textContent = `запросы: ${this.queryCount}`;
        document.getElementById('role-display').textContent = `Ψ:MONOMOD · Ω:MONOMODE · Λ:QUERY · L${this.spiralLevel}`;
    },
    
    init() {
        if (!this.loadCache()) {
            this.initModules();
            showStatus('MONOMODE инициализирован · спираль L0');
        } else {
            this.initModules();
        }
    }
};

// ============================================================================
// ОБРАБОТКА ВВОДА (с активацией шаблонов)
// ============================================================================
function processInput(raw) {
    const cmd = raw.trim();
    const cleaned = cmd.replace(/[^\w\sа-яА-ЯёЁ]/g, '').toLowerCase();
    const words = cleaned.split(/\s+/).filter(w => w.length > 2);
    
    if (words.length === 0) { transition('P0'); return; }
    
    // 1. MONOMODE обрабатывает ввод
    const result = MONOMODE.modules.get('conveyer').process(cmd);
    
    // 2. АКТИВАЦИЯ ШАБЛОНОВ (проверка action)
    const activated = MONOMODE.activateTemplates(cmd);
    
    // 3. Запросы к MONOMOD
    const graphQuery = MONOMODE.queryMonomod('graph', words[0]);
    const templateQuery = MONOMODE.queryMonomod('template', words[0]);
    
    // 4. Проверка замкнутости
    MONOMODE.checkClosure();
    
    showStatus(`MONOMOD → MONOMODE: ${result.words.length} слов · ${activated.length} активаций · L${MONOMODE.spiralLevel}`);
    
    Memory.record(words, '3D', 0.5);
    Memory.save();
    
    let tw = 0, lc = 0;
    for (let i = 0; i < words.length; i++) {
        for (let j = i + 1; j < words.length; j++) {
            const k = [words[i], words[j]].sort().join('→');
            const l = LINK_GRAPH.edges.get(k);
            if (l) { tw += l.weight; lc++; }
        }
    }
    const dur = lc > 0 ? tw / lc : 0.2;
    
    if (dur < 0.15) transition('P7'); else transition('P10');
}
