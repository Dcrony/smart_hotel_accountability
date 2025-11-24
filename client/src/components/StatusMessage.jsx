import React from 'react';
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react';

const StatusMessage = ({ type, message }) => {
    if (!message) return null;

    let Icon = RefreshCw;
    let bgColor = 'bg-blue-600';
    
    if (type === 'success') { Icon = CheckCircle; bgColor = 'bg-green-600'; }
    if (type === 'error') { Icon = XCircle; bgColor = 'bg-red-600'; }

    return (
        <div className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-xl flex items-center space-x-3 ${bgColor} text-white transition-all duration-300 z-50`}>
            {type === 'loading' ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Icon className="w-5 h-5" />}
            <p className="font-medium">{message}</p>
        </div>
    );
};

export default StatusMessage;