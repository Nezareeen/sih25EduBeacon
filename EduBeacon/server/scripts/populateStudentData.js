const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

// Sample data for testing the consolidated student features
const sampleStudentData = [
  {
    name: "Alice Johnson",
    email: "alice.johnson@student.edu",
    rollNumber: "CS2023001",
    attendanceData: {
      percentage: 85,
      totalClasses: 100,
      attendedClasses: 85,
      history: [
        { date: new Date('2024-01-15'), status: 'present', subject: 'Mathematics' },
        { date: new Date('2024-01-16'), status: 'present', subject: 'Physics' },
        { date: new Date('2024-01-17'), status: 'absent', subject: 'Chemistry' },
        { date: new Date('2024-01-18'), status: 'late', subject: 'Computer Science' },
        { date: new Date('2024-01-19'), status: 'present', subject: 'English' }
      ]
    },
    academicData: {
      overallGrade: 'B+',
      gpa: 3.2,
      testResults: [
        { subject: 'Mathematics', testName: 'Mid-term Exam', maxMarks: 100, obtainedMarks: 78, percentage: 78, date: new Date('2024-01-10'), grade: 'B+' },
        { subject: 'Physics', testName: 'Quiz 1', maxMarks: 50, obtainedMarks: 42, percentage: 84, date: new Date('2024-01-12'), grade: 'A-' },
        { subject: 'Chemistry', testName: 'Lab Test', maxMarks: 75, obtainedMarks: 58, percentage: 77, date: new Date('2024-01-14'), grade: 'B+' },
        { subject: 'Computer Science', testName: 'Programming Assignment', maxMarks: 100, obtainedMarks: 92, percentage: 92, date: new Date('2024-01-16'), grade: 'A' }
      ],
      subjectWisePerformance: [
        { subject: 'Mathematics', averagePercentage: 78, totalTests: 1, lastTestDate: new Date('2024-01-10') },
        { subject: 'Physics', averagePercentage: 84, totalTests: 1, lastTestDate: new Date('2024-01-12') },
        { subject: 'Chemistry', averagePercentage: 77, totalTests: 1, lastTestDate: new Date('2024-01-14') },
        { subject: 'Computer Science', averagePercentage: 92, totalTests: 1, lastTestDate: new Date('2024-01-16') }
      ]
    },
    feeData: {
      totalFeeAmount: 50000,
      paidAmount: 30000,
      pendingAmount: 20000,
      paymentStatus: 'partial',
      dueDate: new Date('2024-03-31'),
      paymentHistory: [
        { amount: 15000, paymentDate: new Date('2024-01-01'), paymentMethod: 'online', receiptNumber: 'RCP001', description: 'First installment' },
        { amount: 15000, paymentDate: new Date('2024-01-15'), paymentMethod: 'card', receiptNumber: 'RCP002', description: 'Second installment' }
      ],
      lastPaymentDate: new Date('2024-01-15')
    }
  },
  {
    name: "Bob Smith",
    email: "bob.smith@student.edu",
    rollNumber: "CS2023002",
    attendanceData: {
      percentage: 65,
      totalClasses: 100,
      attendedClasses: 65,
      history: [
        { date: new Date('2024-01-15'), status: 'absent', subject: 'Mathematics' },
        { date: new Date('2024-01-16'), status: 'present', subject: 'Physics' },
        { date: new Date('2024-01-17'), status: 'absent', subject: 'Chemistry' },
        { date: new Date('2024-01-18'), status: 'late', subject: 'Computer Science' },
        { date: new Date('2024-01-19'), status: 'absent', subject: 'English' }
      ]
    },
    academicData: {
      overallGrade: 'C',
      gpa: 2.1,
      testResults: [
        { subject: 'Mathematics', testName: 'Mid-term Exam', maxMarks: 100, obtainedMarks: 45, percentage: 45, date: new Date('2024-01-10'), grade: 'D' },
        { subject: 'Physics', testName: 'Quiz 1', maxMarks: 50, obtainedMarks: 28, percentage: 56, date: new Date('2024-01-12'), grade: 'C-' },
        { subject: 'Chemistry', testName: 'Lab Test', maxMarks: 75, obtainedMarks: 38, percentage: 51, date: new Date('2024-01-14'), grade: 'D+' },
        { subject: 'Computer Science', testName: 'Programming Assignment', maxMarks: 100, obtainedMarks: 62, percentage: 62, date: new Date('2024-01-16'), grade: 'C-' }
      ],
      subjectWisePerformance: [
        { subject: 'Mathematics', averagePercentage: 45, totalTests: 1, lastTestDate: new Date('2024-01-10') },
        { subject: 'Physics', averagePercentage: 56, totalTests: 1, lastTestDate: new Date('2024-01-12') },
        { subject: 'Chemistry', averagePercentage: 51, totalTests: 1, lastTestDate: new Date('2024-01-14') },
        { subject: 'Computer Science', averagePercentage: 62, totalTests: 1, lastTestDate: new Date('2024-01-16') }
      ]
    },
    feeData: {
      totalFeeAmount: 50000,
      paidAmount: 0,
      pendingAmount: 50000,
      paymentStatus: 'overdue',
      dueDate: new Date('2024-01-31'),
      paymentHistory: [],
      lastPaymentDate: null
    }
  },
  {
    name: "Carol Davis",
    email: "carol.davis@student.edu",
    rollNumber: "CS2023003",
    attendanceData: {
      percentage: 95,
      totalClasses: 100,
      attendedClasses: 95,
      history: [
        { date: new Date('2024-01-15'), status: 'present', subject: 'Mathematics' },
        { date: new Date('2024-01-16'), status: 'present', subject: 'Physics' },
        { date: new Date('2024-01-17'), status: 'present', subject: 'Chemistry' },
        { date: new Date('2024-01-18'), status: 'present', subject: 'Computer Science' },
        { date: new Date('2024-01-19'), status: 'late', subject: 'English' }
      ]
    },
    academicData: {
      overallGrade: 'A',
      gpa: 3.8,
      testResults: [
        { subject: 'Mathematics', testName: 'Mid-term Exam', maxMarks: 100, obtainedMarks: 95, percentage: 95, date: new Date('2024-01-10'), grade: 'A' },
        { subject: 'Physics', testName: 'Quiz 1', maxMarks: 50, obtainedMarks: 48, percentage: 96, date: new Date('2024-01-12'), grade: 'A' },
        { subject: 'Chemistry', testName: 'Lab Test', maxMarks: 75, obtainedMarks: 70, percentage: 93, date: new Date('2024-01-14'), grade: 'A-' },
        { subject: 'Computer Science', testName: 'Programming Assignment', maxMarks: 100, obtainedMarks: 98, percentage: 98, date: new Date('2024-01-16'), grade: 'A+' }
      ],
      subjectWisePerformance: [
        { subject: 'Mathematics', averagePercentage: 95, totalTests: 1, lastTestDate: new Date('2024-01-10') },
        { subject: 'Physics', averagePercentage: 96, totalTests: 1, lastTestDate: new Date('2024-01-12') },
        { subject: 'Chemistry', averagePercentage: 93, totalTests: 1, lastTestDate: new Date('2024-01-14') },
        { subject: 'Computer Science', averagePercentage: 98, totalTests: 1, lastTestDate: new Date('2024-01-16') }
      ]
    },
    feeData: {
      totalFeeAmount: 50000,
      paidAmount: 50000,
      pendingAmount: 0,
      paymentStatus: 'paid',
      dueDate: new Date('2024-03-31'),
      paymentHistory: [
        { amount: 50000, paymentDate: new Date('2024-01-01'), paymentMethod: 'online', receiptNumber: 'RCP003', description: 'Full payment' }
      ],
      lastPaymentDate: new Date('2024-01-01')
    }
  },
  {
    name: "David Wilson",
    email: "david.wilson@student.edu",
    rollNumber: "CS2023004",
    attendanceData: {
      percentage: 55,
      totalClasses: 100,
      attendedClasses: 55,
      history: [
        { date: new Date('2024-01-15'), status: 'absent', subject: 'Mathematics' },
        { date: new Date('2024-01-16'), status: 'absent', subject: 'Physics' },
        { date: new Date('2024-01-17'), status: 'present', subject: 'Chemistry' },
        { date: new Date('2024-01-18'), status: 'absent', subject: 'Computer Science' },
        { date: new Date('2024-01-19'), status: 'late', subject: 'English' }
      ]
    },
    academicData: {
      overallGrade: 'D+',
      gpa: 1.8,
      testResults: [
        { subject: 'Mathematics', testName: 'Mid-term Exam', maxMarks: 100, obtainedMarks: 35, percentage: 35, date: new Date('2024-01-10'), grade: 'F' },
        { subject: 'Physics', testName: 'Quiz 1', maxMarks: 50, obtainedMarks: 22, percentage: 44, date: new Date('2024-01-12'), grade: 'D-' },
        { subject: 'Chemistry', testName: 'Lab Test', maxMarks: 75, obtainedMarks: 30, percentage: 40, date: new Date('2024-01-14'), grade: 'F' },
        { subject: 'Computer Science', testName: 'Programming Assignment', maxMarks: 100, obtainedMarks: 48, percentage: 48, date: new Date('2024-01-16'), grade: 'D' }
      ],
      subjectWisePerformance: [
        { subject: 'Mathematics', averagePercentage: 35, totalTests: 1, lastTestDate: new Date('2024-01-10') },
        { subject: 'Physics', averagePercentage: 44, totalTests: 1, lastTestDate: new Date('2024-01-12') },
        { subject: 'Chemistry', averagePercentage: 40, totalTests: 1, lastTestDate: new Date('2024-01-14') },
        { subject: 'Computer Science', averagePercentage: 48, totalTests: 1, lastTestDate: new Date('2024-01-16') }
      ]
    },
    feeData: {
      totalFeeAmount: 50000,
      paidAmount: 10000,
      pendingAmount: 40000,
      paymentStatus: 'overdue',
      dueDate: new Date('2024-01-15'),
      paymentHistory: [
        { amount: 10000, paymentDate: new Date('2023-12-15'), paymentMethod: 'cash', receiptNumber: 'RCP004', description: 'Partial payment' }
      ],
      lastPaymentDate: new Date('2023-12-15')
    }
  }
];

async function populateStudentData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/edubeacon');
    console.log('Connected to MongoDB');

    // Find existing organization and mentor
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.error('No admin found. Please create an admin first.');
      return;
    }

    const mentor = await User.findOne({ role: 'mentor', organizationId: admin.organizationId });
    if (!mentor) {
      console.error('No mentor found. Please create a mentor first.');
      return;
    }

    console.log(`Found organization: ${admin.organizationId}`);
    console.log(`Found mentor: ${mentor.name} (${mentor.email})`);

    // Create or update students with sample data
    for (const studentData of sampleStudentData) {
      console.log(`Processing student: ${studentData.name}`);

      // Check if student already exists
      let student = await User.findOne({ 
        email: studentData.email,
        organizationId: admin.organizationId 
      });

      if (student) {
        console.log(`Student ${studentData.name} already exists. Updating data...`);
        
        // Update existing student with new data
        student.rollNumber = studentData.rollNumber;
        student.attendanceData = studentData.attendanceData;
        student.academicData = studentData.academicData;
        student.feeData = studentData.feeData;
        student.mentorId = mentor._id;
        
        // Calculate risk analysis
        student.calculateRiskAnalysis();
        
        // Generate alerts if needed
        const alert = student.generateRiskAlert();
        if (alert) {
          console.log(`Generated ${alert.severity} alert for ${student.name}`);
        }
        
        await student.save();
        console.log(`Updated student: ${student.name} with risk level: ${student.riskAnalysis.overallRiskLevel}`);
      } else {
        console.log(`Creating new student: ${studentData.name}`);
        
        // Create new student
        student = new User({
          name: studentData.name,
          email: studentData.email,
          password: 'defaultPassword123', // In real scenario, this should be hashed
          role: 'student',
          organizationId: admin.organizationId,
          mentorId: mentor._id,
          rollNumber: studentData.rollNumber,
          attendanceData: studentData.attendanceData,
          academicData: studentData.academicData,
          feeData: studentData.feeData,
          isActive: true
        });

        // Generate unique code
        student.generateUniqueCode();
        
        // Calculate risk analysis
        student.calculateRiskAnalysis();
        
        // Generate alerts if needed
        const alert = student.generateRiskAlert();
        if (alert) {
          console.log(`Generated ${alert.severity} alert for ${student.name}`);
        }
        
        await student.save();
        console.log(`Created student: ${student.name} with risk level: ${student.riskAnalysis.overallRiskLevel}`);
      }
    }

    console.log('\n=== SUMMARY ===');
    const students = await User.find({ 
      role: 'student', 
      organizationId: admin.organizationId 
    }).select('name rollNumber riskAnalysis attendanceData academicData feeData');

    students.forEach(student => {
      console.log(`${student.name} (${student.rollNumber}):
        - Attendance: ${student.attendanceData?.percentage || 0}%
        - GPA: ${student.academicData?.gpa || 0}
        - Fee Status: ${student.feeData?.paymentStatus || 'N/A'}
        - Risk Level: ${student.riskAnalysis?.overallRiskLevel || 'low'}
        - Alerts: ${student.riskAnalysis?.alertsGenerated?.length || 0}
      `);
    });

    console.log('\nStudent data population completed successfully!');
    
  } catch (error) {
    console.error('Error populating student data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
if (require.main === module) {
  populateStudentData();
}

module.exports = { populateStudentData, sampleStudentData };
