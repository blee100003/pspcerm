
import Dexie from 'dexie';

export const db = new Dexie('PlansculptDB');

db.version(1).stores({
    projects: '++id, name, status, client, createdAt',
    invoices: '++id, projectId, status, date, createdAt',
    transactions: '++id, projectId, invoiceId, employeeId, type, date',
    employees: '++id, name, role, type, salary, createdAt', // type: 'fixed' | 'freelance'
    tasks: '++id, projectId, assigneeId, status, title, cost, paymentStatus' // paymentStatus: 'Pending', 'Paid'
});

// Helper to reset DB (for development/testing)
export const resetDatabase = async () => {
    await db.delete();
    await db.open();
};
