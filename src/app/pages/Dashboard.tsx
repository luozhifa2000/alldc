import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import MomentCard from '../components/MomentCard';
import { format } from 'date-fns';
import { motion } from 'motion/react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, moments, lifeProgress } = useApp();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) return null;

  const sortedMoments = [...moments].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Progress Section */}
      <div className="bg-gradient-to-br from-blue-50 to-orange-50 py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm text-gray-500 mb-2">Life Progress</p>
            <h1 className="text-5xl md:text-6xl mb-6">
              {lifeProgress.toFixed(5)}
            </h1>
            <p className="text-sm text-gray-500">
              Started on {format(new Date(user.startDate), 'MMMM d, yyyy')}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {moments.length} {moments.length === 1 ? 'moment' : 'moments'}{' '}
              recorded
            </p>
          </motion.div>
        </div>
      </div>

      {/* Moments Timeline */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {moments.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-6">
              You haven't recorded any moments yet.
            </p>
            <button
              onClick={() => navigate('/moment/new')}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Record Your First Moment
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-2xl mb-6">Your Moments</h2>
            {sortedMoments.map((moment, idx) => (
              <motion.div
                key={moment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
              >
                <MomentCard moment={moment} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
