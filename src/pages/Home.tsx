import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StationSearch } from '@/components/StationSearch';
import { LineBadge } from '@/components/LineBadge';
import { loadMetroData } from '@/utils/metroData';
import { Station, MetroData } from '@/types/metro';
import { Clock, MapPin, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';

export default function Home() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [metroData, setMetroData] = useState<MetroData | null>(null);
  const [recentSearches, setRecentSearches] = useState<Station[]>([]);
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

    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse recent searches:', e);
      }
    }
  }, []);

  const handleStationSelect = (station: Station) => {
    // Save to recent searches
    const updated = [station, ...recentSearches.filter(s => s.id !== station.id)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));

    // Navigate to station page
    navigate(`/station/${station.id}`);
  };

  const popularStations = metroData?.stations.filter(s => 
    ['CP', 'ND', 'KA', 'DW', 'HZ'].includes(s.id)
  ) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('home.loading') || 'Loading...'}</p>
        </div>
      </div>
    );
  }

  if (!metroData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-center text-muted-foreground">Failed to load metro data</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 py-3 md:py-8 md:pb-8 h-[calc(100vh-56px-32px-56px)] md:h-auto overflow-hidden md:overflow-auto flex flex-col">
      {/* Hero Section */}
      <div className="mb-3 md:mb-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-primary to-accent rounded-xl md:rounded-2xl p-4 md:p-8 text-white shadow-xl mb-3 md:mb-6">
            <h2 className="text-xl md:text-4xl font-bold mb-1 md:mb-2">
              {t('app.title')}
            </h2>
            <p className="text-white/90 text-sm md:text-lg">
              {t('app.subtitle')}
            </p>
          </div>

          {/* Search Box */}
          <div className="bg-card rounded-xl shadow-lg p-3 md:p-6">
            <StationSearch
              stations={metroData.stations}
              onSelect={handleStationSelect}
            />
          </div>
        </div>
      </div>

      {/* Live Status */}
      <div className="max-w-2xl mx-auto mb-3 md:mb-8 w-full">
        <Card className="border-l-4 border-l-success">
          <CardContent className="flex items-center gap-2 md:gap-3 py-2 md:py-4">
            <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-success" />
            <div>
              <p className="font-semibold text-foreground text-sm md:text-base">{t('status.allNormal')}</p>
              <p className="text-xs md:text-sm text-muted-foreground">
                Last updated: {new Date().toLocaleTimeString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-3 md:gap-6 flex-1 min-h-0 overflow-hidden md:overflow-visible w-full">
        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <Card className="card-hover overflow-hidden">
            <CardHeader className="py-2 px-3 md:p-6">
              <CardTitle className="flex items-center gap-2 text-sm md:text-base">
                <Clock className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                {t('home.recentSearches')}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-2 md:p-6 md:pt-0">
              <div className="space-y-1">
                {recentSearches.map((station) => (
                  <button
                    key={station.id}
                    onClick={() => handleStationSelect(station)}
                    className="w-full text-left p-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="font-medium text-foreground text-sm">
                      {i18n.language === 'hi' ? station.nameHi : station.name}
                    </div>
                    <div className="flex gap-1 mt-0.5 flex-wrap">
                      {station.lines.map((line) => (
                        <LineBadge key={line} line={line} size="sm" />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Popular Stations */}
        <Card className="card-hover overflow-hidden">
          <CardHeader className="py-2 px-3 md:p-6">
            <CardTitle className="flex items-center gap-2 text-sm md:text-base">
              <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-accent" />
              {t('home.popularStations')}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-2 md:p-6 md:pt-0">
            <div className="space-y-1">
              {popularStations.map((station) => (
                <button
                  key={station.id}
                  onClick={() => handleStationSelect(station)}
                  className="w-full text-left p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-medium text-foreground text-sm">
                        {i18n.language === 'hi' ? station.nameHi : station.name}
                      </div>
                      <div className="flex gap-1 mt-0.5 flex-wrap">
                        {station.lines.map((line) => (
                          <LineBadge key={line} line={line} size="sm" />
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
