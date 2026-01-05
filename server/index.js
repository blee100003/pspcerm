const express = require('express');
console.log("!!! SERVER STARTING WITH FIXES: CLIENT FIELD + SEQUENTIAL IDS !!!");
const cors = require('cors');
const fs = require('fs');
const { initDB, sequelize, Employee, Project, Task, Transaction, Invoice, User, ActivityLog } = require('./models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticateToken, SECRET_KEY } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001; // Use env port for production, 3001 for local

app.use(cors()); // Allow all origins for now (simpler for your Netlify setup)
app.use(express.json());

// Initialize DB
initDB();

// --- Helpers ---
const logActivity = async (userId, action, details, req) => {
    try {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
        console.log(`Logging activity: ${action} for User ${userId}`);
        await ActivityLog.create({ userId, action, details, ip });
    } catch (e) {
        console.error('Failed to log activity:', e);
    }
};

// --- Auth Routes ---

app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, password, role, fullName, email, phone, dob } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ username, password: hashedPassword, role, fullName, email, phone, dob });
        res.json({ success: true, user: { id: user.id, username: user.username, role: user.role } });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ where: { username } });
        if (!user) return res.status(400).json({ error: 'User not found' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ error: 'Invalid password' });

        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, SECRET_KEY, { expiresIn: '24h' });

        // Log Login
        await logActivity(user.id, 'LOGIN', 'User logged in', req);

        res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- API Routes ---

// Users (Admin Only)
app.get('/api/users', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }
        const users = await User.findAll({
            attributes: ['id', 'username', 'role', 'createdAt'],
            order: [['createdAt', 'DESC']]
        });
        res.json(users);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/users', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
        const { username, password, role, fullName, email, phone, dob } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ username, password: hashedPassword, role, fullName, email, phone, dob });

        await logActivity(req.user.id, 'CREATE_USER', `Created user: ${username}`, req);

        res.json({ success: true, user: { id: user.id, username: user.username, role: user.role } });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/users/:id', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        await user.destroy();
        await logActivity(req.user.id, 'DELETE_USER', `Deleted user: ${user.username}`, req);

        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/users/:id/password', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
        const { password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        await User.update({ password: hashedPassword }, { where: { id: req.params.id } });
        await logActivity(req.user.id, 'CHANGE_PASSWORD', `Changed password for user ID: ${req.params.id}`, req);

        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/users/:id/role', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
        const { role } = req.body; // 'admin' or 'user'

        await User.update({ role }, { where: { id: req.params.id } });
        await logActivity(req.user.id, 'CHANGE_ROLE', `Changed role for user ID: ${req.params.id} to ${role}`, req);

        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/users/:id/activity', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
        const logs = await ActivityLog.findAll({
            where: { userId: req.params.id },
            order: [['createdAt', 'DESC']]
        });
        res.json(logs);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Employees
app.get('/api/employees', authenticateToken, async (req, res) => {
    try {
        const { status } = req.query;
        const where = status ? { status } : {};
        const employees = await Employee.findAll({ where, order: [['createdAt', 'DESC']] });
        res.json(employees);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/employees', authenticateToken, async (req, res) => {
    try {
        fs.writeFileSync('debug_employee_post.txt', JSON.stringify(req.body, null, 2));
        console.log('POST /api/employees body:', req.body);
        let { name, role, email, phone, dob, gender, department, type, salary, status } = req.body;
        if (!department) department = 'General';
        // Generate Emp ID E-XXX-YYYY (Sequential)
        const year = new Date().getFullYear();
        const allEmps = await Employee.findAll({ attributes: ['customId'] });

        let maxSeq = 0;
        const prefix = `E-`;
        const suffix = `-${year}`;

        allEmps.forEach(e => {
            if (e.customId && e.customId.startsWith(prefix) && e.customId.endsWith(suffix)) {
                const parts = e.customId.split('-');
                if (parts.length === 3) {
                    const seq = parseInt(parts[1], 10);
                    if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
                }
            }
        });

        const nextSeq = String(maxSeq + 1).padStart(3, '0');
        const customId = `E-${nextSeq}-${year}`;
        console.log('GENERATED NEW CUSTOM ID:', customId);
        const employee = await Employee.create({
            customId, name, role, email, phone, dob, gender, department, type, salary, status
        });

        await logActivity(req.user.id, 'CREATE_EMPLOYEE', `Created employee ${name} (${customId})`, req);

        res.json(employee);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/employees/:id', authenticateToken, async (req, res) => {
    try {
        await Employee.update(req.body, { where: { id: req.params.id } });
        await logActivity(req.user.id, 'UPDATE_EMPLOYEE', `Updated employee ID: ${req.params.id}`, req);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/employees/:id', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: 'Only Admins can delete entries.' });

        const id = req.params.id;
        // Manual Cascade Delete
        await Task.destroy({ where: { assigneeId: id } });
        await Transaction.destroy({ where: { employeeId: id } });

        await Employee.destroy({ where: { id } });
        await logActivity(req.user.id, 'DELETE_EMPLOYEE', `Deleted employee ID: ${id}`, req);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Projects
app.get('/api/projects', authenticateToken, async (req, res) => {
    try {
        const projects = await Project.findAll({ order: [['createdAt', 'DESC']] });
        res.json(projects);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/projects/:id', authenticateToken, async (req, res) => {
    try {
        const project = await Project.findByPk(req.params.id);
        res.json(project);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/projects', authenticateToken, async (req, res) => {
    try {
        const { name, client, status, budget, dueDate, clientEmail, clientPhone } = req.body;
        // Generate Project ID P-XXXXX-YYYY
        const now = new Date();
        const year = now.getFullYear();
        const randomPart = Math.floor(10000 + Math.random() * 90000); // 5 digit random
        const customId = `P-${randomPart}-${year}`;

        const project = await Project.create({
            customId,
            name,
            client,
            status,
            budget,
            dueDate,
            clientEmail,
            clientPhone
        });

        await logActivity(req.user.id, 'CREATE_PROJECT', `Created project ${name} (${customId})`, req);

        res.json(project);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/projects/:id', authenticateToken, async (req, res) => {
    try {
        await Project.update(req.body, { where: { id: req.params.id } });
        await logActivity(req.user.id, 'UPDATE_PROJECT', `Updated project ID: ${req.params.id}`, req);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/projects/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        // Manual Cascade Delete
        await Transaction.destroy({ where: { projectId: id } });
        await Invoice.destroy({ where: { projectId: id } });
        await Task.destroy({ where: { projectId: id } });

        const deleted = await Project.destroy({ where: { id } });
        if (!deleted) return res.status(404).json({ error: 'Project not found' });

        await logActivity(req.user.id, 'DELETE_PROJECT', `Deleted project ID: ${req.params.id}`, req);

        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Tasks
app.get('/api/tasks', authenticateToken, async (req, res) => {
    try {
        const { projectId, assigneeId } = req.query;
        const where = {};
        if (projectId) where.projectId = projectId;
        if (assigneeId) where.assigneeId = assigneeId;

        const tasks = await Task.findAll({ where, order: [['createdAt', 'DESC']] });
        res.json(tasks);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/tasks', authenticateToken, async (req, res) => {
    try {
        const task = await Task.create(req.body);
        await logActivity(req.user.id, 'CREATE_TASK', `Created task ${task.id} for Project ${task.projectId || 'N/A'}`, req);
        res.json(task);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/tasks/:id', authenticateToken, async (req, res) => {
    try {
        await Task.update(req.body, { where: { id: req.params.id } });
        await logActivity(req.user.id, 'UPDATE_TASK', `Updated task ID: ${req.params.id}`, req);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/tasks/:id', authenticateToken, async (req, res) => {
    try {
        await Task.destroy({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Invoices
app.get('/api/invoices', authenticateToken, async (req, res) => {
    try {
        const invoices = await Invoice.findAll({ order: [['date', 'DESC']] });
        // Parse items JSON
        const parsed = invoices.map(i => ({ ...i.dataValues, items: JSON.parse(i.items || '[]') }));
        res.json(parsed);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/invoices', authenticateToken, async (req, res) => {
    try {
        const data = { ...req.body, items: JSON.stringify(req.body.items || []) };
        const invoice = await Invoice.create(data);
        res.json(invoice);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/invoices/:id', authenticateToken, async (req, res) => {
    try {
        const data = { ...req.body };
        if (data.items) data.items = JSON.stringify(data.items);
        await Invoice.update(data, { where: { id: req.params.id } });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/invoices/:id', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: 'Only Admins can delete entries.' });
        const invoice = await Invoice.findByPk(req.params.id);
        if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

        // Manual Cascade
        await Transaction.destroy({ where: { invoiceId: invoice.id } });

        await invoice.destroy();
        await logActivity(req.user.id, 'DELETE_INVOICE', `Deleted invoice #${req.params.id}`, req);

        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Transactions
app.get('/api/transactions', authenticateToken, async (req, res) => {
    try {
        const { projectId, employeeId, type, startDate, endDate } = req.query;
        const where = {};
        if (projectId) where.projectId = projectId;
        if (employeeId) where.employeeId = employeeId;
        if (type) where.type = type;
        if (startDate && endDate) {
            where.date = { [Op.between]: [startDate, endDate] };
        } else if (startDate) {
            where.date = { [Op.gte]: startDate };
        }

        const transactions = await Transaction.findAll({ where, order: [['date', 'DESC']] });
        res.json(transactions);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/transactions', authenticateToken, async (req, res) => {
    try {
        // Handle bulk creation
        if (Array.isArray(req.body)) {
            const transactions = await Transaction.bulkCreate(req.body);
            res.json(transactions);
        } else {
            const transaction = await Transaction.create(req.body);
            res.json(transaction);
        }
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/transactions/:id', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
        await Transaction.destroy({ where: { id: req.params.id } });
        await logActivity(req.user.id, 'DELETE_TRANSACTION', `Deleted transaction ID: ${req.params.id}`, req);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Special: Pay Task
app.post('/api/tasks/:id/pay', authenticateToken, async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const taskId = req.params.id;
        const task = await Task.findByPk(taskId);
        if (!task || !task.cost) throw new Error('Invalid task');

        // Update task
        await Task.update({ paymentStatus: 'Paid' }, { where: { id: taskId }, transaction: t });

        // Create transaction
        await Transaction.create({
            projectId: task.projectId,
            employeeId: task.assigneeId,
            type: 'expense',
            amount: task.cost,
            category: 'Labor',
            description: `Task Payment: ${task.title}`,
            date: new Date().toISOString()
        }, { transaction: t });

        await t.commit();
        res.json({ success: true });
    } catch (e) {
        await t.rollback();
        res.status(500).json({ error: e.message });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT} (VERSION 2 - FIXED)`);
});
