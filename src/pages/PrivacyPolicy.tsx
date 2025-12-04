import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';

const PrivacyPolicy = () => {
  const { i18n } = useTranslation();
  const isHindi = i18n.language === 'hi';

  return (
    <div className="container mx-auto px-4 py-6 pb-24 md:pb-6">
      <h1 className="text-2xl font-bold text-foreground mb-6">
        {isHindi ? 'गोपनीयता नीति' : 'Privacy Policy'}
      </h1>

      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground mb-4">
              {isHindi 
                ? 'अंतिम अपडेट: दिसंबर 2024'
                : 'Last updated: December 2024'}
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {isHindi 
                ? 'दिल्ली मेट्रो प्लानर आपकी गोपनीयता का सम्मान करता है। यह गोपनीयता नीति बताती है कि हम आपकी जानकारी का उपयोग कैसे करते हैं।'
                : 'Delhi Metro Planner respects your privacy. This Privacy Policy explains how we use your information.'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              {isHindi ? 'जानकारी का संग्रह' : 'Information Collection'}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {isHindi 
                ? 'हम केवल वह जानकारी एकत्र करते हैं जो ऐप के उपयोग के लिए आवश्यक है, जैसे कि आपकी खोज हिस्ट्री और पसंदीदा स्टेशन। यह डेटा आपके डिवाइस पर स्थानीय रूप से संग्रहीत होता है।'
                : 'We only collect information necessary for the app\'s functionality, such as your search history and favorite stations. This data is stored locally on your device.'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              {isHindi ? 'डेटा का उपयोग' : 'Use of Data'}
            </h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>• {isHindi ? 'रूट प्लानिंग सेवाएं प्रदान करने के लिए' : 'To provide route planning services'}</li>
              <li>• {isHindi ? 'ऐप अनुभव को बेहतर बनाने के लिए' : 'To improve app experience'}</li>
              <li>• {isHindi ? 'आपकी हाल की खोजों को याद रखने के लिए' : 'To remember your recent searches'}</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              {isHindi ? 'डेटा सुरक्षा' : 'Data Security'}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {isHindi 
                ? 'आपका डेटा आपके डिवाइस पर सुरक्षित रूप से संग्रहीत है। हम आपकी व्यक्तिगत जानकारी किसी तीसरे पक्ष के साथ साझा नहीं करते हैं।'
                : 'Your data is securely stored on your device. We do not share your personal information with any third parties.'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              {isHindi ? 'कुकीज़' : 'Cookies'}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {isHindi 
                ? 'हम कुकीज़ का उपयोग केवल आपकी भाषा प्राथमिकता और थीम सेटिंग्स को याद रखने के लिए करते हैं।'
                : 'We use cookies only to remember your language preference and theme settings.'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              {isHindi ? 'नीति में बदलाव' : 'Changes to Policy'}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {isHindi 
                ? 'हम समय-समय पर इस गोपनीयता नीति को अपडेट कर सकते हैं। कोई भी बदलाव इस पेज पर पोस्ट किया जाएगा।'
                : 'We may update this Privacy Policy from time to time. Any changes will be posted on this page.'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              {isHindi ? 'संपर्क' : 'Contact'}
            </h2>
            <p className="text-muted-foreground">
              {isHindi 
                ? 'गोपनीयता संबंधी किसी भी प्रश्न के लिए हमसे संपर्क करें:'
                : 'For any privacy-related questions, contact us at:'}
            </p>
            <p className="text-primary mt-2">privacy@delhimetroplanner.com</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
