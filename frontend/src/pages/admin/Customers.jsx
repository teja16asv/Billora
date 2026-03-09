import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Table from '../../components/Table';
import { Plus, Copy, CheckCheck } from 'lucide-react';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copiedId, setCopiedId] = useState(null);

    // Create Form State
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', address: '' });

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/customers');
            setCustomers(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/customers', formData);
            setFormData({ name: '', email: '', address: '' });
            setShowForm(false);
            fetchCustomers();
        } catch (err) {
            alert("Error creating customer");
        }
    };

    const handleCopy = (id) => {
        navigator.clipboard.writeText(id);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const columns = [
        {
            header: 'ID',
            cell: (row) => (
                <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {row.id.substring(0, 8)}...
                    </span>
                    <button
                        onClick={() => handleCopy(row.id)}
                        className="text-gray-400 hover:text-brand transition-colors p-1"
                        title="Copy full ID"
                    >
                        {copiedId === row.id ? <CheckCheck className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                </div>
            )
        },
        { header: 'Name', cell: (row) => <span className="font-medium text-gray-900">{row.name}</span> },
        { header: 'Email', cell: (row) => row.email },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
                <button className="btn-primary flex items-center" onClick={() => setShowForm(!showForm)}>
                    <Plus className="w-5 h-5 mr-1" /> Add Customer
                </button>
            </div>

            {showForm && (
                <div className="card p-6 mb-6">
                    <h2 className="text-lg font-medium mb-4">Create New Customer</h2>
                    <form className="space-y-4" onSubmit={handleCreate}>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <input required className="input-field mt-1" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input required type="email" className="input-field mt-1" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Address (Optional)</label>
                            <textarea className="input-field mt-1" rows="2" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })}></textarea>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                            <button type="submit" className="btn-primary">Save</button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div>Loading customers...</div>
            ) : (
                <Table columns={columns} data={customers} keyExtractor={row => row.id} />
            )}
        </div>
    );
};

export default Customers;
