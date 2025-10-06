export interface Station {
  id: string;
  name: string;
  nameHi: string;
  lines: string[];
  lat: number;
  lng: number;
  isInterchange: boolean;
  facilities: string[];
  firstTrain: string;
  lastTrain: string;
  exits: Exit[];
  nearbyTransport: string[];
}

export interface Exit {
  name: string;
  landmark: string;
  distance: number;
}

export interface Line {
  id: string;
  name: string;
  nameHi: string;
  color: string;
  stations: string[];
}

export interface RouteSegment {
  line: string;
  stations: string[];
  color: string;
}

export interface Route {
  segments: RouteSegment[];
  totalStops: number;
  totalTime: number;
  transfers: number;
  fare: number;
  walkingTime: number;
}

export interface MetroData {
  stations: Station[];
  lines: Line[];
}
