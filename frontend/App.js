const PUBLIC_BACKEND_URL = 'https://taking-characteristics-pursuit-counting.trycloudflare.com';
const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
  ? 'http://127.0.0.1:8000' 
  : PUBLIC_BACKEND_URL;


let currentUser = null;
let token = localStorage.getItem('access_token');
let currentWizardStep = 1;
let currentTheme = localStorage.getItem('theme') || 'dark';

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  if (token) {
    fetchCurrentUser();
  }
  updateWizardUI();
});

function initTheme() {
  document.documentElement.setAttribute('data-theme', currentTheme);
  document.body.setAttribute('data-theme', currentTheme);
  const btn = document.getElementById('theme-toggle-btn');
  if (btn) {
    btn.innerHTML = currentTheme === 'dark' ? '☀️ Light' : '🌙 Dark';
    btn.setAttribute('aria-label', `Switch to ${currentTheme === 'dark' ? 'Light' : 'Dark'} Mode`);
  }
}

function toggleTheme() {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', currentTheme);
  initTheme();
}

// View Navigation Handler
function showPage(viewId) {
  document.querySelectorAll('.page-view').forEach(view => {
    view.classList.remove('active');
  });
  const target = document.getElementById(viewId);
  if (target) {
    target.classList.add('active');
  }

  // Update active navbar link
  document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
  
  if (viewId === 'dashboard-view') fetchDashboardData();
  if (viewId === 'history-view') fetchHistoryData();
  if (viewId === 'admin-view') fetchAdminData();
}

// Modal Handlers
function openModal(modalId) {
  document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

// Auth Handlers
async function fetchCurrentUser() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      currentUser = await res.json();
      updateAuthUI(true);
    } else {
      logout();
    }
  } catch (err) {
    console.error('Auth verification failed', err);
  }
}

function updateAuthUI(isLoggedIn) {
  const authButtons = document.getElementById('auth-buttons');
  const userBadge = document.getElementById('user-badge');
  const userNameDisplay = document.getElementById('user-name-display');
  const navDash = document.getElementById('nav-dashboard');
  const navHist = document.getElementById('nav-history');
  const navAdmin = document.getElementById('nav-admin');

  if (isLoggedIn && currentUser) {
    authButtons.style.display = 'none';
    userBadge.style.display = 'flex';
    userNameDisplay.textContent = currentUser.full_name;

    navDash.style.display = 'inline-block';
    navHist.style.display = 'inline-block';

    // Show Admin panel ONLY for elevated roles (Super Admin, Admin, Researcher)
    if (['SUPER_ADMIN', 'ADMIN', 'RESEARCHER'].includes(currentUser.role) || currentUser.is_admin) {
      navAdmin.style.display = 'inline-block';
    } else {
      navAdmin.style.display = 'none';
    }

    document.getElementById('dash-user-name').textContent = currentUser.full_name;
    document.getElementById('prof-name').value = currentUser.full_name;
    document.getElementById('prof-email').value = currentUser.email;
    document.getElementById('prof-university').value = currentUser.university || '';
    document.getElementById('prof-year').value = currentUser.year_of_study || '1st year';
  } else {
    authButtons.style.display = 'flex';
    userBadge.style.display = 'none';
    navDash.style.display = 'none';
    navHist.style.display = 'none';
    navAdmin.style.display = 'none';
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name').value;
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;
  const university = document.getElementById('reg-university').value;

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: name, email, password, university })
    });
    const data = await res.json();
    if (res.ok) {
      token = data.access_token;
      localStorage.setItem('access_token', token);
      currentUser = data.user;
      updateAuthUI(true);
      closeModal('register-modal');
      showPage('dashboard-view');
    } else {
      document.getElementById('reg-error').textContent = data.detail || 'Registration failed.';
    }
  } catch (err) {
    document.getElementById('reg-error').textContent = 'Network error connecting to backend.';
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (res.ok) {
      token = data.access_token;
      localStorage.setItem('access_token', token);
      currentUser = data.user;
      updateAuthUI(true);
      closeModal('login-modal');
      showPage('dashboard-view');
    } else {
      document.getElementById('login-error').textContent = data.detail || 'Invalid login details.';
    }
  } catch (err) {
    document.getElementById('login-error').textContent = 'Network error connecting to backend.';
  }
}

function logout() {
  token = null;
  currentUser = null;
  localStorage.removeItem('access_token');
  updateAuthUI(false);
  showPage('landing-view');
}

// 4-Step Wizard Navigation
function updateWizardUI() {
  for (let i = 1; i <= 3; i++) {
    const stepEl = document.getElementById(`step-${i}`);
    if (stepEl) stepEl.style.display = i === currentWizardStep ? 'block' : 'none';
  }

  const titles = [
    'Demographic Information',
    'Screen Usage Habits',
    'Ergonomic Setup & Routine'
  ];

  document.getElementById('wizard-title').textContent = titles[currentWizardStep - 1];
  document.getElementById('wizard-step-indicator').textContent = `Step ${currentWizardStep} of 3`;
  document.getElementById('wizard-progress-fill').style.width = `${(currentWizardStep / 3) * 100}%`;

  const btnBack = document.getElementById('btn-wizard-back');
  const btnNext = document.getElementById('btn-wizard-next');
  const btnSubmit = document.getElementById('btn-wizard-submit');

  btnBack.style.visibility = currentWizardStep > 1 ? 'visible' : 'hidden';

  if (currentWizardStep === 3) {
    btnNext.style.display = 'none';
    btnSubmit.style.display = 'inline-flex';
  } else {
    btnNext.style.display = 'inline-flex';
    btnSubmit.style.display = 'none';
  }
}

function wizardNext() {
  if (validateCurrentStep()) {
    if (currentWizardStep < 3) {
      currentWizardStep++;
      updateWizardUI();
    }
  }
}

function wizardBack() {
  if (currentWizardStep > 1) {
    currentWizardStep--;
    updateWizardUI();
  }
}

function validateCurrentStep() {
  const activeStepEl = document.getElementById(`step-${currentWizardStep}`);
  const selects = activeStepEl.querySelectorAll('select[required], input[required]');
  let isValid = true;
  for (let s of selects) {
    if (!s.value) {
      s.style.border = '2px solid var(--risk-high)';
      if (isValid) s.focus();
      isValid = false;
      s.onchange = () => { s.style.border = ''; };
    } else {
      s.style.border = '';
    }
  }
  if (!isValid) {
    alert('Please select an option for all questions on this step before proceeding.');
  }
  return isValid;
}

function fillAdmin(email, password) {
  document.getElementById('login-email').value = email;
  document.getElementById('login-password').value = password;
}

function startNewAssessment() {
  currentWizardStep = 1;
  updateWizardUI();
  showPage('predict-view');
}

async function handleWizardSubmit(e) {
  e.preventDefault();

  if (!validateCurrentStep()) return;

  const btnSubmit = document.getElementById('btn-wizard-submit');
  const originalText = btnSubmit ? btnSubmit.innerHTML : '⚡ Predict My Eye Strain';
  if (btnSubmit) {
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '⏳ Calculating Risk...';
  }

  const payload = {
    gender: document.getElementById('q-gender').value,
    age: document.getElementById('q-age').value,
    study_year: document.getElementById('q-study-year').value,
    screen_time: document.getElementById('q-screen-time').value,
    device: document.getElementById('q-device').value,
    blue_light: document.getElementById('q-blue-light').value,
    screen_distance: document.getElementById('q-screen-distance').value,
    rule_20_20_20: document.getElementById('q-rule-20-20-20').value,
    dark_room: document.getElementById('q-dark-room').value,
    poor_posture: document.getElementById('q-poor-posture').value,
    glasses: document.getElementById('q-glasses').value,
    continuous_use: document.getElementById('q-continuous-use').value,
  };

  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/prediction/predict`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload)
    });

    const result = await res.json();
    if (res.ok) {
      renderAssessmentResult(result);
      showPage('result-view');
    } else {
      alert(result.detail || 'Error calculating eye strain score.');
    }
  } catch (err) {
    alert('Network error connecting to prediction API server.');
  } finally {
    if (btnSubmit) {
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = originalText;
    }
  }
}


function renderAssessmentResult(res) {
  const score = res.des_score;
  document.getElementById('res-score').textContent = score.toFixed(1);

  const riskBadge = document.getElementById('res-risk-badge');
  riskBadge.textContent = `${res.risk_level} RISK`;
  riskBadge.className = `risk-tag ${res.risk_level.toLowerCase()}`;

  // Dedicated Score-Range Action Plan
  const summaryTextEl = document.getElementById('res-score-summary-text');
  const actionPlanEl = document.getElementById('res-score-action-plan');

  let summaryMsg = '';
  let dedicatedPlan = [];

  if (score <= 4.0) {
    summaryMsg = `Excellent! Your estimated Digital Eye Strain risk is Low (${score.toFixed(1)} / 14). Follow these preventative habits to keep your eyes healthy:`;
    dedicatedPlan = [
      '🔹 Maintain your screen viewing distance at 20 to 28 inches (arm length).',
      '🔹 Practice routine study breaks every 50 to 60 minutes.',
      '🔹 Keep soft ambient room lighting on during evening study sessions.'
    ];
  } else if (score <= 9.0) {
    summaryMsg = `Moderate Digital Eye Strain risk detected (${score.toFixed(1)} / 14). We recommend the following active ergonomic adjustments:`;
    dedicatedPlan = [
      '⚡ Enforce the 20-20-20 Rule strictly: Look 20 feet away for 20 seconds every 20 minutes.',
      '⚡ Cap continuous screen viewing at 45 minutes maximum before resting your eyes.',
      '⚡ Enable system Night Shift / Blue Light Filter on smartphone and laptop.',
      '⚡ Avoid using digital devices in unlit or pitch-dark rooms.'
    ];
  } else {
    summaryMsg = `High Digital Eye Strain risk detected (${score.toFixed(1)} / 14). Immediate ergonomic action is recommended to relieve strain:`;
    dedicatedPlan = [
      '🚨 Take an immediate 15-minute non-screen break to rest your eyes.',
      '🚨 Correct your posture: Sit upright with feet flat, screen positioned slightly below eye level.',
      '🚨 Increase display font sizes and adjust screen brightness to match room lighting.',
      '🚨 Avoid screen focus exceeding 30 minutes continuous duration.',
      '🚨 If symptoms like blurred vision or severe headaches persist, consult an optometrist.'
    ];
  }

  summaryTextEl.textContent = summaryMsg;
  actionPlanEl.innerHTML = dedicatedPlan.map(item => `
    <div style="background: rgba(30, 41, 59, 0.6); padding: 0.7rem 1rem; border-left: 3px solid var(--accent-blue); border-radius: 4px; font-size: 0.9rem;">
      ${item}
    </div>
  `).join('');

  const factorsList = document.getElementById('res-factors-list');
  factorsList.innerHTML = res.contributing_factors.map(f => `<li>⚠️ ${f}</li>`).join('');

  const recsList = document.getElementById('res-recs-list');
  recsList.innerHTML = res.recommendations.map(r => `<li>✅ ${r}</li>`).join('');
}

// Dashboard Data
async function fetchDashboardData() {
  if (!token) return;
  try {
    const res = await fetch(`${API_BASE_URL}/api/prediction/history`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const history = await res.json();
      if (history.length > 0) {
        const latest = history[0];
        document.getElementById('dash-latest-score').textContent = latest.des_score.toFixed(1);
        const riskTag = document.getElementById('dash-latest-risk');
        riskTag.style.display = 'inline-block';
        riskTag.textContent = `${latest.risk_level} Risk`;
        riskTag.className = `risk-tag ${latest.risk_level.toLowerCase()}`;
        document.getElementById('dash-latest-date').textContent = new Date(latest.created_at).toLocaleDateString();
      }
    }
  } catch (err) {}
}

// History Data
async function fetchHistoryData() {
  if (!token) return;
  const tbody = document.getElementById('history-table-body');
  try {
    const res = await fetch(`${API_BASE_URL}/api/prediction/history`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const history = await res.json();
      if (history.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color: var(--text-muted);">No assessments recorded yet.</td></tr>`;
        return;
      }
      tbody.innerHTML = history.map(item => `
        <tr>
          <td>${new Date(item.created_at).toLocaleString()}</td>
          <td style="font-weight: 700; color: var(--accent-blue);">${item.des_score.toFixed(1)} / 14</td>
          <td><span class="risk-tag ${item.risk_level.toLowerCase()}" style="font-size: 0.75rem; padding: 0.2rem 0.6rem;">${item.risk_level}</span></td>
          <td>${item.model_version}</td>
        </tr>
      `).join('');
    }
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color: var(--risk-high);">Failed loading history data.</td></tr>`;
  }
}

// Admin Data
async function fetchAdminData() {
  if (!token) return;
  try {
    const resStats = await fetch(`${API_BASE_URL}/api/admin/statistics`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (resStats.ok) {
      const stats = await resStats.json();
      document.getElementById('adm-total-users').textContent = stats.total_users;
      document.getElementById('adm-total-assessments').textContent = stats.total_assessments;
      document.getElementById('adm-avg-score').textContent = stats.average_des_score;
    }

    const resPerf = await fetch(`${API_BASE_URL}/api/admin/model-performance`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (resPerf.ok) {
      const perf = await resPerf.json();
      const tbody = document.getElementById('admin-model-table-body');
      
      let rows = '';
      if (perf.all_models_comparison) {
        for (let [name, m] of Object.entries(perf.all_models_comparison)) {
          const isBest = name === perf.model_name;
          rows += `
            <tr style="${isBest ? 'background: rgba(56, 189, 248, 0.15); font-weight:600;' : ''}">
              <td>${name} ${isBest ? '⭐ (Deployed)' : ''}</td>
              <td>${m.MAE}</td>
              <td>${m.RMSE}</td>
              <td>${m.R2}</td>
              <td>${(m.Accuracy * 100).toFixed(1)}%</td>
              <td>${m.F1_Score}</td>
            </tr>
          `;
        }
      }
      tbody.innerHTML = rows;
    }

    fetchAdminUsers();
  } catch (err) {}
}

async function fetchAdminUsers() {
  const tbody = document.getElementById('admin-users-table-body');
  if (!tbody || !token) return;
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const users = await res.json();
      tbody.innerHTML = users.map(u => `
        <tr>
          <td>#${u.id}</td>
          <td style="font-weight:600;">${u.full_name}</td>
          <td>${u.email}</td>
          <td><span class="role-badge ${u.role.toLowerCase()}">${u.role.replace('_', ' ')}</span></td>
          <td>${new Date(u.created_at).toLocaleDateString()}</td>
        </tr>
      `).join('');
    }
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--risk-high);">Failed loading user directory.</td></tr>`;
  }
}

async function handleCreateStaff(e) {
  e.preventDefault();
  const payload = {
    full_name: document.getElementById('staff-name').value,
    email: document.getElementById('staff-email').value,
    password: document.getElementById('staff-password').value,
    role: document.getElementById('staff-role').value
  };

  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/create-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (res.ok) {
      alert(`Staff account (${data.email}) created successfully with role ${data.role}!`);
      closeModal('create-staff-modal');
      fetchAdminUsers();
    } else {
      document.getElementById('staff-error').textContent = data.detail || 'Failed to create staff account.';
    }
  } catch (err) {
    document.getElementById('staff-error').textContent = 'Network error creating staff account.';
  }
}

async function handleImportDataset(e) {
  e.preventDefault();
  const fileInput = document.getElementById('csv-file-input');
  if (!fileInput.files[0]) return;

  const formData = new FormData();
  formData.append('file', fileInput.files[0]);

  const statusDiv = document.getElementById('import-status');
  statusDiv.textContent = 'Uploading dataset...';

  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/import-dataset`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    const data = await res.json();
    statusDiv.textContent = data.message;
  } catch (err) {
    statusDiv.textContent = 'Dataset upload failed.';
  }
}

async function handleFeedbackSubmit(e) {
  e.preventDefault();
  const payload = {
    rating: parseInt(document.getElementById('fb-rating').value),
    helpful: document.getElementById('fb-helpful').value,
    comment: document.getElementById('fb-comment').value
  };

  try {
    const res = await fetch(`${API_BASE_URL}/api/prediction/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      alert('Thank you for your feedback!');
      closeModal('feedback-modal');
    }
  } catch (err) {
    alert('Failed to submit feedback.');
  }
}
