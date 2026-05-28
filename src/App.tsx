import React, { useState } from 'react';
import travelData from './data.json';
import { ImageCarousel, TravelConnector, calculateDistanceKm } from './components';

interface Restaurant {
  id: string;
  name: string;
  rating: number;
  cuisine: string;
  operatingHours?: string;
  images: string[];
  lat: number;
  lng: number;
}

interface TravelSpot {
  id: string;
  name: string;
  category: string;
  rating: number;
  operatingHours?: string;
  images: string[];
  description: string;
  mapsUrl: string;
  ticketUrl?: string;
  lat: number;
  lng: number;
  nearbyRestaurants: Restaurant[];
}

const topTrendingRestaurants: Restaurant[] = [
  {
    id: "trend-1",
    name: "Village Park Restaurant",
    rating: 4.8,
    cuisine: "Legendary Nasi Lemak",
    operatingHours: "6:30 AM - 5:30 PM",
    lat: 3.1345,
    lng: 101.6221,
    images: [
        "/images/village-park-1.jpg",
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80"
    ]
  },
  {
    id: "trend-2",
    name: "Wong Ah Wah (W.A.W)",
    rating: 4.6,
    cuisine: "Famous BBQ Chicken Wings",
    operatingHours: "4:00 PM - 2:00 AM",
    lat: 3.1458,
    lng: 101.7086,
    images: [
      "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80", 
      "https://images.unsplash.com/photo-1527477396000-e2cb862f6fc4?auto=format&fit=crop&w=600&q=80"
    ]
  },
  {
    id: "trend-3",
    name: "Lai Foong Lala Noodles",
    rating: 4.7,
    cuisine: "Michelin Bib Gourmand Clams",
    operatingHours: "10:00 AM - 8:00 PM",
    lat: 3.1430,
    lng: 101.6970,
    images: [
      "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80", 
      "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80"
    ]
  },
  {
    id: "trend-4",
    name: "Nasi Kandar Pelita",
    rating: 4.3,
    cuisine: "24-Hour Mamak Legend",
    operatingHours: "Open 24 Hours",
    lat: 3.1590,
    lng: 101.7082,
    images: [
      "https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=600&q=80", 
      "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=600&q=80"
    ]
  }
];
export default function App() {
  const [hasStarted, setHasStarted] = useState(false);
  const [searchCity, setSearchCity] = useState('');
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [tripDates, setTripDates] = useState<{dayNum: number, dateStr: string}[]>([]);
  const [currentDay, setCurrentDay] = useState<number>(1);
  
  const [searchError, setSearchError] = useState('');

  const [itinerary, setItinerary] = useState<any[]>([]);
  const [lastSelectedSpot, setLastSelectedSpot] = useState<TravelSpot | null>(null);
  const [modalItem, setModalItem] = useState<any | null>(null);
  const [showFoodBanner, setShowFoodBanner] = useState(true);

  // NEW: State for dragging items
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const currentDayItinerary = itinerary.filter(item => item.day === currentDay);

  const handleStartSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const city = searchCity.toLowerCase();
    
    if (!city.includes('kuala lumpur') && !city.includes('kl')) {
      setSearchError('For this demo, please type "Kuala Lumpur".');
      return;
    }
    if (!startDate || !endDate) {
      setSearchError('Please select both start and end dates.');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end < start) {
      setSearchError('End date cannot be before start date.');
      return;
    }

    const daysList = [];
    let currentDate = new Date(start);
    let dayCounter = 1;

    while (currentDate <= end) {
      const dateStr = `${currentDate.getDate()}/${currentDate.getMonth() + 1}`;
      daysList.push({ dayNum: dayCounter, dateStr });
      currentDate.setDate(currentDate.getDate() + 1);
      dayCounter++;
    }

    setTripDates(daysList);
    setCurrentDay(1);
    setHasStarted(true);
    setSearchError('');
  };

  const handleAddItem = (item: any, type: 'attraction' | 'restaurant') => {
    const timeSlots = ["09:00 AM", "12:30 PM", "03:00 PM", "06:00 PM", "08:30 PM"];
    const newItem = {
      ...item,
      timelineType: type,
      timeSlot: timeSlots[currentDayItinerary.length] || "Late Night",
      uniqueId: Math.random().toString(),
      day: currentDay 
    };
    
    setItinerary([...itinerary, newItem]);

    if (type === 'attraction') {
      setLastSelectedSpot(item);
      setShowFoodBanner(true); 
    } else {
      setShowFoodBanner(false); 
    }
  };

  const handleRemoveItem = (uniqueId: string) => {
    setItinerary(itinerary.filter(item => item.uniqueId !== uniqueId));
  };

  const handleReset = () => {
    setItinerary([]);
    setLastSelectedSpot(null);
    setShowFoodBanner(true);
    setHasStarted(false);
    setSearchCity('');
    setStartDate('');
    setEndDate('');
  };

  const handleExportMaps = () => {
    if (currentDayItinerary.length === 0) return;
    const baseUrl = "https://www.google.com/maps/dir/";
    const path = currentDayItinerary.map(item => encodeURIComponent(item.name)).join('/');
    window.open(baseUrl + path, '_blank');
  };

  // NEW: Smart Route Organizer
  const handleOptimizeRoute = () => {
    if (currentDayItinerary.length <= 2) return; 

    // Keep the very first place as the starting point
    const optimized = [currentDayItinerary[0]];
    const unvisited = currentDayItinerary.slice(1);

    // Loop through and find the closest next stop
    while (unvisited.length > 0) {
      let lastItem = optimized[optimized.length - 1];
      let closestIndex = 0;
      let shortestDist = calculateDistanceKm(lastItem.lat, lastItem.lng, unvisited[0].lat, unvisited[0].lng);

      for (let i = 1; i < unvisited.length; i++) {
        let dist = calculateDistanceKm(lastItem.lat, lastItem.lng, unvisited[i].lat, unvisited[i].lng);
        if (dist < shortestDist) {
          shortestDist = dist;
          closestIndex = i;
        }
      }
      
      // Move the closest item from unvisited to optimized
      optimized.push(unvisited.splice(closestIndex, 1)[0]);
    }

    // Update the main list without touching other days
    const otherDays = itinerary.filter(item => item.day !== currentDay);
    setItinerary([...otherDays, ...optimized]);
  };

  // NEW: Drag and Drop functions
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const currentDayItems = [...currentDayItinerary];
    const draggedIndex = currentDayItems.findIndex(i => i.uniqueId === draggedId);
    const targetIndex = currentDayItems.findIndex(i => i.uniqueId === targetId);

    // Pull out the dragged item and put it in the new spot
    const [draggedItem] = currentDayItems.splice(draggedIndex, 1);
    currentDayItems.splice(targetIndex, 0, draggedItem);

    // Save the new order
    const otherDays = itinerary.filter(item => item.day !== currentDay);
    setItinerary([...otherDays, ...currentDayItems]);
    setDraggedId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Must have this for drop to work
  };

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
          <h1 className="text-3xl font-extrabold text-blue-600 mb-2">Smart Trip Planner</h1>
          <p className="text-slate-500 mb-6">Enter a city and dates to start building your itinerary.</p>
          
          <form onSubmit={handleStartSearch} className="space-y-4">
            <div>
              <input 
                type="text" 
                placeholder="Destination (e.g., Kuala Lumpur)" 
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
              />
            </div>
            
            <div className="flex gap-3">
              <div className="flex-1 text-left">
                <label className="text-xs font-bold text-slate-500 ml-1">Start Date</label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-sm text-slate-700"
                />
              </div>
              <div className="flex-1 text-left">
                <label className="text-xs font-bold text-slate-500 ml-1">End Date</label>
                <input 
                  type="date" 
                  value={endDate}
                  min={startDate} 
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-sm text-slate-700"
                />
              </div>
            </div>

            {searchError && <p className="text-red-500 text-sm mt-2">{searchError}</p>}
            
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow-md mt-2">
              Start Planning
            </button>
          </form>
        </div>
      </div>
    );
  }

  const displayedRestaurants = lastSelectedSpot ? lastSelectedSpot.nearbyRestaurants : topTrendingRestaurants;
  const bannerTitle = lastSelectedSpot ? "🍔 Smart Food Recommendations" : "🔥 Trending Local Eats";
  const bannerSubtitle = lastSelectedSpot ? `Highly rated spots near ${lastSelectedSpot.name}` : "The most legendary food spots across KL & PJ";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      <header className="bg-white border-b border-slate-200 py-6 px-8 flex justify-between items-center sticky top-0 z-10 shadow-sm shrink-0">
        <div>
          <h1 className="text-2xl font-extrabold text-blue-600 tracking-tight">Kuala Lumpur Trip</h1>
          <p className="text-sm text-slate-500 mt-0.5">Optimize your multi-day trip routes seamlessly.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleReset} className="text-sm font-medium text-slate-500 hover:text-slate-700 bg-slate-100 px-3 py-2 rounded-lg">
            Start Over
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 overflow-hidden">
        
        <section className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm overflow-y-auto" style={{ maxHeight: 'calc(100vh - 140px)'}}>
          
          {showFoodBanner && (
            <div className="mb-8 bg-orange-50/70 border border-orange-200 p-5 rounded-2xl shadow-inner animate-fade-in">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-orange-700">{bannerTitle}</h2>
                  <p className="text-xs text-orange-600/80 mt-0.5">{bannerSubtitle}</p>
                </div>
                <button onClick={() => setShowFoodBanner(false)} className="text-xs font-medium text-slate-500 hover:text-slate-700 underline">
                  Dismiss
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {displayedRestaurants.map((restaurant: Restaurant) => {
                  const isAdded = currentDayItinerary.some(i => i.id === restaurant.id);
                  
                  return (
                    <div key={restaurant.id} className="group border border-orange-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition bg-white flex flex-col justify-between">
                      <div className="cursor-pointer" onClick={() => setModalItem(restaurant)}>
                        <ImageCarousel images={restaurant.images} />
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold px-2 py-0.5 bg-orange-50 text-orange-600 rounded-full">{restaurant.cuisine}</span>
                            <span className="text-sm font-bold text-amber-500">⭐ {restaurant.rating}</span>
                          </div>
                          <h3 className="font-bold text-base leading-snug line-clamp-1">{restaurant.name}</h3>
                          {restaurant.operatingHours && (
                            <p className="text-xs text-slate-500 mt-1">🕒 {restaurant.operatingHours}</p>
                          )}
                        </div>
                      </div>
                      <div className="p-4 pt-0">
                        <button 
                          onClick={() => !isAdded && handleAddItem(restaurant, 'restaurant')} 
                          disabled={isAdded}
                          className={`w-full text-white text-sm font-semibold py-2 rounded-lg transition shadow-sm ${
                            isAdded ? 'bg-slate-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'
                          }`}
                        >
                          {isAdded ? '✓ Added to Day ' + currentDay : '+ Grab Lunch Here'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mb-6">
            <h2 className="text-xl font-bold tracking-tight">Top Attractions</h2>
            <p className="text-sm text-slate-500">Pick a place to continue your adventure.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {travelData.map((spot: TravelSpot) => {
              const isAdded = currentDayItinerary.some(i => i.id === spot.id);

              return (
                <div key={spot.id} className="group border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition bg-white flex flex-col justify-between">
                  <div className="cursor-pointer" onClick={() => setModalItem(spot)}>
                    <ImageCarousel images={spot.images} />
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">Attraction</span>
                        <span className="text-sm font-bold text-amber-500">⭐ {spot.rating}</span>
                      </div>
                      <h3 className="font-bold text-base leading-snug line-clamp-1">{spot.name}</h3>
                      {spot.operatingHours && (
                        <p className="text-xs text-slate-500 mt-1 font-medium">🕒 {spot.operatingHours}</p>
                      )}
                      <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">{spot.description}</p>
                    </div>
                  </div>
                  <div className="p-4 pt-0">
                    <button 
                      onClick={() => !isAdded && handleAddItem(spot, 'attraction')} 
                      disabled={isAdded}
                      className={`w-full text-white text-sm font-semibold py-2 rounded-lg transition shadow-sm ${
                        isAdded ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {isAdded ? '✓ Added to Day ' + currentDay : '+ Add to Itinerary'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden" style={{ maxHeight: 'calc(100vh - 140px)'}}>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-bold tracking-tight">My Itinerary</h2>
              {/* NEW: The Smart Route Button */}
              {currentDayItinerary.length > 2 && (
                <button 
                  onClick={handleOptimizeRoute}
                  className="text-xs bg-indigo-50 text-indigo-600 border border-indigo-200 px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-100 transition shadow-sm"
                >
                  ✨ Optimize Route
                </button>
              )}
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {tripDates.map((day) => (
                <button
                  key={day.dayNum}
                  onClick={() => setCurrentDay(day.dayNum)}
                  className={`shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition shadow-sm border ${
                    currentDay === day.dayNum 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Day {day.dayNum} <span className="opacity-75 font-medium ml-1">({day.dateStr})</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 pb-10">
            {currentDayItinerary.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-4 text-center mt-4">
                <p className="text-sm text-slate-400 font-medium">Your schedule for Day {currentDay} is open.</p>
                <p className="text-xs text-slate-400 mt-1">Select a spot on the left to map this day.</p>
              </div>
            ) : (
              <div className="relative border-l-2 border-blue-500 ml-4 pl-6 pt-2 pb-2">
                {currentDayItinerary.map((item, index) => (
                  <div 
                    key={item.uniqueId} 
                    className="relative mb-8"
                    // NEW: HTML Drag attributes
                    draggable
                    onDragStart={(e) => handleDragStart(e, item.uniqueId)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, item.uniqueId)}
                  >
                    {index > 0 && <TravelConnector prevItem={currentDayItinerary[index - 1]} currentItem={item} />}
                    <span className={`absolute -left-[31px] top-1.5 h-4 w-4 rounded-full border-2 border-white shadow-sm ${item.timelineType === 'attraction' ? 'bg-blue-600' : 'bg-orange-500'}`}></span>
                    
                    <div className={`p-4 rounded-xl border shadow-sm cursor-grab active:cursor-grabbing transition-colors ${
                        draggedId === item.uniqueId ? 'opacity-50 bg-slate-100 border-dashed' : 
                        item.timelineType === 'attraction' ? 'border-slate-200 bg-slate-50 hover:bg-slate-100' : 'border-orange-100 bg-orange-50/30 hover:bg-orange-50/70'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-slate-400 tracking-wide uppercase flex items-center gap-1">
                          <span className="text-slate-300">↕️</span> {item.timeSlot}
                        </span>
                        <div className="flex gap-3 items-center">
                          <span className="text-xs text-amber-500 font-bold">⭐ {item.rating}</span>
                          <button 
                            onClick={() => handleRemoveItem(item.uniqueId)} 
                            className="w-7 h-7 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 transition-all shadow-sm" 
                            title="Remove from itinerary"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <h4 className="font-bold text-slate-800 text-base leading-tight">{item.name}</h4>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {currentDayItinerary.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-200 shrink-0">
              <button 
                onClick={handleExportMaps}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl shadow-md transition flex justify-center items-center gap-2"
              >
                🗺️ Open Day {currentDay} Route in Maps
              </button>
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
              
              {modalItem.operatingHours && (
                <div className="mb-4 inline-block bg-slate-100 text-slate-600 text-xs font-semibold px-2.5 py-1 rounded-md border border-slate-200">
                  🕒 Open: {modalItem.operatingHours}
                </div>
              )}

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