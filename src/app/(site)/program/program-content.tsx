'use client';
import React, { useState } from 'react';

const scheduleData = {
  day1: [
    { time: '08:00 AM - 09:00 AM', title: 'Registration & Welcome Breakfast', speaker: '', type: 'break' },
    { time: '09:00 AM - 10:30 AM', title: 'Keynote: Advances in Computational Imaging', speaker: 'Dr. Elena Rostova, MIT', type: 'keynote' },
    { time: '10:30 AM - 11:00 AM', title: 'Coffee Break & Networking', speaker: '', type: 'break' },
    { time: '11:00 AM - 12:30 PM', title: 'Session 1: Compressive Sensing Applications', speaker: 'Multiple Speakers', type: 'session' },
    { time: '12:30 PM - 02:00 PM', title: 'Lunch Break', speaker: '', type: 'break' },
    { time: '02:00 PM - 03:30 PM', title: 'Session 2: Deep Learning in Optics', speaker: 'Multiple Speakers', type: 'session' },
  ],
  day2: [
    { time: '09:00 AM - 10:30 AM', title: 'Session 3: Computational Microscopy', speaker: 'Multiple Speakers', type: 'session' },
    { time: '10:30 AM - 11:00 AM', title: 'Coffee Break', speaker: '', type: 'break' },
    { time: '11:00 AM - 12:30 PM', title: 'Session 4: Phase Retrieval', speaker: 'Multiple Speakers', type: 'session' },
    { time: '12:30 PM - 02:00 PM', title: 'Lunch Break', speaker: '', type: 'break' },
    { time: '02:00 PM - 04:00 PM', title: 'Poster Session', speaker: '', type: 'session' },
  ],
  day3: [
    { time: '09:00 AM - 11:00 AM', title: 'Session 5: Novel Imaging Architectures', speaker: 'Multiple Speakers', type: 'session' },
    { time: '11:00 AM - 11:30 AM', title: 'Coffee Break', speaker: '', type: 'break' },
    { time: '11:30 AM - 01:00 PM', title: 'Closing Keynote & Awards', speaker: 'Dr. Alan Turing', type: 'keynote' },
  ]
};

export default function ProgramContent() {
  const [activeTab, setActiveTab] = useState<'all' | 'day1' | 'day2' | 'day3'>('all');

  const tabs = [
    { id: 'all', label: 'All Days' },
    { id: 'day1', label: 'Day 1 (Oct 15)' },
    { id: 'day2', label: 'Day 2 (Oct 16)' },
    { id: 'day3', label: 'Day 3 (Oct 17)' },
  ];

  const renderSchedule = (items: typeof scheduleData.day1, dayLabel?: string) => (
    <div className="space-y-6">
      {dayLabel && <h2 className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-4">{dayLabel}</h2>}
      {items.map((item, index) => (
        <div 
          key={index}
          className={`group relative flex flex-col md:flex-row gap-4 md:gap-8 p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
            item.type === 'break' 
              ? 'bg-gray-50 dark:bg-gray-800/50' 
              : 'bg-white dark:bg-dark-secondary border border-gray-100 dark:border-gray-700 shadow-sm'
          }`}
        >
          <div className="md:w-1/4 shrink-0">
            <div className="text-primary-500 font-bold text-lg">{item.time}</div>
            <div className="text-xs font-semibold text-gray-400 uppercase mt-1 tracking-wide">{item.type}</div>
          </div>
          <div>
            <h3 className={`text-xl font-bold mb-2 ${item.type === 'break' ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
              {item.title}
            </h3>
            {item.speaker && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="font-medium">{item.speaker}</span>
              </div>
            )}
          </div>
          
          {/* Decorative hover indicator */}
          <div className="absolute inset-y-0 left-0 w-1 bg-primary-500 rounded-l-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      ))}
    </div>
  );

  return (
    <main className="min-h-screen py-16 lg:py-24 bg-gray-50 dark:bg-dark-secondary relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob" style={{ animationDelay: '2000ms' }} />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob" style={{ animationDelay: '4000ms' }} />

      <div className="container px-4 mx-auto relative z-10 max-w-5xl">
        <div className="text-center mb-16">
          <span className="text-primary-500 font-semibold tracking-wider uppercase text-sm mb-4 block">Schedule</span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Conference Program
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Explore the packed schedule of WACCI 2026. Featuring world-class keynotes, deep-dive sessions, and unparalleled networking opportunities in computational and compressive imaging.
          </p>
        </div>

        <div className="bg-white dark:bg-dark-primary rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden mb-12">
          <div className="flex flex-wrap border-b border-gray-100 dark:border-gray-800">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-4 px-2 min-w-[120px] text-center font-medium transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'text-primary-500 border-primary-500 bg-primary-50/50 dark:bg-primary-900/10'
                    : 'text-gray-500 border-transparent hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6 md:p-10">
            {activeTab === 'all' && (
              <div className="space-y-12">
                {renderSchedule(scheduleData.day1, 'Day 1 (Oct 15)')}
                <div className="w-full h-px bg-gray-200 dark:bg-gray-800" />
                {renderSchedule(scheduleData.day2, 'Day 2 (Oct 16)')}
                <div className="w-full h-px bg-gray-200 dark:bg-gray-800" />
                {renderSchedule(scheduleData.day3, 'Day 3 (Oct 17)')}
              </div>
            )}
            {activeTab === 'day1' && renderSchedule(scheduleData.day1)}
            {activeTab === 'day2' && renderSchedule(scheduleData.day2)}
            {activeTab === 'day3' && renderSchedule(scheduleData.day3)}
          </div>
        </div>
      </div>
    </main>
  );
}
