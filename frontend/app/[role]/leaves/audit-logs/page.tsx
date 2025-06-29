'use client';
import React, { useState } from 'react';
import { useGetAuditLogsQuery, useRollbackAuditLogMutation } from '@/store/api';

interface AuditLog {
  _id: string;
  action: string;
  entityType: string;
  entityId: string;
  changedBy: string;
  timestamp: string;
  oldValue: Record<string, unknown>;
  newValue: Record<string, unknown>;
  details?: string;
}

const actions = ['', 'create', 'update', 'delete', 'reset', 'import', 'rollback'];
const entityTypes = ['', 'LeaveQuota', 'LeaveType'];

const AuditLogsPage = () => {
  const [filters, setFilters] = useState({ action: '', entityType: '', user: '', entityId: '', from: '', to: '' });
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showDiff, setShowDiff] = useState(false);
  const [rollbackError, setRollbackError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // RTK Query hooks
  const { data: auditData, isLoading: loading, error, refetch } = useGetAuditLogsQuery(filters);
  const [rollbackAuditLog, { isLoading: rollbacking }] = useRollbackAuditLogMutation();

  const logs = auditData?.logs || [];

  const handleRollback = async (log: AuditLog) => {
    setRollbackError(null);
    setSuccessMsg(null);
    try {
      await rollbackAuditLog(log._id).unwrap();
      setSuccessMsg('Rollback successful!');
      refetch();
    } catch (err: unknown) {
      setRollbackError(err instanceof Error ? err.message : 'Rollback failed');
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-indigo-800">Audit Logs</h1>
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4 items-end">
        <select value={filters.action} onChange={e => setFilters(f => ({ ...f, action: e.target.value }))} className="border rounded px-2 py-1">
          {actions.map(a => <option key={a} value={a}>{a || 'All Actions'}</option>)}
        </select>
        <select value={filters.entityType} onChange={e => setFilters(f => ({ ...f, entityType: e.target.value }))} className="border rounded px-2 py-1">
          {entityTypes.map(t => <option key={t} value={t}>{t || 'All Entities'}</option>)}
        </select>
        <input placeholder="User ID" value={filters.user} onChange={e => setFilters(f => ({ ...f, user: e.target.value }))} className="border rounded px-2 py-1" />
        <input placeholder="Entity ID" value={filters.entityId} onChange={e => setFilters(f => ({ ...f, entityId: e.target.value }))} className="border rounded px-2 py-1" />
        <input type="date" value={filters.from} onChange={e => setFilters(f => ({ ...f, from: e.target.value }))} className="border rounded px-2 py-1" />
        <input type="date" value={filters.to} onChange={e => setFilters(f => ({ ...f, to: e.target.value }))} className="border rounded px-2 py-1" />
        <button className="bg-indigo-600 text-white px-4 py-1 rounded font-semibold" onClick={refetch}>Filter</button>
      </div>
      {loading ? <div className="text-gray-500">Loading...</div> : error ? <div className="text-red-500">{error.message}</div> : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead>
              <tr className="text-xs text-gray-500 uppercase">
                <th>Action</th>
                <th>Entity</th>
                <th>User</th>
                <th>Time</th>
                <th>Details</th>
                <th>Diff</th>
                <th>Rollback</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log._id} className="border-b border-gray-200">
                  <td>{log.action}</td>
                  <td>{log.entityType} <span className="text-xs text-gray-400">{log.entityId}</span></td>
                  <td>{log.changedBy}</td>
                  <td>{new Date(log.timestamp).toLocaleString()}</td>
                  <td>{log.details}</td>
                  <td>
                    <button className="text-indigo-600 underline text-xs" onClick={() => { setSelectedLog(log); setShowDiff(true); }}>View</button>
                  </td>
                  <td>
                    {['update', 'create'].includes(log.action) && (log.entityType === 'LeaveQuota' || log.entityType === 'LeaveType') ? (
                      <button className="bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold" disabled={rollbacking} onClick={() => handleRollback(log)}>Rollback</button>
                    ) : <span className="text-gray-400 text-xs">N/A</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {rollbackError && <div className="text-red-500 mt-2">{rollbackError}</div>}
      {successMsg && <div className="text-green-600 mt-2">{successMsg}</div>}
      {/* Diff Modal */}
      {showDiff && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
            <h3 className="font-bold mb-2">Change Diff</h3>
            <div className="mb-2">
              <strong>Old Value:</strong>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">{JSON.stringify(selectedLog.oldValue, null, 2)}</pre>
            </div>
            <div className="mb-2">
              <strong>New Value:</strong>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">{JSON.stringify(selectedLog.newValue, null, 2)}</pre>
            </div>
            <button className="bg-gray-300 px-4 py-1 rounded font-semibold mt-2" onClick={() => setShowDiff(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogsPage; 