"use client";
import React from 'react';
import { toast } from 'react-hot-toast';

export default function SponsoredAds({ sponsoredAds, onClose }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Sponsored Ads Management</h3>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>

      {/* Sponsored Ads Table */}
      <div className="mb-8 overflow-x-auto">
        <div className="align-middle inline-block min-w-full">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Brand
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campaign
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Budget
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sponsoredAds.map((ad) => (
                <tr key={ad.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {ad.brandName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {ad.campaign}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${ad.budget}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {ad.startDate} - {ad.endDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      ad.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {ad.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {ad.clicks} clicks<br/>
                    {ad.impressions} impressions
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-green-600 font-medium">
                      ${ad.revenue}
                    </span>
                    <br/>
                    <span className="text-xs text-gray-500">
                      (Your share: ${ad.revenue * 0.8})
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Revenue Summary */}
      <div className="mt-8 bg-gray-50 p-6 rounded-lg">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Revenue Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-500">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900">
              ${sponsoredAds.reduce((sum, ad) => sum + ad.revenue, 0)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-500">Your Share (80%)</p>
            <p className="text-2xl font-bold text-green-600">
              ${sponsoredAds.reduce((sum, ad) => sum + (ad.revenue * 0.8), 0)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-500">Platform Fee (20%)</p>
            <p className="text-2xl font-bold text-cyan-500">
              ${sponsoredAds.reduce((sum, ad) => sum + (ad.revenue * 0.2), 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 