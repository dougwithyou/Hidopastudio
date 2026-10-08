(() => {
  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const loginScreen = document.getElementById('login-screen');
  const adminScreen = document.getElementById('admin-screen');
  const loginForm = document.getElementById('login-form');
  const loginError = document.getElementById('login-error');
  const saveBtn = document.getElementById('save-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const saveStatus = document.getElementById('save-status');
  const formEl = document.getElementById('admin-form');

  let content = null;

  // Deep-merge: fields present in `base` but missing in `override` are filled in.
  function deepMerge(base, override) {
    if (Array.isArray(base)) {
      if (!Array.isArray(override)) return base;
      return base.map((item, i) => deepMerge(item, override[i]));
    }
    if (base && typeof base === 'object') {
      const result = {};
      for (const key of Object.keys(base)) {
        result[key] = deepMerge(base[key], override ? override[key] : undefined);
      }
      return result;
    }
    return override !== undefined ? override : base;
  }

  function getAt(obj, path) {
    return path.split('.').reduce((acc, k) => (acc == null ? undefined : acc[k]), obj);
  }

  function setAt(obj, path, value) {
    const parts = path.split('.');
    let cur = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      cur = cur[parts[i]];
    }
    cur[parts[parts.length - 1]] = value;
  }

  const LONG_KEYS = ['title', 'copy', 'subtitle', 'a', 'q', 'note', 'pending_note', 'quote'];

  function fieldLabel(key) {
    return key.replace(/_/g, ' ');
  }

  function buildFieldsForObject(obj, pathPrefix, container) {
    Object.keys(obj).forEach((key) => {
      const value = obj[key];
      const path = pathPrefix ? `${pathPrefix}.${key}` : key;

      if (Array.isArray(value)) {
        value.forEach((item, idx) => {
          const group = document.createElement('div');
          group.className = 'admin-group';
          const label = document.createElement('p');
          label.className = 'admin-group__label';
          label.textContent = `${fieldLabel(key)} #${idx + 1}`;
          group.appendChild(label);
          if (item && typeof item === 'object') {
            buildFieldsForObject(item, `${path}.${idx}`, group);
          }
          container.appendChild(group);
        });
        return;
      }

      if (value && typeof value === 'object') {
        buildFieldsForObject(value, path, container);
        return;
      }

      const field = document.createElement('div');
      field.className = 'admin-field';
      const label = document.createElement('label');
      label.textContent = fieldLabel(key);
      label.setAttribute('for', path);
      field.appendChild(label);

      if (key.toLowerCase().includes('image')) {
        const wrap = document.createElement('div');
        wrap.className = 'admin-image-field';
        const img = document.createElement('img');
        img.src = value || 'assets/images/weddings-hero.jpg';
        img.alt = '';
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.addEventListener('change', async () => {
          const file = fileInput.files[0];
          if (!file) return;
          saveStatus.textContent = 'Subiendo imagen…';
          const ext = file.name.split('.').pop();
          const path2 = `home/${key}-${Date.now()}.${ext}`;
          const { error } = await client.storage.from('site-images').upload(path2, file, { upsert: true });
          if (error) {
            saveStatus.textContent = 'Error subiendo imagen: ' + error.message;
            return;
          }
          const { data: pub } = client.storage.from('site-images').getPublicUrl(path2);
          setAt(content, path, pub.publicUrl);
          img.src = pub.publicUrl;
          saveStatus.textContent = 'Imagen lista — no olvides Guardar cambios';
        });
        wrap.appendChild(img);
        wrap.appendChild(fileInput);
        field.appendChild(wrap);
      } else if (LONG_KEYS.includes(key)) {
        const textarea = document.createElement('textarea');
        textarea.id = path;
        textarea.value = value || '';
        textarea.addEventListener('input', () => setAt(content, path, textarea.value));
        field.appendChild(textarea);
      } else {
        const input = document.createElement('input');
        input.type = 'text';
        input.id = path;
        input.value = value || '';
        input.addEventListener('input', () => setAt(content, path, input.value));
        field.appendChild(input);
      }

      container.appendChild(field);
    });
  }

  function renderForm() {
    formEl.innerHTML = '';
    Object.keys(content).forEach((sectionKey) => {
      const section = document.createElement('section');
      section.className = 'admin-section';
      const h2 = document.createElement('h2');
      h2.textContent = sectionKey.replace(/_/g, ' ');
      section.appendChild(h2);
      buildFieldsForObject(content[sectionKey], sectionKey, section);
      formEl.appendChild(section);
    });
  }

  async function loadContentForEditing() {
    const remote = await fetchSiteContent();
    content = deepMerge(DEFAULT_CONTENT, remote || {});
    renderForm();
  }

  async function save() {
    saveBtn.disabled = true;
    saveStatus.textContent = 'Guardando…';
    const { error } = await client
      .from('site_content')
      .upsert({ id: CONTENT_ROW_ID, data: content, updated_at: new Date().toISOString() });
    saveBtn.disabled = false;
    saveStatus.textContent = error ? 'Error: ' + error.message : 'Guardado ✓';
    if (!error) setTimeout(() => { saveStatus.textContent = ''; }, 2500);
  }

  function showAdmin() {
    loginScreen.hidden = true;
    adminScreen.hidden = false;
    loadContentForEditing();
  }

  function showLogin() {
    loginScreen.hidden = false;
    adminScreen.hidden = true;
  }

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.hidden = true;
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) {
      loginError.textContent = error.message;
      loginError.hidden = false;
      return;
    }
    showAdmin();
  });

  logoutBtn.addEventListener('click', async () => {
    await client.auth.signOut();
    showLogin();
  });

  saveBtn.addEventListener('click', save);

  // Init: check for an existing session
  client.auth.getSession().then(({ data }) => {
    if (data.session) {
      showAdmin();
    } else {
      showLogin();
    }
  });
})();
