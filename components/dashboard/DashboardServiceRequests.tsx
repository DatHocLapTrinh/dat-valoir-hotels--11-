import React, { useState } from 'react';
import { useBooking } from '../../context/BookingContext';
import { Clock, CheckCircle, XCircle, AlertCircle, Filter, Search } from 'lucide-react';

const DashboardServiceRequests: React.FC = () => {
  const { serviceRequests, updateServiceRequestStatus } = useBooking();
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRequests = serviceRequests.filter(req => {
    const matchesStatus = filterStatus === 'ALL' || req.status === filterStatus;
    const matchesSearch = req.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          req.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          req.details.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  }).sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock size={16} className="text-yellow-500" />;
      case 'IN_PROGRESS': return <AlertCircle size={16} className="text-blue-500" />;
      case 'COMPLETED': return <CheckCircle size={16} className="text-green-500" />;
      case 'CANCELLED': return <XCircle size={16} className="text-red-500" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'IN_PROGRESS': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'COMPLETED': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'CANCELLED': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-['Playfair_Display'] text-white">Service Requests</h2>
        
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search room, type, details..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 bg-[#111] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-yellow-500/50 transition-colors"
            />
          </div>
          
          <div className="flex items-center gap-2 bg-[#111] border border-white/10 rounded-lg p-1">
            <Filter size={16} className="text-gray-400 ml-2" />
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent text-sm text-white border-none focus:outline-none py-1 pr-2 cursor-pointer"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-[#111] border border-white/5 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#1a1a1a] text-gray-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">Room</th>
                <th className="px-6 py-4 font-medium">Service Type</th>
                <th className="px-6 py-4 font-medium">Details</th>
                <th className="px-6 py-4 font-medium">Requested At</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No service requests found.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-medium text-white">{req.roomNumber}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-300 capitalize">{req.serviceType}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-400 max-w-xs truncate" title={req.details}>
                        {req.details}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {new Date(req.requestedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(req.status)}`}>
                        {getStatusIcon(req.status)}
                        {req.status?.replace('_', ' ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <select
                        value={req.status}
                        onChange={(e) => updateServiceRequestStatus(req.id, e.target.value as any)}
                        className="bg-[#1a1a1a] border border-white/10 text-white text-xs rounded px-2 py-1 focus:outline-none focus:border-yellow-500/50"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardServiceRequests;
