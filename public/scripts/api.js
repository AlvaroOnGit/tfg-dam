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

    return data;
}

export async function register(userData){
    const res = await fetch(`${API_URL}/auth/register`, {
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

    return data;
}

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

    const data = await res.json();

    if (!res.ok) {
        throw {
            status: res.status,
            message: data.message,
        }
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