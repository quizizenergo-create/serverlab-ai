'use strict';

(() => {
  const gate = document.getElementById('authGate');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const message = document.getElementById('authMessage');
  const setupWarning = document.getElementById('authSetupWarning');
  const adminNav = document.getElementById('adminNavItem');
  let currentUser = null;
  let dbReady = false;
  let syncReady = false;
  let syncingFromServer = false;
  let syncTimer = null;
  let adminBusy = false;
  let demoMode = false;
  const demoStorageKey = 'serverlab-ai-demo-mode';

  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

  function authMessage(text, kind = 'error') {
    message.textContent = text || '';
    message.classList.toggle('success', kind === 'success');
  }
  function setView(view) {
    const register = view === 'register';
    loginForm.hidden = register;
    registerForm.hidden = !register;
    document.querySelectorAll('[data-auth-view]').forEach(button => button.classList.toggle('active', button.classList.contains('auth-tab') && button.dataset.authView === view));
    authMessage('');
  }
  function setLoading(form, loading, label) {
    const button = form.querySelector('.auth-submit');
    if (!button) return;
    if (loading) {
      button.dataset.originalText = button.innerHTML;
      button.innerHTML = 'Күте тұр…';
      button.disabled = true;
    } else {
      button.innerHTML = button.dataset.originalText || label;
      button.disabled = false;
    }
  }
  async function api(url, options = {}) {
    const response = await fetch(url, {
      credentials: 'same-origin',
      ...options,
      headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.message || data.error || `Сұрау орындалмады (${response.status})`);
      error.status = response.status;
      error.code = data.error;
      throw error;
    }
    return data;
  }
  function showGate(show) {
    gate.classList.toggle('is-hidden', !show);
    gate.setAttribute('aria-hidden', String(!show));
    document.querySelector('.app-shell').setAttribute('aria-hidden', String(show));
    document.querySelector('.app-shell').inert = show;
  }
  function setAuthStatus(text, kind = '') {
    const el = document.getElementById('authStatusIndicator');
    if (el) { el.textContent = text; el.className = `auth-status-indicator ${kind}`; }
  }
  function addSessionControls() {
    let control = document.getElementById('sessionControls');
    if (!control) {
      control = document.createElement('div');
      control.id = 'sessionControls';
      control.className = 'session-controls';
      const foot = document.querySelector('.sidebar-foot');
      foot?.parentElement?.insertBefore(control, foot);
    }
    const demoProfile = window.ServerLabApp?.getState?.()?.profile || {};
    const name = currentUser?.name || (demoMode ? (demoProfile.name || 'Демо білім алушы') : 'Қолданушы');
    const roleText = demoMode ? 'Демо режим · осы браузерде' : (currentUser?.role === 'admin' ? 'Әкімші' : (currentUser?.group || 'Білім алушы'));
    control.innerHTML = `<div class="session-user"><span class="session-user-avatar">${escapeHTML(name.trim().charAt(0).toLocaleUpperCase('kk-KZ') || 'О')}</span><span><strong>${escapeHTML(name)}</strong><small>${escapeHTML(roleText)}</small></span></div><button id="authLogout" type="button" class="session-logout" title="${demoMode?'Аккаунтқа кіру':'Аккаунттан шығу'}">⇥ <span>${demoMode?'Кіру':'Шығу'}</span></button>`;
    document.getElementById('authLogout').addEventListener('click', () => demoMode ? exitDemoMode() : logout());
  }
  function emptyProgress(user) {
    const base = window.ServerLabApp?.defaultState?.() || {};
    return {
      ...base,
      profile: { ...(base.profile || {}), name: user.name || 'Білім алушы', group: user.group || '', goal: 'basics' },
      results: {}, attempts: [], xp: 0, streak: 0, lastActive: '', history: [], gameRewardDays: {}, theme: 'light'
    };
  }
  async function loadAccount(user) {
    demoMode = false; localStorage.removeItem(demoStorageKey);
    currentUser = user;
    syncingFromServer = true;
    try {
      const saved = await api('/api/progress');
      const state = saved.data ? saved.data : emptyProgress(user);
      state.profile = { ...(state.profile || {}), name: user.name || state.profile?.name || 'Білім алушы', group: user.group || state.profile?.group || '' };
      window.ServerLabApp?.setState(state);
    } finally {
      syncingFromServer = false;
    }
    syncReady = true;
    showGate(false);
    adminNav.hidden = currentUser.role !== 'admin';
    addSessionControls();
    setAuthStatus('Аккаунт қосылды', 'success');
    if (currentUser.role === 'admin') {
      const aboutPage = document.querySelector('#page-about .ethics-banner p');
      if (aboutPage) aboutPage.textContent = 'Әкімші панелі тіркелген білім алушылардың оқу деректерін көрсетеді. Әр аккаунттың прогресі сервердегі базада жеке сақталады; құпиясөздер хэш түрінде сақталады.';
    }
  }
  function enterDemoMode(restore = false) {
    demoMode = true;
    currentUser = null;
    syncReady = false;
    localStorage.setItem(demoStorageKey, 'true');
    setupWarning.hidden = true;
    showGate(false);
    adminNav.hidden = true;
    addSessionControls();
    setAuthStatus('Демо режим — деректер осы браузерде сақталады', '');
    if (!restore) {
      authMessage('Демо режим ашылды. Аккаунтсыз курсты, тесттерді және зертхананы сынай аласың.', 'success');
    }
    window.ServerLabApp?.setState(window.ServerLabApp?.getState?.() || {});
  }
  function exitDemoMode() {
    localStorage.removeItem(demoStorageKey);
    demoMode = false;
    currentUser = null;
    syncReady = false;
    document.getElementById('sessionControls')?.remove();
    showGate(true);
    setView('login');
    authMessage('Аккаунтқа кіру немесе тіркелу үшін осы жерден жалғастыр.', 'success');
  }

  async function submitForm(form, endpoint, payload, buttonLabel) {
    setLoading(form, true, buttonLabel);
    authMessage('');
    try {
      const result = await api(endpoint, { method: 'POST', body: JSON.stringify(payload) });
      await loadAccount(result.user);
      form.reset();
      authMessage('Сәтті кірдің! Оқу жолыңды жалғастыр.', 'success');
      setTimeout(() => authMessage(''), 1800);
    } catch (error) {
      authMessage(error.message || 'Қате шықты. Қайта байқап көр.');
      if (error.code === 'DATABASE_NOT_CONFIGURED') {
        setupWarning.hidden = false;
        setupWarning.innerHTML = 'Сайттың аккаунттар базасы әлі қосылмаған. Render сервисіне PostgreSQL дерекқорын қосып, <code>DATABASE_URL</code> айнымалысын баптау қажет.';
      }
    } finally { setLoading(form, false, buttonLabel); }
  }
  async function logout() {
    try { await api('/api/auth/logout', { method: 'POST', body: '{}' }); } catch { /* Session expires on the server even if network is unavailable. */ }
    currentUser = null; syncReady = false; demoMode = false; localStorage.removeItem(demoStorageKey); adminNav.hidden = true;
    document.getElementById('sessionControls')?.remove();
    showGate(true); setView('login'); authMessage('Сен аккаунттан шықтың. Қайта кіруге болады.', 'success');
  }
  async function syncProgress(state) {
    if (!currentUser || !syncReady || syncingFromServer || !dbReady) return;
    try {
      await api('/api/progress', { method: 'PUT', body: JSON.stringify({ data: state }) });
    } catch (error) {
      console.error('Progress sync failed:', error.message);
      const notice = document.getElementById('adminNotice');
      if (notice && !document.getElementById('page-admin').classList.contains('active')) return;
      if (notice) { notice.textContent = 'Оқу прогресін серверге сақтау мүмкін болмады. Байланысты тексеріп, жаңарт.'; notice.classList.add('error'); }
    }
  }
  function scheduleProgressSync(event) {
    if (!currentUser || !syncReady || syncingFromServer || !dbReady) return;
    clearTimeout(syncTimer);
    const state = event?.detail?.state || window.ServerLabApp?.getState?.();
    if (!state) return;
    syncTimer = setTimeout(() => syncProgress(state), 700);
  }
  function makeStat(label, value, detail, icon) {
    return `<article class="admin-stat-card"><div class="admin-stat-top"><span>${escapeHTML(label)}</span><span class="admin-stat-icon">${icon}</span></div><strong>${escapeHTML(value)}</strong><small>${escapeHTML(detail)}</small></article>`;
  }
  function formatDate(value) {
    if (!value) return 'Әзірге жоқ';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('kk-KZ', { year: 'numeric', month: 'short', day: 'numeric' });
  }
  function makeCell(text, className) {
    const td = document.createElement('td');
    if (className) td.className = className;
    if (text instanceof Node) td.appendChild(text); else td.textContent = String(text ?? '—');
    return td;
  }
  function renderUserRows(users) {
    const body = document.getElementById('adminUsersBody');
    body.replaceChildren();
    if (!users.length) {
      const row = document.createElement('tr'); const cell = document.createElement('td');
      cell.colSpan = 8; cell.textContent = 'Әзірге тіркелген білім алушы жоқ немесе іздеу нәтижесі табылмады.'; row.appendChild(cell); body.appendChild(row); return;
    }
    const lessonCatalog = new Map((window.ServerLabApp?.getLessons?.() || []).map(item => [item.id, item]));
    for (const user of users) {
      const row = document.createElement('tr');
      const nameWrap = document.createElement('div'); nameWrap.className = 'admin-user-cell';
      const name = document.createElement('strong'); name.textContent = user.name || 'Білім алушы';
      const email = document.createElement('small'); email.textContent = user.email || '';
      nameWrap.append(name, email);
      row.append(makeCell(nameWrap), makeCell(user.group || '—'), makeCell(formatDate(user.createdAt)), makeCell(`${user.completedLessons || 0} / 36`));
      const xpCell = document.createElement('td'); const xpPill = document.createElement('span'); xpPill.className = 'admin-pill'; xpPill.textContent = `${user.xp || 0} XP`; xpCell.appendChild(xpPill); row.appendChild(xpCell);
      row.append(makeCell(user.averageTestScore == null ? '—' : `${user.averageTestScore}%`), makeCell(formatDate(user.lastProgressAt)));
      const detailCell = document.createElement('td');
      const detailButton = document.createElement('button'); detailButton.type = 'button'; detailButton.className = 'admin-detail-trigger'; detailButton.textContent = 'По урокам';
      detailButton.setAttribute('aria-expanded','false');
      detailCell.appendChild(detailButton); row.appendChild(detailCell); body.appendChild(row);
      const detailRow = document.createElement('tr'); detailRow.className = 'admin-detail-row'; detailRow.hidden = true;
      const detailTd = document.createElement('td'); detailTd.colSpan = 8;
      const details = document.createElement('details'); details.className = 'admin-student-results'; details.open = true;
      const summary = document.createElement('summary'); summary.textContent = `Результаты по темам: ${user.name || 'білім алушы'} — ${user.completedLessons || 0}/36 уроков`;
      const grid = document.createElement('div'); grid.className = 'admin-lesson-result-grid';
      const lessonResults = Array.isArray(user.lessonResults) ? user.lessonResults : [];
      for (const result of lessonResults) {
        const catalog = lessonCatalog.get(result.lessonId);
        const card = document.createElement('article'); card.className = `admin-lesson-result${result.completed ? ' is-complete' : ''}`;
        const title = document.createElement('strong'); title.textContent = catalog ? `${catalog.number}. ${catalog.title}` : result.lessonId;
        const status = document.createElement('small');
        status.textContent = `${result.completed ? '✓ Аяқталған' : 'Аяқталмаған'} · Ең жақсы тест: ${result.bestPercent == null ? '—' : `${result.bestPercent}%`} · Әрекет: ${result.attempts || 0}`;
        card.append(title,status); grid.appendChild(card);
      }
      details.append(summary,grid); detailTd.appendChild(details); detailRow.appendChild(detailTd); body.appendChild(detailRow);
      detailButton.addEventListener('click',()=>{detailRow.hidden=!detailRow.hidden;detailButton.setAttribute('aria-expanded',String(!detailRow.hidden));detailButton.textContent=detailRow.hidden?'По урокам':'Свернуть';});
    }
  }
  function renderGroupOverview(users) {
    const holder=document.getElementById('adminGroupsOverview');if(!holder)return;
    const groups=new Map();
    for(const user of users){const key=(user.group||'Тобы көрсетілмеген').trim();const g=groups.get(key)||{name:key,count:0,xp:0,lessons:0,scores:[],active:0};g.count++;g.xp+=Number(user.xp||0);g.lessons+=Number(user.completedLessons||0);if(user.averageTestScore!=null)g.scores.push(Number(user.averageTestScore));if(user.lastProgressAt&&Date.now()-new Date(user.lastProgressAt).getTime()<7*86400000)g.active++;groups.set(key,g);}
    if(!groups.size){holder.innerHTML='<p class="muted">Топ бойынша статистика әзірге жоқ. Тіркелген білім алушылардың тобын толтырғанда, мәлімет осы жерде көрінеді.</p>';return;}
    holder.replaceChildren();
    for(const g of [...groups.values()].sort((a,b)=>b.count-a.count)){
      const card=document.createElement('button');card.type='button';card.className='admin-group-card';
      const avg=g.scores.length?Math.round(g.scores.reduce((a,b)=>a+b,0)/g.scores.length)+'%':'—';
      card.innerHTML=`<span class="deep-dive-label">ОҚУ ТОБЫ</span><strong>${escapeHTML(g.name)}</strong><small>Білім алушы саны: ${g.count}</small><div class="group-metrics"><span>${g.lessons} сабақ</span><span>${g.xp} XP</span><span>Тест ${avg}</span></div><small>Белсенді (7 күн): ${g.active}</small>`;
      card.addEventListener('click',()=>{const input=document.getElementById('adminSearch');if(input){input.value=g.name==='Тобы көрсетілмеген'?'':g.name;renderAdmin();}});
      holder.appendChild(card);
    }
  }
  function exportAdminCsv(){
    const rows=[['Name','Email','Group','Registered','Completed lessons','Total XP','Average test score','Last progress']];
    api('/api/admin/users').then(data=>{
      for(const u of data.users||[])rows.push([u.name,u.email,u.group,u.createdAt,u.completedLessons,u.xp,u.averageTestScore,u.lastProgressAt]);
      const csv=rows.map(row=>row.map(v=>`"${String(v??'').replace(/"/g,'""')}"`).join(',')).join('\r\n');
      const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8;'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='serverlab-ai-student-results.csv';a.click();URL.revokeObjectURL(url);
    }).catch(err=>{const notice=document.getElementById('adminNotice');if(notice){notice.textContent=err.message||'CSV экспорттау мүмкін болмады.';notice.classList.add('error');}});
  }
  async function renderAdmin() {
    if (adminBusy) return;
    if (!currentUser || currentUser.role !== 'admin') return;
    adminBusy = true;
    const notice = document.getElementById('adminNotice');
    notice.textContent = 'Деректер жүктеліп жатыр…'; notice.className = 'admin-notice';
    try {
      const [overview, listing] = await Promise.all([
        api('/api/admin/overview'),
        api(`/api/admin/users?q=${encodeURIComponent(document.getElementById('adminSearch')?.value || '')}`)
      ]);
      document.getElementById('adminStats').innerHTML = [
        makeStat('Барлық білім алушы', overview.total_students || 0, 'Білім алушы аккаунттары', '♙'),
        makeStat('Жаңадан тіркелген білім алушылар', overview.new_students_week || 0, 'Соңғы 7 күн', '＋'),
        makeStat('Тест әрекеті', overview.test_attempts || 0, 'Жинақталған нәтижелер', '☑'),
        makeStat('Белсенді білім алушы', overview.active_week || 0, 'Прогресі соңғы 7 күнде жаңарды', '↗')
      ].join('');
      renderUserRows(listing.users || []);
      renderGroupOverview(listing.users || []);
      document.getElementById('adminListFoot').textContent = listing.limited ? 'Алғашқы 250 нәтиже көрсетілді. Нақтылау үшін іздеуді қолдан.' : `${(listing.users || []).length} білім алушы көрсетілді. Тізімді тек оқу мақсатына пайдалан.`;
      notice.textContent = `Әкімші ретінде кірдің: ${currentUser.email}. Соңғы жаңарту: ${new Date().toLocaleTimeString('kk-KZ', { hour: '2-digit', minute: '2-digit' })}.`;
      notice.classList.add('success');
    } catch (error) {
      notice.textContent = error.status === 403 ? 'Бұл бөлім тек әкімші аккаунтына қолжетімді.' : (error.message || 'Әкімші деректерін жүктеу мүмкін болмады.');
      notice.classList.add('error');
    } finally { adminBusy = false; }
  }

  document.querySelectorAll('[data-auth-view]').forEach(button => button.addEventListener('click', () => setView(button.dataset.authView)));
  loginForm.addEventListener('submit', event => {
    event.preventDefault(); const form = new FormData(loginForm);
    submitForm(loginForm, '/api/auth/login', { email: form.get('email'), password: form.get('password') }, 'Жүйеге кіру →');
  });
  registerForm.addEventListener('submit', event => {
    event.preventDefault(); const form = new FormData(registerForm);
    if (!form.get('consent')) { authMessage('Аккаунт деректерін сақтау туралы келісімді белгіле.'); return; }
    submitForm(registerForm, '/api/auth/register', { name: form.get('name'), email: form.get('email'), group: form.get('group'), password: form.get('password') }, 'Тіркелу →');
  });
  document.getElementById('demoModeButton')?.addEventListener('click', () => enterDemoMode(false));
  document.getElementById('adminRefresh')?.addEventListener('click', renderAdmin);
  document.getElementById('adminExport')?.addEventListener('click', exportAdminCsv);
  let searchTimer;
  document.getElementById('adminSearch')?.addEventListener('input', () => { clearTimeout(searchTimer); searchTimer = setTimeout(renderAdmin, 300); });
  window.addEventListener('serverlab:state-saved', scheduleProgressSync);
  window.ServerLabAuth = { renderAdmin, getCurrentUser: () => currentUser };

  async function initialize() {
    if (localStorage.getItem(demoStorageKey) === 'true') { enterDemoMode(true); return; }
    try {
      const status = await api('/api/status');
      const localFileMode = status.storageMode === 'local-file';
      dbReady = Boolean(status.dbConnected) || localFileMode;

      if (localFileMode) {
        setupWarning.hidden = false;
        setupWarning.innerHTML = '<strong>Сынақ/жергілікті сақтау режимі.</strong> Тіркелу мен прогресс осы сервердегі файлда сақталады. Render-де білім алушылардың деректері ортақ әрі тұрақты болуы үшін PostgreSQL және <code>DATABASE_URL</code> қажет.';
      } else if (!status.dbConnected) {
        setupWarning.hidden = false;
        setupWarning.innerHTML = 'PostgreSQL бапталған, бірақ қосылым расталмады. Render → PostgreSQL қызметінің <strong>Connect</strong> бөлімінен <strong>Internal Database URL</strong> мәнін тексеріп, веб-сервистегі <code>DATABASE_URL</code> айнымалысына қой. Сервис пен база бір аймақта болуы керек.';
        showGate(true);
        setAuthStatus('База қосылымы тексерілуде', '');
        return;
      } else {
        setupWarning.hidden = true;
      }

      const auth = await api('/api/auth/me');
      if (auth.user) {
        try { await loadAccount(auth.user); }
        catch (error) { console.error('Account initialization failed:', error.message); showGate(true); }
      } else {
        showGate(true);
      }
    } catch (error) {
      dbReady = false;
      showGate(true);
      setupWarning.hidden = false;
      setupWarning.textContent = 'Серверге қосылу мүмкін болмады. Сайтты http://127.0.0.1:4173 немесе Render арқылы ашқаныңды тексер.';
      console.error('Server initialization error:', error.message);
    }
  }
  initialize();
})();
