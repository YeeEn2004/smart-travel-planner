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

// 3. Dynamic Travel Connector Component (Now Powered by OSRM API!)
export const TravelConnector = ({ prevItem, currentItem }: { prevItem: any, currentItem: any }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState(currentItem.timelineType === 'restaurant' ? 'walk' : 'drive');
  
  // NEW: State to hold real API data and loading status
  const [routeData, setRouteData] = useState<{ drive: any, walk: any }>({ drive: null, walk: null });
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const fetchRoutes = async () => {
      setIsLoading(true);
      try {
        // OSRM requires coordinates in Longitude, Latitude order
        const coords = `${prevItem.lng},${prevItem.lat};${currentItem.lng},${currentItem.lat}`;

        // Fetch real road data simultaneously
        const [driveRes, walkRes] = await Promise.all([
          fetch(`https://router.project-osrm.org/route/v1/driving/${coords}?overview=false`),
          fetch(`https://router.project-osrm.org/route/v1/foot/${coords}?overview=false`)
        ]);

        const driveJson = await driveRes.json();
        const walkJson = await walkRes.json();

        setRouteData({
          drive: driveJson.routes?.[0] || null,
          walk: walkJson.routes?.[0] || null
        });
      } catch (error) {
        console.error("OSRM Routing API failed, falling back to math:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoutes();
  }, [prevItem, currentItem]);

  // Helper function to process API data or fallback to math
  const getRouteInfo = (apiRoute: any, fallbackSpeedKmH: number) => {
    if (apiRoute) {
      // API returns duration in seconds and distance in meters
      const mins = Math.max(1, Math.round(apiRoute.duration / 60));
      const distKm = apiRoute.distance / 1000;
      const displayDist = distKm < 1 ? `${Math.round(apiRoute.distance)}m` : `${distKm.toFixed(1)}km`;
      return { mins, displayDist, distKm };
    }
    
    // Fallback if API fails
    const distanceKm = calculateDistanceKm(prevItem.lat, prevItem.lng, currentItem.lat, currentItem.lng);
    const mins = Math.max(1, Math.round((distanceKm / fallbackSpeedKmH) * 60));
    const displayDist = distanceKm < 1 ? `${Math.round(distanceKm * 1000)}m` : `${distanceKm.toFixed(1)}km`;
    return { mins, displayDist, distKm: distanceKm };
  };

  const driveInfo = getRouteInfo(routeData.drive, 30);
  const walkInfo = getRouteInfo(routeData.walk, 5);
  // OSRM doesn't track public transit, so we calculate it relative to the real road distance
  const transitMins = Math.max(1, Math.round((driveInfo.distKm / 40) * 60) + 10); 

  const options = [
    { mode: 'drive', icon: '🚗', label: isLoading ? '...' : `${driveInfo.mins} mins drive`, dist: driveInfo.displayDist },
    { mode: 'transit', icon: '🚆', label: isLoading ? '...' : `${transitMins} mins train`, dist: driveInfo.displayDist },
    { mode: 'walk', icon: '🚶', label: isLoading ? '...' : `${walkInfo.mins} mins walk`, dist: walkInfo.displayDist }
  ];

  const activeOption = options.find(o => o.mode === selectedMode) || options[0];

  return (
    <div className="absolute -top-[34px] left-0 z-10">
      <div className="relative">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
          className={`flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-white px-2.5 py-1 rounded-full border border-slate-200 shadow-sm transition ${isLoading ? 'opacity-70 cursor-wait' : 'hover:bg-slate-50'}`}
        >
          {activeOption.icon} {activeOption.label} 
          {!isLoading && <span className="text-slate-400 font-medium ml-1">({activeOption.dist})</span>}
          <span className="text-[10px] ml-1">▼</span>
        </button>

        {isOpen && !isLoading && (
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
                {opt.icon} {opt.label} <span className="text-slate-400 opacity-70">({opt.dist})</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};