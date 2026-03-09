import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Card from '../../components/Card';
import Table from '../../components/Table';
import Badge from '../../components/Badge';
import { Users, FileText, DollarSign, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, invRes] = await Promise.all([
                    api.get('/dashboard/stats'),
                    api.get('/invoices?per_page=5')
                ]);
                setStats(statsRes.data);
                // Adjust for new pagination format {"data": [...]}
                setInvoices(invRes.data.data || []);
            } catch (err) {
                console.error("Dashboard fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading dashboard metrics...</div>;

    const columns = [
        { header: 'Invoice Number', cell: (row) => <span className="font-medium text-gray-900">{row.invoice_number}</span> },
        { header: 'Amount', cell: (row) => `$${row.amount}` },
        { header: 'Status', cell: (row) => <Badge status={row.status} /> },
        { header: 'Due Date', cell: (row) => row.due_date },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card title="Total Customers" value={stats?.customers || 0} icon={<Users className="w-6 h-6" />} />
                <Card title="Total Invoices" value={stats?.invoices?.total || 0} icon={<FileText className="w-6 h-6" />} subtitle={`${stats?.invoices?.overdue || 0} overdue`} />
                <Card title="Revenue Collected" value={`$${stats?.revenue?.total_collected?.toFixed(2) || '0.00'}`} icon={<DollarSign className="w-6 h-6 text-emerald-600" />} />
                <Card title="Outstanding Revenue" value={`$${stats?.revenue?.outstanding?.toFixed(2) || '0.00'}`} icon={<Activity className="w-6 h-6 text-amber-600" />} />
            </div>

            {/* Analytics Chart */}
            <div className="card p-6 border border-gray-100 mt-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Revenue Overview (Last 7 Days)</h2>
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats?.chart_data || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} tickFormatter={(value) => `$${value}`} dx={-10} />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                                formatter={(value) => [`$${value}`, 'Revenue']}
                            />
                            <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="mt-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Invoices</h2>
                <Table columns={columns} data={invoices} keyExtractor={(row) => row.id} />
            </div>
        </div>
    );
};

export default AdminDashboard;
