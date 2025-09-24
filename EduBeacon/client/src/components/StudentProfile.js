import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

const StudentProfile = ({ studentId, onClose }) => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (studentId) {
      fetchStudentProfile();
    }
  }, [studentId]);

  const fetchStudentProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/mentor/student-profile/${studentId}`);
      setStudent(response.data);
    } catch (error) {
      console.error('Error fetching student profile:', error);
    } finally {
      setLoading(false);
    }
  };

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

  // Prepare attendance chart data
  const prepareAttendanceData = () => {
    if (!student?.attendanceData?.history) return [];
    
    const history = student.attendanceData.history;
    const last30Days = history.slice(-30);
    
    return last30Days.map((record, index) => ({
      day: index + 1,
      status: record.status === 'present' ? 1 : record.status === 'late' ? 0.5 : 0,
      date: new Date(record.date).toLocaleDateString()
    }));
  };

  // Prepare academic performance pie chart data
  const prepareAcademicData = () => {
    if (!student?.academicData?.subjectWisePerformance) return [];
    
    return student.academicData.subjectWisePerformance.map(subject => ({
      name: subject.subject,
      value: subject.averagePercentage,
      fill: `hsl(${Math.random() * 360}, 70%, 60%)`
    }));
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="glass-effect rounded-xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(51,116,253)] mx-auto"></div>
          <p className="text-[rgb(51,116,253)] mt-4 text-center">Loading student profile...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="glass-effect rounded-xl p-8">
          <p className="text-[rgb(51,116,253)] text-center">Student not found</p>
          <button onClick={onClose} className="btn-primary mt-4">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="glass-effect rounded-xl shadow-2xl">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-white/20">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[rgb(51,116,253)] to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    {student.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-[rgb(51,116,253)]">{student.name}</h1>
                  <p className="text-[rgb(51,116,253)]">Roll No: {student.rollNumber || 'N/A'} • {student.email}</p>
                </div>
              </div>
              <button onClick={onClose} className="btn-secondary">
                ✕ Close
              </button>
            </div>

            {/* Risk Alert Banner */}
            {student.riskAnalysis?.overallRiskLevel !== 'low' && (
              <div className={`p-4 m-6 rounded-lg border ${getRiskColor(student.riskAnalysis.overallRiskLevel)}`}>
                <div className="flex items-center space-x-2">
                  <span className="text-xl">⚠️</span>
                  <div>
                    <h3 className="font-bold">
                      {student.riskAnalysis.overallRiskLevel.toUpperCase()} RISK ALERT
                    </h3>
                    <p className="text-sm opacity-90">
                      {student.riskAnalysis.riskFactors?.join(', ') || 'Multiple risk factors detected'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Navigation */}
            <div className="flex space-x-1 p-6 pb-0">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'attendance', label: 'Attendance' },
                { id: 'academic', label: 'Academic' },
                { id: 'financial', label: 'Financial' },
                { id: 'alerts', label: 'Alerts' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-[rgb(51,116,253)]/20 text-[rgb(51,116,253)] border border-[rgb(51,116,253)]/30'
                      : 'text-[rgb(51,116,253)]/70 hover:text-[rgb(51,116,253)] hover:bg-[rgb(51,116,253)]/10'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Attendance Summary */}
                  <div className="stats-card rounded-xl p-6">
                    <h3 className="text-lg font-bold text-[rgb(51,116,253)] mb-2">Attendance</h3>
                    <div className="text-3xl font-bold text-[rgb(51,116,253)] mb-1">
                      {student.attendanceData?.percentage || 0}%
                    </div>
                    <p className="text-[rgb(51,116,253)] text-sm">
                      {student.attendanceData?.attendedClasses || 0} / {student.attendanceData?.totalClasses || 0} classes
                    </p>
                    <div className={`mt-2 px-2 py-1 rounded-full text-xs font-medium border ${getRiskColor(student.riskAnalysis?.attendanceRisk)}`}>
                      {student.riskAnalysis?.attendanceRisk?.toUpperCase() || 'LOW'} RISK
                    </div>
                  </div>

                  {/* Academic Summary */}
                  <div className="stats-card rounded-xl p-6">
                    <h3 className="text-lg font-bold text-[rgb(51,116,253)] mb-2">Academic</h3>
                    <div className="text-3xl font-bold text-[rgb(51,116,253)] mb-1">
                      {student.academicData?.gpa?.toFixed(2) || '0.00'}
                    </div>
                    <p className="text-[rgb(51,116,253)] text-sm">
                      GPA • Grade: {student.academicData?.overallGrade || 'N/A'}
                    </p>
                    <div className={`mt-2 px-2 py-1 rounded-full text-xs font-medium border ${getRiskColor(student.riskAnalysis?.academicRisk)}`}>
                      {student.riskAnalysis?.academicRisk?.toUpperCase() || 'LOW'} RISK
                    </div>
                  </div>

                  {/* Financial Summary */}
                  <div className="stats-card rounded-xl p-6">
                    <h3 className="text-lg font-bold text-[rgb(51,116,253)] mb-2">Fee Status</h3>
                    <div className="text-3xl font-bold text-[rgb(51,116,253)] mb-1">
                      ₹{student.feeData?.pendingAmount || 0}
                    </div>
                    <p className="text-[rgb(51,116,253)] text-sm">
                      Pending of ₹{student.feeData?.totalFeeAmount || 0}
                    </p>
                    <div className={`mt-2 px-2 py-1 rounded-full text-xs font-medium border ${getPaymentStatusColor(student.feeData?.paymentStatus)}`}>
                      {student.feeData?.paymentStatus?.toUpperCase() || 'PENDING'}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'attendance' && (
                <div className="space-y-6">
                  <div className="glass-effect rounded-xl p-6">
                    <h3 className="text-xl font-bold text-[rgb(51,116,253)] mb-4">Attendance History (Last 30 Days)</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={prepareAttendanceData()}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,116,253,0.3)" />
                          <XAxis dataKey="day" stroke="rgb(51,116,253)" />
                          <YAxis domain={[0, 1]} stroke="rgb(51,116,253)" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(51,116,253,0.9)', 
                              border: 'none', 
                              borderRadius: '8px', 
                              color: 'white' 
                            }}
                            formatter={(value) => [
                              value === 1 ? 'Present' : value === 0.5 ? 'Late' : 'Absent',
                              'Status'
                            ]}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="status" 
                            stroke="rgb(51,116,253)" 
                            strokeWidth={3}
                            dot={{ fill: 'rgb(51,116,253)', strokeWidth: 2, r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="glass-effect rounded-xl p-6">
                    <h3 className="text-xl font-bold text-[rgb(51,116,253)] mb-4">Recent Attendance Records</h3>
                    <div className="overflow-x-auto">
                      <table className="liquid-glass-table min-w-full">
                        <thead>
                          <tr>
                            <th className="px-4 py-2 text-left text-[rgb(51,116,253)]">Date</th>
                            <th className="px-4 py-2 text-left text-[rgb(51,116,253)]">Status</th>
                            <th className="px-4 py-2 text-left text-[rgb(51,116,253)]">Subject</th>
                          </tr>
                        </thead>
                        <tbody>
                          {student.attendanceData?.history?.slice(-10).reverse().map((record, index) => (
                            <tr key={index} className="hover:bg-white/5">
                              <td className="px-4 py-2 text-[rgb(51,116,253)]">
                                {new Date(record.date).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  record.status === 'present' ? 'bg-emerald-400/20 text-emerald-400' :
                                  record.status === 'late' ? 'bg-amber-400/20 text-amber-400' :
                                  'bg-red-400/20 text-red-400'
                                }`}>
                                  {record.status.toUpperCase()}
                                </span>
                              </td>
                              <td className="px-4 py-2 text-[rgb(51,116,253)]">{record.subject || 'General'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'academic' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="glass-effect rounded-xl p-6">
                      <h3 className="text-xl font-bold text-[rgb(51,116,253)] mb-4">Subject-wise Performance</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={prepareAcademicData()}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              dataKey="value"
                              label={({ name, value }) => `${name}: ${value}%`}
                            >
                              {prepareAcademicData().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="glass-effect rounded-xl p-6">
                      <h3 className="text-xl font-bold text-[rgb(51,116,253)] mb-4">Recent Test Results</h3>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {student.academicData?.testResults?.slice(-5).reverse().map((test, index) => (
                          <div key={index} className="p-3 bg-white/5 rounded-lg">
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="font-medium text-[rgb(51,116,253)]">{test.testName}</h4>
                                <p className="text-sm text-[rgb(51,116,253)]">{test.subject}</p>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-[rgb(51,116,253)]">
                                  {test.obtainedMarks}/{test.maxMarks}
                                </div>
                                <div className="text-sm text-[rgb(51,116,253)]">{test.percentage}%</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'financial' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-effect rounded-xl p-6">
                      <h3 className="text-xl font-bold text-[rgb(51,116,253)] mb-4">Fee Summary</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-[rgb(51,116,253)]">Total Fee:</span>
                          <span className="font-bold text-[rgb(51,116,253)]">₹{student.feeData?.totalFeeAmount || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[rgb(51,116,253)]">Paid Amount:</span>
                          <span className="font-bold text-emerald-400">₹{student.feeData?.paidAmount || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[rgb(51,116,253)]">Pending Amount:</span>
                          <span className="font-bold text-red-400">₹{student.feeData?.pendingAmount || 0}</span>
                        </div>
                        <div className="pt-2 border-t border-white/20">
                          <div className="flex justify-between items-center">
                            <span className="text-[rgb(51,116,253)]">Status:</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPaymentStatusColor(student.feeData?.paymentStatus)}`}>
                              {student.feeData?.paymentStatus?.toUpperCase() || 'PENDING'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="glass-effect rounded-xl p-6">
                      <h3 className="text-xl font-bold text-[rgb(51,116,253)] mb-4">Payment History</h3>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {student.feeData?.paymentHistory?.slice(-5).reverse().map((payment, index) => (
                          <div key={index} className="p-3 bg-white/5 rounded-lg">
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-medium text-[rgb(51,116,253)]">₹{payment.amount}</div>
                                <div className="text-sm text-[rgb(51,116,253)]">
                                  {new Date(payment.paymentDate).toLocaleDateString()}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-[rgb(51,116,253)]">{payment.paymentMethod}</div>
                                <div className="text-xs text-[rgb(51,116,253)]">#{payment.receiptNumber}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'alerts' && (
                <div className="space-y-4">
                  <div className="glass-effect rounded-xl p-6">
                    <h3 className="text-xl font-bold text-[rgb(51,116,253)] mb-4">Risk Analysis & Alerts</h3>
                    
                    {student.riskAnalysis?.alertsGenerated?.length > 0 ? (
                      <div className="space-y-3">
                        {student.riskAnalysis.alertsGenerated.map((alert, index) => (
                          <div key={index} className={`p-4 rounded-lg border ${getRiskColor(alert.severity)}`}>
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-bold">{alert.type.toUpperCase()} ALERT</h4>
                                <p className="text-sm opacity-90">{alert.message}</p>
                                <p className="text-xs opacity-70 mt-1">
                                  {new Date(alert.date).toLocaleString()}
                                </p>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                alert.acknowledged ? 'bg-emerald-400/20 text-emerald-400' : 'bg-red-400/20 text-red-400'
                              }`}>
                                {alert.acknowledged ? 'ACKNOWLEDGED' : 'PENDING'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[rgb(51,116,253)] text-center py-8">No alerts generated</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
