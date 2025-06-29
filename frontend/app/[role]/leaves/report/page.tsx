'use client';
import React from 'react';
import { useGetLeaveReportQuery } from '@/store/api';
import dynamic from 'next/dynamic';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Types for leave report data
interface LeaveTypeReport {
  leaveType: string;
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  cancelled: number;
}

interface UserReport {
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  cancelled: number;
}

const { useRef } = React;
const Chart = dynamic(() => import('react-chartjs-2').then(mod => mod.Bar), { ssr: false });

const AdminLeaveReport = () => {
  const { data, isLoading, error } = useGetLeaveReportQuery();
  const chartRef = useRef(null);

  // Export CSV
  const exportCSV = (rows: any[], columns: string[], filename: string) => {
    const csv = [columns.join(',')].concat(rows.map(r => columns.map(c => r[c]).join(','))).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    saveAs(blob, filename);
  };
  // Export PDF
  const exportPDF = (rows: any[], columns: string[], filename: string) => {
    const doc = new jsPDF();
    autoTable(doc, { head: [columns], body: rows.map(r => columns.map(c => r[c])) });
    doc.save(filename);
  };

  // Chart data
  const byTypeChart = data?.byType ? {
    labels: data.byType.map((t: any) => t.leaveType),
    datasets: [
      { label: 'Total', data: data.byType.map((t: any) => t.total), backgroundColor: '#6366f1' },
      { label: 'Approved', data: data.byType.map((t: any) => t.approved), backgroundColor: '#22c55e' },
      { label: 'Pending', data: data.byType.map((t: any) => t.pending), backgroundColor: '#eab308' },
      { label: 'Rejected', data: data.byType.map((t: any) => t.rejected), backgroundColor: '#ef4444' },
      { label: 'Cancelled', data: data.byType.map((t: any) => t.cancelled), backgroundColor: '#6b7280' },
    ]
  } : null;

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-indigo-800">Leave Reports & Statistics</h1>
      {isLoading ? (
        <div className="text-gray-500">Loading...</div>
      ) : error ? (
        <div className="text-red-500">Error loading report</div>
      ) : (
        <>
          {/* Summary */}
          <div className="bg-white rounded-xl shadow p-4 mb-6">
            <h2 className="text-lg font-semibold mb-2">Summary</h2>
            <div className="flex gap-6">
              <div className="font-bold text-indigo-700">Total: {data.summary.total}</div>
              <div className="font-bold text-green-600">Approved: {data.summary.approved}</div>
              <div className="font-bold text-yellow-600">Pending: {data.summary.pending}</div>
              <div className="font-bold text-red-600">Rejected: {data.summary.rejected}</div>
              <div className="font-bold text-gray-600">Cancelled: {data.summary.cancelled}</div>
            </div>
          </div>
          {/* By Leave Type - Chart & Export */}
          <div className="bg-white rounded-xl shadow p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">By Leave Type</h2>
              <div className="flex gap-2">
                <button className="bg-indigo-600 text-white px-3 py-1 rounded text-xs font-semibold" onClick={() => exportCSV(data.byType, ['leaveType','total','approved','pending','rejected','cancelled'], 'leave-by-type.csv')}>Export CSV</button>
                <button className="bg-indigo-600 text-white px-3 py-1 rounded text-xs font-semibold" onClick={() => exportPDF(data.byType, ['leaveType','total','approved','pending','rejected','cancelled'], 'leave-by-type.pdf')}>Export PDF</button>
              </div>
            </div>
            {byTypeChart && <Chart data={byTypeChart} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />}
            <table className="min-w-full text-sm text-left mt-4">
              <thead>
                <tr className="text-xs text-gray-500 uppercase">
                  <th className="py-2">Type</th>
                  <th>Total</th>
                  <th>Approved</th>
                  <th>Pending</th>
                  <th>Rejected</th>
                  <th>Cancelled</th>
                </tr>
              </thead>
              <tbody>
                {data.byType.map((t: LeaveTypeReport, idx: number) => (
                  <tr key={t.leaveType ? t.leaveType + '-' + idx : idx} className="border-b border-gray-200">
                    <td className="py-2 font-semibold">{t.leaveType}</td>
                    <td>{t.total}</td>
                    <td className="text-green-600 font-bold">{t.approved}</td>
                    <td className="text-yellow-600 font-bold">{t.pending}</td>
                    <td className="text-red-600 font-bold">{t.rejected}</td>
                    <td className="text-gray-600 font-bold">{t.cancelled}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* By User - Export */}
          <div className="bg-white rounded-xl shadow p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">By User</h2>
              <div className="flex gap-2">
                <button className="bg-indigo-600 text-white px-3 py-1 rounded text-xs font-semibold" onClick={() => exportCSV(data.byUser, ['user','total','approved','pending','rejected','cancelled'], 'leave-by-user.csv')}>Export CSV</button>
                <button className="bg-indigo-600 text-white px-3 py-1 rounded text-xs font-semibold" onClick={() => exportPDF(data.byUser, ['user','total','approved','pending','rejected','cancelled'], 'leave-by-user.pdf')}>Export PDF</button>
              </div>
            </div>
            <table className="min-w-full text-sm text-left">
              <thead>
                <tr className="text-xs text-gray-500 uppercase">
                  <th className="py-2">User</th>
                  <th>Total</th>
                  <th>Approved</th>
                  <th>Pending</th>
                  <th>Rejected</th>
                  <th>Cancelled</th>
                </tr>
              </thead>
              <tbody>
                {data.byUser.map((u: UserReport, idx: number) => (
                  <tr key={u.user && u.user.email ? u.user.email + '-' + idx : idx} className="border-b border-gray-200">
                    <td className="py-2 font-semibold">{u.user.firstName} {u.user.lastName} <span className="text-xs text-gray-400">({u.user.email})</span></td>
                    <td>{u.total}</td>
                    <td className="text-green-600 font-bold">{u.approved}</td>
                    <td className="text-yellow-600 font-bold">{u.pending}</td>
                    <td className="text-red-600 font-bold">{u.rejected}</td>
                    <td className="text-gray-600 font-bold">{u.cancelled}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminLeaveReport; 