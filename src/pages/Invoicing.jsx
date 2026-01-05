import React, { useState, useEffect } from 'react';
import { ProjectService } from '../services/ProjectService';
import { FinanceService } from '../services/FinanceService';
import { InvoiceService } from '../services/InvoiceService';
import { useAuth } from '../context/AuthContext';
import { Plus, Printer, Trash2, Pen } from 'lucide-react';
import '../styles/hr.css';
import '../styles/invoicing.css';
import { formatCurrency, numberToWords } from '../utils/format';

import logo from '../assets/PSPC_Logo.jpg';

const InvoiceBuilder = ({ invoice, onSave, onCancel, projects }) => {
    const [formData, setFormData] = useState({
        clientName: '',
        clientEmail: '',
        date: new Date().toISOString().split('T')[0],
        dueDate: '',
        items: [{ id: 1, description: '', quantity: 1, price: 0 }],
        notes: '',
        status: 'Draft',
        projectId: ''
    });

    useEffect(() => {
        if (invoice) setFormData(invoice);
    }, [invoice]);

    // Auto-fill client details when project selection changes
    const handleProjectChange = (e) => {
        const projectId = e.target.value;
        const selectedProject = projects?.find(p => String(p.id) === projectId);

        setFormData(prev => ({
            ...prev,
            projectId,
            clientName: selectedProject ? selectedProject.client : prev.clientName,
            clientEmail: selectedProject ? selectedProject.clientEmail : prev.clientEmail,
        }));
    };

    const updateItem = (id, field, value) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.map(item =>
                item.id === id ? { ...item, [field]: value } : item
            )
        }));
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { id: Date.now(), description: '', quantity: 1, price: 0 }]
        }));
    };

    const removeItem = (id) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter(item => item.id !== id)
        }));
    };

    const calculateTotal = () => {
        return formData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...formData,
            projectId: formData.projectId ? Number(formData.projectId) : null,
            total: calculateTotal()
        });
    };

    const handlePrint = () => {
        // Use the common print function, passing projects to resolve any references if needed
        printInvoice(formData, projects);
    };

    return (
        <div className="invoice-builder">
            <div className="card-header no-print" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h3>{invoice ? 'Edit Invoice' : 'New Invoice'}</h3>
                <div className="form-actions" style={{ marginTop: 0 }}>
                    <button type="button" className="btn-secondary" onClick={handlePrint}><Printer size={18} /> Print</button>
                    <button type="button" className="btn-secondary" onClick={onCancel}>Close</button>
                    <button type="button" className="btn-primary" onClick={handleSubmit}>Save Invoice</button>
                </div>
            </div>

            {/* Print Header */}
            <div className="invoice-print-header" style={{ display: 'none', marginBottom: '2rem', borderBottom: '2px solid #ccc', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <img src={logo} alt="Company Logo" style={{ height: '80px', objectFit: 'contain' }} />
                        <div>
                            <h2 style={{ margin: 0, color: '#1e293b' }}>Plansculpt Private Consultants</h2>
                            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>www.plansculpt.com.bd</div>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '0.9rem', color: '#64748b' }}>
                        <div>ceo@plansculpt.com.bd</div>
                        <div>+8801511803081</div>
                    </div>
                </div>
            </div>

            <div className="invoice-header-row">
                <div className="form-group" style={{ flex: 1, marginRight: '1rem' }}>
                    <label>Bill To (Client Name)</label>
                    <input
                        className="form-input"
                        value={formData.clientName}
                        onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                        placeholder="Client Name"
                    />
                    <input
                        className="form-input"
                        value={formData.clientEmail}
                        onChange={e => setFormData({ ...formData, clientEmail: e.target.value })}
                        placeholder="Client Email"
                        style={{ marginTop: '0.5rem' }}
                    />
                    <label style={{ marginTop: '1rem', display: 'block' }}>Link to Project</label>
                    <select
                        className="form-select"
                        value={formData.projectId}
                        onChange={handleProjectChange}
                    >
                        <option value="">-- None --</option>
                        {projects?.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group" style={{ width: '200px' }}>
                    <label>Invoice Date</label>
                    <input
                        type="date"
                        className="form-input"
                        value={formData.date}
                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                    />
                    <label style={{ marginTop: '0.5rem', display: 'block' }}>Due Date</label>
                    <input
                        type="date"
                        className="form-input"
                        value={formData.dueDate}
                        onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                    />
                    <label style={{ marginTop: '0.5rem', display: 'block' }}>Status</label>
                    <select
                        className="form-select"
                        value={formData.status}
                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                    >
                        <option value="Draft">Draft</option>
                        <option value="Sent">Sent</option>
                        <option value="Paid">Paid</option>
                    </select>
                </div>
            </div>

            <table className="invoice-items-table">
                <thead>
                    <tr>
                        <th style={{ width: '50%' }}>Description</th>
                        <th style={{ width: '15%' }}>Qty</th>
                        <th style={{ width: '20%' }}>Price</th>
                        <th style={{ width: '15%' }}>Total</th>
                        <th className="no-print" style={{ width: '5%' }}></th>
                    </tr>
                </thead>
                <tbody>
                    {formData.items.map(item => (
                        <tr key={item.id}>
                            <td>
                                <input
                                    value={item.description}
                                    onChange={e => updateItem(item.id, 'description', e.target.value)}
                                    placeholder="Item description"
                                />
                            </td>
                            <td>
                                <input
                                    type="number"
                                    value={item.quantity}
                                    onChange={e => updateItem(item.id, 'quantity', Number(e.target.value))}
                                    min="1"
                                />
                            </td>
                            <td>
                                <input
                                    type="number"
                                    value={item.price}
                                    onChange={e => updateItem(item.id, 'price', Number(e.target.value))}
                                    min="0"
                                    step="0.01"
                                />
                            </td>
                            <td style={{ textAlign: 'right', paddingRight: '1rem' }}>
                                {formatCurrency(item.quantity * item.price)}
                            </td>
                            <td className="no-print">
                                <button type="button" className="btn-icon danger" onClick={() => removeItem(item.id)}>
                                    <Trash2 size={16} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <button type="button" className="btn-secondary no-print" onClick={addItem} style={{ alignSelf: 'flex-start' }}>
                <Plus size={16} /> Add Item
            </button>

            <div className="invoice-summary">
                <div className="summary-row total">
                    <span>Total</span>
                    <span>{formatCurrency(calculateTotal())}</span>
                </div>
            </div>

            <div className="form-group" style={{ marginTop: '2rem' }}>
                <label>Notes / Terms</label>
                <textarea
                    className="form-input"
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    rows="3"
                ></textarea>
            </div>
        </div>
    );
};

const printInvoice = (invoice, projects) => {
    const printWindow = window.open('', '_blank');

    // Resolve project/client info if linked
    let project = null;
    if (invoice.projectId && projects) {
        project = projects.find(p => String(p.id) === String(invoice.projectId));
    }

    const clientName = invoice.clientName || (project ? project.client : 'N/A');
    const clientEmail = invoice.clientEmail || (project ? project.clientEmail : '');
    const clientPhone = project ? project.clientPhone : '';

    const items = typeof invoice.items === 'string' ? JSON.parse(invoice.items) : (invoice.items || []);
    const total = Number(invoice.total || 0);

    printWindow.document.write(`
        <html>
        <head>
            <title>Invoice #${invoice.id || 'DRAFT'}</title>
            <style>
                body { font-family: 'Arial', sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; line-height: 1.5; }
                
                .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 40px; }
                .header-left { display: flex; align-items: center; gap: 20px; }
                .logo { height: 70px; width: 70px; object-fit: contain; }
                .header-text { display: flex; flex-direction: column; }
                .company-name { font-size: 22px; font-weight: bold; color: #1f2937; margin-bottom: 2px; }
                .website { font-size: 13px; color: #6b7280; }
                .header-right { text-align: right; font-size: 13px; color: #4b5563; }
                .contact-line { margin-bottom: 2px; }

                .top-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
                .bill-to-section { flex: 1; }
                .invoice-details-section { text-align: right; }
                
                .section-header { font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; font-weight: 600; }
                .client-name { font-size: 18px; font-weight: bold; color: #111; margin-bottom: 4px; }
                .client-detail-line { font-size: 14px; color: #555; margin-bottom: 2px; }

                .invoice-detail-row { font-size: 16px; margin-bottom: 5px; color: #111; }
                .invoice-detail-label { color: #555; margin-right: 10px; }

                /* Project Subject Line CSS Removed */

                table { width: 100%; border-collapse: collapse; margin-bottom: 0; }
                th { 
                    background-color: #f3f4f6; 
                    color: #374151; 
                    font-weight: bold; 
                    text-transform: uppercase; 
                    font-size: 13px; 
                    padding: 12px 15px; 
                    text-align: left;
                    letter-spacing: 0.5px;
                }
                td { 
                    padding: 12px 15px; 
                    border-bottom: 1px solid #f3f4f6; 
                    color: #4b5563; 
                    font-size: 14px; 
                }
                .col-desc { width: 50%; }
                .col-qty { width: 15%; text-align: center; }
                .col-price { width: 15%; text-align: right; }
                .col-total { width: 20%; text-align: right; }

                /* Total Block */
                .total-bar { 
                    background-color: #f3f4f6; 
                    padding: 15px; 
                    display: flex; 
                    justify-content: space-between; 
                    align-items: center; 
                    margin-bottom: 15px; /* Reduced for proximity to word amount */
                }
                .total-label { font-size: 18px; font-weight: bold; color: #1f2937; }
                .total-amount { font-size: 20px; font-weight: bold; color: #111; }
                
                .amount-words-line {
                    text-align: right; 
                    font-style: italic; 
                    color: #555; 
                    font-size: 14px; 
                    margin-bottom: 40px; 
                    padding-right: 15px;
                }

                .bottom-section { display: flex; justify-content: space-between; margin-bottom: 40px; }
                /* Payment Info class removed but keeping flex structure for notes */
                
                .notes-section { flex: 1; /* margin-left: 40px; removed since payment info is gone */ }
                .notes-title { font-weight: bold; font-size: 14px; text-transform: uppercase; margin-bottom: 8px; color: #111; }
                .note-text { font-size: 14px; color: #555; line-height: 1.4; }

                .declaration { margin-top: 20px; font-size: 13px; color: #666; font-style: italic; margin-bottom: 60px; }

                /* Footer Signature */
                .footer { display: flex; justify-content: flex-end; margin-top: 20px; }
                .signature-block { text-align: center; }
                .signature-line { border-top: 1px solid #000; width: 250px; margin-bottom: 5px; }
                .signature-title { font-weight: bold; font-size: 14px; }

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

            <div class="top-info">
                <div class="bill-to-section">
                    <div class="section-header">Bill To:</div>
                    <div class="client-name">${clientName}</div>
                    <div class="client-detail-line">
                        ${[clientEmail, clientPhone].filter(Boolean).join(' | ')}
                    </div>
                </div>
                <div class="invoice-details-section">
                    <div class="invoice-detail-row">
                        <span class="invoice-detail-label">Date:</span>
                        <span>${new Date(invoice.date).toLocaleDateString()}</span>
                    </div>
                    <div class="invoice-detail-row">
                        <span class="invoice-detail-label">Invoice NO.</span>
                        <span>#${String(invoice.id || 'DRAFT').toUpperCase()}</span>
                    </div>
                </div>
            </div>

            <!-- Project Subject Line REMOVED -->

            <table>
                <thead>
                    <tr>
                        <th class="col-desc">PROJECT NAME</th>
                        <th class="col-qty">QTY</th>
                        <th class="col-price">PRICE</th>
                        <th class="col-total">TOTAL</th>
                    </tr>
                </thead>
                <tbody>
                    ${items.map(item => `
                        <tr>
                            <td>
                                ${project ? `<div style="font-weight: bold; margin-bottom: 2px;">${project.name}</div>` : ''}
                                <div style="color: #555;">${item.description}</div>
                            </td>
                            <td class="col-qty">${item.quantity}</td>
                            <td class="col-price">${formatCurrency(item.price)}</td>
                            <td class="col-total">${formatCurrency(item.quantity * item.price)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div class="total-bar">
                <div class="total-label">Total amount</div>
                <div class="total-amount">${formatCurrency(total)}</div>
            </div>
            
            <div class="amount-words-line">
                In Words: ${numberToWords(total)} Only
            </div>

            <div class="bottom-section">
                <!-- Payment Method Removed -->
                
                <div class="notes-section">
                    <div class="notes-title">NOTES</div>
                    ${invoice.notes ?
            `<div class="note-text">${invoice.notes}</div>` :
            `<div class="note-text" style="color: #ccc;">....................................................................</div>`
        }
                </div>
            </div>

            <!-- Declaration -->
            <div class="declaration">
                I hereby declare that the invoices are for the actual services provided and the amount is true to the best of my knowledge.
            </div>

            <!-- Signature -->
            <div class="footer">
                <div class="signature-block">
                    <div class="signature-line"></div>
                    <div class="signature-title">Authorized Signature</div>
                </div>
            </div>

            <script>window.print();</script>
        </body>
        </html>
    `);
    printWindow.document.close();
};

const Invoicing = () => {
    const { user } = useAuth();
    const [isBuilderOpen, setIsBuilderOpen] = useState(false);
    const [activeInvoice, setActiveInvoice] = useState(null);
    const [invoices, setInvoices] = useState([]);
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [invoiceData, projectData] = await Promise.all([
                InvoiceService.getAll(),
                ProjectService.getAll()
            ]);
            setInvoices(invoiceData);
            setProjects(projectData);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSave = async (data) => {
        let invoiceId;
        try {
            if (data.id) {
                await InvoiceService.update(data.id, data);
                invoiceId = data.id;
            } else {
                const newInv = await InvoiceService.create({
                    ...data,
                    createdAt: new Date().toISOString()
                });
                invoiceId = newInv.id;
            }

            // Check if Paid and create income transaction if linked to project
            // Only if it wasn't already paid (to avoid duplicates on edit) or if it's new
            const wasPaid = activeInvoice?.status === 'Paid';
            if (data.status === 'Paid' && data.projectId && !wasPaid) {
                // Ideally backend handles this logic or we prevent dup creation.
                // We'll call the service which now uses API.
                await FinanceService.markInvoicePaid(invoiceId, data.total, data.date, data.projectId);
            }

            setIsBuilderOpen(false);
            setActiveInvoice(null);
            loadData(); // Refresh list
        } catch (error) {
            alert('Failed to save invoice: ' + error.message);
        }
    };

    const startDelete = async (id) => {
        console.log('Attempting delete:', id);
        if (user?.role !== 'admin') {
            alert(`Access Denied: Only Administrators can delete invoices. Current role: ${user?.role || 'None'}`);
            return;
        }
        if (window.confirm(`Are you sure you want to delete Invoice #${id}?`)) {
            try {
                console.log('Calling InvoiceService.delete...');
                await InvoiceService.delete(id);
                console.log('Delete successful');
                loadData();
            } catch (error) {
                console.error('Delete failed:', error);
                alert('Failed to delete invoice. Check console for details.');
            }
        }
    };

    const handleDelete = async (id) => {
        try {
            await InvoiceService.delete(id);
            loadData();
        } catch (err) {
            alert('Failed to delete invoice');
        }
    };

    const openBuilder = (invoice = null) => {
        setActiveInvoice(invoice);
        setIsBuilderOpen(true);
    };

    const handlePrintList = (invoice) => {
        printInvoice(invoice, projects);
    };

    return (
        <div className="page-content">
            <div className="page-header no-print">
                {!isBuilderOpen && (
                    <>
                        <h2>Invoices</h2>
                        <button className="btn-primary" onClick={() => openBuilder()}>
                            <Plus size={20} />
                            New Invoice
                        </button>
                    </>
                )}
            </div>

            {isBuilderOpen ? (
                <InvoiceBuilder
                    invoice={activeInvoice}
                    onSave={handleSave}
                    onCancel={() => setIsBuilderOpen(false)}
                    projects={projects}
                />
            ) : (
                <div className="data-table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Invoice #</th>
                                <th>Client</th>
                                <th>Date</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices?.length > 0 ? invoices.map(inv => (
                                <tr key={inv.id}>
                                    <td>#{String(inv.id).toUpperCase()}</td>
                                    <td>{inv.clientName}</td>
                                    <td>{inv.date}</td>
                                    <td>{formatCurrency(inv.total)}</td>
                                    <td>
                                        <span className={`status-badge ${inv.status.toLowerCase()}`}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn-icon" onClick={() => openBuilder(inv)} title="Edit Invoice">
                                                <Pen size={16} />
                                            </button>
                                            <button className="btn-icon" onClick={() => handlePrintList(inv)} title="Print Invoice">
                                                <Printer size={16} />
                                            </button>
                                            <button className="btn-icon danger" onClick={() => startDelete(inv.id)} title="Delete Invoice">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                                        No invoices found. Create one to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
export default Invoicing;
