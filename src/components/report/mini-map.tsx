"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MiniMapProps {
  latitude: number;
  longitude: number;
}

export function MiniMap({ latitude, longitude }: MiniMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token || !mapContainerRef.current) {
      return;
    }

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [longitude, latitude],
      zoom: 15,
      attributionControl: false,
    });

    new mapboxgl.Marker().setLngLat([longitude, latitude]).addTo(map);

    return () => {
      map.remove();
    };
  }, [latitude, longitude]);

  return (
    <Card>
      <CardHeader>
        {/* TODO: design polish */}
        <CardTitle>Location</CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={mapContainerRef} className="h-52 w-full rounded-md border" />
      </CardContent>
    </Card>
  );
}