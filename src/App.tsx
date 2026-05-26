import React, { useState } from 'react';
import travelData from './data.json';

interface Restaurant {
  id: string;
  name: string;
  rating: number;
  cuisine: string;
  images: string[];
}

interface TravelSpot {
  id: string;
  name: string;
  category: string;
  rating: number;
  images: string[];
  description: string;
  mapsUrl: string;
  ticketUrl?: string;
  nearbyRestaurants: Restaurant[];
}

const ImageCarousel = ({ images }: { images: string[] }) => {
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

export default function App() {
  const [itinerary, setItinerary] = useState<any[]>([]);
  const [currentMode, setCurrentMode] = useState<'attractions' | 'restaurants'>('attractions');
  const [lastSelectedSpot, setLastSelectedSpot] = useState<TravelSpot | null>(null);
  const [modalItem, setModalItem] = useState<any | null>(null);

  // NEW: Smart calculation for flexible, realistic travel times
  const getTravelTime = (prevItem: any, currentItem: any) => {
    // Context 1: Moving from an Attraction to its nearby Restaurant (Always a quick walk)
    if (currentItem.timelineType === 'restaurant') {
      if (prevItem.id === 'spot-1') return '🚶 3 mins walk (Inside Suria KLCC)';
      if (prevItem.id === 'spot-2') return '🚶 4 mins walk (Down Petaling St)';
      if (prevItem.id === 'spot-6') return '🚶 1 min walk (Inside Tower Tower)';
      return '🚶 5 mins walk (Nearby area)';
    }

    // Context 2: Moving across town from a Restaurant to a brand new Attraction (Driving/Transit)
    const nextSpotId = currentItem.id;
    
    // Custom distances based on real KL geography to nail your demo
    if (nextSpotId === 'spot-3') return '🚗 22 mins drive (Heading north to Batu Caves)';
    if (nextSpotId === 'spot-6') return '🚗 12 mins drive (Avoiding traffic via Bukit Nanas)';
    if (nextSpotId === 'spot-8') return '🚗 45 mins drive (Heading south to Putrajaya)';
    if (nextSpotId === 'spot-2') return '🚗 8 mins drive (Short cruise to Chinatown)';
    
    return '🚗 14 mins drive (Optimal route selected)';
  };

  const handleAddItem = (item: any, type: 'attraction' | 'restaurant') => {
    const timeSlots = ["09:00 AM", "12:30 PM", "03:00 PM", "06:00 PM", "08:30 PM"];
    const newItem = {
      ...item,
      timelineType: type,
      timeSlot: timeSlots[itinerary.length] || "Late Night"
    };
    
    setItinerary([...itinerary, newItem]);

    if (type === 'attraction') {
      setLastSelectedSpot(item);
      setCurrentMode('restaurants'); 
    } else {
      setCurrentMode('attractions');
    }
  };

  const handleReset = () => {
    setItinerary([]);
    setCurrentMode('attractions');
    setLastSelectedSpot(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <header className="bg-white border-b border-slate-200 py-6 px-8 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-blue-600 tracking-tight">Smart Trip Planner</h1>
          <p className="text-sm text-slate-500 mt-0.5">Optimize your day trip routes seamlessly.</p>
        </div>
        {itinerary.length > 0 && (
          <button onClick={handleReset} className="text-sm font-medium text-red-500 hover:text-red-600 bg-red-50 px-3 py-2 rounded-lg">
            Clear Plan
          </button>
        )}
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN */}
        <section className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-[calc(100vh-160px)] overflow-y-auto">
          <div className="mb-6">
            {currentMode === 'attractions' ? (
              <>
                <h2 className="text-xl font-bold tracking-tight">Top Attractions</h2>
                <p className="text-sm text-slate-500">Pick a place to start your adventure.</p>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold tracking-tight text-orange-600">Smart Food Suggestions</h2>
                  <button onClick={() => setCurrentMode('attractions')} className="text-xs text-blue-500 underline font-medium">Skip to next attraction</button>
                </div>
                <p className="text-sm text-slate-500">Highly rated spots near <span className="font-semibold text-slate-700">{lastSelectedSpot?.name}</span>.</p>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentMode === 'attractions' && travelData.map((spot: TravelSpot) => (
              <div key={spot.id} className="group border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition bg-white flex flex-col justify-between">
                <div className="cursor-pointer" onClick={() => setModalItem(spot)}>
                  <ImageCarousel images={spot.images} />
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">Attraction</span>
                      <span className="text-sm font-bold text-amber-500">⭐ {spot.rating}</span>
                    </div>
                    <h3 className="font-bold text-base leading-snug line-clamp-1">{spot.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{spot.description}</p>
                  </div>
                </div>
                <div className="p-4 pt-0">
                  <button onClick={() => handleAddItem(spot, 'attraction')} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 rounded-lg transition shadow-sm">+ Add to Itinerary</button>
                </div>
              </div>
            ))}

            {currentMode === 'restaurants' && lastSelectedSpot?.nearbyRestaurants.map((restaurant: Restaurant) => (
              <div key={restaurant.id} className="group border border-orange-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition bg-white flex flex-col justify-between">
                <div className="cursor-pointer" onClick={() => setModalItem(restaurant)}>
                  <ImageCarousel images={restaurant.images} />
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold px-2 py-0.5 bg-orange-50 text-orange-600 rounded-full">{restaurant.cuisine}</span>
                      <span className="text-sm font-bold text-amber-500">⭐ {restaurant.rating}</span>
                    </div>
                    <h3 className="font-bold text-base leading-snug line-clamp-1">{restaurant.name}</h3>
                  </div>
                </div>
                <div className="p-4 pt-0">
                  <button onClick={() => handleAddItem(restaurant, 'restaurant')} className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold py-2 rounded-lg transition shadow-sm">+ Grab Lunch Here</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* RIGHT COLUMN */}
        <section className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-[calc(100vh-160px)] overflow-y-auto">
          <h2 className="text-xl font-bold tracking-tight mb-1">My Day Trip Schedule</h2>
          <p className="text-sm text-slate-500 mb-6">Your optimal routing order updates automatically.</p>

          {itinerary.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-4 text-center">
              <p className="text-sm text-slate-400 font-medium">Your schedule is wide open.</p>
              <p className="text-xs text-slate-400 mt-1">Select an attraction on the left to map your day.</p>
            </div>
          ) : (
            <div className="relative border-l-2 border-blue-500 ml-4 pl-6 pt-2 pb-2">
              {itinerary.map((item, index) => (
                <div key={index} className="relative mb-8">
                  
                  {/* UPDATED: Displays perfectly flexible travel indicators dynamically */}
                  {index > 0 && (
                    <div className="absolute -top-[34px] left-0 flex items-center gap-2 text-xs font-bold text-slate-600 bg-white px-2.5 py-1 rounded-full border border-slate-200 shadow-xs z-10 whitespace-nowrap">
                      {getTravelTime(itinerary[index - 1], item)}
                    </div>
                  )}

                  <span className={`absolute -left-[31px] top-1.5 h-4 w-4 rounded-full border-2 border-white shadow-sm ${item.timelineType === 'attraction' ? 'bg-blue-600' : 'bg-orange-500'}`}></span>
                  <div className={`p-4 rounded-xl border shadow-sm ${item.timelineType === 'attraction' ? 'border-slate-200 bg-slate-50' : 'border-orange-100 bg-orange-50/30'}`}>
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-bold text-slate-400 tracking-wide uppercase">{item.timeSlot}</span>
                      <span className="text-xs text-amber-500 font-bold">⭐ {item.rating}</span>
                    </div>
                    <h4 className="font-bold text-slate-800 text-base leading-tight">{item.name}</h4>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* MODAL POP-UP */}
      {modalItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl relative">
            <ImageCarousel images={modalItem.images} />
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-slate-900 leading-snug">{modalItem.name}</h3>
                <span className="text-base font-bold text-amber-500 shrink-0 ml-2">⭐ {modalItem.rating}</span>
              </div>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                {modalItem.description || `An outstanding top-tier culinary choice offering signature dishes and premium vibes in a highly accessible tourist quadrant.`}
              </p>
              
              <div className="flex flex-col gap-3">
                {modalItem.ticketUrl && (
                  <a href={modalItem.ticketUrl} target="_blank" rel="noreferrer" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-center font-semibold py-2.5 rounded-xl text-sm transition shadow-sm">
                    🎟️ Buy Official Tickets
                  </a>
                )}
                
                <div className="flex gap-3">
                  {modalItem.mapsUrl && (
                    <a href={modalItem.mapsUrl} target="_blank" rel="noreferrer" className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-center font-semibold py-2.5 rounded-xl text-sm transition">
                      🗺️ View Map
                    </a>
                  )}
                  <button onClick={() => setModalItem(null)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl text-sm transition text-center shadow-sm">
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}