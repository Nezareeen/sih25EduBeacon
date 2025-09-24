import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import StudentProfile from './StudentProfile';

const StudentsOverview = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [filters, setFilters] = useState({
    riskLevel: 'all',
    attendanceThreshold: 0,
    academicThreshold: 0,
    feeStatus: 'all',
    search: ''
  });
  const [alerts, setAlerts] = useState([]);
  const [showAlerts, setShowAlerts] = useState(false);

  const fetchStudentsData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/mentor/students-overview');
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await axios.get('/api/mentor/high-risk-alerts');
      setAlerts(response.data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const applyFilters = useCallback(() => {
    let filtered = [...students];

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(student => 
        student.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        student.rollNumber?.toLowerCase().includes(filters.search.toLowerCase()) ||
        student.email.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Risk level filter
    if (filters.riskLevel !== 'all') {
      filtered = filtered.filter(student => 
        student.riskAnalysis?.overallRiskLevel === filters.riskLevel
      );
    }

    // Attendance threshold filter
    if (filters.attendanceThreshold > 0) {
      filtered = filtered.filter(student => 
        (student.attendanceData?.percentage || 0) < filters.attendanceThreshold
      );
    }

    // Academic threshold filter
    if (filters.academicThreshold > 0) {
      filtered = filtered.filter(student => 
        (student.academicData?.gpa || 0) < filters.academicThreshold
      );
    }

    // Fee status filter
    if (filters.feeStatus !== 'all') {
      filtered = filtered.filter(student => 
        student.feeData?.paymentStatus === filters.feeStatus
      );
    }

    setFilteredStudents(filtered);
  }, [students, filters]);

  useEffect(() => {
    fetchStudentsData();
    fetchAlerts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'low': return 'text-emerald-400 bg-emerald-400/20 border-emerald-400/30';
      case 'medium': return 'text-amber-400 bg-amber-400/20 border-amber-400/30';
      case 'high': return 'text-red-400 bg-red-400/20 border-red-400/30';
      case 'critical': return 'text-red-600 bg-red-600/20 border-red-600/30';
      default: return 'text-gray-400 bg-gray-400/20 border-gray-400/30';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'text-emerald-400 bg-emerald-400/20 border-emerald-400/30';
      case 'partial': return 'text-amber-400 bg-amber-400/20 border-amber-400/30';
      case 'pending': return 'text-orange-400 bg-orange-400/20 border-orange-400/30';
      case 'overdue': return 'text-red-400 bg-red-400/20 border-red-400/30';
      default: return 'text-gray-400 bg-gray-400/20 border-gray-400/30';
    }
  };

  const openStudentProfile = (student) => {
    setSelectedStudent(student);
    setShowProfile(true);
  };

  const acknowledgeAlert = async (alertId, studentId) => {
    try {
      await axios.post(`/api/mentor/acknowledge-alert/${studentId}/${alertId}`);
      fetchAlerts();
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  const getAttendanceStatus = (percentage) => {
    if (percentage >= 90) return { color: 'text-emerald-400', label: 'Excellent' };
    if (percentage >= 75) return { color: 'text-blue-400', label: 'Good' };
    if (percentage >= 60) return { color: 'text-amber-400', label: 'Average' };
    return { color: 'text-red-400', label: 'Poor' };
  };

  const getAcademicStatus = (gpa) => {
    if (gpa >= 3.5) return { color: 'text-emerald-400', label: 'Excellent' };
    if (gpa >= 3.0) return { color: 'text-blue-400', label: 'Good' };
    if (gpa >= 2.5) return { color: 'text-amber-400', label: 'Average' };
    return { color: 'text-red-400', label: 'Poor' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(51,116,253)]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header with Alerts */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[rgb(51,116,253)]">Students Overview</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowAlerts(!showAlerts)}
            className={`btn-primary relative ${alerts.length > 0 ? 'animate-pulse' : ''}`}
          >
            🚨 Alerts
            {alerts.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                {alerts.length}
              </span>
            )}
          </button>
          <button onClick={fetchStudentsData} className="btn-secondary">
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* High-Risk Alerts Panel */}
      {showAlerts && alerts.length > 0 && (
        <div className="glass-effect rounded-xl p-6 border-l-4 border-red-400">
          <h2 className="text-xl font-bold text-red-400 mb-4">🚨 High-Risk Alerts</h2>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {alerts.map((alert, index) => (
              <div key={index} className={`p-4 rounded-lg border ${getRiskColor(alert.severity)}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-bold">{alert.type.toUpperCase()} ALERT</h4>
                    <p className="text-sm opacity-90">{alert.message}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(alert.date).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openStudentProfile(alert.student)}
                      className="btn-secondary text-xs px-2 py-1"
                    >
                      View Profile
                    </button>
                    {!alert.acknowledged && (
                      <button
                        onClick={() => acknowledgeAlert(alert._id, alert.student._id)}
                        className="btn-primary text-xs px-2 py-1"
                      >
                        Acknowledge
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="glass-effect rounded-xl p-6">
        <h2 className="text-xl font-bold text-[rgb(51,116,253)] mb-4">Filters & Search</h2>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div>
            <label className="block text-[rgb(51,116,253)] text-sm mb-2">Search</label>
            <input
              type="text"
              placeholder="Name, Roll No, Email..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-[rgb(51,116,253)] text-sm mb-2">Risk Level</label>
            <select
              value={filters.riskLevel}
              onChange={(e) => setFilters({...filters, riskLevel: e.target.value})}
              className="input-field"
            >
              <option value="all">All Levels</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div>
            <label className="block text-[rgb(51,116,253)] text-sm mb-2">Attendance &lt;</label>
            <input
              type="number"
              placeholder="75"
              value={filters.attendanceThreshold}
              onChange={(e) => setFilters({...filters, attendanceThreshold: Number(e.target.value)})}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-[rgb(51,116,253)] text-sm mb-2">GPA &lt;</label>
            <input
              type="number"
              step="0.1"
              placeholder="2.5"
              value={filters.academicThreshold}
              onChange={(e) => setFilters({...filters, academicThreshold: Number(e.target.value)})}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-[rgb(51,116,253)] text-sm mb-2">Fee Status</label>
            <select
              value={filters.feeStatus}
              onChange={(e) => setFilters({...filters, feeStatus: e.target.value})}
              className="input-field"
            >
              <option value="all">All Status</option>
              <option value="overdue">Overdue</option>
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({
                riskLevel: 'all',
                attendanceThreshold: 0,
                academicThreshold: 0,
                feeStatus: 'all',
                search: ''
              })}
              className="btn-secondary w-full"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="stats-card rounded-xl p-6">
          <div className="text-2xl font-bold text-[rgb(51,116,253)]">{filteredStudents.length}</div>
          <div className="text-[rgb(51,116,253)]">Total Students</div>
        </div>
        <div className="stats-card rounded-xl p-6">
          <div className="text-2xl font-bold text-red-400">
            {filteredStudents.filter(s => s.riskAnalysis?.overallRiskLevel === 'critical').length}
          </div>
          <div className="text-[rgb(51,116,253)]">Critical Risk</div>
        </div>
        <div className="stats-card rounded-xl p-6">
          <div className="text-2xl font-bold text-red-400">
            {filteredStudents.filter(s => s.riskAnalysis?.overallRiskLevel === 'high').length}
          </div>
          <div className="text-[rgb(51,116,253)]">High Risk</div>
        </div>
        <div className="stats-card rounded-xl p-6">
          <div className="text-2xl font-bold text-amber-400">
            {filteredStudents.filter(s => (s.attendanceData?.percentage || 0) < 75).length}
          </div>
          <div className="text-[rgb(51,116,253)]">Low Attendance</div>
        </div>
        <div className="stats-card rounded-xl p-6">
          <div className="text-2xl font-bold text-red-400">
            {filteredStudents.filter(s => s.feeData?.paymentStatus === 'overdue').length}
          </div>
          <div className="text-[rgb(51,116,253)]">Fee Overdue</div>
        </div>
      </div>

      {/* Students Comparative Table */}
      <div className="glass-effect rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-[rgb(51,116,253)] mb-4">
          Students Comparative Analysis ({filteredStudents.length} students)
        </h2>
        <div className="overflow-x-auto">
          <table className="liquid-glass-table min-w-full">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-[rgb(51,116,253)] font-medium">Student</th>
                <th className="px-4 py-3 text-left text-[rgb(51,116,253)] font-medium">Roll No</th>
                <th className="px-4 py-3 text-left text-[rgb(51,116,253)] font-medium">Attendance</th>
                <th className="px-4 py-3 text-left text-[rgb(51,116,253)] font-medium">Academic (GPA)</th>
                <th className="px-4 py-3 text-left text-[rgb(51,116,253)] font-medium">Fee Status</th>
                <th className="px-4 py-3 text-left text-[rgb(51,116,253)] font-medium">Overall Risk</th>
                <th className="px-4 py-3 text-left text-[rgb(51,116,253)] font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/20">
              {filteredStudents.map((student) => {
                const attendanceStatus = getAttendanceStatus(student.attendanceData?.percentage || 0);
                const academicStatus = getAcademicStatus(student.academicData?.gpa || 0);
                
                return (
                  <tr 
                    key={student._id} 
                    className="hover:bg-white/5 transition-colors duration-200 cursor-pointer"
                    onClick={() => openStudentProfile(student)}
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[rgb(51,116,253)] to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">
                            {student.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-[rgb(51,116,253)]">{student.name}</div>
                          <div className="text-sm text-[rgb(51,116,253)]">{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-mono text-[rgb(51,116,253)]">
                        {student.rollNumber || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-2">
                        <div className={`text-lg font-bold ${attendanceStatus.color}`}>
                          {student.attendanceData?.percentage || 0}%
                        </div>
                        <div className="text-xs">
                          <div className={attendanceStatus.color}>{attendanceStatus.label}</div>
                          <div className="text-[rgb(51,116,253)]">
                            {student.attendanceData?.attendedClasses || 0}/{student.attendanceData?.totalClasses || 0}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-2">
                        <div className={`text-lg font-bold ${academicStatus.color}`}>
                          {(student.academicData?.gpa || 0).toFixed(2)}
                        </div>
                        <div className="text-xs">
                          <div className={academicStatus.color}>{academicStatus.label}</div>
                          <div className="text-[rgb(51,116,253)]">
                            Grade: {student.academicData?.overallGrade || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col space-y-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPaymentStatusColor(student.feeData?.paymentStatus)}`}>
                          {student.feeData?.paymentStatus?.toUpperCase() || 'PENDING'}
                        </span>
                        <div className="text-xs text-[rgb(51,116,253)]">
                          ₹{student.feeData?.pendingAmount || 0} pending
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col space-y-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRiskColor(student.riskAnalysis?.overallRiskLevel)}`}>
                          {student.riskAnalysis?.overallRiskLevel?.toUpperCase() || 'LOW'}
                        </span>
                        {student.riskAnalysis?.riskFactors?.length > 0 && (
                          <div className="text-xs text-[rgb(51,116,253)]">
                            {student.riskAnalysis.riskFactors.length} factors
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openStudentProfile(student);
                        }}
                        className="btn-primary text-xs px-3 py-1"
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Profile Modal */}
      {showProfile && selectedStudent && (
        <StudentProfile
          studentId={selectedStudent._id}
          onClose={() => {
            setShowProfile(false);
            setSelectedStudent(null);
          }}
        />
      )}
    </div>
  );
};

export default StudentsOverview;
