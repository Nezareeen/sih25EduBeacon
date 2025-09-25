import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="nav-glass-effect px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold text-[rgb(51,116,253)]">
            EduBeacon
          </div>
          <div className="space-x-4">
            <Link 
              to="/login" 
              className="text-[rgb(51,116,253)] hover:text-[rgb(51,116,253)]/80 transition-colors duration-200"
            >
              Login
            </Link>
            <Link 
              to="/admin-register" 
              className="btn-secondary"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-[rgb(51,116,253)] mb-6">
            AI-Powered
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[rgb(51,116,253)] to-[rgb(51,116,253)]">
              Student Success
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-[rgb(51,116,253)] mb-12 max-w-3xl mx-auto leading-relaxed">
            Prevent student dropout with intelligent counseling, personalized support, 
            and data-driven insights that help every student thrive.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/admin-register" className="btn-primary text-lg px-8 py-4">
              Start Your Organization
            </Link>
            <Link to="/login" className="btn-secondary text-lg px-8 py-4">
              Access Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="card text-[rgb(51,116,253)]">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-2xl font-bold mb-4 text-[rgb(51,116,253)]">AI Counseling</h3>
            <p className="text-white leading-relaxed">
              Intelligent chatbot provides 24/7 support and guidance to students 
              when they need it most.
            </p>
          </div>
          <div className="card text-[rgb(51,116,253)]">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-2xl font-bold mb-4 text-[rgb(51,116,253)]">Analytics Dashboard</h3>
            <p className="text-white leading-relaxed">
              Real-time insights and predictive analytics help identify at-risk 
              students before it's too late.
            </p>
          </div>
          <div className="card text-[rgb(51,116,253)]">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-2xl font-bold mb-4 text-[rgb(51,116,253)]">Mentor Support</h3>
            <p className="text-white leading-relaxed">
              Connect students with mentors and provide tools for effective 
              academic and personal guidance.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="nav-glass-effect py-8 mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-[rgb(51,116,253)]">&copy; 2024 EduBeacon. Empowering student success through AI.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
