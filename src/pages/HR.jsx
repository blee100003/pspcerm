import React, { useState, useEffect } from 'react';
import { EmployeeService } from '../services/EmployeeService';
import { FinanceService } from '../services/FinanceService';
import { ProjectService } from '../services/ProjectService';
import { Plus, Search, Edit2, Trash2, X, User, DollarSign, FileText, Printer } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styles/hr.css';
import { formatCurrency, numberToWords } from '../utils/format';

import logo from '../assets/PSPC_Logo.jpg';
import API_BASE_URL from '../config';

const EmployeeModal = ({ employee, onSubmit, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        customId: '',
        email: '',
        phone: '',
        dob: '',
        gender: '',
        role: '',
        department: '',
        type: 'fixed', // 'fixed' | 'freelance'
        salary: '',
        status: 'active'
    });

    useEffect(() => {
        if (employee) {
            setFormData(employee);
        }
    }, [employee]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            salary: formData.salary === '' ? null : Number(formData.salary)
        };
        onSubmit(payload);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>{employee ? 'Edit Employee' : 'Add New Employee'} {employee?.customId && <span style={{ fontSize: '0.8em', color: 'var(--color-text-secondary)' }}>({employee.customId})</span>}</h3>
                    <button className="btn-icon" onClick={onClose}><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="form-input"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Gender</label>
                                <select
                                    name="gender"
                                    className="form-select"
                                    value={formData.gender || ''}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="form-input"
                                    value={formData.email || ''}
                                    onChange={handleChange}
                                    placeholder="email@example.com"
                                />
                            </div>
                            <div className="form-group">
                                <label>Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    className="form-input"
                                    value={formData.phone || ''}
                                    onChange={handleChange}
                                    placeholder="+880..."
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label>Date of Birth</label>
                                <input
                                    type="date"
                                    name="dob"
                                    className="form-input"
                                    value={formData.dob || ''}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Role / Position</label>
                                <input
                                    type="text"
                                    name="role"
                                    className="form-input"
                                    value={formData.role}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Department</label>
                            <input
                                type="text"
                                name="department"
                                className="form-input"
                                value={formData.department}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Employment Type</label>
                            <select
                                name="type"
                                className="form-select"
                                value={formData.type || 'fixed'}
                                onChange={handleChange}
                            >
                                <option value="fixed">Fixed Salary</option>
                                <option value="freelance">Freelancer</option>
                            </select>
                        </div>

                        {formData.type !== 'freelance' && (
                            <div className="form-group">
                                <label>Monthly Salary</label>
                                <input
                                    type="number"
                                    name="salary"
                                    className="form-input"
                                    value={formData.salary}
                                    onChange={handleChange}
                                    required={formData.type !== 'freelance'}
                                />
                            </div>
                        )}

                        <div className="form-group">
                            <label>Status</label>
                            <select
                                name="status"
                                className="form-select"
                                value={formData.status}
                                onChange={handleChange}
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="on_leave">On Leave</option>
                            </select>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary">Save Employee</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const PaymentHistoryModal = ({ employee, onClose }) => {
    const [payments, setPayments] = useState([]);
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        loadData();
    }, [employee]);

    const loadData = async () => {
        try {
            const allTrans = await FinanceService.getTransactions();
            const allProjects = await ProjectService.getAll();

            const empPayments = allTrans
                .filter(t => t.employeeId === employee.id && t.type === 'expense')
                .sort((a, b) => new Date(b.date) - new Date(a.date));

            setPayments(empPayments);
            setProjects(allProjects);
        } catch (error) {
            console.error("Failed to load data", error);
        }
    };

    const getContext = (payment) => {
        if (payment.projectId) {
            const proj = projects.find(p => p.id === payment.projectId);
            return proj ? `Project: ${proj.name}` : 'Project (Deleted)';
        }
        // Extract month from description "Monthly Salary - Name (Month)"
        const match = payment.description.match(/\(([^)]+)\)/);
        if (match) return `Salary: ${match[1]}`;

        return payment.category || 'Payment';
    };


    const handlePrint = (payment) => {
        const printWindow = window.open('', '_blank');
        const context = getContext(payment); // e.g., "Project: X" or "Salary: Y"

        // Extract plain project name if it's a project payment
        let projectName = 'N/A';
        let taskName = 'N/A';
        if (payment.projectId) {
            const proj = projects.find(p => p.id === payment.projectId);
            projectName = proj ? proj.name : 'Unknown';
            // Try to extract Task name from description "Task Payment: Title"
            taskName = payment.description.replace('Task Payment: ', '');
        } else {
            // For salary
            const match = payment.description.match(/\(([^)]+)\)/);
            projectName = match ? `Salary Month: ${match[1]}` : 'General';
            taskName = 'N/A';
        }

        printWindow.document.write(`
            <html>
            <head>
                <title>Payment Voucher - ${payment.id}</title>
                <style>
                    body { font-family: 'Arial', sans-serif; padding: 40px; color: #000; max-width: 800px; margin: 0 auto; line-height: 1.5; }
                    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #ccc; padding-bottom: 20px; margin-bottom: 30px; }
                    
                    .header-left { display: flex; align-items: center; gap: 20px; }
                    .logo { height: 80px; width: 80px; object-fit: contain; } /* Adjusted size based on image */
                    .header-text { display: flex; flex-direction: column; }
                    .company-name { font-size: 24px; font-weight: bold; color: #1f2937; margin-bottom: 5px; } /* Darker text */
                    .website { font-size: 14px; color: #4b5563; }
                    
                    .header-right { text-align: right; font-size: 14px; color: #374151; }
                    .contact-line { margin-bottom: 2px; }

                    .voucher-title { text-align: center; font-size: 20px; font-weight: bold; text-transform: uppercase; border: 1px solid #000; padding: 5px 20px; display: inline-block; margin: 0 auto 30px auto; }
                    .voucher-title-container { text-align: center; }

                    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
                    .box { border: 1px solid #ccc; padding: 15px; border-radius: 4px; }
                    .box-title { font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 10px; font-size: 14px; text-transform: uppercase; color: #555; }
                    
                    .row { display: flex; margin-bottom: 8px; font-size: 14px; }
                    .label { font-weight: bold; width: 120px; flex-shrink: 0; }
                    .value { flex-grow: 1; }

                    .amount-section { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; margin-bottom: 30px; }
                    .amount-row { display: flex; align-items: center; justify-content: space-between; font-size: 18px; font-weight: bold; border-bottom: 1px solid #ddd; padding-bottom: 10px; margin-bottom: 10px; }
                    .amount-words { font-style: italic; font-size: 14px; color: #555; }

                    .declaration { margin-top: 40px; margin-bottom: 80px; font-size: 14px; }
                    
                    .signatures { display: flex; justify-content: space-between; margin-top: 50px; }
                    .sig-block { text-align: center; }
                    .sig-line { border-top: 1px solid #000; width: 200px; margin-bottom: 10px; }
                    .sig-title { font-weight: bold; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="header-left">
                        <img src="${logo}" class="logo" />
                        <div class="header-text">
                            <div class="company-name">Plansculpt Private Consultants</div>
                            <div class="website">www.plansculpt.com.bd</div>
                        </div>
                    </div>
                    <div class="header-right">
                        <div class="contact-line">ceo@plansculpt.com.bd</div>
                        <div class="contact-line">+8801511803081</div>
                    </div>
                </div>
                
                <div class="voucher-title-container">
                    <div class="voucher-title">Payment Voucher</div>
                </div>

                <div class="info-grid">
                    <div class="box">
                        <div class="box-title">Voucher Details</div>
                        <div class="row"><div class="label">Voucher ID:</div><div class="value">#${payment.id}</div></div>
                        <div class="row"><div class="label">Date:</div><div class="value">${new Date(payment.date).toLocaleDateString()}</div></div>
                        <div class="row"><div class="label">Method:</div><div class="value">Bank Transfer / Cash</div></div>
                    </div>
                    <div class="box">
                        <div class="box-title">Payee Details</div>
                        <div class="row"><div class="label">Name:</div><div class="value">${employee.name}</div></div>
                        <div class="row"><div class="label">Employee ID:</div><div class="value">${employee.customId || 'N/A'}</div></div>
                        <div class="row"><div class="label">Email:</div><div class="value">${employee.email || 'N/A'}</div></div>
                        <div class="row"><div class="label">Phone:</div><div class="value">${employee.phone || 'N/A'}</div></div>
                    </div>
                </div>

                <div class="box" style="margin-bottom: 30px;">
                    <div class="box-title">Payment Context</div>
                    <div class="row"><div class="label">Project:</div><div class="value">${projectName}</div></div>
                    <div class="row"><div class="label">Task/Ref:</div><div class="value">${taskName}</div></div>
                    <div class="row"><div class="label">Description:</div><div class="value">${payment.description}</div></div>
                </div>

                <div class="amount-section">
                    <div class="amount-row">
                        <span>Total Paid Amount:</span>
                        <span>${formatCurrency(payment.amount)}</span>
                    </div>
                    <div class="amount-words">In Words: ${numberToWords(Number(payment.amount))}</div>
                </div>

                <div class="declaration">
                    <strong>Declaration:</strong><br/>
                    I, <u>${employee.name}</u>, hereby acknowledge that I have received the sum of <strong>${formatCurrency(payment.amount)}</strong> (${numberToWords(Number(payment.amount))}) from Plansculpt Private Consultants as full payment for the above-mentioned services/salary.
                </div>

                <div class="signatures">
                    <div class="sig-block">
                        <div class="sig-line"></div>
                        <div class="sig-title">Receiver's Signature</div>
                    </div>
                    <div class="sig-block">
                        <div class="sig-line"></div>
                        <div class="sig-title">Authorizer's Signature</div>
                    </div>
                </div>

                <script>window.print();</script>
            </body>
            </html>
    `);
        printWindow.document.close();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '800px' }}>
                <div className="modal-header">
                    <h3>Payment History - {employee.name}</h3>
                    <button className="btn-icon" onClick={onClose}><X size={20} /></button>
                </div>
                <div className="modal-body">
                    {payments?.length > 0 ? (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Project / Month</th>
                                    <th>Description</th>
                                    <th>Amount</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map(p => (
                                    <tr key={p.id}>
                                        <td>{new Date(p.date).toLocaleDateString()}</td>
                                        <td style={{ fontWeight: 500 }}>{getContext(p)}</td>
                                        <td style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>{p.description}</td>
                                        <td style={{ fontWeight: 600 }}>{formatCurrency(p.amount)}</td>
                                        <td>
                                            <button className="btn-icon" title="Print Voucher" onClick={() => handlePrint(p)}>
                                                <Printer size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>No payments found.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

const AddPaymentModal = ({ employee, onClose, onSave }) => {
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            amount: Number(amount),
            description,
            description,
            date,
            employeeId: employee.id,
            type: 'expense',
            category: 'Salary'
        });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Add Payment for {employee.name}</h3>
                    <button className="btn-icon" onClick={onClose}><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label>Amount</label>
                            <input
                                type="number"
                                className="form-input"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                required
                                min="0"
                                step="0.01"
                            />
                        </div>
                        <div className="form-group">
                            <label>Date</label>
                            <input
                                type="date"
                                className="form-input"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <input
                                type="text"
                                className="form-input"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                required
                                placeholder="e.g. Bonus, Reimbursement, Freelance Project X"
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary">Save Payment</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const HR = () => {
    const { user } = useAuth();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [viewPaymentsFor, setViewPaymentsFor] = useState(null);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [monthOffset, setMonthOffset] = useState(0);
    const [employees, setEmployees] = useState([]);
    const [payrollStatus, setPayrollStatus] = useState({ ran: false, count: 0, total: 0 });
    const [payingEmployee, setPayingEmployee] = useState(null);

    useEffect(() => {
        loadData();
    }, [monthOffset]);

    const loadData = async () => {
        try {
            const allEmployees = await EmployeeService.getAll();
            const allTrans = await FinanceService.getTransactions();
            const token = localStorage.getItem('token');
            const resTasks = await fetch(`${API_BASE_URL}/tasks`, {
                headers: { 'Authorization': `Bearer ${token} ` }
            });
            const allTasks = resTasks.ok ? await resTasks.json() : [];

            const enriched = allEmployees.map(e => {
                // Determine total paid for ALL employees (freelance AND fixed for history)
                const payments = allTrans.filter(t => t.employeeId === e.id && t.type === 'expense');
                const totalPaid = payments.reduce((sum, t) => sum + Number(t.amount), 0);

                let pendingPay = 0;
                if (e.type === 'freelance') {
                    const tasks = allTasks.filter(t => t.assigneeId === e.id);
                    pendingPay = tasks
                        .filter(t => t.status === 'Completed' && t.paymentStatus !== 'Paid')
                        .reduce((sum, t) => sum + Number(t.cost || 0), 0);
                }

                return { ...e, totalPaid, pendingPay };
            });
            setEmployees(enriched);

            // Payroll Status
            const date = new Date();
            date.setMonth(date.getMonth() + monthOffset);
            const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
            const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString();

            const salaryTrans = allTrans.filter(t =>
                t.type === 'expense' &&
                t.description.startsWith('Monthly Salary') &&
                t.date >= startOfMonth &&
                t.date <= endOfMonth
            );

            setPayrollStatus({
                count: salaryTrans.length,
                total: salaryTrans.reduce((acc, t) => acc + Number(t.amount), 0),
                ran: salaryTrans.length > 0
            });
        } catch (err) {
            console.error("Failed to load HR data", err);
        }
    };

    const handleCreate = async (data) => {
        try {
            await EmployeeService.create(data);
            setIsFormOpen(false);
            loadData();
        } catch (err) {
            console.error("Employee Creation Failed:", err);
            alert(`Failed to create employee: ${err.message} `);
        }
    };

    const handleUpdate = async (data) => {
        try {
            await EmployeeService.update(editingEmployee.id, data);
            setEditingEmployee(null);
            setIsFormOpen(false);
            loadData();
        } catch (err) {
            alert('Failed to update employee');
        }
    };

    const handleDelete = async (id) => {
        if (user?.role !== 'admin') {
            alert('Access Denied: Only Administrators can delete employees.');
            return;
        }
        if (confirm('Are you sure you want to delete this employee?')) {
            try {
                await EmployeeService.delete(id);
                loadData();
            } catch (err) {
                alert(`Failed to delete employee: ${err.message}`);
            }
        }
    };

    const openEdit = (employee) => {
        setEditingEmployee(employee);
        setIsFormOpen(true);
    };

    const handlePaymentSave = async (payment) => {
        try {
            await FinanceService.addTransaction(payment);
            setPayingEmployee(null);
            loadData();
            alert('Payment recorded successfully');
        } catch (err) {
            alert('Failed to record payment');
        }
    };

    const runPayroll = async () => {
        if (!confirm('Run payroll for all active Fixed employees for this month?')) return;

        const fixedEmployees = employees.filter(e => e.type === 'fixed' && e.status === 'active' && e.salary);
        const date = new Date();
        const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });

        const transactions = fixedEmployees.map(e => ({
            type: 'expense',
            amount: Number(e.salary),
            description: `Monthly Salary - ${e.name} (${monthName})`,
            employeeId: e.id,
            category: 'Salary',
            date: new Date().toISOString(),
            projectId: null
        }));

        try {
            // Bulk add transactions via generic endpoint or loop
            // FinanceService might not have bulk add, so we use raw fetch or loop.
            // Using raw fetch to /api/transactions for bulk if supported or loop.
            // The server index.js has /api/transactions POST which handles single.
            // Wait, I saw a BULK add in server/index.js? 
            // Let's check server/index.js content later or just loop for safety if unsure.
            // Actually, I wrote the server. Let me check if I added bulk transaction support.
            // I'll assume standard loop for now to be safe or use a known bulk endpoint if created.
            // In the previous step I used: await fetch('http://localhost:3001/api/transactions', ... body: JSON.stringify(transactions) )
            // If the server expects an array, that works. If it expects an object, it fails.
            // Let's assume the server handles array cause I might have added it. 
            // BUT, standard REST usually is one per POST.
            // I'll use Promise.all with FinanceService.createTransaction to be 100% safe.

            await Promise.all(transactions.map(t => FinanceService.addTransaction(t)));

            alert(`Payroll processed for ${fixedEmployees.length} employees.`);
            loadData();
        } catch (err) {
            console.error(err);
            alert('Error processing payroll.');
        }
    };

    // Safe filter
    const filteredEmployees = (employees || []).filter(e =>
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.customId && e.customId.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="page-content">
            <div className="page-header">
                {!isFormOpen && (
                    <>
                        <div className="search-bar" style={{ position: 'relative' }}>
                            <Search size={20} style={{ position: 'absolute', left: 12, top: 10, color: 'var(--color-text-muted)' }} />
                            <input
                                type="text"
                                className="form-input"
                                style={{ paddingLeft: '2.5rem', width: '300px' }}
                                placeholder="Search employees..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                className="btn-secondary"
                                onClick={runPayroll}
                                disabled={payrollStatus?.ran}
                                style={{ opacity: payrollStatus?.ran ? 0.6 : 1, cursor: payrollStatus?.ran ? 'not-allowed' : 'pointer' }}
                                title={payrollStatus?.ran ? "Payroll already run for this month" : "Run Monthly Payroll"}
                            >
                                <DollarSign size={20} />
                                {payrollStatus?.ran ? "Payroll Paid" : "Run Payroll"}
                            </button>
                            <button className="btn-primary" onClick={() => { setEditingEmployee(null); setIsFormOpen(true); }}>
                                <Plus size={20} />
                                Add Employee
                            </button>
                        </div>
                    </>
                )}
            </div>

            {viewPaymentsFor && (
                <PaymentHistoryModal
                    employee={viewPaymentsFor}
                    onClose={() => setViewPaymentsFor(null)}
                />
            )}

            {payingEmployee && (
                <AddPaymentModal
                    employee={payingEmployee}
                    onClose={() => setPayingEmployee(null)}
                    onSave={handlePaymentSave}
                />
            )}

            {isFormOpen && (
                <EmployeeModal
                    employee={editingEmployee}
                    onSubmit={editingEmployee ? handleUpdate : handleCreate}
                    onClose={() => { setIsFormOpen(false); setEditingEmployee(null); }}
                />
            )}

            <div className="data-table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Role</th>
                            <th>Type</th>
                            <th>Salary / Freelance Stats</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEmployees.length > 0 ? filteredEmployees.map(employee => (
                            <tr key={employee.id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--color-bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <User size={16} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 500 }}>{employee.name}</div>
                                            {employee.customId && <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{employee.customId}</div>}
                                        </div>
                                    </div>
                                </td>
                                <td>{employee.role}</td>
                                <td>
                                    <span style={{
                                        padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem',
                                        background: employee.type === 'freelance' ? '#e0f2fe' : '#f3f4f6',
                                        color: employee.type === 'freelance' ? '#0369a1' : '#374151'
                                    }}>
                                        {employee.type === 'freelance' ? 'Freelance' : 'Fixed'}
                                    </span>
                                </td>
                                <td>
                                    {employee.type === 'fixed' ? (
                                        employee.salary ? `${formatCurrency(employee.salary)}/mo` : '-'
                                    ) : (
                                        <div style={{ fontSize: '0.8rem' }}>
                                            <div style={{ color: 'var(--color-success)' }}>Paid: {formatCurrency(employee.totalPaid || 0)}</div>
                                            {Number(employee.pendingPay) > 0 && <div style={{ color: 'orange' }}>Pending: {formatCurrency(employee.pendingPay)}</div>}
                                        </div>
                                    )}
                                </td >
                                <td>
                                    <span className={`status-badge ${employee.status}`}>
                                        {employee.status.replace('_', ' ')}
                                    </span>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button className="btn-icon" title="Pay Employee" onClick={() => setPayingEmployee(employee)}>
                                            <DollarSign size={16} />
                                        </button>
                                        <button className="btn-icon" title="View Payments" onClick={() => setViewPaymentsFor(employee)}>
                                            <FileText size={16} />
                                        </button>
                                        <button className="btn-icon" onClick={() => openEdit(employee)}>
                                            <Edit2 size={16} />
                                        </button>
                                        <button className="btn-icon danger" onClick={() => handleDelete(employee.id)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr >
                        )) : (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                                    No employees found. Add one to get started.
                                </td>
                            </tr>
                        )}
                    </tbody >
                </table >
            </div >
        </div >
    );
};
export default HR;
