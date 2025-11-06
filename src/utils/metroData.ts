import { MetroData, Station, Line } from '@/types/metro';

let cachedData: MetroData | null = null;

export async function loadMetroData(): Promise<MetroData> {
  if (cachedData) return cachedData;

  try {
    const response = await fetch('/data/demo-stations.json');
    if (!response.ok) throw new Error('Failed to load metro data');
    
    cachedData = await response.json();
    return cachedData as MetroData;
  } catch (error) {
    console.error('Error loading metro data:', error);
    throw error;
  }
}

export function getStationById(stations: Station[], id: string): Station | undefined {
  return stations.find(s => s.id === id);
}

export function getLineById(lines: Line[], id: string): Line | undefined {
  return lines.find(l => l.id === id);
}

export function searchStations(stations: Station[], query: string, language: string = 'en'): Station[] {
  const lowerQuery = query.toLowerCase();
  
  return stations.filter(station => {
    const nameMatch = station.name.toLowerCase().includes(lowerQuery);
    const nameHiMatch = language === 'hi' && station.nameHi.toLowerCase().includes(lowerQuery);
    return nameMatch || nameHiMatch;
  }).slice(0, 10);
}

export function getLineColor(lineId: string): string {
  const colorMap: Record<string, string> = {
    'Red': 'bg-metro-red',
    'Yellow': 'bg-metro-yellow',
    'Blue': 'bg-metro-blue',
    'Blue Branch': 'bg-metro-blue',
    'Green': 'bg-metro-green',
    'Violet': 'bg-metro-violet',
    'Orange': 'bg-metro-orange',
    'Pink': 'bg-metro-pink',
    'Magenta': 'bg-metro-magenta',
    'Grey': 'bg-metro-grey',
    'Aqua': 'bg-metro-aqua',
    'Rapid': 'bg-metro-rapid'
  };
  return colorMap[lineId] || 'bg-primary';
}
