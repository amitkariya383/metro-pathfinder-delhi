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
        // CRITICAL: Check for duplicate station IDs
        const stationIdCount = new Map<string, number[]>();
        
        data.stations.forEach((station, index) => {
          if (!stationIdCount.has(station.id)) {
            stationIdCount.set(station.id, []);
          }
          stationIdCount.get(station.id)!.push(index);
        });
        
        // Find duplicates
        const duplicates = Array.from(stationIdCount.entries())
          .filter(([_, indices]) => indices.length > 1);
        
        if (duplicates.length > 0) {
          console.error(`\n🔴🔴🔴 CRITICAL ERROR: Found ${duplicates.length} duplicate station ID(s) 🔴🔴🔴`);
          duplicates.forEach(([id, indices]) => {
            console.error(`\n  Duplicate ID: "${id}" appears ${indices.length} times:`);
            indices.forEach(idx => {
              const station = data.stations[idx];
              console.error(`    [Index ${idx}] ${station.name} (${station.nameHi}) - Lines: ${station.lines.join(', ')}`);
            });
          });
          console.error(`\n⚠️  THIS IS WHY PATHFINDING FAILS! Fix these duplicates immediately.`);
          console.error(`  Total stations in file: ${data.stations.length}`);
          console.error(`  Unique station IDs: ${stationIdCount.size}\n`);
        } else {
          console.log('✅ No duplicate station IDs found');
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
    <div className="container mx-auto px-3 md:px-4 py-4 md:py-6 pb-24 md:pb-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">{t('nav.route')}</h1>

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
            <CardContent className="p-3 md:pt-6 md:p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-6">
                <div className="text-center p-2 md:p-4 bg-muted rounded-lg">
                  <Clock className="h-5 w-5 md:h-6 md:w-6 mx-auto mb-1 md:mb-2 text-primary" />
                  <div className="text-xl md:text-2xl font-bold text-foreground">{currentRoute.totalTime}</div>
                  <div className="text-xs md:text-sm text-muted-foreground">{t('route.minutes')}</div>
                </div>
                <div className="text-center p-2 md:p-4 bg-muted rounded-lg">
                  <Navigation2 className="h-5 w-5 md:h-6 md:w-6 mx-auto mb-1 md:mb-2 text-primary" />
                  <div className="text-xl md:text-2xl font-bold text-foreground">{currentRoute.totalStops}</div>
                  <div className="text-xs md:text-sm text-muted-foreground">{t('route.stops')}</div>
                </div>
                <div className="text-center p-2 md:p-4 bg-muted rounded-lg">
                  <RefreshCw className="h-5 w-5 md:h-6 md:w-6 mx-auto mb-1 md:mb-2 text-primary" />
                  <div className="text-xl md:text-2xl font-bold text-foreground">{currentRoute.transfers}</div>
                  <div className="text-xs md:text-sm text-muted-foreground">{t('route.transfers')}</div>
                </div>
                <div className="text-center p-2 md:p-4 bg-muted rounded-lg">
                  <IndianRupee className="h-5 w-5 md:h-6 md:w-6 mx-auto mb-1 md:mb-2 text-primary" />
                  <div className="text-xl md:text-2xl font-bold text-foreground">₹{currentRoute.fare}</div>
                  <div className="text-xs md:text-sm text-muted-foreground">{t('route.fare')}</div>
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
                        <div className="mb-3">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium">
                              {segmentIndex === 0 ? t('route.boardAt') : t('route.transferAt')}
                            </span>
                          </div>
                          {(() => {
                            const firstStation = getStationById(metroData.stations, segment.stations[0]);
                            const lastStation = getStationById(metroData.stations, segment.stations[segment.stations.length - 1]);
                            
                            // Calculate platform based on direction for each line
                            let platformInfo = firstStation?.platforms?.[segment.line];
                            let terminalStation = lastStation;
                            
                            const lineData = metroData.lines.find(l => l.id === segment.line);
                            if (lineData) {
                              const firstIdx = lineData.stations.indexOf(segment.stations[0]);
                              const lastIdx = lineData.stations.indexOf(segment.stations[segment.stations.length - 1]);
                              
                              // Blue Line: towards Noida = Platform 1 (or 3 from Rajiv Chowk), towards Dwarka = Platform 2 (or 4 from Rajiv Chowk)
                              if (segment.line === 'Blue') {
                                const firstStationId = segment.stations[0];
                                // Check if this is a transfer segment from Rajiv Chowk
                                const isFromRajivChowk = segmentIndex > 0 && 
                                  currentRoute.segments[segmentIndex - 1].stations[currentRoute.segments[segmentIndex - 1].stations.length - 1] === 'CP';
                                
                                if (lastIdx > firstIdx) {
                                  // Towards Noida - Platform 3 from Rajiv Chowk (interchange station)
                                  platformInfo = (firstStationId === 'CP' || isFromRajivChowk) ? '3' : '1';
                                  terminalStation = getStationById(metroData.stations, 'NEC');
                                } else {
                                  // Towards Dwarka - Platform 4 from Rajiv Chowk (interchange station)
                                  platformInfo = (firstStationId === 'CP' || isFromRajivChowk) ? '4' : '2';
                                  terminalStation = getStationById(metroData.stations, 'DW'); // Dwarka Sector 21
                                }
                              } else if (segment.line === 'Blue Branch') {
                                if (lastIdx > firstIdx) {
                                  platformInfo = '1';
                                  terminalStation = getStationById(metroData.stations, 'VA');
                                } else {
                                  platformInfo = '2';
                                  terminalStation = getStationById(metroData.stations, 'YB');
                                }
                              } else if (segment.line === 'Yellow') {
                                // Yellow Line: towards HUDA City Centre = Platform 1, towards Samaypur Badli = Platform 2
                                if (lastIdx > firstIdx) {
                                  platformInfo = '1';
                                  terminalStation = getStationById(metroData.stations, 'HZ');
                                } else {
                                  platformInfo = '2';
                                  terminalStation = getStationById(metroData.stations, 'SB');
                                }
                              } else if (segment.line === 'Violet') {
                                // Violet Line: towards Kashmere Gate = Platform 2 (or 4 from Mandi House), towards Raja Nahar Singh = Platform 1 (or 5 from Kashmere Gate)
                                const firstStationId = segment.stations[0];
                                // Check if this is a transfer segment from Mandi House
                                const isFromMandiHouse = segmentIndex > 0 && 
                                  currentRoute.segments[segmentIndex - 1].stations[currentRoute.segments[segmentIndex - 1].stations.length - 1] === 'MH';
                                
                                if (firstIdx > lastIdx) {
                                  // Towards Kashmere Gate - Platform 4 from Mandi House (interchange station)
                                  platformInfo = (firstStationId === 'MH' || isFromMandiHouse) ? '4' : '2';
                                  terminalStation = getStationById(metroData.stations, 'KA'); // Kashmere Gate
                                } else {
                                  // Platform 5 from Kashmere Gate, Platform 1 from other stations
                                  platformInfo = firstStationId === 'KA' ? '5' : '1';
                                  terminalStation = getStationById(metroData.stations, 'RNS'); // Raja Nahar Singh
                                }
                              } else if (segment.line === 'Red') {
                                // Red Line: towards Rithala = Platform 3, towards Shaheed Sthal = Platform 4
                                // Red Line order: RV(0) ... TH(12), KA(13) ... SS(21)
                                
                                // When segment has only 1 station (destination), get direction from previous segment's last station
                                let effectiveFirstIdx = firstIdx;
                                if (firstIdx === lastIdx && segmentIndex > 0) {
                                  const prevSegment = currentRoute.segments[segmentIndex - 1];
                                  const prevLastStationId = prevSegment.stations[prevSegment.stations.length - 1];
                                  effectiveFirstIdx = lineData.stations.indexOf(prevLastStationId);
                                }
                                
                                // KA (13) to TH (12): effectiveFirstIdx=13, lastIdx=12, 13>12=true = Platform 3
                                if (effectiveFirstIdx > lastIdx) {
                                  // Going towards Rithala (lower indices)
                                  platformInfo = '3';
                                  terminalStation = getStationById(metroData.stations, 'RV'); // Rithala
                                } else {
                                  // Going towards Shaheed Sthal (higher indices)
                                  platformInfo = '4';
                                  terminalStation = getStationById(metroData.stations, 'SS'); // Shaheed Sthal
                                }
                              } else if (segment.line === 'Magenta') {
                                // Magenta Line order: BA(0) → ... → JPW(24)
                                // towards Janakpuri West = Platform 4, towards Botanical Garden = Platform 3
                                if (lastIdx > firstIdx) {
                                  // Going towards Janakpuri West (higher indices)
                                  platformInfo = '4';
                                  terminalStation = getStationById(metroData.stations, 'JPW'); // Janakpuri West
                                } else {
                                  // Going towards Botanical Garden (lower indices)
                                  platformInfo = '3';
                                  terminalStation = getStationById(metroData.stations, 'BA'); // Botanical Garden
                                }
                              } else if (segment.line === 'Orange') {
                                // Orange (Airport Express) Line order: ND(0) → SHS → DU → AP → IG → DW(5) → YDS25(6)
                                // Towards Dwarka/IGI Airport = Platform 2, towards New Delhi = Platform 3
                                if (lastIdx > firstIdx) {
                                  // Going towards Dwarka Sector 21 (higher indices)
                                  platformInfo = '2';
                                  terminalStation = getStationById(metroData.stations, 'YDS25'); // Dwarka Sector 21
                                } else {
                                  // Going towards New Delhi (lower indices)
                                  platformInfo = '3';
                                  terminalStation = getStationById(metroData.stations, 'ND'); // New Delhi
                                }
                              }
                            }
                            
                            if (platformInfo && terminalStation) {
                              return (
                                <div className="border-2 border-border rounded-lg p-3 bg-muted/30 mb-2">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm text-muted-foreground">↓</span>
                                    <LineBadge line={segment.line} />
                                  </div>
                                  <div className="text-sm text-destructive font-medium mb-1">
                                    {i18n.language === 'hi' ? 'की ओर' : 'Towards'} {i18n.language === 'hi' ? terminalStation.nameHi : terminalStation.name}
                                  </div>
                                  <div className="text-base text-destructive font-semibold">
                                    {i18n.language === 'hi' ? 'प्लेटफॉर्म' : 'Platform'} {platformInfo}
                                  </div>
                                </div>
                              );
                            }
                            return <LineBadge line={segment.line} />;
                          })()}
                        </div>
                         <div className="space-y-1">
                          {/* Show interchange station at start of non-first segments */}
                          {segmentIndex > 0 && (() => {
                            const prevSegment = currentRoute.segments[segmentIndex - 1];
                            const interchangeStationId = prevSegment.stations[prevSegment.stations.length - 1];
                            const interchangeStation = getStationById(metroData.stations, interchangeStationId);
                            if (!interchangeStation) return null;
                            
                            return (
                              <div key={`interchange-${interchangeStationId}`} className="flex items-center gap-3 py-1">
                                <div className="flex flex-col items-center">
                                  <div className="w-3 h-3 rounded-full border-2 bg-accent border-accent" />
                                  <div className="w-0.5 h-6 bg-muted-foreground/50" />
                                </div>
                                <div className="flex-1">
                                  <button
                                    onClick={() => navigate(`/station/${interchangeStationId}`)}
                                    className="text-left hover:text-primary transition-colors font-semibold text-base"
                                  >
                                    {i18n.language === 'hi' ? interchangeStation.nameHi : interchangeStation.name}
                                  </button>
                                  <div className="text-xs text-muted-foreground mt-0.5">
                                    Interchange station
                                  </div>
                                </div>
                                <div className="text-xs text-accent font-medium px-2 py-0.5 bg-accent/10 rounded">
                                  {t('route.boardAt').split(' ')[0]}
                                </div>
                              </div>
                            );
                          })()}
                          {segment.stations.map((stationId, stationIndex) => {
                            const station = getStationById(metroData.stations, stationId);
                            if (!station) return null;

                            const isFirst = stationIndex === 0;
                            const isLast = stationIndex === segment.stations.length - 1;
                            const isIntermediate = !isFirst && !isLast;
                            
                            // Skip first station if it's a transfer segment (already shown above)
                            const showInterchangeAbove = segmentIndex > 0;

                            return (
                              <div key={stationId} className="flex items-center gap-3 py-1">
                                <div className="flex flex-col items-center">
                                  <div
                                    className={`w-3 h-3 rounded-full border-2 ${
                                      (isFirst && !showInterchangeAbove) || isLast 
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
                                      (isFirst && !showInterchangeAbove) || isLast ? 'font-semibold text-base' : 'text-sm text-muted-foreground'
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
                                {((isFirst && !showInterchangeAbove) || isLast) && (
                                  <div className="text-xs text-accent font-medium px-2 py-0.5 bg-accent/10 rounded">
                                    {isFirst && !showInterchangeAbove ? t('route.boardAt').split(' ')[0] : 'Exit'}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {segmentIndex < currentRoute.segments.length - 1 && (
                      <div className="ml-14 mb-4">
                        <Button variant="outline" size="sm" className="text-destructive border-destructive hover:bg-destructive/10">
                          {i18n.language === 'hi' ? 'ट्रेन बदलें' : 'Change Train'}
                        </Button>
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {t('route.walkingTime')}: ~3 {t('route.minutes')}
                        </div>
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
