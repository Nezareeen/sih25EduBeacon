import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const StudentDashboard = () => {
  const [timetable, setTimetable] = useState({ events: [] });
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI counselor. How can I help you today?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // New: tips and wellbeing
  const [tips, setTips] = useState([]);
  const [wb, setWb] = useState({ mood: 3, stress: 3, sleep: 3, notes: '' });
  const [wbSending, setWbSending] = useState(false);
  const [wbMsg, setWbMsg] = useState('');

  useEffect(() => {
    fetchTimetable();
    fetchTips();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchTimetable = async () => {
    try {
      const res = await axios.get('/api/student/timetable');
      setTimetable(res.data);
    } catch (error) {
      console.error('Error fetching timetable:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTips = async () => {
    try {
      const res = await axios.get('/api/student/tips');
      setTips(res.data.tips || []);
    } catch (e) {
      console.error('Failed to fetch tips', e);
    }
  };

  const submitWellbeing = async (e) => {
    e.preventDefault();
    setWbSending(true);
    setWbMsg('');
    try {
      await axios.post('/api/student/wellbeing', wb);
      setWbMsg('Thanks! Your response has been recorded.');
      // refresh tips if risk changed
      fetchTips();
    } catch (e) {
      setWbMsg(e?.response?.data?.message || 'Failed to submit response');
    } finally {
      setWbSending(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true);

    try {
      const res = await axios.post('/api/student/chatbot', {
        message: newMessage
      });

      const aiMessage = {
        id: Date.now() + 1,
        text: res.data.response,
        sender: 'ai',
        timestamp: new Date()
      };

      setTimeout(() => {
        setChatMessages(prev => [...prev, aiMessage]);
        setIsTyping(false);
      }, 1000);
    } catch (error) {
      console.error('Error sending message:', error);
      const serverMessage = error?.response?.data?.message;
      const errorMessage = {
        id: Date.now() + 1,
        text: serverMessage || "I'm sorry, I'm having trouble connecting right now. Please try again later.",
        sender: 'ai',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
    }
  };

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
      <h1 className="text-3xl font-bold text-white">Student Dashboard</h1>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Column 1: Schedule */}
        <div className="xl:col-span-1 glass-effect rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">My Schedule</h2>
          <div className="space-y-3 max-h-[28rem] overflow-auto pr-1">
            {timetable.events.length > 0 ? (
              timetable.events.map((event, index) => (
                <div key={index} className="p-4 glass-effect rounded-lg">
                  <h3 className="font-semibold text-white">{event.title}</h3>
                  <p className="text-sm text-white/80 mt-1">
                    {new Date(event.start).toLocaleString()} - {new Date(event.end).toLocaleString()}
                  </p>
                  {event.description && (
                    <p className="text-sm text-white/60 mt-2">{event.description}</p>
                  )}
                  <span className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full ${
                    event.type === 'class' ? 'bg-blue-300/20 text-blue-300' :
                    event.type === 'meeting' ? 'bg-green-300/20 text-green-300' :
                    event.type === 'event' ? 'bg-purple-300/20 text-purple-300' :
                    'bg-yellow-300/20 text-yellow-300'
                  }`}>
                    {event.type}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-white/60 text-center py-8">No events scheduled</p>
            )}
          </div>
        </div>

        {/* Column 2: AI Counselor Chat */}
        <div className="xl:col-span-1 glass-effect rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">AI Counselor</h2>
          <div className="relative flex flex-col h-[32rem] overflow-hidden">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-black/20 backdrop-blur-md text-white border border-white/20'
                        : 'bg-black/20 backdrop-blur-md text-white border border-white/20'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender === 'user' ? 'text-white/80' : 'text-white/60'
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-black/20 backdrop-blur-md text-white px-4 py-2 rounded-lg border border-white/20">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="mt-2 sticky bottom-0 left-0 right-0 flex space-x-2 bg-black/20 backdrop-blur-md p-3 rounded-lg border border-white/10">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 input-field"
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={isTyping || !newMessage.trim()}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </form>
          </div>
        </div>

        {/* Column 3: Tips and Wellbeing */}
        <div className="xl:col-span-1 space-y-6">
          {/* Tips */}
          <div className="glass-effect rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Personalized Tips</h2>
            <ul className="list-disc list-inside space-y-2 text-white/90">
              {tips.length === 0 && <li className="text-white/70">No tips available yet.</li>}
              {tips.map((t, idx) => (
                <li key={idx}>{t}</li>
              ))}
            </ul>
          </div>

          {/* Wellbeing Survey */}
          <div className="glass-effect rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Daily Wellbeing Check-in</h2>
            <form onSubmit={submitWellbeing} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-white/80 text-sm mb-1">Mood (1-5)</label>
                  <input type="number" min="1" max="5" value={wb.mood} onChange={(e) => setWb({ ...wb, mood: Number(e.target.value) })} className="input-field" />
                </div>
                <div>
                  <label className="block text-white/80 text-sm mb-1">Stress (1-5)</label>
                  <input type="number" min="1" max="5" value={wb.stress} onChange={(e) => setWb({ ...wb, stress: Number(e.target.value) })} className="input-field" />
                </div>
                <div>
                  <label className="block text-white/80 text-sm mb-1">Sleep (1-5)</label>
                  <input type="number" min="1" max="5" value={wb.sleep} onChange={(e) => setWb({ ...wb, sleep: Number(e.target.value) })} className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-white/80 text-sm mb-1">Notes (optional)</label>
                <textarea rows="3" value={wb.notes} onChange={(e) => setWb({ ...wb, notes: e.target.value })} className="input-field" placeholder="Anything you'd like to share..." />
              </div>
              <div className="flex gap-3 items-center">
                <button type="submit" className="btn-primary" disabled={wbSending}>{wbSending ? 'Submitting...' : 'Submit'}</button>
                {wbMsg && <span className="text-white/80 text-sm">{wbMsg}</span>}
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass-effect rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 glass-effect rounded-lg hover:bg-black/30 transition-colors">
            <div className="text-2xl mb-2">📚</div>
            <h3 className="font-semibold text-white">Study Resources</h3>
            <p className="text-sm text-white/80">Access learning materials</p>
          </button>
          <button className="p-4 glass-effect rounded-lg hover:bg-black/30 transition-colors">
            <div className="text-2xl mb-2">📝</div>
            <h3 className="font-semibold text-white">Submit Assignment</h3>
            <p className="text-sm text-white/80">Upload your work</p>
          </button>
          <button className="p-4 glass-effect rounded-lg hover:bg-black/30 transition-colors">
            <div className="text-2xl mb-2">📞</div>
            <h3 className="font-semibold text-white">Contact Mentor</h3>
            <p className="text-sm text-white/80">Get help from your mentor</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
