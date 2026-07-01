const $ = (id) => document.getElementById(id);

function escapeHtml(str) {
    return String(str ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

function extrairIdYoutube(url) {
    const m = String(url || '').match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([\w-]{6,})/);
    return m ? m[1] : null;
}

function thumbUrl(url) {
    const id = extrairIdYoutube(url);
    return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : '';
}

async function api(path, options) {
    const res = await fetch(path, { headers: { 'Content-Type': 'application/json' }, ...options });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Erro ${res.status}`);
    }
    return res.status === 204 ? null : res.json();
}

function renderTags(tags) {
    if (!tags) return '';
    return tags.split(',').map(t => t.trim()).filter(Boolean).map(t => `<span>${escapeHtml(t)}</span>`).join('');
}

function cardEditHtml(v) {
    const opts = categorias.map(c =>
        `<option value="${c.id}"${Number(v.categoria_id) === c.id ? ' selected' : ''}>${escapeHtml(c.nome)}</option>`
    ).join('');
    return `
        <div class="vedit">
            <div class="row2">
                <input class="ei-titulo" placeholder="Título" value="${escapeHtml(v.titulo)}">
                <input class="ei-url" placeholder="Link do YouTube" value="${escapeHtml(v.url)}">
            </div>
            <div class="row2">
                <input class="ei-tags" placeholder="Palavras-chave separadas por vírgula" value="${escapeHtml(v.tags || '')}">
                <select class="ei-categoria">
                    <option value="">Sem categoria</option>
                    ${opts}
                </select>
            </div>
            <input class="ei-descricao" placeholder="Descrição (opcional)" value="${escapeHtml(v.descricao || '')}" style="width:100%;margin-bottom:8px">
            <div class="vedit-actions">
                <button class="btn ei-salvar" data-id="${v.id}">Salvar</button>
                <button class="btn cancelar ei-cancelar" data-id="${v.id}">Cancelar</button>
            </div>
        </div>`;
}

function cardHtml(v) {
    const thumb = thumbUrl(v.url);
    return `
        <div class="vcard" data-id="${v.id}">
            ${thumb ? `<img class="vthumb" src="${thumb}" alt="">` : '<div class="vthumb"></div>'}
            <div class="vbody">
                ${v.categoria_nome ? `<div class="vcategoria">${escapeHtml(v.categoria_nome)}</div>` : ''}
                <h2>${escapeHtml(v.titulo)}</h2>
                ${v.descricao ? `<p class="vdesc">${escapeHtml(v.descricao)}</p>` : ''}
                <div class="vtags">${renderTags(v.tags)}</div>
                <div class="vactions">
                    <a href="${escapeHtml(v.url)}" target="_blank" rel="noopener">abrir</a>
                    <button class="copy" data-url="${escapeHtml(v.url)}">copiar link</button>
                    <button class="edit" data-id="${v.id}">editar</button>
                    <button class="del" data-id="${v.id}">excluir</button>
                </div>
            </div>
        </div>`;
}

let cacheVideos = [];
let categorias = [];
let categoriaFiltro = '';

async function carregarCategorias() {
    categorias = await api('/api/categorias-video');

    $('catchips').innerHTML = ['<button class="catchip active" data-id="">Todas</button>']
        .concat(categorias.map(c => `<button class="catchip" data-id="${c.id}">${escapeHtml(c.nome)}</button>`))
        .join('');

    $('vCategoria').innerHTML = '<option value="">Sem categoria</option>' +
        categorias.map(c => `<option value="${c.id}">${escapeHtml(c.nome)}</option>`).join('');
}

async function carregar() {
    const busca = $('busca').value.trim();
    const params = new URLSearchParams();
    if (busca) params.set('busca', busca);
    if (categoriaFiltro) params.set('categoria_id', categoriaFiltro);

    cacheVideos = await api(`/api/videos?${params.toString()}`);
    const lista = $('lista');
    const empty = $('empty');
    if (!cacheVideos.length) {
        lista.innerHTML = '';
        empty.style.display = 'block';
    } else {
        empty.style.display = 'none';
        lista.innerHTML = cacheVideos.map(cardHtml).join('');
    }
}

function resetForm() {
    $('videoId').value = '';
    $('vTitulo').value = '';
    $('vUrl').value = '';
    $('vTags').value = '';
    $('vDescricao').value = '';
    $('vCategoria').value = '';
    $('formTitulo').textContent = 'Novo vídeo';
    $('btnCancelar').style.display = 'none';
}

function preencherForm(video) {
    $('videoId').value = video.id;
    $('vTitulo').value = video.titulo;
    $('vUrl').value = video.url;
    $('vTags').value = video.tags || '';
    $('vDescricao').value = video.descricao || '';
    $('vCategoria').value = video.categoria_id || '';
    $('formTitulo').textContent = `Editando: ${video.titulo}`;
    $('btnCancelar').style.display = '';
    $('admin').classList.add('show');
}

$('toggleAdmin').addEventListener('click', () => {
    const admin = $('admin');
    const abrindo = !admin.classList.contains('show');
    admin.classList.toggle('show');
    if (abrindo) resetForm();
});

$('btnCancelar').addEventListener('click', () => { resetForm(); $('admin').classList.remove('show'); });

$('btnNovaCategoria').addEventListener('click', async () => {
    const nome = $('novaCategoria').value.trim();
    if (!nome) return;
    const categoria = await api('/api/categorias-video', { method: 'POST', body: JSON.stringify({ nome }) });
    $('novaCategoria').value = '';
    await carregarCategorias();
    $('vCategoria').value = categoria.id;
});

$('btnSalvar').addEventListener('click', async () => {
    const titulo = $('vTitulo').value.trim();
    const url = $('vUrl').value.trim();
    if (!titulo || !url) { alert('Título e link são obrigatórios.'); return; }

    const payload = {
        titulo, url,
        tags: $('vTags').value.trim(),
        descricao: $('vDescricao').value.trim(),
        categoria_id: $('vCategoria').value || null,
    };
    const id = $('videoId').value;

    try {
        if (id) await api(`/api/videos/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
        else await api('/api/videos', { method: 'POST', body: JSON.stringify(payload) });
        resetForm();
        $('admin').classList.remove('show');
        carregar();
    } catch (e) {
        alert(e.message);
    }
});

$('lista').addEventListener('click', async (e) => {
    const copyBtn = e.target.closest('.copy');
    const editBtn = e.target.closest('.edit');
    const delBtn = e.target.closest('.del');
    const salvarBtn = e.target.closest('.ei-salvar');
    const cancelarBtn = e.target.closest('.ei-cancelar');

    if (copyBtn) {
        const ok = await copiarTexto(copyBtn.dataset.url);
        copyBtn.textContent = ok ? 'copiado ✓' : 'não copiou, selecione manualmente';
        if (ok) copyBtn.classList.add('ok');
        setTimeout(() => { copyBtn.textContent = 'copiar link'; copyBtn.classList.remove('ok'); }, 1800);
        return;
    }

    if (editBtn) {
        const id = Number(editBtn.dataset.id);
        const video = cacheVideos.find(v => v.id === id);
        if (!video) return;
        const card = $('lista').querySelector(`.vcard[data-id="${id}"]`);
        if (card) { card.innerHTML = cardEditHtml(video); card.classList.add('editando'); }
        return;
    }

    if (salvarBtn) {
        const id = Number(salvarBtn.dataset.id);
        const card = $('lista').querySelector(`.vcard[data-id="${id}"]`);
        if (!card) return;
        const titulo = card.querySelector('.ei-titulo').value.trim();
        const url = card.querySelector('.ei-url').value.trim();
        if (!titulo || !url) { alert('Título e link são obrigatórios.'); return; }
        const payload = {
            titulo, url,
            tags: card.querySelector('.ei-tags').value.trim(),
            descricao: card.querySelector('.ei-descricao').value.trim(),
            categoria_id: card.querySelector('.ei-categoria').value || null,
        };
        try {
            const updated = await api(`/api/videos/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
            const cat = categorias.find(c => String(c.id) === String(payload.categoria_id));
            const novoVideo = { ...updated, categoria_nome: cat?.nome || null };
            const idx = cacheVideos.findIndex(v => v.id === id);
            if (idx !== -1) cacheVideos[idx] = novoVideo;
            card.outerHTML = cardHtml(novoVideo);
        } catch (err) { alert(err.message); }
        return;
    }

    if (cancelarBtn) {
        const id = Number(cancelarBtn.dataset.id);
        const video = cacheVideos.find(v => v.id === id);
        const card = $('lista').querySelector(`.vcard[data-id="${id}"]`);
        if (video && card) card.outerHTML = cardHtml(video);
        return;
    }

    if (delBtn) {
        if (!confirm('Excluir esse vídeo da lista?')) return;
        await api(`/api/videos/${delBtn.dataset.id}`, { method: 'DELETE' });
        carregar();
    }
});

$('catchips').addEventListener('click', (e) => {
    const btn = e.target.closest('.catchip');
    if (!btn) return;
    $('catchips').querySelectorAll('.catchip').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    categoriaFiltro = btn.dataset.id;
    carregar();
});

let debounce;
$('busca').addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(carregar, 250);
});

(async function init() {
    await carregarCategorias();
    await carregar();
})();
