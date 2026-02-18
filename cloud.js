// --- cloud.js ---
const Cloud = {
    config: { url: "", pass: "", lastUpdate: 0 },
    saveTimeout: null,

    // Синхронизируем настройки из памяти браузера
    refreshConfig: function() {
        this.config.url = localStorage.getItem('sync_url');
        this.config.pass = localStorage.getItem('sync_pass');
        this.config.lastUpdate = parseInt(localStorage.getItem('cloud_last_ts') || '0');
        console.log("Cloud: Настройки загружены", { hasUrl: !!this.config.url, hasPass: !!this.config.pass });
    },

    // Основной запуск
    init: function() {
        console.log("Cloud: Инициализация...");
        this.refreshConfig();

        // Если в памяти пусто — пишем статус
        if (!this.config.url || !this.config.pass) {
            this.status("☁ Не настроено", "#e67e22");
            return; 
        }

        // Если данные есть — запускаем загрузку
        this.pull();

        // Проверка при возврате на вкладку
        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "visible") {
                console.log("Cloud: Вкладка активна, проверяем обновления...");
                this.pull();
            }
        });
    },

    status: function(msg, color = '#999') {
        const el = document.getElementById('syncStatus');
        if (el) {
            el.textContent = msg;
            el.style.color = color;
        } else {
            console.warn("Cloud: Элемент syncStatus не найден в HTML!");
        }
    },

    setup: function() {
        const u = prompt("Вставьте URL скрипта (Web App URL):", localStorage.getItem('sync_url') || "");
        if (!u) return;
        const p = prompt("Введите ваш пароль:", localStorage.getItem('sync_pass') || "");
        if (!p) return;

        localStorage.setItem('sync_url', u.trim());
        localStorage.setItem('sync_pass', p.trim());
        
        this.init(); // Перезапуск после ввода
    },

    pull: async function() {
        if (!this.config.url) return;
        this.status("☁ Синхронизация...", "#3498db");

        try {
            console.log("Cloud: Запрос данных из Google...");
            const res = await fetch(this.config.url, {
                method: 'POST',
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify({ password: this.config.pass, action: 'load' })
            });
            const ans = await res.json();
            console.log("Cloud: Ответ получен", ans);

            if (ans.status === 'success') {
                if (ans.updatedAt > this.config.lastUpdate) {
                    if (ans.data && Array.isArray(ans.data)) {
                        foodLog = ans.data; 
                        localStorage.setItem('nutritionData_v4', JSON.stringify(foodLog));
                        localStorage.setItem('cloud_last_ts', ans.updatedAt);
                        this.config.lastUpdate = ans.updatedAt;
                        
                        if (typeof updateDisplay === 'function') updateDisplay();
                        this.status("✅ Данные обновлены", "#27ae60");
                    }
                } else {
                    this.status("✅ Актуально", "#27ae60");
                }
            } else {
                this.status("❌ Ошибка пароля", "#e74c3c");
            }
        } catch (e) {
            this.status("⚠ Нет связи", "#e74c3c");
            console.error("Cloud Error:", e);
        }
    },

    scheduleSave: function() {
        if (!this.config.url) return;
        this.status("✍ Запись...", "#f39c12");
        clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(() => this.push(), 2000);
    },

    push: async function() {
        console.log("Cloud: Отправка данных в Google...");
        try {
            const res = await fetch(this.config.url, {
                method: 'POST',
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify({ 
                    password: this.config.pass, 
                    action: 'save',
                    data: foodLog 
                })
            });
            const ans = await res.json();

            if (ans.status === 'success') {
                this.config.lastUpdate = ans.updatedAt;
                localStorage.setItem('cloud_last_ts', ans.updatedAt);
                const now = new Date();
                const timeStr = now.getHours().toString().padStart(2,'0') + ":" + now.getMinutes().toString().padStart(2,'0');
                this.status("☁ Сохранено в " + timeStr, "#27ae60");
                console.log("Cloud: Успешно сохранено!");
            } else {
                this.status("❌ Ошибка записи", "#e74c3c");
            }
        } catch (e) {
            this.status("⚠ Не сохранено", "#e74c3c");
        }
    }
};