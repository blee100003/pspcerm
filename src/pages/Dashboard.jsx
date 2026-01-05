import React from 'react';
import { FinanceService } from '../services/FinanceService';
import { EmployeeService } from '../services/EmployeeService';
import { InvoiceService } from '../services/InvoiceService';
import { Users, DollarSign, TrendingUp, TrendingDown, FileText } from 'lucide-react';
import '../styles/dashboard.css';

import { formatCurrency } from '../utils/format';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="stat-card">
        <div className="stat-icon" style={{ backgroundColor: `${color}20`, color: color }}>
            <Icon size={24} />
        </div>
        <div className="stat-details">
            <h3 className="stat-title">{title}</h3>
            <div className="stat-value">{value}</div>
            {trend && <div className={`stat-trend ${trend > 0 ? 'positive' : 'negative'}`}>
                {trend > 0 ? '+' : ''}{trend}%
            </div>}
        </div>
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = React.useState({
        employeeCount: 0,
        revenue: 0,
        expenses: 0,
        netIncome: 0,
        pendingInvoices: 0,
        recentTransactions: []
    });

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const [employees, transactions, invoices] = await Promise.all([
                    EmployeeService.getAll(),
                    FinanceService.getTransactions(),
                    InvoiceService.getAll()
                ]);

                // Calculate Revenue (Income)
                const revenue = transactions
                    .filter(t => t.type === 'income')
                    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

                // Calculate Expenses
                const expenses = transactions
                    .filter(t => t.type === 'expense')
                    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

                // Pending Invoices
                const pendingInvoices = invoices
                    .filter(i => i.status === 'Pending' || i.status === 'Sent')
                    .reduce((sum, i) => sum + Number(i.total || 0), 0);

                // Recent Activity
                const recent = transactions
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .slice(0, 5);

                setStats({
                    employeeCount: employees.length,
                    revenue,
                    expenses,
                    netIncome: revenue - expenses,
                    pendingInvoices,
                    recentTransactions: recent
                });
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            }
        };

        fetchData();
    }, []);



    return (
        <div className="dashboard-container">
            <div className="stats-grid">
                <StatCard
                    title="Total Revenue"
                    value={formatCurrency(stats.revenue)}
                    icon={DollarSign}
                    color="#10b981"
                />
                <StatCard
                    title="Expenses"
                    value={formatCurrency(stats.expenses)}
                    icon={TrendingDown}
                    color="#ef4444"
                />
                <StatCard
                    title="Net Income"
                    value={formatCurrency(stats.netIncome)}
                    icon={TrendingUp}
                    color="#6366f1"
                />
                <StatCard
                    title="Employees"
                    value={stats.employeeCount}
                    icon={Users}
                    color="#38bdf8"
                />
            </div>

            <div className="dashboard-sections">
                <div className="card recent-activity">
                    <div className="card-header">
                        <h3>Recent Activity</h3>
                    </div>
                    <div className="activity-list">
                        {stats.recentTransactions.length > 0 ? stats.recentTransactions.map(t => (
                            <div key={t.id} className="activity-item">
                                <div className={`activity-icon ${t.type}`}>
                                    {t.type === 'income' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                </div>
                                <div className="activity-info">
                                    <span className="activity-desc">{t.description}</span>
                                    <span className="activity-date">{new Date(t.date).toLocaleDateString()}</span>
                                </div>
                                <div className={`activity-amount ${t.type}`}>
                                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                                </div>
                            </div>
                        )) : <div className="empty-state">No recent activity</div>}
                    </div>
                </div>

                <div className="card quick-actions">
                    <div className="card-header">
                        <h3>Quick Overview</h3>
                    </div>
                    <div className="overview-content">
                        <div className="overview-item">
                            <span>Pending Invoices</span>
                            <span className="value">{formatCurrency(stats.pendingInvoices)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Dashboard;
