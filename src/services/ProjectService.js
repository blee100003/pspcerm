
import { db } from '../db/db';


import API_BASE_URL from '../config';

const API_BASE = API_BASE_URL;

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const ProjectService = {
    getAll: async () => {
        const res = await fetch(`${API_BASE}/projects/`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch projects');
        const data = await res.json();
        return Array.isArray(data) ? data : [];
    },

    getById: async (id) => {
        const res = await fetch(`${API_BASE}/projects/${id}/`, { headers: getHeaders() });
        return await res.json();
    },

    add: async (project) => {
        const res = await fetch(`${API_BASE}/projects/`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ ...project, status: project.status || 'In Progress' })
        });
        if (!res.ok) {
            const text = await res.text();
            let errorMsg = 'Failed to create project';
            try {
                const err = JSON.parse(text);
                errorMsg = err.detail || JSON.stringify(err) || errorMsg;
            } catch (e) {
                errorMsg = `Server Error (${res.status}): ${text.substring(0, 200)}`;
            }
            throw new Error(errorMsg);
        }
        return await res.json();
    },

    update: async (id, updates) => {
        const res = await fetch(`${API_BASE}/projects/${id}/`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(updates)
        });
        if (!res.ok) {
            const text = await res.text();
            let errorMsg = 'Failed to update project';
            try {
                const err = JSON.parse(text);
                errorMsg = err.detail || JSON.stringify(err) || errorMsg;
            } catch (e) {
                errorMsg = `Server Error (${res.status}): ${text.substring(0, 200)}`;
            }
            throw new Error(errorMsg);
        }
    },

    delete: async (id) => {
        const res = await fetch(`${API_BASE}/projects/${id}/`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!res.ok) throw new Error('Failed to delete project');
    },

    getDetails: async (projectId) => {
        // Fetch all transactions for this project
        const resTrans = await fetch(`${API_BASE}/transactions/?projectId=${projectId}`, { headers: getHeaders() });
        const transactions = await resTrans.json();

        const resTasks = await fetch(`${API_BASE}/tasks/?projectId=${projectId}`, { headers: getHeaders() });
        const tasks = await resTasks.json();

        const income = Array.isArray(transactions) ? transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + Number(t.amount || 0), 0) : 0;

        const expenses = Array.isArray(transactions) ? transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Number(t.amount || 0), 0) : 0;

        const totalTasks = Array.isArray(tasks) ? tasks.length : 0;
        const completedTasks = Array.isArray(tasks) ? tasks.filter(t => t.status === 'Completed').length : 0;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        return {
            income,
            expenses,
            profit: income - expenses,
            progress,
            taskCount: totalTasks,
            completedTaskCount: completedTasks
        };
    },

    getTasks: async (projectId) => {
        const res = await fetch(`${API_BASE}/tasks/?projectId=${projectId}`, {
            headers: getHeaders(),
            cache: 'no-store'
        });
        return await res.json();
    },

    addTask: async (task) => {
        const res = await fetch(`${API_BASE}/tasks/`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(task)
        });
        return await res.json();
    },

    updateTask: async (id, updates) => {
        await fetch(`${API_BASE}/tasks/${id}/`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify(updates)
        });
    },

    deleteTask: async (id) => {
        await fetch(`${API_BASE}/tasks/${id}/`, { method: 'DELETE', headers: getHeaders() });
    },

    payTask: async (taskId) => {
        const res = await fetch(`${API_BASE}/tasks/${taskId}/pay/`, {
            method: 'POST',
            headers: getHeaders() // Post usually needs headers even if empty body? actually headers for auth
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Payment failed');
        }
    }
};
