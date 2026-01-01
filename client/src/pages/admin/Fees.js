import React, { useState, useEffect } from 'react';
import { feeService, studentService } from '../../services';

const Fees = () => {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [paymentModal, setPaymentModal] = useState(false);
  const [editingFee, setEditingFee] = useState(null);
  const [formData, setFormData] = useState({
    student_id: '',
    fee_type: '',
    amount: '',
    due_date: '',
    status: 'pending'
  });
  const [paymentData, setPaymentData] = useState({
    paid_amount: '',
    payment_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadFees();
    loadStudents();
  }, [filter]);

  const loadFees = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const data = await feeService.getAll(params);
      setFees(data);
    } catch (error) {
      console.error('Error loading fees:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      const data = await studentService.getAll();
      setStudents(data);
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const handleAdd = () => {
    setEditingFee(null);
    setFormData({
      student_id: '',
      fee_type: '',
      amount: '',
      due_date: '',
      status: 'pending'
    });
    setShowModal(true);
  };

  const handlePay = (fee) => {
    setEditingFee(fee);
    const remaining = fee.amount - (fee.paid_amount || 0);
    setPaymentData({
      paid_amount: remaining.toString(),
      payment_date: new Date().toISOString().split('T')[0]
    });
    setPaymentModal(true);
  };

  const handleSubmitFee = async (e) => {
    e.preventDefault();
    try {
      if (editingFee) {
        await feeService.update(editingFee.id, formData);
      } else {
        await feeService.create(formData);
      }
      setShowModal(false);
      loadFees();
    } catch (error) {
      console.error('Error saving fee:', error);
      alert('Failed to save fee');
    }
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    try {
      await feeService.recordPayment(editingFee.id, paymentData);
      setPaymentModal(false);
      loadFees();
    } catch (error) {
      console.error('Error recording payment:', error);
      alert('Failed to record payment');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      paid: 'badge-success',
      pending: 'badge-warning',
      partial: 'badge-info',
      overdue: 'badge-danger'
    };
    return `badge ${badges[status] || 'badge-info'}`;
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="dashboard">
      <div className="flex-between mb-2">
        <h1>Fee Management</h1>
        <button className="btn btn-primary" onClick={handleAdd}>Add Fee Record</button>
      </div>

      <div className="card">
        <div className="form-group">
          <label className="form-label">Filter by Status:</label>
          <select 
            className="form-control" 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ maxWidth: '200px' }}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Admission No.</th>
              <th>Class</th>
              <th>Fee Type</th>
              <th>Amount</th>
              <th>Paid</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {fees.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center">No fee records found</td>
              </tr>
            ) : (
              fees.map(fee => (
                <tr key={fee.id}>
                  <td>{fee.student_name}</td>
                  <td>{fee.admission_number}</td>
                  <td>{fee.class_name || '-'}</td>
                  <td>{fee.fee_type}</td>
                  <td>${fee.amount}</td>
                  <td>${fee.paid_amount || 0}</td>
                  <td>{new Date(fee.due_date).toLocaleDateString()}</td>
                  <td>
                    <span className={getStatusBadge(fee.status)}>
                      {fee.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn btn-success btn-sm"
                      onClick={() => handlePay(fee)}
                      disabled={fee.status === 'paid'}
                    >
                      {fee.status === 'paid' ? 'Paid' : 'Pay'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal" style={{
          display: 'flex',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ 
            width: '90%', 
            maxWidth: '500px',
            margin: '20px'
          }}>
            <div className="card-header" style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center'
            }}>
              <h2 className="card-title">Add Fee Record</h2>
              <button 
                onClick={() => setShowModal(false)}
                style={{ 
                  border: 'none', 
                  background: 'none', 
                  fontSize: '24px', 
                  cursor: 'pointer' 
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmitFee}>
              <div className="form-group">
                <label className="form-label">Student *</label>
                <select
                  className="form-control"
                  value={formData.student_id}
                  onChange={(e) => setFormData({...formData, student_id: e.target.value})}
                  required
                >
                  <option value="">Select Student</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.admission_number} - {student.first_name} {student.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Fee Type *</label>
                <select
                  className="form-control"
                  value={formData.fee_type}
                  onChange={(e) => setFormData({...formData, fee_type: e.target.value})}
                  required
                >
                  <option value="">Select Fee Type</option>
                  <option value="Tuition">Tuition</option>
                  <option value="Library">Library</option>
                  <option value="Sports">Sports</option>
                  <option value="Transport">Transport</option>
                  <option value="Exam">Exam</option>
                  <option value="Laboratory">Laboratory</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Amount *</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Due Date *</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.due_date}
                  onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="btn btn-primary">
                  Add Fee
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {paymentModal && (
        <div className="modal" style={{
          display: 'flex',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ 
            width: '90%', 
            maxWidth: '400px',
            margin: '20px'
          }}>
            <div className="card-header" style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center'
            }}>
              <h2 className="card-title">Record Payment</h2>
              <button 
                onClick={() => setPaymentModal(false)}
                style={{ 
                  border: 'none', 
                  background: 'none', 
                  fontSize: '24px', 
                  cursor: 'pointer' 
                }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px', marginBottom: '15px' }}>
              <div><strong>Student:</strong> {editingFee?.student_name}</div>
              <div><strong>Fee Type:</strong> {editingFee?.fee_type}</div>
              <div><strong>Total Amount:</strong> ${editingFee?.amount}</div>
              <div><strong>Already Paid:</strong> ${editingFee?.paid_amount || 0}</div>
              <div><strong>Remaining:</strong> ${editingFee ? (editingFee.amount - (editingFee.paid_amount || 0)) : 0}</div>
            </div>

            <form onSubmit={handleSubmitPayment}>
              <div className="form-group">
                <label className="form-label">Payment Amount *</label>
                <input
                  type="number"
                  className="form-control"
                  value={paymentData.paid_amount}
                  onChange={(e) => setPaymentData({...paymentData, paid_amount: e.target.value})}
                  required
                  min="0"
                  step="0.01"
                  max={editingFee ? (editingFee.amount - (editingFee.paid_amount || 0)) : 0}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Payment Date *</label>
                <input
                  type="date"
                  className="form-control"
                  value={paymentData.payment_date}
                  onChange={(e) => setPaymentData({...paymentData, payment_date: e.target.value})}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="btn btn-success">
                  Record Payment
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setPaymentModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fees;
