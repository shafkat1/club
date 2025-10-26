'use client';

import React, { useState } from 'react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    id: '1',
    category: 'Getting Started',
    question: 'How do I create an account?',
    answer: 'Download the Desh app or visit desh.co. Click "Sign Up" and enter your phone number or email. You\'ll receive an OTP to verify your account. You can also use social login (Google, Facebook, Instagram, etc.).',
  },
  {
    id: '2',
    category: 'Getting Started',
    question: 'How do groups work?',
    answer: 'Groups help you organize people going to the same venue. Create a group for your friends heading to a bar or club. Invite friends to join, and everyone in the group can see each other and buy drinks for one another.',
  },
  {
    id: '3',
    category: 'Buying Drinks',
    question: 'How do I buy someone a drink?',
    answer: 'Open the "Buy a Drink" tab, select your group, and choose a friend. Enter the drink type and payment method. You can pay via Apple Pay, Google Pay, or card. The recipient will receive a notification and can accept or decline.',
  },
  {
    id: '4',
    category: 'Buying Drinks',
    question: 'How does payment work?',
    answer: 'We use Stripe for secure payments. You can add your card once and use it for all transactions. We also support Apple Pay and Google Pay for faster checkout. All payments are encrypted and PCI-DSS compliant.',
  },
  {
    id: '5',
    category: 'Security & Privacy',
    question: 'Is my data safe?',
    answer: 'Yes! We use industry-standard encryption for all data. Your payment information is processed by Stripe and never stored on our servers. We follow GDPR and have a strict privacy policy available in Settings.',
  },
  {
    id: '6',
    category: 'Security & Privacy',
    question: 'Can I hide my profile?',
    answer: 'Absolutely! Go to Settings and choose "Private" for profile visibility. You can also adjust who can see your location and buy drinks for you.',
  },
  {
    id: '7',
    category: 'Troubleshooting',
    question: 'I didn\'t receive a notification. What should I do?',
    answer: 'Check that notifications are enabled in your Settings. On mobile, make sure the app has notification permissions. Try disabling and re-enabling notifications, then restart the app.',
  },
  {
    id: '8',
    category: 'Troubleshooting',
    question: 'How do I report a problem?',
    answer: 'Use the Report option in the app menu or email support@desh.co. Include details about the issue and screenshots if possible. Our support team typically responds within 24 hours.',
  },
];

export default function HelpPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(faqs.map(faq => faq.category)));
  const filteredFaqs = selectedCategory
    ? faqs.filter(faq => faq.category === selectedCategory)
    : faqs;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Help & Support</h1>
          <p className="text-lg text-gray-600">Find answers to common questions about Desh</p>
        </div>

        {/* Support Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <a
            href="mailto:support@desh.co"
            className="block p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="text-3xl mb-3">💌</div>
            <h3 className="font-semibold text-gray-900 mb-2">Email Support</h3>
            <p className="text-sm text-gray-600">support@desh.co</p>
            <p className="text-xs text-gray-500 mt-2">Response within 24h</p>
          </a>

          <a
            href="https://twitter.com/desh"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="text-3xl mb-3">𝕏</div>
            <h3 className="font-semibold text-gray-900 mb-2">Follow Us</h3>
            <p className="text-sm text-gray-600">@desh</p>
            <p className="text-xs text-gray-500 mt-2">Latest news & updates</p>
          </a>

          <a
            href="https://status.desh.co"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-semibold text-gray-900 mb-2">Status Page</h3>
            <p className="text-sm text-gray-600">Check uptime</p>
            <p className="text-xs text-gray-500 mt-2">System status & incidents</p>
          </a>
        </div>

        {/* FAQ Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>

          {/* Category Filter */}
          <div className="mb-8 flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full font-medium transition-colors ${
                selectedCategory === null
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              All
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* FAQ Items */}
          <div className="space-y-4">
            {filteredFaqs.map(faq => (
              <div
                key={faq.id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-lg font-medium text-gray-900 text-left">
                    {faq.question}
                  </h3>
                  <div className={`flex-shrink-0 text-2xl transition-transform ${
                    expandedId === faq.id ? 'rotate-180' : ''
                  }`}>
                    ▼
                  </div>
                </button>

                {expandedId === faq.id && (
                  <div className="px-6 pb-4 border-t border-gray-200 bg-gray-50">
                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Additional Resources */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Need More Help?</h3>
          <p className="text-blue-800 mb-4">
            Can't find what you're looking for? Our support team is here to help!
          </p>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Contact Support
          </button>
        </div>

        {/* Legal Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <a href="/privacy" className="text-gray-600 hover:text-gray-900">
              Privacy Policy
            </a>
            <a href="/terms" className="text-gray-600 hover:text-gray-900">
              Terms of Service
            </a>
            <a href="/cookies" className="text-gray-600 hover:text-gray-900">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
