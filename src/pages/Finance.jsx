import React, { useState, useRef } from 'react';
import { FinanceService } from '../services/FinanceService';
import { ProjectService } from '../services/ProjectService';
import { EmployeeService } from '../services/EmployeeService';
import { Plus, TrendingUp, TrendingDown, FileText, Printer, X, Calendar, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styles/hr.css';
import { formatCurrency, numberToWords } from '../utils/format';
import logo from '../assets/PSPC_Logo.jpg';

const printTransaction = (transaction) => {
    const isIncome = transaction.type === 'income';
    const proj = transaction.project_details;
    const emp = transaction.employee_details;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Transaction Receipt #${transaction.customId || 'N/A'}</title>
            <style>
                body { font-family: 'Inter', sans-serif; padding: 40px; color: #1f2937; line-height: 1.5; }
                .header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
                .company-info { display: flex; align-items: center; gap: 15px; }
                .logo { height: 50px; }
                .company-name { font-size: 24px; font-weight: bold; color: #000; text-transform: uppercase; }
                .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
                .box { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; }
                .label { font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
                .value { font-size: 16px; font-weight: 600; color: #111; }
                .amount-box { text-align: right; padding: 20px; background: ${isIncome ? '#f0fdf4' : '#fef2f2'}; border-radius: 8px; margin-bottom: 30px; }
                .amount-val { font-size: 32px; font-weight: bold; color: ${isIncome ? '#166534' : '#991b1b'}; }
                .footer { margin-top: 60px; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 20px; color: #6b7280; font-size: 12px; }
                .body-title { font-size: 24px; font-weight: 800; text-align: center; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 0.05em; color: #111; }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="company-info">
                    <img src="${logo}" class="logo" />
                    <div>
                        <div class="company-name">Plansculpt</div>
                        <div style="font-size: 14px;">Private Consultants</div>
                    </div>
                </div>
                <div>
                    <div style="text-align: right; font-size: 14px; margin-top: 5px;">#${transaction.customId || 'N/A'}</div>
                    <div style="text-align: right; font-size: 14px; color: #555;">${new Date(transaction.date).toLocaleDateString()}</div>
                </div>
            </div>

            <div class="body-title">Payment Receipt</div>

            <div class="amount-box">
                <div class="label" style="text-align: right;">Total Amount</div>
                <div class="amount-val">${isIncome ? '+' : '-'}${formatCurrency(transaction.amount)}</div>
                <div style="font-size: 14px; font-style: italic; margin-top: 5px; color: #555;">
                    ${numberToWords ? numberToWords(transaction.amount) : ''} Only
                </div>
            </div>

            <div class="meta-grid">
                <div class="box">
                    <div style="border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 10px; font-weight: bold; color: #000;">
                        ${isIncome ? 'RECEIVED FROM' : 'PAID TO'}
                    </div>
                    ${isIncome && proj ? `
                        <div class="value" style="font-size: 18px;">${proj.client}</div>
                        <div style="color: #4b5563; margin-top: 5px;">Project: ${proj.name}</div>
                        ${proj.clientPhone ? `<div>${proj.clientPhone}</div>` : ''}
                    ` : !isIncome && emp ? `
                        <div class="value" style="font-size: 18px;">${emp.name}</div>
                        <div style="color: #4b5563; margin-top: 5px;">${emp.role}</div>
                        ${emp.phone ? `<div>${emp.phone}</div>` : ''}
                    ` : !isIncome && proj ? `
                         <div class="value" style="font-size: 18px;">${proj.name}</div>
                         <div style="color: #4b5563; margin-top: 5px;">Client: ${proj.client}</div>
                         <div style="font-style: italic; font-size: 12px; margin-top: 5px;">Project Expense</div>
                    ` : `
                        <div style="color: #9ca3af; font-style: italic;">No specific contact linked</div>
                    `}
                </div>

                <div class="box">
                    <div style="border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 10px; font-weight: bold; color: #000;">
                        DETAILS
                    </div>
                    <div style="margin-bottom: 15px;">
                        <div class="label">Category</div>
                        <div class="value">${transaction.category}</div>
                    </div>
                    <div>
                        <div class="label">Description</div>
                        <div style="line-height: 1.6;">${transaction.description}</div>
                    </div>
                </div>
            </div>

             <div class="footer">
                <div>Authorized Signature</div>
                <div style="margin-top: 40px; border-top: 1px solid #000; width: 200px; margin-left: auto; margin-right: auto;"></div>
                <div style="margin-top: 10px;">Generated from Plansculpt System</div>
            </div>

            <script>window.print();</script>
        </body>
        </html>
    `);
    printWindow.document.close();
};

const DetailsModal = ({ transaction, onClose }) => {
    if (!transaction) return null;

    const isIncome = transaction.type === 'income';
    const proj = transaction.project_details;
    const emp = transaction.employee_details;

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '800px', fontFamily: "'Inter', sans-serif", color: '#1f2937' }}>
                <div className="modal-header" style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '1.5rem', marginBottom: '0' }}>
                    <div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111', margin: 0, letterSpacing: '-0.02em' }}>Transaction Details</h3>
                        <div style={{ color: '#6b7280', fontSize: '0.95rem', marginTop: '6px', fontFamily: 'monospace' }}>#{transaction.customId || 'N/A'}</div>
                    </div>
                    <button className="btn-icon" onClick={onClose} style={{ padding: '8px' }}><X size={24} /></button>
                </div>

                <div className="modal-body" style={{ padding: '2rem' }}>
                    {/* Top Row: Amount & Status */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', background: '#f8fafc', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <div>
                            <div style={{ fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '600', marginBottom: '8px' }}>Total Amount</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: isIncome ? '#059669' : '#dc2626', lineHeight: 1 }}>
                                {formatCurrency(transaction.amount)}
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: '8px',
                                padding: '8px 16px', borderRadius: '100px',
                                background: isIncome ? '#dcfce7' : '#fee2e2',
                                color: isIncome ? '#166534' : '#991b1b',
                                fontWeight: '700', fontSize: '1rem'
                            }}>
                                {isIncome ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                                {transaction.type.toUpperCase()}
                            </div>
                            <div style={{ marginTop: '10px', color: '#475569', fontSize: '1rem', fontWeight: '500' }}>
                                {new Date(transaction.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                        {/* Left Column: Context (Client/Employee) */}
                        <div>
                            <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {isIncome ? 'Received From' : 'Paid To'}
                            </h4>

                            {isIncome && proj ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '4px' }}>Client Name</div>
                                        <div style={{ fontWeight: '700', fontSize: '1.25rem', color: '#1e293b' }}>{proj.client || 'N/A'}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '4px' }}>Project</div>
                                        <div style={{ color: '#2563eb', fontWeight: '600', fontSize: '1.1rem' }}>{proj.name}</div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                                        {proj.clientEmail && (
                                            <div>
                                                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Email</div>
                                                <div style={{ fontWeight: '500' }}>{proj.clientEmail}</div>
                                            </div>
                                        )}
                                        {proj.clientPhone && (
                                            <div>
                                                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Phone</div>
                                                <div style={{ fontWeight: '500' }}>{proj.clientPhone}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : !isIncome && emp ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '4px' }}>Employee</div>
                                        <div style={{ fontWeight: '700', fontSize: '1.25rem', color: '#1e293b' }}>{emp.name}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '4px' }}>Role</div>
                                        <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>{emp.role}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '4px' }}>Contact</div>
                                        <div style={{ fontWeight: '500' }}>{emp.phone || emp.email || '-'}</div>
                                    </div>
                                </div>
                            ) : !isIncome && proj ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '4px' }}>Project Expense</div>
                                        <div style={{ fontWeight: '700', fontSize: '1.25rem', color: '#1e293b' }}>{proj.name}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '4px' }}>Client</div>
                                        <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>{proj.client}</div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                                        {proj.clientEmail && (
                                            <div>
                                                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Email</div>
                                                <div style={{ fontWeight: '500' }}>{proj.clientEmail}</div>
                                            </div>
                                        )}
                                        {proj.clientPhone && (
                                            <div>
                                                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Phone</div>
                                                <div style={{ fontWeight: '500' }}>{proj.clientPhone}</div>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '4px' }}>Note</div>
                                        <div style={{ fontStyle: 'italic', fontSize: '0.95rem' }}>Direct project cost (Materials/Services)</div>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ fontStyle: 'italic', color: '#94a3b8', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                                    No specific {isIncome ? 'client' : 'recipient'} linked.
                                    <br /><span style={{ fontSize: '0.85rem' }}>Category: {transaction.category}</span>
                                </div>
                            )}
                        </div>

                        {/* Right Column: Transaction Info */}
                        <div>
                            <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Payment Details
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '4px' }}>Description</div>
                                    <div style={{ background: '#f1f5f9', padding: '16px', borderRadius: '8px', fontSize: '1rem', lineHeight: '1.5', border: '1px solid #e2e8f0' }}>
                                        {transaction.description}
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '4px' }}>Category</div>
                                        <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>{transaction.category}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '4px' }}>Recorded</div>
                                        <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>{new Date(transaction.createdAt).toLocaleDateString()}</div>
                                    </div>
                                </div>
                                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px', marginTop: '10px' }}>
                                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '4px' }}>Related Link</div>
                                    <div style={{ fontWeight: '600', color: proj ? '#2563eb' : (emp ? '#4b5563' : 'inherit') }}>
                                        {proj ? `Project: ${proj.name}` : (emp ? `Employee: ${emp.name}` : 'No Links')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-footer" style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem', marginTop: '1rem' }}>
                    <button className="btn-secondary" onClick={onClose} style={{ padding: '10px 20px' }}>Close</button>
                    <button className="btn-primary" onClick={() => printTransaction(transaction)} style={{ padding: '10px 24px' }}>
                        <Printer size={18} style={{ marginRight: '8px' }} /> Print Receipt
                    </button>
                </div>
            </div>
        </div>
    );
};

const TransactionModal = ({ onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        type: 'expense',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        projectId: '',
        employeeId: ''
    });

    const [projects, setProjects] = useState([]);
    const [employees, setEmployees] = useState([]);

    React.useEffect(() => {
        const loadData = async () => {
            try {
                const [pData, eData] = await Promise.all([
                    ProjectService.getAll(),
                    EmployeeService.getAll()
                ]);
                setProjects(pData);
                setEmployees(eData);
            } catch (error) {
                console.error("Failed to load select data", error);
            }
        };
        loadData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = {
            ...formData,
            category: 'General',
            projectId: formData.projectId ? Number(formData.projectId) : null,
            employeeId: formData.employeeId ? Number(formData.employeeId) : null
        };
        onSubmit(data);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Add Transaction</h3>
                    <button className="btn-icon" onClick={onCancel}><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label>Type</label>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        name="type"
                                        value="income"
                                        checked={formData.type === 'income'}
                                        onChange={handleChange}
                                    />
                                    Income
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        name="type"
                                        value="expense"
                                        checked={formData.type === 'expense'}
                                        onChange={handleChange}
                                    />
                                    Expense
                                </label>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Amount</label>
                            <input
                                type="number"
                                name="amount"
                                className="form-input"
                                value={formData.amount}
                                onChange={handleChange}
                                required
                                min="0"
                                step="0.01"
                            />
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <input
                                type="text"
                                name="description"
                                className="form-input"
                                value={formData.description}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Date</label>
                            <input
                                type="date"
                                name="date"
                                className="form-input"
                                value={formData.date}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Dynamic Linking Fields */}
                        {formData.type === 'income' && (
                            <div className="form-group">
                                <label>Link Project (Optional)</label>
                                <select
                                    name="projectId"
                                    className="form-select"
                                    value={formData.projectId}
                                    onChange={handleChange}
                                >
                                    <option value="">-- None --</option>
                                    {projects?.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} ({p.client})</option>
                                    ))}
                                </select>
                                <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>
                                    Links this income to the project budget.
                                </div>
                            </div>
                        )}

                        {formData.type === 'expense' && (
                            <>
                                <div className="form-group">
                                    <label>Link Employee (Optional)</label>
                                    <select
                                        name="employeeId"
                                        className="form-select"
                                        value={formData.employeeId}
                                        onChange={handleChange}
                                    >
                                        <option value="">-- None --</option>
                                        {employees?.map(e => (
                                            <option key={e.id} value={e.id}>{e.name} ({e.role})</option>
                                        ))}
                                    </select>
                                    <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>
                                        Use this for salary or reimbursement payments.
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Link Project (Optional)</label>
                                    <select
                                        name="projectId"
                                        className="form-select"
                                        value={formData.projectId}
                                        onChange={handleChange}
                                    >
                                        <option value="">-- None --</option>
                                        {projects?.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                    <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>
                                        If this expense is for a specific project.
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
                        <button type="submit" className="btn-primary">Save Transaction</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const StatementModal = ({ transactions, onClose }) => {
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });
    const [showStatement, setShowStatement] = useState(false);
    const printRef = useRef();

    const getDhakaDate = () => {
        return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" }));
    };

    const handlePresetChange = (e) => {
        const preset = e.target.value;
        const now = getDhakaDate();
        let start = new Date(now);
        let end = new Date(now);

        switch (preset) {
            case 'last-month':
                // First day of previous month
                start.setMonth(now.getMonth() - 1);
                start.setDate(1);
                // Last day of previous month
                end.setDate(0);
                break;
            case 'last-financial-year':
                // BD FY: July 1 to June 30
                // If current month is before July (0-6), we are in FY X-(X+1). Last FY was (X-1)-X.
                // If current month is July+ (6-11), we are in FY X-(X+1). Last FY was (X-1)-X.
                // Actually:
                // If Jan 2026. Current FY 25-26. Last FY 24-25 (July 1, 2024 - June 30, 2025).
                // If Aug 2025. Current FY 25-26. Last FY 24-25 (July 1, 2024 - June 30, 2025).

                if (now.getMonth() < 6) { // Jan-Jun
                    start = new Date(now.getFullYear() - 2, 6, 1); // July 1st, 2 years ago
                    end = new Date(now.getFullYear() - 1, 5, 30); // June 30th, last year
                } else { // July-Dec
                    start = new Date(now.getFullYear() - 1, 6, 1); // July 1st, last year
                    end = new Date(now.getFullYear(), 5, 30); // June 30th, this year
                }
                break;
            case 'last-1-year':
                start.setFullYear(now.getFullYear() - 1);
                break;
            case 'last-6-months':
                start.setMonth(now.getMonth() - 6);
                break;
            case 'all-time':
                start = new Date('2020-01-01'); // Project Start
                break;
            case 'custom':
                return; // Do nothing, let user pick
            default:
                break;
        }

        // Format YYYY-MM-DD (Manual to avoid timezone shifts back to UTC)
        const format = (d) => {
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        setDateRange({ startDate: format(start), endDate: format(end) });
    };

    const handleGenerate = () => {
        setShowStatement(true);
    };

    const handlePrint = () => {
        const content = printRef.current.innerHTML;
        const originalContent = document.body.innerHTML;
        document.body.innerHTML = content;
        window.print();
        document.body.innerHTML = originalContent;
        window.location.reload();
    };

    // Filter and Calculate
    const filteredTxns = transactions.filter(t => {
        const txnDate = t.date.split('T')[0];
        return txnDate >= dateRange.startDate && txnDate <= dateRange.endDate;
    }).sort((a, b) => new Date(a.date) - new Date(b.date));

    // Calculate Balance
    const openingBalance = transactions
        .filter(t => t.date < dateRange.startDate)
        .reduce((acc, t) => acc + (t.type === 'income' ? Number(t.amount) : -Number(t.amount)), 0);

    let runningBalance = openingBalance;
    const statementData = filteredTxns.map(t => {
        const amount = Number(t.amount);
        const credit = t.type === 'income' ? amount : 0;
        const debit = t.type === 'expense' ? amount : 0;
        runningBalance += (credit - debit);
        return { ...t, credit, debit, balance: runningBalance };
    });

    const totalCredits = statementData.reduce((sum, t) => sum + t.credit, 0);
    const totalDebits = statementData.reduce((sum, t) => sum + t.debit, 0);

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: showStatement ? '900px' : '500px', width: '95%' }}>
                <div className="modal-header">
                    <h3>Financial Statement</h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {showStatement && (
                            <button className="btn-secondary" onClick={() => setShowStatement(false)}>
                                Back
                            </button>
                        )}
                        <button className="btn-icon" onClick={onClose}><X size={20} /></button>
                    </div>
                </div>

                {!showStatement ? (
                    <div className="modal-body">
                        <div className="form-group">
                            <label>Quick Select Range</label>
                            <select className="form-select" onChange={handlePresetChange} defaultValue="custom">
                                <option value="custom">Custom Date</option>
                                <option value="last-month">Last Month</option>
                                <option value="last-6-months">Last 6 Months</option>
                                <option value="last-1-year">Last 1 Year</option>
                                <option value="last-financial-year">Last Financial Year (July-June)</option>
                                <option value="all-time">All Time</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>From Date</label>
                            <input
                                type="date"
                                className="form-input"
                                value={dateRange.startDate}
                                onChange={e => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                            />
                        </div>
                        <div className="form-group">
                            <label>To Date</label>
                            <input
                                type="date"
                                className="form-input"
                                value={dateRange.endDate}
                                onChange={e => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                            />
                        </div>
                        <button className="btn-primary" style={{ width: '100%', marginTop: '1rem' }} onClick={handleGenerate}>
                            Generate Statement
                        </button>
                    </div>
                ) : (
                    <div className="modal-body">
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                            <button className="btn-primary" onClick={handlePrint}>
                                <Printer size={16} style={{ marginRight: '8px' }} /> Print Statement
                            </button>
                        </div>

                        <div ref={printRef} style={{ padding: '30px', background: 'white', minHeight: '500px', color: '#000' }}>
                            {/* Print Header */}
                            <div style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '2px solid #000', paddingBottom: '20px' }}>
                                <h1 style={{ margin: 0, fontSize: '24px', textTransform: 'uppercase', color: '#000' }}>Financial Statement</h1>
                                <div style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '5px', color: '#000' }}>Plansculpt Private Consultant</div>
                                <div style={{ color: '#000', marginTop: '5px', fontWeight: 500 }}>
                                    Period: {new Date(dateRange.startDate).toLocaleDateString()} to {new Date(dateRange.endDate).toLocaleDateString()}
                                </div>
                            </div>

                            {/* Summary Box */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', background: '#f0f0f0', padding: '20px', border: '1px solid #ccc' }}>
                                <div>
                                    <div style={{ fontSize: '0.9rem', color: '#000', fontWeight: 600 }}>Opening Balance</div>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#000' }}>{formatCurrency(openingBalance)}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.9rem', color: '#000', fontWeight: 600 }}>Total Income</div>
                                    <div style={{ fontWeight: 'bold', color: '#166534', fontSize: '1.1rem' }}>+{formatCurrency(totalCredits)}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.9rem', color: '#000', fontWeight: 600 }}>Total Expense</div>
                                    <div style={{ fontWeight: 'bold', color: '#991b1b', fontSize: '1.1rem' }}>-{formatCurrency(totalDebits)}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.9rem', color: '#000', fontWeight: 600 }}>Closing Balance</div>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#000' }}>{formatCurrency(runningBalance)}</div>
                                </div>
                            </div>

                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem', color: '#000' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #000', textAlign: 'left' }}>
                                        <th style={{ padding: '12px', color: '#000' }}>Date</th>
                                        <th style={{ padding: '12px', color: '#000' }}>Description</th>
                                        <th style={{ padding: '12px', textAlign: 'right', color: '#000' }}>Debit</th>
                                        <th style={{ padding: '12px', textAlign: 'right', color: '#000' }}>Credit</th>
                                        <th style={{ padding: '12px', textAlign: 'right', color: '#000' }}>Balance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {statementData.length > 0 ? statementData.map((t, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #ccc' }}>
                                            <td style={{ padding: '12px', color: '#000' }}>{new Date(t.date).toLocaleDateString()}</td>
                                            <td style={{ padding: '12px', color: '#000' }}>{t.description}</td>
                                            <td style={{ padding: '12px', textAlign: 'right', color: t.debit > 0 ? '#b91c1c' : '#000' }}>
                                                {t.debit > 0 ? formatCurrency(t.debit) : '-'}
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'right', color: t.credit > 0 ? '#15803d' : '#000' }}>
                                                {t.credit > 0 ? formatCurrency(t.credit) : '-'}
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#000' }}>
                                                {formatCurrency(t.balance)}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#555' }}>No transactions in this period.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            <div style={{ marginTop: '50px', textAlign: 'center', fontSize: '0.8rem', color: '#000' }}>
                                Generated on {new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" })} (Dhaka Standard Time)
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};



const Finance = () => {
    const { user } = useAuth();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isStatementOpen, setIsStatementOpen] = useState(false);
    const [activeTransaction, setActiveTransaction] = useState(null); // For details view
    const [filter, setFilter] = useState('all');
    const [transactions, setTransactions] = useState([]);

    React.useEffect(() => {
        const loadFinanceData = async () => {
            try {
                const data = await FinanceService.getTransactions();
                setTransactions(data);
            } catch (error) {
                console.error("Failed to load finance data", error);
            }
        };
        loadFinanceData();
    }, []);

    const handleCreate = async (data) => {
        try {
            const newTransaction = await FinanceService.addTransaction(data);
            setTransactions(prev => [newTransaction, ...prev]);
            setIsFormOpen(false);
        } catch (error) {
            console.error("Failed to create transaction", error);
            alert("Failed to save transaction: " + error.message);
        }
    };

    const filteredTransactions = (transactions || [])
        .filter(t => filter === 'all' || t.type === filter);

    return (
        <div className="page-content">
            <div className="page-header">
                <div className="filter-tabs" style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        className={`btn-secondary ${filter === 'all' ? 'active' : ''}`}
                        style={{ backgroundColor: filter === 'all' ? 'var(--color-bg-hover)' : 'transparent' }}
                        onClick={() => setFilter('all')}
                    >All</button>
                    <button
                        className={`btn-secondary ${filter === 'income' ? 'active' : ''}`}
                        style={{ backgroundColor: filter === 'income' ? 'var(--color-bg-hover)' : 'transparent' }}
                        onClick={() => setFilter('income')}
                    >Income</button>
                    <button
                        className={`btn-secondary ${filter === 'expense' ? 'active' : ''}`}
                        style={{ backgroundColor: filter === 'expense' ? 'var(--color-bg-hover)' : 'transparent' }}
                        onClick={() => setFilter('expense')}
                    >Expense</button>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn-secondary" onClick={() => setIsStatementOpen(true)}>
                        <FileText size={20} style={{ marginRight: '8px' }} />
                        Statement
                    </button>
                    <button className="btn-primary" onClick={() => setIsFormOpen(true)}>
                        <Plus size={20} />
                        Add Transaction
                    </button>
                </div>
            </div>

            <div className="data-table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Txn ID</th>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Type</th>
                            <th>Amount</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTransactions.length > 0 ? filteredTransactions.map(t => (
                            <tr key={t.id}>
                                <td style={{ fontFamily: 'monospace', fontWeight: 500 }}>{t.customId || '-'}</td>
                                <td>{new Date(t.date).toLocaleDateString()}</td>
                                <td>{t.description}</td>
                                <td>
                                    <span className={`status-badge ${t.type === 'income' ? 'active' : 'inactive'}`}>
                                        {t.type}
                                    </span>
                                </td>
                                <td style={{
                                    color: t.type === 'income' ? 'var(--color-success)' : 'var(--color-text-primary)',
                                    fontWeight: 600
                                }}>
                                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            className="btn-icon"
                                            onClick={() => setActiveTransaction(t)}
                                            title="View Details"
                                        >
                                            <FileText size={16} />
                                        </button>
                                        {user?.role === 'admin' && (
                                            <button
                                                className="btn-icon danger"
                                                onClick={async () => {
                                                    if (confirm('Are you sure you want to delete this transaction?')) {
                                                        try {
                                                            await FinanceService.deleteTransaction(t.id);
                                                            setTransactions(prev => prev.filter(tx => tx.id !== t.id));
                                                        } catch (e) {
                                                            alert('Failed to delete: ' + e.message);
                                                        }
                                                    }
                                                }}
                                                title="Delete Transaction"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                                    No transactions found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isFormOpen && (
                <TransactionModal
                    onSubmit={handleCreate}
                    onCancel={() => setIsFormOpen(false)}
                />
            )}

            {isStatementOpen && (
                <StatementModal
                    transactions={transactions} // Pass full list for accurate opening balance calc
                    onClose={() => setIsStatementOpen(false)}
                />
            )}

            {activeTransaction && (
                <DetailsModal
                    transaction={activeTransaction}
                    onClose={() => setActiveTransaction(null)}
                />
            )}
        </div>
    );
};
export default Finance;
