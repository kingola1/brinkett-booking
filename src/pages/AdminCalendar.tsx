import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AdminLayout from '../components/AdminLayout';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  parseISO,
  addMonths,
  subMonths 
} from 'date-fns';

interface Booking {
  id: number;
  guest_name: string;
  check_in: string;
  check_out: string;
  status: string;
}

interface BlockedDate {
  id: number;
  date: string;
  reason: string;
}

const AdminCalendar: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [blockReason, setBlockReason] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin');
      return;
    }
    fetchCalendarData();
  }, [isAuthenticated, navigate, currentDate]);

  const fetchCalendarData = async () => {
    try {
      const [bookingsResponse, blockedResponse] = await Promise.all([
        fetch('http://localhost:3001/api/admin/bookings?limit=all', { credentials: 'include' }),
        fetch('http://localhost:3001/api/admin/blocked-dates', { credentials: 'include' })
      ]);

      const bookingsData = await bookingsResponse.json();
      const blockedData = await blockedResponse.json();

      setBookings(bookingsData.bookings || []);
      setBlockedDates(blockedData || []);
    } catch (error) {
      console.error('Failed to fetch calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addBlockedDate = async () => {
    if (!selectedDate || !blockReason) return;

    try {
      const response = await fetch('http://localhost:3001/api/admin/blocked-dates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ date: selectedDate, reason: blockReason }),
      });

      if (response.ok) {
        fetchCalendarData();
        setShowBlockModal(false);
        setSelectedDate('');
        setBlockReason('');
      }
    } catch (error) {
      console.error('Failed to add blocked date:', error);
    }
  };

  const removeBlockedDate = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:3001/api/admin/blocked-dates/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        fetchCalendarData();
      }
    } catch (error) {
      console.error('Failed to remove blocked date:', error);
    }
  };

  const getDayStatus = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    
    // Check if blocked
    const blocked = blockedDates.find(bd => bd.date === dateString);
    if (blocked) {
      return { type: 'blocked', data: blocked };
    }

    // Check if booked
    const booking = bookings.find(b => {
      const checkIn = parseISO(b.check_in);
      const checkOut = parseISO(b.check_out);
      return date >= checkIn && date < checkOut && b.status === 'confirmed';
    });

    if (booking) {
      return { type: 'booked', data: booking };
    }

    return { type: 'available', data: null };
  };

  const getDayColor = (status: { type: string; data: any }) => {
    switch (status.type) {
      case 'booked':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'blocked':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-white text-gray-900 border-gray-200 hover:bg-gray-50';
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Add padding days from previous month
  const startDay = monthStart.getDay();
  const paddingDays = Array.from({ length: startDay }, (_, i) => {
    const date = new Date(monthStart);
    date.setDate(date.getDate() - (startDay - i));
    return date;
  });

  // Add padding days from next month
  const endDay = monthEnd.getDay();
  const endPaddingDays = Array.from({ length: 6 - endDay }, (_, i) => {
    const date = new Date(monthEnd);
    date.setDate(date.getDate() + i + 1);
    return date;
  });

  const allDays = [...paddingDays, ...calendarDays, ...endPaddingDays];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
            <p className="text-gray-600 mt-2">View and manage booking schedule</p>
          </div>
          <button
            onClick={() => setShowBlockModal(true)}
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Block Date</span>
          </button>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Calendar Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="p-6">
            {/* Days of week */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">
              {allDays.map((date, index) => {
                const status = getDayStatus(date);
                const isCurrentMonth = isSameMonth(date, currentDate);
                const isToday = isSameDay(date, new Date());

                return (
                  <div
                    key={index}
                    className={`
                      min-h-[80px] p-2 border rounded-lg cursor-pointer transition-colors
                      ${getDayColor(status)}
                      ${!isCurrentMonth ? 'opacity-40' : ''}
                      ${isToday ? 'ring-2 ring-amber-500' : ''}
                    `}
                    onClick={() => {
                      if (status.type === 'available') {
                        setSelectedDate(format(date, 'yyyy-MM-dd'));
                        setShowBlockModal(true);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-medium ${isToday ? 'font-bold' : ''}`}>
                        {format(date, 'd')}
                      </span>
                      {status.type === 'blocked' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeBlockedDate(status.data.id);
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    
                    {status.type === 'booked' && (
                      <div className="text-xs">
                        <p className="font-medium truncate">{status.data.guest_name}</p>
                      </div>
                    )}
                    
                    {status.type === 'blocked' && (
                      <div className="text-xs">
                        <p className="font-medium">Blocked</p>
                        <p className="truncate">{status.data.reason}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="border-t border-gray-200 p-6">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-white border border-gray-200 rounded"></div>
                <span className="text-sm text-gray-600">Available</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
                <span className="text-sm text-gray-600">Booked</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
                <span className="text-sm text-gray-600">Blocked</span>
              </div>
            </div>
          </div>
        </div>

        {/* Block Date Modal */}
        {showBlockModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Block Date</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason
                  </label>
                  <input
                    type="text"
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    placeholder="e.g., Maintenance, Cleaning"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-3 mt-6">
                <button
                  onClick={addBlockedDate}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Block Date
                </button>
                <button
                  onClick={() => {
                    setShowBlockModal(false);
                    setSelectedDate('');
                    setBlockReason('');
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCalendar;