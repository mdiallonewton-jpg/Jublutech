// ===========================================================
// JubluTech — admin.js
// ===========================================================

document.getElementById('year').textContent = new Date().getFullYear();

const authArea = document.getElementById('auth-area');
const gate = document.getElementById('admin-gate');
const content = document.getElementById('admin-content');
const tbody = document.getElementById('demandes-body');
const emptyState = document.getElementById('empty-state');

const STATUS_LABELS = {
  nouveau: 'Nouveau',
  en_cours: 'En cours',
  termine: 'Terminé'
};

init();

async function init() {
  const { data: { session } } = await supabaseClient.auth.getSession();

  if (!session) {
    showGate();
    return;
  }

  const { data: profile } = await supabaseClient
    .from('profiles')
    .select('nom, is_admin')
    .eq('id', session.user.id)
    .single();

  authArea.innerHTML = `
    <span class="auth-greeting">Bonjour, ${profile?.nom || session.user.email}</span>
    <button id="logout-btn" class="btn btn-ghost header-cta">Déconnexion</button>
  `;
  document.getElementById('logout-btn').addEventListener('click', async () => {
    await supabaseClient.auth.signOut();
    window.location.href = 'index.html';
  });

  if (!profile?.is_admin) {
    showGate();
    return;
  }

  content.hidden = false;
  loadDemandes();
}

function showGate() {
  gate.hidden = false;
  content.hidden = true;
  authArea.innerHTML = `<a href="auth.html" class="btn btn-ghost header-cta">Connexion</a>`;
}

async function loadDemandes() {
  const { data: demandes, error } = await supabaseClient
    .from('demandes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    tbody.innerHTML = `<tr><td colspan="6">Erreur de chargement : ${error.message}</td></tr>`;
    return;
  }

  if (!demandes.length) {
    emptyState.hidden = false;
    return;
  }

  tbody.innerHTML = demandes.map(rowHtml).join('');

  tbody.querySelectorAll('select.status-select').forEach(select => {
    select.addEventListener('change', async () => {
      const id = select.dataset.id;
      const { error } = await supabaseClient
        .from('demandes')
        .update({ status: select.value })
        .eq('id', id);

      if (error) alert("Impossible de mettre à jour le statut : " + error.message);
    });
  });
}

function rowHtml(d) {
  const date = new Date(d.created_at).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });

  const options = Object.entries(STATUS_LABELS)
    .map(([value, label]) => `<option value="${value}" ${d.status === value ? 'selected' : ''}>${label}</option>`)
    .join('');

  return `
    <tr>
      <td>${date}</td>
      <td>${escapeHtml(d.nom)}</td>
      <td>${escapeHtml(d.email)}</td>
      <td>${escapeHtml(d.structure || '—')}</td>
      <td class="admin-besoin">${escapeHtml(d.besoin)}</td>
      <td><select class="status-select" data-id="${d.id}">${options}</select></td>
    </tr>
  `;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
