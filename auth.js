// ===========================================================
// JubluTech — auth.js
// ===========================================================

document.getElementById('year').textContent = new Date().getFullYear();

// Si déjà connecté, on renvoie direct vers l'accueil
supabaseClient.auth.getSession().then(({ data }) => {
  if (data.session) window.location.href = 'index.html';
});

// --- Bascule entre les onglets Connexion / Inscription ---
const tabs = document.querySelectorAll('.auth-tab');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => { t.classList.remove('is-active'); t.setAttribute('aria-selected', 'false'); });
    tab.classList.add('is-active');
    tab.setAttribute('aria-selected', 'true');

    const isLogin = tab.dataset.tab === 'login';
    loginForm.hidden = !isLogin;
    signupForm.hidden = isLogin;
  });
});

// --- Connexion ---
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const status = loginForm.querySelector('.form-status');
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  status.className = 'form-status';
  status.textContent = 'Connexion en cours…';

  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

  if (error) {
    status.className = 'form-status err';
    status.textContent = 'Email ou mot de passe incorrect.';
    return;
  }
  window.location.href = 'index.html';
});

// --- Inscription ---
signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const status = signupForm.querySelector('.form-status');
  const nom = document.getElementById('signup-nom').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;

  status.className = 'form-status';
  status.textContent = 'Création du compte…';

  const { error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: { data: { nom } }
  });

  if (error) {
    status.className = 'form-status err';
    status.textContent = "Impossible de créer le compte : " + error.message;
    return;
  }

  status.className = 'form-status ok';
  status.textContent = 'Compte créé ! Vérifie ta boîte mail pour confirmer, puis connecte-toi.';
  signupForm.reset();
});
