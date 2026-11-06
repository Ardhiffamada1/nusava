'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { History, ShieldAlert } from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { formatDateTime } from '@commerceos/ui';

export default function AdminAuditLogsPage() {
  const { data: logsData, isLoading } = useQuery({
    queryKey: ['admin-audit-logs'],
    queryFn: () => apiRequest<{ items: any[]; meta: any }>('/audit-logs?limit=50'),
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Audit Trail Ledger</h1>
          <p className="text-xs text-gray-500 mt-1">
            Immutable audit records of administrative operations and inventory updates.
          </p>
        </div>
        <span className="text-xs font-semibold text-gray-500 bg-white border border-[#E5E7EB] px-3 py-1.5 rounded-xl shadow-2xs">
          {logsData?.meta?.total ?? 0} Recorded Actions
        </span>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#F0F0F2] font-semibold text-gray-500">
                <th className="py-4 pl-6 pr-3">Timestamp</th>
                <th className="py-4 px-3">Action</th>
                <th className="py-4 px-3">Entity</th>
                <th className="py-4 px-3">Actor</th>
                <th className="py-4 pr-6 pl-3">Metadata Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F4F6]">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    Loading audit trail...
                  </td>
                </tr>
              ) : logsData?.items?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-gray-400">
                    No audit records logged yet.
                  </td>
                </tr>
              ) : (
                logsData?.items?.map((log) => (
                  <tr key={log.id} className="hover:bg-[#FBFBFD] transition-colors">
                    <td className="py-3.5 pl-6 pr-3 font-mono text-[11px] text-gray-400">
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="font-mono text-[10px] font-semibold text-gray-800 uppercase bg-gray-100 px-2 py-0.5 rounded-md">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="font-medium text-gray-700">
                        {log.entityType} ({log.entityId.slice(0, 8)}...)
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="text-gray-900 font-medium">
                        {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System Engine'}
                      </span>
                      {log.user?.email && (
                        <span className="text-[10px] text-gray-400 block font-mono">
                          {log.user.email}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 pr-6 pl-3 font-mono text-[11px] text-gray-500 max-w-xs truncate">
                      {log.metadata ? JSON.stringify(log.metadata) : '—'}
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
}
