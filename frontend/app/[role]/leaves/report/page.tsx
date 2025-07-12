'use client';
import React, { useState, useEffect } from 'react';
import { useGetLeaveReportQuery, useGetLeaveQuotasQuery, useGetAllLeaveRequestsQuery } from '@/store/api';
import dynamic from 'next/dynamic';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement, ArcElement } from 'chart.js';
import dayjs from 'dayjs';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement, ArcElement);

// Types for enhanced leave report data
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

interface DepartmentReport {
  department: string;
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  cancelled: number;
  avgApprovalTime: number;
}

interface MonthlyTrend {
  month: string;
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  cancelled: number;
}

const { useRef } = React;
const Chart = dynamic(() => import('react-chartjs-2').then(mod => mod.Bar), { ssr: false });
const LineChart = dynamic(() => import('react-chartjs-2').then(mod => mod.Line), { ssr: false });
const DoughnutChart = dynamic(() => import('react-chartjs-2').then(mod => mod.Doughnut), { ssr: false });

const AdminLeaveReport = () => {
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [viewMode, setViewMode] = useState<'summary' | 'detailed' | 'trends' | 'compliance'>('summary');
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf' | 'excel'>('csv');
  
  const { data, isLoading, error, refetch } = useGetLeaveReportQuery();
  const { data: quotasData } = useGetLeaveQuotasQuery({ year: new Date().getFullYear() });
  const { data: leaveRequests } = useGetAllLeaveRequestsQuery({ 
    startDate: dateRange.start, 
    endDate: dateRange.end,
    status: selectedStatus 
  });
  
  const chartRef = useRef(null);

  // Set default date range to current year
  useEffect(() => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    setDateRange({
      start: startOfYear.toISOString().split('T')[0],
      end: now.toISOString().split('T')[0]
    });
  }, []);

  // Export functions
  const exportCSV = (rows: any[], columns: string[], filename: string) => {
    const csv = [columns.join(',')].concat(rows.map(r => columns.map(c => r[c]).join(','))).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    saveAs(blob, filename);
  };

  const exportPDF = (rows: any[], columns: string[], filename: string) => {
    const doc = new jsPDF();
    autoTable(doc, { head: [columns], body: rows.map(r => columns.map(c => r[c])) });
    doc.save(filename);
  };

  const exportExcel = (rows: any[], columns: string[], filename: string) => {
    // For now, export as CSV with .xlsx extension
    const csv = [columns.join(',')].concat(rows.map(r => columns.map(c => r[c]).join(','))).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    saveAs(blob, filename.replace('.xlsx', '.csv'));
  };

  const handleExport = (data: any[], columns: string[], filename: string) => {
    switch (exportFormat) {
      case 'csv':
        exportCSV(data, columns, `${filename}.csv`);
        break;
      case 'pdf':
        exportPDF(data, columns, `${filename}.pdf`);
        break;
      case 'excel':
        exportExcel(data, columns, `${filename}.xlsx`);
        break;
    }
  };

  // Enhanced chart data
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

  // Monthly trends chart
  const monthlyTrendsChart = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      { label: 'Total Requests', data: [12, 19, 15, 25, 22, 30, 28, 35, 32, 40, 38, 45], borderColor: '#6366f1', backgroundColor: 'rgba(99, 102, 241, 0.1)' },
      { label: 'Approved', data: [10, 15, 12, 20, 18, 25, 22, 28, 25, 32, 30, 35], borderColor: '#22c55e', backgroundColor: 'rgba(34, 197, 94, 0.1)' },
    ]
  };

  // Status distribution pie chart
  const statusDistributionChart = {
    labels: ['Approved', 'Pending', 'Rejected', 'Cancelled'],
    datasets: [{
      data: [data?.summary?.approved || 0, data?.summary?.pending || 0, data?.summary?.rejected || 0, data?.summary?.cancelled || 0],
      backgroundColor: ['#22c55e', '#eab308', '#ef4444', '#6b7280'],
    }]
  };

  // Mock department data (replace with real data from backend)
  const departmentData: DepartmentReport[] = [
    { department: 'Engineering', total: 45, approved: 38, pending: 5, rejected: 1, cancelled: 1, avgApprovalTime: 2.3 },
    { department: 'Sales', total: 32, approved: 28, pending: 3, rejected: 1, cancelled: 0, avgApprovalTime: 1.8 },
    { department: 'Marketing', total: 28, approved: 24, pending: 3, rejected: 1, cancelled: 0, avgApprovalTime: 2.1 },
    { department: 'HR', total: 15, approved: 13, pending: 2, rejected: 0, cancelled: 0, avgApprovalTime: 1.5 },
  ];

  // Mock monthly trends (replace with real data from backend)
  const monthlyTrends: MonthlyTrend[] = [
    { month: 'Jan', total: 12, approved: 10, pending: 2, rejected: 0, cancelled: 0 },
    { month: 'Feb', total: 19, approved: 15, pending: 3, rejected: 1, cancelled: 0 },
    { month: 'Mar', total: 15, approved: 12, pending: 2, rejected: 1, cancelled: 0 },
    { month: 'Apr', total: 25, approved: 20, pending: 4, rejected: 1, cancelled: 0 },
    { month: 'May', total: 22, approved: 18, pending: 3, rejected: 1, cancelled: 0 },
    { month: 'Jun', total: 30, approved: 25, pending: 4, rejected: 1, cancelled: 0 },
  ];

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-indigo-800">Leave Reports & Analytics</h1>
        <div className="flex gap-2">
          <select 
            value={exportFormat} 
            onChange={(e) => setExportFormat(e.target.value as 'csv' | 'pdf' | 'excel')}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="csv">CSV</option>
            <option value="pdf">PDF</option>
            <option value="excel">Excel</option>
          </select>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold mb-1">Date Range</label>
            <div className="flex gap-2">
              <input 
                type="date" 
                value={dateRange.start} 
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="border rounded px-2 py-1 text-sm"
              />
              <span className="self-center">to</span>
              <input 
                type="date" 
                value={dateRange.end} 
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="border rounded px-2 py-1 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Department</label>
            <select 
              value={selectedDepartment} 
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="">All Departments</option>
              <option value="engineering">Engineering</option>
              <option value="sales">Sales</option>
              <option value="marketing">Marketing</option>
              <option value="hr">HR</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Status</label>
            <select 
              value={selectedStatus} 
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <button 
            onClick={() => refetch()}
            className="bg-indigo-600 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-indigo-700"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <div className="flex gap-4 border-b">
          {[
            { key: 'summary', label: 'Summary Overview' },
            { key: 'detailed', label: 'Detailed Reports' },
            { key: 'trends', label: 'Trends & Analytics' },
            { key: 'compliance', label: 'Compliance & Quotas' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setViewMode(tab.key as any)}
              className={`px-4 py-2 font-semibold text-sm ${
                viewMode === tab.key 
                  ? 'text-indigo-600 border-b-2 border-indigo-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="text-gray-500 text-center py-8">Loading comprehensive report...</div>
      ) : error ? (
        <div className="text-red-500 text-center py-8">Error loading report</div>
      ) : (
        <>
          {/* Summary Overview */}
          {viewMode === 'summary' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow p-4">
                  <div className="text-2xl font-bold text-indigo-600">{data?.summary?.total || 0}</div>
                  <div className="text-sm text-gray-600">Total Requests</div>
                </div>
                <div className="bg-white rounded-xl shadow p-4">
                  <div className="text-2xl font-bold text-green-600">{data?.summary?.approved || 0}</div>
                  <div className="text-sm text-gray-600">Approved</div>
                </div>
                <div className="bg-white rounded-xl shadow p-4">
                  <div className="text-2xl font-bold text-yellow-600">{data?.summary?.pending || 0}</div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
                <div className="bg-white rounded-xl shadow p-4">
                  <div className="text-2xl font-bold text-red-600">{data?.summary?.rejected || 0}</div>
                  <div className="text-sm text-gray-600">Rejected</div>
                </div>
              </div>

              {/* Status Distribution Chart */}
              <div className="bg-white rounded-xl shadow p-4">
                <h2 className="text-lg font-semibold mb-4">Status Distribution</h2>
                <div className="w-64 mx-auto">
                  <DoughnutChart data={statusDistributionChart} />
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl shadow p-4">
                  <h3 className="font-semibold mb-2">Approval Rate</h3>
                  <div className="text-2xl font-bold text-green-600">
                    {data?.summary?.total ? Math.round((data.summary.approved / data.summary.total) * 100) : 0}%
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow p-4">
                  <h3 className="font-semibold mb-2">Avg Approval Time</h3>
                  <div className="text-2xl font-bold text-blue-600">2.1 days</div>
                </div>
                <div className="bg-white rounded-xl shadow p-4">
                  <h3 className="font-semibold mb-2">Peak Leave Month</h3>
                  <div className="text-2xl font-bold text-orange-600">December</div>
                </div>
              </div>
            </div>
          )}

          {/* Detailed Reports */}
          {viewMode === 'detailed' && (
            <div className="space-y-6">
              {/* By User */}
              <div className="bg-white rounded-xl shadow p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">By Employee</h2>
                  <button 
                    className="bg-indigo-600 text-white px-3 py-1 rounded text-xs font-semibold"
                    onClick={() => handleExport(data?.byUser || [], ['Employee', 'Total', 'Approved', 'Pending', 'Rejected', 'Cancelled'], 'leave-by-employee')}
                  >
                    Export {exportFormat.toUpperCase()}
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-xs text-gray-500 uppercase">
                        <th className="py-2 text-left">Employee</th>
                        <th className="text-center">Total</th>
                        <th className="text-center">Approved</th>
                        <th className="text-center">Pending</th>
                        <th className="text-center">Rejected</th>
                        <th className="text-center">Cancelled</th>
                        <th className="text-center">Utilization %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.byUser?.map((u: UserReport, idx: number) => (
                        <tr key={idx} className="border-b border-gray-200">
                          <td className="py-2 font-semibold">
                            {u.user.firstName} {u.user.lastName}
                            <div className="text-xs text-gray-400">{u.user.email}</div>
                          </td>
                          <td className="text-center">{u.total}</td>
                          <td className="text-center text-green-600 font-bold">{u.approved}</td>
                          <td className="text-center text-yellow-600 font-bold">{u.pending}</td>
                          <td className="text-center text-red-600 font-bold">{u.rejected}</td>
                          <td className="text-center text-gray-600 font-bold">{u.cancelled}</td>
                          <td className="text-center">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${Math.min((u.approved / 20) * 100, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-xs">{Math.round((u.approved / 20) * 100)}%</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* By Department */}
              <div className="bg-white rounded-xl shadow p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">By Department</h2>
                  <button 
                    className="bg-indigo-600 text-white px-3 py-1 rounded text-xs font-semibold"
                    onClick={() => handleExport(departmentData, ['Department', 'Total', 'Approved', 'Pending', 'Rejected', 'Cancelled', 'Avg Approval Time'], 'leave-by-department')}
                  >
                    Export {exportFormat.toUpperCase()}
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-xs text-gray-500 uppercase">
                        <th className="py-2 text-left">Department</th>
                        <th className="text-center">Total</th>
                        <th className="text-center">Approved</th>
                        <th className="text-center">Pending</th>
                        <th className="text-center">Rejected</th>
                        <th className="text-center">Cancelled</th>
                        <th className="text-center">Avg Approval (days)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {departmentData.map((dept, idx) => (
                        <tr key={idx} className="border-b border-gray-200">
                          <td className="py-2 font-semibold">{dept.department}</td>
                          <td className="text-center">{dept.total}</td>
                          <td className="text-center text-green-600 font-bold">{dept.approved}</td>
                          <td className="text-center text-yellow-600 font-bold">{dept.pending}</td>
                          <td className="text-center text-red-600 font-bold">{dept.rejected}</td>
                          <td className="text-center text-gray-600 font-bold">{dept.cancelled}</td>
                          <td className="text-center">{dept.avgApprovalTime}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* By Leave Type */}
              <div className="bg-white rounded-xl shadow p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">By Leave Type</h2>
                  <button 
                    className="bg-indigo-600 text-white px-3 py-1 rounded text-xs font-semibold"
                    onClick={() => handleExport(data?.byType || [], ['Leave Type', 'Total', 'Approved', 'Pending', 'Rejected', 'Cancelled'], 'leave-by-type')}
                  >
                    Export {exportFormat.toUpperCase()}
                  </button>
                </div>
                {byTypeChart && <Chart data={byTypeChart} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />}
                <div className="overflow-x-auto mt-4">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-xs text-gray-500 uppercase">
                        <th className="py-2 text-left">Type</th>
                        <th className="text-center">Total</th>
                        <th className="text-center">Approved</th>
                        <th className="text-center">Pending</th>
                        <th className="text-center">Rejected</th>
                        <th className="text-center">Cancelled</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.byType?.map((t: LeaveTypeReport, idx: number) => (
                        <tr key={idx} className="border-b border-gray-200">
                          <td className="py-2 font-semibold">{t.leaveType}</td>
                          <td className="text-center">{t.total}</td>
                          <td className="text-center text-green-600 font-bold">{t.approved}</td>
                          <td className="text-center text-yellow-600 font-bold">{t.pending}</td>
                          <td className="text-center text-red-600 font-bold">{t.rejected}</td>
                          <td className="text-center text-gray-600 font-bold">{t.cancelled}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Trends & Analytics */}
          {viewMode === 'trends' && (
            <div className="space-y-6">
              {/* Monthly Trends */}
              <div className="bg-white rounded-xl shadow p-4">
                <h2 className="text-lg font-semibold mb-4">Monthly Trends</h2>
                <LineChart 
                  data={monthlyTrendsChart} 
                  options={{ 
                    responsive: true, 
                    plugins: { legend: { position: 'top' } },
                    scales: {
                      y: {
                        beginAtZero: true
                      }
                    }
                  }} 
                />
              </div>

              {/* Peak Periods Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow p-4">
                  <h3 className="font-semibold mb-4">Peak Leave Periods</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>December</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-red-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                        <span className="text-sm font-semibold">85%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>July</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-orange-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                        </div>
                        <span className="text-sm font-semibold">65%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>March</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                        </div>
                        <span className="text-sm font-semibold">45%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow p-4">
                  <h3 className="font-semibold mb-4">Approval Efficiency</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Same Day</span>
                      <span className="font-semibold text-green-600">45%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>1-2 Days</span>
                      <span className="font-semibold text-blue-600">35%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>3-5 Days</span>
                      <span className="font-semibold text-yellow-600">15%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>5+ Days</span>
                      <span className="font-semibold text-red-600">5%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Year-over-Year Comparison */}
              <div className="bg-white rounded-xl shadow p-4">
                <h2 className="text-lg font-semibold mb-4">Year-over-Year Comparison</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-indigo-600">2024</div>
                    <div className="text-sm text-gray-600">Total Requests</div>
                    <div className="text-lg font-semibold mt-1">1,247</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">2023</div>
                    <div className="text-sm text-gray-600">Total Requests</div>
                    <div className="text-lg font-semibold mt-1">1,156</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">+7.9%</div>
                    <div className="text-sm text-gray-600">Growth</div>
                    <div className="text-sm text-green-600 mt-1">↗ Increase</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Compliance & Quotas */}
          {viewMode === 'compliance' && (
            <div className="space-y-6">
              {/* Leave Quota Utilization */}
              <div className="bg-white rounded-xl shadow p-4">
                <h2 className="text-lg font-semibold mb-4">Leave Quota Utilization</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-xs text-gray-500 uppercase">
                        <th className="py-2 text-left">Employee</th>
                        <th className="text-center">Leave Type</th>
                        <th className="text-center">Allocated</th>
                        <th className="text-center">Used</th>
                        <th className="text-center">Remaining</th>
                        <th className="text-center">Utilization</th>
                        <th className="text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quotasData?.results?.slice(0, 10).map((quota: any, idx: number) => (
                        <tr key={idx} className="border-b border-gray-200">
                          <td className="py-2 font-semibold">
                            {quota.user?.personalDetails?.firstName} {quota.user?.personalDetails?.lastName}
                          </td>
                          <td className="text-center">{quota.leaveType?.name}</td>
                          <td className="text-center">{quota.allocated}</td>
                          <td className="text-center">{quota.used}</td>
                          <td className="text-center">{quota.allocated - quota.used}</td>
                          <td className="text-center">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  (quota.used / quota.allocated) > 0.8 ? 'bg-red-500' :
                                  (quota.used / quota.allocated) > 0.6 ? 'bg-yellow-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${Math.min((quota.used / quota.allocated) * 100, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-xs">{Math.round((quota.used / quota.allocated) * 100)}%</span>
                          </td>
                          <td className="text-center">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              (quota.used / quota.allocated) > 0.8 ? 'bg-red-100 text-red-800' :
                              (quota.used / quota.allocated) > 0.6 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {(quota.used / quota.allocated) > 0.8 ? 'High' :
                               (quota.used / quota.allocated) > 0.6 ? 'Medium' : 'Low'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Policy Violations */}
              <div className="bg-white rounded-xl shadow p-4">
                <h2 className="text-lg font-semibold mb-4">Policy Violations & Alerts</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div>
                      <div className="font-semibold text-red-800">Quota Exceeded</div>
                      <div className="text-sm text-red-600">John Doe exceeded annual leave quota by 3 days</div>
                    </div>
                    <span className="text-xs text-red-600">2 days ago</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div>
                      <div className="font-semibold text-yellow-800">Late Application</div>
                      <div className="text-sm text-yellow-600">Jane Smith applied for leave 2 days before start date</div>
                    </div>
                    <span className="text-xs text-yellow-600">1 day ago</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div>
                      <div className="font-semibold text-blue-800">High Utilization</div>
                      <div className="text-sm text-blue-600">Engineering team approaching 80% leave utilization</div>
                    </div>
                    <span className="text-xs text-blue-600">3 days ago</span>
                  </div>
                </div>
              </div>

              {/* Compliance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl shadow p-4">
                  <div className="text-2xl font-bold text-green-600">98.5%</div>
                  <div className="text-sm text-gray-600">Policy Compliance Rate</div>
                </div>
                <div className="bg-white rounded-xl shadow p-4">
                  <div className="text-2xl font-bold text-blue-600">2.1 days</div>
                  <div className="text-sm text-gray-600">Average Approval Time</div>
                </div>
                <div className="bg-white rounded-xl shadow p-4">
                  <div className="text-2xl font-bold text-orange-600">12</div>
                  <div className="text-sm text-gray-600">Active Violations</div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminLeaveReport; 