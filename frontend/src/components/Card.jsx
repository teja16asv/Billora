import React from 'react';

const Card = ({ title, value, icon, subtitle, trend }) => {
    return (
        <div className="card card-hover p-6 relative overflow-hidden group">
            {/* Decorative gradient blob behind the card content */}
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br from-brand-light/40 to-primary-100/40 blur-2xl group-hover:scale-110 transition-transform duration-500"></div>

            <div className="relative z-10 flex items-start justify-between">
                <div>
                    <p className="text-sm font-semibold text-gray-500 tracking-wide uppercase">{title}</p>
                    <div className="mt-3 flex items-baseline">
                        <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-gray-900 to-gray-600">{value}</p>
                    </div>
                </div>

                {icon && (
                    <div className="p-3.5 rounded-2xl bg-gradient-to-br from-white to-gray-50 shadow-sm border border-gray-100 text-brand">
                        {icon}
                    </div>
                )}
            </div>

            {(subtitle || trend) && (
                <div className="mt-5 relative z-10 flex border-t border-gray-100/50 pt-4">
                    {trend && (
                        <span className={`inline-flex items-center text-sm font-medium mr-2 ${trend > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                        </span>
                    )}
                    <p className="text-sm text-gray-400">{subtitle}</p>
                </div>
            )}
        </div>
    );
};

export default Card;
