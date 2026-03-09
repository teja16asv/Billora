import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Table from '../../components/Table';
import Badge from '../../components/Badge';
import { Download, CreditCard, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CustomerInvoices = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Pagination & Search State
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page, per_page: 8 });
            if (searchQuery) params.append('search', searchQuery);
            if (statusFilter) params.append('status', statusFilter);

            const res = await api.get(`/invoices?${params.toString()}`);
            setInvoices(res.data.data);
            setTotalPages(res.data.pages);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchInvoices();
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [page, searchQuery, statusFilter]);

    const handleDownload = async (id) => {
        try {
            const res = await api.get(`/invoices/${id}/download`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice-${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (err) {
            alert("Error downloading PDF");
        }
    };

    const columns = [
        { header: 'Invoice #', cell: (row) => <span className="font-medium text-gray-900">{row.invoice_number}</span> },
        { header: 'Amount', cell: (row) => `$${row.amount}` },
        { header: 'Status', cell: (row) => <Badge status={row.status} /> },
        { header: 'Due Date', cell: (row) => row.due_date },
        {
            header: 'Actions',
            cell: (row) => (
                <div className="flex space-x-3">
                    <button onClick={() => handleDownload(row.id)} className="text-gray-500 hover:text-brand transition" title="Download PDF">
                        <Download className="w-5 h-5" />
                    </button>
                    {row.status !== 'PAID' && (
                        <button onClick={() => navigate(`/customer/payment/${row.id}`)} className="text-emerald-600 hover:text-emerald-700 transition" title="Pay Now">
                            <CreditCard className="w-5 h-5" />
                        </button>
                    )}
                </div>
            )
        },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">My Invoices</h1>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search invoices..."
                        className="input-field pl-10"
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                    />
                </div>

                <div className="relative w-48">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Filter className="h-4 w-4 text-gray-400" />
                    </div>
                    <select
                        className="input-field pl-10"
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    >
                        <option value="">All Statuses</option>
                        <option value="PENDING">Pending</option>
                        <option value="PAID">Paid</option>
                        <option value="OVERDUE">Overdue</option>
                    </select>
                </div>
            </div>

            <div className="card relative min-h-[400px]">
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10 rounded-2xl">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
                    </div>
                )}

                <Table columns={columns} data={invoices} keyExtractor={row => row.id} />

                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                        <span className="text-sm text-gray-700">Page <span className="font-medium text-brand">{page}</span> of {totalPages}</span>
                        <div className="flex space-x-2">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50">
                                <ChevronLeft className="w-5 h-5 text-gray-600" />
                            </button>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50">
                                <ChevronRight className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerInvoices;
