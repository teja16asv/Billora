import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { CreditCard, CheckCircle, FileText, Building2 } from 'lucide-react';

// Isolated standard axios instance since this page doesn't use the JWT interceptor
const publicApi = axios.create({
    baseURL: 'http://localhost:5000/api/v1',
    headers: { 'Content-Type': 'application/json' },
});

// Simple hook to inject Razorpay script
const useRazorpayLoader = () => {
    const [loaded, setLoaded] = useState(false);
    useEffect(() => {
        if (document.getElementById('razorpay-sdk')) {
            setLoaded(true);
            return;
        }
        const script = document.createElement('script');
        script.id = 'razorpay-sdk';
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => setLoaded(true);
        document.body.appendChild(script);
    }, []);
    return loaded;
};

const PublicPayment = () => {
    const { id } = useParams();
    const isScriptLoaded = useRazorpayLoader();

    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    useEffect(() => {
        const fetchPublicInvoice = async () => {
            try {
                const res = await publicApi.get(`/public/invoices/${id}`);
                setInvoice(res.data);
            } catch (err) {
                setError(err.response?.data?.error || "Unable to fetch invoice details. Link may be invalid.");
            } finally {
                setLoading(false);
            }
        };
        fetchPublicInvoice();
    }, [id]);

    const initializePayment = async () => {
        if (!isScriptLoaded) return alert('Razorpay SDK failed to load');

        setProcessing(true);
        try {
            // Request an Order ID via the public unauthenticated endpoint
            const res = await publicApi.post('/public/payments/create-order', { invoice_id: id });
            const { order_id, amount, currency } = res.data;

            // Define Razorpay options
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_exampleKey',
                amount: amount * 100, // Paise
                currency: currency,
                name: invoice.company_name, // E.g., ABC Company
                description: `Payment for Invoice ${invoice.invoice_number}`,
                order_id: order_id,
                handler: async function (response) {
                    try {
                        // Note: A public-facing verification endpoint should be built for real production.
                        // For the Sandbox demo, the backend webhooks handle the status update asynchronously.
                        alert('Payment processing... The gateway has authorized the transaction!');
                        setPaymentSuccess(true);
                    } catch (err) {
                        alert('Payment callback failed.');
                    }
                },
                prefill: {
                    name: invoice.customer_name
                },
                theme: {
                    color: "#2563eb"
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            alert(err.response?.data?.error || "Error initializing checkout");
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex bg-gray-50 min-h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
            </div>
        );
    }

    if (error && !paymentSuccess) {
        return (
            <div className="flex bg-gray-50 min-h-screen items-center justify-center p-4">
                <div className="card p-8 max-w-md w-full text-center border-t-4 border-red-500">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    if (paymentSuccess) {
        return (
            <div className="flex bg-gray-50 min-h-screen items-center justify-center p-4">
                <div className="card p-12 max-w-lg w-full flex flex-col items-center text-center">
                    <CheckCircle className="w-20 h-20 text-emerald-500 mb-6" />
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful</h1>
                    <p className="text-gray-600 mb-8">Thank you, {invoice.customer_name}. Your payment for invoice <strong>{invoice.invoice_number}</strong> has been processed to {invoice.company_name}.</p>
                    <p className="text-sm text-gray-500 italic">You may now close this window.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex bg-gray-50 min-h-screen items-center justify-center p-4 font-sans">
            <div className="card max-w-lg w-full overflow-hidden">
                <div className="top-0 w-full h-3" style={{ backgroundColor: invoice.brand_color || '#2563eb' }}></div>
                <div className="p-8">
                    <div className="flex justify-center mb-6">
                        {invoice.logo_url ? (
                            <img src={invoice.logo_url} alt={`${invoice.company_name} logo`} className="h-16 object-contain" />
                        ) : (
                            <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center">
                                <Building2 className="w-8 h-8" style={{ color: invoice.brand_color || '#2563eb' }} />
                            </div>
                        )}
                    </div>

                    <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">{invoice.company_name}</h1>
                    <p className="text-center text-gray-500 mb-8">Secure Invoice Checkout</p>

                    <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-100">
                        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                            <span className="text-gray-600">Billed To</span>
                            <span className="font-medium text-gray-900">{invoice.customer_name}</span>
                        </div>
                        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                            <span className="text-gray-600">Invoice Number</span>
                            <div className="flex items-center">
                                <FileText className="w-4 h-4 text-gray-400 mr-2" />
                                <span className="font-medium text-gray-900">{invoice.invoice_number}</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Total Amount Due</span>
                            <span className="text-3xl font-bold" style={{ color: invoice.brand_color || '#2563eb' }}>${invoice.amount}</span>
                        </div>
                    </div>

                    <button
                        className="btn-primary w-full text-lg py-4 flex items-center justify-center gap-3 disabled:opacity-50 border-none text-white"
                        style={{ backgroundColor: invoice.status === 'PAID' ? '#9ca3af' : (invoice.brand_color || '#2563eb') }}
                        onClick={initializePayment}
                        disabled={processing || !isScriptLoaded || invoice.status === 'PAID'}
                    >
                        <CreditCard className="w-6 h-6" />
                        {invoice.status === 'PAID' ? 'Already Paid' : (processing ? 'Connecting Gateway...' : 'Pay Securely Now')}
                    </button>

                    <p className="text-xs text-center text-gray-400 mt-6 flex justify-center items-center gap-1">
                        🔒 Secured by Razorpay 256-bit encryption
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PublicPayment;
