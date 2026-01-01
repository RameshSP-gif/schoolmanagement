import React, { useState, useEffect } from 'react';
import { classService, teacherService } from '../../services';

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    grade_level: '',
    section: '',
    teacher_id: '',
    academic_year: '',
    capacity: '30'
  });

  useEffect(() => {
    loadClasses();
    loadTeachers();
  }, []);

  const loadClasses = async () => {
    try {
      const data = await classService.getAll();
      setClasses(data);
    } catch (error) {
      console.error('Error loading classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTeachers = async () => {
    try {
      const data = await teacherService.getAll();
      setTeachers(data);
    } catch (error) {
      console.error('Error loading teachers:', error);
    }
  };

  const handleAdd = () => {
    setEditingClass(null);
    setFormData({
      name: '',
      grade_level: '',
      section: '',
      teacher_id: '',
      academic_year: '2025-2026',
      capacity: '30'
    });
    setShowModal(true);
  };

  const handleEdit = (cls) => {
    setEditingClass(cls);
    setFormData({
      name: cls.name,
      grade_level: cls.grade_level,
      section: cls.section || '',
      teacher_id: cls.teacher_id || '',
      academic_year: cls.academic_year || '',
      capacity: cls.capacity || '30'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingClass) {
        await classService.update(editingClass.id, formData);
      } else {
        await classService.create(formData);
      }
      setShowModal(false);
      loadClasses();
    } catch (error) {
      console.error('Error saving class:', error);
      alert('Failed to save class');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        await classService.delete(id);
        loadClasses();
      } catch (error) {
        console.error('Error deleting class:', error);
        alert('Failed to delete class');
      }
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="dashboard">
      <div className="flex-between mb-2">
        <h1>Classes Management</h1>
        <button className="btn btn-primary" onClick={handleAdd}>Create New Class</button>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Class Name</th>
              <th>Grade</th>
              <th>Section</th>
              <th>Teacher</th>
              <th>Students</th>
              <th>Capacity</th>
              <th>Academic Year</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {classes.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center">No classes found</td>
              </tr>
            ) : (
              classes.map(cls => (
                <tr key={cls.id}>
                  <td>{cls.name}</td>
                  <td>{cls.grade_level}</td>
                  <td>{cls.section || '-'}</td>
                  <td>{cls.teacher_name || 'Not assigned'}</td>
                  <td>{cls.student_count || 0}</td>
                  <td>{cls.capacity || 30}</td>
                  <td>{cls.academic_year || '-'}</td>
                  <td>
                    <button 
                      className="btn btn-warning btn-sm" 
                      style={{ marginRight: '5px' }}
                      onClick={() => handleEdit(cls)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(cls.id)}
                    >
                      Delete
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
              <h2 className="card-title">{editingClass ? 'Edit Class' : 'Create New Class'}</h2>
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

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Class Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., Class 10"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Grade Level *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., 10"
                  value={formData.grade_level}
                  onChange={(e) => setFormData({...formData, grade_level: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Section</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., A, B, C"
                  value={formData.section}
                  onChange={(e) => setFormData({...formData, section: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Class Teacher</label>
                <select
                  className="form-control"
                  value={formData.teacher_id}
                  onChange={(e) => setFormData({...formData, teacher_id: e.target.value})}
                >
                  <option value="">Select Teacher</option>
                  {teachers.map(teacher => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.first_name} {teacher.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Academic Year *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., 2025-2026"
                  value={formData.academic_year}
                  onChange={(e) => setFormData({...formData, academic_year: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Capacity</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.capacity}
                  onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="btn btn-primary">
                  {editingClass ? 'Update' : 'Create'} Class
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
    </div>
  );
};

export default Classes;
