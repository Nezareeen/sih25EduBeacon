import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import StudentsOverview from '../StudentsOverview';

const COLORS = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444', none: '#9ca3af' };

const MentorDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [students, setStudents] = useState([]);
  const [timetableToday, setTimetableToday] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [analyticsRes, studentsRes, todayRes] = await Promise.all([
        axios.get('/api/mentor/analytics'),
        axios.get('/api/mentor/students'),
        axios.get('/api/mentor/schedule/today')
      ]);
      setAnalytics(analyticsRes.data);
      setStudents(studentsRes.data);
      setTimetableToday(todayRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openStudentDetail = async (studentId) => {
    try {
      setDetailLoading(true);
      setDetailOpen(true);
      const res = await axios.get(`/api/mentor/student/${studentId}`);
      setSelectedStudent(res.data);
    } catch (e) {
      console.error('Failed to fetch student detail', e);
    } finally {
      setDetailLoading(false);
    }
  };

  // Build risk pie data with a safe fallback when all values are 0
  const riskCounts = analytics?.riskCounts || { low: 0, medium: 0, high: 0 };
  const riskPieDataRaw = [
    { name: 'Low Risk', value: riskCounts.low || 0, key: 'low' },
    { name: 'Medium Risk', value: riskCounts.medium || 0, key: 'medium' },
    { name: 'High Risk', value: riskCounts.high || 0, key: 'high' },
  ];
  const riskSum = riskPieDataRaw.reduce((a, b) => a + (b.value || 0), 0);
  const riskPieData = riskSum > 0 ? riskPieDataRaw : [{ name: 'No Data', value: 1, key: 'none' }];

  const renderPieCells = (data) => (
    data.map((entry, index) => (
      <Cell key={`cell-${index}`} fill={entry.key === 'low' ? COLORS.low : entry.key === 'medium' ? COLORS.medium : entry.key === 'high' ? COLORS.high : COLORS.none} />
    ))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header with Tab Navigation */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[rgb(51,116,253)]">Mentor Dashboard</h1>
        <div className="flex space-x-1">
          {[
            { id: 'overview', label: 'Analytics Overview' },
            { id: 'students', label: 'Students Management' }
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
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* Analytics Overview Content */}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-effect rounded-xl shadow-lg p-6">
          <div className="text-2xl font-bold text-[rgb(51,116,253)]">{analytics?.totalStudents || 0}</div>
          <div className="text-[rgb(51,116,253)]">Assigned Students</div>
        </div>
        <div className="glass-effect rounded-xl shadow-lg p-6">
          <div className="text-2xl font-bold text-[rgb(51,116,253)]">{(analytics?.attendanceRate || 0).toFixed ? (analytics?.attendanceRate || 0).toFixed(1) : analytics?.attendanceRate || 0}%</div>
          <div className="text-[rgb(51,116,253)]">Avg Attendance</div>
        </div>
        <div className="glass-effect rounded-xl shadow-lg p-6">
          <div className="text-2xl font-bold text-[rgb(51,116,253)]">{analytics?.riskCounts?.medium || 0}</div>
          <div className="text-[rgb(51,116,253)]">Medium Risk</div>
        </div>
        <div className="glass-effect rounded-xl shadow-lg p-6">
          <div className="text-2xl font-bold text-[rgb(51,116,253)]">{analytics?.riskCounts?.high || 0}</div>
          <div className="text-[rgb(51,116,253)]">High Risk</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trends */}
        <div className="glass-effect rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-[rgb(51,116,253)] mb-4">Weekly Trends</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics?.weeklyTrends || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff40" />
              <XAxis dataKey="week" stroke="rgb(51,116,253)" />
              <YAxis stroke="rgb(51,116,253)" />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px', color: '#ffffff' }}
                labelStyle={{ color: '#ffffff' }}
              />
              <Line type="monotone" dataKey="attendance" stroke="#60a5fa" strokeWidth={3} />
              <Line type="monotone" dataKey="engagement" stroke="#34d399" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Pie */}
        <div className="glass-effect rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Dropout Risk Breakdown</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie dataKey="value" data={riskPieData} cx="50%" cy="50%" outerRadius={90} label>
                {renderPieCells(riskPieData)}
              </Pie>
              <Legend />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8, color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
          {riskSum === 0 && (
            <p className="text-center text-white/70 text-sm mt-2">No risk data yet</p>
          )}
        </div>
      </div>

      {/* Assigned Students */}
      <div className="glass-effect rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Assigned Students</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map((student) => (
            <button key={student._id} onClick={() => openStudentDetail(student._id)} className="text-left glass-effect rounded-lg p-4 hover:bg-white/10 transition-colors">
              <h3 className="font-semibold text-white">{student.name}</h3>
              <p className="text-white/80 text-sm">{student.email}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${student.riskLevel === 'high' ? 'bg-red-400' : student.riskLevel === 'medium' ? 'bg-orange-400' : 'bg-green-400'}`}></span>
                <span className="text-xs text-white/70 capitalize">{student.riskLevel || 'low'}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="glass-effect rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Today&apos;s Schedule</h2>
        <div className="space-y-2">
          {timetableToday.length === 0 && <p className="text-white/70">No events scheduled today.</p>}
          {timetableToday.map((event, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 glass-effect rounded-lg">
              <div>
                <h4 className="font-medium text-white">{event.title}</h4>
                <p className="text-sm text-white/80">{new Date(event.start).toLocaleTimeString()} - {new Date(event.end).toLocaleTimeString()}</p>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                event.type === 'class' ? 'bg-blue-300/20 text-blue-300' :
                event.type === 'meeting' ? 'bg-green-300/20 text-green-300' :
                event.type === 'event' ? 'bg-purple-300/20 text-purple-300' :
                'bg-yellow-300/20 text-yellow-300'
              }`}>
                {event.type}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Student Detail Modal */}
      {detailOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-effect rounded-lg p-6 w-full max-w-3xl">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Student Details</h3>
              <button onClick={() => { setDetailOpen(false); setSelectedStudent(null); }} className="text-white/70 hover:text-white">✕</button>
            </div>
            {detailLoading || !selectedStudent ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="glass-effect rounded-lg p-4">
                    <h4 className="font-semibold text-white">Profile</h4>
                    <p className="text-white/80 text-sm mt-1">Name: {selectedStudent.student.name}</p>
                    <p className="text-white/80 text-sm">Email: {selectedStudent.student.email}</p>
                    <p className="text-white/80 text-sm">Attendance: {selectedStudent.student.attendancePct ?? 'N/A'}%</p>
                    <p className="text-white/80 text-sm capitalize">Risk: {selectedStudent.student.riskLevel || 'low'}</p>
                  </div>
                  <div className="glass-effect rounded-lg p-4">
                    <h4 className="font-semibold text-white">Parents Contact</h4>
                    <p className="text-white/80 text-sm mt-1">{selectedStudent.student.parentsContact?.name || 'N/A'}</p>
                    <p className="text-white/80 text-sm">{selectedStudent.student.parentsContact?.phone || ''}</p>
                    <p className="text-white/80 text-sm">{selectedStudent.student.parentsContact?.email || ''}</p>
                    <button className="btn-secondary mt-3">Schedule Meeting</button>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="glass-effect rounded-xl shadow-lg p-4">
                    <h4 className="text-white mb-2 font-semibold">Scores</h4>
                    {Array.isArray(selectedStudent.student.scores) && selectedStudent.student.scores.length > 0 ? (
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={selectedStudent.student.scores}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff40" />
                          <XAxis dataKey="subject" stroke="#ffffff" />
                          <YAxis stroke="#ffffff" />
                          <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8, color: '#fff' }} />
                          <Bar dataKey="value" fill="#60a5fa" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-white/70 text-sm">No scores available</p>
                    )}
                  </div>
                  <div className="glass-effect rounded-xl shadow-lg p-4">
                    <h4 className="text-white mb-2 font-semibold">Dropout Risk</h4>
                    {(() => {
                      const level = selectedStudent.student.riskLevel || null;
                      const data = level ? [
                        { name: 'Low', value: level === 'low' ? 1 : 0, key: 'low' },
                        { name: 'Medium', value: level === 'medium' ? 1 : 0, key: 'medium' },
                        { name: 'High', value: level === 'high' ? 1 : 0, key: 'high' }
                      ] : [{ name: 'No Data', value: 1, key: 'none' }];
                      const total = data.reduce((a,b) => a + b.value, 0);
                      return (
                        <>
                          <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                              <Pie dataKey="value" data={data} cx="50%" cy="50%" outerRadius={70} label>
                                {renderPieCells(data)}
                              </Pie>
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                          {total === 1 && data[0].key === 'none' && (
                            <p className="text-center text-white/70 text-sm mt-2">No risk data yet</p>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
                <div className="glass-effect rounded-xl shadow-lg p-4">
                  <h4 className="text-white mb-2 font-semibold">Upcoming Events</h4>
                  <div className="space-y-2">
                    {(selectedStudent.timetable?.events || []).slice(0, 5).map((ev, i) => (
                      <div key={i} className="flex items-center justify-between p-3 glass-effect rounded-lg">
                        <div>
                          <h5 className="font-medium text-white">{ev.title}</h5>
                          <p className="text-sm text-white/80">{new Date(ev.start).toLocaleString()}</p>
                        </div>
                        <span className="text-xs text-white/60 capitalize">{ev.type}</span>
                      </div>
                    ))}
                    {(!selectedStudent.timetable || selectedStudent.timetable.events?.length === 0) && (
                      <p className="text-white/70">No upcoming events.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
        </>
      )}

      {/* Students Management Tab */}
      {activeTab === 'students' && (
        <StudentsOverview />
      )}
    </div>
  );
};

export default MentorDashboard;
