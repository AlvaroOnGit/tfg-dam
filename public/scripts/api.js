const isJsonResponse = (response) => {
    const contentType = response.headers.get('content-type') || '';
    return contentType.includes('application/json');
};

const parseResponseBody = async (response) => {
    if (!isJsonResponse(response)) {
        return null;
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

const API_URL = '/api';

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

export async function register(userData){
    return await window.api.post('/auth/register', userData);
}

export async function logout(){
    return await window.api.post('/auth/logout');
}