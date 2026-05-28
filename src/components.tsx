import React, { useState } from 'react';

// 1. Math Algorithm
export const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c;
};

// 2. Image Carousel Component
export const ImageCarousel = ({ images }: { images: string[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="relative w-full h-40 group/slider overflow-hidden bg-slate-200">
      <img src={images[currentIndex]} alt="location" className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
      {images.length > 1 && (
        <>
          <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white w-6 h-6 rounded-full opacity-0 group-hover/slider:opacity-100 transition flex items-center justify-center text-xs">◀</button>
          <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white w-6 h-6 rounded-full opacity-0 group-hover/slider:opacity-100 transition flex items-center justify-center text-xs">▶</button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, idx) => (
              <span key={idx} className={`h-1.5 w-1.5 rounded-full ${idx === currentIndex ? 'bg-white' : 'bg-white/50'}`}></span>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// 3. Dynamic Travel Connector Component (Hyper-Realistic Math)
export const TravelConnector = ({ prevItem, currentItem }: { prevItem: any, currentItem: any }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState(currentItem.timelineType === 'restaurant' ? 'walk' : 'drive');

  const distanceKm = calculateDistanceKm(prevItem.lat, prevItem.lng, currentItem.lat, currentItem.lng);
  
  // Real-world urban travel logic
  const walkMins = Math.max(1, Math.round((distanceKm / 5) * 60));
  
  // If under 200m, driving takes longer because of parking. Otherwise, add 5 mins buffer for traffic lights/parking!
  const driveMins = distanceKm < 0.2 
    ? walkMins + 3 
    : Math.max(3, Math.round((distanceKm / 30) * 60) + 5);
    
  // Trains have waiting times at the station, so we add a 15 min buffer
  const transitMins = Math.max(10, Math.round((distanceKm / 40) * 60) + 15); 

  const displayDist = distanceKm < 1 ? `${Math.round(distanceKm * 1000)}m` : `${distanceKm.toFixed(1)}km`;

  const options = [
    { mode: 'drive', icon: '🚗', label: `${driveMins} mins drive` },
    { mode: 'transit', icon: '🚆', label: `${transitMins} mins train` },
    { mode: 'walk', icon: '🚶', label: `${walkMins} mins walk` }
  ];

  const activeOption = options.find(o => o.mode === selectedMode) || options[0];

  return (
    <div className="absolute -top-[34px] left-0 z-10">
      <div className="relative">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-white px-2.5 py-1 rounded-full border border-slate-200 shadow-sm hover:bg-slate-50 transition"
        >
          {activeOption.icon} {activeOption.label} 
          <span className="text-slate-400 font-medium ml-1">({displayDist})</span>
          <span className="text-[10px] ml-1">▼</span>
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden z-20 w-44">
            {options.map((opt) => (
              <button
                key={opt.mode}
                onClick={() => {
                  setSelectedMode(opt.mode);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-blue-50 transition ${selectedMode === opt.mode ? 'bg-blue-50 text-blue-600' : 'text-slate-600'}`}
              >
                {opt.icon} {opt.label} <span className="text-slate-400 opacity-70">({displayDist})</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};