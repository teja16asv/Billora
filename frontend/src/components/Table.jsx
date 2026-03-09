import React from 'react';

const Table = ({ columns, data, keyExtractor }) => {
    return (
        <div className="mt-4 flex flex-col">
            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                    <div className="bg-white/70 backdrop-blur-md shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] rounded-2xl border border-white/60 overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-100/60">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    {columns.map((col, idx) => (
                                        <th
                                            key={idx}
                                            scope="col"
                                            className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                                        >
                                            {col.header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100/60 bg-transparent">
                                {data.map((row, rowIdx) => (
                                    <tr
                                        key={keyExtractor ? keyExtractor(row) : rowIdx}
                                        className="hover:bg-brand-light/10 transition-colors duration-150"
                                    >
                                        {columns.map((col, colIdx) => (
                                            <td key={colIdx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {col.cell(row)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {data.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                                    <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                    </svg>
                                </div>
                                <h3 className="text-sm font-medium text-gray-900 mb-1">No records found</h3>
                                <p className="text-sm text-gray-500">Get started by creating a new entry.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Table;
