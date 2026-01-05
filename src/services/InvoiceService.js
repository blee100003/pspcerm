import API_BASE_URL from '../config';

const API_URL = `${API_BASE_URL}/invoices`;

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const InvoiceService = {
    getAll: async () => {
        const res = await fetch(`${API_URL}/`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch invoices');
        return await res.json();
    },

    create: async (invoice) => {
        const res = await fetch(`${API_URL}/`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(invoice)
        });
        if (!res.ok) throw new Error('Failed to create invoice');
        return await res.json();
    },

    update: async (id, updates) => {
        const res = await fetch(`${API_URL}/${id}/`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(updates)
        });
        if (!res.ok) throw new Error('Failed to update invoice');
        return await res.json();
    },

    delete: async (id) => {
        const res = await fetch(`${API_URL}/${id}/`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to delete invoice');
        }
        if (res.status === 204) return true;
        return await res.json();
    }
};
