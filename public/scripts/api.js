const API_URL = 'http://localhost:3000/api';

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