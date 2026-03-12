import React from 'react';
import { useNavigate } from 'react-router';
import { Plus, Minus } from 'lucide-react';
import { Moment } from '../context/AppContext';
import { format } from 'date-fns';

interface MomentCardProps {
  moment: Moment;
}

export default function MomentCard({ moment }: MomentCardProps) {
  const navigate = useNavigate();

  const impactPercentage = (moment.impact * 100).toFixed(2);
  const displayImpact = moment.isPositive
    ? `+${impactPercentage}%`
    : `-${impactPercentage}%`;

  const textPreview = moment.contents
    .filter((c) => c.type === 'text')
    .slice(0, 2)
    .map((c) => c.content)
    .join(' ')
    .slice(0, 150);

  return (
    <div
      onClick={() => navigate(`/moment/${moment.id}`)}
      className="bg-gray-50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-gray-500">
          {format(new Date(moment.date), 'MMMM d, yyyy')}
        </p>
        <div
          className={`flex items-center gap-1 px-3 py-1 rounded-full ${
            moment.isPositive
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {moment.isPositive ? (
            <Plus className="w-4 h-4" />
          ) : (
            <Minus className="w-4 h-4" />
          )}
          <span className="text-sm">{displayImpact}</span>
        </div>
      </div>

      {/* Short Description */}
      <h3 className="text-lg mb-4">{moment.shortDescription}</h3>

      {/* Images */}
      {moment.images.length > 0 && (
        <div className="flex gap-2 mb-4">
          {moment.images.slice(0, 3).map((img, idx) => (
            <div
              key={idx}
              className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden"
            >
              <img
                src={img}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {/* Text Preview */}
      {textPreview && (
        <p className="text-sm text-gray-600 line-clamp-2">{textPreview}...</p>
      )}
    </div>
  );
}
