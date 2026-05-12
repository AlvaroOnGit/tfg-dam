const API_URL = 'https://spellsword.onrender.com/';

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

export async function logout(){

    async function makeRequest(){
        return fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include',
        });
    }

    let res = await makeRequest();

    if (res.status === 401) {
        try {
            await refresh();

            res = await makeRequest();

        } catch (err) {
            throw {
                status: 401,
                message: 'Session expired'
            };
        }
    }

    const data = await res.json();

    if (!res.ok) {
        throw { status: res.status, data };
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

async function refresh(){
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
/*------Users------*/
export async function updateUser(userData, field){

    async function makeRequest(){
        return fetch(`${API_URL}/users/me/${field}`, {
            method: 'PATCH',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        })
    }

    let res = await makeRequest();

    if (res.status === 401) {
        try {
            await refresh();

            res = await makeRequest();

        } catch (err) {
            throw {
                status: 401,
                message: 'Session expired'
            };
        }
    }

    const data = await res.json();

    if (!res.ok) {
        throw { status: res.status, data };
    }

    return data;
}

/*------Games------*/
export async function getGames({ page = 1, name = '', genre = '' } = {}) {
    const params = new URLSearchParams({ limit: 15, page });

    if (name) params.append('name', name);
    if (genre) params.append('genre', genre);

    async function makeRequest(){
        return fetch(`${API_URL}/games?${params}`, {
            credentials: 'same-origin'
        });

    }

    let res = await makeRequest();

    if (res.status === 401) {
        try {
            await refresh();

            res = await makeRequest();

        } catch (err) {
            throw {
                status: 401,
                message: 'Session expired'
            };
        }
    }

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

    async function makeRequest() {
        return fetch(`${API_URL}/builds?${params}`, {
            credentials: 'same-origin'
        });
    }

    let res = await makeRequest();

    if (res.status === 401) {
        try {
            await refresh();

            res = await makeRequest();

        } catch (err) {
            throw {
                status: 401,
                message: 'Session expired'
            };
        }
    }

    const data = await res.json();

    if (!res.ok) {
        throw { status: res.status, data };
    }

    return data;

}

export async function createBuild(buildData){

    async function makeRequest() {
        return fetch(`${API_URL}/builds`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(buildData)
        });
    }

    let res = await makeRequest();

    if (res.status === 401) {
        try {
            await refresh();

            res = await makeRequest();

        } catch (err) {
            throw {
                status: 401,
                message: 'Session expired'
            };
        }
    }

    const data = await res.json();

    if (!res.ok) {
        throw { status: res.status, data };
    }

    return data;
}

export async function updateBuild(buildData, buildId){

    async function makeRequest() {
        return fetch(`${API_URL}/builds/${buildId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(buildData)
        })
    }

    let res = await makeRequest();

    if (res.status === 401) {
        try {
            await refresh();

            res = await makeRequest();

        } catch (err) {
            throw {
                status: 401,
                message: 'Session expired'
            };
        }
    }

    const data = await res.json();

    if (!res.ok) {
        throw { status: res.status, data };
    }

    return data;
}

export async function deleteBuild(buildId) {

    async function makeRequest() {
        return fetch(`${API_URL}/builds/${buildId}`, {
            method: 'DELETE',
            credentials: 'same-origin'
        });
    }

    let res = await makeRequest();

    if (res.status === 401) {
        try {
            await refresh();

            res = await makeRequest();

        } catch (err) {
            throw {
                status: 401,
                message: 'Session expired'
            };
        }
    }

    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw { status: res.status, data };
    }
}
/*------Assets------*/
export async function getAssets({
    page = 1,
    gameSlug = 'elden-ring',
    name = '',
    type = '',
    category = '' } = {}) {

    const params = new URLSearchParams({ limit: 50, page });

    params.append('gameSlug', gameSlug);
    if (name) params.append('name', name);
    if (type) params.append('type', type);
    if (category) params.append('category', category);

    async function makeRequest() {
        return fetch(`${API_URL}/assets?${params}`, {
            credentials: 'same-origin'
        });
    }

    let res = await makeRequest();

    if (res.status === 401) {
        try {
            await refresh();

            res = await makeRequest();

        } catch (err) {
            throw {
                status: 401,
                message: 'Session expired'
            };
        }
    }

    const data = await res.json();

    if (!res.ok) {
        throw { status: res.status, data };
    }

    return data;
}