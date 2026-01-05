



import API_BASE_URL from '../config';

const API_BASE = API_BASE_URL;

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const FinanceService = {
    getTransactions: async () => {
        const res = await fetch(`${API_BASE}/transactions/`, { headers: getHeaders() });
        return await res.json();
    },

    addTransaction: async (transaction) => {
        const res = await fetch(`${API_BASE}/transactions/`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ ...transaction, date: transaction.date || new Date().toISOString() })
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to save transaction');
        }
        return await res.json();
    },

    deleteTransaction: async (id) => {
        const res = await fetch(`${API_BASE}/transactions/${id}/`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!res.ok) throw new Error('Failed to delete transaction');
        if (res.status === 204) return true;
        return await res.json();
    },

    markInvoicePaid: async (invoiceId, amount, date = new Date().toISOString(), projectId = null) => {
        // Update Invoice
        await fetch(`${API_BASE}/invoices/${invoiceId}/`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify({ status: 'Paid' })
        });

        // Add Transaction
        await fetch(`${API_BASE}/transactions/`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
                type: 'income',
                amount: Number(amount),
                description: `Payment for Invoice #${invoiceId}`,
                category: 'Invoice Payment',
                date: date,
                invoiceId: Number(invoiceId),
                projectId: projectId ? Number(projectId) : null
            })
        });
    },

    getStats: async () => {
        const res = await fetch(`${API_BASE}/transactions/`, { headers: getHeaders() });
        const transactions = await res.json();

        const income = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + Number(curr.amount), 0);
        const expense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + Number(curr.amount), 0);

        return {
            income,
            expense,
            balance: income - expense
        };
    }
};
