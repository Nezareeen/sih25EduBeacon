import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

const HOURS = [9, 10, 11, 12, 13, 14, 15, 16]; // 9am - 5pm
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddDept, setShowAddDept] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'student' });
  const [newDept, setNewDept] = useState({ name: '', description: '' });

  // New state for mentor assignment and timetable builder
  const [mentors, setMentors] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedMentorId, setSelectedMentorId] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [assignMsg, setAssignMsg] = useState('');

  const [weekStart, setWeekStart] = useState(() => new Date().toISOString().slice(0, 10)); // yyyy-mm-dd
  const [grid, setGrid] = useState(() => initEmptyGrid());
  const [savingTT, setSavingTT] = useState(false);
  const [ttMsg, setTtMsg] = useState('');

  useEffect(() => {
    fetchData();
    fetchMentorsStudents();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, deptRes] = await Promise.all([
        axios.get('/api/admin/users'),
        axios.get('/api/admin/departments')
      ]);
      setUsers(usersRes.data);
      setDepartments(deptRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMentorsStudents = async () => {
    try {
      const [mRes, sRes] = await Promise.all([
        axios.get('/api/admin/mentors'),
        axios.get('/api/admin/students')
      ]);
      setMentors(mRes.data);
      setStudents(sRes.data);
    } catch (e) {
      console.error('Error fetching mentors/students:', e);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/admin/users', newUser);
      setUsers([...users, res.data.user]);
      setNewUser({ name: '', email: '', password: '', role: 'student' });
      setShowAddUser(false);
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  const handleAddDept = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/admin/departments', newDept);
      setDepartments([...departments, res.data]);
      setNewDept({ name: '', description: '' });
      setShowAddDept(false);
    } catch (error) {
      console.error('Error adding department:', error);
    }
  };

  // Mentor assignment
  const selectedStudent = useMemo(
    () => students.find(s => s._id === selectedStudentId),
    [students, selectedStudentId]
  );

  const handleAssignMentor = async () => {
    if (!selectedStudentId || !selectedMentorId) return;
    setAssigning(true);
    setAssignMsg('');
    try {
      await axios.post('/api/admin/assign-mentor', {
        studentId: selectedStudentId,
        mentorId: selectedMentorId,
      });
      setAssignMsg('Mentor assigned successfully.');
      // refresh students list to reflect mentorId
      fetchMentorsStudents();
    } catch (e) {
      setAssignMsg(e?.response?.data?.message || 'Failed to assign mentor');
    } finally {
      setAssigning(false);
    }
  };

  // Timetable builder helpers
  function initEmptyGrid() {
    const g = {};
    DAYS.forEach((_, d) => {
      g[d] = {};
      HOURS.forEach((h, idx) => { g[d][idx] = ''; });
    });
    return g;
  }

  const handleCellChange = (dayIdx, hourIdx, value) => {
    setGrid(prev => ({
      ...prev,
      [dayIdx]: {
        ...prev[dayIdx],
        [hourIdx]: value
      }
    }));
  };

  const computedWeekEnd = useMemo(() => {
    const ws = new Date(weekStart);
    const we = new Date(ws);
    we.setDate(ws.getDate() + 6);
    return we.toISOString().slice(0, 10);
  }, [weekStart]);

  const loadStudentTimetable = async (studentId) => {
    if (!studentId) return;
    try {
      setGrid(initEmptyGrid());
      const res = await axios.get(`/api/admin/timetable/${studentId}`);
      const data = res.data;
      // if events exist and weekStart matches selection week, map them to grid
      if (data?.events?.length) {
        const ws = new Date(weekStart);
        const weekStartDay = startOfWeek(ws);
        data.events.forEach(ev => {
          const start = new Date(ev.start);
          const end = new Date(ev.end);
          const dayIdx = dayIndexWithinWeek(start, weekStartDay);
          if (dayIdx >= 0 && dayIdx < DAYS.length) {
            const hourIdx = HOURS.indexOf(start.getHours());
            if (hourIdx >= 0) {
              // store title (and optionally location)
              setGrid(prev => ({
                ...prev,
                [dayIdx]: { ...prev[dayIdx], [hourIdx]: ev.title || '' }
              }));
            }
          }
        });
      }
    } catch (e) {
      console.error('Failed to load timetable', e);
    }
  };

  useEffect(() => {
    if (selectedStudentId) {
      loadStudentTimetable(selectedStudentId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStudentId, weekStart]);

  const saveTimetable = async () => {
    if (!selectedStudentId) return;
    setSavingTT(true);
    setTtMsg('');
    try {
      const ws = new Date(weekStart);
      const events = [];
      DAYS.forEach((_, dIdx) => {
        HOURS.forEach((h, hIdx) => {
          const title = grid[dIdx][hIdx];
          if (title && title.trim()) {
            const start = new Date(ws);
            start.setDate(ws.getDate() + dIdx);
            start.setHours(h, 0, 0, 0);
            const end = new Date(start);
            end.setHours(start.getHours() + 1);
            events.push({
              title: title.trim(),
              start,
              end,
              type: 'class'
            });
          }
        });
      });
      const weekEndDate = new Date(weekStart);
      weekEndDate.setDate(weekEndDate.getDate() + 6);
      await axios.post(`/api/admin/timetable/${selectedStudentId}`, {
        events,
        weekStart: new Date(weekStart),
        weekEnd: weekEndDate,
      });
      setTtMsg('Timetable saved successfully.');
    } catch (e) {
      setTtMsg(e?.response?.data?.message || 'Failed to save timetable');
    } finally {
      setSavingTT(false);
    }
  };

  function startOfWeek(date) {
    // Treat provided weekStart as Monday of the week (Mon-Fri grid)
    const d = new Date(date);
    const day = d.getDay(); // 0 Sun .. 6 Sat
    const diff = (day === 0 ? -6 : 1 - day); // shift to Monday
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function dayIndexWithinWeek(date, monStart) {
    const diffMs = new Date(date).setHours(0, 0, 0, 0) - monStart.getTime();
    const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
    return days; // 0..6
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <div className="space-x-4">
          <button onClick={() => setShowAddUser(true)} className="btn-primary">Add User</button>
          <button onClick={() => setShowAddDept(true)} className="btn-secondary">Add Department</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-effect rounded-xl shadow-lg p-6">
          <div className="text-2xl font-bold text-white">{users.length}</div>
          <div className="text-white">Total Users</div>
        </div>
        <div className="glass-effect rounded-xl shadow-lg p-6">
          <div className="text-2xl font-bold text-green-200">{users.filter(u => u.role === 'student').length}</div>
          <div className="text-white">Students</div>
        </div>
        <div className="glass-effect rounded-xl shadow-lg p-6">
          <div className="text-2xl font-bold text-blue-200">{users.filter(u => u.role === 'mentor').length}</div>
          <div className="text-white">Mentors</div>
        </div>
        <div className="glass-effect rounded-xl shadow-lg p-6">
          <div className="text-2xl font-bold text-purple-200">{departments.length}</div>
          <div className="text-white">Departments</div>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-effect rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Users & Invitation Codes</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/30">
            <thead className="bg-white/20">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Invitation Code</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/30">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === 'student' ? 'bg-green-400/30 text-green-200 border border-green-400/50' :
                      user.role === 'mentor' ? 'bg-blue-400/30 text-blue-200 border border-blue-400/50' :
                      'bg-purple-400/30 text-purple-200 border border-purple-400/50'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-white">{user.uniqueCode}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mentor Assignment */}
      <div className="glass-effect rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Assign Mentor to Student</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-white/80 text-sm mb-2">Student</label>
            <select value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)} className="input-field">
              <option value="">Select a student</option>
              {students.map(s => (
                <option key={s._id} value={s._id}>{s.name} ({s.email})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-white/80 text-sm mb-2">Mentor</label>
            <select value={selectedMentorId} onChange={(e) => setSelectedMentorId(e.target.value)} className="input-field">
              <option value="">Select a mentor</option>
              {mentors.map(m => (
                <option key={m._id} value={m._id}>{m.name} ({m.email})</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3">
            <button onClick={handleAssignMentor} disabled={!selectedStudentId || !selectedMentorId || assigning} className="btn-primary">
              {assigning ? 'Assigning...' : 'Assign'}
            </button>
            {assignMsg && <span className="text-white/80 text-sm self-center">{assignMsg}</span>}
          </div>
        </div>
        {selectedStudent && (
          <p className="text-white/70 text-sm mt-3">Current mentor: {selectedStudent.mentorId ? mentors.find(m => m._id === selectedStudent.mentorId)?.name || 'Assigned' : 'None'}</p>
        )}
      </div>

      {/* Timetable Builder */}
      <div className="glass-effect rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Weekly Timetable Builder</h2>
            <p className="text-white/70 text-sm">Build a weekly schedule (Mon-Fri, 9AM-5PM) for a student.</p>
          </div>
          <div className="flex gap-3 items-end">
            <div>
              <label className="block text-white/80 text-sm mb-2">Student</label>
              <select value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)} className="input-field">
                <option value="">Select a student</option>
                {students.map(s => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-white/80 text-sm mb-2">Week Start (Mon)</label>
              <input type="date" value={weekStart} onChange={(e) => setWeekStart(e.target.value)} className="input-field" />
              <p className="text-xs text-white/60 mt-1">Week End: {computedWeekEnd}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={saveTimetable} disabled={!selectedStudentId || savingTT} className="btn-primary">{savingTT ? 'Saving...' : 'Save Timetable'}</button>
              <button onClick={() => setGrid(initEmptyGrid())} className="btn-secondary">Clear</button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-black/20 backdrop-blur-md text-white px-3 py-2 border border-white/10">Time</th>
                {DAYS.map((d) => (
                  <th key={d} className="text-left text-white px-3 py-2 border border-white/10 bg-white/10">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HOURS.map((h, hIdx) => (
                <tr key={h}>
                  <td className="sticky left-0 z-10 bg-black/20 backdrop-blur-md text-white px-3 py-2 border border-white/10 font-mono">{`${h}:00 - ${h + 1}:00`}</td>
                  {DAYS.map((_, dIdx) => (
                    <td key={`${dIdx}-${hIdx}`} className="border border-white/10 p-0">
                      <input
                        value={grid[dIdx][hIdx]}
                        onChange={(e) => handleCellChange(dIdx, hIdx, e.target.value)}
                        placeholder="Class / Subject"
                        className="w-full h-full px-2 py-2 bg-black/20 backdrop-blur-md text-white placeholder-white/40 focus:outline-none"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {ttMsg && <p className="text-white/80 text-sm mt-3">{ttMsg}</p>}
      </div>

      {/* Departments */}
      <div className="glass-effect rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Departments</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => (
            <div key={dept._id} className="glass-effect rounded-lg p-4">
              <h3 className="font-semibold text-white">{dept.name}</h3>
              <p className="text-white/80 text-sm mt-1">{dept.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-effect rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4 text-white">Add New User</h3>
            <form onSubmit={handleAddUser} className="space-y-4">
              <input type="text" placeholder="Name" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} className="input-field" required />
              <input type="email" placeholder="Email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} className="input-field" required />
              <input type="password" placeholder="Password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} className="input-field" required />
              <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} className="input-field">
                <option value="student">Student</option>
                <option value="mentor">Mentor</option>
              </select>
              <div className="flex space-x-4">
                <button type="submit" className="btn-primary flex-1">Add User</button>
                <button type="button" onClick={() => setShowAddUser(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Department Modal */}
      {showAddDept && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-effect rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4 text-white">Add New Department</h3>
            <form onSubmit={handleAddDept} className="space-y-4">
              <input type="text" placeholder="Department Name" value={newDept.name} onChange={(e) => setNewDept({ ...newDept, name: e.target.value })} className="input-field" required />
              <textarea placeholder="Description" value={newDept.description} onChange={(e) => setNewDept({ ...newDept, description: e.target.value })} className="input-field" rows="3" />
              <div className="flex space-x-4">
                <button type="submit" className="btn-primary flex-1">Add Department</button>
                <button type="button" onClick={() => setShowAddDept(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
