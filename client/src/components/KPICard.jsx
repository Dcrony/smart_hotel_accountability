import React from 'react';

const KPICard = ({ title, value, icon: Icon, color }) => (
    <div className={`p-4 rounded-xl shadow-lg flex items-center justify-between ${color} bg-gray-900/70 border border-gray-800`}>
        <div className="space-y-1">
            <p className="text-sm font-medium text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
        <Icon className="w-8 h-8 opacity-50" />
    </div>
);

export default KPICard;