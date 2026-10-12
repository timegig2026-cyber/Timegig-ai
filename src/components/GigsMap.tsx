import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Gig, UserLocation, NavigationRoute, RegisteredUser, SeekerProfile } from '../types';

interface GigsMapProps {
  gigs: Gig[];
  selectedGig: Gig | null;
  userLocation: UserLocation | null;
  onSelectGig: (gig: Gig | null) => void;
  onZoomChange: (zoom: number) => void;
  mapCenter: [number, number];
  zoomLevel: number;
  mapType?: 'street' | 'satellite';
  onMapClick?: (lat: number, lng: number) => void;
  isSeekerLive?: boolean;
  liveSeekers?: SeekerProfile[];
  activeNavigation?: NavigationRoute | null;
  currentUser?: RegisteredUser | null;
  onHireSeeker?: (seeker: SeekerProfile) => void;
  onViewSeekerProfile?: (seeker: SeekerProfile) => void;
}

export interface GigsMapRef {
  zoomIn: () => void;
  zoomOut: () => void;
  fitAllGigs: () => void;
  flyTo: (lat: number, lng: number, zoom?: number) => void;
}

export const GigsMap = React.forwardRef<GigsMapRef, GigsMapProps>(({
  gigs,
  selectedGig,
  userLocation,
  onSelectGig,
  onZoomChange,
  mapCenter,
  zoomLevel,
  mapType = 'street',
  onMapClick,
  isSeekerLive,
  liveSeekers = [],
  activeNavigation,
  currentUser,
  onHireSeeker,
  onViewSeekerProfile,
}, ref) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const navigationLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const userCircleRef = useRef<L.Circle | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: mapCenter,
      zoom: zoomLevel,
      zoomControl: false,
      attributionControl: false,
      maxZoom: 19,
      minZoom: 3,
    });

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;

    const navigationLayer = L.layerGroup().addTo(map);
    navigationLayerRef.current = navigationLayer;

    map.on('zoomend', () => {
      onZoomChange(map.getZoom());
    });

    map.on('click', (e: L.LeafletMouseEvent) => {
      onSelectGig(null);
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer on mapType change (Street vs Satellite)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
      tileLayerRef.current = null;
    }

    if (mapType === 'satellite') {
      const satLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19 }
      );
      satLayer.addTo(map);
      tileLayerRef.current = satLayer;
    } else {
      const osmLayer = L.tileLayer(
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        { maxZoom: 19 }
      );
      osmLayer.addTo(map);
      tileLayerRef.current = osmLayer;
    }
  }, [mapType]);

  // Expose zoom controls via ref
  React.useImperativeHandle(ref, () => ({
    zoomIn: () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.zoomIn(1);
      }
    },
    zoomOut: () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.zoomOut(1);
      }
    },
    fitAllGigs: () => {
      if (!mapInstanceRef.current || gigs.length === 0) return;
      const validGigs = gigs.filter(g => typeof g.latitude === 'number' && typeof g.longitude === 'number' && !isNaN(g.latitude) && !isNaN(g.longitude));
      if (validGigs.length === 0) return;
      const bounds = L.latLngBounds(
        validGigs.map((g) => [g.latitude, g.longitude] as [number, number])
      );
      if (userLocation && typeof userLocation.latitude === 'number' && typeof userLocation.longitude === 'number' && !isNaN(userLocation.latitude) && !isNaN(userLocation.longitude)) {
        bounds.extend([userLocation.latitude, userLocation.longitude]);
      }
      mapInstanceRef.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
    },
    flyTo: (lat: number, lng: number, zoom = 14) => {
      if (mapInstanceRef.current && Number.isFinite(lat) && Number.isFinite(lng)) {
        mapInstanceRef.current.flyTo([lat, lng], zoom, {
          duration: 1.2,
          easeLinearity: 0.25,
        });
      }
    },
  }));

  // Update user location marker & accuracy circle with profile picture logo & live trade gadget
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userLocation) {
      const userLatLng: L.LatLngExpression = [userLocation.latitude, userLocation.longitude];

      const avatarUrl = currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
      const userRole = currentUser?.role || 'Professional Seeker';
      const userName = currentUser?.name || 'You';
      const hourlyRate = currentUser?.hourlyRate || 150;

      const userIcon = L.divIcon({
        className: 'custom-user-profile-pin',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 52px; height: 52px; margin-left: -26px; margin-top: -26px;">
            <div style="width: 46px; height: 46px; border-radius: 9999px; border: ${isSeekerLive ? '3px solid #10b981' : '3px solid #3b82f6'}; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.3); background: #ffffff;">
              <img src="${avatarUrl}" style="width: 100%; height: 100%; object-fit: cover;" />
            </div>
            ${isSeekerLive ? `
              <div style="position: absolute; bottom: -2px; right: -2px; width: 20px; height: 20px; background: #10b981; border: 2px solid #ffffff; border-radius: 9999px; display: flex; align-items: center; justify-content: center; font-size: 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.2);">
                🛠️
              </div>
            ` : ''}
          </div>
        `,
        iconSize: [52, 52],
        iconAnchor: [26, 26],
      });

      const tooltipContent = isSeekerLive
        ? `<div class="px-3 py-1.5 text-xs font-black text-slate-900 bg-white rounded-2xl shadow-xl border-2 border-emerald-500 flex flex-col gap-0.5 cursor-pointer">
            <div class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span class="text-sm font-black">${userName}</span>
              <span class="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded">R${hourlyRate}/hr</span>
            </div>
            <div class="text-[11px] text-indigo-700 font-bold">${userRole}</div>
            <div class="text-[10px] text-emerald-600 font-extrabold underline mt-0.5">ℹ️ Click to View Profile Info</div>
          </div>`
        : '<div class="px-2.5 py-1 text-xs font-bold text-slate-800 bg-white rounded-lg shadow cursor-pointer">You (Click for Profile)</div>';

      if (!userMarkerRef.current) {
        const marker = L.marker(userLatLng, {
          icon: userIcon,
          zIndexOffset: 1000,
        }).addTo(map);

        marker.bindTooltip(
          tooltipContent,
          { direction: 'top', offset: [0, -20], permanent: !!isSeekerLive }
        );

        marker.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          if (onViewSeekerProfile) {
            const seekerProfile: SeekerProfile = currentUser ? {
              id: currentUser.id,
              name: currentUser.name,
              firstName: currentUser.firstName,
              middleName: currentUser.middleName,
              surname: currentUser.surname,
              role: currentUser.role,
              avatar: currentUser.avatar,
              rating: currentUser.rating,
              reviewsCount: currentUser.reviewsCount,
              hourlyRate: currentUser.hourlyRate,
              location: currentUser.location,
              phone: currentUser.phone,
              email: currentUser.email,
              bio: currentUser.bio,
              skills: currentUser.skills,
              isAvailable: currentUser.isAvailable,
              completedGigs: currentUser.completedGigs,
              latitude: userLocation?.latitude || currentUser.latitude,
              longitude: userLocation?.longitude || currentUser.longitude,
              socialLinks: currentUser.socialLinks,
              experiences: currentUser.experiences,
              isLive: currentUser.isLive,
            } : {
              id: 'current-user-map',
              name: userName,
              role: userRole,
              avatar: avatarUrl,
              rating: 5.0,
              reviewsCount: 12,
              hourlyRate: hourlyRate,
              location: 'Current Location',
              phone: '+27 82 555 1234',
              email: 'user@timegig.co.za',
              bio: 'Active professional user on TimeGig map.',
              skills: ['Professional Service', 'Reliable', 'On-Time'],
              isAvailable: true,
              completedGigs: 15,
              latitude: userLocation?.latitude || 37.7749,
              longitude: userLocation?.longitude || -122.4194,
              isLive: isSeekerLive,
            };
            onViewSeekerProfile(seekerProfile);
          }
        });

        userMarkerRef.current = marker;
      } else {
        userMarkerRef.current.setLatLng(userLatLng);
        userMarkerRef.current.setIcon(userIcon);
        userMarkerRef.current.setTooltipContent(tooltipContent);
      }

      const radius = userLocation.accuracy ? Math.min(userLocation.accuracy, 300) : 100;
      if (!userCircleRef.current) {
        userCircleRef.current = L.circle(userLatLng, {
          radius: radius,
          color: isSeekerLive ? '#10b981' : '#3b82f6',
          weight: 1.5,
          opacity: 0.5,
          fillColor: isSeekerLive ? '#34d399' : '#60a5fa',
          fillOpacity: 0.15,
        }).addTo(map);
      } else {
        userCircleRef.current.setLatLng(userLatLng);
        userCircleRef.current.setRadius(radius);
        userCircleRef.current.setStyle({
          color: isSeekerLive ? '#10b981' : '#3b82f6',
          fillColor: isSeekerLive ? '#34d399' : '#60a5fa',
        });
      }
    } else {
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
      if (userCircleRef.current) {
        userCircleRef.current.remove();
        userCircleRef.current = null;
      }
    }
  }, [userLocation, isSeekerLive, currentUser]);

  // Update GiG markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    gigs.forEach((gig) => {
      if (typeof gig.latitude !== 'number' || typeof gig.longitude !== 'number' || isNaN(gig.latitude) || isNaN(gig.longitude)) return;
      
      const isSelected = selectedGig?.id === gig.id;
      const payLabel = gig.payType === 'hourly' ? `R${gig.pay}/h` : `R${gig.pay}`;

      const markerHtml = `
        <div class="group cursor-pointer transform transition-all duration-200 select-none ${
          isSelected ? 'scale-115 z-50' : 'hover:scale-108'
        }" style="display: inline-block;">
          <div class="flex items-center gap-1 px-2.5 py-1.5 rounded-full font-bold shadow-md transition-all ${
            isSelected
              ? 'bg-slate-900 text-white ring-4 ring-indigo-500/30 shadow-xl'
              : gig.isUrgent
              ? 'bg-white text-rose-600 border border-rose-200 shadow-rose-500/10 hover:border-rose-400'
              : 'bg-white text-slate-800 border border-slate-200/90 shadow-slate-900/5 hover:border-indigo-400'
          }">
            ${gig.isUrgent ? '<span class="text-xs leading-none">🔥</span>' : ''}
            <span class="text-xs font-black tracking-tight">${payLabel}</span>
          </div>
          <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6px solid ${
            isSelected ? '#0f172a' : '#ffffff'
          }; margin: -1px auto 0 auto;"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-gig-pin',
        html: markerHtml,
        iconSize: [68, 38],
        iconAnchor: [34, 38],
      });

      const marker = L.marker([gig.latitude, gig.longitude], {
        icon: customIcon,
        zIndexOffset: isSelected ? 500 : gig.isUrgent ? 200 : 50,
      });

      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        onSelectGig(gig);
        map.panTo([gig.latitude - 0.003, gig.longitude], {
          animate: true,
          duration: 0.5,
        });
      });

      markersLayer.addLayer(marker);
    });
  }, [gigs, selectedGig]);

  // Update Live Seeker bubble markers on map
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    liveSeekers.forEach((seeker) => {
      if (currentUser && seeker.id === currentUser.id) return; // handled by user marker
      if (typeof seeker.latitude !== 'number' || typeof seeker.longitude !== 'number' || isNaN(seeker.latitude) || isNaN(seeker.longitude)) return;

      const seekerLatLng: L.LatLngExpression = [seeker.latitude, seeker.longitude];
      const avatarUrl = seeker.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';

      const seekerBubbleIcon = L.divIcon({
        className: 'custom-seeker-bubble-pin',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 52px; height: 52px; margin-left: -26px; margin-top: -26px;">
            <div style="width: 46px; height: 46px; border-radius: 9999px; border: 3px solid #10b981; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.3); background: #ffffff;">
              <img src="${avatarUrl}" style="width: 100%; height: 100%; object-fit: cover;" />
            </div>
            <div style="position: absolute; bottom: -2px; right: -2px; width: 20px; height: 20px; background: #10b981; border: 2px solid #ffffff; border-radius: 9999px; display: flex; align-items: center; justify-content: center; font-size: 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.2);">
              🛠️
            </div>
          </div>
        `,
        iconSize: [52, 52],
        iconAnchor: [26, 26],
      });

      const seekerMarker = L.marker(seekerLatLng, {
        icon: seekerBubbleIcon,
        zIndexOffset: 1500,
      });

      seekerMarker.bindTooltip(
        `<div class="px-3 py-1.5 text-xs font-black text-slate-900 bg-white rounded-2xl shadow-xl border-2 border-emerald-500 flex flex-col gap-0.5 cursor-pointer">
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span class="text-sm font-black">${seeker.name}</span>
            <span class="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded">R${seeker.hourlyRate || 150}/hr</span>
          </div>
          <div class="text-[11px] text-indigo-700 font-bold">${seeker.role}</div>
          <div class="text-[10px] text-emerald-600 font-extrabold underline mt-0.5">ℹ️ Click to View Profile & Hire</div>
        </div>`,
        { direction: 'top', offset: [0, -20], permanent: false }
      );

      seekerMarker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        if (onViewSeekerProfile) {
          onViewSeekerProfile(seeker);
        }
      });

      markersLayer.addLayer(seekerMarker);
    });
  }, [liveSeekers, currentUser, onViewSeekerProfile]);

  // Update Active Navigation Route & Waypoint Markers with continuous focus until seeker arrives
  useEffect(() => {
    const map = mapInstanceRef.current;
    const navLayer = navigationLayerRef.current;
    if (!map || !navLayer) return;

    navLayer.clearLayers();

    if (!activeNavigation) return;

    const rawStartLat = activeNavigation.seekerLocation?.[0];
    const rawStartLng = activeNavigation.seekerLocation?.[1];
    const rawDestLat = activeNavigation.userDestination?.[0];
    const rawDestLng = activeNavigation.userDestination?.[1];

    const startLat = typeof rawStartLat === 'number' && !isNaN(rawStartLat) ? rawStartLat : 37.7749;
    const startLng = typeof rawStartLng === 'number' && !isNaN(rawStartLng) ? rawStartLng : -122.4194;
    const destLat = typeof rawDestLat === 'number' && !isNaN(rawDestLat) ? rawDestLat : 37.7885;
    const destLng = typeof rawDestLng === 'number' && !isNaN(rawDestLng) ? rawDestLng : -122.4072;

    const midLat = startLat + (destLat - startLat) * 0.45;
    const midLng = startLng + (destLng - startLng) * 0.65;
    const waypoints: [number, number][] = [
      [startLat, startLng],
      [midLat, startLng + (destLng - startLng) * 0.15],
      [midLat, midLng],
      [destLat, midLng],
      [destLat, destLng],
    ];

    const glowLine = L.polyline(waypoints, {
      color: '#4f46e5',
      weight: 8,
      opacity: 0.4,
      lineCap: 'round',
      lineJoin: 'round',
    });
    navLayer.addLayer(glowLine);

    const mainLine = L.polyline(waypoints, {
      color: '#10b981',
      weight: 4.5,
      opacity: 0.95,
      dashArray: '10, 8',
      lineCap: 'round',
      lineJoin: 'round',
    });
    navLayer.addLayer(mainLine);

    const seekerIcon = L.divIcon({
      className: 'custom-seeker-route-pin',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 48px; height: 48px; margin-left: -24px; margin-top: -24px;">
          <div style="width: 44px; height: 44px; border-radius: 9999px; border: 3px solid #10b981; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.3); background: #ffffff;">
            <img src="${activeNavigation.seekerAvatar}" style="width: 100%; height: 100%; object-fit: cover;" />
          </div>
          <div style="position: absolute; bottom: -2px; right: -2px; width: 18px; height: 18px; background: #10b981; border: 2px solid #ffffff; border-radius: 9999px; display: flex; align-items: center; justify-content: center; font-size: 10px;">
            🚶
          </div>
        </div>
      `,
      iconSize: [48, 48],
      iconAnchor: [24, 24],
    });

    const seekerMarker = L.marker([startLat, startLng], {
      icon: seekerIcon,
      zIndexOffset: 2500,
    }).bindTooltip(
      `<div class="px-2.5 py-1 text-xs font-black text-slate-900 bg-white rounded-xl shadow-md border border-emerald-400">
        <div>🚶 ${activeNavigation.seekerName}</div>
        <div class="text-[10px] text-emerald-600 font-bold">Seeker Live Location</div>
      </div>`,
      { permanent: true, direction: 'top', offset: [0, -20] }
    );
    navLayer.addLayer(seekerMarker);

    const destIcon = L.divIcon({
      className: 'custom-destination-route-pin',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; margin-left: -22px; margin-top: -22px;">
          <div style="width: 40px; height: 40px; border-radius: 16px; background: #0f172a; border: 2px solid #ffffff; box-shadow: 0 10px 25px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; font-size: 18px;">
            🏁
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    const destMarker = L.marker([destLat, destLng], {
      icon: destIcon,
      zIndexOffset: 2500,
    }).bindTooltip(
      `<div class="px-2.5 py-1 text-xs font-black text-slate-900 bg-white rounded-xl shadow-md border border-slate-300">
        <div>🏁 ${activeNavigation.destinationName}</div>
        <div class="text-[10px] text-indigo-600 font-bold">User Destination</div>
      </div>`,
      { permanent: true, direction: 'top', offset: [0, -20] }
    );
    navLayer.addLayer(destMarker);

    const focusRoute = () => {
      try {
        const bounds = L.latLngBounds(waypoints);
        map.fitBounds(bounds, {
          padding: [120, 80],
          maxZoom: 16,
          animate: true,
        });
      } catch (e) {
        // ignore
      }
    };

    focusRoute();

    // Keep map focus until seeker arrives
    const interval = setInterval(() => {
      if (activeNavigation && activeNavigation.isNavigating) {
        focusRoute();
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [activeNavigation]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
});

GigsMap.displayName = 'GigsMap';
