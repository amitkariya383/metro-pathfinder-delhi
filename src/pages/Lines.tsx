import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineBadge } from '@/components/LineBadge';
import { loadMetroData, getStationById } from '@/utils/metroData';
import { MetroData, Line } from '@/types/metro';
import { TramFront } from 'lucide-react';

export default function Lines() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [metroData, setMetroData] = useState<MetroData | null>(null);
  const [selectedLine, setSelectedLine] = useState<Line | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetroData()
      .then(data => {
        setMetroData(data);
        if (data.lines.length > 0) {
          setSelectedLine(data.lines[0]);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to load metro data:', error);
        setLoading(false);
      });
  }, []);

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

  return (
    <div className="container mx-auto px-4 py-6 md:ml-64 pb-24 md:pb-8">
      <div className="flex items-center gap-3 mb-6">
        <TramFront className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">{t('nav.lines')}</h1>
      </div>

      {/* Line Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {metroData.lines.map((line) => (
          <button
            key={line.id}
            onClick={() => setSelectedLine(line)}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedLine?.id === line.id
                ? 'border-primary bg-primary/5 shadow-md'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <LineBadge line={line.id} size="lg" />
            <div className="mt-2 text-sm text-muted-foreground">
              {line.stations.length} stations
            </div>
          </button>
        ))}
      </div>

      {/* Selected Line Details */}
      {selectedLine && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <LineBadge line={selectedLine.id} size="lg" />
              <span>{i18n.language === 'hi' ? selectedLine.nameHi : selectedLine.name}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {selectedLine.stations.map((stationId, index) => {
                const station = getStationById(metroData.stations, stationId);
                if (!station) return null;

                const isInterchange = station.isInterchange;
                const isFirst = index === 0;
                const isLast = index === selectedLine.stations.length - 1;

                return (
                  <div key={stationId} className="flex items-center gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-4 h-4 rounded-full border-2 ${
                          isInterchange
                            ? 'border-accent bg-accent'
                            : isFirst || isLast
                            ? 'border-primary bg-primary'
                            : 'border-muted-foreground bg-background'
                        }`}
                      />
                      {!isLast && <div className="w-0.5 h-12 bg-muted-foreground/30" />}
                    </div>

                    <button
                      onClick={() => navigate(`/station/${stationId}`)}
                      className="flex-1 text-left p-4 rounded-lg hover:bg-muted transition-colors group"
                    >
                      <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {i18n.language === 'hi' ? station.nameHi : station.name}
                      </div>
                      {isInterchange && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {station.lines
                            .filter(line => line !== selectedLine.id)
                            .map((line) => (
                              <LineBadge key={line} line={line} size="sm" />
                            ))}
                        </div>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
