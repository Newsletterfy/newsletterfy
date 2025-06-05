"use client";
import React, { useState } from "react";
import SponsoredAdCampaigns from "./components/SponsoredAds";
import Analytics from "./components/Analytics";
import Funds from "./components/Funds";
import Settings from "./components/Settings";

export default function BrandDashboard() {
  const [activeTab, setActiveTab] = useState("sponsored-ads");
  const [showAdEditor, setShowAdEditor] = useState(false);

  const handleNewAd = () => {
    setActiveTab("sponsored-ads");
    setShowAdEditor(true);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "sponsored-ads":
        return <SponsoredAdCampaigns initialShowEditor={showAdEditor} onEditorClose={() => setShowAdEditor(false)} />;
      case "analytics":
        return <Analytics />;
      case "funds":
        return <Funds />;
      case "settings":
        return <Settings />;
      default:
        return <SponsoredAdCampaigns initialShowEditor={showAdEditor} onEditorClose={() => setShowAdEditor(false)} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-50">
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Dashboard Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold gradient-text mb-2">Brand Dashboard</h1>
              <p className="text-gray-600">Manage your advertising campaigns and reach newsletter audiences</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleNewAd}
                className="button-primary inline-flex items-center"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create New Ad
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="glass-panel p-6 hover-scale">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Campaigns</p>
                  <h3 className="text-2xl font-bold text-gray-900">12</h3>
                  <p className="text-sm text-green-600">+3 from last month</p>
                </div>
                <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="glass-panel p-6 hover-scale">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Clicks</p>
                  <h3 className="text-2xl font-bold text-gray-900">8.4K</h3>
                  <p className="text-sm text-green-600">+15% from last month</p>
                </div>
                <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="glass-panel p-6 hover-scale">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Impressions</p>
                  <h3 className="text-2xl font-bold text-gray-900">245K</h3>
                  <p className="text-sm text-green-600">+22% from last month</p>
                </div>
                <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="glass-panel p-6 hover-scale">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Available Funds</p>
                  <h3 className="text-2xl font-bold text-gray-900">$5,280</h3>
                  <p className="text-sm text-yellow-600">Add funds</p>
                </div>
                <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Main Navigation */}
          <div className="glass-panel mb-8">
            <nav className="flex space-x-1 p-2">
              <button
                onClick={() => setActiveTab("sponsored-ads")}
                className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === "sponsored-ads"
                    ? "bg-white text-cyan-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <i className="fas fa-ad mr-2"></i>
                Sponsored Ads
              </button>
              <button
                onClick={() => setActiveTab("analytics")}
                className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === "analytics"
                    ? "bg-white text-cyan-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <i className="fas fa-chart-line mr-2"></i>
                Analytics
              </button>
              <button
                onClick={() => setActiveTab("funds")}
                className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === "funds"
                    ? "bg-white text-cyan-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <i className="fas fa-wallet mr-2"></i>
                Funds
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === "settings"
                    ? "bg-white text-cyan-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <i className="fas fa-cog mr-2"></i>
                Settings
              </button>
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="glass-panel">
            <div className="p-6">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 