import React from 'react';
import { Download, ExternalLink } from 'lucide-react';

const Badge = ({ status }) => {
    const statusMappings = {
        SUCCESS: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200/60', dot: 'bg-emerald-500' },
        PAID: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200/60', dot: 'bg-emerald-500' },
        PENDING: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200/60', dot: 'bg-amber-500' },
        DRAFT: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200/60', dot: 'bg-slate-400' },
        SENT: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200/60', dot: 'bg-blue-500' },
        OVERDUE: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200/60', dot: 'bg-rose-500' },
        FAILED: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200/60', dot: 'bg-rose-500' }
    };

    const defaultMapping = { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200/60', dot: 'bg-gray-400' };
    const style = statusMappings[status?.toUpperCase()] || defaultMapping;

    return (
        <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg border shadow-sm ${style.bg} ${style.text} ${style.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${style.dot} shadow-sm`}></span>
            {status}
        </span>
    );
};

export default Badge;
