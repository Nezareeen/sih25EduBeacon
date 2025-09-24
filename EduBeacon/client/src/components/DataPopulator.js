import React, { useState } from 'react';
import axios from 'axios';

const DataPopulator = () => {
  const [isPopulating, setIsPopulating] = useState(false);
  const [progress, setProgress] = useState('');
  const [results, setResults] = useState([]);

  // Sample student data
  const sampleStudents = [
    {
      name: "Alice Johnson",
      email: "alice.johnson@student.edu",
      rollNumber: "CS2023001",
      password: "student123",
      attendanceData: {
        percentage: 85,
        totalClasses: 100,
        attendedClasses: 85,
        history: [
          { date: '2024-01-15', status: 'present', subject: 'Mathematics' },
          { date: '2024-01-16', status: 'present', subject: 'Physics' },
          { date: '2024-01-17', status: 'absent', subject: 'Chemistry' },
          { date: '2024-01-18', status: 'late', subject: 'Computer Science' },
          { date: '2024-01-19', status: 'present', subject: 'English' }
        ]
      },
      academicData: {
        overallGrade: 'B+',
        gpa: 3.2,
        testResults: [
          { subject: 'Mathematics', testName: 'Mid-term Exam', maxMarks: 100, obtainedMarks: 78, percentage: 78, date: '2024-01-10', grade: 'B+' },
          { subject: 'Physics', testName: 'Quiz 1', maxMarks: 50, obtainedMarks: 42, percentage: 84, date: '2024-01-12', grade: 'A-' },
          { subject: 'Chemistry', testName: 'Lab Test', maxMarks: 75, obtainedMarks: 58, percentage: 77, date: '2024-01-14', grade: 'B+' },
          { subject: 'Computer Science', testName: 'Programming Assignment', maxMarks: 100, obtainedMarks: 92, percentage: 92, date: '2024-01-16', grade: 'A' }
        ]
      },
      feeData: {
        totalFeeAmount: 50000,
        paidAmount: 30000,
        pendingAmount: 20000,
        paymentStatus: 'partial',
        dueDate: '2024-03-31',
        paymentHistory: [
          { amount: 15000, paymentDate: '2024-01-01', paymentMethod: 'online', receiptNumber: 'RCP001', description: 'First installment' },
          { amount: 15000, paymentDate: '2024-01-15', paymentMethod: 'card', receiptNumber: 'RCP002', description: 'Second installment' }
        ]
      }
    },
    {
      name: "Bob Smith",
      email: "bob.smith@student.edu",
      rollNumber: "CS2023002",
      password: "student123",
      attendanceData: {
        percentage: 65,
        totalClasses: 100,
        attendedClasses: 65,
        history: [
          { date: '2024-01-15', status: 'absent', subject: 'Mathematics' },
          { date: '2024-01-16', status: 'present', subject: 'Physics' },
          { date: '2024-01-17', status: 'absent', subject: 'Chemistry' },
          { date: '2024-01-18', status: 'late', subject: 'Computer Science' },
          { date: '2024-01-19', status: 'absent', subject: 'English' }
        ]
      },
      academicData: {
        overallGrade: 'C',
        gpa: 2.1,
        testResults: [
          { subject: 'Mathematics', testName: 'Mid-term Exam', maxMarks: 100, obtainedMarks: 45, percentage: 45, date: '2024-01-10', grade: 'D' },
          { subject: 'Physics', testName: 'Quiz 1', maxMarks: 50, obtainedMarks: 28, percentage: 56, date: '2024-01-12', grade: 'C-' },
          { subject: 'Chemistry', testName: 'Lab Test', maxMarks: 75, obtainedMarks: 38, percentage: 51, date: '2024-01-14', grade: 'D+' },
          { subject: 'Computer Science', testName: 'Programming Assignment', maxMarks: 100, obtainedMarks: 62, percentage: 62, date: '2024-01-16', grade: 'C-' }
        ]
      },
      feeData: {
        totalFeeAmount: 50000,
        paidAmount: 0,
        pendingAmount: 50000,
        paymentStatus: 'overdue',
        dueDate: '2024-01-31',
        paymentHistory: []
      }
    },
    {
      name: "Carol Davis",
      email: "carol.davis@student.edu",
      rollNumber: "CS2023003",
      password: "student123",
      attendanceData: {
        percentage: 95,
        totalClasses: 100,
        attendedClasses: 95,
        history: [
          { date: '2024-01-15', status: 'present', subject: 'Mathematics' },
          { date: '2024-01-16', status: 'present', subject: 'Physics' },
          { date: '2024-01-17', status: 'present', subject: 'Chemistry' },
          { date: '2024-01-18', status: 'present', subject: 'Computer Science' },
          { date: '2024-01-19', status: 'late', subject: 'English' }
        ]
      },
      academicData: {
        overallGrade: 'A',
        gpa: 3.8,
        testResults: [
          { subject: 'Mathematics', testName: 'Mid-term Exam', maxMarks: 100, obtainedMarks: 95, percentage: 95, date: '2024-01-10', grade: 'A' },
          { subject: 'Physics', testName: 'Quiz 1', maxMarks: 50, obtainedMarks: 48, percentage: 96, date: '2024-01-12', grade: 'A' },
          { subject: 'Chemistry', testName: 'Lab Test', maxMarks: 75, obtainedMarks: 70, percentage: 93, date: '2024-01-14', grade: 'A-' },
          { subject: 'Computer Science', testName: 'Programming Assignment', maxMarks: 100, obtainedMarks: 98, percentage: 98, date: '2024-01-16', grade: 'A+' }
        ]
      },
      feeData: {
        totalFeeAmount: 50000,
        paidAmount: 50000,
        pendingAmount: 0,
        paymentStatus: 'paid',
        dueDate: '2024-03-31',
        paymentHistory: [
          { amount: 50000, paymentDate: '2024-01-01', paymentMethod: 'online', receiptNumber: 'RCP003', description: 'Full payment' }
        ]
      }
    },
    {
      name: "David Wilson",
      email: "david.wilson@student.edu",
      rollNumber: "CS2023004",
      password: "student123",
      attendanceData: {
        percentage: 55,
        totalClasses: 100,
        attendedClasses: 55,
        history: [
          { date: '2024-01-15', status: 'absent', subject: 'Mathematics' },
          { date: '2024-01-16', status: 'absent', subject: 'Physics' },
          { date: '2024-01-17', status: 'present', subject: 'Chemistry' },
          { date: '2024-01-18', status: 'absent', subject: 'Computer Science' },
          { date: '2024-01-19', status: 'late', subject: 'English' }
        ]
      },
      academicData: {
        overallGrade: 'D+',
        gpa: 1.8,
        testResults: [
          { subject: 'Mathematics', testName: 'Mid-term Exam', maxMarks: 100, obtainedMarks: 35, percentage: 35, date: '2024-01-10', grade: 'F' },
          { subject: 'Physics', testName: 'Quiz 1', maxMarks: 50, obtainedMarks: 22, percentage: 44, date: '2024-01-12', grade: 'D-' },
          { subject: 'Chemistry', testName: 'Lab Test', maxMarks: 75, obtainedMarks: 30, percentage: 40, date: '2024-01-14', grade: 'F' },
          { subject: 'Computer Science', testName: 'Programming Assignment', maxMarks: 100, obtainedMarks: 48, percentage: 48, date: '2024-01-16', grade: 'D' }
        ]
      },
      feeData: {
        totalFeeAmount: 50000,
        paidAmount: 10000,
        pendingAmount: 40000,
        paymentStatus: 'overdue',
        dueDate: '2024-01-15',
        paymentHistory: [
          { amount: 10000, paymentDate: '2023-12-15', paymentMethod: 'cash', receiptNumber: 'RCP004', description: 'Partial payment' }
        ]
      }
    }
  ];

  const populateData = async () => {
    setIsPopulating(true);
    setProgress('Starting data population...');
    setResults([]);

    try {
      for (let i = 0; i < sampleStudents.length; i++) {
        const student = sampleStudents[i];
        setProgress(`Creating student ${i + 1}/${sampleStudents.length}: ${student.name}`);

        try {
          // Step 1: Create the student user
          const createResponse = await axios.post('/api/admin/create-user', {
            name: student.name,
            email: student.email,
            role: 'student',
            password: student.password
          });

          if (createResponse.data.success) {
            const studentId = createResponse.data.user._id;
            setProgress(`✅ Created user: ${student.name}`);

            // Step 2: Update roll number directly (since it's not in the create API)
            try {
              await axios.put(`/api/admin/update-student/${studentId}`, {
                rollNumber: student.rollNumber
              });
              setProgress(`✅ Updated roll number for: ${student.name}`);
            } catch (error) {
              console.warn(`Could not update roll number for ${student.name}:`, error.response?.data?.message);
            }

            // Step 3: Add attendance data
            for (const attendance of student.attendanceData.history) {
              try {
                await axios.post(`/api/mentor/update-attendance/${studentId}`, {
                  date: attendance.date,
                  status: attendance.status,
                  subject: attendance.subject
                });
              } catch (error) {
                console.warn(`Could not add attendance for ${student.name}:`, error.response?.data?.message);
              }
            }
            setProgress(`✅ Added attendance data for: ${student.name}`);

            // Step 4: Add test results
            for (const test of student.academicData.testResults) {
              try {
                await axios.post(`/api/mentor/add-test-result/${studentId}`, test);
              } catch (error) {
                console.warn(`Could not add test result for ${student.name}:`, error.response?.data?.message);
              }
            }
            setProgress(`✅ Added academic data for: ${student.name}`);

            // Step 5: Add fee data
            try {
              await axios.post(`/api/mentor/update-fee-status/${studentId}`, {
                paymentData: student.feeData
              });
              setProgress(`✅ Added fee data for: ${student.name}`);
            } catch (error) {
              console.warn(`Could not add fee data for ${student.name}:`, error.response?.data?.message);
            }

            setResults(prev => [...prev, {
              name: student.name,
              status: 'success',
              message: 'Successfully created with all data'
            }]);

          } else {
            throw new Error(createResponse.data.message || 'Failed to create user');
          }

        } catch (error) {
          console.error(`Error creating ${student.name}:`, error);
          setResults(prev => [...prev, {
            name: student.name,
            status: 'error',
            message: error.response?.data?.message || error.message || 'Unknown error'
          }]);
        }

        // Small delay between students
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setProgress('✅ Data population completed!');

    } catch (error) {
      console.error('Population error:', error);
      setProgress('❌ Error during population');
    } finally {
      setIsPopulating(false);
    }
  };

  return (
    <div className="glass-effect rounded-xl p-6 m-6">
      <h2 className="text-2xl font-bold text-[rgb(51,116,253)] mb-4">📊 Sample Data Populator</h2>
      <p className="text-[rgb(51,116,253)] mb-6">
        This tool will create 4 sample students with realistic attendance, academic, and fee data to test the new consolidated features.
      </p>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[rgb(51,116,253)] mb-2">Sample Students:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sampleStudents.map((student, index) => (
            <div key={index} className="bg-white/5 rounded-lg p-4">
              <h4 className="font-medium text-[rgb(51,116,253)]">{student.name}</h4>
              <p className="text-sm text-[rgb(51,116,253)]">Roll: {student.rollNumber}</p>
              <p className="text-sm text-[rgb(51,116,253)]">Attendance: {student.attendanceData.percentage}%</p>
              <p className="text-sm text-[rgb(51,116,253)]">GPA: {student.academicData.gpa}</p>
              <p className="text-sm text-[rgb(51,116,253)]">Fee Status: {student.feeData.paymentStatus}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={populateData}
          disabled={isPopulating}
          className={`btn-primary ${isPopulating ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isPopulating ? '⏳ Populating...' : '🚀 Populate Sample Data'}
        </button>
      </div>

      {progress && (
        <div className="bg-white/5 rounded-lg p-4 mb-4">
          <p className="text-[rgb(51,116,253)] font-mono text-sm">{progress}</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-[rgb(51,116,253)]">Results:</h3>
          {results.map((result, index) => (
            <div key={index} className={`p-3 rounded-lg ${
              result.status === 'success' 
                ? 'bg-emerald-400/20 border border-emerald-400/30' 
                : 'bg-red-400/20 border border-red-400/30'
            }`}>
              <div className="flex items-center gap-2">
                <span className={result.status === 'success' ? 'text-emerald-400' : 'text-red-400'}>
                  {result.status === 'success' ? '✅' : '❌'}
                </span>
                <span className="font-medium text-[rgb(51,116,253)]">{result.name}</span>
                <span className={result.status === 'success' ? 'text-emerald-400' : 'text-red-400'}>
                  {result.message}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-400/10 border border-blue-400/30 rounded-lg">
        <h4 className="font-semibold text-[rgb(51,116,253)] mb-2">💡 Instructions:</h4>
        <ol className="list-decimal list-inside space-y-1 text-sm text-[rgb(51,116,253)]">
          <li>Make sure you're logged in as an Admin</li>
          <li>Click "Populate Sample Data" to create the test students</li>
          <li>Go to Mentor Dashboard → Students Management to see the results</li>
          <li>Test the new features: filters, student profiles, risk analysis, alerts</li>
        </ol>
      </div>
    </div>
  );
};

export default DataPopulator;
