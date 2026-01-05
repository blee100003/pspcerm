import API_BASE_URL from '../config';

const API_URL = `${API_BASE_URL}/employees`;

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const EmployeeService = {
    getAll: async (status = '') => {
        const query = status ? `?status=${status}` : '';
        const res = await fetch(`${API_URL}/${query}`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch employees');
        return await res.json();
    },

    create: async (employee) => {
        const res = await fetch(`${API_URL}/`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(employee)
        });
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to create employee');
        }
        return await res.json();
    },

    update: async (id, updates) => {
        const res = await fetch(`${API_URL}/${id}/`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(updates)
        });
        if (!res.ok) throw new Error('Failed to update employee');
        return await res.json();
    },

    delete: async (id) => {
        const res = await fetch(`${API_URL}/${id}/`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!res.ok) throw new Error('Failed to delete employee');
    }
};
