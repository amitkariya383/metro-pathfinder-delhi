import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineBadge } from '@/components/LineBadge';
import { loadMetroData, getStationById } from '@/utils/metroData';
import { Station, MetroData } from '@/types/metro';
import {
  Clock,
  MapPin,
  Accessibility,
  DoorOpen,
  Bus,
  ArrowLeft,
  Navigation,
  Car,
  Wifi,
  ShoppingBag,
  UtensilsCrossed,
  BanknoteIcon
} from 'lucide-react';

export default function StationDetail() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [station, setStation] = useState<Station | null>(null);
  const [metroData, setMetroData] = useState<MetroData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetroData()
      .then(data => {
        setMetroData(data);
        if (id) {
          const foundStation = getStationById(data.stations, id);
          setStation(foundStation || null);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to load station:', error);
        setLoading(false);
      });
  }, [id]);

  const getFacilityIcon = (facility: string) => {
    const icons: Record<string, any> = {
      parking: Car,
      lifts: Accessibility,
      toilets: DoorOpen,
      atm: BanknoteIcon,
      security: MapPin,
      food: UtensilsCrossed,
      retail: ShoppingBag
    };
    return icons[facility] || MapPin;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading station...</p>
        </div>
      </div>
    );
  }

  if (!station) {
    return (
      <div className="container mx-auto px-4 py-8 md:ml-64">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">{t('errors.stationNotFound')}</p>
            <Button onClick={() => navigate('/')} className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 md:ml-64 pb-24 md:pb-8 max-w-6xl">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      {/* Station Header */}
      <Card className="mb-6 shadow-lg">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                {i18n.language === 'hi' ? station.nameHi : station.name}
              </h1>
              <div className="flex gap-2 flex-wrap mb-3">
                {station.lines.map((line) => (
                  <LineBadge key={line} line={line} size="lg" />
                ))}
              </div>
              {station.isInterchange && (
                <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-3 py-1 rounded-full text-sm font-medium">
                  <Navigation className="h-4 w-4" />
                  {t('station.interchange')}
                </div>
              )}
            </div>
            <Button
              onClick={() => navigate(`/route?from=${station.id}`)}
              className="gap-2"
            >
              <Navigation className="h-4 w-4" />
              Plan Route From Here
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Timings */}
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              {t('station.timings')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="text-muted-foreground">{t('station.firstTrain')}</span>
              <span className="font-semibold text-foreground">{station.firstTrain}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="text-muted-foreground">{t('station.lastTrain')}</span>
              <span className="font-semibold text-foreground">{station.lastTrain}</span>
            </div>
          </CardContent>
        </Card>

        {/* Facilities */}
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Accessibility className="h-5 w-5 text-primary" />
              {t('station.facilities')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {station.facilities.map((facility) => {
                const Icon = getFacilityIcon(facility);
                return (
                  <div
                    key={facility}
                    className="flex items-center gap-2 p-2 rounded-lg bg-muted"
                  >
                    <Icon className="h-4 w-4 text-primary" />
                    <span className="text-sm capitalize">{t(`facilities.${facility}`)}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Exits & Landmarks */}
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DoorOpen className="h-5 w-5 text-primary" />
              {t('station.exits')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {station.exits.map((exit, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg border border-border hover:border-primary transition-colors"
                >
                  <div className="font-medium text-foreground mb-1">{exit.name}</div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {exit.landmark}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {exit.distance}m away
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Nearby Transport */}
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bus className="h-5 w-5 text-primary" />
              {t('station.nearbyTransport')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {station.nearbyTransport.map((transport, index) => (
                <div
                  key={index}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium"
                >
                  <Bus className="h-3 w-3" />
                  {transport}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
