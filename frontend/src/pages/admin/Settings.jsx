import React, { useState, useEffect } from 'react';
import { Save, CheckCircle, Image as ImageIcon, PaintBucket } from 'lucide-react';
import api from '../../services/api';

const Settings = () => {
    const [settings, setSettings] = useState({
        name: '',
        logo_url: '',
        brand_color: '#2563eb'
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.get('/tenant/settings');
                setSettings(res.data);
            } catch (err) {
                console.error("Failed to load settings");
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (e) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        try {
            await api.put('/tenant/settings', {
                name: settings.name,
                logo_url: settings.logo_url,
                brand_color: settings.brand_color
            });
            setMessage('Settings saved successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage('Failed to save settings.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading settings...</div>;
    }

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Workspace Settings</h1>
                <p className="text-gray-500 mt-2">Customize your white-labeled billing experience.</p>
            </div>

            <div className="card p-8">
                {message && (
                    <div className={`mb-6 p-4 rounded-xl flex items-center ${message.includes('success') ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
                        {message.includes('success') && <CheckCircle className="w-5 h-5 mr-3" />}
                        <p className="font-medium">{message}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Company Profile</h3>
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={settings.name}
                                    onChange={handleChange}
                                    className="input-field"
                                    required
                                />
                                <p className="text-xs text-gray-400 mt-1">This name appears on the public checkout page and inside PDFs.</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Brand Customization</h3>

                        <div className="grid grid-cols-1 gap-8">
                            {/* Logo Row */}
                            <div className="flex items-start gap-6">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                        <ImageIcon className="w-4 h-4 mr-2 text-gray-400" />
                                        Logo URL
                                    </label>
                                    <input
                                        type="url"
                                        name="logo_url"
                                        value={settings.logo_url || ''}
                                        onChange={handleChange}
                                        className="input-field"
                                        placeholder="https://example.com/logo.png"
                                    />
                                    <p className="text-xs text-gray-500 mt-2">This logo will appear on your hosted checkout page and PDF invoices. Must be a direct link to an image.</p>
                                </div>
                                <div className="w-32 h-32 flex-shrink-0 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-4">
                                    {settings.logo_url ? (
                                        <img src={settings.logo_url} alt="Preview" className="max-h-full max-w-full object-contain" />
                                    ) : (
                                        <span className="text-xs text-gray-400 text-center">No Logo Preview</span>
                                    )}
                                </div>
                            </div>

                            {/* Color Row */}
                            <div className="flex items-start gap-6">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                        <PaintBucket className="w-4 h-4 mr-2 text-gray-400" />
                                        Primary Brand Color
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="color"
                                            name="brand_color"
                                            value={settings.brand_color || '#2563eb'}
                                            onChange={handleChange}
                                            className="h-12 w-20 rounded cursor-pointer border-0 p-0"
                                        />
                                        <input
                                            type="text"
                                            name="brand_color"
                                            value={settings.brand_color || '#2563eb'}
                                            onChange={handleChange}
                                            className="input-field flex-1 font-mono uppercase"
                                            placeholder="#2563EB"
                                            pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="btn-primary px-8 flex items-center"
                        >
                            <Save className="w-5 h-5 mr-2" />
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Settings;
