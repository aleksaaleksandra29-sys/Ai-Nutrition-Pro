// --- КОНФИГУРАЦИЯ ---
const GOALS = {
    cal: 2500, prot: 160, fat: 80, carb: 300,

    // Блок: Функциональный состав
    composition: {
        "Клетчатка (г)": { val: 30, tag: '💧 Ежедневно', type: 'daily' },
        "Сахар доб. (г)": { val: 25, tag: '🚫 Лимит', type: 'bad' },
        "Крахмал (г)": { val: 150, tag: '⚡ Ежедневно', type: 'medium' },
        "Трансжиры (г)": { val: 0.1, tag: '🚫 Опасно', type: 'bad' },
        "Мононенасыщ. (г)": { val: 30, tag: '🌿 Ежедневно', type: 'daily' },
        "Омега-3 EPA/DHA (г)": { val: 1.5, tag: '📅 Неделя', type: 'medium' },
        "Вода (мл)": { val: 2000, tag: '💧 Ежедневно', type: 'daily' },
        "Кофеин (мг)": { val: 400, tag: '🚫 Лимит', type: 'bad' }
    },

    vitamins: {
        "Вит. A (ретинол, мкг)": { val: 900, tag: '📦 1-2 года', type: 'long' },
        "Вит. A (каротин, мкг)": { val: 5000, tag: '📅 Месяцы', type: 'medium' },
        "Вит. D (мкг)": { val: 15, tag: '📅 2-4 мес', type: 'medium' },
        "Вит. E (мг)": { val: 15, tag: '📅 Месяцы', type: 'medium' },
        "Вит. K1 (мкг)": { val: 120, tag: '📅 Неделя', type: 'medium' },
        "Вит. K2 (мкг)": { val: 100, tag: '📅 Неделя', type: 'medium' },
        "Вит. C (мг)": { val: 90, tag: '💧 Ежедневно', type: 'daily' },
        "Вит. B4 (холин, мг)": { val: 425, tag: '💧 Ежедневно', type: 'daily' },
        "Вит. B12 (мкг)": { val: 2.4, tag: '📦 3-5 лет', type: 'long' },
        "Вит. B1 (мг)": { val: 1.2, tag: '💧 Ежедневно', type: 'daily' },
        "Вит. B2 (мг)": { val: 1.3, tag: '💧 Ежедневно', type: 'daily' },
        "Вит. B6 (мг)": { val: 1.7, tag: '💧 Ежедневно', type: 'daily' }
    },

    minerals: {
        "Кальций (мг)": { val: 1000, tag: '🦴 Кости', type: 'medium' },
        "Магний (мг)": { val: 400, tag: '⚡ Ежедневно', type: 'daily' },
        "Калий (мг)": { val: 3500, tag: '⚡ Ежедневно', type: 'daily' },
        "Натрий (мг)": { val: 2300, tag: '⚡ Ежедневно', type: 'bad' },
        "Железо (мг)": { val: 14, tag: '📅 Месяцы', type: 'medium' },
        "Цинк (мг)": { val: 11, tag: '📅 Неделя', type: 'medium' },
        "Йод (мкг)": { val: 150, tag: '📅 Неделя', type: 'medium' },
        "Селен (мкг)": { val: 55, tag: '📅 Неделя', type: 'medium' },
        "Хром (мкг)": { val: 35, tag: '📅 Неделя', type: 'medium' }
    }
};

var foodLog = []; // Глобальная переменная, доступная для cloud.js
let currentPeriod = { type: 'day', start: null, end: null };

function init() {
    console.log("Запуск основной инициализации...");

    // Загрузка локальных данных
    let saved = localStorage.getItem('nutritionData_v4');
    if (saved) {
        try { foodLog = JSON.parse(saved); } catch (e) { console.error(e); }
    }

    setPeriod('day');

    // ПРИНУДИТЕЛЬНЫЙ ЗАПУСК ОБЛАКА
    if (window.Cloud || typeof Cloud !== 'undefined') {
        console.log("Объект Cloud найден, запускаю Cloud.init()");
        Cloud.init();
    } else {
        console.error("Объект Cloud НЕ НАЙДЕН. Проверь подключение cloud.js");
    }
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', init);

function getStartOfDay(d) { let n = new Date(d); n.setHours(0, 0, 0, 0); return n; }
function getEndOfDay(d) { let n = new Date(d); n.setHours(23, 59, 59, 999); return n; }
function getStartOfWeek(d) { let n = new Date(d); let day = n.getDay(); let diff = n.getDate() - day + (day === 0 ? -6 : 1); n.setDate(diff); n.setHours(0, 0, 0, 0); return n; }
function getEndOfWeek(d) { let n = getStartOfWeek(d); n.setDate(n.getDate() + 6); n.setHours(23, 59, 59, 999); return n; }
function getStartOfMonth(d) { let n = new Date(d); n.setDate(1); n.setHours(0, 0, 0, 0); return n; }
function getEndOfMonth(d) { let n = new Date(d); n.setMonth(n.getMonth() + 1); n.setDate(0); n.setHours(23, 59, 59, 999); return n; }

function setPeriod(type) {
    currentPeriod.type = type;
    const now = new Date();
    document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
    const btn = document.querySelector(`.period-btn[onclick="setPeriod('${type}')"]`);
    if (btn) btn.classList.add('active');

    switch (type) {
        case 'day': currentPeriod.start = getStartOfDay(now); currentPeriod.end = getEndOfDay(now); break;
        case 'week': currentPeriod.start = getStartOfWeek(now); currentPeriod.end = getEndOfWeek(now); break;
        case 'month': currentPeriod.start = getStartOfMonth(now); currentPeriod.end = getEndOfMonth(now); break;
        case 'all': currentPeriod.start = null; currentPeriod.end = null; break;
    }
    updateDisplay();
}

function navigatePeriod(dir) {
    if (currentPeriod.type === 'all') return;
    const current = new Date(currentPeriod.start);
    switch (currentPeriod.type) {
        case 'day': current.setDate(current.getDate() + dir); currentPeriod.start = getStartOfDay(current); currentPeriod.end = getEndOfDay(current); break;
        case 'week': current.setDate(current.getDate() + (dir * 7)); currentPeriod.start = getStartOfWeek(current); currentPeriod.end = getEndOfWeek(current); break;
        case 'month': current.setMonth(current.getMonth() + dir); currentPeriod.start = getStartOfMonth(current); currentPeriod.end = getEndOfMonth(current); break;
    }
    updateDisplay();
}

function updateDisplay() {
    const labelEl = document.getElementById('periodLabel');
    if (currentPeriod.type === 'all') labelEl.textContent = "Всё время";
    else if (currentPeriod.type === 'day') labelEl.textContent = currentPeriod.start.toLocaleDateString('ru-RU');
    else if (currentPeriod.type === 'week') labelEl.textContent = `${currentPeriod.start.toLocaleDateString('ru-RU')} — ${currentPeriod.end.toLocaleDateString('ru-RU')}`;
    else if (currentPeriod.type === 'month') labelEl.textContent = currentPeriod.start.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });

    let filtered = foodLog;
    if (currentPeriod.type !== 'all') {
        filtered = foodLog.filter(item => {
            const d = new Date(item.date + 'T00:00:00');
            return d >= currentPeriod.start && d <= currentPeriod.end;
        });
    }
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    let daysCount = 1;
    const dates = new Set(filtered.map(i => i.date));
    const actualDays = dates.size || 1;
    const daysInMonth = new Date(currentPeriod.start.getFullYear(), currentPeriod.start.getMonth() + 1, 0).getDate();

    if (currentPeriod.type === 'week' && actualDays >= 7) {
        daysCount = 7;
    }
    else if (currentPeriod.type === 'month' && actualDays >= daysInMonth) {
        daysCount = daysInMonth;
    }
    else {
        daysCount = currentPeriod.type === 'day' ? 1 : actualDays;
    }

    document.getElementById('statsInfo').textContent = currentPeriod.type === 'day' ? "Данные за один день" : `Среднее за ${daysCount} дн.`;

    let totals = { cal: 0, prot: 0, fat: 0, carb: 0, gl: 0, micros: {} };
    filtered.forEach(item => {
        totals.cal += item.cal || 0; totals.prot += item.prot || 0; totals.fat += item.fat || 0; totals.carb += item.carb || 0; totals.gl += item.gl || 0;
        if (item.micros) { for (let k in item.micros) totals.micros[k] = (totals.micros[k] || 0) + item.micros[k]; }
    });

    const avgs = { cal: totals.cal / daysCount, prot: totals.prot / daysCount, fat: totals.fat / daysCount, carb: totals.carb / daysCount, gl: totals.gl / daysCount, micros: {} };
    for (let k in totals.micros) avgs.micros[k] = totals.micros[k] / daysCount;

    updateBar('cal', avgs.cal, GOALS.cal); updateBar('prot', avgs.prot, GOALS.prot); updateBar('fat', avgs.fat, GOALS.fat); updateBar('carb', avgs.carb, GOALS.carb);

    document.getElementById('val_gl').textContent = Math.round(avgs.gl);
    const na = avgs.micros["Натрий (мг)"] || 0; const k = avgs.micros["Калий (мг)"] || 1;
    const nak = k > 0 ? (na / k).toFixed(2) : '—';
    const nakEl = document.getElementById('val_nak'); nakEl.textContent = nak; nakEl.style.color = nak > 0.6 ? '#e74c3c' : '#27ae60';
    const ca = avgs.micros["Кальций (мг)"] || 0; const mg = avgs.micros["Магний (мг)"] || 1;
    document.getElementById('val_camg').textContent = (ca / mg).toFixed(2);

    renderMicroGrid('compositionGrid', GOALS.composition, avgs.micros);
    renderMicroGrid('vitaminsGrid', GOALS.vitamins, avgs.micros);
    renderMicroGrid('mineralsGrid', GOALS.minerals, avgs.micros);
    renderList(filtered);
}

function updateBar(key, val, goal) {
    document.getElementById(`val_${key}`).textContent = Math.round(val);
    document.getElementById(`bar_${key}`).style.width = `${Math.min((val / goal) * 100, 100)}%`;
}

function renderMicroGrid(elId, configObj, currentVals) {
    const el = document.getElementById(elId);
    if (!el) return;
    el.innerHTML = '';

    for (let [name, config] of Object.entries(configObj)) {
        const val = currentVals[name] || 0;
        const goal = config.val;
        const pct = (val / goal) * 100;

        let statusClass = 'status-warn';
        if (config.type === 'bad') {
            statusClass = pct > 100 ? 'status-bad' : 'status-good';
        } else if (pct >= 90) {
            statusClass = 'status-good';
        } else if (pct < 50) {
            statusClass = (config.type === 'daily') ? 'status-bad' : 'status-ok';
        }

        const div = document.createElement('div');
        div.className = `micro-card ${statusClass}`;

        // Красиво разделяем название и единицы
        const displayName = name.split(' (')[0];
        const unit = name.includes('(') ? `(${name.split('(')[1]}` : '';

        div.innerHTML = `
            <span class="tag ${config.type}">${config.tag}</span>
            <div class="micro-header">
                <span class="micro-name">
                    ${displayName}
                    <div style="font-weight:400; color:#888; font-size:11px; margin-top:2px">${unit}</div>
                </span>
            </div>
            <div style="flex-grow: 1;"></div> <!-- ЭТА СТРОКА ВЫТАЛКИВАЕТ НИЗ ВНИЗ -->
            <div class="micro-val" style="font-weight: 700; font-size: 13px; margin-bottom: 5px;">
                ${val.toFixed(1)} <span style="font-weight:400; color:#aaa">/ ${goal}</span>
            </div>
            <div class="micro-bar-bg">
                <div class="micro-bar-fill" style="width:${Math.min(pct, 100)}%"></div>
            </div>
        `;
        el.appendChild(div);
    }
}

function renderList(items) {
    const el = document.getElementById('foodList');
    el.innerHTML = '';

    // Группировка
    const groups = {};
    items.forEach(item => {
        const type = item.mealType || 'Перекус';
        const num = item.mealNumber || 1;
        const key = num > 1 ? `${type} ${num}` : type;
        if (!groups[key]) groups[key] = { items: [], totals: { cal: 0, prot: 0, fat: 0, carb: 0 } };
        groups[key].items.push(item);
        groups[key].totals.cal += (item.cal || 0);
        groups[key].totals.prot += (item.prot || 0);
        groups[key].totals.fat += (item.fat || 0);
        groups[key].totals.carb += (item.carb || 0);
    });

    // Отрисовка групп
    for (let key in groups) {
        const group = groups[key];

        // Заголовок группы
        const headerTr = document.createElement('tr');
        headerTr.className = 'meal-header-row';
        headerTr.innerHTML = `
            <td colspan="2" style="font-weight: 800; color: #2c3e50; background: #f1f3f5;">🍴 ${key.toUpperCase()}</td>
            <td style="font-weight: 800; background: #f1f3f5;">${Math.round(group.totals.cal)}</td>
            <td colspan="3" style="font-size: 11px; color: #7f8c8d; background: #f1f3f5; font-weight: 600;">
                Итог: ${Math.round(group.totals.prot)} / ${Math.round(group.totals.fat)} / ${Math.round(group.totals.carb)}
            </td>
        `;
        el.appendChild(headerTr);

        // Продукты в группе
        group.items.forEach(item => {
            const microStr = item.micros ? Object.entries(item.micros).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, v]) => `${k.split(' ')[0]} ${v}`).join(', ') : '';
            const tr = document.createElement('tr');
            tr.className = 'clickable-row';
            tr.onclick = (e) => {
                if (!e.target.closest('.trash-btn')) {
                    openEditModal(item.id);
                }
            };
            tr.innerHTML = `
                <td data-label="Дата" style="color:#2980b9; font-weight:bold">✎ ${item.date}</td>
                <td data-label="Продукт">${item.name}</td>
                <td data-label="Ккал">${Math.round(item.cal)}</td>
                <td data-label="Б / Ж / У">${Math.round(item.prot)} / ${Math.round(item.fat)} / ${Math.round(item.carb)}</td>
                <td data-label="Состав">${microStr}...</td>
                <td><button class="trash-btn" onclick="deleteItem(${item.id})">✕</button></td>
            `;
            el.appendChild(tr);
        });
    }
}

function save() {
    // 1. Сохраняем локально (моментально)
    localStorage.setItem('nutritionData_v4', JSON.stringify(foodLog));
    updateDisplay();

    // 2. Говорим облаку: "Данные изменились, сохрани когда будет удобно"
    Cloud.scheduleSave();
}

function deleteItem(id) {
    if (confirm('Удалить?')) {
        foodLog = foodLog.filter(i => i.id !== id);
        save(); // Это вызовет и Cloud.scheduleSave()
    }
}

let currentEditId = null;

function openEditModal(id) {
    const item = foodLog.find(i => i.id === id);
    if (!item) return;
    currentEditId = id;

    document.getElementById('editNameInput').value = item.name;
    document.getElementById('editDateInput').value = item.date;
    document.getElementById('editMealTypeInput').value = item.mealType || 'Перекус';
    document.getElementById('editCalInput').value = Math.round(item.cal) || 0;
    document.getElementById('editProtInput').value = Math.round(item.prot) || 0;
    document.getElementById('editFatInput').value = Math.round(item.fat) || 0;
    document.getElementById('editCarbInput').value = Math.round(item.carb) || 0;
    document.getElementById('editGlInput').value = Math.round(item.gl) || 0;

    document.getElementById('editModal').classList.add('active');
}

function closeEditModal() {
    document.getElementById('editModal').classList.remove('active');
    currentEditId = null;
}

function saveEditItem() {
    if (currentEditId === null) return;
    const item = foodLog.find(i => i.id === currentEditId);
    if (!item) return;

    item.name = document.getElementById('editNameInput').value;
    item.date = document.getElementById('editDateInput').value;
    item.mealType = document.getElementById('editMealTypeInput').value;
    item.cal = Number(document.getElementById('editCalInput').value) || 0;
    item.prot = Number(document.getElementById('editProtInput').value) || 0;
    item.fat = Number(document.getElementById('editFatInput').value) || 0;
    item.carb = Number(document.getElementById('editCarbInput').value) || 0;
    item.gl = Number(document.getElementById('editGlInput').value) || 0;

    save();
    closeEditModal();
}

function exportData() {
    const blob = new Blob([JSON.stringify(foodLog, null, 2)], { type: "application/json" });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `backup_${getLocalISODate()}.json`; a.click();
}
function openAiModal() { document.getElementById('aiModal').classList.add('active'); document.getElementById('aiDateInput').value = getLocalISODate(); }
function closeModal() { document.getElementById('aiModal').classList.remove('active'); }

function copyPrompt() {
    // Собираем все ключи микроэлементов из настроек
    const allKeys = [
        ...Object.keys(GOALS.composition),
        ...Object.keys(GOALS.vitamins),
        ...Object.keys(GOALS.minerals)
    ];

    // Формируем строгий промпт
    const txt = `Ты — профессиональный нутрициолог-технолог.
Рассчитай КБЖУ, Гликемическую Нагрузку (gl) и полный микроэлементный состав.

ФОРМАТ ОТВЕТА:
Верни СТРОГО валидный JSON массив внутри блока кода \`\`\`json. Без лишнего текста.

СТРУКТУРА ОБЪЕКТА (строго соблюдай вложенность micros):
[
  {
    "name": "Название блюда",
    "cal": 0,    // ккал (число)
    "prot": 0,   // белки (число)
    "fat": 0,    // жиры (число)
    "carb": 0,   // углеводы (число)
    "gl": 0,     // гликемическая нагрузка (число)
    "micros": {
       // Вставь сюда значения для ВСЕХ этих ключей (если данных нет, ставь 0):
       ${allKeys.map(k => `"${k}": 0`).join(',\n       ')}
    }
  }
]

УТОЧНЕНИЯ:
1. "Сахар доб. (г)": учитывай только добавленный сахар (не природный из фруктов).
2. "Омега-3 EPA/DHA (г)": только животные формы (рыба), растительную ALA не считай.
3. Все значения должны быть числами (float), не строками.

МОЙ ЗАПРОС ПИТАНИЯ: `;

    // Копируем в буфер обмена
    navigator.clipboard.writeText(txt).then(() => {
        alert("Промпт скопирован! Вставьте его в чат с AI.");
    });
}

function processAiData() {
    const raw = document.getElementById('aiInput').value.trim();
    try {
        const start = raw.indexOf('[');
        const end = raw.lastIndexOf(']') + 1;
        if (start === -1 || end === 0) throw new Error('Некорректный формат JSON');

        const items = JSON.parse(raw.substring(start, end));
        const date = document.getElementById('aiDateInput').value || getLocalISODate();
        const mealType = document.getElementById('mealTypeInput').value;

        // Автоматически находим следующий номер для этого типа приема пищи на эту дату
        const existingNumbers = foodLog
            .filter(item => item.date === date && item.mealType === mealType)
            .map(item => item.mealNumber || 1);
        const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;

        items.forEach(i => {
            const cleanMicros = {};
            if (i.micros) {
                for (let k in i.micros) cleanMicros[k] = Number(i.micros[k]) || 0;
            }
            foodLog.push({
                id: Date.now() + Math.random(),
                date,
                mealType,
                mealNumber: nextNumber,
                name: i.name,
                cal: Number(i.cal) || 0,
                prot: Number(i.prot) || 0,
                fat: Number(i.fat) || 0,
                carb: Number(i.carb) || 0,
                gl: Number(i.gl) || 0,
                micros: cleanMicros
            });
        });
        save(); closeModal(); document.getElementById('aiInput').value = '';
    } catch (e) { alert('Ошибка: ' + e.message); }
}

// Вспомогательная функция для получения даты в формате ГГГГ-ММ-ДД
function getLocalISODate() {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now - offset).toISOString().split('T')[0];
}

let currentPmItemId = null;

function showProductDetails(id) {
    const item = foodLog.find(i => i.id === id);
    if (!item) return;

    // Заполняем основные макросы (Сетка 2x2)
    document.getElementById('pmName').textContent = item.name;
    document.getElementById('pmCal').textContent = Math.round(item.cal);
    document.getElementById('pmProt').textContent = Math.round(item.prot) + 'г';
    document.getElementById('pmFat').textContent = Math.round(item.fat) + 'г';
    document.getElementById('pmCarb').textContent = Math.round(item.carb) + 'г';

    const allConfigs = { ...GOALS.composition, ...GOALS.vitamins, ...GOALS.minerals };
    const grid = document.getElementById('pmComposition');
    grid.innerHTML = '';

    // Собираем активные нутриенты и сортируем по значению DESC
    const activeMicros = [];
    for (let name in allConfigs) {
        const val = parseFloat(item.micros[name]) || 0;
        if (val > 0.000001) {
            activeMicros.push({ name, val, config: allConfigs[name] });
        }
    }
    activeMicros.sort((a, b) => b.val - a.val);

    const descMap = {
        'ретинол': 'Животный',
        'каротин': 'Растит.',
        'холин': 'Холин'
    };

    activeMicros.forEach(({ name, val, config }) => {
        const div = document.createElement('div');

        // Парсинг названия и единиц
        const parts = name.match(/^(.*?)\s*\((.*?)\)$/);
        let displayName = name;
        let technical = "";
        let unit = "";

        if (parts) {
            displayName = parts[1];
            const details = parts[2].split(',').map(s => s.trim());
            unit = details[details.length - 1];
            if (details.length > 1) technical = details[0];
        } else {
            const unitMatch = name.match(/\((.*?)\)/);
            if (unitMatch) unit = unitMatch[1];
        }

        const friendlyDesc = descMap[technical.toLowerCase()] || technical;
        const pct = (val / config.val) * 100;

        // Определение статуса (цвет границы и бара)
        let status = 'status-warn';
        if (config.type === 'bad') {
            status = pct > 100 ? 'status-bad' : 'status-good';
        } else if (pct >= 90) {
            status = 'status-good';
        }

        div.className = `pm-comp-item ${status}`;

        const tagHtml = config.tag ? `<div class="pm-tag ${config.type || ''}">${config.tag}</div>` : '';

        div.innerHTML = `
            <div class="pm-comp-header">
                <div class="pm-comp-name-wrap">
                    <div class="pm-comp-name">${displayName}</div>
                    ${friendlyDesc ? `<div class="pm-comp-technical">${friendlyDesc} (${unit})</div>` : `<div class="pm-comp-technical">(${unit})</div>`}
                </div>
                ${tagHtml}
            </div>
            <div class="pm-comp-val-area">
                ${val.toFixed(2)} <span class="pm-comp-goal">/ ${config.val}</span>
            </div>
            <div class="pm-comp-bar-bg">
                <div class="pm-comp-bar-fill" style="width: ${Math.min(pct, 100)}%"></div>
            </div>
        `;
        grid.appendChild(div);
    });

    document.getElementById('productModal').classList.add('active');
}

function closeProductModal() {
    document.getElementById('productModal').classList.remove('active');
}
