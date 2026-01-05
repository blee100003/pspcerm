import React, { useState, useEffect } from 'react';
import { ProjectService } from '../services/ProjectService';
import { EmployeeService } from '../services/EmployeeService';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Edit2, Trash2, FolderKanban, ListTodo, CheckSquare, Square, X, DollarSign, User, RefreshCw } from 'lucide-react';
import { formatCurrency } from '../utils/format';

const TaskModal = ({ project, onClose, onTaskChange }) => {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState('');
    const [newTaskCost, setNewTaskCost] = useState('');
    const [assigneeSearch, setAssigneeSearch] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [assigneeId, setAssigneeId] = useState('');

    const [employees, setEmployees] = useState([]);

    useEffect(() => {
        if (project) {
            loadTasks();
            loadEmployees();
        }
    }, [project]);

    const loadEmployees = async () => {
        try {
            const allEmployees = await EmployeeService.getAll('active');
            setEmployees(allEmployees || []);
        } catch (err) {
            console.error("Failed to load employees:", err);
            setEmployees([]);
        }
    };

    const loadTasks = async () => {
        try {
            const projectTasks = await ProjectService.getTasks(project.id);
            setTasks(Array.isArray(projectTasks) ? projectTasks : []);
        } catch (error) {
            console.error("Failed to load tasks:", error);
            setTasks([]);
        }
    };

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!newTask.trim()) return;

        await ProjectService.addTask({
            projectId: project.id,
            title: newTask,
            assigneeId: assigneeId ? Number(assigneeId) : null,
            assigneeName: assigneeId ? null : assigneeSearch, // Use search text as name if no ID
            cost: newTaskCost ? Number(newTaskCost) : 0,
            status: 'Pending',
            paymentStatus: 'Pending',
            createdAt: new Date().toISOString()
        });
        setNewTask('');
        setNewTaskCost('');
        setAssigneeId('');
        setAssigneeSearch(''); // Clear search
        loadTasks();
        if (onTaskChange) onTaskChange();
    };

    const handleStatusChange = async (task, newStatus) => {
        // Optimistic update
        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));

        try {
            await ProjectService.updateTask(task.id, { status: newStatus });
            loadTasks();
            if (onTaskChange) onTaskChange();
        } catch (error) {
            console.error("Failed to update status", error);
            // Revert on error
            loadTasks();
        }
    };

    const deleteTask = async (id) => {
        await ProjectService.deleteTask(id);
        loadTasks();
        if (onTaskChange) onTaskChange();
    };

    const payTask = async (task) => {
        if (!confirm(`Process payment of $${task.cost} for task "${task.title}"?`)) return;
        try {
            await ProjectService.payTask(task.id);
            loadTasks();
            if (onTaskChange) onTaskChange();
            alert('Payment processed successfully.');
        } catch (err) {
            alert('Error processing payment: ' + err.message);
        }
    };

    const filteredEmployees = employees.filter(e =>
        e.name.toLowerCase().includes(assigneeSearch.toLowerCase()) ||
        (e.customId && e.customId.toLowerCase().includes(assigneeSearch.toLowerCase()))
    );

    const selectAssignee = (emp) => {
        setAssigneeId(emp.id);
        setAssigneeSearch(`${emp.customId} - ${emp.name}`);
        setIsDropdownOpen(false);
    };



    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '700px' }}>
                <div className="modal-header">
                    <h3>Tasks for {project.name} <span style={{ fontSize: '0.8em', color: 'var(--color-text-secondary)' }}>({project.customId})</span></h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn-icon" onClick={loadTasks} title="Refresh Tasks">
                            <RefreshCw size={20} />
                        </button>
                        <button className="btn-icon" onClick={onClose}><X size={20} /></button>
                    </div>
                </div>
                <div className="modal-body">
                    <div style={{ marginBottom: '1.5rem', background: 'var(--color-bg-hover)', padding: '1rem', borderRadius: '8px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                            <input
                                className="form-input"
                                placeholder="Task title..."
                                value={newTask}
                                onChange={(e) => setNewTask(e.target.value)}
                                autoFocus
                            />

                            <div style={{ position: 'relative' }}>
                                <input
                                    className="form-input"
                                    placeholder="Assignee..."
                                    value={assigneeSearch}
                                    onChange={(e) => {
                                        setAssigneeSearch(e.target.value);
                                        setAssigneeId('');
                                        setIsDropdownOpen(true);
                                    }}
                                    onFocus={() => setIsDropdownOpen(true)}
                                    onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                                />
                                {isDropdownOpen && assigneeSearch && (
                                    <div style={{
                                        position: 'absolute', top: '100%', left: 0, right: 0,
                                        background: 'white', border: '1px solid var(--color-border)',
                                        borderRadius: '4px', maxHeight: '150px', overflowY: 'auto', zIndex: 50,
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                    }}>
                                        {filteredEmployees.length > 0 ? filteredEmployees.map(e => (
                                            <div
                                                key={e.id}
                                                style={{ padding: '8px', cursor: 'pointer', fontSize: '0.9rem', color: '#1f2937' }}
                                                className="dropdown-item"
                                                onMouseDown={() => selectAssignee(e)}
                                            >
                                                <span style={{ fontWeight: 500, marginRight: '4px' }}>{e.customId}</span> - {e.name}
                                                <span style={{ fontSize: '0.75rem', color: '#666', marginLeft: '4px' }}>({e.type})</span>
                                            </div>
                                        )) : (
                                            <div style={{ padding: '8px', fontSize: '0.85rem', color: '#999' }}>No match</div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <input
                                type="number"
                                className="form-input"
                                placeholder="Cost (BDT)"
                                value={newTaskCost}
                                onChange={(e) => setNewTaskCost(e.target.value)}
                            />
                        </div>
                        <button className="btn-primary" style={{ width: '100%' }} onClick={handleAddTask}>Add Task</button>
                    </div>

                    <div className="task-list">
                        {tasks.length > 0 ? tasks.map(task => {
                            const assignee = employees?.find(e => e.id === task.assigneeId);
                            return (
                                <div key={task.id} className="task-item" style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '10px', borderBottom: '1px solid var(--color-border)',
                                    opacity: task.status === 'Completed' ? 0.8 : 1
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                                        <select
                                            className="form-select"
                                            style={{ width: '130px', fontSize: '0.85rem', padding: '4px' }}
                                            value={task.status || 'Pending'}
                                            onChange={(e) => handleStatusChange(task, e.target.value)}
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Completed">Completed</option>
                                        </select>

                                        <div style={{ flex: 1 }}>
                                            <div style={{
                                                textDecoration: task.status === 'Completed' ? 'line-through' : 'none',
                                                fontWeight: 500
                                            }}>{task.title}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'flex', gap: '10px', marginTop: '2px' }}>
                                                {(assignee || task.assigneeName) && (
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <User size={12} /> {assignee ? assignee.name : task.assigneeName}
                                                        {!assignee && <span style={{ fontSize: '0.7rem', fontStyle: 'italic' }}>(External)</span>}
                                                    </span>
                                                )}
                                                {Number(task.cost) > 0 && <span style={{ color: 'var(--color-text-primary)' }}>{formatCurrency(task.cost)}</span>}
                                                {task.paymentStatus === 'Paid' && <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>PAID</span>}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        {task.status === 'Completed' && Number(task.cost) > 0 && task.paymentStatus !== 'Paid' && (assignee?.type === 'freelance' || !assignee) && (
                                            <button
                                                className="btn-secondary"
                                                style={{ padding: '4px 8px', fontSize: '0.75rem', height: 'auto' }}
                                                onClick={() => payTask(task)}
                                                title="Pay Freelancer"
                                            >
                                                <DollarSign size={14} /> Pay
                                            </button>
                                        )}
                                        <button className="btn-icon danger" onClick={() => deleteTask(task.id)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '20px' }}>
                                No tasks yet.
                            </div>
                        )}
                    </div>
                </div>
                <div className="modal-footer" style={{ justifyContent: 'center' }}>
                    <button className="btn-primary" onClick={onClose} style={{ minWidth: '100px' }}>OK</button>
                </div>
            </div>
        </div>
    );
};

const ProjectForm = ({ project, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        client: '',
        clientEmail: '',
        clientPhone: '',
        description: '',
        income: '', // This acts as Budget/Estimated Income
        startDate: new Date().toISOString().split('T')[0],
        status: 'In Progress'
    });

    useEffect(() => {
        if (project) {
            setFormData(project);
        }
    }, [project]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (

        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>{project ? 'Edit Project' : 'New Project'}</h3>
                    <button className="btn-icon" onClick={onCancel}><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label>Project Name</label>
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
                            <label>Client Name</label>
                            <input
                                type="text"
                                name="client"
                                className="form-input"
                                value={formData.client}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label>Client Email</label>
                                <input
                                    type="email"
                                    name="clientEmail"
                                    className="form-input"
                                    value={formData.clientEmail}
                                    onChange={handleChange}
                                    placeholder="email@example.com"
                                />
                            </div>
                            <div className="form-group">
                                <label>Client Phone</label>
                                <input
                                    type="tel"
                                    name="clientPhone"
                                    className="form-input"
                                    value={formData.clientPhone}
                                    onChange={handleChange}
                                    placeholder="+880..."
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Budget / Est. Income</label>
                            <input
                                type="number"
                                name="income"
                                className="form-input"
                                value={formData.income}
                                onChange={handleChange}
                                placeholder="0.00"
                            />
                        </div>
                        <div className="form-group">
                            <label>Start Date</label>
                            <input
                                type="date"
                                name="startDate"
                                className="form-input"
                                value={formData.startDate}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Status</label>
                            <select
                                name="status"
                                className="form-select"
                                value={formData.status}
                                onChange={handleChange}
                            >
                                <option value="Not Started">Not Started</option>
                                <option value="In Progress">In Progress</option>
                                <option value="On Hold">On Hold</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                name="description"
                                className="form-input"
                                rows="3"
                                value={formData.description}
                                onChange={handleChange}
                            ></textarea>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
                        <button type="submit" className="btn-primary">Save Project</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Projects = () => {
    const { user } = useAuth();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeProjectForTasks, setActiveProjectForTasks] = useState(null);

    const [projects, setProjects] = useState([]);

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            const allProjects = await ProjectService.getAll();
            setProjects(allProjects);
        } catch (error) {
            console.error("Failed to load projects:", error);
        }
    };

    const handleCreate = async (data) => {
        try {
            const payload = {
                ...data,
                income: data.income === '' ? 0 : data.income,
                clientEmail: (data.clientEmail || '').trim() === '' ? null : data.clientEmail.trim(),
                clientPhone: (data.clientPhone || '').trim() === '' ? null : data.clientPhone.trim(),
                description: (data.description || '').trim() === '' ? null : data.description.trim(),
                startDate: data.startDate === '' ? null : data.startDate
            };
            await ProjectService.add(payload);
            setIsFormOpen(false);
            loadProjects();
        } catch (error) {
            console.error("Failed to create project:", error);
            alert(`Failed to save project: ${error.message}`);
        }
    };

    const handleUpdate = async (data) => {
        try {
            const payload = {
                ...data,
                income: data.income === '' ? 0 : data.income,
                clientEmail: (data.clientEmail || '').trim() === '' ? null : data.clientEmail.trim(),
                clientPhone: (data.clientPhone || '').trim() === '' ? null : data.clientPhone.trim(),
                description: (data.description || '').trim() === '' ? null : data.description.trim(),
                startDate: data.startDate === '' ? null : data.startDate
            };
            await ProjectService.update(editingProject.id, payload);
            setEditingProject(null);
            setIsFormOpen(false);
            loadProjects();
        } catch (error) {
            console.error("Failed to update project:", error);
            alert(`Failed to update project: ${error.message}`);
        }
    };

    const handleDelete = async (id) => {
        if (user?.role !== 'admin') {
            alert('Access Denied: Only Administrators can delete projects.');
            return;
        }
        if (confirm('Are you sure you want to delete this project?')) {
            await ProjectService.delete(id);
            loadProjects();
        }
    };

    const openEdit = (project) => {
        setEditingProject(project);
        setIsFormOpen(true);
    };



    const filteredProjects = (projects || []).filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.customId && p.customId.toLowerCase().includes(searchTerm.toLowerCase()))
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
                                placeholder="Search projects..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="btn-primary" onClick={() => { setEditingProject(null); setIsFormOpen(true); }}>
                            <Plus size={20} />
                            New Project
                        </button>
                    </>
                )}
            </div>

            {activeProjectForTasks && (
                <TaskModal
                    project={activeProjectForTasks}
                    onClose={() => setActiveProjectForTasks(null)}
                    onTaskChange={loadProjects}
                />
            )}

            {isFormOpen && (
                <ProjectForm
                    project={editingProject}
                    onSubmit={editingProject ? handleUpdate : handleCreate}
                    onCancel={() => { setIsFormOpen(false); setEditingProject(null); }}
                />
            )}

            <div className="data-table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Project</th>
                            <th>Client</th>
                            <th>Financials (Est / Actual / Remaining)</th>
                            <th>Progress</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProjects.length > 0 ? filteredProjects.map(proj => (
                            <tr key={proj.id}>
                                <td style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{proj.customId}</td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgb(243 244 246 / 10%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <FolderKanban size={16} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 500 }}>{proj.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                                                {new Date(proj.startDate).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td>{proj.client}</td>
                                <td>
                                    <div title="Estimated">Est: {formatCurrency(proj.income)}</div>
                                    <div title="Revenue" style={{ color: 'var(--color-success)' }}>Rev: {formatCurrency(proj.actualIncome)}</div>
                                    <div title="Expenses" style={{ color: 'var(--color-danger)' }}>Exp: {formatCurrency(proj.actualExpenses)}</div>
                                    <div title="Remaining Collection">Rem: {formatCurrency(proj.income - proj.actualIncome)}</div>
                                    <div title="Profit (Rev - Exp)" style={{ fontWeight: 500, color: (proj.actualIncome - proj.actualExpenses) >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                                        Profit: {formatCurrency(proj.actualIncome - proj.actualExpenses)}
                                    </div>
                                </td>
                                <td style={{ width: '150px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                                            <span>{proj.progress}%</span>
                                            <span>{proj.completedTaskCount}/{proj.taskCount} tasks</span>
                                        </div>
                                        <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                                            <div style={{
                                                width: `${proj.progress}%`,
                                                height: '100%',
                                                background: proj.progress === 100 ? '#10b981' : '#3b82f6',
                                                transition: 'width 0.3s ease'
                                            }}></div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span
                                        className="status-badge"
                                        style={{
                                            backgroundColor: proj.status === 'Completed' ? 'rgba(16, 185, 129, 0.2)' :
                                                proj.status === 'In Progress' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(148, 163, 184, 0.2)',
                                            color: proj.status === 'Completed' ? 'var(--color-success)' :
                                                proj.status === 'In Progress' ? '#38bdf8' : 'var(--color-text-secondary)'
                                        }}
                                    >
                                        {proj.status}
                                    </span>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button className="btn-icon" title="Manage Tasks" onClick={() => setActiveProjectForTasks(proj)}>
                                            <ListTodo size={16} />
                                        </button>
                                        <button className="btn-icon" onClick={() => openEdit(proj)}>
                                            <Edit2 size={16} />
                                        </button>
                                        <button className="btn-icon danger" onClick={() => handleDelete(proj.id)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                                    No projects found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

        </div>
    );
};
export default Projects;
