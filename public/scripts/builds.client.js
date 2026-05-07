import { getBuildsByGame } from './api.js';

// Read initial data from embedded JSON script (safer for editors/linters)
const __initialDataEl = typeof document !== 'undefined' ? document.getElementById('initial-data') : null;
let __initialData = { gameSlug: null, user: null };
if (__initialDataEl) {
    try { __initialData = JSON.parse(__initialDataEl.textContent || __initialDataEl.innerText || '{}'); } catch (e) { __initialData = { gameSlug: null, user: null }; }
}
let currentGame = __initialData.gameSlug || 'elden-ring';
const user = __initialData.user || null;

const $ = selector => document.querySelector(selector);

function escapeHtml(str){
    return String(str || '').replace(/[&<>\"']/g, (s) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[s]);
}

function renderBuildCard(build){
    const cover = build.coverUrl ? `<img src="${escapeHtml(build.coverUrl)}" alt="" loading="lazy" decoding="async">` : `<div class="build-card-placeholder" aria-hidden="true">No Image</div>`;
    const tagsHtml = (Array.isArray(build.tags) && build.tags.length) ? `<div class="build-card-tags">${build.tags.slice(0,3).map(t=>`<span class="tag-chip">${escapeHtml(t)}</span>`).join('')}</div>` : '';
    const created = build.createdAt ? new Date(build.createdAt) : new Date();
    return `
    <article class="build-card" data-id="${escapeHtml(build.id)}" aria-label="Build: ${escapeHtml(build.name)}">
        <a class="card-overlay" href="/games/${encodeURIComponent(currentGame)}/builds/${encodeURIComponent(build.id)}" aria-label="Ver build ${escapeHtml(build.name)}"></a>
        <div class="build-card-media">${cover}</div>
        <div class="build-card-body">
            <div class="build-card-header">
                <h3>${escapeHtml(build.name)}</h3>
                <time class="build-card-date" datetime="${created.toISOString()}">${created.toLocaleDateString()}</time>
            </div>
            ${tagsHtml ? `<div class="build-card-tags">${tagsHtml}</div>` : ''}
            <p class="build-card-author">by <strong>${escapeHtml(build.creatorName || 'Anónimo')}</strong></p>
            ${build.description ? `<p class="build-card-desc">${escapeHtml(build.description)}</p>` : ''}
            ${build.gameName ? `<p class="build-card-game">${escapeHtml(build.gameName)}</p>` : ''}
            <div class="build-card-footer">
                ${user && String(user.id) === String(build.creatorId) ? `<a class="btn btn-ghost" href="/builds/${escapeHtml(build.id)}/edit">Editar</a>` : ''}
            </div>
        </div>
    </article>`;
}

async function tryFallbackData(){
    // Try multiple fallbacks: game-specific then generic second-game.json
    const paths = [`/data/builds/${encodeURIComponent(currentGame)}.json`, '/data/builds/second-game.json'];
    for (const path of paths){
        try{
            const res = await fetch(path);
            if (!res.ok) continue;
            const json = await res.json();
            return Array.isArray(json) ? json : (json.results || []);
        } catch (e) {
            // ignore and try next
        }
    }
    return [];
}

function sortBuilds(builds, order){
    const arr = Array.from(builds);
    if (order === 'recent') return arr.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (order === 'top') return arr.sort((a,b) => (b.votes || 0) - (a.votes || 0));
    if (order === 'yours' && user && user.id) {
        const userBuilds = arr.filter(b => String(b.creatorId) === String(user.id));
        const otherBuilds = arr.filter(b => String(b.creatorId) !== String(user.id));
        return [...userBuilds, ...otherBuilds];
    }
    return arr;
}

// Render a flat grid of cards (no grouped sections) so builds appear contiguously

let allBuilds = [];

async function loadBuilds(order = 'yours'){
    const container = $('#builds-list');
    if (!container) return;
    container.innerHTML = '<div class="alert-wrapper">Cargando builds…</div>';

    let builds = [];

    try{
        const data = await getBuildsByGame(currentGame, { limit: 500 });
        builds = Array.isArray(data) ? data : (data.results || []);
    } catch (err) {
        console.warn('API fetch failed, will try fallback', err);
    }

    if (!builds || builds.length === 0) {
        builds = await tryFallbackData();
    }

    if (!builds || builds.length === 0) {
        container.innerHTML = '<div class="alert-wrapper warning">No hay builds disponibles.</div>';
        return;
    }

    const ordered = sortBuilds(builds, order);
    allBuilds = ordered;

    renderFromBuildArray(allBuilds);
}

function renderFromBuildArray(buildArray){
    const container = $('#builds-list');
    if (!container) return;
    const cardsHtml = (Array.isArray(buildArray) ? buildArray : []).map(renderBuildCard).join('\n');
    container.innerHTML = `<div class="cards-grid">${cardsHtml}</div>`;
    // Also render featured (small) cards for the currently selected game
    renderFeaturedBuilds(buildArray);
}

// Ensure featured builds are loaded and visible immediately.
async function initFeatured(){
    try{
        const data = await getBuildsByGame(currentGame, { limit: 50 });
        const builds = Array.isArray(data) ? data : (data.results || []);
        if (builds && builds.length) {
            renderFeaturedBuilds(builds);
            return;
        }
    } catch (e) {
        // ignore and try fallback
    }

    // fallback to local JSON files
    const fallback = await tryFallbackData();
    renderFeaturedBuilds(fallback);
}

function slugifyGameName(name){
    return String(name||'').toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9\-]/g,'');
}

function renderFeaturedBuilds(buildArray){
    const target = document.getElementById('featured-builds');
    if (!target) return;
    const featured = buildArray.filter(b => {
        const slug = (b.gameSlug || slugifyGameName(b.gameName || ''));
        return String(slug) === String(currentGame);
    }).slice(0, 8);

    // If no builds explicitly match the game slug, fallback to first builds
    const finalList = featured.length ? featured : (buildArray.slice(0,8) || []);

    if (!finalList.length) {
        target.innerHTML = '<p class="featured-empty">No featured builds yet.</p>';
        return;
    }

    const cards = finalList.map(b => {
        const img = b.coverUrl ? `<div class="small-media"><img src="${escapeHtml(b.coverUrl)}" alt=""></div>` : `<div class="small-media placeholder">No Image</div>`;
        return `
            <article class="small-build-card" data-id="${escapeHtml(b.id)}">
                ${img}
                <div class="small-body">
                    <div class="small-tags">${(b.tags||[]).slice(0,2).map(t=>`<span class="tag-chip small">${escapeHtml(t)}</span>`).join('')}</div>
                    <h4 class="small-title">${escapeHtml(b.name)}</h4>
                    <div class="small-meta">${escapeHtml(b.creatorName || '')}</div>
                </div>
            </article>`;
    }).join('\n');

    target.innerHTML = `<div class="featured-inner">${cards}</div>`;
}

function debounce(fn, wait=150){
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
}

document.addEventListener('DOMContentLoaded', () => {
    const orderSel = document.getElementById('builds-order');
    const searchEl = document.getElementById('builds-search');
    const gamesSelect = document.getElementById('games-select');
    function formatGameSlug(slug){ return String(slug||'').split('-').filter(Boolean).map(s=>s.charAt(0).toUpperCase()+s.slice(1)).join(' '); }
    const debounced = debounce(() => loadBuilds(orderSel ? orderSel.value : 'yours'));
    loadBuilds(orderSel ? orderSel.value : 'yours');
    // initialize featured builds early
    initFeatured();
    if (orderSel) orderSel.addEventListener('change', debounced);
    if (gamesSelect) {
        gamesSelect.addEventListener('change', (e) => {
            const slug = e.target.value;
            currentGame = slug;
            // update the builds section title
            const sectionTitle = document.querySelector('.builds-section-title');
            if (sectionTitle) sectionTitle.textContent = 'Selecciona tu build';
            // update hero title if present
            const heroTitle = document.querySelector('.builds-title');
            if (heroTitle) heroTitle.textContent = formatGameSlug(slug);
            // update document title
            try { document.title = `Builds - ${formatGameSlug(slug)}`; } catch (e) {}
            // reload builds for selected game
            loadBuilds(orderSel ? orderSel.value : 'yours');
        });
    }
    if (searchEl) {
        const doSearch = debounce(() => {
            const q = (searchEl.value || '').trim().toLowerCase();
            if (!q) return renderFromBuildArray(allBuilds);
            const filtered = allBuilds.filter(b => {
                const name = String(b.name || '').toLowerCase();
                const creator = String(b.creatorName || '').toLowerCase();
                const tags = (b.tags || []).join(' ').toLowerCase();
                const game = String(b.gameName || b.gameSlug || '').toLowerCase();
                return name.includes(q) || creator.includes(q) || tags.includes(q) || game.includes(q);
            });
            renderFromBuildArray(filtered);
        }, 200);
        searchEl.addEventListener('input', doSearch);
    }
});
