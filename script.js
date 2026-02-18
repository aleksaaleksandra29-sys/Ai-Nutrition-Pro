// --- КОНФИГУРАЦИЯ ---
const GOALS = {
    cal: 2500, prot: 160, fat: 80, carb: 300,
    
    vitamins: {
        "Вит. A (мкг)":  { val: 900, tag: '📦 1-2 года', type: 'long' },
        "Вит. D (мкг)":  { val: 15,  tag: '📅 2-4 мес',  type: 'medium' },
        "Вит. E (мг)":   { val: 15,  tag: '📅 Месяцы',   type: 'medium' },
        "Вит. K (мкг)":  { val: 120, tag: '📅 Неделя',   type: 'medium' },
        "Вит. C (мг)":   { val: 90,  tag: '💧 Ежедневно', type: 'daily' },
        "Вит. B1 (мг)":  { val: 1.2, tag: '💧 Ежедневно', type: 'daily' },
        "Вит. B2 (мг)":  { val: 1.3, tag: '💧 Ежедневно', type: 'daily' },
        "Вит. B3 (мг)":  { val: 16,  tag: '💧 Ежедневно', type: 'daily' },
        "Вит. B5 (мг)":  { val: 5,   tag: '💧 Ежедневно', type: 'daily' },
        "Вит. B6 (мг)":  { val: 1.7, tag: '💧 Ежедневно', type: 'daily' },
        "Вит. B9 (мкг)": { val: 400, tag: '📅 3 мес',    type: 'medium' },
        "Вит. B12 (мкг)":{ val: 2.4, tag: '📦 3-5 лет',  type: 'long' }
    },

    minerals: {
        "Кальций (мг)":  { val: 1000, tag: '📅 Кости',    type: 'medium' },
        "Железо (мг)":   { val: 14,   tag: '📅 Месяцы',   type: 'medium' },
        "Магний (мг)":   { val: 400,  tag: '⚡ Ежедневно', type: 'daily' },
        "Калий (мг)":    { val: 3500, tag: '⚡ Ежедневно', type: 'daily' },
        "Натрий (мг)":   { val: 2300, tag: '⚡ Ежедневно', type: 'daily' },
        "Фосфор (мг)":   { val: 700,  tag: '📅 Кости',    type: 'medium' },
        "Цинк (мг)":     { val: 11,   tag: '📅 Дни',      type: 'medium' },
        "Медь (мг)":     { val: 0.9,  tag: '📅 Недели',   type: 'medium' },
        "Селен (мкг)":   { val: 55,   tag: '📅 Недели',   type: 'medium' },
        "Йод (мкг)":     { val: 150,  tag: '📅 Недели',   type: 'medium' }
    }
};

let foodLog = [];
let currentPeriod = { type: 'day', start: null, end: null };

// --- ФУНКЦИЯ ПОЛУЧЕНИЯ ЛОКАЛЬНОЙ ДАТЫ (ИСПРАВЛЕНИЕ ЧАСОВЫХ ПОЯСОВ) ---
function getLocalISODate(dateObj = new Date()) {
    // Вычитаем смещение часового пояса, чтобы получить правильную дату в формате YYYY-MM-DD
    const offset = dateObj.getTimezoneOffset() * 60000; 
    const localDate = new Date(dateObj.getTime() - offset);
    return localDate.toISOString().split('T')[0];
}

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---
function getStartOfDay(d) { let n = new Date(d); n.setHours(0,0,0,0); return n; }
function getEndOfDay(d) { let n = new Date(d); n.setHours(23,59,59,999); return n; }
function getStartOfWeek(d) { let n = new Date(d); let day = n.getDay(); let diff = n.getDate() - day + (day === 0 ? -6 : 1); n.setDate(diff); n.setHours(0,0,0,0); return n; }
function getEndOfWeek(d) { let n = getStartOfWeek(d); n.setDate(n.getDate()+6); n.setHours(23,59,59,999); return n; }
function getStartOfMonth(d) { let n = new Date(d); n.setDate(1); n.setHours(0,0,0,0); return n; }
function getEndOfMonth(d) { let n = new Date(d); n.setMonth(n.getMonth()+1); n.setDate(0); n.setHours(23,59,59,999); return n; }

// --- ИНИЦИАЛИЗАЦИЯ ---
function init() {
    let saved = localStorage.getItem('nutritionData_v4');
    if (!saved) {
        const oldv3 = localStorage.getItem('nutritionData_v3');
        const oldv2 = localStorage.getItem('nutritionData_v2');
        if (oldv3 || oldv2) {
            saved = oldv3 || oldv2;
            localStorage.setItem('nutritionData_v4', saved);
        }
    }
    if(saved) {
        try { foodLog = JSON.parse(saved); } catch(e) { console.error(e); }
    }
    setPeriod('day');
}

// --- УПРАВЛЕНИЕ ПЕРИОДАМИ ---
function setPeriod(type) {
    currentPeriod.type = type;
    const now = new Date();
    document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
    const btn = document.querySelector(`.period-btn[onclick="setPeriod('${type}')"]`);
    if(btn) btn.classList.add('active');

    switch(type) {
        case 'day': currentPeriod.start = getStartOfDay(now); currentPeriod.end = getEndOfDay(now); break;
        case 'week': currentPeriod.start = getStartOfWeek(now); currentPeriod.end = getEndOfWeek(now); break;
        case 'month': currentPeriod.start = getStartOfMonth(now); currentPeriod.end = getEndOfMonth(now); break;
        case 'all': currentPeriod.start = null; currentPeriod.end = null; break;
    }
    updateDisplay();
}

function navigatePeriod(dir) {
    if(currentPeriod.type === 'all') return;
    const current = new Date(currentPeriod.start);
    switch(currentPeriod.type) {
        case 'day': current.setDate(current.getDate() + dir); currentPeriod.start = getStartOfDay(current); currentPeriod.end = getEndOfDay(current); break;
        case 'week': current.setDate(current.getDate() + (dir * 7)); currentPeriod.start = getStartOfWeek(current); currentPeriod.end = getEndOfWeek(current); break;
        case 'month': current.setMonth(current.getMonth() + dir); currentPeriod.start = getStartOfMonth(current); currentPeriod.end = getEndOfMonth(current); break;
    }
    updateDisplay();
}

function formatDate(d) { return d.toLocaleDateString('ru-RU'); }

// --- РЕНДЕРИНГ ---
function updateDisplay() {
    const labelEl = document.getElementById('periodLabel');
    if(currentPeriod.type === 'all') labelEl.textContent = "Всё время";
    else if(currentPeriod.type === 'day') labelEl.textContent = formatDate(currentPeriod.start);
    else if(currentPeriod.type === 'week') labelEl.textContent = `${formatDate(currentPeriod.start)} — ${formatDate(currentPeriod.end)}`;
    else if(currentPeriod.type === 'month') labelEl.textContent = currentPeriod.start.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });

    let filtered = foodLog;
    if(currentPeriod.type !== 'all') {
        filtered = foodLog.filter(item => {
            const d = new Date(item.date);
            return d >= currentPeriod.start && d <= currentPeriod.end;
        });
    }
    filtered.sort((a,b) => new Date(b.date) - new Date(a.date));

    let daysCount = 1;
    if (currentPeriod.type === 'day') {
        daysCount = 1;
    } else if (currentPeriod.type === 'all') {
        const dates = new Set(filtered.map(i => i.date));
        daysCount = dates.size || 1;
    } else {
        const diff = Math.abs(currentPeriod.end - currentPeriod.start);
        daysCount = Math.ceil(diff / (1000 * 60 * 60 * 24)); 
    }

    const infoText = currentPeriod.type === 'day' ? "Данные за один день" : `Среднее значение за ${daysCount} дн.`;
    document.getElementById('statsInfo').textContent = infoText;

    let totals = { cal: 0, prot: 0, fat: 0, carb: 0, micros: {} };
    filtered.forEach(item => {
        totals.cal += item.cal || 0;
        totals.prot += item.prot || 0;
        totals.fat += item.fat || 0;
        totals.carb += item.carb || 0;
        if(item.micros) {
            for(let k in item.micros) {
                totals.micros[k] = (totals.micros[k] || 0) + item.micros[k];
            }
        }
    });

    const avgs = {
        cal: totals.cal / daysCount,
        prot: totals.prot / daysCount,
        fat: totals.fat / daysCount,
        carb: totals.carb / daysCount,
        micros: {}
    };
    for(let k in totals.micros) avgs.micros[k] = totals.micros[k] / daysCount;

    updateBar('cal', avgs.cal, GOALS.cal);
    updateBar('prot', avgs.prot, GOALS.prot);
    updateBar('fat', avgs.fat, GOALS.fat);
    updateBar('carb', avgs.carb, GOALS.carb);

    renderMicroGrid('vitaminsGrid', GOALS.vitamins, avgs.micros);
    renderMicroGrid('mineralsGrid', GOALS.minerals, avgs.micros);
    renderList(filtered);
}

function updateBar(key, val, goal) {
    document.getElementById(`val_${key}`).textContent = Math.round(val);
    const pct = Math.min((val / goal) * 100, 100);
    document.getElementById(`bar_${key}`).style.width = `${pct}%`;
}

function renderMicroGrid(elId, configObj, currentVals) {
    const el = document.getElementById(elId);
    el.innerHTML = '';
    for(let [name, config] of Object.entries(configObj)) {
        const val = currentVals[name] || 0;
        const goal = config.val;
        const pct = (val / goal) * 100;
        const cleanName = name.replace(/ \(.*\)/, '');
        const unit = name.match(/\((.*)\)/)?.[1] || '';
        let statusClass = 'status-warn'; 
        if (pct >= 90) statusClass = 'status-good'; 
        else if (pct < 50) {
            if (config.type === 'daily') statusClass = 'status-bad'; 
            else if (config.type === 'long') statusClass = 'status-ok'; 
        }
        const div = document.createElement('div');
        div.className = `micro-card ${statusClass}`;
        div.innerHTML = `
            <div class="micro-header">
                <span class="micro-name">${cleanName}</span>
                <span class="tag ${config.type}">${config.tag}</span>
            </div>
            <div class="micro-val">${val.toFixed(1)} / ${goal} ${unit}</div>
            <div class="micro-bar-bg"><div class="micro-bar-fill" style="width:${Math.min(pct, 100)}%"></div></div>
        `;
        el.appendChild(div);
    }
}

function renderList(items) {
    const el = document.getElementById('foodList');
    el.innerHTML = '';
    
    if(items.length === 0) {
        el.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px; color:#999">Нет данных за этот период</td></tr>';
        return;
    }

    items.forEach(item => {
        let microStr = item.micros ? Object.entries(item.micros).sort((a,b) => b[1] - a[1]).slice(0, 3).map(([k,v]) => `${k.split(' ')[0]} ${v}`).join(', ') : '';
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="color:#2980b9; font-size:12px; cursor:pointer; font-weight:bold" onclick="editDateItem(${item.id})" title="Нажми, чтобы изменить дату">✎ ${item.date}</td>
            <td style="font-weight:600">${item.name}</td>
            <td>${Math.round(item.cal)}</td>
            <td style="font-size:12px">${Math.round(item.prot)} / ${Math.round(item.fat)} / ${Math.round(item.carb)}</td>
            <td style="font-size:11px; color:#777">${microStr}...</td>
            <td><button class="trash-btn" onclick="deleteItem(${item.id})">✕</button></td>
        `;
        el.appendChild(tr);
    });
}

// --- УПРАВЛЕНИЕ ДАННЫМИ ---
function deleteItem(id) {
    if(confirm('Удалить эту запись?')) {
        foodLog = foodLog.filter(i => i.id !== id);
        save();
    }
}

// Функция редактирования даты (новая)
function editDateItem(id) {
    const item = foodLog.find(i => i.id === id);
    if (!item) return;
    
    const newDate = prompt("Изменить дату записи (ГГГГ-ММ-ДД):", item.date);
    // Простая проверка формата даты
    if (newDate && /^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
        item.date = newDate;
        save();
    } else if (newDate) {
        alert("Неверный формат даты. Используйте ГГГГ-ММ-ДД (например 2026-02-18)");
    }
}

function save() {
    localStorage.setItem('nutritionData_v4', JSON.stringify(foodLog));
    updateDisplay();
}

function exportData() {
    const blob = new Blob([JSON.stringify(foodLog, null, 2)], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nutrition_backup_${getLocalISODate()}.json`;
    a.click();
}

// --- AI LOGIC ---
function openAiModal() { 
    document.getElementById('aiModal').classList.add('active'); 
    // Устанавливаем текущую локальную дату в поле
    document.getElementById('aiDateInput').value = getLocalISODate();
}
function closeModal() { document.getElementById('aiModal').classList.remove('active'); }

function copyPrompt() {
    const vits = Object.keys(GOALS.vitamins).join(', ');
    const mins = Object.keys(GOALS.minerals).join(', ');
    const txt = `Ты профессиональный нутрициолог. Рассчитай КБЖУ и ВСЕ микроэлементы.
Верни ТОЛЬКО валидный JSON (массив объектов).
Ключи СТРОГО такие: ${vits}, ${mins}.
Пример: [{"name": "Яйцо", "cal": 150, "prot": 12, "fat": 10, "carb": 1, "micros": { "Вит. A (мкг)": 150 }}]
Мой запрос: `;
    navigator.clipboard.writeText(txt).then(() => {
        const btn = document.querySelector('.copy-btn');
        const oldText = btn.textContent;
        btn.textContent = "✅ Скопировано!";
        btn.style.background = "#28a745";
        setTimeout(() => { btn.textContent = oldText; btn.style.background = "#2c3e50"; }, 2000);
    });
}

function processAiData() {
    const input = document.getElementById('aiInput');
    const dateInput = document.getElementById('aiDateInput'); // Берем дату из поля
    const raw = input.value.trim();
    if(!raw) return;

    try {
        const jsonStr = raw.replace(/```json/g, '').replace(/```/g, '');
        const items = JSON.parse(jsonStr.substring(jsonStr.indexOf('['), jsonStr.lastIndexOf(']')+1));
        
        // Используем дату из инпута или сегодняшнюю локальную, если инпут пуст
        const selectedDate = dateInput.value || getLocalISODate();

        items.forEach(item => {
            foodLog.push({
                id: Date.now() + Math.random(),
                date: selectedDate, // Пишем правильную дату
                name: item.name,
                cal: item.cal || 0,
                prot: item.prot || 0,
                fat: item.fat || 0,
                carb: item.carb || 0,
                micros: item.micros || {}
            });
        });
        save();
        input.value = '';
        closeModal();
    } catch(e) {
        alert('Ошибка JSON: ' + e.message);
    }
}

init();