export const LANGUAGE_META = [
  { code: 'en', label: 'English', native: 'English', dir: 'ltr', locale: 'en-IN', speech: 'en-IN' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी', dir: 'ltr', locale: 'hi-IN', speech: 'hi-IN' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ', dir: 'ltr', locale: 'kn-IN', speech: 'kn-IN' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు', dir: 'ltr', locale: 'te-IN', speech: 'te-IN' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்', dir: 'ltr', locale: 'ta-IN', speech: 'ta-IN' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം', dir: 'ltr', locale: 'ml-IN', speech: 'ml-IN' },
  { code: 'mr', label: 'Marathi', native: 'मराठी', dir: 'ltr', locale: 'mr-IN', speech: 'mr-IN' },
];

export const WEATHER_TERMS = {
  en: {
    clear: 'Clear sky', mainlyClear: 'Mainly clear', partlyCloudy: 'Partly cloudy', overcast: 'Overcast', fog: 'Fog',
    drizzle: 'Drizzle', rain: 'Rain', heavyRain: 'Heavy rain', showers: 'Rain showers', thunderstorm: 'Thunderstorm',
    snow: 'Snow', strongWind: 'Strong wind', heatWave: 'Heat wave', coldWave: 'Cold wave',
    uvLow: 'Low', uvModerate: 'Moderate', uvHigh: 'High', uvVeryHigh: 'Very high', uvExtreme: 'Extreme',
  },
  hi: { clear: 'आसमान साफ़', mainlyClear: 'ज़्यादातर साफ़', partlyCloudy: 'आंशिक बादल', overcast: 'बादल छाए', fog: 'कोहरा', drizzle: 'बूंदाबांदी', rain: 'बारिश', heavyRain: 'तेज़ बारिश', showers: 'बौछारें', thunderstorm: 'गरज के साथ बारिश', snow: 'बर्फ़बारी', strongWind: 'तेज़ हवा', heatWave: 'लू', coldWave: 'शीत लहर', uvLow: 'कम', uvModerate: 'मध्यम', uvHigh: 'अधिक', uvVeryHigh: 'बहुत अधिक', uvExtreme: 'अत्यधिक' },
  kn: { clear: 'ಆಕಾಶ ಸ್ವಚ್ಛ', mainlyClear: 'ಹೆಚ್ಚಾಗಿ ಸ್ವಚ್ಛ', partlyCloudy: 'ಭಾಗಶಃ ಮೋಡ', overcast: 'ಮೋಡ ಕವಿದಿದೆ', fog: 'ಮಂಜು', drizzle: 'ತುಂತುರು ಮಳೆ', rain: 'ಮಳೆ', heavyRain: 'ಭಾರಿ ಮಳೆ', showers: 'ಮಳೆಯ ತುಂತುರು', thunderstorm: 'ಗುಡುಗು ಸಹಿತ ಮಳೆ', snow: 'ಹಿಮಪಾತ', strongWind: 'ಬಲವಾದ ಗಾಳಿ', heatWave: 'ಬಿಸಿಗಾಳಿ', coldWave: 'ಚಳಿಗಾಳಿ', uvLow: 'ಕಡಿಮೆ', uvModerate: 'ಮಧ್ಯಮ', uvHigh: 'ಹೆಚ್ಚು', uvVeryHigh: 'ತುಂಬಾ ಹೆಚ್ಚು', uvExtreme: 'ಅತ್ಯಂತ ಹೆಚ್ಚು' },
  te: { clear: 'ఆకాశం నిర్మలంగా', mainlyClear: 'ఎక్కువగా నిర్మలంగా', partlyCloudy: 'పాక్షికంగా మేఘావృతం', overcast: 'మేఘావృతం', fog: 'మంచు', drizzle: 'చినుకులు', rain: 'వర్షం', heavyRain: 'భారీ వర్షం', showers: 'వర్షపు జల్లులు', thunderstorm: 'ఉరుములతో కూడిన వర్షం', snow: 'మంచు వర్షం', strongWind: 'బలమైన గాలి', heatWave: 'వడగాలి', coldWave: 'చలిగాలి', uvLow: 'తక్కువ', uvModerate: 'మధ్యస్థం', uvHigh: 'అధికం', uvVeryHigh: 'చాలా అధికం', uvExtreme: 'అత్యధికం' },
  ta: { clear: 'வானம் தெளிவு', mainlyClear: 'பெரும்பாலும் தெளிவு', partlyCloudy: 'பகுதி மேகமூட்டம்', overcast: 'மேகமூட்டம்', fog: 'மூடுபனி', drizzle: 'தூறல்', rain: 'மழை', heavyRain: 'கனமழை', showers: 'மழைத்தூறல்', thunderstorm: 'இடியுடன் கூடிய மழை', snow: 'பனிப்பொழிவு', strongWind: 'பலத்த காற்று', heatWave: 'வெப்ப அலை', coldWave: 'குளிர் அலை', uvLow: 'குறைவு', uvModerate: 'மிதமான', uvHigh: 'அதிகம்', uvVeryHigh: 'மிக அதிகம்', uvExtreme: 'மிகக் கடுமையான' },
  ml: { clear: 'തെളിഞ്ഞ ആകാശം', mainlyClear: 'മിക്കവാറും തെളിഞ്ഞത്', partlyCloudy: 'ഭാഗികമായി മേഘാവൃതം', overcast: 'മേഘാവൃതം', fog: 'മൂടൽമഞ്ഞ്', drizzle: 'ചാറ്റൽമഴ', rain: 'മഴ', heavyRain: 'കനത്ത മഴ', showers: 'മഴച്ചാറ്റൽ', thunderstorm: 'ഇടിമിന്നലോടുകൂടിയ മഴ', snow: 'മഞ്ഞുവീഴ്ച', strongWind: 'ശക്തമായ കാറ്റ്', heatWave: 'ഉഷ്ണതരംഗം', coldWave: 'ശീതതരംഗം', uvLow: 'കുറവ്', uvModerate: 'മിതമായ', uvHigh: 'കൂടുതൽ', uvVeryHigh: 'വളരെ കൂടുതൽ', uvExtreme: 'അത്യധികം' },
  mr: { clear: 'आकाश निरभ्र', mainlyClear: 'बहुतेक निरभ्र', partlyCloudy: 'अंशतः ढगाळ', overcast: 'ढगाळ', fog: 'धुके', drizzle: 'रिमझिम', rain: 'पाऊस', heavyRain: 'मुसळधार पाऊस', showers: 'पावसाच्या सरी', thunderstorm: 'मेघगर्जनेसह पाऊस', snow: 'हिमवृष्टी', strongWind: 'जोरदार वारा', heatWave: 'उष्णतेची लाट', coldWave: 'थंडीची लाट', uvLow: 'कमी', uvModerate: 'मध्यम', uvHigh: 'जास्त', uvVeryHigh: 'खूप जास्त', uvExtreme: 'अत्यंत जास्त' },
  bn: { clear: 'আকাশ পরিষ্কার', mainlyClear: 'মূলত পরিষ্কার', partlyCloudy: 'আংশিক মেঘলা', overcast: 'মেঘাচ্ছন্ন', fog: 'কুয়াশা', drizzle: 'গুঁড়ি গুঁড়ি বৃষ্টি', rain: 'বৃষ্টি', heavyRain: 'ভারী বৃষ্টি', showers: 'বৃষ্টির ঝাপটা', thunderstorm: 'বজ্রসহ বৃষ্টি', snow: 'তুষারপাত', strongWind: 'প্রবল বাতাস', heatWave: 'তাপপ্রবাহ', coldWave: 'শৈত্যপ্রবাহ', uvLow: 'কম', uvModerate: 'মাঝারি', uvHigh: 'বেশি', uvVeryHigh: 'খুব বেশি', uvExtreme: 'চরম' },
  gu: { clear: 'સ્વચ્છ આકાશ', mainlyClear: 'મુખ્યત્વે સ્વચ્છ', partlyCloudy: 'આંશિક વાદળછાયું', overcast: 'વાદળછાયું', fog: 'ધુમ્મસ', drizzle: 'ઝરમર વરસાદ', rain: 'વરસાદ', heavyRain: 'ભારે વરસાદ', showers: 'વરસાદી ઝાપટાં', thunderstorm: 'ગાજવીજ સાથે વરસાદ', snow: 'હિમવર્ષા', strongWind: 'તીવ્ર પવન', heatWave: 'ગરમીની લહેર', coldWave: 'ઠંડીની લહેર', uvLow: 'ઓછું', uvModerate: 'મધ્યમ', uvHigh: 'વધુ', uvVeryHigh: 'ખૂબ વધુ', uvExtreme: 'અત્યંત વધુ' },
  pa: { clear: 'ਸਾਫ਼ ਆਸਮਾਨ', mainlyClear: 'ਜ਼ਿਆਦਾਤਰ ਸਾਫ਼', partlyCloudy: 'ਅੰਸ਼ਕ ਬੱਦਲ', overcast: 'ਬੱਦਲਵਾਈ', fog: 'ਕੋਹਰਾ', drizzle: 'ਬੂੰਦਾ-ਬਾਂਦੀ', rain: 'ਮੀਂਹ', heavyRain: 'ਭਾਰੀ ਮੀਂਹ', showers: 'ਮੀਂਹ ਦੀਆਂ ਛਿੱਟਾਂ', thunderstorm: 'ਗਰਜ-ਤੂਫ਼ਾਨ', snow: 'ਬਰਫ਼ਬਾਰੀ', strongWind: 'ਤੇਜ਼ ਹਵਾ', heatWave: 'ਲੂ', coldWave: 'ਸੀਤ ਲਹਿਰ', uvLow: 'ਘੱਟ', uvModerate: 'ਦਰਮਿਆਨਾ', uvHigh: 'ਵੱਧ', uvVeryHigh: 'ਬਹੁਤ ਵੱਧ', uvExtreme: 'ਬਹੁਤ ਜ਼ਿਆਦਾ' },
  or: { clear: 'ସ୍ୱଚ୍ଛ ଆକାଶ', mainlyClear: 'ମୁଖ୍ୟତଃ ସ୍ୱଚ୍ଛ', partlyCloudy: 'ଆଂଶିକ ମେଘୁଆ', overcast: 'ମେଘୁଆ', fog: 'କୁହୁଡ଼ି', drizzle: 'ଝିପିଝିପି ବର୍ଷା', rain: 'ବର୍ଷା', heavyRain: 'ପ୍ରବଳ ବର୍ଷା', showers: 'ବର୍ଷା ଛିଟା', thunderstorm: 'ବଜ୍ରପାତ ସହ ବର୍ଷା', snow: 'ତୁଷାରପାତ', strongWind: 'ପ୍ରବଳ ପବନ', heatWave: 'ଗ୍ରୀଷ୍ମ ଲହରୀ', coldWave: 'ଶୀତ ଲହରୀ', uvLow: 'କମ୍', uvModerate: 'ମଧ୍ୟମ', uvHigh: 'ଅଧିକ', uvVeryHigh: 'ବହୁତ ଅଧିକ', uvExtreme: 'ଅତ୍ୟଧିକ' },
  as: { clear: 'পৰিষ্কাৰ আকাশ', mainlyClear: 'মূলত পৰিষ্কাৰ', partlyCloudy: 'আংশিক ডাৱৰীয়া', overcast: 'ডাৱৰীয়া', fog: 'কুঁৱলী', drizzle: 'গুঁড়ি গুঁড়ি বৰষুণ', rain: 'বৰষুণ', heavyRain: 'ধাৰাসাৰ বৰষুণ', showers: 'বৰষুণৰ চেঁচা', thunderstorm: 'ঢেৰেকনিৰে বৰষুণ', snow: 'তুষাৰপাত', strongWind: 'প্ৰবল বতাহ', heatWave: 'তাপপ্ৰবাহ', coldWave: 'শীতপ্ৰবাহ', uvLow: 'কম', uvModerate: 'মধ্যম', uvHigh: 'বেছি', uvVeryHigh: 'অতি বেছি', uvExtreme: 'চূড়ান্ত' },
  ur: { clear: 'صاف آسمان', mainlyClear: 'زیادہ تر صاف', partlyCloudy: 'جزوی ابر آلود', overcast: 'ابر آلود', fog: 'دھند', drizzle: 'بوندا باندی', rain: 'بارش', heavyRain: 'موسلا دھار بارش', showers: 'بارش کی جھڑیاں', thunderstorm: 'گرج چمک کے ساتھ بارش', snow: 'برف باری', strongWind: 'تیز ہوا', heatWave: 'گرمی کی لہر', coldWave: 'سردی کی لہر', uvLow: 'کم', uvModerate: 'درمیانہ', uvHigh: 'زیادہ', uvVeryHigh: 'بہت زیادہ', uvExtreme: 'انتہائی زیادہ' },
  kok: { clear: 'स्वच्छ आकाश', mainlyClear: 'मुखेल स्वच्छ', partlyCloudy: 'अंशतः ढगाळ', overcast: 'ढगाळ', fog: 'धुकें', drizzle: 'रिमझिम पावस', rain: 'पावस', heavyRain: 'मुसळधार पावस', showers: 'पावसाची सर', thunderstorm: 'मेघगर्जनेसह पावस', snow: 'हिमवर्साव', strongWind: 'जोरदार वाऱो', heatWave: 'उष्णतेची लाट', coldWave: 'थंडीची लाट', uvLow: 'उणें', uvModerate: 'मध्यम', uvHigh: 'चड', uvVeryHigh: 'खूप चड', uvExtreme: 'अत्यंत चड' },
};

export const ALERT_TERMS = {
  en: { official: 'Official weather alert', generated: 'WeatherGPT risk assessment', validUntil: 'Valid until', heavyRain: 'Heavy rain warning', strongWind: 'Strong wind warning', heatWave: 'Heat wave warning', thunderstorm: 'Thunderstorm warning' },
  hi: { official: 'आधिकारिक मौसम चेतावनी', generated: 'वेदरGPT जोखिम आकलन', validUntil: 'मान्य մինչև', heavyRain: 'तेज़ बारिश की चेतावनी', strongWind: 'तेज़ हवा की चेतावनी', heatWave: 'लू की चेतावनी', thunderstorm: 'गरज-चमक की चेतावनी' },
  kn: { official: 'ಅಧಿಕೃತ ಹವಾಮಾನ ಎಚ್ಚರಿಕೆ', generated: 'ವೆದರ್GPT ಅಪಾಯ ಮೌಲ್ಯಮಾಪನ', validUntil: 'ಮಾನ್ಯತೆ ಕೊನೆ', heavyRain: 'ಭಾರಿ ಮಳೆಯ ಎಚ್ಚರಿಕೆ', strongWind: 'ಬಲವಾದ ಗಾಳಿಯ ಎಚ್ಚರಿಕೆ', heatWave: 'ಬಿಸಿಗಾಳಿಯ ಎಚ್ಚರಿಕೆ', thunderstorm: 'ಗುಡುಗು ಸಹಿತ ಮಳೆಯ ಎಚ್ಚರಿಕೆ' },
  te: { official: 'అధికారిక వాతావరణ హెచ్చరిక', generated: 'వెదర్GPT ప్రమాద అంచనా', validUntil: 'చెల్లుబాటు ముగింపు', heavyRain: 'భారీ వర్షం హెచ్చరిక', strongWind: 'బలమైన గాలి హెచ్చరిక', heatWave: 'వడగాలి హెచ్చరిక', thunderstorm: 'ఉరుముల హెచ్చరిక' },
  ta: { official: 'அதிகாரப்பூர்வ வானிலை எச்சரிக்கை', generated: 'வெதர்GPT ஆபத்து மதிப்பீடு', validUntil: 'செல்லுபடியாகும் வரை', heavyRain: 'கனமழை எச்சரிக்கை', strongWind: 'பலத்த காற்று எச்சரிக்கை', heatWave: 'வெப்ப அலை எச்சரிக்கை', thunderstorm: 'இடியுடன் கூடிய மழை எச்சரிக்கை' },
  ml: { official: 'ഔദ്യോഗിക കാലാവസ്ഥാ മുന്നറിയിപ്പ്', generated: 'WeatherGPT അപകട വിലയിരുത്തൽ', validUntil: 'സാധുത അവസാനിക്കുന്നത്', heavyRain: 'കനത്ത മഴ മുന്നറിയിപ്പ്', strongWind: 'ശക്തമായ കാറ്റ് മുന്നറിയിപ്പ്', heatWave: 'ഉഷ്ണതരംഗ മുന്നറിയിപ്പ്', thunderstorm: 'ഇടിമിന്നൽ മുന്നറിയിപ്പ്' },
  mr: { official: 'अधिकृत हवामान इशारा', generated: 'वेदरGPT जोखीम मूल्यांकन', validUntil: 'पर्यंत वैध', heavyRain: 'मुसळधार पावसाचा इशारा', strongWind: 'जोरदार वाऱ्याचा इशारा', heatWave: 'उष्णतेच्या लाटेचा इशारा', thunderstorm: 'मेघगर्जनेचा इशारा' },
  bn: { official: 'সরকারি আবহাওয়া সতর্কতা', generated: 'WeatherGPT ঝুঁকি মূল্যায়ন', validUntil: 'কার্যকর থাকবে', heavyRain: 'ভারী বৃষ্টির সতর্কতা', strongWind: 'প্রবল বাতাসের সতর্কতা', heatWave: 'তাপপ্রবাহের সতর্কতা', thunderstorm: 'বজ্রঝড়ের সতর্কতা' },
  gu: { official: 'સત્તાવાર હવામાન ચેતવણી', generated: 'WeatherGPT જોખમ મૂલ્યાંકન', validUntil: 'માન્ય સમય', heavyRain: 'ભારે વરસાદની ચેતવણી', strongWind: 'તીવ્ર પવનની ચેતવણી', heatWave: 'ગરમીની લહેરની ચેતવણી', thunderstorm: 'ગાજવીજની ચેતવણી' },
  pa: { official: 'ਅਧਿਕਾਰਤ ਮੌਸਮ ਚੇਤਾਵਨੀ', generated: 'WeatherGPT ਜੋਖਮ ਮੁਲਾਂਕਣ', validUntil: 'ਇਸ ਤੱਕ ਵੈਧ', heavyRain: 'ਭਾਰੀ ਮੀਂਹ ਦੀ ਚੇਤਾਵਨੀ', strongWind: 'ਤੇਜ਼ ਹਵਾ ਦੀ ਚੇਤਾਵਨੀ', heatWave: 'ਲੂ ਦੀ ਚੇਤਾਵਨੀ', thunderstorm: 'ਗਰਜ-ਤੂਫ਼ਾਨ ਦੀ ਚੇਤਾਵਨੀ' },
  or: { official: 'ସରକାରୀ ପାଣିପାଗ ସତର୍କତା', generated: 'WeatherGPT ବିପଦ ମୂଲ୍ୟାଙ୍କନ', validUntil: 'ପର୍ଯ୍ୟନ୍ତ ବୈଧ', heavyRain: 'ପ୍ରବଳ ବର୍ଷା ସତର୍କତା', strongWind: 'ପ୍ରବଳ ପବନ ସତର୍କତା', heatWave: 'ଗ୍ରୀଷ୍ମ ଲହରୀ ସତର୍କତା', thunderstorm: 'ବଜ୍ରପାତ ସତର୍କତା' },
  as: { official: 'চৰকাৰী বতৰ সতৰ্কতা', generated: 'WeatherGPT বিপদ মূল্যায়ন', validUntil: 'লৈকে বৈধ', heavyRain: 'ধাৰাসাৰ বৰষুণৰ সতৰ্কতা', strongWind: 'প্ৰবল বতাহৰ সতৰ্কতা', heatWave: 'তাপপ্ৰবাহৰ সতৰ্কতা', thunderstorm: 'ঢেৰেকনিৰ সতৰ্কতা' },
  ur: { official: 'سرکاری موسمی انتباہ', generated: 'WeatherGPT خطرے کا جائزہ', validUntil: 'تک مؤثر', heavyRain: 'موسلا دھار بارش کا انتباہ', strongWind: 'تیز ہوا کا انتباہ', heatWave: 'گرمی کی لہر کا انتباہ', thunderstorm: 'گرج چمک کا انتباہ' },
  kok: { official: 'अधिकृत हवामान इशारो', generated: 'WeatherGPT जोखीम मुल्यांकन', validUntil: 'मेरेन वैध', heavyRain: 'मुसळधार पावसाचो इशारो', strongWind: 'जोरदार वाऱ्याचो इशारो', heatWave: 'उष्णतेच्या लाटेचो इशारो', thunderstorm: 'मेघगर्जनेचो इशारो' },
};

export function weatherTerm(language, key) {
  return WEATHER_TERMS[language]?.[key] || WEATHER_TERMS.en[key] || key;
}

export function alertTerm(language, key) {
  return ALERT_TERMS[language]?.[key] || ALERT_TERMS.en[key] || key;
}

const CONDITION_KEYS = [
  ['clear sky', 'clear'], ['mainly clear', 'mainlyClear'], ['partly cloudy', 'partlyCloudy'],
  ['overcast', 'overcast'], ['fog', 'fog'], ['drizzle', 'drizzle'], ['heavy rain', 'heavyRain'],
  ['rain showers', 'showers'], ['showers', 'showers'], ['thunderstorm', 'thunderstorm'],
  ['snow', 'snow'], ['rain', 'rain'], ['strong wind', 'strongWind'], ['heat wave', 'heatWave'], ['cold wave', 'coldWave'],
];

export function translateWeatherCondition(language, condition = '') {
  const normalized = String(condition).toLowerCase();
  const match = CONDITION_KEYS.find(([text]) => normalized.includes(text));
  return match ? weatherTerm(language, match[1]) : condition;
}

export function translateAlertType(language, type = '') {
  const normalized = String(type).toLowerCase();
  const key = normalized.includes('heavy rain') ? 'heavyRain'
    : normalized.includes('strong wind') ? 'strongWind'
      : normalized.includes('heat') ? 'heatWave'
        : normalized.includes('thunder') || normalized.includes('lightning') ? 'thunderstorm' : null;
  return key ? alertTerm(language, key) : type;
}
