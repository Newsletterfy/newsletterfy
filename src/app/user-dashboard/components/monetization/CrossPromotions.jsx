"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function CrossPromotions({ crossPromotions, onClose }) {
  const [selectedPromotions, setSelectedPromotions] = useState([]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Cross-Promotions Management</h3>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>

      {/* Available Newsletters */}
      <div className="mb-8">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Available Newsletters</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {crossPromotions.map((promo) => (
            <div key={promo.id} className="border rounded-lg p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h5 className="font-semibold text-gray-900">{promo.newsletterName}</h5>
                  <p className="text-sm text-gray-600">{promo.description}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  promo.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {promo.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                <div>
                  <p className="text-gray-600">Subscribers</p>
                  <p className="font-medium">{promo.subscribers.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Revenue per Click</p>
                  <p className="font-medium">${promo.revenuePerClick.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Total Clicks</p>
                  <p className="font-medium">{promo.clicks}</p>
                </div>
                <div>
                  <p className="text-gray-600">Total Revenue</p>
                  <p className="font-medium text-green-600">${promo.revenue.toFixed(2)}</p>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <p>Duration: {promo.startDate} - {promo.endDate}</p>
              </div>
              <div className="mt-4">
                <button
                  className={`w-full px-4 py-2 rounded-md text-sm font-medium ${
                    selectedPromotions.includes(promo.id)
                      ? 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } transition-colors`}
                  onClick={() => {
                    setSelectedPromotions(
                      selectedPromotions.includes(promo.id)
                        ? selectedPromotions.filter(id => id !== promo.id)
                        : [...selectedPromotions, promo.id]
                    );
                  }}
                >
                  {selectedPromotions.includes(promo.id) ? 'Selected' : 'Select for Promotion'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-500">Total Clicks</p>
            <p className="text-2xl font-bold text-gray-900">
              {crossPromotions.reduce((sum, promo) => sum + promo.clicks, 0)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-500">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900">
              ${crossPromotions.reduce((sum, promo) => sum + promo.revenue, 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-500">Your Share (80%)</p>
            <p className="text-2xl font-bold text-green-600">
              ${(crossPromotions.reduce((sum, promo) => sum + promo.revenue, 0) * 0.8).toFixed(2)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-500">Active Promotions</p>
            <p className="text-2xl font-bold text-cyan-500">
              {crossPromotions.filter(promo => promo.status === 'active').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 