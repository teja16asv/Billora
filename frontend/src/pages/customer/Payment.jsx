import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

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

const Payment = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isScriptLoaded = useRazorpayLoader();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const initializePayment = async () => {
        if (!isScriptLoaded) return alert('Razorpay SDK failed to load');

        setLoading(true);
        try {
            // Request an Order ID from our backend
            const res = await api.post('/payments/create-order', { invoice_id: id });
            const { order_id, amount, currency } = res.data;

            // Define Razorpay options
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_exampleKey', // Safe public key
                amount: amount * 100, // Amount is in currency subunits (Paise)
                currency: currency,
                name: 'SaaSBilling Company',
                description: 'Invoice Payment',
                order_id: order_id,
                handler: async function (response) {
                    try {
                        // Forward Razorpay verification data to our webhook/verify endpoint
                        const verificationRes = await api.post('/payments/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });
                        alert('Payment Successful!');
                        navigate('/customer/invoices');
                    } catch (err) {
                        alert('Payment verification failed.');
                    }
                },
                prefill: {
                    name: "Customer Name",
                    email: "customer@example.com"
                },
                theme: {
                    color: "#2563eb" // Tailwind primary-600
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            setError(err.response?.data?.error || "Error initializing checkout");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center p-12">
            <div className="card p-8 max-w-md w-full text-center">
                <h1 className="text-2xl font-bold mb-4">Secure Checkout</h1>
                <p className="text-gray-600 mb-8">You are about to pay Invoice #{id}. Click the button below when you are ready.</p>
                {error && <p className="text-red-600 mb-4">{error}</p>}

                <button
                    className="btn-primary w-full text-lg py-3 flex items-center justify-center disabled:opacity-50"
                    onClick={initializePayment}
                    disabled={loading || !isScriptLoaded}
                >
                    {loading ? 'Initializing Secure Gateway...' : '💳 Pay Now'}
                </button>
            </div>
        </div>
    );
};

export default Payment;
