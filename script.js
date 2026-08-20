// ===========================================================
// JubluTech — interactions front-end
// ===========================================================

document.getElementById('year').textContent = new Date().getFullYear();

// Menu mobile
const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.nav');

navToggle.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('nav-open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

document.querySelectorAll('.nav a').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('nav-open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// ===========================================================
// Session & header dynamique
// ===========================================================
const authArea = document.getElementById('auth-area');
const form = document.getElementById('contact-form');
let currentSession = null;
let currentProfile = null;

async function refreshAuthUI() {
  const { data } = await supabaseClient.auth.getSession();
  currentSession = data.session;

  if (!currentSession) {
    currentProfile = null;
    authArea.innerHTML = `<a href="auth.html" class="btn btn-ghost header-cta">Connexion</a>`;
    return;
  }

  const { data: profile } = await supabaseClient
    .from('profiles')
    .select('nom, is_admin')
    .eq('id', currentSession.user.id)
    .single();

  currentProfile = profile;
  const prenom = profile?.nom ? profile.nom.split(' ')[0] : currentSession.user.email;

  authArea.innerHTML = `
    <span class="auth-greeting">Bonjour, ${prenom}</span>
    ${profile?.is_admin ? '<a href="admin.html" class="btn btn-ghost header-cta">Admin</a>' : ''}
    <button id="logout-btn" class="btn btn-ghost header-cta">Déconnexion</button>
  `;

  document.getElementById('logout-btn').addEventListener('click', async () => {
    await supabaseClient.auth.signOut();
    refreshAuthUI();
  });

  // Pré-remplit le formulaire de contact si on connaît déjà le client
  if (form) {
    form.nom.value = profile?.nom || '';
    form.email.value = currentSession.user.email || '';
  }
}

refreshAuthUI();

// ===========================================================
// Formulaire de contact → table "demandes" (Supabase)
// ===========================================================
if (form) {
  const status = form.querySelector('.form-status');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!currentSession) {
      showStatus('Connecte-toi ou crée un compte pour envoyer ta demande.', 'err');
      setTimeout(() => { window.location.href = 'auth.html'; }, 1500);
      return;
    }

    const nom = form.nom.value.trim();
    const email = form.email.value.trim();
    const structure = form.structure.value.trim();
    const besoin = form.besoin.value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!nom || !email || !besoin) {
      showStatus('Merci de remplir tous les champs obligatoires.', 'err');
      return;
    }
    if (!emailPattern.test(email)) {
      showStatus('Merci de saisir un email valide.', 'err');
      return;
    }

    showStatus('Envoi en cours…', '');

    const { error } = await supabaseClient.from('demandes').insert({
      user_id: currentSession.user.id,
      nom,
      email,
      structure: structure || null,
      besoin
    });

    if (error) {
      showStatus("Erreur lors de l'envoi : " + error.message, 'err');
      return;
    }

    showStatus('Demande envoyée ! Nous revenons vers toi rapidement.', 'ok');
    form.besoin.value = '';
  });

  function showStatus(message, type) {
    status.textContent = message;
    status.className = 'form-status ' + type;
  }
}
