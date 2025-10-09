import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { MetroMap } from '@/components/MetroMap';
import { LineBadge } from '@/components/LineBadge';
import { loadMetroData } from '@/utils/metroData';
import { Station, MetroData } from '@/types/metro';
import { Map as MapIcon, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MapView() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [metroData, setMetroData] = useState<MetroData | null>(null);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetroData()
      .then(data => {
        setMetroData(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to load metro data:', error);
        setLoading(false);
      });
  }, []);

  const handleStationClick = (station: Station) => {
    setSelectedStation(station);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  if (!metroData) return null;

  return (
    <div className="container mx-auto px-4 py-6 pb-24 md:pb-8">
      <div className="flex items-center gap-3 mb-6">
        <MapIcon className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">{t('nav.map')}</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2">
          <Card className="shadow-lg overflow-hidden">
            <CardContent className="p-0">
              <MetroMap
                stations={metroData.stations}
                selectedStation={selectedStation}
                onStationClick={handleStationClick}
                height="calc(100vh - 250px)"
              />
            </CardContent>
          </Card>
        </div>

        {/* Station Info Sidebar */}
        <div className="lg:col-span-1">
          {selectedStation ? (
            <Card className="shadow-lg sticky top-24">
              <CardContent className="pt-6">
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    {i18n.language === 'hi' ? selectedStation.nameHi : selectedStation.name}
                  </h2>
                  <div className="flex gap-1 flex-wrap">
                    {selectedStation.lines.map((line) => (
                      <LineBadge key={line} line={line} />
                    ))}
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">First Train</div>
                    <div className="font-semibold text-foreground">{selectedStation.firstTrain}</div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">Last Train</div>
                    <div className="font-semibold text-foreground">{selectedStation.lastTrain}</div>
                  </div>
                </div>

                {selectedStation.isInterchange && (
                  <div className="p-3 bg-accent/10 text-accent rounded-lg mb-4 text-sm font-medium">
                    🔄 Interchange Station
                  </div>
                )}

                <div className="space-y-2">
                  <Button
                    onClick={() => navigate(`/station/${selectedStation.id}`)}
                    className="w-full"
                  >
                    View Full Details
                  </Button>
                  <Button
                    onClick={() => navigate(`/route?from=${selectedStation.id}`)}
                    variant="outline"
                    className="w-full"
                  >
                    Plan Route From Here
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-lg">
              <CardContent className="pt-6 text-center">
                <Layers className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  Click on a station marker to view details
                </p>
              </CardContent>
            </Card>
          )}

          {/* Legend */}
          <Card className="shadow-lg mt-6">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3">Map Legend</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow" />
                  <span>Regular Station</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-primary border-2 border-white shadow" />
                  <span>Interchange Station</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-accent border-2 border-white shadow" />
                  <span>Selected Station</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
