"use client";
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  SponsoredAds,
  CrossPromotions,
  PaidSubscriptions,
  TipsAndDonations,
  DigitalProducts,
  AffiliateProgram
} from './monetization/index';

export default function Monetization() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(null);
  const [sponsoredAds, setSponsoredAds] = useState([]);
  const [crossPromotions, setCrossPromotions] = useState([]);
  const [subscriptionTiers, setSubscriptionTiers] = useState([]);
  const [donations, setDonations] = useState([]);
  const [donationTiers, setDonationTiers] = useState([]);
  const [digitalProducts, setDigitalProducts] = useState([]);
  const [affiliateReferrals, setAffiliateReferrals] = useState([]);
  const [affiliateLinks, setAffiliateLinks] = useState([]);
  const [stats, setStats] = useState({
    sponsoredAds: { averageEarnings: 0, activeSponsors: 0, platformFee: 20 },
    crossPromotions: { clicks: 0, totalRevenue: 0, platformFee: 20 },
    paidSubscriptions: { subscribers: 0, totalRevenue: 0, platformFee: 10 },
    tipsAndDonations: { supporters: 0, totalTips: 0, platformFee: 10 },
    digitalProducts: { productsSold: 0, totalSales: 0, platformFee: 10 },
    affiliateProgram: { referrals: 0, totalCommission: 0, platformFee: 50 },
  });

  // Fetch initial data
  useEffect(() => {
    fetchMonetizationData();
  }, []);

  const fetchMonetizationData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/monetization');
      if (!response.ok) throw new Error('Failed to fetch monetization data');
      
      const data = await response.json();
      setSponsoredAds(data.sponsoredAds);
      setCrossPromotions(data.crossPromotions);
      setSubscriptionTiers(data.subscriptionTiers);
      setDonations(data.donations);
      setDonationTiers(data.donationTiers);
      setDigitalProducts(data.digitalProducts);
      setAffiliateReferrals(data.affiliateReferrals);
      setAffiliateLinks(data.affiliateLinks);
      setStats(data.stats);
    } catch (error) {
      toast.error('Failed to load monetization data');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const MonetizationCard = ({ 
    icon, 
    title, 
    description, 
    stats, 
    color = "cyan",
    showArrow = true,
    onClick
  }) => (
    <div 
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <i className={`fas ${icon} text-${color}-500 text-2xl mr-3`}></i>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        {showArrow && (
          <i className={`fas fa-chevron-right text-${color}-500`}></i>
        )}
      </div>
      <p className="text-gray-600 mb-6">{description}</p>
      <div className="space-y-2">
        {stats.map((stat, index) => (
          <div key={index} className="flex items-center">
            <i className={`fas ${stat.icon} text-${stat.color}-500 mr-2`}></i>
            <span className="text-sm text-gray-600">{stat.text}</span>
          </div>
        ))}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Monetization</h2>
      
      {activeSection === 'sponsored-ads' ? (
        <SponsoredAds 
          sponsoredAds={sponsoredAds} 
          onClose={() => setActiveSection(null)} 
        />
      ) : activeSection === 'cross-promotions' ? (
        <CrossPromotions 
          crossPromotions={crossPromotions} 
          onClose={() => setActiveSection(null)} 
        />
      ) : activeSection === 'paid-subscriptions' ? (
        <PaidSubscriptions 
          subscriptionTiers={subscriptionTiers} 
          onClose={() => setActiveSection(null)} 
        />
      ) : activeSection === 'tips-donations' ? (
        <TipsAndDonations 
          donations={donations}
          donationTiers={donationTiers}
          onClose={() => setActiveSection(null)} 
        />
      ) : activeSection === 'digital-products' ? (
        <DigitalProducts 
          digitalProducts={digitalProducts} 
          onClose={() => setActiveSection(null)} 
        />
      ) : activeSection === 'affiliate-program' ? (
        <AffiliateProgram 
          affiliateReferrals={affiliateReferrals}
          affiliateLinks={affiliateLinks}
          onClose={() => setActiveSection(null)} 
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sponsored Ads */}
          <MonetizationCard
            icon="fa-ad"
            title="Sponsored Ads"
            description="Partner with brands and monetize your newsletter through sponsored ads. You earn 80% of all sponsored ad revenue."
            stats={[
              {
                icon: "fa-chart-line",
                color: "green",
                text: `Average earnings: $${stats.sponsoredAds.averageEarnings} (your share: $${stats.sponsoredAds.averageEarnings * 0.8})`
              },
              {
                icon: "fa-handshake",
                color: "green",
                text: `${stats.sponsoredAds.activeSponsors} active sponsors`
              },
              {
                icon: "fa-info-circle",
                color: "cyan",
                text: `Platform fee: ${stats.sponsoredAds.platformFee}%`
              }
            ]}
            onClick={() => setActiveSection('sponsored-ads')}
          />

          {/* Cross-Promotions */}
          <MonetizationCard
            icon="fa-bolt"
            title="Cross-Promotions"
            description="Promote other newsletters in your subscription flow and earn 80% of the revenue."
            color="red"
            stats={[
              {
                icon: "fa-mouse-pointer",
                color: "green",
                text: `${crossPromotions.reduce((sum, promo) => sum + promo.clicks, 0)} clicks generated`
              },
              {
                icon: "fa-dollar-sign",
                color: "green",
                text: `Total revenue: $${crossPromotions.reduce((sum, promo) => sum + promo.revenue, 0).toFixed(2)} (your share: $${(crossPromotions.reduce((sum, promo) => sum + promo.revenue, 0) * 0.8).toFixed(2)})`
              },
              {
                icon: "fa-info-circle",
                color: "cyan",
                text: `Platform fee: ${stats.crossPromotions.platformFee}%`
              }
            ]}
            onClick={() => setActiveSection('cross-promotions')}
          />

          {/* Paid Subscriptions */}
          <MonetizationCard
            icon="fa-credit-card"
            title="Paid Subscriptions"
            description="Offer premium content through paid subscriptions and earn 90% of subscription revenue."
            color="yellow"
            stats={[
              {
                icon: "fa-users",
                color: "green",
                text: `${subscriptionTiers.reduce((sum, tier) => sum + tier.subscribers, 0)} subscribers`
              },
              {
                icon: "fa-dollar-sign",
                color: "green",
                text: `Total revenue: $${subscriptionTiers.reduce((sum, tier) => sum + tier.revenue, 0).toFixed(2)} (your share: $${(subscriptionTiers.reduce((sum, tier) => sum + tier.revenue, 0) * 0.9).toFixed(2)})`
              },
              {
                icon: "fa-info-circle",
                color: "cyan",
                text: `Platform fee: ${stats.paidSubscriptions.platformFee}%`
              }
            ]}
            onClick={() => setActiveSection('paid-subscriptions')}
          />

          {/* Tips & Donations Card */}
          <MonetizationCard
            icon="fa-gift"
            title="Tips & Donations"
            description="Accept tips and donations from your supportive readers."
            color="pink"
            stats={[
              {
                icon: "fa-heart",
                color: "green",
                text: `${new Set(donations.map(d => d.supporter)).size} supporters`
              },
              {
                icon: "fa-dollar-sign",
                color: "green",
                text: `Total tips: $${donations.reduce((sum, d) => sum + d.amount, 0).toFixed(2)} (your share: $${(donations.reduce((sum, d) => sum + d.amount, 0) * 0.9).toFixed(2)})`
              },
              {
                icon: "fa-info-circle",
                color: "cyan",
                text: `Platform fee: ${stats.tipsAndDonations.platformFee}%`
              }
            ]}
            onClick={() => setActiveSection('tips-donations')}
          />

          {/* Digital Products Card */}
          <MonetizationCard
            icon="fa-shopping-cart"
            title="Digital Products"
            description="Sell courses, ebooks, and other digital products and earn sales revenue."
            color="purple"
            stats={[
              {
                icon: "fa-box",
                color: "green",
                text: `${digitalProducts.reduce((sum, product) => sum + product.sales, 0)} products sold`
              },
              {
                icon: "fa-dollar-sign",
                color: "green",
                text: `Total sales: $${digitalProducts.reduce((sum, product) => sum + product.revenue, 0).toFixed(2)} (your share: $${(digitalProducts.reduce((sum, product) => sum + product.revenue, 0) * 0.9).toFixed(2)})`
              },
              {
                icon: "fa-info-circle",
                color: "cyan",
                text: `Platform fee: ${stats.digitalProducts.platformFee}%`
              }
            ]}
            onClick={() => setActiveSection('digital-products')}
          />

          {/* Affiliate Program Card */}
          <MonetizationCard
            icon="fa-share-alt"
            title="Affiliate Program"
            description="Earn 50% commission by promoting Newsletterfy to your audience."
            color="green"
            stats={[
              {
                icon: "fa-user-plus",
                color: "green",
                text: `${affiliateReferrals.length} referrals`
              },
              {
                icon: "fa-dollar-sign",
                color: "green",
                text: `Total commission: $${affiliateReferrals.reduce((sum, ref) => sum + ref.commission, 0).toFixed(2)}`
              },
              {
                icon: "fa-info-circle",
                color: "cyan",
                text: `Platform fee: ${stats.affiliateProgram.platformFee}%`
              }
            ]}
            onClick={() => setActiveSection('affiliate-program')}
          />
        </div>
      )}
    </div>
  );
}