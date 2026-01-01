import React, { useState } from 'react';

const Reports = () => {
  const [reportType, setReportType] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateReport = async (type) => {
    setLoading(true);
    setReportType(type);
    
    try {
      let data = [];
      
      switch(type) {
        case 'students':
          const studentsRes = await fetch('/api/students');
          const students = await studentsRes.json();
          data = students.map(s => ({
            'Admission No': s.admission_number,
            'Name': `${s.first_name} ${s.last_name}`,
            'Email': s.email,
            'Class': s.class_name || 'Not Assigned',
            'Roll No': s.roll_number || '-',
            'Phone': s.phone || '-'
          }));
          break;
          
        case 'attendance':
          const attendanceRes = await fetch(`/api/attendance?from=${dateFrom}&to=${dateTo}`);
          const attendance = await attendanceRes.json();
          data = attendance.map(a => ({
            'Date': new Date(a.date).toLocaleDateString(),
            'Student': a.student_name,
            'Class': a.class_name,
            'Status': a.status.toUpperCase()
          }));
          break;
          
        case 'fees':
          const feesRes = await fetch('/api/fees');
          const fees = await feesRes.json();
          data = fees.map(f => ({
            'Student': f.student_name,
            'Fee Type': f.fee_type,
            'Amount': `$${f.amount}`,
            'Paid': `$${f.paid_amount || 0}`,
            'Balance': `$${f.amount - (f.paid_amount || 0)}`,
            'Due Date': new Date(f.due_date).toLocaleDateString(),
            'Status': f.status.toUpperCase()
          }));
          break;
          
        case 'grades':
          const gradesRes = await fetch('/api/exam-results');
          const grades = await gradesRes.json();
          data = grades.map(g => ({
            'Student': g.student_name,
            'Exam': g.exam_name,
            'Subject': g.subject_name,
            'Marks': `${g.marks_obtained}/${g.total_marks}`,
            'Percentage': `${((g.marks_obtained / g.total_marks) * 100).toFixed(2)}%`,
            'Grade': g.grade
          }));
          break;
      }
      
      setReportData(data);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (!reportData || reportData.length === 0) return;
    
    const headers = Object.keys(reportData[0]);
    const csvContent = [
      headers.join(','),
      ...reportData.map(row => 
        headers.map(header => `"${row[header]}"`).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div className="dashboard">
      <h1>Reports</h1>
      
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Generate Reports</h2>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <div className="form-group">
            <label className="form-label">Date Range (for Attendance Report)</label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="date"
                className="form-control"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                style={{ maxWidth: '200px' }}
              />
              <span>to</span>
              <input
                type="date"
                className="form-control"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                style={{ maxWidth: '200px' }}
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          <div className="card">
            <h3>Student Reports</h3>
            <p style={{ fontSize: '14px', color: '#666' }}>Complete list of all enrolled students</p>
            <button 
              className="btn btn-primary mt-2"
              onClick={() => generateReport('students')}
              disabled={loading}
            >
              {loading && reportType === 'students' ? 'Generating...' : 'Generate'}
            </button>
          </div>
          
          <div className="card">
            <h3>Attendance Reports</h3>
            <p style={{ fontSize: '14px', color: '#666' }}>Student attendance records by date range</p>
            <button 
              className="btn btn-primary mt-2"
              onClick={() => generateReport('attendance')}
              disabled={loading || !dateFrom || !dateTo}
            >
              {loading && reportType === 'attendance' ? 'Generating...' : 'Generate'}
            </button>
          </div>
          
          <div className="card">
            <h3>Fee Reports</h3>
            <p style={{ fontSize: '14px', color: '#666' }}>Fee payment status and pending amounts</p>
            <button 
              className="btn btn-primary mt-2"
              onClick={() => generateReport('fees')}
              disabled={loading}
            >
              {loading && reportType === 'fees' ? 'Generating...' : 'Generate'}
            </button>
          </div>
          
          <div className="card">
            <h3>Grade Reports</h3>
            <p style={{ fontSize: '14px', color: '#666' }}>Student exam results and grades</p>
            <button 
              className="btn btn-primary mt-2"
              onClick={() => generateReport('grades')}
              disabled={loading}
            >
              {loading && reportType === 'grades' ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </div>
      </div>

      {reportData && reportData.length > 0 && (
        <div className="card mt-2">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="card-title">{reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</h2>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-success" onClick={downloadCSV}>
                Download CSV
              </button>
              <button className="btn btn-primary" onClick={printReport}>
                Print Report
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  {Object.keys(reportData[0]).map(header => (
                    <th key={header}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reportData.map((row, idx) => (
                  <tr key={idx}>
                    {Object.values(row).map((val, i) => (
                      <td key={i}>{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
            <strong>Total Records:</strong> {reportData.length}
          </div>
        </div>
      )}

      {reportData && reportData.length === 0 && (
        <div className="card mt-2">
          <div className="alert alert-info">
            No data available for this report.
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
