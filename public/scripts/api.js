const API_URL = 'http://localhost:3000/api';

/*------Authentication------*/
export async function login(userData){
    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
    });

    const data = await res.json();

    if (!res.ok) {
        throw {
            status: res.status,
            data
        };
    }

    try {
        return await response.json();
    } catch {
        return null;
    }
};

const request = async (url, { method = 'GET', body, headers = {}, credentials = 'include' } = {}) => {
    const response = await fetch(url, {
        method,
        headers: {
            ...(body ? { 'Content-Type': 'application/json' } : {}),
            ...headers
        },
        credentials,
        ...(body ? { body: JSON.stringify(body) } : {})
    });

    const data = await parseResponseBody(response);

    if (!response.ok) {
        const error = new Error(data?.message || 'Request failed.');
        error.status = response.status;
        error.data = data;
        throw error;
    }

    return data;
};

export async function forgot(userData){
    const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
    })

    const data = await res.json();

    if (!res.ok) {
        throw {
            status: res.status,
            data
        };
    }

    return data;
}

export async function reset(userData, token){
    const res = await fetch(`${API_URL}/auth/reset-password/${token}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
    })

    const data = await res.json();

    if (!res.ok) {
        throw {
            status: res.status,
            data
        };
    }

    return data;
}

export async function refresh(){
    const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
    });

window.api = {
    get: (url, options = {}) => request(url.startsWith('http') ? url : `${API_URL}${url}`, { ...options, method: 'GET' }),
    post: (url, body, options = {}) => request(url.startsWith('http') ? url : `${API_URL}${url}`, { ...options, method: 'POST', body }),
    patch: (url, body, options = {}) => request(url.startsWith('http') ? url : `${API_URL}${url}`, { ...options, method: 'PATCH', body }),
    put: (url, body, options = {}) => request(url.startsWith('http') ? url : `${API_URL}${url}`, { ...options, method: 'PUT', body }),
    delete: (url, options = {}) => request(url.startsWith('http') ? url : `${API_URL}${url}`, { ...options, method: 'DELETE' })
};

export async function login(userData){
    return await window.api.post('/auth/login', userData);
}

    return data;
}

/*------Games------*/
export async function getGames({ page = 1, name = '', genre = '' } = {}) {
    const params = new URLSearchParams({ limit: 15, page });

    if (name) params.append('name', name);
    if (genre) params.append('genre', genre);

    const res = await fetch(`${API_URL}/games?${params}`, {
        credentials: 'same-origin'
    });

    const data = await res.json();

    if (!res.ok) {
        throw { status: res.status, data };
    }

    return data;
}

/*------Builds------*/
export async function getBuilds({
    page = 1,
    gameSlug = '',
    name = '',
    creator = '',
    tags = [] } = {}) {

    const params = new URLSearchParams({ limit: 15, page });

    if (gameSlug) params.append('gameSlug', gameSlug);
    if (name) params.append('name', name);
    if (creator) params.append('creator', creator);
    if (tags.length) tags.forEach(tag => params.append('tags?', tag));

    const res = await fetch(`${API_URL}/builds?${params}`, {
        credentials: 'same-origin'
    });

    const data = await res.json();

    if (!res.ok) {
        throw { status: res.status, data };
    }

    return data;

}