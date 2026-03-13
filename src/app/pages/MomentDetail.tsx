import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { format } from 'date-fns';
import { Plus, Minus, ArrowLeft, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function MomentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getMoment, user, deleteMoment } = useApp();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!id) {
    navigate('/dashboard');
    return null;
  }

  const moment = getMoment(id);

  if (!moment) {
    navigate('/dashboard');
    return null;
  }

  const impactPercentage = (moment.impact * 100).toFixed(2);
  const displayImpact = moment.isPositive
    ? `+${impactPercentage}%`
    : `-${impactPercentage}%`;

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this moment?')) {
      deleteMoment(id);
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">
                {format(new Date(moment.date), 'MMMM d, yyyy')}
              </p>
              <button
                onClick={handleDelete}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 ${
                moment.isPositive
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              <span className="text-lg">{displayImpact}</span>
            </div>

            <h1 className="text-3xl md:text-4xl mb-6">
              {moment.shortDescription}
            </h1>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {moment.contents.map((content, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
              >
                {content.type === 'text' ? (
                  <p className="text-lg leading-relaxed text-gray-800">
                    {content.content}
                  </p>
                ) : (
                  <div className="rounded-2xl overflow-hidden bg-gray-100">
                    <img
                      src={content.content}
                      alt=""
                      className="w-full h-auto"
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
