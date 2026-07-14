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

type ProgramTab = 'all' | 'day1' | 'day2' | 'day3';

export default function ProgramContent() {
  const [activeTab, setActiveTab] = useState<ProgramTab>('all');

  const tabs: { id: ProgramTab; label: string }[] = [
    { id: 'all', label: 'All Days' },
    { id: 'day1', label: 'Day 1 (Oct 15)' },
    { id: 'day2', label: 'Day 2 (Oct 16)' },
    { id: 'day3', label: 'Day 3 (Oct 17)' },
  ];

  const renderSchedule = (items: typeof scheduleData.day1, dayLabel?: string) => (
    <div className="space-y-4">
      {dayLabel && <h2 className="text-2xl font-bold text-primary-500 mb-6 animate-fade-up">{dayLabel}</h2>}
      {items.map((item, index) => (
        <div 
          key={index}
          className={`group relative flex flex-col md:flex-row gap-4 md:gap-8 p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg animate-fade-up ${
            item.type === 'break' 
              ? 'bg-gray-50 border border-transparent' 
              : 'bg-white border border-gray-100 shadow-sm'
          }`}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="md:w-1/4 shrink-0">
            <div className="text-primary-500 font-bold text-base">{item.time}</div>
            <div className="text-[10px] font-bold text-gray-400 uppercase mt-1 tracking-wider">{item.type}</div>
          </div>
          <div>
            <h3 className={`text-lg font-bold mb-2 ${item.type === 'break' ? 'text-gray-500' : 'text-primary-500'}`}>
              {item.title}
            </h3>
            {item.speaker && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="font-medium">{item.speaker}</span>
              </div>
            )}
          </div>
          
          <div className="absolute inset-y-0 left-0 w-1 bg-primary-500 rounded-l-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      ))}
    </div>
  );

  const renderCompactSchedule = (items: typeof scheduleData.day1, dayLabel: string) => (
    <div className="flex flex-col">
      <div className="bg-primary-500/5 border border-primary-100 rounded-xl p-3 mb-4 text-center animate-fade-up">
        <h2 className="text-base md:text-lg font-bold text-primary-500">{dayLabel}</h2>
      </div>
      <div className="space-y-3 flex-1">
        {items.map((item, index) => (
          <div 
            key={index}
            className={`group relative flex flex-col gap-1.5 p-3 md:p-4 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-md animate-fade-up h-[120px] ${
              item.type === 'break' 
                ? 'bg-gray-50 border border-transparent' 
                : 'bg-white border border-gray-100 shadow-sm'
            }`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div>
              <div className="flex items-center justify-between gap-1">
                <div className="text-primary-500 font-bold text-[10px] md:text-xs">{item.time}</div>
                <div className="text-[8px] md:text-[9px] font-bold text-gray-400 uppercase tracking-wider">{item.type}</div>
              </div>
            </div>
            <div className="flex flex-col justify-center flex-1">
              <h3 className={`text-xs md:text-sm font-bold leading-snug line-clamp-2 ${item.type === 'break' ? 'text-gray-500' : 'text-primary-500'}`}>
                {item.title}
              </h3>
              {item.speaker && (
                <div className="flex items-center gap-1 text-[10px] md:text-xs text-gray-600 mt-1.5">
                  <svg className="w-3 h-3 md:w-3.5 md:h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="font-medium line-clamp-1">{item.speaker}</span>
                </div>
              )}
            </div>
            <div className="absolute inset-y-0 left-0 w-1 bg-primary-500 rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <main className="min-h-screen py-16 lg:py-24 bg-[#FAFAFA] relative overflow-hidden">
      {/* Blue-only background gradients */}
      <div className="absolute top-20 -left-20 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl animate-blob opacity-60" />
      <div className="absolute top-20 -right-20 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl animate-blob opacity-60" style={{ animationDelay: '2000ms' }} />

      <div className="container px-4 mx-auto relative z-10 max-w-7xl">
        <div className="text-center mb-16 section-title-motion">
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary-500 mb-4">
            Conference Program
          </h1>
          <span className="text-primary-500 font-bold tracking-widest uppercase text-xs mb-6 block">To be defined</span>
        </div>

        {/* Program details are commented out until the schedule is defined. */}
        {false && (
          <>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto section-copy-motion leading-relaxed">
              Explore the packed schedule of WACCI 2026. Featuring world-class keynotes, deep-dive sessions, and unparalleled networking opportunities in computational and compressive imaging.
            </p>

            <div className="bg-white rounded-[24px] shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden mb-12 animate-fade-up animate-delay-2">
              <div className="flex flex-wrap border-b border-gray-100 px-4 pt-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-4 px-2 min-w-[120px] text-center text-sm font-semibold transition-all border-b-2 ${
                      activeTab === tab.id
                        ? 'text-primary-500 border-primary-500'
                        : 'text-gray-500 border-transparent hover:text-primary-400'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6 md:p-8">
                {activeTab === 'all' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    {renderCompactSchedule(scheduleData.day1, 'Day 1 (Oct 15)')}
                    {renderCompactSchedule(scheduleData.day2, 'Day 2 (Oct 16)')}
                    {renderCompactSchedule(scheduleData.day3, 'Day 3 (Oct 17)')}
                  </div>
                )}
                
                {activeTab !== 'all' && (
                  <div className="max-w-4xl mx-auto">
                    {activeTab === 'day1' && renderSchedule(scheduleData.day1)}
                    {activeTab === 'day2' && renderSchedule(scheduleData.day2)}
                    {activeTab === 'day3' && renderSchedule(scheduleData.day3)}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
