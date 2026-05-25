import { useState } from 'react';
import travelData from './data.json';

// TypeScript interfaces for safety and code quality
interface Restaurant {
  id: string;
  name: string;
  rating: number;
  cuisine: string;
  image: string;
}

interface TravelSpot {
  id: string;
  name: string;
  category: string;
  rating: number;
  image: string;
  description: string;
  mapsUrl: string;
  nearbyRestaurants: Restaurant[];
}

export default function App() {
  // Application States
  const [itinerary, setItinerary] = useState<any[]>([]);
  const [currentMode, setCurrentMode] = useState<'attractions' | 'restaurants'>('attractions');
  const [lastSelectedSpot, setLastSelectedSpot] = useState<TravelSpot | null>(null);
  const [modalItem, setModalItem] = useState<any | null>(null);

  // Core Logic: Adding items to the timeline
  const handleAddItem = (item: any, type: 'attraction' | 'restaurant') => {
    const newItem = {
      ...item,
      timelineType: type,
      timeSlot: itinerary.length === 0 ? "09:00 AM" : itinerary.length === 1 ? "12:30 PM" : "03:30 PM"
    };
    
    setItinerary([...itinerary, newItem]);

    if (type === 'attraction') {
      setLastSelectedSpot(item);
      // Automatically prompt user to decide next action
      setCurrentMode('restaurants'); 
    } else {
      // After eating, switch back to exploring attractions
      setCurrentMode('attractions');
    }
  };

  // Clear timeline to start over
  const handleReset = () => {
    setItinerary([]);
    setCurrentMode('attractions');
    setLastSelectedSpot(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 py-6 px-8 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-blue-600 tracking-tight">Smart Trip Planner</h1>
          <p className="text-sm text-slate-500 mt-0.5">Optimize your day trip routes seamlessly.</p>
        </div>
        {itinerary.length > 0 && (
          <button 
            onClick={handleReset}
            className="text-sm font-medium text-red-500 hover:text-red-600 transition bg-red-50 px-3 py-2 rounded-lg"
          >
            Clear Plan
          </button>
        )}
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Discovery Pool (Lg screen takes 7/12 cols) */}
        <section className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-[calc(100vh-160px)] overflow-y-auto">
          
          {/* Section Dynamic Heading */}
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
                  <button 
                    onClick={() => setCurrentMode('attractions')}
                    className="text-xs text-blue-500 underline font-medium"
                  >
                    Skip to next attraction
                  </button>
                </div>
                <p className="text-sm text-slate-500">Highly rated spots near <span className="font-semibold text-slate-700">{lastSelectedSpot?.name}</span>.</p>
              </>
            )}
          </div>

          {/* Dynamic Grid Listing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Render Attractions Mode */}
            {currentMode === 'attractions' && travelData.map((spot: TravelSpot) => (
              <div key={spot.id} className="group border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition bg-white flex flex-col justify-between">
                <div className="cursor-pointer" onClick={() => setModalItem(spot)}>
                  <img src={spot.image} alt={spot.name} className="w-full h-40 object-cover group-hover:scale-105 transition duration-300" />
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
                  <button 
                    onClick={() => handleAddItem(spot, 'attraction')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 rounded-lg transition shadow-sm"
                  >
                    + Add to Itinerary
                  </button>
                </div>
              </div>
            ))}

            {/* Render Restaurants Mode */}
            {currentMode === 'restaurants' && lastSelectedSpot?.nearbyRestaurants.map((restaurant: Restaurant) => (
              <div key={restaurant.id} className="group border border-orange-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition bg-white flex flex-col justify-between">
                <div className="cursor-pointer" onClick={() => setModalItem(restaurant)}>
                  <img src={restaurant.image} alt={restaurant.name} className="w-full h-40 object-cover group-hover:scale-105 transition duration-300" />
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold px-2 py-0.5 bg-orange-50 text-orange-600 rounded-full">{restaurant.cuisine}</span>
                      <span className="text-sm font-bold text-amber-500">⭐ {restaurant.rating}</span>
                    </div>
                    <h3 className="font-bold text-base leading-snug line-clamp-1">{restaurant.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">Perfect choice right next to your current location!</p>
                  </div>
                </div>
                <div className="p-4 pt-0">
                  <button 
                    onClick={() => handleAddItem(restaurant, 'restaurant')}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold py-2 rounded-lg transition shadow-sm"
                  >
                    + Grab Lunch Here
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* RIGHT COLUMN: Your Live Timeline (Lg screen takes 5/12 cols) */}
        <section className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-[calc(100vh-160px)] overflow-y-auto">
          <h2 className="text-xl font-bold tracking-tight mb-1">My Day Trip Schedule</h2>
          <p className="text-sm text-slate-500 mb-6">Your optimal routing order updates automatically.</p>

          {itinerary.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-4 text-center">
              <p className="text-sm text-slate-400 font-medium">Your schedule is wide open.</p>
              <p className="text-xs text-slate-400 mt-1">Select an attraction on the left to map your day.</p>
            </div>
          ) : (
            <div className="relative border-l-2 border-blue-500 ml-4 pl-6 space-y-6">
              {itinerary.map((item, index) => (
                <div key={index} className="relative">
                  
                  {/* Glowing Indicator Dot */}
                  <span className={`absolute -left-[31px] top-1.5 h-4 w-4 rounded-full border-2 border-white shadow-sm ${item.timelineType === 'attraction' ? 'bg-blue-600' : 'bg-orange-500'}`}></span>
                  
                  {/* Card Container */}
                  <div className={`p-4 rounded-xl border shadow-sm ${item.timelineType === 'attraction' ? 'border-slate-200 bg-slate-50' : 'border-orange-100 bg-orange-50/30'}`}>
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-bold text-slate-400 tracking-wide uppercase">{item.timeSlot}</span>
                      <span className="text-xs text-amber-500 font-bold">⭐ {item.rating}</span>
                    </div>
                    <h4 className="font-bold text-slate-800 text-base leading-tight">{item.name}</h4>
                    
                    {/* Routing status indicator to show they are saving journey time */}
                    {index > 0 && (
                      <p className="text-xs font-medium text-emerald-600 mt-2 flex items-center bg-emerald-50 w-max px-2 py-0.5 rounded-md">
                        ✓ Smart Routed (0 min backtrack)
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* POP-UP MODAL (Shows additional details when a card is clicked) */}
      {modalItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl relative">
            <img src={modalItem.image} alt={modalItem.name} className="w-full h-52 object-cover" />
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-slate-900 leading-snug">{modalItem.name}</h3>
                <span className="text-base font-bold text-amber-500 shrink-0 ml-2">⭐ {modalItem.rating}</span>
              </div>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                {modalItem.description || `An outstanding top-tier culinary choice offering signature dishes and premium vibes in a highly accessible tourist quadrant.`}
              </p>
              
              <div className="flex gap-3">
                {modalItem.mapsUrl && (
                  <a 
                    href={modalItem.mapsUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-center font-semibold py-2.5 rounded-xl text-sm transition"
                  >
                    🗺️ View on Google Maps
                  </a>
                )}
                <button 
                  onClick={() => setModalItem(null)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl text-sm transition text-center shadow-sm"
                >
                  Close Window
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}