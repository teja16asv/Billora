import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { UploadCloud, FileType, CheckCircle } from 'lucide-react';

const UsageUpload = () => {
    const [customers, setCustomers] = useState([]);

    // Manual Entry
    const [formData, setFormData] = useState({
        customer_id: '',
        metric_name: 'API_CALLS',
        quantity: '',
        amount: ''
    });

    // File Upload Options
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        api.get('/customers').then(res => setCustomers(res.data)).catch(console.error);
    }, []);

    const handleManualUpload = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/usage/upload', [formData]);
            setFormData({ ...formData, quantity: '', amount: '' });
            alert("Manual usage mapped successfully.");
        } catch (err) {
            alert("Error uploading manual usage.");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleFileUpload = async () => {
        if (!file) return;
        setLoading(true);
        try {
            const formDataPayload = new FormData();
            formDataPayload.append('file', file);

            await api.post('/usage/upload', formDataPayload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert("CSV uploaded successfully!");
            setFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (err) {
            alert(err?.response?.data?.error || "Error uploading CSV.");
        } finally {
            setLoading(false);
        }
    };

    const triggerInvoiceGeneration = async () => {
        if (!confirm("Are you sure? This will convert all unbilled usage records into Draft/Sent invoices.")) return;
        setGenerating(true);
        try {
            const res = await api.post('/invoices');
            alert(res.data.message);
        } catch (err) {
            alert(err?.response?.data?.message || "Error generating invoices");
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Upload Usage Data</h1>
                    <p className="text-gray-500 text-sm mt-1">Map unbilled customer usage prior to the invoicing cycle.</p>
                </div>
                <button
                    className="bg-brand hover:bg-brand-dark text-white px-5 py-2.5 rounded-xl font-medium shadow-md transition-colors flex items-center shadow-brand-hover"
                    onClick={triggerInvoiceGeneration}
                    disabled={generating}
                >
                    {generating ? 'Processing Cycle...' : 'Generate Billing Cycle'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">

                {/* CSV File Upload Section */}
                <div className="card p-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Bulk Upload via CSV</h2>

                    <div
                        className="border-2 border-dashed border-gray-300 rounded-2xl p-10 flex flex-col items-center justify-center text-center bg-gray-50 hover:bg-brand-light/10 transition-colors cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            type="file"
                            accept=".csv"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                        />

                        {file ? (
                            <div className="flex flex-col items-center">
                                <FileType className="w-12 h-12 text-brand mb-3" />
                                <span className="text-gray-900 font-medium">{file.name}</span>
                                <span className="text-sm text-gray-500 mt-1">{(file.size / 1024).toFixed(2)} KB</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <UploadCloud className="w-12 h-12 text-gray-400 mb-3" />
                                <span className="text-gray-900 font-medium">Click to upload or drag and drop</span>
                                <span className="text-sm text-gray-500 mt-1">.CSV files only (customer_id, metric, qty, amt)</span>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleFileUpload}
                        disabled={!file || loading}
                        className="btn-primary w-full mt-6"
                    >
                        {loading && file ? 'Uploading...' : 'Upload CSV Records'}
                    </button>
                </div>

                {/* Manual Entry Section */}
                <div className="card p-8 bg-glass-gradient relative overflow-hidden">
                    {/* Decorative Blob */}
                    <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-brand/10 rounded-full blur-3xl pointer-events-none"></div>

                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Manual Log Entry</h2>
                    <form className="space-y-5" onSubmit={handleManualUpload}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Select Customer</label>
                            <select required className="input-field" value={formData.customer_id} onChange={e => setFormData({ ...formData, customer_id: e.target.value })}>
                                <option value="">-- Search Customer --</option>
                                {customers.map(c => (
                                    <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Metric Code</label>
                                <input required className="input-field" value={formData.metric_name} onChange={e => setFormData({ ...formData, metric_name: e.target.value })} placeholder="e.g. API_CALLS" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                                <input required type="number" step="1" min="1" className="input-field" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Billed Amount ($)</label>
                            <input required type="number" step="0.01" min="0" className="input-field" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} />
                        </div>

                        <button type="submit" disabled={loading} className="btn-secondary w-full relative group overflow-hidden">
                            <span className="relative z-10 flex items-center justify-center">
                                {loading && !file ? 'Logging...' : 'Append Record'}
                                {!loading && !file && <CheckCircle className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />}
                            </span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UsageUpload;
