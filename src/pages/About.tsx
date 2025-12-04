import { useTranslation } from 'react-i18next';
import { Train, Users, MapPin, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const About = () => {
  const { t, i18n } = useTranslation();
  const isHindi = i18n.language === 'hi';

  return (
    <div className="container mx-auto px-4 py-6 pb-24 md:pb-6">
      <h1 className="text-2xl font-bold text-foreground mb-6">
        {isHindi ? 'हमारे बारे में' : 'About Us'}
      </h1>

      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              {isHindi ? 'दिल्ली मेट्रो प्लानर' : 'Delhi Metro Planner'}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {isHindi 
                ? 'दिल्ली मेट्रो प्लानर एक यूजर-फ्रेंडली ऐप है जो आपको दिल्ली NCR में मेट्रो यात्रा की योजना बनाने में मदद करता है। हमारा उद्देश्य आपकी यात्रा को आसान और सुविधाजनक बनाना है।'
                : 'Delhi Metro Planner is a user-friendly app that helps you plan your metro journey across Delhi NCR. Our goal is to make your travel easy and convenient.'}
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <Train className="w-8 h-8 mx-auto text-primary mb-2" />
              <div className="text-2xl font-bold text-foreground">280+</div>
              <div className="text-sm text-muted-foreground">
                {isHindi ? 'स्टेशन' : 'Stations'}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <MapPin className="w-8 h-8 mx-auto text-primary mb-2" />
              <div className="text-2xl font-bold text-foreground">12+</div>
              <div className="text-sm text-muted-foreground">
                {isHindi ? 'मेट्रो लाइनें' : 'Metro Lines'}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              {isHindi ? 'विशेषताएं' : 'Features'}
            </h2>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span>{isHindi ? 'सबसे तेज़ और सबसे कम ट्रांसफर वाले रूट खोजें' : 'Find fastest routes with minimum transfers'}</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span>{isHindi ? 'प्लेटफॉर्म नंबर और दिशा की जानकारी' : 'Platform numbers and direction information'}</span>
              </li>
              <li className="flex items-start gap-3">
                <Train className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span>{isHindi ? 'किराया और यात्रा समय की जानकारी' : 'Fare and travel time details'}</span>
              </li>
              <li className="flex items-start gap-3">
                <Users className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span>{isHindi ? 'हिंदी और अंग्रेजी में उपलब्ध' : 'Available in Hindi and English'}</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              {isHindi ? 'संपर्क करें' : 'Contact Us'}
            </h2>
            <p className="text-muted-foreground">
              {isHindi 
                ? 'किसी भी सुझाव या प्रतिक्रिया के लिए हमसे संपर्क करें।'
                : 'Contact us for any suggestions or feedback.'}
            </p>
            <p className="text-primary mt-2">support@delhimetroplanner.com</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default About;
