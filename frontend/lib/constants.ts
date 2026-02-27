export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const LANGUAGES = {
  en: { label: 'English', flag: '🇬🇧' },
  hi: { label: 'हिंदी', flag: '🇮🇳' },
} as const

export const PLATFORM_LOGOS: Record<string, string> = {
  'Amazon Karigar': '🛒',
  'IndiaMART': '🏭',
  'ONDC-Mystore': '🇮🇳',
  'Flipkart': '📦',
  'Myntra': '👗',
  'Meesho': '📱',
  'Craftsvilla': '🎨',
  'GoCoop': '🤝',
  'Limeroad': '✨',
  'Udaan': '🚀',
  'TradeIndia': '🌐',
  'ExportersIndia': '🌍',
  'Jiomart': '🛍️',
  'Snapdeal': '💫',
  'Nykaa': '💄',
}

export const BAND_COLORS = {
  GREEN: { bg: 'bg-green-100', text: 'text-green-800', bar: 'bg-green-500', border: 'border-green-500' },
  YELLOW: { bg: 'bg-yellow-100', text: 'text-yellow-800', bar: 'bg-yellow-500', border: 'border-yellow-500' },
  RED: { bg: 'bg-red-100', text: 'text-red-800', bar: 'bg-red-500', border: 'border-red-500' },
}

export const FACTOR_LABELS: Record<string, { en: string; hi: string }> = {
  domain: { en: 'Domain Match', hi: 'डोमेन मैच' },
  geography: { en: 'Geography', hi: 'भूगोल' },
  capacity: { en: 'Capacity', hi: 'क्षमता' },
  history: { en: 'History', hi: 'इतिहास' },
  specialization: { en: 'Specialization', hi: 'विशेषज्ञता' },
}

export const UI_TEXT = {
  en: {
    appName: 'VyaparSetu AI',
    tagline: 'Commerce Intelligence for Indian MSMEs',
    startChat: 'Start Onboarding',
    viewDashboard: 'Admin Dashboard',
    chatPlaceholder: 'Describe your products...',
    recording: 'Recording...',
    tapToSpeak: 'Tap to speak',
    thinking: 'VyaparSetu is thinking...',
    classifying: 'Classifying your products...',
    matching: 'Finding best platforms...',
    analyzing: 'Analyzing pricing...',
    step1: 'Welcome',
    step2: 'Describe Products',
    step3: 'AI Classification',
    step4: 'Platform Matching',
    step5: 'Complete!',
    heroTitle: 'Commerce Intelligence for Bharat',
    heroSubtitle: 'The AI copilot that gives 6.3 crore small businesses the same commerce intelligence that Amazon has internally — in their own language',
    featureCatalog: 'CatalogAI',
    featureMatch: 'MatchMaker',
    featurePrice: 'PriceWise',
    featureCatalogDesc: 'Voice-first product cataloging in Hindi/English. From raw description to marketplace-ready listing in seconds, not hours.',
    featureMatchDesc: 'AI-powered marketplace matching with explainable scores. No more guesswork — data-driven platform selection.',
    featurePriceDesc: 'Pricing intelligence & demand forecasting that was previously enterprise-only. Know your market before you price.',
  },
  hi: {
    appName: 'व्यापारसेतु AI',
    tagline: 'भारतीय MSMEs के लिए कॉमर्स इंटेलिजेंस',
    startChat: 'ऑनबोर्डिंग शुरू करें',
    viewDashboard: 'एडमिन डैशबोर्ड',
    chatPlaceholder: 'अपने उत्पादों का वर्णन करें...',
    recording: 'रिकॉर्डिंग...',
    tapToSpeak: 'बोलने के लिए टैप करें',
    thinking: 'व्यापारसेतु सोच रहा है...',
    classifying: 'आपके उत्पादों को वर्गीकृत कर रहा है...',
    matching: 'सबसे अच्छे प्लेटफॉर्म ढूंढ रहा है...',
    analyzing: 'मूल्य विश्लेषण कर रहा है...',
    step1: 'स्वागत',
    step2: 'उत्पाद का वर्णन करें',
    step3: 'AI वर्गीकरण',
    step4: 'प्लेटफॉर्म मैचिंग',
    step5: 'पूर्ण!',
    heroTitle: 'भारत के लिए कॉमर्स इंटेलिजेंस',
    heroSubtitle: 'AI कोपायलट जो 6.3 करोड़ छोटे व्यापारियों को वही कॉमर्स इंटेलिजेंस देता है जो Amazon के पास है — उनकी अपनी भाषा में',
    featureCatalog: 'कैटलॉग AI',
    featureMatch: 'मैचमेकर',
    featurePrice: 'प्राइसवाइज़',
    featureCatalogDesc: 'हिंदी/अंग्रेजी में वॉइस-फर्स्ट प्रोडक्ट कैटलॉगिंग। कच्चे विवरण से मार्केटप्लेस-रेडी लिस्टिंग सेकंडों में।',
    featureMatchDesc: 'AI-संचालित मार्केटप्लेस मैचिंग। अंदाज़े से नहीं — डेटा-ड्रिवन प्लेटफॉर्म चयन।',
    featurePriceDesc: 'मूल्य निर्धारण इंटेलिजेंस और मांग पूर्वानुमान जो पहले सिर्फ बड़ी कंपनियों के पास था।',
  },
}
