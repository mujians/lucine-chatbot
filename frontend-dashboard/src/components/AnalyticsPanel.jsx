import React, { useState, useEffect } from 'react';
import axios from '../lib/axios';

const AnalyticsPanel = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('/api/chat/ratings/analytics');
      setAnalytics(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Caricamento analytics...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Errore nel caricamento dei dati</div>
      </div>
    );
  }

  const { totalRatings, averageRating, distribution, operatorStats, ratings } = analytics;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Analytics CSAT</h2>
        <p className="text-gray-600">Customer Satisfaction Rating</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Ratings */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-3xl font-bold text-gray-800">{totalRatings}</div>
          <div className="text-gray-600">Ratings Totali</div>
        </div>

        {/* Average Rating */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-2">
            <div className="text-3xl font-bold text-gray-800">{averageRating}</div>
            <div className="text-2xl">⭐</div>
          </div>
          <div className="text-gray-600">Rating Medio</div>
        </div>

        {/* Satisfaction Rate */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-3xl font-bold text-gray-800">
            {totalRatings > 0
              ? Math.round(((distribution[4] + distribution[5]) / totalRatings) * 100)
              : 0}%
          </div>
          <div className="text-gray-600">Soddisfatti (4-5⭐)</div>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Distribuzione Ratings</h3>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = distribution[star] || 0;
            const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0;

            return (
              <div key={star} className="flex items-center gap-4">
                <div className="w-12 text-sm text-gray-700">{star}⭐</div>
                <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                  <div
                    className={`h-full ${
                      star >= 4 ? 'bg-green-500' : star === 3 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="w-16 text-sm text-gray-600">{count} ({Math.round(percentage)}%)</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Operator Stats */}
      {operatorStats.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Performance Operatori</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">Operatore</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">Ratings</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">Rating Medio</th>
                </tr>
              </thead>
              <tbody>
                {operatorStats
                  .sort((a, b) => b.averageRating - a.averageRating)
                  .map((op) => (
                    <tr key={op.operatorId} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{op.operatorName || 'N/A'}</td>
                      <td className="py-3 px-4">{op.totalRatings}</td>
                      <td className="py-3 px-4">
                        <span className="font-semibold">{op.averageRating.toFixed(1)}⭐</span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Ratings */}
      {ratings.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Ultimi Ratings</h3>
          <div className="space-y-4">
            {ratings.slice(0, 10).map((rating) => (
              <div key={rating.id} className="border-b pb-4 last:border-b-0">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-semibold text-gray-800">
                      {rating.session?.userName || rating.userEmail || 'Utente'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(rating.createdAt).toLocaleString('it-IT')}
                    </div>
                  </div>
                  <div className="text-xl">
                    {'⭐'.repeat(rating.rating)}
                  </div>
                </div>
                {rating.comment && (
                  <div className="text-gray-700 text-sm bg-gray-50 p-3 rounded">
                    "{rating.comment}"
                  </div>
                )}
                {rating.operatorName && (
                  <div className="text-xs text-gray-500 mt-2">
                    Operatore: {rating.operatorName}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Data Message */}
      {totalRatings === 0 && (
        <div className="bg-white p-12 rounded-lg shadow text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Nessun rating ricevuto</h3>
          <p className="text-gray-600">
            I ratings appariranno qui dopo che gli utenti valutano le chat chiuse.
          </p>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPanel;
