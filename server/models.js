const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

// Initialize Sequelize with SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'plansculpt.db'),
    logging: false
});

// Models

const Employee = sequelize.define('Employee', {
    name: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.STRING, allowNull: false },
    department: { type: DataTypes.STRING, allowNull: true, defaultValue: 'General' },
    type: { type: DataTypes.ENUM('fixed', 'freelance'), defaultValue: 'fixed' },
    salary: { type: DataTypes.DECIMAL(10, 2), allowNull: true }, // Monthly salary for fixed

    // New Fields
    email: { type: DataTypes.STRING, allowNull: true },
    phone: { type: DataTypes.STRING, allowNull: true },
    dob: { type: DataTypes.STRING, allowNull: true },
    gender: { type: DataTypes.STRING, allowNull: true },
    customId: { type: DataTypes.STRING, unique: true, allowNull: true }, // E-XXX-YYYY

    status: { type: DataTypes.STRING, defaultValue: 'active' }, // active, inactive, on_leave
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

const Project = sequelize.define('Project', {
    name: { type: DataTypes.STRING, allowNull: false },
    client: { type: DataTypes.STRING, allowNull: false },
    clientEmail: { type: DataTypes.STRING, allowNull: true },
    clientPhone: { type: DataTypes.STRING, allowNull: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    income: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 }, // Budget / Est. Income
    startDate: { type: DataTypes.STRING, allowNull: true },
    status: { type: DataTypes.STRING, defaultValue: 'In Progress' },
    customId: { type: DataTypes.STRING, unique: true, allowNull: true }, // P-XXXXX-YYYY
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

const Task = sequelize.define('Task', {
    title: { type: DataTypes.STRING, allowNull: false },
    projectId: { type: DataTypes.INTEGER, allowNull: false },
    assigneeId: { type: DataTypes.INTEGER, allowNull: true },
    cost: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    status: { type: DataTypes.STRING, defaultValue: 'Pending' },
    paymentStatus: { type: DataTypes.STRING, defaultValue: 'Pending' }, // Pending, Paid
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

const Invoice = sequelize.define('Invoice', {
    projectId: { type: DataTypes.INTEGER, allowNull: true },
    clientName: { type: DataTypes.STRING, allowNull: true }, // For ad-hoc or snapshot
    clientEmail: { type: DataTypes.STRING, allowNull: true },
    items: { type: DataTypes.TEXT, allowNull: false }, // Store JSON string of items
    total: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    status: { type: DataTypes.STRING, defaultValue: 'Draft' }, // Draft, Paid
    date: { type: DataTypes.STRING, defaultValue: DataTypes.NOW },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

const Transaction = sequelize.define('Transaction', {
    type: { type: DataTypes.ENUM('income', 'expense'), allowNull: false },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    category: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING, allowNull: false },
    date: { type: DataTypes.STRING, allowNull: false },
    projectId: { type: DataTypes.INTEGER, allowNull: true },
    employeeId: { type: DataTypes.INTEGER, allowNull: true },
    invoiceId: { type: DataTypes.INTEGER, allowNull: true }, // Link to invoice
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

const User = sequelize.define('User', {
    username: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.STRING, defaultValue: 'user' }, // 'admin' or 'user'
    fullName: { type: DataTypes.STRING, allowNull: true },
    email: { type: DataTypes.STRING, allowNull: true },
    phone: { type: DataTypes.STRING, allowNull: true },
    dob: { type: DataTypes.DATEONLY, allowNull: true },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

const ActivityLog = sequelize.define('ActivityLog', {
    userId: { type: DataTypes.INTEGER, allowNull: false },
    action: { type: DataTypes.STRING, allowNull: false }, // e.g., 'LOGIN', 'CREATE_USER', 'DELETE_USER'
    details: { type: DataTypes.STRING, allowNull: true },
    ip: { type: DataTypes.STRING, allowNull: true },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

// Relationships
Project.hasMany(Task, { foreignKey: 'projectId' });
Task.belongsTo(Project, { foreignKey: 'projectId' });

Employee.hasMany(Task, { foreignKey: 'assigneeId' });
Task.belongsTo(Employee, { foreignKey: 'assigneeId' });

Project.hasMany(Transaction, { foreignKey: 'projectId' });
Transaction.belongsTo(Project, { foreignKey: 'projectId' });

Employee.hasMany(Transaction, { foreignKey: 'employeeId' });
Transaction.belongsTo(Employee, { foreignKey: 'employeeId' });

Project.hasMany(Invoice, { foreignKey: 'projectId' });
Invoice.belongsTo(Project, { foreignKey: 'projectId' });

Invoice.hasOne(Transaction, { foreignKey: 'invoiceId' });
Transaction.belongsTo(Invoice, { foreignKey: 'invoiceId' });

User.hasMany(ActivityLog, { foreignKey: 'userId', onDelete: 'CASCADE' });
ActivityLog.belongsTo(User, { foreignKey: 'userId' });

const initDB = async () => {
    try {
        await sequelize.sync({ alter: true }); // Automatically update schema
        console.log('Database synced successfully.');
    } catch (error) {
        console.error('Unable to sync database:', error);
    }
};

module.exports = { sequelize, Employee, Project, Task, Transaction, Invoice, User, ActivityLog, initDB };
