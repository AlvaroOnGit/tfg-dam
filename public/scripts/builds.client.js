import { getBuildsByGame } from './api.js';

// Read initial data from embedded JSON script (safer for editors/linters)
const __initialDataEl = typeof document !== 'undefined' ? document.getElementById('initial-data') : null;
let __initialData = { gameSlug: null, user: null };
if (__initialDataEl) {
    try { __initialData = JSON.parse(__initialDataEl.textContent || __initialDataEl.innerText || '{}'); } catch (e) { __initialData = { gameSlug: null, user: null }; }
}
const gameSlug = __initialData.gameSlug || '';
const user = __initialData.user || null;

const $ = selector => document.querySelector(selector);

function escapeHtml(str){
    return String(str || '').replace(/[&<>\"']/g, (s) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[s]);
}

function renderBuildCard(build){
    const cover = build.coverUrl ? `<img src="${escapeHtml(build.coverUrl)}" alt="${escapeHtml(build.name)} cover" loading="lazy" decoding="async">` : `<div class="build-card-placeholder" aria-hidden="true">No Image</div>`;
    const tagsHtml = (Array.isArray(build.tags) && build.tags.length) ? `<div class="build-card-tags">${build.tags.slice(0,3).map(t=>`<span class="tag-chip">${escapeHtml(t)}</span>`).join('')}</div>` : '';
    const created = build.createdAt ? new Date(build.createdAt) : new Date();
    return `
    <article class="build-card" data-id="${escapeHtml(build.id)}" aria-label="Build: ${escapeHtml(build.name)}">
        <div class="build-card-media">${tagsHtml}${cover}</div>
        <div class="build-card-body">
            <div class="build-card-header">
                <h3>${escapeHtml(build.name)}</h3>
                <time class="build-card-date" datetime="${created.toISOString()}">${created.toLocaleDateString()}</time>
            </div>
            <p class="build-card-author">by <strong>${escapeHtml(build.creatorName || 'Anónimo')}</strong></p>
            ${build.description ? `<p class="build-card-desc">${escapeHtml(build.description)}</p>` : ''}
            ${build.gameName ? `<p class="build-card-game">${escapeHtml(build.gameName)}</p>` : ''}
            <div class="build-card-footer">
                ${user && String(user.id) === String(build.creatorId) ? `<a class="btn btn-ghost" href="/builds/${escapeHtml(build.id)}/edit">Editar</a>` : ''}
                <a class="btn btn-primary" href="/api/builds/${escapeHtml(build.id)}">Ver</a>
            </div>
        </div>
    </article>`;
}

async function tryFallbackData(){
    // Try multiple fallbacks: game-specific then generic second-game.json
    const paths = [`/data/builds/${encodeURIComponent(gameSlug)}.json`, '/data/builds/second-game.json'];
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

function renderGroupsHTML(groups){
    return Object.keys(groups).map((title) => {
        const items = groups[title];
        const cards = items.map(renderBuildCard).join('\n');
        return `
            <section class="game-section">
                <div class="section-header">
                    <h2 class="game-title">${escapeHtml(title)}</h2>
                </div>
                <div class="cards-sheet" data-game="${escapeHtml(title)}">
                    <div class="cards-grid">${cards}</div>
                </div>
            </section>`;
    }).join('\n');
}

let allBuilds = [];

async function loadBuilds(order = 'yours'){
    const container = $('#builds-list');
    if (!container) return;
    container.innerHTML = '<div class="alert-wrapper">Cargando builds…</div>';

    let builds = [];

    try{
        const data = await getBuildsByGame(gameSlug, { limit: 500 });
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
    const groups = buildArray.reduce((acc, b) => {
        const key = b.gameName || b.gameSlug || gameSlug || 'Unknown Game';
        (acc[key] = acc[key] || []).push(b);
        return acc;
    }, {});
    container.innerHTML = renderGroupsHTML(groups);
}

function debounce(fn, wait=150){
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
}

document.addEventListener('DOMContentLoaded', () => {
    const orderSel = document.getElementById('builds-order');
    const searchEl = document.getElementById('builds-search');
    const debounced = debounce(() => loadBuilds(orderSel ? orderSel.value : 'yours'));
    loadBuilds(orderSel ? orderSel.value : 'yours');
    if (orderSel) orderSel.addEventListener('change', debounced);
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
