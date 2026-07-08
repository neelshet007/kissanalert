'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '../../../../store/useStore';
import { translations } from '../../../../utils/translations';
import { 
  ArrowLeft, Sprout, Search, MessageCircle, CheckCircle, 
  MapPin, Coins, Navigation, Leaf, Sparkles, Send, Upload, ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock Buyers Data
const MOCK_BUYERS = [
  { id: '1', name: 'ABC Agro Traders', crops: ['Cotton', 'Soybean', 'Wheat', 'Maize'], distance: 1.5, baseMultiplier: 1.05 },
  { id: '2', name: 'Maharashtra Farmers Market', crops: ['Paddy', 'Rice', 'Wheat', 'Onion', 'Tomato'], distance: 5.2, baseMultiplier: 1.02 },
  { id: '3', name: 'Green Harvest Pvt Ltd', crops: ['Sugarcane', 'Soybean', 'Cotton', 'Groundnut', 'Mango'], distance: 8.0, baseMultiplier: 1.08 },
  { id: '4', name: 'Local Mandi', crops: ['Bajra', 'Jowar', 'Millet', 'Pulses', 'Potato', 'Onion'], distance: 12.4, baseMultiplier: 0.95 },
  { id: '5', name: 'Food Processing Company', crops: ['Tomato', 'Potato', 'Banana', 'Mango', 'Sugarcane', 'Maize'], distance: 15.1, baseMultiplier: 1.10 }
];

// Mock Base Crop Prices per Quintal (in INR)
const CROP_BASE_PRICES: Record<string, number> = {
  Paddy: 2200,
  Rice: 3500,
  Wheat: 2275,
  Soybean: 4600,
  Cotton: 7200,
  Sugarcane: 315,
  Maize: 2090,
  Bajra: 2500,
  Jowar: 3200,
  Millet: 2350,
  Pulses: 6800,
  Groundnut: 6300,
  Onion: 1800,
  Tomato: 1500,
  Potato: 1200,
  Banana: 2500,
  Mango: 5500
};

// Multilingual Mock replies mapping for the AI Selling Assistant Chatbot
const MOCK_REPLIES: Record<string, Record<string, string>> = {
  en: {
    hello: "Hello! I am your AI Selling Assistant. Upload a crop image or select a prompt to begin.",
    sellToday: "Based on current mock market trends, prices are expected to remain stable. Selling within the next 2-3 days is recommended.",
    ready: "The crop quality looks optimal. If harvested, prepare to list it on the portal to attract buyers.",
    compare: "Maharashtra Farmers Market is offering ₹3,570, while ABC Agro Traders is at ₹3,620. ABC Agro Traders is closer and offers the best net value.",
    quality: "The uploaded grain quality appears good. Estimated Grade: A. Recommended selling window: Within 3 days. Price: ₹2,450–₹2,600.",
    price: "Current average price for this crop is ₹2,200 per quintal. Peak demand is expected next week.",
    send: "Send",
    placeholder: "Ask about market prices, grain quality...",
    suggestedTitle: "Suggested Prompts",
    p1: "Should I sell today?",
    p2: "Is my crop ready?",
    p3: "Compare nearby buyers",
    p4: "Estimate quality",
    p5: "Expected selling price",
    uploadBtn: "Upload Crop Photo",
    analyzing: "Analyzing quality...",
    futureSms: "Enable SMS Alerts (Future Feature)"
  },
  hi: {
    hello: "नमस्ते! मैं आपका एआई सेलिंग असिस्टेंट हूँ। शुरू करने के लिए फसल की फोटो अपलोड करें या नीचे से कोई प्रश्न चुनें।",
    sellToday: "वर्तमान बाजार रुझानों के आधार पर, कीमतें स्थिर रहने की उम्मीद है। अगले 2-3 दिनों में बेचना सबसे अच्छा रहेगा।",
    ready: "फसल की गुणवत्ता बहुत अच्छी लग रही है। कटाई के बाद खरीदारों को आकर्षित करने के लिए इसे पोर्टल पर सूचीबद्ध करें।",
    compare: "महाराष्ट्र फार्मर्स मार्केट ₹3,570 की पेशकश कर रहा है, जबकि एबीसी एग्रो ट्रेडर्स ₹3,620 पर है। एबीसी एग्रो ट्रेडर्स पास है और सर्वोत्तम मूल्य प्रदान करता है।",
    quality: "अपलोड किए गए अनाज की गुणवत्ता अच्छी लग रही है। अनुमानित ग्रेड: ए। अनुशंसित बिक्री समय: 3 दिनों के भीतर। कीमत: ₹2,450-₹2,600।",
    price: "इस फसल की वर्तमान औसत कीमत ₹2,200 प्रति क्विंटल है। अगले सप्ताह मांग बढ़ने की उम्मीद है।",
    send: "भेजें",
    placeholder: "बाजार कीमतों, अनाज की गुणवत्ता के बारे में पूछें...",
    suggestedTitle: "सुझाए गए प्रश्न",
    p1: "क्या मुझे आज बेचना चाहिए?",
    p2: "क्या मेरी फसल तैयार है?",
    p3: "आस-पास के खरीदारों की तुलना करें",
    p4: "गुणवत्ता का अनुमान लगाएं",
    p5: "अपेक्षित बिक्री मूल्य",
    uploadBtn: "फसल की फोटो अपलोड करें",
    analyzing: "गुणवत्ता का विश्लेषण किया जा रहा है...",
    futureSms: "एसएमएस अलर्ट सक्षम करें (भविष्य की सुविधा)"
  },
  mr: {
    hello: "नमस्कार! मी तुमचा एआई सेलिंग असिस्टंट आहे. सुरू करण्यासाठी पीकाचा फोटो अपलोड करा किंवा खालीलपैकी एक प्रश्न निवडा.",
    sellToday: "सध्याच्या बाजार भावानुसार, किंमती स्थिर राहण्याची शक्यता आहे. पुढील २-३ दिवसांत विक्री करण्याचा सल्ला दिला जातो.",
    ready: "पिकाची गुणवत्ता उत्तम दिसत आहे. काढणी झाल्यावर खरेदीदारांना आकर्षित करण्यासाठी पोर्टलवर नोंदणी करा.",
    compare: "महाराष्ट्र फार्मर्स मार्केट ₹३,५७० ऑफर करत आहे, तर एबीसी ॲग्रो ट्रेडर्स ₹३,६२० वर आहे. एबीसी ॲग्रो ट्रेडर्स जवळ आहे आणि सर्वोत्तम मूल्य देतो.",
    quality: "अपलोड केलेल्या धान्याची गुणवत्ता चांगली दिसत आहे. अंदाजित ग्रेड: ए. विक्रीचा शिफारस केलेला कालावधी: ३ दिवसांच्या आत. किंमत: ₹२,४५०–₹२,६००.",
    price: "या पिकाची सध्याची सरासरी किंमत ₹२,२०० प्रति क्विंटल आहे. पुढील आठवड्यात मागणी वाढण्याची शक्यता आहे.",
    send: "पाठवा",
    placeholder: "बाजार भाव, धान्याची गुणवत्ता याबद्दल विचारा...",
    suggestedTitle: "सुचवलेले प्रश्न",
    p1: "मी आज विकू का?",
    p2: "माझे पीक तयार आहे का?",
    p3: "जवळच्या खरेदीदारांची तुलना करा",
    p4: "गुणवत्तेचा अंदाज लावा",
    p5: "अपेक्षित विक्री किंमत",
    uploadBtn: "पिकाचा फोटो अपलोड करा",
    analyzing: "गुणवत्तेचे विश्लेषण होत आहे...",
    futureSms: "एसएमएस अलर्ट सुरू करा (भविष्य वैशिष्ट्य)"
  },
  gu: {
    hello: "નમસ્તે! હું તમારો એઆઈ સેલિંગ આસિસ્ટન્ટ છું. શરૂ કરવા માટે પાકનો ફોટો અપલોડ કરો અથવા નીચેથી પ્રશ્ન પસંદ કરો.",
    sellToday: "વર્તમાન બજારના પ્રવાહોને આધારે, કિંમતો સ્થિર રહેવાની ધારણા છે. આગામી ૨-૩ દિવસમાં વેચવાની ભલામણ કરવામાં આવે છે.",
    ready: "પાકની ગુણવત્તો ઉત્તમ દેખાય છે. લણણી પછી ખરીદદારોને આકર્ષવા માટે પોર્ટલ પર પાક ઉમેરો.",
    compare: "મહારાષ્ટ્ર ફાર્મર્સ માર્કેટ ₹૩,૫૭૦ ઓફર કરે છે, જ્યારે એબીસી એગ્રો ટ્રેડર્સ ₹૩,૬૨૦ પર છે. એબીસી એગ્રો ટ્રેડર્સ નજીક છે અને શ્રેષ્ઠ મૂલ્ય આપે છે.",
    quality: "અપલોડ કરેલ અનાજની ગુણવત્તો સારી દેખાય છે. અંદાજિત ગ્રેડ: એ. વેચાણ સમયગાળો: ૩ દિવસની અંદર. કિંમત: ₹૨,૪૫૦-₹૨,૬૦૦.",
    price: "આ પાકની વર્તમાન સરેરાશ કિંમત ₹૨,૨૦૦ પ્રતિ ક્વિન્ટલ છે. આગામી સપ્તાહે વધુ માંગની અપેક્ષા છે.",
    send: "મોકલો",
    placeholder: "બજાર ભાવો, અનાજની ગુણવત્તા વિશે પૂછો...",
    suggestedTitle: "સૂચવેલા પ્રશ્નો",
    p1: "શું મારે આજે વેચવું જોઈએ?",
    p2: "શું મારો પાક તૈયાર છે?",
    p3: "નજીકના ખરીદદારોની સરખામણી કરો",
    p4: "ગુણવત્તાનો અંદાજ મેળવો",
    p5: "અપેક્ષિત વેચાણ કિંમત",
    uploadBtn: "પાકનો ફોટો અપલોડ કરો",
    analyzing: "ગુણવત્તાનું વિશ્લેષણ થઈ રહ્યું છે...",
    futureSms: "એસએમએસ ચેતવણીઓ સક્ષમ કરો (ભવિષ્યની સુવિધા)"
  },
  te: {
    hello: "నమస్తే! నేను మీ ఏఐ సెల్లింగ్ అసిస్టెంట్‌ని. పంట చిత్రాన్ని అప్‌లోడ్ చేయండి లేదా కింద ఉన్న ప్రశ్నను ఎంచుకోండి.",
    sellToday: "ప్రస్తుత మార్కెట్ పోకడల ప్రకారం, ధరలు స్థిరంగా ఉండే అవకాశం ఉంది. రాబోయే 2-3 రోజుల్లో అమ్మడం మంచిది.",
    ready: "పంట నాణ్యత చాలా బాగుంది. కోత తర్వాత కొనుగోలుదారులను ఆకర్షించడానికి దీనిని పోర్టల్‌లో నమోదు చేయండి.",
    compare: "మహారాష్ట్ర ఫార్మర్స్ మార్కెట్ ₹3,570 ఇస్తుండగా, ఏబీసీ ఆగ్రో ట్రేడర్స్ ₹3,620 ఇస్తోంది. ఏబీసీ ఆగ్రో ట్రేడర్స్ దగ్గరగా ఉంది మరియు మంచి ధర ఇస్తుంది.",
    quality: "అప్‌లోడ్ చేసిన ధాన్యం నాణ్యత బాగుంది. అంచనా గ్రేడ్: ఏ. సిఫార్సు చేసిన విక్రయ సమయం: 3 రోజుల్లోగా. ధర: ₹2,450–₹2,600.",
    price: "ఈ పంట ప్రస్తుత సగటు ధర క్వింటాల్‌కు ₹2,200. వచ్చే వారం డిమాండ్ పెరిగే అవకాశం ఉంది.",
    send: "పంపించు",
    placeholder: "మార్కెట్ ధరలు, ధాన్యం నాణ్యత గురించి అడగండి...",
    suggestedTitle: "సూచించిన ప్రశ్నలు",
    p1: "నేను ఈరోజు అమ్మాలా?",
    p2: "నా పంట సిద్ధంగా ఉందా?",
    p3: "దగ్గరి కొనుగోలుదారులను పోల్చండి",
    p4: "నాణ్యతను అంచనా వేయండి",
    p5: "ఆశించిన విక్రయ ధర",
    uploadBtn: "పంట ఫోటోను అప్‌లోడ్ చేయండి",
    analyzing: "నాణ్యతను విశ్లేషిస్తోంది...",
    futureSms: "SMS అలర్ట్‌లను ప్రారంభించండి (భವಿష్యత్తు ఫీచర్)"
  },
  ta: {
    hello: "வணக்கம்! நான் உங்கள் ஏஐ விற்பனை உதவியாளர். தொடங்குவதற்கு பயிர் புகைப்படத்தை பதிவேற்றவும் அல்லது ஒரு கேள்வியை தேர்ந்தெடுக்கவும்.",
    sellToday: "தற்போதைய சந்தை நிலவரப்படி, விலைகள் நிலையாக இருக்கும் என எதிர்பார்க்கப்படுகிறது. அடுத்த 2-3 நாட்களுக்குள் விற்பது நல்லது.",
    ready: "பயிரின் தரம் சிறப்பாக உள்ளது. அறுவடைக்கு பின் வாங்குபவர்களை ஈர்க்க போர்ட்டலில் பதிவு செய்யவும்.",
    compare: "மகாராஷ்டிரா உழவர் சந்தை ₹3,570 வழங்குகிறது, ஏபிசி அக்ரோ டிரேடர்ஸ் ₹3,620 வழங்குகிறது. ஏபிசி அக்ரோ டிரேடர்ஸ் அருகில் உள்ளது மற்றும் சிறந்த மதிப்பை வழங்குகிறது.",
    quality: "பதிவேற்றப்பட்ட தானியத்தின் தரம் நன்றாக உள்ளது. மதிப்பிடப்பட்ட தரம்: ஏ. பரிந்துரைக்கப்படும் விற்பனை காலம்: 3 நாட்களுக்குள். விலை: ₹2,450-₹2,600.",
    price: "இந்த பயிரின் தற்போதைய சராசரி விலை குவிண்டாலுக்கு ₹2,200. அடுத்த வாரம் தேவை அதிகரிக்கும் என எதிர்பார்க்கப்படுகிறது.",
    send: "அனுப்பு",
    placeholder: "சந்தை விலை, தானிய தரம் பற்றி கேளுங்கள்...",
    suggestedTitle: "பரிந்துரைக்கப்படும் கேள்விகள்",
    p1: "நான் இன்று விற்க வேண்டுமா?",
    p2: "என் பயிர் தயாராக உள்ளதா?",
    p3: "அருகிலுள்ள வாங்குபவர்களை ஒப்பிடுக",
    p4: "தரத்தை மதிப்பிடுங்கள்",
    p5: "எதிர்பார்க்கும் விற்பனை விலை",
    uploadBtn: "பயிர் புகைப்படத்தை பதிவேற்று",
    analyzing: "தரத்தை ஆய்வு செய்கிறது...",
    futureSms: "SMS விழிப்பூட்டல்களை இயக்கு (எதிர்கால அம்சம்)"
  },
  kn: {
    hello: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಎಐ ಮಾರಾಟ ಸಹಾಯಕ. ಪ್ರಾರಂಭಿಸಲು ಬೆಳೆಯ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಅಥವಾ ಕೆಳಗಿನ ಪ್ರಶ್ನೆಯನ್ನು ಆರಿಸಿ.",
    sellToday: "ಪ್ರಸ್ತುತ ಮಾರುಕಟ್ಟೆ ಪ್ರವೃತ್ತಿಯ ಪ್ರಕಾರ, ಬೆಲೆಗಳು ಸ್ಥಿರವಾಗಿರುತ್ತವೆ. ಮುಂದಿನ 2-3 ದಿನಗಳಲ್ಲಿ ಮಾರಾಟ ಮಾಡಲು ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ.",
    ready: "ಬೆಳೆಯ ಗುಣಮಟ್ಟ ಉತ್ತಮವಾಗಿದೆ. ಕಟಾವಿನ ನಂತರ ಖರೀದಿದಾರರನ್ನು ಆಕರ್ಷಿಸಲು ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ನೋಂದಾಯಿಸಿ.",
    compare: "ಮಹಾರ್ಷಟ್ರ ಫಾರ್ಮರ್ಸ್ ಮಾರ್ಕೆಟ್ ₹3,570 ನೀಡುತ್ತಿದ್ದರೆ, ಎಬಿಸಿ ಆಗ್ರೋ ಟ್ರೇಡರ್ಸ್ ₹3,620 ನೀಡುತ್ತಿದೆ. ಎಬಿಸಿ ಆಗ್ರೋ ಹತ್ತಿರವಿದ್ದು ಉತ್ತಮ ಮೌಲ್ಯ ನೀಡುತ್ತದೆ.",
    quality: "ಅಪ್‌ಲೋಡ್ ಮಾಡಿದ ಧಾನ್ಯದ ಗುಣಮಟ್ಟ ಚೆನ್ನಾಗಿದೆ. ಅಂದಾಜು ಗ್ರೇಡ್: ಎ. ಶಿಫಾರಸು ಮಾಡಿದ ಮಾರಾಟದ ಸಮಯ: 3 ದಿನಗಳ ಒಳಗೆ. ಬೆಲೆ: ₹2,450-₹2,600.",
    price: "ಈ ಬೆಳೆಯ ಪ್ರಸ್ತುತ ಸರಾಸರಿ ಬೆಲೆ ಕ್ವಿಂಟಾಲ್‌ಗೆ ₹2,200. ಮುಂದಿನ ವಾರ ಬೇಡಿಕೆ ಹೆಚ್ಚಾಗುವ ನಿರೀಕ್ಷೆಯಿದೆ.",
    send: "ಕಳುಹಿಸು",
    placeholder: "ಮಾರುಕಟ್ಟೆ ಬೆಲೆ, ಧಾನ್ಯದ ಗುಣಮಟ್ಟದ ಬಗ್ಗೆ ಕೇಳಿ...",
    suggestedTitle: "ಸೂಚಿಸಲಾದ ಪ್ರಶ್ನೆಗಳು",
    p1: "ನಾನು ಇಂದು ಮಾರಾಟ ಮಾಡಬೇಕೇ?",
    p2: "ನನ್ನ ಬೆಳೆ ಸಿದ್ಧವಾಗಿದೆಯೇ?",
    p3: "ಹತ್ತಿರದ ಖರೀದಿದಾರರನ್ನು ಹೋಲಿಸಿ",
    p4: "ಗುಣಮಟ್ಟವನ್ನು ಅಂದಾಜು ಮಾಡಿ",
    p5: "ನಿರೀಕ್ಷಿತ ಮಾರಾಟ ಬೆಲೆ",
    uploadBtn: "ಬೆಳೆಯ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    analyzing: "ಗುಣಮಟ್ಟವನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...",
    futureSms: "SMS ಎಚ್ಚರಿಕೆಗಳನ್ನು ಸಕ್ರಿಯಗೊಳಿಸಿ (ಭವಿಷ್ಯದ ವೈಶಿಷ್ಟ್ಯ)"
  },
  ml: {
    hello: "നമസ്കാരം! ഞാൻ നിങ്ങളുടെ എഐ വിപണന സഹായിയാണ്. ആരംഭിക്കുന്നതിന് വിളയുടെ ചിത്രം അപ്‌ലോഡ് ചെയ്യുക അല്ലെങ്കിൽ താഴെയുള്ള ചോദ്യം തിരഞ്ഞെടുക്കുക.",
    sellToday: "നിലവിലെ വിപണി വിലകൾ അനുസരിച്ച്, വില സ്ഥിരതയുള്ളതായിരിക്കും. അടുത്ത 2-3 ദിവസത്തിനുള്ളിൽ വിൽക്കുന്നത് നല്ലതാണ്.",
    ready: "വിളയുടെ ഗുണനിലവാരം മികച്ചതാണ്. കൊയ്ത്തിന് ശേഷം വാങ്ങുന്നവരെ ആകർഷിക്കാൻ പോർട്ടലിൽ രജിസ്റ്റർ ചെയ്യുക.",
    compare: "മഹാരാഷ്ട്ര ഫാർമേഴ്സ് മാർക്കറ്റ് ₹3,570 വാഗ്ദാനം ചെയ്യുമ്പോൾ എബിസി അഗ്രോ ട്രേഡേഴ്സ് ₹3,620 വാഗ്ദാനം ചെയ്യുന്നു. എബിസി അഗ്രോ ആണ് കൂടുതൽ ലാഭകരം.",
    quality: "അപ്‌ലോഡ് ചെയ്ത ധാന്യത്തിന്റെ ഗുണനിലവാരം മികച്ചതാണ്. ഗ്രേഡ്: എ. വിൽക്കാൻ അനുയോജ്യമായ സമയം: 3 ദിവസത്തിനുള്ളിൽ. വില: ₹2,450-₹2,600.",
    price: "ഈ വിളയുടെ നിലവിലെ ശരാശരി വില ക്വിന്റലിന് ₹2,200 ആണ്. അടുത്ത ആഴ്ച ഡിമാൻഡ് കൂടാൻ സാധ്യതയുണ്ട്.",
    send: "അയക്കുക",
    placeholder: "വിപണി വില, ഗുണനിലവാരം എന്നിവയെക്കുറിച്ച് ചോദിക്കുക...",
    suggestedTitle: "നിർദ്ദേശിച്ച ചോദ്യങ്ങൾ",
    p1: "ഞാൻ ഇന്ന് വിൽക്കണമോ?",
    p2: "എന്റെ വിള തയ്യാറായോ?",
    p3: "അടുത്തുള്ള വാങ്ങുന്നവരെ താരതമ്യം ചെയ്യുക",
    p4: "ഗുണനിലവാരം വിലയിరుത്തുക",
    p5: "പ്രതീക്ഷിക്കുന്ന വിൽപ്പന വില",
    uploadBtn: "വിളയുടെ ചിത്രം അപ്‌ലോഡ് ചെയ്യുക",
    analyzing: "ഗുണനിലവാരം പരിശോധിക്കുന്നു...",
    futureSms: "എസ്എംഎസ് അലേർട്ടുകൾ പ്രവർത്തനക്ഷമമാക്കുക (ഭാവി സവിശേഷത)"
  },
  pa: {
    hello: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ ਏਆਈ ਸੇਲਿੰਗ ਅਸਿਸਟੈਂਟ ਹਾਂ। ਸ਼ੁਰੂ ਕਰਨ ਲਈ ਫਸਲ ਦੀ ਫੋਟੋ ਅਪਲੋਡ ਕਰੋ ਜਾਂ ਹੇਠਾਂ ਦਿੱਤੇ ਸਵਾਲ ਚੁਣੋ।",
    sellToday: "ਮੌਜੂਦਾ ਬਾਜ਼ਾਰ ਦੇ ਰੁਝਾਨਾਂ ਅਨੁਸਾਰ, ਕੀਮਤਾਂ ਸਥਿਰ ਰਹਿਣ ਦੀ ਉਮੀਦ ਹੈ। ਅਗਲੇ 2-3 ਦਿਨਾਂ ਵਿੱਚ ਵੇਚਣਾ ਬਿਹਤਰ ਰਹੇਗਾ।",
    ready: "ਫਸਲ ਦੀ ਗੁਣਵੱਤਾ ਵਧੀਆ ਲੱਗ ਰਹੀ ਹੈ। ਕਟਾਈ ਤੋਂ ਬਾਅਦ ਖਰੀਦਦਾਰਾਂ ਨੂੰ ਅਕਰਸ਼ਿਤ ਕਰਨ ਲਈ ਇਸਨੂੰ ਪੋਰਟਲ 'ਤੇ ਸੂਚੀਬੱਧ ਕਰੋ।",
    compare: "ਮਹਾਰਾਸ਼ਟਰ ਫਾਰਮਰਜ਼ ਮਾਰਕੀਟ ₹3,570 ਦੀ ਪੇਸ਼ਕਸ਼ ਕਰ ਰਹੀ ਹੈ, ਜਦਕਿ ਏਬੀਸੀ ਐਗਰੋ ਟ੍ਰੇਡਰਜ਼ ₹3,620 'ਤੇ ਹੈ। ਏਬੀਸੀ ਐਗਰੋ ਨੇੜੇ ਹੈ ਅਤੇ ਸਭ ਤੋਂ ਵਧੀਆ ਮੁੱਲ ਦਿੰਦਾ ਹੈ।",
    quality: "ਅਪਲੋਡ ਕੀਤੇ ਅਨਾਜ ਦੀ ਗੁਣਵੱਤਾ ਚੰਗੀ ਲੱਗ ਰਹੀ ਹੈ। ਅਨੁਮਾਨਿਤ ਗ੍ਰੇਡ: ਏ। ਵੇਚਣ ਦਾ ਸਮਾਂ: 3 ਦਿਨਾਂ ਦੇ ਅੰਦਰ। ਕੀਮਤ: ₹2,450-₹2,600।",
    price: "ਇਸ ਫਸਲ ਦੀ ਮੌਜੂਦਾ ਔਸਤ ਕੀਮਤ ₹2,200 ਪ੍ਰਤੀ ਕੁਇੰਟਲ ਹੈ। ਅਗਲੇ ਹਫ਼ਤੇ ਮੰਗ ਵਧਣ ਦੀ ਉਮੀਦ ਹੈ।",
    send: "ਭੇਜੋ",
    placeholder: "ਬਾਜ਼ਾਰ ਦੀਆਂ ਕੀਮਤਾਂ, ਅਨਾਜ ਦੀ ਗੁਣਵੱਤਾ ਬਾਰੇ ਪੁੱਛੋ...",
    suggestedTitle: "ਸੁਝਾਏ ਗਏ ਸਵਾਲ",
    p1: "ਕੀ ਮੈਨੂੰ ਅੱਜ ਵੇਚਣਾ ਚਾਹੀਦਾ ਹੈ?",
    p2: "ਕੀ ਮੇਰੀ ਫਸਲ ਤਿਆਰ ਹੈ?",
    p3: "ਨੇੜਲੇ ਖਰੀਦਦਾਰਾਂ ਦੀ ਤੁਲਨਾ ਕਰੋ",
    p4: "ਗੁਣਵੱਤਾ ਦਾ ਅੰਦਾਜ਼ਾ ਲਗਾਓ",
    p5: "ਉਮੀਦ ਕੀਤੀ ਵਿਕਰੀ ਕੀਮਤ",
    uploadBtn: "ਫਸਲ ਦੀ ਫੋਟੋ ਅਪਲੋਡ ਕਰੋ",
    analyzing: "ਗੁਣਵੱਤਾ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...",
    futureSms: "SMS ਅਲਰਟ ਚਾਲੂ ਕਰੋ (ਭਵਿੱਖ ਦੀ ਵਿਸ਼ੇਸ਼ਤਾ)"
  },
  bn: {
    hello: "নমস্কার! আমি আপনার এআই সেলিং অ্যাসিস্ট্যান্ট। শুরু করার জন্য ফসলের ছবি আপলোড করুন অথবা নিচের যেকোনো প্রশ্ন বেছে নিন।",
    sellToday: "বর্তমান বাজার দর অনুযায়ী, দাম স্থিতিশীল থাকার সম্ভাবনা রয়েছে। আগামী ২-৩ দিনের মধ্যে বিক্রি করার পরামর্শ দেওয়া হচ্ছে।",
    ready: "ফসলের মান খুব ভালো দেখাচ্ছে। ফসল কাটার পর ক্রেতাদের আকর্ষণ করতে এটি পোর্টালে নথিভুক্ত করুন।",
    compare: "মহারাষ্ট্র ফার্মার্স মার্কেট ₹৩,৫৭০ অফার করছে, যেখানে এবিসি অ্যাগ্রো ট্রেডার্স ₹৩,৬২০ দিচ্ছে। এবিসি অ্যাগ্রো কাছে হওয়ায় এটি সেরা মূল্য দেবে।",
    quality: "আপলোড করা শস্যের মান ভালো দেখাচ্ছে। আনুমানিক গ্রেড: এ। বিক্রির প্রস্তাবিত সময়: ৩ দিনের মধ্যে। মূল্য: ₹২,৪৫০-₹২,৬০০।",
    price: "এই ফসলের বর্তমান গড় মূল্য কুইন্টাল প্রতি ₹২,২০০। আগামী সপ্তাহে চাহিদা বাড়তে পারে।",
    send: "পাঠান",
    placeholder: "বাজারের দাম, শস্যের মান সম্পর্কে জিজ্ঞাসা করুন...",
    suggestedTitle: "প্রস্তাবিত প্রশ্নাবলী",
    p1: "আমার কি আজ বিক্রি করা উচিত?",
    p2: "আমার ফসল কি তৈরি?",
    p3: "নিকটস্থ ক্রেতাদের তুলনা করুন",
    p4: "মান নির্ধারণ করুন",
    p5: "প্রত্যাশিত বিক্রয় মূল্য",
    uploadBtn: "ফসলের ছবি আপলোড করুন",
    analyzing: "মান বিশ্লেষণ করা হচ্ছে...",
    futureSms: "এসএমএস অ্যালার্ট চালু করুন (ভবিষ্যতের ফিচার)"
  },
  or: {
    hello: "ନମସ୍କାର! ମୁଁ ଆପଣଙ୍କ ଏଆଇ ବିକ୍ରି ସହାୟକ। ଆରମ୍ଭ କରିବା ପାଇଁ ଫସଲର ଛବି ଅପଲୋଡ୍ କରନ୍ତು କିମ୍ବା ନିମ୍ନଲିଖିତ ପ୍ରଶ୍ନ ଚୟନ କରନ୍ତୁ।",
    sellToday: "ବର୍ତ୍ତମାନର ବଜାର ଦର ଅନୁସାରେ, ମୂଲ୍ୟ ସ୍ଥିର ରହିବା ଆଶା କରାଯାଉଛି। ଆଗାମୀ ୨-୩ ଦିନ ମଧ୍ୟରେ ବିକ୍ରି କରିବା ଭଲ ହେବ।",
    ready: "ଫସଲର ଗୁଣବତ୍ତା ବହୁତ ଭଲ ଦେଖାଯାଉଛି। ଅମଳ ପରେ କ୍ରେତାମାନଙ୍କୁ ଆକର୍ଷିତ କରିବା ପାଇଁ ଏହାକୁ ପୋର୍ଟାଲରେ ତାଲିକାଭୁକ୍ତ କରନ୍ତୁ।",
    compare: "ମହାରାଷ୍ଟ୍ର ଫାର୍ମର୍ସ ମାର୍କେଟ ₹୩,୫୭୦ ଦେଉଥିବା ବେଳେ ଏବିସି ଆଗ୍ରୋ ଟ୍ରେଡର୍ସ ₹୩,୬୨୦ ଦେଉଛି। ଏବିସି ଆଗ୍ରୋ ନିକଟତର ଏବଂ ସର୍ବୋତ୍ତମ ମୂଲ୍ୟ ଦେବ।",
    quality: "ଅପଲୋଡ୍ ହୋଇଥିବା ଶସ୍ୟର ଗୁଣବତ୍ତା ଭଲ ଦେଖାଯାଉଛି। ଆନୁମାନିକ ଗ୍ରେଡ୍: ଏ। ବିକ୍ରି ପାଇଁ ଅନୁମୋଦିତ ସମୟ: ୩ ଦିନ ମଧ୍ୟରେ। ମୂଲ୍ୟ: ₹୨,୪୫୦-₹୨,୬୦୦।",
    price: "ଏହି ଫସଲର ବର୍ତ୍ତମାନର ହାରାହାରି ମୂଲ୍ୟ କ୍ୱିଣ୍ଟାଲ ପିଛା ₹୨,୨୦୦। ଆସନ୍ତା ସପ୍ତାହରେ ଚାହିଦା ବଢିପାରେ।",
    send: "ପଠାନ୍ତୁ",
    placeholder: "ବଜାର ଦର, ଗୁଣବତ୍ତା ବିଷୟରେ ପଚାରନ୍ତୁ...",
    suggestedTitle: "ସୁପାରିଶ କରାଯାଇଥିବା ପ୍ରଶ୍ନ",
    p1: "ମୁଁ ଆଜି ବିକ୍ରି କରିବି କି?",
    p2: "ମୋ ଫସଲ ପ୍ରସ୍ତୁତ କି?",
    p3: "ନିକટସ୍ଥ କ୍ରେତାମାନଙ୍କୁ ତୁଳନା କରନ୍ତୁ",
    p4: "ଗୁଣବତ୍ତା ଆକଳନ କରନ୍ତୁ",
    p5: "ଆଶା କରାଯାଉଥିବା ବିକ୍ରି ମୂଲ୍ୟ",
    uploadBtn: "ଫସଲର ଛବି ଅପଲୋଡ୍ କରନ୍ତୁ",
    analyzing: "ଗୁଣବତ୍ତା ବିଶ୍ଳେଷଣ କରାଯାଉଛି...",
    futureSms: "ଏସଏମଏସ ଆଲର୍ଟ ସକ୍ଷମ କରନ୍ତୁ (ଭବିଷ୍ୟତର ସେବା)"
  }
};

export default function SellMyCropPage() {
  const router = useRouter();
  const { currentLanguage } = useStore();
  const t = translations[currentLanguage] || translations.en;
  const botText = MOCK_REPLIES[currentLanguage] || MOCK_REPLIES.en;

  // Form states
  const [cropName, setCropName] = useState('Cotton');
  const [quantity, setQuantity] = useState('10');
  const [unit, setUnit] = useState('Quintal');
  const [location, setLocation] = useState('Guntur, AP');
  const [expectedPrice, setExpectedPrice] = useState('');

  // Results & AI suggestions
  const [searched, setSearched] = useState(false);
  const [matchingBuyers, setMatchingBuyers] = useState<any[]>([]);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [suggestionType, setSuggestionType] = useState<'today' | 'wait' | 'nearby'>('today');

  // Interactive UI states
  const [contactedId, setContactedId] = useState<string | null>(null);
  const [interestedIds, setInterestedIds] = useState<string[]>([]);
  const [smsEnabled, setSmsEnabled] = useState(false);

  // Chatbot states
  const [chatMessages, setChatMessages] = useState<any[]>([
    { sender: 'bot', text: botText.hello, image: null }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Automatically update the greeting message when language changes
    setChatMessages(prev => {
      if (prev.length === 1 && prev[0].sender === 'bot') {
        return [{ sender: 'bot', text: botText.hello, image: null }];
      }
      return prev;
    });
  }, [currentLanguage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSearchBuyers = (e: React.FormEvent) => {
    e.preventDefault();

    // Filter buyers purchasing this crop
    const buyers = MOCK_BUYERS.filter(buyer => 
      buyer.crops.map(c => c.toLowerCase()).includes(cropName.toLowerCase())
    );

    // Calculate dynamic selling prices based on buyer's multiplier and selected crop base price
    const basePrice = CROP_BASE_PRICES[cropName] || 2000;
    const computedBuyers = buyers.map(buyer => {
      const buyingPrice = Math.round(basePrice * buyer.baseMultiplier);
      return {
        ...buyer,
        buyingPrice
      };
    });

    setMatchingBuyers(computedBuyers);
    setSearched(true);

    // AI Selling Recommendation Simulation based on Expected Price or Crop Type
    const expectedNum = expectedPrice ? parseFloat(expectedPrice) : 0;
    const maxBuyingPrice = computedBuyers.length > 0 
      ? Math.max(...computedBuyers.map(b => b.buyingPrice)) 
      : basePrice;

    if (expectedNum > maxBuyingPrice * 1.1) {
      setAiSuggestion('betterPriceNearby');
      setSuggestionType('nearby');
    } else if (Math.random() > 0.5) {
      setAiSuggestion('sellToday');
      setSuggestionType('today');
    } else {
      setAiSuggestion('wait23Days');
      setSuggestionType('wait');
    }
  };

  const toggleInterest = (id: string) => {
    if (interestedIds.includes(id)) {
      setInterestedIds(interestedIds.filter(item => item !== id));
    } else {
      setInterestedIds([...interestedIds, id]);
    }
  };

  // Chat message submit
  const submitChatMsg = (text: string, withImage: string | null = null) => {
    if (!text && !withImage) return;

    const userMsg = { sender: 'user', text, image: withImage };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setUploadedImage(null);
    setChatLoading(true);

    setTimeout(() => {
      let replyText = botText.sellToday;

      if (withImage) {
        replyText = botText.quality;
      } else {
        const query = text.toLowerCase();
        if (query.includes('ready') || query.includes('ready?') || query.includes('तैयार') || query.includes('तयार')) {
          replyText = botText.ready;
        } else if (query.includes('compare') || query.includes('buyer') || query.includes('तुलना') || query.includes('खरेदीदार')) {
          replyText = botText.compare;
        } else if (query.includes('price') || query.includes('expected') || query.includes('किंमत') || query.includes('मूल्य') || query.includes('दर')) {
          replyText = botText.price;
        }
      }

      setChatMessages(prev => [...prev, { sender: 'bot', text: replyText, image: null }]);
      setChatLoading(false);
    }, 1500);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-[#022c22] text-[#f5f5f4] pb-16 font-sans relative overflow-x-hidden">
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#064e3b]/50 backdrop-blur-xl border-b border-emerald-500/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push('/dashboard/farmer')}
            className="p-2 hover:bg-emerald-800/40 rounded-xl text-emerald-300 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-extrabold text-xl tracking-tight text-emerald-300">
              {t.sellMyCrop || "Sell My Crop"}
            </h1>
            <p className="text-[10px] uppercase font-bold tracking-widest text-emerald-400/70">
              {t.tagline}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-emerald-950/60 px-3 py-1.5 rounded-full border border-emerald-500/20 text-xs font-black text-emerald-300">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          Prototype Mode
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6 relative z-10">
        
        {/* Banner */}
        <div className="bg-[#064e3b]/40 border border-emerald-500/10 p-5 rounded-3xl backdrop-blur-xl flex flex-col md:flex-row items-center gap-4">
          <div className="bg-emerald-500/20 p-3.5 rounded-2xl border border-emerald-500/30 text-emerald-400">
            <Coins className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-emerald-300 text-sm">
              Demonstration Feature: Post-Harvest Sowing Cycle
            </h3>
            <p className="text-xs text-stone-300/80 leading-relaxed mt-1">
              "Sell My Crop" is a visionary concept demonstration mapping local buyers directly to harvested yields. No real payments, transactions, or order logs are handled here.
            </p>
          </div>
          <div className="shrink-0 w-full md:w-auto">
            {/* Interactive SMS Enabled Feature Toggle */}
            <div className="bg-[#022c22]/80 border border-emerald-500/20 p-3 rounded-2xl flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0" />
              <button 
                onClick={() => setSmsEnabled(!smsEnabled)}
                className={`text-[10px] uppercase tracking-wider font-extrabold transition-all ${
                  smsEnabled ? 'text-emerald-400 font-black' : 'text-stone-300 hover:text-emerald-300'
                }`}
              >
                {smsEnabled ? "✅ SMS Alerts Enabled" : "📱 Enable SMS Alerts"}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sowing/Sell crop input form */}
          <div className="md:col-span-1 bg-emerald-950/30 backdrop-blur-xl p-6 rounded-3xl border border-emerald-500/10 shadow-xl space-y-4 h-fit">
            <h3 className="font-extrabold text-base flex items-center gap-2 text-white">
              <Leaf className="w-4 h-4 text-emerald-400" />
              {t.sellCropHeader || "Sell Your Crop"}
            </h3>

            <form onSubmit={handleSearchBuyers} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-emerald-300">{t.cropName || "Crop Name"}</label>
                <select
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/15 outline-none text-xs text-white focus:ring-1 focus:ring-emerald-400"
                >
                  {Object.keys(CROP_BASE_PRICES).map(crop => (
                    <option key={crop} value={crop} className="bg-[#022c22]">
                      {t[crop] || crop}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-emerald-300">{t.quantity || "Quantity"}</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/15 outline-none text-xs text-white focus:ring-1 focus:ring-emerald-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-emerald-300">Unit</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/15 outline-none text-xs text-white focus:ring-1 focus:ring-emerald-400"
                  >
                    <option value="Quintal" className="bg-[#022c22]">{t.Quintal || "Quintal"}</option>
                    <option value="Kilogram" className="bg-[#022c22]">{t.Kilogram || "Kilogram"}</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-emerald-300">{t.location || "Location"}</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/15 outline-none text-xs text-white focus:ring-1 focus:ring-emerald-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-emerald-300">
                  {t.expectedPrice || "Expected Price (Optional)"}
                </label>
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  value={expectedPrice}
                  onChange={(e) => setExpectedPrice(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#022c22]/60 border border-emerald-500/15 outline-none text-xs text-white focus:ring-1 focus:ring-emerald-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-400 text-[#022c22] font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/25 hover:scale-[1.01]"
              >
                <Search className="w-4 h-4" />
                {t.findBuyers || "Find Buyers for My Crop"}
              </button>
            </form>
          </div>

          {/* Sowing/Sell results display */}
          <div className="md:col-span-2 space-y-4">
            <AnimatePresence mode="wait">
              {searched ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-4"
                >
                  {/* AI Recommendation Alert */}
                  <div className="bg-emerald-950/20 border border-emerald-500/15 p-5 rounded-3xl flex items-start gap-4">
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-400 p-2.5 rounded-2xl text-[#022c22] shrink-0 font-bold">
                      AI
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block">
                        {t.aiSellingSuggestion || "AI Selling Suggestion"}
                      </span>
                      <p className="text-sm font-bold text-white mt-1">
                        {aiSuggestion === 'sellToday' && (t.sellToday || "Sell Today - Prices are historically high this week.")}
                        {aiSuggestion === 'wait23Days' && (t.wait23Days || "Wait 2-3 Days - Market influx is expected to decrease, pushing prices up.")}
                        {aiSuggestion === 'betterPriceNearby' && (t.betterPriceNearby || "Better Price Available Nearby - Local Mandi or Food Processing Company are buying at high margins.")}
                      </p>
                      <p className="text-xs text-emerald-300/60 mt-1">
                        Estimated market average: ₹{(CROP_BASE_PRICES[cropName] || 2000)} / {t[unit] || unit}
                      </p>
                    </div>
                  </div>

                  {/* Buyers list */}
                  <div className="space-y-3">
                    <h3 className="font-extrabold text-sm text-stone-300/80 uppercase tracking-wider">
                      {t.nearbyBuyers || "Nearby Buyers"} ({matchingBuyers.length})
                    </h3>

                    {matchingBuyers.length > 0 ? (
                      <div className="grid grid-cols-1 gap-3">
                        {matchingBuyers.map(buyer => {
                          const isContacted = contactedId === buyer.id;
                          const isInterested = interestedIds.includes(buyer.id);

                          return (
                            <motion.div 
                              key={buyer.id}
                              className="bg-emerald-950/40 border border-emerald-500/10 p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:border-emerald-500/20 transition-all"
                            >
                              <div className="space-y-1">
                                <h4 className="font-black text-white text-base">{buyer.name}</h4>
                                <div className="flex flex-wrap items-center gap-3 text-xs text-stone-300/70">
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                                    {buyer.distance} km
                                  </span>
                                  <span className="flex items-center gap-1 font-bold text-emerald-300">
                                    <Coins className="w-3.5 h-3.5" />
                                    ₹{buyer.buyingPrice} / {t[unit] || unit}
                                  </span>
                                </div>
                              </div>

                              <div className="flex gap-2 shrink-0">
                                <button
                                  onClick={() => {
                                    setContactedId(buyer.id);
                                    setTimeout(() => setContactedId(null), 3000);
                                  }}
                                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                    isContacted 
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                                      : 'bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/15 text-emerald-300'
                                  }`}
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  {isContacted ? "Calling..." : (t.contact || "Contact")}
                                </button>
                                <button
                                  onClick={() => toggleInterest(buyer.id)}
                                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                                    isInterested 
                                      ? 'bg-emerald-500 text-[#022c22]' 
                                      : 'bg-gradient-to-r from-emerald-500/20 to-teal-400/20 hover:from-emerald-500/30 hover:to-teal-400/30 border border-emerald-500/20 text-emerald-300'
                                  }`}
                                >
                                  {isInterested && <CheckCircle className="w-3.5 h-3.5" />}
                                  {isInterested ? "Interested Registered" : (t.interested || "Interested")}
                                </button>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-10 bg-emerald-950/20 rounded-3xl border border-emerald-500/5">
                        <p className="text-xs text-stone-300/60 font-bold">
                          {t.noBuyersAvailable || "No buyers are currently available nearby for this crop."}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-emerald-950/20 border border-dashed border-emerald-500/15 rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-3 h-full min-h-[300px]"
                >
                  <Navigation className="w-8 h-8 text-emerald-400/60 animate-bounce" />
                  <h4 className="font-bold text-emerald-300/80 text-sm">Find nearby buyers instantly</h4>
                  <p className="text-xs text-stone-300/60 max-w-sm leading-relaxed">
                    Select your crop and quantity in the form, then click search to look up active buyers purchasing in your local district.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* AI Selling Assistant Chatbot Panel */}
        <div className="bg-emerald-950/30 backdrop-blur-xl p-6 rounded-3xl border border-emerald-500/10 shadow-xl space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-emerald-500/10">
            <h3 className="font-extrabold text-base flex items-center gap-2 text-white">
              <span className="bg-gradient-to-r from-emerald-500 to-teal-400 p-1.5 rounded-xl text-[#022c22]">
                🌾
              </span>
              {currentLanguage === 'mr' ? 'एआय विक्री सहाय्यक' : currentLanguage === 'hi' ? 'एआई बिक्री सहायक' : 'AI Selling Assistant'}
            </h3>
            <span className="text-[9px] uppercase font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full">
              Gemini sandbox agent
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Suggested prompts list */}
            <div className="md:col-span-1 space-y-3">
              <span className="text-[10px] uppercase font-black text-emerald-400 tracking-wider block">
                {botText.suggestedTitle}
              </span>
              <div className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
                {[botText.p1, botText.p2, botText.p3, botText.p4, botText.p5].map((promptText, idx) => (
                  <button
                    key={idx}
                    onClick={() => submitChatMsg(promptText)}
                    className="whitespace-nowrap md:whitespace-normal text-left text-xs bg-emerald-950/65 hover:bg-emerald-900 border border-emerald-500/15 p-2.5 rounded-xl font-semibold text-emerald-200 transition-all shrink-0 hover:scale-[1.01]"
                  >
                    • {promptText}
                  </button>
                ))}
              </div>
            </div>

            {/* Chatbox messages display */}
            <div className="md:col-span-3 flex flex-col h-[350px] bg-[#022c22]/40 rounded-2xl border border-emerald-500/10 overflow-hidden relative">
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col max-w-[80%] ${msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                  >
                    <div
                      className={`p-3 rounded-2xl text-xs font-semibold leading-relaxed shadow-sm ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-[#022c22] rounded-tr-none'
                          : 'bg-emerald-950/80 border border-emerald-500/10 text-emerald-100 rounded-tl-none'
                      }`}
                    >
                      {msg.image && (
                        <img 
                          src={msg.image} 
                          alt="Uploaded crop" 
                          className="w-32 h-24 object-cover rounded-xl mb-2 border border-emerald-500/20"
                        />
                      )}
                      <p>{msg.text}</p>
                    </div>
                  </div>
                ))}

                {chatLoading && (
                  <div className="flex justify-start max-w-[80%] mr-auto">
                    <div className="bg-emerald-950/80 border border-emerald-500/10 p-3 rounded-2xl rounded-tl-none text-xs text-emerald-300 font-bold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce delay-75" />
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce delay-150" />
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce delay-300" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Upload image preview */}
              {uploadedImage && (
                <div className="px-4 py-2 bg-emerald-950/90 border-t border-emerald-500/10 flex items-center gap-3 justify-between">
                  <div className="flex items-center gap-2">
                    <img src={uploadedImage} alt="Preview" className="w-12 h-10 object-cover rounded-lg border border-emerald-400/40" />
                    <span className="text-[10px] text-emerald-300 font-semibold">{botText.analyzing}</span>
                  </div>
                  <button 
                    onClick={() => setUploadedImage(null)} 
                    className="text-rose-400 hover:text-rose-300 font-bold text-xs"
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* Chat footer input bar */}
              <div className="p-3 bg-emerald-950/40 border-t border-emerald-500/10 flex gap-2">
                <input
                  type="text"
                  placeholder={botText.placeholder}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') submitChatMsg(chatInput, uploadedImage);
                  }}
                  className="flex-1 p-2.5 rounded-xl bg-emerald-950/65 border border-emerald-500/15 outline-none text-xs text-white placeholder-emerald-400/30"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="chat-crop-upload"
                />
                <label
                  htmlFor="chat-crop-upload"
                  className="p-2.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/15 text-emerald-300 rounded-xl cursor-pointer flex items-center justify-center transition-all hover:scale-[1.01]"
                >
                  <Upload className="w-4 h-4" />
                </label>
                <button
                  onClick={() => submitChatMsg(chatInput, uploadedImage)}
                  className="p-2.5 bg-emerald-500 hover:bg-emerald-600 text-[#022c22] rounded-xl flex items-center justify-center transition-all hover:scale-[1.01]"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
