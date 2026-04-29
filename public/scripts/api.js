// Use relative API path so the client works on different hosts/environments
const API_URL = '/api';

async function apiFetch(path, opts = {}){
    const res = await fetch(`${API_URL}${path}`, opts);
    const text = await res.text();
    let data;
    try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }
    if (!res.ok) throw { status: res.status, data };
    return data;
}

// Auth
export async function login(userData){
    return apiFetch('/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(userData) });
}

export async function register(userData){
    return apiFetch('/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(userData) });
}

export async function refresh(){
    return apiFetch('/auth/refresh', { method: 'POST', credentials: 'include' });
}

export async function getCurrentUser(){
    try { return await apiFetch('/auth/me', { credentials: 'include' }); } catch (e) { return null; }
}

// Builds
export async function getBuilds(params = {}){
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k,v]) => { if (v !== undefined && v !== null) q.append(k, String(v)); });
    return apiFetch(`/builds?${q.toString()}`);
}

export async function getBuildById(id){
    return apiFetch(`/builds/${encodeURIComponent(id)}`);
}

export async function createBuild(buildData){
    return apiFetch('/builds', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(buildData) });
}

export async function updateBuild(id, buildData){
    return apiFetch(`/builds/${encodeURIComponent(id)}`, { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(buildData) });
}

export async function deleteBuild(id){
    return apiFetch(`/builds/${encodeURIComponent(id)}`, { method: 'DELETE', credentials: 'include' });
}

// Users & Games
export async function getUserBuilds(userId, opts = {}){
    return getBuilds(Object.assign({}, opts, { creator: userId }));
}

export async function getGames(){
    return apiFetch('/games');
}

export async function getGameBySlug(slug){
    return apiFetch(`/games/${encodeURIComponent(slug)}`);
}

// Assets
export async function getAssets(params = {}){
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k,v]) => { if (v !== undefined && v !== null) q.append(k, String(v)); });
    return apiFetch(`/assets?${q.toString()}`);
}

// legacy helpers kept for compatibility
export const getBuildsByGame = async (gameSlug, opts = {}) => (await getBuilds(Object.assign({ gameSlug }, opts)));
export const getBuildsByCreator = async (creatorId, opts = {}) => (await getUserBuilds(creatorId, opts));
