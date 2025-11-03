import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StationSearch } from '@/components/StationSearch';
import { LineBadge } from '@/components/LineBadge';
import { loadMetroData, getStationById } from '@/utils/metroData';
import { findMetroRoutes } from '@/utils/pathfinding';
import { Station, MetroData, Route } from '@/types/metro';
import {
  ArrowRight,
  Clock,
  Navigation2,
  Printer,
  RefreshCw,
  IndianRupee,
  TrendingUp,
  Shuffle
} from 'lucide-react';
import { toast } from 'sonner';

export default function RoutePlanner() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [metroData, setMetroData] = useState<MetroData | null>(null);
  const [origin, setOrigin] = useState<Station | null>(null);
  const [destination, setDestination] = useState<Station | null>(null);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    loadMetroData()
      .then(data => {
        // Check for duplicate station IDs
        const stationIds = new Map<string, number>();
        const duplicates: Array<{id: string, indices: number[], names: string[]}> = [];
        
        data.stations.forEach((station, index) => {
          if (stationIds.has(station.id)) {
            const firstIndex = stationIds.get(station.id)!;
            const existing = duplicates.find(d => d.id === station.id);
            if (existing) {
              existing.indices.push(index);
              existing.names.push(station.name);
            } else {
              duplicates.push({
                id: station.id,
                indices: [firstIndex, index],
                names: [data.stations[firstIndex].name, station.name]
              });
            }
          } else {
            stationIds.set(station.id, index);
          }
        });
        
        if (duplicates.length > 0) {
          console.error(`🔴 CRITICAL: Found ${duplicates.length} duplicate station ID(s):`);
          duplicates.forEach(dup => {
            console.error(`  ID "${dup.id}" appears ${dup.indices.length} times:`);
            dup.names.forEach((name, i) => {
              console.error(`    [${dup.indices[i]}] ${name}`);
            });
          });
          console.error('⚠️ This WILL cause pathfinding to fail! Each station ID must be unique.');
        }
        
        setMetroData(data);
        
        // Check if there's a from parameter
        const fromParam = searchParams.get('from');
        if (fromParam) {
          const station = getStationById(data.stations, fromParam);
          if (station) setOrigin(station);
        }
        
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to load metro data:', error);
        setLoading(false);
      });
  }, [searchParams]);

  const handleSearch = () => {
    if (!origin || !destination || !metroData) return;

    if (origin.id === destination.id) {
      toast.error(t('errors.sameStation'));
      return;
    }

    setSearching(true);
    
    try {
      const foundRoutes = findMetroRoutes(
        metroData.stations,
        metroData.lines,
        origin.id,
        destination.id
      );

      if (foundRoutes.length === 0) {
        toast.error(t('errors.routeNotFound'));
      } else {
        setRoutes(foundRoutes);
        setSelectedRoute(0);
        toast.success(`Found ${foundRoutes.length} route${foundRoutes.length > 1 ? 's' : ''}`);
      }
    } catch (error) {
      console.error('Route finding error:', error);
      toast.error('Failed to find route');
    } finally {
      setSearching(false);
    }
  };

  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!metroData) return null;

  const currentRoute = routes[selectedRoute];

  return (
    <div className="container mx-auto px-4 py-6 pb-24 md:pb-8">
      <h1 className="text-3xl font-bold mb-6">{t('nav.route')}</h1>

      {/* Search Section */}
      <Card className="mb-6 shadow-lg">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 w-full">
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  {t('route.origin')}
                </label>
                <StationSearch
                  stations={metroData.stations}
                  onSelect={setOrigin}
                  placeholder={t('route.origin')}
                  value={origin ? (i18n.language === 'hi' ? origin.nameHi : origin.name) : ''}
                />
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleSwap}
                className="mt-6"
              >
                <Shuffle className="h-5 w-5" />
              </Button>

              <div className="flex-1 w-full">
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  {t('route.destination')}
                </label>
                <StationSearch
                  stations={metroData.stations}
                  onSelect={setDestination}
                  placeholder={t('route.destination')}
                  value={destination ? (i18n.language === 'hi' ? destination.nameHi : destination.name) : ''}
                />
              </div>
            </div>

            <Button
              onClick={handleSearch}
              disabled={!origin || !destination || searching}
              className="w-full gap-2"
              size="lg"
            >
              {searching ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Navigation2 className="h-5 w-5" />
                  {t('route.search')}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {routes.length > 0 && currentRoute && (
        <div className="space-y-6">
          {/* Route Tabs */}
          {routes.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {routes.map((route, index) => (
                <Button
                  key={index}
                  variant={selectedRoute === index ? 'default' : 'outline'}
                  onClick={() => setSelectedRoute(index)}
                  className="gap-2"
                >
                  {index === 0 ? (
                    <>
                      <TrendingUp className="h-4 w-4" />
                      {t('route.fastest')}
                    </>
                  ) : (
                    `Option ${index + 1}`
                  )}
                </Button>
              ))}
            </div>
          )}

          {/* Route Summary */}
          <Card className="shadow-lg">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold text-foreground">{currentRoute.totalTime}</div>
                  <div className="text-sm text-muted-foreground">{t('route.minutes')}</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Navigation2 className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold text-foreground">{currentRoute.totalStops}</div>
                  <div className="text-sm text-muted-foreground">{t('route.stops')}</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <RefreshCw className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold text-foreground">{currentRoute.transfers}</div>
                  <div className="text-sm text-muted-foreground">{t('route.transfers')}</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <IndianRupee className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold text-foreground">₹{currentRoute.fare}</div>
                  <div className="text-sm text-muted-foreground">{t('route.fare')}</div>
                </div>
              </div>

              <Button onClick={handlePrint} variant="outline" className="w-full gap-2">
                <Printer className="h-4 w-4" />
                {t('route.printRoute')}
              </Button>
            </CardContent>
          </Card>

          {/* Step-by-Step Instructions */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>{t('route.steps')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {currentRoute.segments.map((segment, segmentIndex) => (
                  <div key={segmentIndex}>
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                          {segmentIndex + 1}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">
                            {segmentIndex === 0 ? t('route.boardAt') : t('route.transferAt')}
                          </span>
                          <LineBadge line={segment.line} />
                        </div>
                         <div className="space-y-1">
                          {segment.stations.map((stationId, stationIndex) => {
                            const station = getStationById(metroData.stations, stationId);
                            if (!station) return null;

                            const isFirst = stationIndex === 0;
                            const isLast = stationIndex === segment.stations.length - 1;
                            const isIntermediate = !isFirst && !isLast;

                            return (
                              <div key={stationId} className="flex items-center gap-3 py-1">
                                <div className="flex flex-col items-center">
                                  <div
                                    className={`w-3 h-3 rounded-full border-2 ${
                                      isFirst || isLast 
                                        ? 'bg-accent border-accent' 
                                        : 'bg-background border-muted-foreground'
                                    }`}
                                  />
                                  {!isLast && (
                                    <div className="w-0.5 h-6 bg-muted-foreground/50" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <button
                                    onClick={() => navigate(`/station/${stationId}`)}
                                    className={`text-left hover:text-primary transition-colors ${
                                      isFirst || isLast ? 'font-semibold text-base' : 'text-sm text-muted-foreground'
                                    }`}
                                  >
                                    {i18n.language === 'hi' ? station.nameHi : station.name}
                                  </button>
                                  {station.isInterchange && (
                                    <div className="text-xs text-muted-foreground mt-0.5">
                                      {isIntermediate ? '↔ ' : ''}Interchange available
                                    </div>
                                  )}
                                  {isIntermediate && (
                                    <div className="text-xs text-muted-foreground/60">
                                      via {segment.line} Line
                                    </div>
                                  )}
                                </div>
                                {(isFirst || isLast) && (
                                  <div className="text-xs text-accent font-medium px-2 py-0.5 bg-accent/10 rounded">
                                    {isFirst ? t('route.boardAt').split(' ')[0] : 'Exit'}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {segmentIndex < currentRoute.segments.length - 1 && (
                      <div className="flex items-center gap-2 ml-14 mb-4 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {t('route.walkingTime')}: ~3 {t('route.minutes')}
                      </div>
                    )}
                  </div>
                ))}

                <div className="flex items-center gap-4 pt-4 border-t">
                  <div className="w-10 h-10 rounded-full bg-success text-white flex items-center justify-center">
                    ✓
                  </div>
                  <div>
                    <div className="font-medium">{t('route.arriveAt')}</div>
                    <div className="text-lg font-semibold text-foreground">
                      {destination && (i18n.language === 'hi' ? destination.nameHi : destination.name)}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
