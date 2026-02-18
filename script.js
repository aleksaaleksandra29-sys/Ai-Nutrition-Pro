// --- КОНФИГУРАЦИЯ ---
const GOALS = {
    cal: 2500, prot: 160, fat: 80, carb: 300,
    
    // Блок: Функциональный состав
    composition: {
        "Клетчатка (г)":     { val: 30,   tag: '💧 Ежедневно', type: 'daily' },
        "Сахар доб. (г)":    { val: 25,   tag: '🚫 Лимит',    type: 'bad' },
        "Крахмал (г)":       { val: 150,  tag: '⚡ Ежедневно', type: 'medium' },
        "Трансжиры (г)":     { val: 0.1,  tag: '🚫 Опасно',   type: 'bad' },
        "Мононенасыщ. (г)":  { val: 30,   tag: '🌿 Ежедневно', type: 'daily' },
        "Омега-3 EPA/DHA (г)":{ val: 1.5, tag: '📅 Неделя',   type: 'medium' },
        "Вода (мл)":         { val: 2000, tag: '💧 Ежедневно', type: 'daily' },
        "Кофеин (мг)":       { val: 400,  tag: '🚫 Лимит',    type: 'bad' }
    },

    vitamins: {
        "Вит. A (ретинол, мкг)": { val: 900,  tag: '📦 1-2 года',  type: 'long' },
        "Вит. A (каротин, мкг)": { val: 5000, tag: '📅 Месяцы',    type: 'medium' },
        "Вит. D (мкг)":          { val: 15,   tag: '📅 2-4 мес',   type: 'medium' },
        "Вит. E (мг)":           { val: 15,   tag: '📅 Месяцы',    type: 'medium' },
        "Вит. K1 (мкг)":         { val: 120,  tag: '📅 Неделя',    type: 'medium' },
        "Вит. K2 (мкг)":         { val: 100,  tag: '📅 Неделя',    type: 'medium' },
        "Вит. C (мг)":           { val: 90,   tag: '💧 Ежедневно', type: 'daily' },
        "Вит. B4 (холин, мг)":   { val: 425,  tag: '💧 Ежедневно', type: 'daily' },
        "Вит. B12 (мкг)":        { val: 2.4,  tag: '📦 3-5 лет',   type: 'long' },
        "Вит. B1 (мг)":          { val: 1.2,  tag: '💧 Ежедневно', type: 'daily' },
        "Вит. B2 (мг)":          { val: 1.3,  tag: '💧 Ежедневно', type: 'daily' },
        "Вит. B6 (мг)":          { val: 1.7,  tag: '💧 Ежедневно', type: 'daily' }
    },

    minerals: {
        "Кальций (мг)":      { val: 1000, tag: '🦴 Кости',    type: 'medium' },
        "Магний (мг)":       { val: 400,  tag: '⚡ Ежедневно', type: 'daily' },
        "Калий (мг)":        { val: 3500, tag: '⚡ Ежедневно', type: 'daily' },
        "Натрий (мг)":       { val: 2300, tag: '⚡ Ежедневно', type: 'bad' },
        "Железо (мг)":       { val: 14,   tag: '📅 Месяцы',   type: 'medium' },
        "Цинк (мг)":         { val: 11,   tag: '📅 Неделя',   type: 'medium' },
        "Йод (мкг)":         { val: 150,  tag: '📅 Неделя',   type: 'medium' },
        "Селен (мкг)":       { val: 55,   tag: '📅 Неделя',   type: 'medium' },
        "Хром (мкг)":        { val: 35,   tag: '📅 Неделя',   type: 'medium' }
    }
};

let foodLog = [];
let currentPeriod = { type: 'day', start: null, end: null };

function getLocalISODate(dateObj = new Date()) {
    const offset = dateObj.getTimezoneOffset() * 60000; 
    const localDate = new Date(dateObj.getTime() - offset);
    return localDate.toISOString().split('T')[0];
}

function getStartOfDay(d) { let n = new Date(d); n.setHours(0,0,0,0); return n; }
function getEndOfDay(d) { let n = new Date(d); n.setHours(23,59,59,999); return n; }
function getStartOfWeek(d) { let n = new Date(d); let day = n.getDay(); let diff = n.getDate() - day + (day === 0 ? -6 : 1); n.setDate(diff); n.setHours(0,0,0,0); return n; }
function getEndOfWeek(d) { let n = getStartOfWeek(d); n.setDate(n.getDate()+6); n.setHours(23,59,59,999); return n; }
function getStartOfMonth(d) { let n = new Date(d); n.setDate(1); n.setHours(0,0,0,0); return n; }
function getEndOfMonth(d) { let n = new Date(d); n.setMonth(n.getMonth()+1); n.setDate(0); n.setHours(23,59,59,999); return n; }

function init() {
    let saved = localStorage.getItem('nutritionData_v4');
    if(saved) { try { foodLog = JSON.parse(saved); } catch(e) { console.error(e); } }
    setPeriod('day');
}

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

function updateDisplay() {
    const labelEl = document.getElementById('periodLabel');
    if(currentPeriod.type === 'all') labelEl.textContent = "Всё время";
    else if(currentPeriod.type === 'day') labelEl.textContent = currentPeriod.start.toLocaleDateString('ru-RU');
    else if(currentPeriod.type === 'week') labelEl.textContent = `${currentPeriod.start.toLocaleDateString('ru-RU')} — ${currentPeriod.end.toLocaleDateString('ru-RU')}`;
    else if(currentPeriod.type === 'month') labelEl.textContent = currentPeriod.start.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });

    let filtered = foodLog;
    if(currentPeriod.type !== 'all') {
        filtered = foodLog.filter(item => {
            const d = new Date(item.date + 'T00:00:00');
            return d >= currentPeriod.start && d <= currentPeriod.end;
        });
    }
    filtered.sort((a,b) => new Date(b.date) - new Date(a.date));

    let daysCount = 1;
    const dates = new Set(filtered.map(i => i.date));
    const actualDays = dates.size || 1;
    const daysInMonth = currentPeriod.type === 'month' && currentPeriod.start
        ? new Date(currentPeriod.start.getFullYear(), currentPeriod.start.getMonth() + 1, 0).getDate()
        : 0;

    if (currentPeriod.type === 'week' && actualDays >= 7) 
    {
        daysCount = 7;
    } 
    else if (currentPeriod.type === 'month' && actualDays >= daysInMonth) 
    {
        daysCount = daysInMonth;
    } 
    else 
    {
        daysCount = currentPeriod.type === 'day' ? 1 : actualDays;
    }

    document.getElementById('statsInfo').textContent = currentPeriod.type === 'day' ? "Данные за один день" : `Среднее за ${daysCount} дн.`;

    let totals = { cal: 0, prot: 0, fat: 0, carb: 0, gl: 0, micros: {} };
    filtered.forEach(item => {
        totals.cal += item.cal || 0; totals.prot += item.prot || 0; totals.fat += item.fat || 0; totals.carb += item.carb || 0; totals.gl += item.gl || 0;
        if(item.micros) { for(let k in item.micros) totals.micros[k] = (totals.micros[k] || 0) + item.micros[k]; }
    });

    const avgs = { cal: totals.cal / daysCount, prot: totals.prot / daysCount, fat: totals.fat / daysCount, carb: totals.carb / daysCount, gl: totals.gl / daysCount, micros: {} };
    for(let k in totals.micros) avgs.micros[k] = totals.micros[k] / daysCount;

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
    if(!el) return;
    el.innerHTML = '';
    
    for(let [name, config] of Object.entries(configObj)) {
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

    items.forEach(item => {
        const microStr = item.micros
            ? Object.entries(item.micros)
                .sort((a,b) => b[1] - a[1])
                .slice(0, 3)
                .map(([k,v]) => `${k.split(' ')[0]} ${v}`)
                .join(', ')
            : '';

        const tr = document.createElement('tr');

        const dateTd = document.createElement('td');
        dateTd.dataset.label = 'Дата';
        dateTd.style.color = '#2980b9';
        dateTd.style.cursor = 'pointer';
        dateTd.style.fontWeight = 'bold';
        dateTd.textContent = `✎ ${item.date || ''}`;
        dateTd.addEventListener('click', () => editDateItem(item.id));

        const nameTd = document.createElement('td');
        nameTd.dataset.label = 'Продукт';
        nameTd.textContent = item.name || '';

        const calTd = document.createElement('td');
        calTd.dataset.label = 'Ккал';
        calTd.textContent = Math.round(item.cal || 0);

        const bjuTd = document.createElement('td');
        bjuTd.dataset.label = 'Б / Ж / У';
        bjuTd.textContent = `${Math.round(item.prot || 0)} / ${Math.round(item.fat || 0)} / ${Math.round(item.carb || 0)}`;

        const microTd = document.createElement('td');
        microTd.dataset.label = 'Состав';
        microTd.textContent = `${microStr}...`;

        const actionTd = document.createElement('td');
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'trash-btn';
        deleteBtn.textContent = '✕';
        deleteBtn.addEventListener('click', () => deleteItem(item.id));
        actionTd.appendChild(deleteBtn);

        tr.append(dateTd, nameTd, calTd, bjuTd, microTd, actionTd);
        el.appendChild(tr);
    });
}

function save() { localStorage.setItem('nutritionData_v4', JSON.stringify(foodLog)); updateDisplay(); }
function deleteItem(id) { if(confirm('Удалить?')) { foodLog = foodLog.filter(i => i.id !== id); save(); } }
function editDateItem(id) {
    const item = foodLog.find(i => i.id === id); if (!item) return;
    const newDate = prompt("Дата (ГГГГ-ММ-ДД):", item.date);
    if (newDate && /^\d{4}-\d{2}-\d{2}$/.test(newDate)) { item.date = newDate; save(); }
}
function exportData() {
    const blob = new Blob([JSON.stringify(foodLog, null, 2)], {type: "application/json"});
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
        const items = JSON.parse(raw.substring(raw.indexOf('['), raw.lastIndexOf(']')+1));
        const date = document.getElementById('aiDateInput').value || getLocalISODate();
        items.forEach(i => { foodLog.push({ id: Date.now() + Math.random(), date, name: i.name, cal: i.cal, prot: i.prot, fat: i.fat, carb: i.carb, gl: i.gl, micros: i.micros }); });
        save(); closeModal(); document.getElementById('aiInput').value = '';
    } catch(e) { alert('Ошибка JSON'); }
}
init();
