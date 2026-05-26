import { useState, useRef, useEffect, useCallback } from "react";

interface SearchEngine {
  name: string;
  domain: string;
  color: string;
  searchUrl: string;
  homeUrl: string;
}

const BG_FOLDERS = [
  {
    id: "nature", name: "Nature", emoji: "🌿",
    photos: [
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e",
      "https://images.unsplash.com/photo-1447752875215-b2761acf3dbd",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e",
      "https://images.unsplash.com/photo-1426604966848-d7adac402bff",
      "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1",
    ],
  },
  {
    id: "city", name: "City", emoji: "🌆",
    photos: [
      "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df",
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000",
      "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b",
      "https://images.unsplash.com/photo-1486325212027-8081e485255e",
      "https://images.unsplash.com/photo-1514214246283-d427a95c5d2f",
      "https://images.unsplash.com/photo-1444723121867-7a241cacace9",
    ],
  },
  {
    id: "abstract", name: "Abstract", emoji: "✨",
    photos: [
      "https://images.unsplash.com/photo-1557682250-33bd709cbe85",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64",
      "https://images.unsplash.com/photo-1550684376-efcbd6e3f031",
      "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
      "https://images.unsplash.com/photo-1553356084-58ef4a67b2a7",
    ],
  },
  {
    id: "space", name: "Space", emoji: "🚀",
    photos: [
      "https://images.unsplash.com/photo-1462331940025-496dfbfc7564",
      "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a",
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa",
      "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3",
      "https://images.unsplash.com/photo-1484589065579-248aad0d8b13",
      "https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45",
    ],
  },
  {
    id: "ocean", name: "Ocean", emoji: "🌊",
    photos: [
      "https://images.unsplash.com/photo-1505118380757-91f5f5632de0",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
      "https://images.unsplash.com/photo-1455763916899-e8b50eca9967",
      "https://images.unsplash.com/photo-1439405326-bdf8d03cf2ae",
      "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9",
      "https://images.unsplash.com/photo-1504208434309-cb69f4fe52b0",
    ],
  },
];

function playPomodoroAlarm(tune: string, volume: number) {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const master = ctx.createGain();
    master.gain.value = volume / 100;
    master.connect(ctx.destination);
    const configs: { freq: number; type: OscillatorType; delay: number; duration: number }[] =
      tune === "Digital"
        ? [{ freq: 880, type: "square", delay: 0, duration: 0.12 }, { freq: 880, type: "square", delay: 0.18, duration: 0.12 }, { freq: 880, type: "square", delay: 0.36, duration: 0.12 }]
        : tune === "Bell"
        ? [{ freq: 523, type: "sine", delay: 0, duration: 1 }, { freq: 659, type: "sine", delay: 0.35, duration: 0.9 }, { freq: 784, type: "sine", delay: 0.7, duration: 0.8 }]
        : tune === "Chime"
        ? [{ freq: 784, type: "sine", delay: 0, duration: 0.7 }, { freq: 988, type: "sine", delay: 0.2, duration: 0.7 }, { freq: 1175, type: "sine", delay: 0.4, duration: 0.7 }, { freq: 1319, type: "sine", delay: 0.6, duration: 0.7 }]
        : [{ freq: 392, type: "sine", delay: 0, duration: 0.5 }, { freq: 523, type: "sine", delay: 0.3, duration: 0.5 }, { freq: 659, type: "sine", delay: 0.6, duration: 0.6 }];
    configs.forEach(({ freq, type, delay, duration }) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0, ctx.currentTime + delay);
      g.gain.linearRampToValueAtTime(0.9, ctx.currentTime + delay + 0.015);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
      osc.connect(g);
      g.connect(master);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + duration + 0.05);
    });
  } catch { /* ignore */ }
}

const engines: SearchEngine[] = [
  { name: "Google", domain: "google.com", color: "#4285F4", searchUrl: "https://www.google.com/search?q=", homeUrl: "https://www.google.com" },
  { name: "YouTube", domain: "youtube.com", color: "#FF0000", searchUrl: "https://www.youtube.com/results?search_query=", homeUrl: "https://www.youtube.com" },
  { name: "Facebook", domain: "facebook.com", color: "#1877F2", searchUrl: "https://www.facebook.com/search/top?q=", homeUrl: "https://www.facebook.com" },
  { name: "Twitter / X", domain: "x.com", color: "#000000", searchUrl: "https://twitter.com/search?q=", homeUrl: "https://twitter.com" },
  { name: "Wikipedia", domain: "wikipedia.org", color: "#636466", searchUrl: "https://en.wikipedia.org/w/index.php?search=", homeUrl: "https://www.wikipedia.org" },
  { name: "Bing", domain: "bing.com", color: "#008272", searchUrl: "https://www.bing.com/search?q=", homeUrl: "https://www.bing.com" },
  { name: "Instagram", domain: "instagram.com", color: "#E1306C", searchUrl: "https://www.instagram.com/explore/tags/", homeUrl: "https://www.instagram.com" },
  { name: "Amazon", domain: "amazon.com", color: "#FF9900", searchUrl: "https://www.amazon.com/s?k=", homeUrl: "https://www.amazon.com" },
];

const initialShortcuts = [
  { name: "YouTube", url: "https://www.youtube.com", domain: "youtube.com" },
  { name: "Facebook", url: "https://www.facebook.com", domain: "facebook.com" },
  { name: "Twitter", url: "https://twitter.com", domain: "x.com" },
  { name: "Instagram", url: "https://www.instagram.com", domain: "instagram.com" },
  { name: "Gmail", url: "https://mail.google.com", domain: "gmail.com" },
  { name: "Wikipedia", url: "https://www.wikipedia.org", domain: "wikipedia.org" },
  { name: "WhatsApp", url: "https://web.whatsapp.com", domain: "whatsapp.com" },
  { name: "TikTok", url: "https://www.tiktok.com", domain: "tiktok.com" },
];

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "bn", label: "বাংলা" },
  { code: "hi", label: "हिन्दी" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "ar", label: "العربية" },
  { code: "zh", label: "中文" },
  { code: "ja", label: "日本語" },
  { code: "pt", label: "Português" },
  { code: "ru", label: "Русский" },
  { code: "ko", label: "한국어" },
];

const TIMEZONES = [
  "Automatic", "UTC",
  "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "Europe/London", "Europe/Paris", "Europe/Berlin",
  "Asia/Dhaka", "Asia/Kolkata", "Asia/Dubai", "Asia/Bangkok", "Asia/Singapore", "Asia/Tokyo", "Asia/Shanghai",
  "Australia/Sydney", "Pacific/Auckland",
];

const T: Record<string, Record<string, string>> = {
  en: { background: "Background", backgroundType: "Background type", bgImages: "Images", bgColorType: "Color", bgGradient: "Gradient", bgNone: "None", font: "Font", fontFamily: "Font family", fontWeight: "Weight", fontSize: "Size", weightLight: "Light", weightNormal: "Normal", weightSemiBold: "Semi Bold", weightBold: "Bold", quickLinks: "Quick Links", addLink: "Add link", importBookmarks: "Import bookmarks", importBtn: "Import", showGroups: "Show groups", openInNewTab: "Open in new tab", iconCornerRadius: "Icon corner radius", linksPerRow: "Links per row", linkStyle: "Style", small: "Small", medium: "Medium", large: "Large", titlePlaceholder: "Title", searchPlaceholder: "Search with", quickAccess: "Quick Access", customize: "Customize", gmail: "Gmail", images: "Images", footer: "SearchHub — Search anywhere, all in one place", showAllSettings: "Show all settings", language: "Language", darkMode: "Dark mode", tabAppearance: "Tab appearance", hideSettingsIcon: "Hide settings icon", general: "General", system: "System", light: "Light", dark: "Dark", timeAndDate: "Time & Date", enable: "Enable", showSeconds: "Show seconds", twelveHourTime: "12-Hour Time", showAmPm: "Show AM/PM", amPmPosition: "AM/PM position", topLeft: "Top left", topRight: "Top right", bottomLeft: "Bottom left", bottomRight: "Bottom right", analogClock: "Analog clock", clockShape: "Clock shape", clockFace: "Clock face", clockHands: "Clock hands", clockBackground: "Clock background", clockBorder: "Clock border", dateFormat: "Date format", clockSize: "Clock size", dateSize: "Date size", worldClocks: "World clocks", timeZone: "Time zone", show: "Show", clockAndDate: "Clock and date", clockOnly: "Clock only", dateOnly: "Date only", automatic: "Automatic", dayMonthDate: "Day, month date", monthDayYear: "Month day, year", ddmmyyyy: "DD/MM/YYYY" },
  bn: { background: "ব্যাকগ্রাউন্ড", backgroundType: "ব্যাকগ্রাউন্ড ধরন", bgImages: "ছবি", bgColorType: "রঙ", bgGradient: "গ্রেডিয়েন্ট", bgNone: "কিছু না", font: "ফন্ট", fontFamily: "ফন্ট পরিবার", fontWeight: "ওজন", fontSize: "আকার", weightLight: "হালকা", weightNormal: "স্বাভাবিক", weightSemiBold: "আধা গাঢ়", weightBold: "গাঢ়", quickLinks: "দ্রুত লিংক", addLink: "লিংক যোগ করুন", importBookmarks: "বুকমার্ক আনুন", importBtn: "আনুন", showGroups: "গ্রুপ দেখান", openInNewTab: "নতুন ট্যাবে খুলুন", iconCornerRadius: "আইকন কর্নার রেডিয়াস", linksPerRow: "প্রতি সারিতে লিংক", linkStyle: "স্টাইল", small: "ছোট", medium: "মাঝারি", large: "বড়", titlePlaceholder: "শিরোনাম", searchPlaceholder: "অনুসন্ধান করুন", quickAccess: "দ্রুত অ্যাক্সেস", customize: "কাস্টমাইজ", gmail: "জিমেইল", images: "ছবি", footer: "SearchHub — এক জায়গায় সব জায়গা খুঁজুন", showAllSettings: "সব সেটিংস দেখান", language: "ভাষা", darkMode: "ডার্ক মোড", tabAppearance: "ট্যাব চেহারা", hideSettingsIcon: "সেটিংস আইকন লুকান", general: "সাধারণ", system: "সিস্টেম", light: "আলো", dark: "অন্ধকার", timeAndDate: "সময় ও তারিখ", enable: "সক্ষম করুন", showSeconds: "সেকেন্ড দেখান", twelveHourTime: "১২-ঘণ্টা সময়", showAmPm: "AM/PM দেখান", amPmPosition: "AM/PM অবস্থান", topLeft: "উপরে বামে", topRight: "উপরে ডানে", bottomLeft: "নিচে বামে", bottomRight: "নিচে ডানে", analogClock: "অ্যানালগ ক্লক", clockShape: "ঘড়ির আকার", clockFace: "ঘড়ির মুখ", clockHands: "ঘড়ির কাঁটা", clockBackground: "ঘড়ির পটভূমি", clockBorder: "ঘড়ির বর্ডার", dateFormat: "তারিখের ফরম্যাট", clockSize: "ঘড়ির সাইজ", dateSize: "তারিখের সাইজ", worldClocks: "বিশ্ব ঘড়ি", timeZone: "সময় অঞ্চল", show: "দেখান", clockAndDate: "ঘড়ি ও তারিখ", clockOnly: "শুধু ঘড়ি", dateOnly: "শুধু তারিখ", automatic: "স্বয়ংক্রিয়", dayMonthDate: "দিন, মাস তারিখ", monthDayYear: "মাস দিন, বছর", ddmmyyyy: "দদ/মম/বববব" },
  hi: { background: "पृष्ठभूमि", backgroundType: "पृष्ठभूमि प्रकार", bgImages: "चित्र", bgColorType: "रंग", bgGradient: "ग्रेडिएंट", bgNone: "कुछ नहीं", font: "फ़ॉन्ट", fontFamily: "फ़ॉन्ट परिवार", fontWeight: "भार", fontSize: "आकार", weightLight: "हल्का", weightNormal: "सामान्य", weightSemiBold: "अर्ध-मोटा", weightBold: "मोटा", quickLinks: "त्वरित लिंक", addLink: "लिंक जोड़ें", importBookmarks: "बुकमार्क आयात करें", importBtn: "आयात", showGroups: "समूह दिखाएं", openInNewTab: "नए टैब में खोलें", iconCornerRadius: "आइकन कोना त्रिज्या", linksPerRow: "पंक्ति प्रति लिंक", linkStyle: "शैली", small: "छोटा", medium: "मध्यम", large: "बड़ा", titlePlaceholder: "शीर्षक", searchPlaceholder: "खोजें", quickAccess: "त्वरित पहुँच", customize: "कस्टमाइज़", gmail: "जीमेल", images: "चित्र", footer: "SearchHub — एक जगह से हर जगह खोजें", showAllSettings: "सभी सेटिंग दिखाएं", language: "भाषा", darkMode: "डार्क मोड", tabAppearance: "टैब का स्वरूप", hideSettingsIcon: "सेटिंग्स आइकन छुपाएं", general: "सामान्य", system: "सिस्टम", light: "हल्का", dark: "गहरा", timeAndDate: "समय और तारीख", enable: "सक्षम", showSeconds: "सेकंड दिखाएं", twelveHourTime: "12-घंटे का समय", showAmPm: "AM/PM दिखाएं", amPmPosition: "AM/PM स्थिति", topLeft: "ऊपर बाएं", topRight: "ऊपर दाएं", bottomLeft: "नीचे बाएं", bottomRight: "नीचे दाएं", analogClock: "एनालॉग घड़ी", clockShape: "घड़ी का आकार", clockFace: "घड़ी का चेहरा", clockHands: "घड़ी की सूइयां", clockBackground: "घड़ी की पृष्ठभूमि", clockBorder: "घड़ी की सीमा", dateFormat: "तारीख प्रारूप", clockSize: "घड़ी का आकार", dateSize: "तारीख का आकार", worldClocks: "विश्व घड़ियाँ", timeZone: "समय क्षेत्र", show: "दिखाएं", clockAndDate: "घड़ी और तारीख", clockOnly: "केवल घड़ी", dateOnly: "केवल तारीख", automatic: "स्वचालित", dayMonthDate: "दिन, महीना तारीख", monthDayYear: "महीना दिन, साल", ddmmyyyy: "दद/मम/वववव" },
  es: { background: "Fondo", backgroundType: "Tipo de fondo", bgImages: "Imágenes", bgColorType: "Color", bgGradient: "Degradado", bgNone: "Ninguno", font: "Fuente", fontFamily: "Familia de fuente", fontWeight: "Grosor", fontSize: "Tamaño", weightLight: "Delgada", weightNormal: "Normal", weightSemiBold: "Semi negrita", weightBold: "Negrita", quickLinks: "Accesos rápidos", addLink: "Agregar enlace", importBookmarks: "Importar marcadores", importBtn: "Importar", showGroups: "Mostrar grupos", openInNewTab: "Abrir en nueva pestaña", iconCornerRadius: "Radio del icono", linksPerRow: "Enlace por fila", linkStyle: "Estilo", small: "Pequeño", medium: "Mediano", large: "Grande", titlePlaceholder: "Título", searchPlaceholder: "Buscar con", quickAccess: "Acceso rápido", customize: "Personalizar", gmail: "Gmail", images: "Imágenes", footer: "SearchHub — Busca en cualquier lugar, todo en uno", showAllSettings: "Mostrar todos los ajustes", language: "Idioma", darkMode: "Modo oscuro", tabAppearance: "Apariencia de pestaña", hideSettingsIcon: "Ocultar icono de configuración", general: "General", system: "Sistema", light: "Claro", dark: "Oscuro", timeAndDate: "Hora y Fecha", enable: "Activar", showSeconds: "Mostrar segundos", twelveHourTime: "Hora de 12", showAmPm: "Mostrar AM/PM", amPmPosition: "Posición AM/PM", topLeft: "Arriba izquierda", topRight: "Arriba derecha", bottomLeft: "Abajo izquierda", bottomRight: "Abajo derecha", analogClock: "Reloj analógico", clockShape: "Forma del reloj", clockFace: "Cara del reloj", clockHands: "Manecillas", clockBackground: "Fondo del reloj", clockBorder: "Borde del reloj", dateFormat: "Formato de fecha", clockSize: "Tamaño del reloj", dateSize: "Tamaño de la fecha", worldClocks: "Relojes del mundo", timeZone: "Zona horaria", show: "Mostrar", clockAndDate: "Reloj y fecha", clockOnly: "Solo reloj", dateOnly: "Solo fecha", automatic: "Automático", dayMonthDate: "Día, mes fecha", monthDayYear: "Mes día, año", ddmmyyyy: "DD/MM/AAAA" },
  fr: { background: "Arrière-plan", backgroundType: "Type d'arrière-plan", bgImages: "Images", bgColorType: "Couleur", bgGradient: "Dégradé", bgNone: "Aucun", font: "Police", fontFamily: "Famille de police", fontWeight: "Graisse", fontSize: "Taille", weightLight: "Légère", weightNormal: "Normale", weightSemiBold: "Semi-gras", weightBold: "Gras", quickLinks: "Liens rapides", addLink: "Ajouter un lien", importBookmarks: "Importer les favoris", importBtn: "Importer", showGroups: "Afficher les groupes", openInNewTab: "Ouvrir dans un nouvel onglet", iconCornerRadius: "Rayon d'icône", linksPerRow: "Liens par ligne", linkStyle: "Style", small: "Petit", medium: "Moyen", large: "Grand", titlePlaceholder: "Titre", searchPlaceholder: "Rechercher avec", quickAccess: "Accès rapide", customize: "Personnaliser", gmail: "Gmail", images: "Images", footer: "SearchHub — Recherchez partout, tout en un", showAllSettings: "Afficher tous les paramètres", language: "Langue", darkMode: "Mode sombre", tabAppearance: "Apparence de l'onglet", hideSettingsIcon: "Masquer l'icône", general: "Général", system: "Système", light: "Clair", dark: "Sombre", timeAndDate: "Heure et Date", enable: "Activer", showSeconds: "Afficher les secondes", twelveHourTime: "Heure en 12h", showAmPm: "Afficher AM/PM", amPmPosition: "Position AM/PM", topLeft: "En haut à gauche", topRight: "En haut à droite", bottomLeft: "En bas à gauche", bottomRight: "En bas à droite", analogClock: "Horloge analogique", clockShape: "Forme de l'horloge", clockFace: "Cadran", clockHands: "Aiguilles", clockBackground: "Fond de l'horloge", clockBorder: "Bordure", dateFormat: "Format de date", clockSize: "Taille de l'horloge", dateSize: "Taille de la date", worldClocks: "Horloges mondiales", timeZone: "Fuseau horaire", show: "Afficher", clockAndDate: "Horloge et date", clockOnly: "Horloge seule", dateOnly: "Date seule", automatic: "Automatique", dayMonthDate: "Jour, mois date", monthDayYear: "Mois jour, année", ddmmyyyy: "JJ/MM/AAAA" },
  de: { background: "Hintergrund", backgroundType: "Hintergrundtyp", bgImages: "Bilder", bgColorType: "Farbe", bgGradient: "Farbverlauf", bgNone: "Keiner", font: "Schrift", fontFamily: "Schriftfamilie", fontWeight: "Stärke", fontSize: "Größe", weightLight: "Dünn", weightNormal: "Normal", weightSemiBold: "Halbfett", weightBold: "Fett", quickLinks: "Schnelllinks", addLink: "Link hinzufügen", importBookmarks: "Lesezeichen importieren", importBtn: "Importieren", showGroups: "Gruppen anzeigen", openInNewTab: "In neuem Tab öffnen", iconCornerRadius: "Symbol-Eckenradius", linksPerRow: "Links pro Zeile", linkStyle: "Stil", small: "Klein", medium: "Mittel", large: "Groß", titlePlaceholder: "Titel", searchPlaceholder: "Suchen mit", quickAccess: "Schnellzugriff", customize: "Anpassen", gmail: "Gmail", images: "Bilder", footer: "SearchHub — Überall suchen, alles an einem Ort", showAllSettings: "Alle Einstellungen anzeigen", language: "Sprache", darkMode: "Dunkelmodus", tabAppearance: "Tab-Erscheinungsbild", hideSettingsIcon: "Symbol ausblenden", general: "Allgemein", system: "System", light: "Hell", dark: "Dunkel", timeAndDate: "Zeit & Datum", enable: "Aktivieren", showSeconds: "Sekunden anzeigen", twelveHourTime: "12-Stunden-Zeit", showAmPm: "AM/PM anzeigen", amPmPosition: "AM/PM Position", topLeft: "Oben links", topRight: "Oben rechts", bottomLeft: "Unten links", bottomRight: "Unten rechts", analogClock: "Analoge Uhr", clockShape: "Uhrenform", clockFace: "Zifferblatt", clockHands: "Uhrzeiger", clockBackground: "Uhr-Hintergrund", clockBorder: "Uhr-Rand", dateFormat: "Datumsformat", clockSize: "Uhrengröße", dateSize: "Datumsgröße", worldClocks: "Weltuhren", timeZone: "Zeitzone", show: "Anzeigen", clockAndDate: "Uhr und Datum", clockOnly: "Nur Uhr", dateOnly: "Nur Datum", automatic: "Automatisch", dayMonthDate: "Tag, Monat Datum", monthDayYear: "Monat Tag, Jahr", ddmmyyyy: "TT/MM/JJJJ" },
  ar: { background: "الخلفية", backgroundType: "نوع الخلفية", bgImages: "صور", bgColorType: "لون", bgGradient: "تدرج", bgNone: "لا شيء", font: "الخط", fontFamily: "عائلة الخط", fontWeight: "الوزن", fontSize: "الحجم", weightLight: "خفيف", weightNormal: "عادي", weightSemiBold: "شبه عريض", weightBold: "عريض", quickLinks: "روابط سريعة", addLink: "إضافة رابط", importBookmarks: "استيراد الإشارات", importBtn: "استيراد", showGroups: "إظهار المجموعات", openInNewTab: "فتح في تبويب جديد", iconCornerRadius: "نصف قطر الأيقونة", linksPerRow: "روابط في الصف", linkStyle: "النمط", small: "صغير", medium: "متوسط", large: "كبير", titlePlaceholder: "العنوان", searchPlaceholder: "ابحث مع", quickAccess: "وصول سريع", customize: "تخصيص", gmail: "جيميل", images: "صور", footer: "SearchHub — ابحث في أي مكان", showAllSettings: "إظهار كل الإعدادات", language: "اللغة", darkMode: "الوضع المظلم", tabAppearance: "مظهر التبويب", hideSettingsIcon: "إخفاء أيقونة الإعدادات", general: "عام", system: "النظام", light: "فاتح", dark: "داكن", timeAndDate: "الوقت والتاريخ", enable: "تفعيل", showSeconds: "إظهار الثواني", twelveHourTime: "توقيت 12 ساعة", showAmPm: "إظهار AM/PM", amPmPosition: "موضع AM/PM", topLeft: "أعلى اليسار", topRight: "أعلى اليمين", bottomLeft: "أسفل اليسار", bottomRight: "أسفل اليمين", analogClock: "ساعة تناظرية", clockShape: "شكل الساعة", clockFace: "وجه الساعة", clockHands: "عقارب الساعة", clockBackground: "خلفية الساعة", clockBorder: "حدود الساعة", dateFormat: "تنسيق التاريخ", clockSize: "حجم الساعة", dateSize: "حجم التاريخ", worldClocks: "ساعات العالم", timeZone: "المنطقة الزمنية", show: "إظهار", clockAndDate: "الساعة والتاريخ", clockOnly: "الساعة فقط", dateOnly: "التاريخ فقط", automatic: "تلقائي", dayMonthDate: "يوم، شهر تاريخ", monthDayYear: "شهر يوم، سنة", ddmmyyyy: "يي/شش/سسسس" },
  zh: { background: "背景", backgroundType: "背景类型", bgImages: "图片", bgColorType: "颜色", bgGradient: "渐变", bgNone: "无", font: "字体", fontFamily: "字体系列", fontWeight: "字重", fontSize: "字号", weightLight: "细", weightNormal: "常规", weightSemiBold: "半粗", weightBold: "粗", quickLinks: "快速链接", addLink: "添加链接", importBookmarks: "导入书签", importBtn: "导入", showGroups: "显示分组", openInNewTab: "在新标签打开", iconCornerRadius: "图标圆角", linksPerRow: "每行链接数", linkStyle: "样式", small: "小", medium: "中", large: "大", titlePlaceholder: "标题", searchPlaceholder: "使用搜索", quickAccess: "快速访问", customize: "自定义", gmail: "Gmail", images: "图片", footer: "SearchHub — 随处搜索，一站直达", showAllSettings: "显示所有设置", language: "语言", darkMode: "深色模式", tabAppearance: "标签外观", hideSettingsIcon: "隐藏设置图标", general: "常规", system: "系统", light: "浅色", dark: "深色", timeAndDate: "时间与日期", enable: "启用", showSeconds: "显示秒数", twelveHourTime: "12小时制", showAmPm: "显示上午/下午", amPmPosition: "上午/下午位置", topLeft: "左上", topRight: "右上", bottomLeft: "左下", bottomRight: "右下", analogClock: "模拟时钟", clockShape: "时钟形状", clockFace: "表盘", clockHands: "时钟指针", clockBackground: "时钟背景", clockBorder: "时钟边框", dateFormat: "日期格式", clockSize: "时钟大小", dateSize: "日期大小", worldClocks: "世界时钟", timeZone: "时区", show: "显示", clockAndDate: "时钟和日期", clockOnly: "仅时钟", dateOnly: "仅日期", automatic: "自动", dayMonthDate: "日，月 日期", monthDayYear: "月 日，年", ddmmyyyy: "日/月/年" },
  ja: { background: "背景", backgroundType: "背景タイプ", bgImages: "画像", bgColorType: "カラー", bgGradient: "グラデーション", bgNone: "なし", font: "フォント", fontFamily: "フォントファミリー", fontWeight: "ウェイト", fontSize: "サイズ", weightLight: "ライト", weightNormal: "ノーマル", weightSemiBold: "セミボールド", weightBold: "ボールド", quickLinks: "クイックリンク", addLink: "リンクを追加", importBookmarks: "ブックマークをインポート", importBtn: "インポート", showGroups: "グループを表示", openInNewTab: "新しいタブで開く", iconCornerRadius: "アイコン角丸", linksPerRow: "1行のリンク数", linkStyle: "スタイル", small: "小", medium: "中", large: "大", titlePlaceholder: "タイトル", searchPlaceholder: "検索", quickAccess: "クイックアクセス", customize: "カスタマイズ", gmail: "Gmail", images: "画像", footer: "SearchHub — どこでも検索、すべて一か所で", showAllSettings: "すべての設定を表示", language: "言語", darkMode: "ダークモード", tabAppearance: "タブの外観", hideSettingsIcon: "設定アイコンを隠す", general: "一般", system: "システム", light: "ライト", dark: "ダーク", timeAndDate: "時刻と日付", enable: "有効", showSeconds: "秒を表示", twelveHourTime: "12時間制", showAmPm: "AM/PMを表示", amPmPosition: "AM/PMの位置", topLeft: "左上", topRight: "右上", bottomLeft: "左下", bottomRight: "右下", analogClock: "アナログ時計", clockShape: "時計の形", clockFace: "文字盤", clockHands: "時計の針", clockBackground: "時計の背景", clockBorder: "時計の枠", dateFormat: "日付形式", clockSize: "時計のサイズ", dateSize: "日付サイズ", worldClocks: "世界時計", timeZone: "タイムゾーン", show: "表示", clockAndDate: "時計と日付", clockOnly: "時計のみ", dateOnly: "日付のみ", automatic: "自動", dayMonthDate: "曜日、月 日", monthDayYear: "月 日、年", ddmmyyyy: "日/月/年" },
  pt: { background: "Fundo", backgroundType: "Tipo de fundo", bgImages: "Imagens", bgColorType: "Cor", bgGradient: "Gradiente", bgNone: "Nenhum", font: "Fonte", fontFamily: "Família da fonte", fontWeight: "Espessura", fontSize: "Tamanho", weightLight: "Fina", weightNormal: "Normal", weightSemiBold: "Semi-negrito", weightBold: "Negrito", quickLinks: "Links rápidos", addLink: "Adicionar link", importBookmarks: "Importar favoritos", importBtn: "Importar", showGroups: "Mostrar grupos", openInNewTab: "Abrir em nova aba", iconCornerRadius: "Raio do ícone", linksPerRow: "Links por linha", linkStyle: "Estilo", small: "Pequeno", medium: "Médio", large: "Grande", titlePlaceholder: "Título", searchPlaceholder: "Pesquisar com", quickAccess: "Acesso rápido", customize: "Personalizar", gmail: "Gmail", images: "Imagens", footer: "SearchHub — Pesquise em qualquer lugar, tudo em um", showAllSettings: "Mostrar todas as configurações", language: "Idioma", darkMode: "Modo escuro", tabAppearance: "Aparência da guia", hideSettingsIcon: "Ocultar ícone", general: "Geral", system: "Sistema", light: "Claro", dark: "Escuro", timeAndDate: "Hora e Data", enable: "Ativar", showSeconds: "Mostrar segundos", twelveHourTime: "Hora de 12h", showAmPm: "Mostrar AM/PM", amPmPosition: "Posição AM/PM", topLeft: "Superior esquerdo", topRight: "Superior direito", bottomLeft: "Inferior esquerdo", bottomRight: "Inferior direito", analogClock: "Relógio analógico", clockShape: "Formato", clockFace: "Mostrador", clockHands: "Ponteiros", clockBackground: "Fundo do relógio", clockBorder: "Borda do relógio", dateFormat: "Formato de data", clockSize: "Tamanho do relógio", dateSize: "Tamanho da data", worldClocks: "Relógios mundiais", timeZone: "Fuso horário", show: "Mostrar", clockAndDate: "Relógio e data", clockOnly: "Apenas relógio", dateOnly: "Apenas data", automatic: "Automático", dayMonthDate: "Dia, mês data", monthDayYear: "Mês dia, ano", ddmmyyyy: "DD/MM/AAAA" },
  ru: { background: "Фон", backgroundType: "Тип фона", bgImages: "Изображения", bgColorType: "Цвет", bgGradient: "Градиент", bgNone: "Нет", font: "Шрифт", fontFamily: "Семейство шрифтов", fontWeight: "Насыщенность", fontSize: "Размер", weightLight: "Тонкий", weightNormal: "Обычный", weightSemiBold: "Полужирный", weightBold: "Жирный", quickLinks: "Быстрые ссылки", addLink: "Добавить ссылку", importBookmarks: "Импорт закладок", importBtn: "Импорт", showGroups: "Показать группы", openInNewTab: "Открыть в новой вкладке", iconCornerRadius: "Радиус угла иконки", linksPerRow: "Ссылок в строке", linkStyle: "Стиль", small: "Малый", medium: "Средний", large: "Большой", titlePlaceholder: "Заголовок", searchPlaceholder: "Поиск с помощью", quickAccess: "Быстрый доступ", customize: "Настроить", gmail: "Gmail", images: "Изображения", footer: "SearchHub — Ищите везде, всё в одном месте", showAllSettings: "Показать все настройки", language: "Язык", darkMode: "Тёмный режим", tabAppearance: "Внешний вид вкладки", hideSettingsIcon: "Скрыть значок", general: "Общие", system: "Система", light: "Светлый", dark: "Тёмный", timeAndDate: "Время и Дата", enable: "Включить", showSeconds: "Показывать секунды", twelveHourTime: "12-часовой формат", showAmPm: "Показать AM/PM", amPmPosition: "Позиция AM/PM", topLeft: "Верх лево", topRight: "Верх право", bottomLeft: "Низ лево", bottomRight: "Низ право", analogClock: "Аналоговые часы", clockShape: "Форма часов", clockFace: "Циферблат", clockHands: "Стрелки", clockBackground: "Фон часов", clockBorder: "Рамка часов", dateFormat: "Формат даты", clockSize: "Размер часов", dateSize: "Размер даты", worldClocks: "Мировые часы", timeZone: "Часовой пояс", show: "Показывать", clockAndDate: "Часы и дата", clockOnly: "Только часы", dateOnly: "Только дата", automatic: "Автоматически", dayMonthDate: "День, месяц дата", monthDayYear: "Месяц день, год", ddmmyyyy: "ДД/ММ/ГГГГ" },
  ko: { background: "배경", backgroundType: "배경 유형", bgImages: "이미지", bgColorType: "색상", bgGradient: "그라데이션", bgNone: "없음", font: "글꼴", fontFamily: "글꼴 계열", fontWeight: "굵기", fontSize: "크기", weightLight: "얇게", weightNormal: "보통", weightSemiBold: "세미볼드", weightBold: "굵게", quickLinks: "빠른 링크", addLink: "링크 추가", importBookmarks: "북마크 가져오기", importBtn: "가져오기", showGroups: "그룹 표시", openInNewTab: "새 탭에서 열기", iconCornerRadius: "아이콘 모서리 반경", linksPerRow: "행당 링크 수", linkStyle: "스타일", small: "소형", medium: "중형", large: "대형", titlePlaceholder: "제목", searchPlaceholder: "검색", quickAccess: "빠른 접근", customize: "사용자 정의", gmail: "Gmail", images: "이미지", footer: "SearchHub — 어디서나 검색, 한 곳에서 모두", showAllSettings: "모든 설정 표시", language: "언어", darkMode: "다크 모드", tabAppearance: "탭 모양", hideSettingsIcon: "설정 아이콘 숨기기", general: "일반", system: "시스템", light: "밝게", dark: "어둡게", timeAndDate: "시간 및 날짜", enable: "활성화", showSeconds: "초 표시", twelveHourTime: "12시간제", showAmPm: "AM/PM 표시", amPmPosition: "AM/PM 위치", topLeft: "왼쪽 위", topRight: "오른쪽 위", bottomLeft: "왼쪽 아래", bottomRight: "오른쪽 아래", analogClock: "아날로그 시계", clockShape: "시계 모양", clockFace: "시계 면", clockHands: "시계 바늘", clockBackground: "시계 배경", clockBorder: "시계 테두리", dateFormat: "날짜 형식", clockSize: "시계 크기", dateSize: "날짜 크기", worldClocks: "세계 시계", timeZone: "시간대", show: "표시", clockAndDate: "시계 및 날짜", clockOnly: "시계만", dateOnly: "날짜만", automatic: "자동", dayMonthDate: "요일, 월 일", monthDayYear: "월 일, 년", ddmmyyyy: "일/월/년" },
};

function AnalogClock({ now, tz, size, shape, face, hands, isDark, bgOpacity, borderOpacity }: {
  now: Date; tz: string | undefined; size: number; shape: string; face: string; hands: string; isDark: boolean;
  bgOpacity: number; borderOpacity: number;
}) {
  const d = tz ? new Date(now.toLocaleString("en-US", { timeZone: tz })) : now;
  const h = d.getHours() % 12, m = d.getMinutes(), s = d.getSeconds();
  const hDeg = (h / 12) * 360 + (m / 60) * 30;
  const mDeg = (m / 60) * 360 + (s / 60) * 6;
  const sDeg = (s / 60) * 360;
  const r = size / 2;
  const cx = r, cy = r;
  const baseFace = isDark ? "30,30,60" : "248,248,244";
  const faceAlpha = bgOpacity / 100;
  const faceColor = `rgba(${baseFace},${faceAlpha})`;
  const strokeColor = isDark ? "#e8e8f0" : "#1a1a2e";
  const borderAlpha = (borderOpacity / 100) * 0.9;
  const thinStroke = hands === "thin" ? 1.5 : hands === "classic" ? 3 : 2;
  const hourLen = r * 0.55, minLen = r * 0.75, secLen = r * 0.85;
  const borderR = shape === "square" ? "12%" : shape === "rectangle" ? "8%" : "50%";
  const rx = shape === "round" ? r : shape === "square" ? r * 0.24 : r * 0.16;

  function hand(deg: number, len: number, width: number, color: string) {
    const rad = (deg - 90) * (Math.PI / 180);
    const x2 = cx + len * Math.cos(rad);
    const y2 = cy + len * Math.sin(rad);
    return <line x1={cx} y1={cy} x2={x2} y2={y2} stroke={color} strokeWidth={width} strokeLinecap="round" />;
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ borderRadius: borderR, display: "block" }}>
      <rect x={0} y={0} width={size} height={size} rx={rx}
        fill={faceColor}
        stroke={borderOpacity > 0 ? `rgba(${isDark ? "232,232,240" : "26,26,46"},${borderAlpha})` : "none"}
        strokeWidth={borderOpacity > 0 ? 2 : 0} />
      {face !== "none" && Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * 2 * Math.PI - Math.PI / 2;
        const inner = face === "classic" ? r * 0.82 : r * 0.85;
        const outer = r * 0.92;
        return <line key={i} x1={cx + inner * Math.cos(a)} y1={cy + inner * Math.sin(a)}
          x2={cx + outer * Math.cos(a)} y2={cy + outer * Math.sin(a)}
          stroke={strokeColor} strokeOpacity={0.5} strokeWidth={i % 3 === 0 ? 2 : 1} />;
      })}
      {hand(hDeg, hourLen, thinStroke + 1.5, strokeColor)}
      {hand(mDeg, minLen, thinStroke, strokeColor)}
      {hand(sDeg, secLen, 1.5, "#e74c3c")}
      <circle cx={cx} cy={cy} r={r * 0.04} fill={strokeColor} />
    </svg>
  );
}

function getDomain(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return ""; }
}

type AppLibItem = { id: string; name: string; url: string; domain: string };
type AppSet = { id: string; name: string; apps: AppLibItem[] };

function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

function loadAppSets(): AppSet[] {
  try {
    const raw = localStorage.getItem("rynzen-app-sets");
    if (raw) return JSON.parse(raw);
    const oldRaw = localStorage.getItem("rynzen-app-library");
    if (oldRaw) {
      const apps: AppLibItem[] = JSON.parse(oldRaw);
      if (apps.length > 0) return [{ id: "default", name: "My Apps", apps }];
    }
  } catch {}
  return [{ id: "default", name: "My Apps", apps: [] }];
}

export default function App() {
  const [query, setQuery] = useState("");
  const [selectedEngine, setSelectedEngine] = useState<SearchEngine>(engines[0]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [now, setNow] = useState(new Date());
  const [shortcuts, setShortcuts] = useState(initialShortcuts);
  const [shortcutPositions, setShortcutPositions] = useState<Record<string, {x: number, y: number}>>(() => {
    try { return JSON.parse(localStorage.getItem("rynzen-shortcut-positions") || "{}"); } catch { return {}; }
  });
  const freeDragRef = useRef<{name: string; offsetX: number; offsetY: number; hasMoved: boolean; startX: number; startY: number} | null>(null);
  const [freeDragState, setFreeDragState] = useState<{name: string, x: number, y: number} | null>(null);
  const dragBoundsRef = useRef<{left: number; right: number; top: number; iconW: number} | null>(null);
  const [boundaryHit, setBoundaryHit] = useState<{left: boolean; right: boolean}>({left: false, right: false});
  const [showSettings, setShowSettings] = useState(false);
  const [hideFab, setHideFab] = useState(false);

  // General settings
  const [language, setLanguage] = useState("en");
  const [darkModeOption, setDarkModeOption] = useState<"system" | "light" | "dark">("system");
  const [systemIsDark, setSystemIsDark] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(prefers-color-scheme: dark)").matches : false
  );

  // Time & Date settings
  const [clockEnabled, setClockEnabled] = useState(true);
  const [showSeconds, setShowSeconds] = useState(true);
  const [twelveHourTime, setTwelveHourTime] = useState(true);
  const [showAmPm, setShowAmPm] = useState(true);
  const [amPmPosition, setAmPmPosition] = useState("bottom-left");
  const [analogClock, setAnalogClock] = useState(false);
  const [clockShape, setClockShape] = useState("round");
  const [clockFace, setClockFace] = useState("none");
  const [clockHands, setClockHands] = useState("modern");
  const [clockBgOpacity, setClockBgOpacity] = useState(0);
  const [clockBorderOpacity, setClockBorderOpacity] = useState(0);
  const [dateFormat, setDateFormat] = useState("day-month-date");
  const [clockSizeNum, setClockSizeNum] = useState(65);
  const [dateSizeNum, setDateSizeNum] = useState(50);
  const [worldClocks, setWorldClocks] = useState(false);
  const [timezone, setTimezone] = useState("Automatic");
  const [clockShow, setClockShow] = useState<"both" | "clock" | "date">("both");

  const [bgColor, setBgColor] = useState("#f5f4f0");
  const [showShortcuts, setShowShortcuts] = useState(true);
  const [quickLinksOpenNewTab, setQuickLinksOpenNewTab] = useState(true);
  const [quickLinksShowGroups, setQuickLinksShowGroups] = useState(false);
  const [quickLinksIconRadius, setQuickLinksIconRadius] = useState(10);
  const [quickLinksPerRow, setQuickLinksPerRow] = useState(8);
  const [quickLinksStyle, setQuickLinksStyle] = useState<"icon" | "text">("icon");
  const [quickLinksSize, setQuickLinksSize] = useState<"small" | "medium" | "large">("medium");
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [appSets, setAppSets] = useState<AppSet[]>(() => loadAppSets());
  const [addingToSet, setAddingToSet] = useState<string | null>(null);
  const [addUrlValue, setAddUrlValue] = useState("");
  const [addUrlError, setAddUrlError] = useState("");
  const [selectingSet, setSelectingSet] = useState<string | null>(null);
  const [selectedInSet, setSelectedInSet] = useState<Set<string>>(new Set());
  const [selectedLibIds, setSelectedLibIds] = useState<Set<string>>(new Set());
  const [editingSetId, setEditingSetId] = useState<string | null>(null);
  const [editingSetName, setEditingSetName] = useState("");

  const [bgType, setBgType] = useState<"none" | "images" | "color" | "gradient">("none");
  const [bgImageSelected, setBgImageSelected] = useState("");
  const [bgImageFolder, setBgImageFolder] = useState<string | null>(null);

  useEffect(() => {
    if (bgType !== "images") { setBgImageSelected(""); setBgImageFolder(null); }
  }, [bgType]);

  useEffect(() => {
    try { localStorage.setItem("rynzen-app-sets", JSON.stringify(appSets)); } catch { /* ignore */ }
  }, [appSets]);

  const [appliedFontFamily, setAppliedFontFamily] = useState("");
  const [fontFamilyInput, setFontFamilyInput] = useState("");
  const [fontDropdownOpen, setFontDropdownOpen] = useState(false);
  const [fontWeightSetting, setFontWeightSetting] = useState<"light" | "normal" | "semi-bold" | "bold">("normal");
  const [fontSizeNum, setFontSizeNum] = useState(50);
  const [fontColor, setFontColor] = useState("");
  const [fontColorOpen, setFontColorOpen] = useState(false);
  const fontColorRef = useRef<HTMLDivElement>(null);

  const [pomodoroEnabled, setPomodoroEnabled] = useState(false);
  const [pomodoroSound, setPomodoroSound] = useState(true);
  const [pomodoroTune, setPomodoroTune] = useState("Marimba");
  const [pomodoroVolume, setPomodoroVolume] = useState(80);
  const [pomodoroDefaultTime, setPomodoroDefaultTime] = useState(25);
  const [pomodoroBreakTime, setPomodoroBreakTime] = useState(5);
  const [pomodoroLongBreakTime, setPomodoroLongBreakTime] = useState(20);
  const [pomodoroMode, setPomodoroMode] = useState<"pomodoro" | "break" | "longbreak">("pomodoro");
  const [pomodoroSeconds, setPomodoroSeconds] = useState(25 * 60);
  const [pomodoroRunning, setPomodoroRunning] = useState(false);
  const [pomodoroTask, setPomodoroTask] = useState("");
  const [pomodoroFocus, setPomodoroFocus] = useState(false);
  const [pomodoroEditingPart, setPomodoroEditingPart] = useState<"hr" | "min" | "sec" | null>(null);
  const [pomodoroEditVal, setPomodoroEditVal] = useState("");
  const pomodoroEditRef = useRef<HTMLInputElement>(null);

  const [countdownEnabled, setCountdownEnabled] = useState(false);
  const [countdownElapsed, setCountdownElapsed] = useState(0);
  const [countdownRunning, setCountdownRunning] = useState(false);

  const [engineColorEffect] = useState(true);

  // Search bar settings
  const [searchBarEnabled, setSearchBarEnabled] = useState(true);
  const [searchSuggestionsEnabled, setSearchSuggestionsEnabled] = useState(true);
  const [searchBarWidth, setSearchBarWidth] = useState(40);
  const [searchBarBgOpacity, setSearchBarBgOpacity] = useState(100);
  const [searchBarPlaceholder, setSearchBarPlaceholder] = useState("");

  // Page Layout mode
  type LayoutPos = { x: number; y: number; w?: number; h?: number };
  type LayoutSlotKey = "main" | "A1" | "B2" | "C3";
  type SlotData = Record<string, LayoutPos | null>;
  const emptySlotData = (): SlotData => ({ clock: null, search: null, shortcuts: null, pomodoro: null });

  const [layoutMode, setLayoutMode] = useState(false);
  const [pendingLayoutMode, setPendingLayoutMode] = useState(false);
  const [layoutPositions, setLayoutPositions] = useState<SlotData>(emptySlotData);

  const [activeSlot, setActiveSlot] = useState<LayoutSlotKey>(() => {
    try { return (localStorage.getItem("rynzen-active-slot") as LayoutSlotKey) || "main"; } catch { return "main"; }
  });
  const [layoutSlots, setLayoutSlots] = useState<Record<"A1"|"B2"|"C3", SlotData>>(() => {
    try {
      const saved = localStorage.getItem("rynzen-layout-slots");
      return saved ? JSON.parse(saved) : { A1: emptySlotData(), B2: emptySlotData(), C3: emptySlotData() };
    } catch { return { A1: emptySlotData(), B2: emptySlotData(), C3: emptySlotData() }; }
  });

  const persistedPositions: SlotData = activeSlot === "main"
    ? emptySlotData()
    : (layoutSlots[activeSlot as "A1"|"B2"|"C3"] ?? emptySlotData());
  const [activeLayoutEl, setActiveLayoutEl] = useState<string | null>(null);
  const layoutDragRef = useRef<{ el: string; startMX: number; startMY: number; startElX: number; startElY: number } | null>(null);
  const resizeDragRef = useRef<{ el: string; handle: string; startMX: number; startMY: number; startX: number; startY: number; startW: number; startH: number } | null>(null);
  const mainRef = useRef<HTMLElement>(null);
  const clockRef = useRef<HTMLDivElement>(null);
  const searchSectionRef = useRef<HTMLDivElement>(null);
  const shortcutsSectionRef = useRef<HTMLDivElement>(null);
  const pomodoroRef = useRef<HTMLDivElement>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const bookmarkInputRef = useRef<HTMLInputElement>(null);

  const t = T[language] ?? T["en"];

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!pomodoroRunning) return;
    const interval = setInterval(() => {
      setPomodoroSeconds(s => {
        if (s <= 1) {
          setPomodoroRunning(false);
          if (pomodoroSound) playPomodoroAlarm(pomodoroTune, pomodoroVolume);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [pomodoroRunning, pomodoroSound, pomodoroTune, pomodoroVolume]);

  useEffect(() => {
    if (!countdownRunning) return;
    const start = Date.now() - countdownElapsed;
    const interval = setInterval(() => setCountdownElapsed(Date.now() - start), 10);
    return () => clearInterval(interval);
  }, [countdownRunning]);

  function handlePomodoroMode(mode: "pomodoro" | "break" | "longbreak") {
    setPomodoroMode(mode);
    setPomodoroRunning(false);
    if (mode === "pomodoro") setPomodoroSeconds(pomodoroDefaultTime * 60);
    else if (mode === "break") setPomodoroSeconds(pomodoroBreakTime * 60);
    else setPomodoroSeconds(pomodoroLongBreakTime * 60);
  }

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const isDark =
    darkModeOption === "dark" ||
    (darkModeOption === "system" && systemIsDark);

  useEffect(() => {
    document.body.style.background = isDark ? "#1a1a2e" : bgColor;
    document.body.style.color = fontColor || (isDark ? "#e8e8f0" : "#1a1a2e");
  }, [isDark, bgColor, fontColor]);

  const fontSizePx = 12 + Math.round((fontSizeNum / 100) * 16);
  const textColor = fontColor || (isDark ? "#e8e8f0" : "#1a1a2e");
  const themeColor = isDark ? "#e8e8f0" : "#1a1a2e";

  const cdH = Math.floor(countdownElapsed / 3600000);
  const cdM = Math.floor((countdownElapsed % 3600000) / 60000);
  const cdS = Math.floor((countdownElapsed % 60000) / 1000);
  const cdMs = Math.floor((countdownElapsed % 1000) / 10);

  useEffect(() => {
    const weightMap: Record<string, string> = { light: "300", normal: "400", "semi-bold": "600", bold: "700" };
    const root = document.documentElement;
    root.style.fontSize = `${fontSizePx}px`;
    root.style.setProperty("--app-font", appliedFontFamily ? `'${appliedFontFamily}', sans-serif` : "");
    root.style.setProperty("--app-font-weight", weightMap[fontWeightSetting]);
    root.style.setProperty("--app-font-size", `${fontSizePx}px`);
  }, [appliedFontFamily, fontWeightSetting, fontSizePx]);

  useEffect(() => {
    if (!appliedFontFamily) return;
    const id = "dynamic-gfont";
    let link = document.getElementById(id) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(appliedFontFamily)}:wght@300;400;600;700&display=swap`;
  }, [appliedFontFamily]);

  const suggestions = query.length > 0
    ? [`${query}`, `${query} meaning`, `${query} in Bengali`, `${query} tutorial`, `${query} 2024`]
    : [];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        const fab = document.getElementById("settings-fab");
        if (fab && fab.contains(e.target as Node)) return;
        setShowSettings(false);
      }
      if (fontColorRef.current && !fontColorRef.current.contains(e.target as Node)) {
        setFontColorOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSearch(q: string = query) {
    if (!q.trim()) return;
    const url = selectedEngine.searchUrl + encodeURIComponent(q.trim());
    window.open(url, "_blank");
    setShowSuggestions(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleSearch();
    else if (e.key === "Escape") setShowSuggestions(false);
  }

  function resolveCollisions(
    newPos: { x: number; y: number },
    name: string,
    positions: Record<string, { x: number; y: number }>,
    iconSize: number,
    bounds: { left: number; right: number; top: number } | null,
  ): { x: number; y: number } {
    const PAD = iconSize;
    let pos = { ...newPos };
    for (let iter = 0; iter < 30; iter++) {
      let moved = false;
      for (const [otherName, otherPos] of Object.entries(positions)) {
        if (otherName === name) continue;
        const dx = pos.x - otherPos.x;
        const dy = pos.y - otherPos.y;
        const overlapX = PAD - Math.abs(dx);
        const overlapY = PAD - Math.abs(dy);
        if (overlapX > 0 && overlapY > 0) {
          const pushX = dx >= 0 ? overlapX : -overlapX;
          const pushY = dy >= 0 ? overlapY : -overlapY;
          const wouldViolateBoundsY = bounds && (pos.y + pushY < bounds.top);
          if (overlapX <= overlapY || wouldViolateBoundsY) {
            pos.x += pushX;
          } else {
            pos.y += pushY;
            if (bounds && pos.y < bounds.top) pos.y = bounds.top;
          }
          moved = true;
        }
      }
      if (!moved) break;
    }
    if (bounds) {
      pos.x = Math.max(bounds.left, Math.min(bounds.right, pos.x));
      pos.y = Math.max(pos.y, bounds.top);
    }
    return pos;
  }

  function handleShortcutMouseDown(e: React.MouseEvent, name: string) {
    if (e.button !== 0) return;
    e.preventDefault();
    const iconRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const pos = shortcutPositions[name];
    freeDragRef.current = {
      name,
      offsetX: e.clientX - (pos ? pos.x : iconRect.left),
      offsetY: e.clientY - (pos ? pos.y : iconRect.top),
      hasMoved: false,
      startX: e.clientX,
      startY: e.clientY,
    };
    const searchRect = searchSectionRef.current?.getBoundingClientRect();
    if (searchRect) {
      dragBoundsRef.current = {
        left: searchRect.left,
        right: searchRect.right - iconRect.width,
        top: searchRect.bottom,
        iconW: iconRect.width,
      };
    } else {
      dragBoundsRef.current = null;
    }
    if (pos) {
      setFreeDragState({ name, x: pos.x, y: pos.y });
    }
  }

  useEffect(() => {
    function clampToBounds(rawX: number, rawY: number): { x: number; y: number; hitLeft: boolean; hitRight: boolean } {
      const b = dragBoundsRef.current;
      if (!b) return { x: rawX, y: rawY, hitLeft: false, hitRight: false };
      let x = rawX;
      let hitLeft = false;
      let hitRight = false;
      if (x < b.left) { x = b.left; hitLeft = true; }
      if (x > b.right) { x = b.right; hitRight = true; }
      const y = Math.max(rawY, b.top);
      return { x, y, hitLeft, hitRight };
    }

    function onMove(e: MouseEvent) {
      if (!freeDragRef.current) return;
      const dx = e.clientX - freeDragRef.current.startX;
      const dy = e.clientY - freeDragRef.current.startY;
      if (!freeDragRef.current.hasMoved && Math.hypot(dx, dy) < 5) return;
      freeDragRef.current.hasMoved = true;
      const rawX = e.clientX - freeDragRef.current.offsetX;
      const rawY = e.clientY - freeDragRef.current.offsetY;
      const { x, y, hitLeft, hitRight } = clampToBounds(rawX, rawY);
      setFreeDragState({ name: freeDragRef.current.name, x, y });
      setBoundaryHit({ left: hitLeft, right: hitRight });
    }

    function onUp(e: MouseEvent) {
      if (!freeDragRef.current) return;
      if (freeDragRef.current.hasMoved) {
        const rawX = e.clientX - freeDragRef.current.offsetX;
        const rawY = e.clientY - freeDragRef.current.offsetY;
        const { x, y } = clampToBounds(rawX, rawY);
        const name = freeDragRef.current.name;
        const iconSize = dragBoundsRef.current?.iconW ?? 60;
        const savedBounds = dragBoundsRef.current
          ? { left: dragBoundsRef.current.left, right: dragBoundsRef.current.right, top: dragBoundsRef.current.top }
          : null;
        setShortcutPositions(prev => {
          const resolved = resolveCollisions({ x, y }, name, prev, iconSize, savedBounds);
          const updated = { ...prev, [name]: resolved };
          try { localStorage.setItem("rynzen-shortcut-positions", JSON.stringify(updated)); } catch { /* ignore */ }
          return updated;
        });
      }
      freeDragRef.current = null;
      dragBoundsRef.current = null;
      setFreeDragState(null);
      setBoundaryHit({ left: false, right: false });
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  function enterLayoutMode() {
    setShowSettings(false);
    setActiveLayoutEl(null);
    setPendingLayoutMode(true);
  }

  useEffect(() => {
    if (!pendingLayoutMode) return;
    // Wait for sidebar close transition (0.32s) before measuring DOM
    const timer = setTimeout(() => {
      const mainRect = mainRef.current?.getBoundingClientRect();
      if (!mainRect) { setPendingLayoutMode(false); return; }
      const slotData = activeSlot === "main" ? emptySlotData() : (layoutSlots[activeSlot as "A1"|"B2"|"C3"] ?? emptySlotData());
      const getPos = (el: HTMLElement | null, key: string): LayoutPos | null => {
        const existing = slotData[key];
        if (!el) return existing ?? null;
        const r = el.getBoundingClientRect();
        return existing
          ? { ...existing, w: existing.w ?? r.width, h: existing.h ?? r.height }
          : { x: r.left - mainRect.left, y: r.top - mainRect.top, w: r.width, h: r.height };
      };
      setLayoutPositions({
        clock: getPos(clockRef.current, "clock"),
        search: getPos(searchSectionRef.current, "search"),
        shortcuts: getPos(shortcutsSectionRef.current, "shortcuts"),
        pomodoro: getPos(pomodoroRef.current, "pomodoro"),
      });
      setLayoutMode(true);
      setPendingLayoutMode(false);
    }, 340);
    return () => clearTimeout(timer);
  }, [pendingLayoutMode]);

  function exitLayoutMode() {
    if (activeSlot !== "main") {
      const saved = { ...layoutPositions };
      const updated = { ...layoutSlots, [activeSlot]: saved } as Record<"A1"|"B2"|"C3", SlotData>;
      setLayoutSlots(updated);
      try { localStorage.setItem("rynzen-layout-slots", JSON.stringify(updated)); } catch { /* ignore */ }
    }
    setLayoutMode(false);
    setActiveLayoutEl(null);
    layoutDragRef.current = null;
  }

  function resetLayout() {
    if (activeSlot === "main") return;
    const updated = { ...layoutSlots, [activeSlot]: emptySlotData() } as Record<"A1"|"B2"|"C3", SlotData>;
    setLayoutSlots(updated);
    setLayoutPositions(emptySlotData());
    try { localStorage.setItem("rynzen-layout-slots", JSON.stringify(updated)); } catch { /* ignore */ }
  }

  function selectSlot(slot: LayoutSlotKey) {
    setActiveSlot(slot);
    try { localStorage.setItem("rynzen-active-slot", slot); } catch { /* ignore */ }
  }

  const handleLayoutMouseDown = useCallback((el: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveLayoutEl(el);
    const pos = layoutPositions[el];
    if (!pos) return;
    layoutDragRef.current = { el, startMX: e.clientX, startMY: e.clientY, startElX: pos.x, startElY: pos.y };
    const onMove = (ev: MouseEvent) => {
      const d = layoutDragRef.current;
      if (!d) return;
      setLayoutPositions(prev => ({
        ...prev,
        [d.el]: { x: d.startElX + (ev.clientX - d.startMX), y: d.startElY + (ev.clientY - d.startMY) },
      }));
    };
    const onUp = () => {
      layoutDragRef.current = null;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }, [layoutPositions]);

  const handleResizeMouseDown = useCallback((el: string, handle: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const pos = layoutPositions[el];
    if (!pos || pos.w === undefined || pos.h === undefined) return;
    resizeDragRef.current = { el, handle, startMX: e.clientX, startMY: e.clientY, startX: pos.x, startY: pos.y, startW: pos.w, startH: pos.h };
    const onMove = (ev: MouseEvent) => {
      const d = resizeDragRef.current;
      if (!d) return;
      const dx = ev.clientX - d.startMX;
      const dy = ev.clientY - d.startMY;
      let x = d.startX, y = d.startY, w = d.startW, h = d.startH;
      const minW = 80, minH = 30;
      switch (d.handle) {
        case "se": w = Math.max(minW, d.startW + dx); h = Math.max(minH, d.startH + dy); break;
        case "sw": { const nw = Math.max(minW, d.startW - dx); x = d.startX + (d.startW - nw); w = nw; h = Math.max(minH, d.startH + dy); break; }
        case "ne": { const nh = Math.max(minH, d.startH - dy); y = d.startY + (d.startH - nh); w = Math.max(minW, d.startW + dx); h = nh; break; }
        case "nw": { const nw2 = Math.max(minW, d.startW - dx); const nh2 = Math.max(minH, d.startH - dy); x = d.startX + (d.startW - nw2); y = d.startY + (d.startH - nh2); w = nw2; h = nh2; break; }
        case "e": w = Math.max(minW, d.startW + dx); break;
        case "w": { const nw3 = Math.max(minW, d.startW - dx); x = d.startX + (d.startW - nw3); w = nw3; break; }
        case "s": h = Math.max(minH, d.startH + dy); break;
        case "n": { const nh3 = Math.max(minH, d.startH - dy); y = d.startY + (d.startH - nh3); h = nh3; break; }
      }
      setLayoutPositions(prev => ({ ...prev, [d.el]: { x, y, w, h } }));
    };
    const onUp = () => { resizeDragRef.current = null; document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }, [layoutPositions]);

  function handleAddLink() {
    if (!newLinkUrl.trim()) return;
    let url = newLinkUrl.trim();
    if (!/^https?:\/\//i.test(url)) url = "https://" + url;
    try {
      const u = new URL(url);
      const name = newLinkTitle.trim() || u.hostname;
      setShortcuts((prev) => [...prev, { name, url, domain: u.hostname }]);
      setNewLinkTitle("");
      setNewLinkUrl("");
    } catch { /* invalid URL */ }
  }

  function handleImportBookmarks(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const html = ev.target?.result as string;
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const links = Array.from(doc.querySelectorAll("a[href]")) as HTMLAnchorElement[];
      const imported = links
        .filter((a) => /^https?:\/\//.test(a.getAttribute("href") || ""))
        .map((a) => {
          const href = a.getAttribute("href")!;
          try {
            const u = new URL(href);
            return { name: a.textContent?.trim() || u.hostname, url: href, domain: u.hostname };
          } catch { return null; }
        })
        .filter(Boolean) as { name: string; url: string; domain: string }[];
      if (imported.length > 0) setShortcuts((prev) => [...prev, ...imported]);
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  const qlFaviconSize = quickLinksSize === "small" ? 28 : quickLinksSize === "large" ? 52 : 40;
  const qlSzParam = quickLinksSize === "small" ? 32 : quickLinksSize === "large" ? 64 : 64;

  // Clock computed values
  const clockFontSize = `${40 + (clockSizeNum / 100) * 56}px`;
  const tz = timezone === "Automatic" ? undefined : timezone;

  function getTimeStr() {
    const opts: Intl.DateTimeFormatOptions = {
      hour: "2-digit", minute: "2-digit",
      hour12: twelveHourTime,
      ...(showSeconds ? { second: "2-digit" } : {}),
      ...(tz ? { timeZone: tz } : {}),
    };
    return now.toLocaleTimeString([], opts);
  }

  function getTimeParts() {
    const full = getTimeStr();
    const match = full.match(/^(.*?)\s*(AM|PM)$/i);
    if (match) return { digits: match[1].trim(), ampm: match[2].toUpperCase() };
    return { digits: full, ampm: null };
  }

  function getDateStr() {
    const opts: Intl.DateTimeFormatOptions =
      dateFormat === "month-day-year" ? { year: "numeric", month: "long", day: "numeric", ...(tz ? { timeZone: tz } : {}) }
      : dateFormat === "dd-mm-yyyy" ? { year: "numeric", month: "2-digit", day: "2-digit", ...(tz ? { timeZone: tz } : {}) }
      : { weekday: "long", month: "long", day: "numeric", ...(tz ? { timeZone: tz } : {}) };
    return now.toLocaleDateString([], opts);
  }

  // Sidebar styling helpers
  const cardBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.035)";
  const rowBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const selectBg = isDark ? "#252540" : "#f0f0f5";
  const selectColor = themeColor;
  const selectBorder = isDark ? "#3a3a5c" : "#dde0e8";

  const hasPersistedLayout = activeSlot !== "main" && Object.values(persistedPositions).some(p => p !== null);

  // search always gets a higher z-index so its dropdowns float above shortcuts
  const BASE_Z: Record<string, number> = { search: 20, clock: 5, shortcuts: 5, pomodoro: 5 };

  function layoutElStyle(key: string): React.CSSProperties {
    const base = BASE_Z[key] ?? 5;
    if (layoutMode) {
      const pos = layoutPositions[key];
      if (!pos) return {};
      return {
        position: "absolute", left: pos.x, top: pos.y,
        zIndex: activeLayoutEl === key ? base + 15 : base,
        overflow: "visible",
        ...(pos.w !== undefined ? { width: pos.w } : {}),
        ...(pos.h !== undefined ? { height: pos.h } : {}),
      };
    }
    const pos = persistedPositions[key];
    if (!pos) return {};
    return {
      position: "absolute", left: pos.x, top: pos.y, zIndex: base,
      ...(pos.w !== undefined ? { width: pos.w } : {}),
      ...(pos.h !== undefined ? { height: pos.h } : {}),
    };
  }

  const RH_LIST = ["nw","n","ne","e","se","s","sw","w"] as const;
  const renderResizeHandles = (_el: string) => null;

  return (
    <div className={`app-shell${showSettings ? " sidebar-open" : ""}`}>
    <div className="app-root" style={{
      background: (bgType === "images" && bgImageSelected) ? undefined : (bgType === "color") ? bgColor : (isDark ? "#1a1a2e" : "#f5f4f0"),
      backgroundImage: (bgType === "images" && bgImageSelected) ? `url(${bgImageSelected}?w=1920&h=1080&fit=crop&q=90)` : undefined,
      backgroundSize: (bgType === "images" && bgImageSelected) ? "cover" : undefined,
      backgroundPosition: (bgType === "images" && bgImageSelected) ? "center" : undefined,
      color: textColor,
    }}>
      {layoutMode && (
        <div className="layout-mode-banner">
          <div className="layout-mode-banner-left">
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm13 2v-2h-2v2h-2v2h2v2h2v-2h2v-2z"/></svg>
            <span>Page Layout — Click any element to select and drag it</span>
          </div>
          <div className="layout-mode-banner-right">
            <button className="layout-reset-btn" onClick={resetLayout}>Reset</button>
            <button className="layout-done-btn" onClick={exitLayoutMode}>Done</button>
          </div>
        </div>
      )}
      <div className="top-bar">
        <span className="top-link" style={{ color: fontColor ? fontColor : (isDark ? "#aab" : "#444") }}>{t.gmail}</span>
        <span className="top-link" style={{ color: fontColor ? fontColor : (isDark ? "#aab" : "#444") }}>{t.images}</span>
        <div className="avatar">S</div>
      </div>

      <main ref={mainRef} className={`main-content${(layoutMode || hasPersistedLayout) ? " layout-has-absolute" : ""}${layoutMode ? " layout-mode-active" : ""}`} onClick={() => { if (layoutMode) setActiveLayoutEl(null); }}>
        {clockEnabled && (
          <div ref={clockRef} className={`clock-area${layoutMode ? " layout-el" + (activeLayoutEl === "clock" ? " layout-el-active" : "") : ""}`}
            style={layoutElStyle("clock")}
            onMouseDown={layoutMode ? (e) => handleLayoutMouseDown("clock", e) : undefined}
            onClick={layoutMode ? (e) => e.stopPropagation() : undefined}>
            {renderResizeHandles("clock")}
            {(clockShow === "both" || clockShow === "clock") && analogClock ? (
              <AnalogClock
                now={now}
                tz={tz}
                size={40 + (clockSizeNum / 100) * 160}
                shape={clockShape}
                face={clockFace}
                hands={clockHands}
                isDark={isDark}
                bgOpacity={clockBgOpacity}
                borderOpacity={clockBorderOpacity}
              />
            ) : (clockShow === "both" || clockShow === "clock") ? (
              <div className="clock-time" style={{
                fontSize: clockFontSize,
                color: textColor,
                position: "relative",
                display: "inline-flex",
                alignItems: (amPmPosition === "top-left" || amPmPosition === "top-right") ? "flex-start" : "flex-end",
                flexDirection: (amPmPosition === "bottom-left" || amPmPosition === "top-left") ? "row-reverse" : "row",
              }}>
                <span>{getTimeParts().digits}</span>
                {showAmPm && getTimeParts().ampm && (
                  <span style={{
                    fontSize: `calc(${clockFontSize} * 0.22)`,
                    fontWeight: 400,
                    lineHeight: 1,
                    ...((amPmPosition === "top-left" || amPmPosition === "top-right") ? { marginTop: `calc(${clockFontSize} * 0.08)` } : { marginBottom: `calc(${clockFontSize} * 0.08)` }),
                    ...((amPmPosition === "bottom-left" || amPmPosition === "top-left") ? { marginRight: "4px" } : { marginLeft: "4px" }),
                    opacity: 0.7,
                    letterSpacing: "0.5px",
                  }}>
                    {getTimeParts().ampm}
                  </span>
                )}
              </div>
            ) : null}
            {(clockShow === "both" || clockShow === "date") && (
              <div className="clock-date" style={{ color: fontColor ? fontColor : (isDark ? "#8899aa" : "#666"), fontSize: `${10 + (dateSizeNum / 100) * 18}px` }}>
                {getDateStr()}
              </div>
            )}
          </div>
        )}

        {(pomodoroEnabled || countdownEnabled) && (
          <div ref={pomodoroRef}
            className={`pomodoro-card${layoutMode ? " layout-el" + (activeLayoutEl === "pomodoro" ? " layout-el-active" : "") : ""}`}
            style={layoutElStyle("pomodoro")}
            onMouseDown={layoutMode ? (e) => handleLayoutMouseDown("pomodoro", e) : undefined}
            onClick={layoutMode ? (e) => e.stopPropagation() : undefined}>
            {renderResizeHandles("pomodoro")}
            {!countdownEnabled && (<>
              {!pomodoroRunning && (
              <div className="pomo-tabs">
                {([["pomodoro","Pomodoro"],["break","Break"],["longbreak","Long break"]] as const).map(([m,label]) => (
                  <button key={m} className={`pomo-tab${pomodoroMode === m ? " active" : ""}`}
                    onClick={() => handlePomodoroMode(m)}
                    style={{ color: pomodoroMode === m ? "#fff" : (fontColor || (isDark ? "#bbc" : "#666")), background: pomodoroMode === m ? (isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)") : "transparent" }}>
                    {label}
                  </button>
                ))}
              </div>
              )}
              <div className="pomo-time" style={{ color: textColor }}>
                {/* Hours — shown while paused/editing so user can click it; hidden when running and hours=0 */}
                {(!pomodoroRunning || Math.floor(pomodoroSeconds / 3600) > 0) && (<>
                  {pomodoroEditingPart === "hr" ? (
                    <input ref={pomodoroEditRef} type="number" min={0} max={99} value={pomodoroEditVal}
                      className="pomo-inline-input"
                      style={{ color: textColor, borderColor: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.25)", background: "transparent" }}
                      onChange={(e) => setPomodoroEditVal(e.target.value)}
                      onBlur={() => { const v = Math.max(0, Math.min(99, parseInt(pomodoroEditVal) || 0)); setPomodoroSeconds(v * 3600 + (pomodoroSeconds % 3600)); setPomodoroRunning(false); setPomodoroEditingPart(null); }}
                      onKeyDown={(e) => { if (e.key === "Enter") { const v = Math.max(0, Math.min(99, parseInt(pomodoroEditVal) || 0)); setPomodoroSeconds(v * 3600 + (pomodoroSeconds % 3600)); setPomodoroRunning(false); setPomodoroEditingPart(null); } if (e.key === "Escape") setPomodoroEditingPart(null); }}
                      autoFocus />
                  ) : (
                    <span className={!pomodoroRunning ? "pomo-part-clickable" : ""}
                      onClick={() => { if (!pomodoroRunning) { setPomodoroEditVal(String(Math.floor(pomodoroSeconds / 3600)).padStart(2,"0")); setPomodoroEditingPart("hr"); } }}>
                      {String(Math.floor(pomodoroSeconds / 3600)).padStart(2,"0")}
                    </span>
                  )}
                  <span>:</span>
                </>)}
                {/* Minutes */}
                {pomodoroEditingPart === "min" ? (
                  <input ref={pomodoroEditRef} type="number" min={0} max={59} value={pomodoroEditVal}
                    className="pomo-inline-input"
                    style={{ color: textColor, borderColor: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.25)", background: "transparent" }}
                    onChange={(e) => setPomodoroEditVal(e.target.value)}
                    onBlur={() => { const v = Math.max(0, Math.min(59, parseInt(pomodoroEditVal) || 0)); const h = Math.floor(pomodoroSeconds / 3600); setPomodoroSeconds(h * 3600 + v * 60 + (pomodoroSeconds % 60)); setPomodoroRunning(false); setPomodoroEditingPart(null); }}
                    onKeyDown={(e) => { if (e.key === "Enter") { const v = Math.max(0, Math.min(59, parseInt(pomodoroEditVal) || 0)); const h = Math.floor(pomodoroSeconds / 3600); setPomodoroSeconds(h * 3600 + v * 60 + (pomodoroSeconds % 60)); setPomodoroRunning(false); setPomodoroEditingPart(null); } if (e.key === "Escape") setPomodoroEditingPart(null); }}
                    autoFocus />
                ) : (
                  <span className={!pomodoroRunning ? "pomo-part-clickable" : ""}
                    onClick={() => { if (!pomodoroRunning) { setPomodoroEditVal(String(Math.floor((pomodoroSeconds % 3600) / 60)).padStart(2,"0")); setPomodoroEditingPart("min"); } }}>
                    {String(Math.floor((pomodoroSeconds % 3600) / 60)).padStart(2,"0")}
                  </span>
                )}
                <span>:</span>
                {/* Seconds */}
                {pomodoroEditingPart === "sec" ? (
                  <input ref={pomodoroEditRef} type="number" min={0} max={59} value={pomodoroEditVal}
                    className="pomo-inline-input"
                    style={{ color: textColor, borderColor: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.25)", background: "transparent" }}
                    onChange={(e) => setPomodoroEditVal(e.target.value)}
                    onBlur={() => { const v = Math.max(0, Math.min(59, parseInt(pomodoroEditVal) || 0)); setPomodoroSeconds(Math.floor(pomodoroSeconds / 60) * 60 + v); setPomodoroRunning(false); setPomodoroEditingPart(null); }}
                    onKeyDown={(e) => { if (e.key === "Enter") { const v = Math.max(0, Math.min(59, parseInt(pomodoroEditVal) || 0)); setPomodoroSeconds(Math.floor(pomodoroSeconds / 60) * 60 + v); setPomodoroRunning(false); setPomodoroEditingPart(null); } if (e.key === "Escape") setPomodoroEditingPart(null); }}
                    autoFocus />
                ) : (
                  <span className={!pomodoroRunning ? "pomo-part-clickable" : ""}
                    onClick={() => { if (!pomodoroRunning) { setPomodoroEditVal(String(pomodoroSeconds % 60).padStart(2,"0")); setPomodoroEditingPart("sec"); } }}>
                    {String(pomodoroSeconds % 60).padStart(2,"0")}
                  </span>
                )}
              </div>
              <div className="pomo-controls">
                <button className="pomo-btn pomo-play" onClick={() => setPomodoroRunning(r => !r)}
                  style={{ color: textColor, borderColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)" }}>
                  {pomodoroRunning ? (
                    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M8 5v14l11-7z"/></svg>
                  )}
                </button>
                <button className="pomo-btn pomo-reset" onClick={() => { setPomodoroRunning(false); handlePomodoroMode(pomodoroMode); }}
                  style={{ color: textColor, borderColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)" }}>
                  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>
                </button>
                <div className="pomo-focus-wrap">
                  <button className={`toggle${pomodoroFocus ? " on" : ""}`} onClick={() => setPomodoroFocus(f => !f)} aria-label="Focus mode" />
                  <span className="pomo-focus-label" style={{ color: fontColor ? fontColor : (isDark ? "#bbc" : "#666") }}>Focus</span>
                </div>
              </div>
              {(!pomodoroRunning || pomodoroTask.trim()) && (
              <input
                className="pomo-task-input"
                type="text"
                placeholder="What are you working on?"
                value={pomodoroTask}
                onChange={(e) => setPomodoroTask(e.target.value)}
                style={{ background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)", color: textColor, borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}
              />
              )}
            </>)}

            {countdownEnabled && (
              <>
                <div className="cd-header" style={{ color: fontColor ? fontColor : (isDark ? "#bbc" : "#666") }}>Stopwatch</div>
                <div className="cd-display">
                  {cdH > 0 && (
                    <div className="cd-segment">
                      <span className="cd-value" style={{ color: textColor }}>{String(cdH).padStart(2,"0")}</span>
                      <span className="cd-label" style={{ color: fontColor ? fontColor : (isDark ? "#8899aa" : "#888") }}>Hrs</span>
                    </div>
                  )}
                  {cdH > 0 && <span className="cd-sep" style={{ color: textColor }}>:</span>}
                  <div className="cd-segment">
                    <span className="cd-value" style={{ color: textColor }}>{String(cdM).padStart(2,"0")}</span>
                    <span className="cd-label" style={{ color: fontColor ? fontColor : (isDark ? "#8899aa" : "#888") }}>Min</span>
                  </div>
                  <span className="cd-sep" style={{ color: textColor }}>:</span>
                  <div className="cd-segment">
                    <span className="cd-value" style={{ color: textColor }}>{String(cdS).padStart(2,"0")}</span>
                    <span className="cd-label" style={{ color: fontColor ? fontColor : (isDark ? "#8899aa" : "#888") }}>Sec</span>
                  </div>
                  <span className="cd-sep cd-sep-small" style={{ color: textColor }}>.</span>
                  <div className="cd-segment">
                    <span className="cd-value cd-value-small" style={{ color: textColor }}>{String(cdMs).padStart(2,"0")}</span>
                    <span className="cd-label" style={{ color: fontColor ? fontColor : (isDark ? "#8899aa" : "#888") }}>cs</span>
                  </div>
                </div>
                <div className="pomo-controls">
                  <button className="pomo-btn pomo-play" onClick={() => setCountdownRunning(r => !r)}
                    style={{ color: textColor, borderColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)" }}>
                    {countdownRunning ? (
                      <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M8 5v14l11-7z"/></svg>
                    )}
                  </button>
                  <button className="pomo-btn pomo-reset" onClick={() => { setCountdownRunning(false); setCountdownElapsed(0); }}
                    style={{ color: textColor, borderColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)" }}>
                    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>
                  </button>
                </div>
              </>
            )}

          </div>
        )}

        {searchBarEnabled && (
        <div ref={searchSectionRef}
          className={`search-section${layoutMode ? " layout-el" + (activeLayoutEl === "search" ? " layout-el-active" : "") : ""}`}
          style={{ ...layoutElStyle("search"), maxWidth: `${searchBarWidth}%`, width: "100%" }}
          onMouseDown={layoutMode ? (e) => handleLayoutMouseDown("search", e) : undefined}
          onClick={layoutMode ? (e) => e.stopPropagation() : undefined}>
          {renderResizeHandles("search")}
          {layoutMode && <div style={{ position: "absolute", inset: 0, zIndex: 10, cursor: "move", borderRadius: "inherit" }} onMouseDown={(e) => handleLayoutMouseDown("search", e)} onClick={(e) => e.stopPropagation()} />}
          <div className="search-bar-row" ref={dropdownRef}>
            <div
              className="search-input-box"
              style={{
                borderColor: engineColorEffect ? selectedEngine.color : (isDark ? "#3a3a5c" : "#dde0e8"),
                boxShadow: engineColorEffect
                  ? `0 0 0 3px ${selectedEngine.color}22, 0 2px 8px rgba(0,0,0,0.07)`
                  : `0 2px 8px rgba(0,0,0,0.07)`,
                background: isDark
                  ? `rgba(37,37,64,${searchBarBgOpacity / 100})`
                  : `rgba(255,255,255,${searchBarBgOpacity / 100})`,
              }}
            >
              <div className="engine-pill" onClick={() => setShowDropdown(!showDropdown)} title={selectedEngine.name}>
                <img src={`https://www.google.com/s2/favicons?domain=${selectedEngine.domain}&sz=64`} alt={selectedEngine.name} className="engine-pill-favicon" />
              </div>
              <span className="engine-divider" style={{ background: isDark ? "#3a3a5c" : "#dde0e8" }} />
              <input
                ref={inputRef}
                type="text"
                className="search-input"
                placeholder={searchBarPlaceholder || `${t.searchPlaceholder} ${selectedEngine.name}...`}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setShowSuggestions(searchSuggestionsEnabled && e.target.value.length > 0); }}
                onFocus={() => setShowSuggestions(searchSuggestionsEnabled && query.length > 0)}
                onKeyDown={handleKeyDown}
                autoComplete="off"
                style={{ color: textColor }}
              />
              <div className="input-right-actions">
                {query && (
                  <>
                    <button className="input-icon-btn" onClick={() => { setQuery(""); setShowSuggestions(false); inputRef.current?.focus(); }} title="Clear">
                      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                    </button>
                    <span className="input-divider" />
                  </>
                )}
                <button className="input-icon-btn" title="Voice Search" onClick={() => alert("Voice search coming soon!")}>
                  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 15c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3z"/><path d="M17 12c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-2.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
                </button>
                <button className="input-icon-btn" title="Image Search" onClick={() => window.open("https://lens.google.com", "_blank")}>
                  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M9.5 6.5v3h-3v-3h3M11 5H5v6h6V5zm-1.5 9.5v3h-3v-3h3M11 13H5v6h6v-6zm6.5-6.5v3h-3v-3h3M19 5h-6v6h6V5zm-6 8h1.5v1.5H13V13zm1.5 1.5H16V16h-1.5v-1.5zM16 13h1.5v1.5H16V13zm-3 3h1.5v1.5H13V16zm1.5 1.5H16V19h-1.5v-1.5zM16 16h1.5v1.5H16V16zm1.5-1.5H19V16h-1.5v-1.5zm0 3H19V19h-1.5v-1.5zM22 7h-2V4h-3V2h5v5zm0 15v-5h-2v3h-3v2h5zM2 22h5v-2H4v-3H2v5zM2 2v5h2V4h3V2H2z"/></svg>
                </button>
              </div>
              {showSuggestions && suggestions.length > 0 && (
                <div className="suggestions-dropdown" style={{ background: isDark ? "rgba(30,30,50,0.92)" : "rgba(255,255,255,0.18)" }}>
                  {suggestions.map((s) => (
                    <div key={s} className="suggestion-item" style={{ color: textColor }} onClick={() => { setQuery(s); handleSearch(s); }}>
                      <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" style={{ opacity: 0.4, flexShrink: 0 }}><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {showDropdown && (
              <div className="engine-dropdown" style={{ background: isDark ? "#252540" : "#ffffff", borderColor: isDark ? "#3a3a5c" : "#dde0e8" }}>
                <p className="dropdown-label">Search with:</p>
                {engines.map((engine) => (
                  <div key={engine.name} className={`dropdown-item ${selectedEngine.name === engine.name ? "active" : ""}`} style={{ color: textColor }} onClick={() => { setSelectedEngine(engine); setShowDropdown(false); inputRef.current?.focus(); }}>
                    <img src={`https://www.google.com/s2/favicons?domain=${engine.domain}&sz=32`} alt={engine.name} className="dropdown-favicon" />
                    <span>{engine.name}</span>
                    {selectedEngine.name === engine.name && <span className="check">✓</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        )}

        {showShortcuts && (
          <div ref={shortcutsSectionRef}
            className={`shortcuts-section${layoutMode ? " layout-el" + (activeLayoutEl === "shortcuts" ? " layout-el-active" : "") : ""}`}
            style={layoutElStyle("shortcuts")}
            onMouseDown={layoutMode ? (e) => handleLayoutMouseDown("shortcuts", e) : undefined}
            onClick={layoutMode ? (e) => e.stopPropagation() : undefined}>
            {renderResizeHandles("shortcuts")}
            {layoutMode && <div style={{ position: "absolute", inset: 0, zIndex: 10, cursor: "move", borderRadius: "inherit" }} onMouseDown={(e) => handleLayoutMouseDown("shortcuts", e)} onClick={(e) => e.stopPropagation()} />}
            <h3 className="shortcuts-title" style={{ color: fontColor ? fontColor : (isDark ? "#667799" : "#9aa0b2") }}>{t.quickAccess}</h3>
            <div className="shortcuts-grid" style={{ gap: quickLinksStyle === "text" ? "8px" : "12px", gridTemplateColumns: `repeat(${quickLinksPerRow}, max-content)` }}>
              {shortcuts.filter(s => !shortcutPositions[s.name] && freeDragState?.name !== s.name).map((s) => (
                <a key={s.name}
                  className={`shortcut-card${quickLinksStyle === "text" ? " shortcut-card--text" : ""}`}
                  onMouseDown={(e) => handleShortcutMouseDown(e, s.name)}
                  onClick={(e) => e.preventDefault()}
                  onDoubleClick={() => { window.open(s.url, quickLinksOpenNewTab ? "_blank" : "_self"); }}
                  style={{ cursor: "grab" }}
                >
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${s.domain}&sz=${qlSzParam}`}
                    alt={s.name} title={s.name}
                    style={{ width: qlFaviconSize, height: qlFaviconSize, objectFit: "contain", borderRadius: quickLinksIconRadius, flexShrink: 0 }}
                  />
                  {quickLinksStyle === "text" && (
                    <span className="shortcut-label" style={{ color: fontColor ? fontColor : (isDark ? "#c8cce0" : "#444") }}>{s.name}</span>
                  )}
                </a>
              ))}
            </div>
          </div>
        )}
      </main>

      {showShortcuts && shortcuts.filter(s => shortcutPositions[s.name] || freeDragState?.name === s.name).map((s) => {
        const pos = freeDragState?.name === s.name ? freeDragState : shortcutPositions[s.name];
        if (!pos) return null;
        const isDraggingThis = freeDragState?.name === s.name;
        return (
          <a key={`free-${s.name}`}
            className={`shortcut-card shortcut-card-free${quickLinksStyle === "text" ? " shortcut-card--text" : ""}${isDraggingThis ? " free-dragging" : ""}`}
            style={{
              position: "fixed",
              left: pos.x,
              top: pos.y,
              zIndex: isDraggingThis ? 9999 : 100,
              cursor: isDraggingThis ? "grabbing" : "grab",
              userSelect: "none",
            }}
            onMouseDown={(e) => handleShortcutMouseDown(e, s.name)}
            onClick={(e) => e.preventDefault()}
            onDoubleClick={() => { window.open(s.url, quickLinksOpenNewTab ? "_blank" : "_self"); }}
          >
            <img
              src={`https://www.google.com/s2/favicons?domain=${s.domain}&sz=${qlSzParam}`}
              alt={s.name} title={s.name}
              style={{ width: qlFaviconSize, height: qlFaviconSize, objectFit: "contain", borderRadius: quickLinksIconRadius, flexShrink: 0 }}
              draggable={false}
            />
            {quickLinksStyle === "text" && (
              <span className="shortcut-label" style={{ color: fontColor ? fontColor : (isDark ? "#c8cce0" : "#444") }}>{s.name}</span>
            )}
          </a>
        );
      })}

      <div className={`fab-zone${hideFab ? " fab-hidden" : ""}${showSettings ? " fab-invisible" : ""}`}>
        <button id="settings-fab" className="settings-fab" onClick={() => setShowSettings(!showSettings)} title="Customize"
          style={{ background: isDark ? "#252540" : "#fff", boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.4)" : "0 4px 20px rgba(0,0,0,0.15)" }}>
          <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" style={{ color: isDark ? "#aab" : "#555" }}>
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
          </svg>
        </button>
      </div>
    </div>

    {/* Settings Sidebar */}
    <div ref={settingsRef} className={`settings-sidebar${showSettings ? " open" : ""}`}
      style={{ background: isDark ? "#1e1e38" : "#ffffff", color: themeColor, borderLeftColor: isDark ? "#2a2a44" : "#e8e8e4" }}>
    <div className="settings-scroll-wrapper">
      <div className="settings-header">
        <span className="settings-title">{t.customize}</span>
        <button className="settings-close" onClick={() => setShowSettings(false)} style={{ color: isDark ? "#aab" : "#666" }}>
          <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        </button>
      </div>

      <div className="settings-body">

        {/* ── General Card ── */}
        <p className="settings-section-label">{t.general}</p>
        <div className="settings-card" style={{ background: cardBg }}>
          <div className="settings-row" style={{ opacity: 0.42, cursor: "not-allowed" }}>
            <span className="settings-row-label">{t.showAllSettings}</span>
            <button className="toggle" disabled aria-label="Show all settings" tabIndex={-1} />
          </div>
          <div className="settings-row" style={{ borderTop: `1px solid ${rowBorder}` }}>
            <span className="settings-row-label">{t.language}</span>
            <select className="settings-select" value={language} onChange={(e) => setLanguage(e.target.value)}
              style={{ background: selectBg, color: selectColor, borderColor: selectBorder }}>
              {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
          </div>
          <div className="settings-row" style={{ borderTop: `1px solid ${rowBorder}` }}>
            <span className="settings-row-label">{t.darkMode}</span>
            <select className="settings-select" value={darkModeOption} onChange={(e) => setDarkModeOption(e.target.value as "system" | "light" | "dark")}
              style={{ background: selectBg, color: selectColor, borderColor: selectBorder }}>
              <option value="system">{t.system}</option>
              <option value="light">{t.light}</option>
              <option value="dark">{t.dark}</option>
            </select>
          </div>
          <div className="settings-row" style={{ borderTop: `1px solid ${rowBorder}`, opacity: 0.42, cursor: "not-allowed" }}>
            <span className="settings-row-label">{t.tabAppearance}</span>
            <span className="settings-row-badge">Soon</span>
          </div>
          <div className="settings-row" style={{ borderTop: `1px solid ${rowBorder}` }}>
            <span className="settings-row-label">{t.hideSettingsIcon}</span>
            <button className={`toggle${hideFab ? " on" : ""}`} onClick={() => setHideFab(!hideFab)} aria-label="Hide settings icon" />
          </div>
        </div>

        {/* ── Time & Date Card ── */}
        <p className="settings-section-label" style={{ marginTop: 12 }}>{t.timeAndDate}</p>
        <div className="settings-card" style={{ background: cardBg }}>

          <div className="settings-row">
            <span className="settings-row-label">{t.enable}</span>
            <button className={`toggle${clockEnabled ? " on" : ""}`} onClick={() => setClockEnabled(!clockEnabled)} aria-label="Enable clock" />
          </div>

          <div className={`settings-row${!clockEnabled ? " settings-row-dimmed" : ""}`} style={{ borderTop: `1px solid ${rowBorder}` }}>
            <span className="settings-row-label">{t.showSeconds}</span>
            <button className={`toggle${showSeconds ? " on" : ""}`} onClick={() => setShowSeconds(!showSeconds)} disabled={!clockEnabled} aria-label="Show seconds" />
          </div>

          <div className={`settings-row${!clockEnabled ? " settings-row-dimmed" : ""}`} style={{ borderTop: `1px solid ${rowBorder}` }}>
            <span className="settings-row-label">{t.twelveHourTime}</span>
            <button className={`toggle${twelveHourTime ? " on" : ""}`} onClick={() => setTwelveHourTime(!twelveHourTime)} disabled={!clockEnabled} aria-label="12-Hour Time" />
          </div>

          <div className={`settings-row${!clockEnabled || !twelveHourTime ? " settings-row-dimmed" : ""}`} style={{ borderTop: `1px solid ${rowBorder}` }}>
            <span className="settings-row-label">{t.showAmPm}</span>
            <button className={`toggle${showAmPm ? " on" : ""}`} onClick={() => setShowAmPm(!showAmPm)} disabled={!clockEnabled || !twelveHourTime} aria-label="Show AM/PM" />
          </div>

          <div className={`settings-row${!clockEnabled || !twelveHourTime || !showAmPm ? " settings-row-dimmed" : ""}`} style={{ borderTop: `1px solid ${rowBorder}` }}>
            <span className="settings-row-label">{t.amPmPosition}</span>
            <select className="settings-select" value={amPmPosition} onChange={(e) => setAmPmPosition(e.target.value)}
              disabled={!clockEnabled || !twelveHourTime || !showAmPm} style={{ background: selectBg, color: selectColor, borderColor: selectBorder }}>
              <option value="top-left">{t.topLeft}</option>
              <option value="top-right">{t.topRight}</option>
              <option value="bottom-left">{t.bottomLeft}</option>
              <option value="bottom-right">{t.bottomRight}</option>
            </select>
          </div>

          <div className={`settings-row${!clockEnabled ? " settings-row-dimmed" : ""}`} style={{ borderTop: `1px solid ${rowBorder}` }}>
            <span className="settings-row-label">{t.analogClock}</span>
            <button className={`toggle${analogClock ? " on" : ""}`} onClick={() => setAnalogClock(!analogClock)} disabled={!clockEnabled} aria-label="Analog clock" />
          </div>

          {analogClock && (
            <>
              <div className={`settings-row${!clockEnabled ? " settings-row-dimmed" : ""}`} style={{ borderTop: `1px solid ${rowBorder}` }}>
                <span className="settings-row-label">{t.clockShape}</span>
                <select className="settings-select" value={clockShape} onChange={(e) => setClockShape(e.target.value)}
                  disabled={!clockEnabled} style={{ background: selectBg, color: selectColor, borderColor: selectBorder }}>
                  <option value="round">Round</option>
                  <option value="square">Square</option>
                  <option value="rectangle">Rectangle</option>
                </select>
              </div>

              <div className={`settings-row${!clockEnabled ? " settings-row-dimmed" : ""}`} style={{ borderTop: `1px solid ${rowBorder}` }}>
                <span className="settings-row-label">{t.clockFace}</span>
                <select className="settings-select" value={clockFace} onChange={(e) => setClockFace(e.target.value)}
                  disabled={!clockEnabled} style={{ background: selectBg, color: selectColor, borderColor: selectBorder }}>
                  <option value="none">None</option>
                  <option value="classic">Classic</option>
                  <option value="minimal">Minimal</option>
                </select>
              </div>

              <div className={`settings-row${!clockEnabled ? " settings-row-dimmed" : ""}`} style={{ borderTop: `1px solid ${rowBorder}` }}>
                <span className="settings-row-label">{t.clockHands}</span>
                <select className="settings-select" value={clockHands} onChange={(e) => setClockHands(e.target.value)}
                  disabled={!clockEnabled} style={{ background: selectBg, color: selectColor, borderColor: selectBorder }}>
                  <option value="modern">Modern</option>
                  <option value="classic">Classic</option>
                  <option value="thin">Thin</option>
                </select>
              </div>

              <div className={`settings-row settings-row-col${!clockEnabled ? " settings-row-dimmed" : ""}`} style={{ borderTop: `1px solid ${rowBorder}` }}>
                <span className="settings-row-label">{t.clockBackground}</span>
                <div className="settings-slider-row">
                  <input type="range" className="settings-slider" min={0} max={100} value={clockBgOpacity}
                    onChange={(e) => setClockBgOpacity(Number(e.target.value))} disabled={!clockEnabled} />
                  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" style={{ opacity: 0.5, flexShrink: 0 }}>
                    <path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z"/>
                  </svg>
                </div>
              </div>

              <div className={`settings-row settings-row-col${!clockEnabled ? " settings-row-dimmed" : ""}`} style={{ borderTop: `1px solid ${rowBorder}` }}>
                <span className="settings-row-label">{t.clockBorder}</span>
                <div className="settings-slider-row">
                  <input type="range" className="settings-slider" min={0} max={100} value={clockBorderOpacity}
                    onChange={(e) => setClockBorderOpacity(Number(e.target.value))} disabled={!clockEnabled} />
                  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" style={{ opacity: 0.5, flexShrink: 0 }}>
                    <path d="M3 3h18v18H3V3zm2 2v14h14V5H5z"/>
                  </svg>
                </div>
              </div>
            </>
          )}

          <div className={`settings-row settings-row-col${!clockEnabled ? " settings-row-dimmed" : ""}`} style={{ borderTop: `1px solid ${rowBorder}` }}>
            <span className="settings-row-label">{t.clockSize}</span>
            <div className="settings-slider-row">
              <input type="range" className="settings-slider" min={0} max={100} value={clockSizeNum}
                onChange={(e) => setClockSizeNum(Number(e.target.value))} disabled={!clockEnabled} />
            </div>
          </div>

          <div className={`settings-row${!clockEnabled ? " settings-row-dimmed" : ""}`} style={{ borderTop: `1px solid ${rowBorder}` }}>
            <span className="settings-row-label">{t.dateFormat}</span>
            <select className="settings-select" value={dateFormat} onChange={(e) => setDateFormat(e.target.value)}
              disabled={!clockEnabled} style={{ background: selectBg, color: selectColor, borderColor: selectBorder }}>
              <option value="day-month-date">{t.dayMonthDate}</option>
              <option value="month-day-year">{t.monthDayYear}</option>
              <option value="dd-mm-yyyy">{t.ddmmyyyy}</option>
            </select>
          </div>

          <div className={`settings-row settings-row-col${!clockEnabled ? " settings-row-dimmed" : ""}`} style={{ borderTop: `1px solid ${rowBorder}` }}>
            <span className="settings-row-label">{t.dateSize}</span>
            <div className="settings-slider-row">
              <input type="range" className="settings-slider" min={0} max={100} value={dateSizeNum}
                onChange={(e) => setDateSizeNum(Number(e.target.value))} disabled={!clockEnabled} />
            </div>
          </div>

          <div className={`settings-row${!clockEnabled ? " settings-row-dimmed" : ""}`} style={{ borderTop: `1px solid ${rowBorder}` }}>
            <span className="settings-row-label">{t.worldClocks}</span>
            <button className={`toggle${worldClocks ? " on" : ""}`} onClick={() => setWorldClocks(!worldClocks)} disabled={!clockEnabled} aria-label="World clocks" />
          </div>

          <div className={`settings-row${!clockEnabled ? " settings-row-dimmed" : ""}`} style={{ borderTop: `1px solid ${rowBorder}` }}>
            <span className="settings-row-label">{t.timeZone}</span>
            <select className="settings-select" value={timezone} onChange={(e) => setTimezone(e.target.value)}
              disabled={!clockEnabled} style={{ background: selectBg, color: selectColor, borderColor: selectBorder }}>
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>{tz === "Automatic" ? t.automatic : tz.replace("_", " ")}</option>
              ))}
            </select>
          </div>

          <div className={`settings-row${!clockEnabled ? " settings-row-dimmed" : ""}`} style={{ borderTop: `1px solid ${rowBorder}` }}>
            <span className="settings-row-label">{t.show}</span>
            <select className="settings-select" value={clockShow} onChange={(e) => setClockShow(e.target.value as "both" | "clock" | "date")}
              disabled={!clockEnabled} style={{ background: selectBg, color: selectColor, borderColor: selectBorder }}>
              <option value="both">{t.clockAndDate}</option>
              <option value="clock">{t.clockOnly}</option>
              <option value="date">{t.dateOnly}</option>
            </select>
          </div>

        </div>

        {/* ── Quick Links Card ── */}
        <p className="settings-section-label" style={{ marginTop: 12 }}>{t.quickLinks}</p>
        <div className="settings-card" style={{ background: cardBg }}>

          <div className="settings-row">
            <span className="settings-row-label">{t.enable}</span>
            <button className={`toggle${showShortcuts ? " on" : ""}`} onClick={() => setShowShortcuts(!showShortcuts)} aria-label="Enable quick links" />
          </div>

          {/* Add link form */}
          <div className={`settings-row settings-row-col${!showShortcuts ? " settings-row-dimmed" : ""}`} style={{ borderTop: `1px solid ${rowBorder}` }}>
            <span className="settings-row-label">{t.addLink}</span>
            <div className="ql-add-form">
              <input
                className="ql-input"
                type="text"
                placeholder={t.titlePlaceholder}
                value={newLinkTitle}
                onChange={(e) => setNewLinkTitle(e.target.value)}
                disabled={!showShortcuts}
                style={{ background: isDark ? "#252540" : "#f0f0f5", color: themeColor, borderColor: isDark ? "#3a3a5c" : "#dde0e8" }}
              />
              <input
                className="ql-input"
                type="text"
                placeholder="https://"
                value={newLinkUrl}
                onChange={(e) => setNewLinkUrl(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleAddLink(); }}
                disabled={!showShortcuts}
                style={{ background: isDark ? "#252540" : "#f0f0f5", color: themeColor, borderColor: isDark ? "#3a3a5c" : "#dde0e8" }}
              />
              <button className="ql-add-btn" onClick={handleAddLink} disabled={!showShortcuts}
                style={{ background: isDark ? "#3a3a6a" : "#e0e2ef", color: isDark ? "#c8cce0" : "#444" }}>
                +
              </button>
            </div>
          </div>

          {/* Import bookmarks */}
          <div className={`settings-row${!showShortcuts ? " settings-row-dimmed" : ""}`} style={{ borderTop: `1px solid ${rowBorder}` }}>
            <span className="settings-row-label">{t.importBookmarks}</span>
            <button className="ql-import-btn" onClick={() => bookmarkInputRef.current?.click()} disabled={!showShortcuts}
              style={{ background: isDark ? "#3a3a6a" : "#e0e2ef", color: isDark ? "#c8cce0" : "#444" }}>
              {t.importBtn}
            </button>
            <input ref={bookmarkInputRef} type="file" accept=".html,.htm" style={{ display: "none" }} onChange={handleImportBookmarks} />
          </div>

          <div className={`settings-row${!showShortcuts ? " settings-row-dimmed" : ""}`} style={{ borderTop: `1px solid ${rowBorder}` }}>
            <span className="settings-row-label">{t.showGroups}</span>
            <button className={`toggle${quickLinksShowGroups ? " on" : ""}`} onClick={() => setQuickLinksShowGroups(!quickLinksShowGroups)} disabled={!showShortcuts} aria-label="Show groups" />
          </div>

          <div className={`settings-row${!showShortcuts ? " settings-row-dimmed" : ""}`} style={{ borderTop: `1px solid ${rowBorder}` }}>
            <span className="settings-row-label">{t.openInNewTab}</span>
            <button className={`toggle${quickLinksOpenNewTab ? " on" : ""}`} onClick={() => setQuickLinksOpenNewTab(!quickLinksOpenNewTab)} disabled={!showShortcuts} aria-label="Open in new tab" />
          </div>

          {/* Icon corner radius slider */}
          <div className={`settings-row settings-row-col${!showShortcuts ? " settings-row-dimmed" : ""}`} style={{ borderTop: `1px solid ${rowBorder}` }}>
            <span className="settings-row-label">{t.iconCornerRadius}</span>
            <div className="settings-slider-row">
              <input type="range" className="settings-slider" min={0} max={50} value={quickLinksIconRadius}
                onChange={(e) => setQuickLinksIconRadius(Number(e.target.value))} disabled={!showShortcuts} />
              <span style={{ fontSize: 11, opacity: 0.6, minWidth: 22, textAlign: "right" }}>{quickLinksIconRadius}</span>
            </div>
          </div>

          {/* Links per row slider */}
          <div className={`settings-row settings-row-col${!showShortcuts ? " settings-row-dimmed" : ""}`} style={{ borderTop: `1px solid ${rowBorder}` }}>
            <span className="settings-row-label">{t.linksPerRow}</span>
            <div className="settings-slider-row">
              <input type="range" className="settings-slider" min={3} max={12} value={quickLinksPerRow}
                onChange={(e) => setQuickLinksPerRow(Number(e.target.value))} disabled={!showShortcuts} />
              <span style={{ fontSize: 11, opacity: 0.6, minWidth: 22, textAlign: "right" }}>{quickLinksPerRow}</span>
            </div>
          </div>

          {/* Style picker */}
          <div className={`settings-row${!showShortcuts ? " settings-row-dimmed" : ""}`} style={{ borderTop: `1px solid ${rowBorder}` }}>
            <span className="settings-row-label">{t.linkStyle}</span>
            <div className="ql-style-picker">
              <button
                className={`ql-style-btn${quickLinksStyle === "icon" ? " active" : ""}`}
                onClick={() => setQuickLinksStyle("icon")} disabled={!showShortcuts}
                title="Icon only"
                style={{ background: quickLinksStyle === "icon" ? (isDark ? "#4a4a8a" : "#d0d4f0") : (isDark ? "#2a2a44" : "#e8eaf0"), color: themeColor }}
              >
                <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><rect x="2" y="2" width="16" height="16" rx="4"/></svg>
              </button>
              <button
                className={`ql-style-btn${quickLinksStyle === "text" ? " active" : ""}`}
                onClick={() => setQuickLinksStyle("text")} disabled={!showShortcuts}
                title="Icon + label"
                style={{ background: quickLinksStyle === "text" ? (isDark ? "#4a4a8a" : "#d0d4f0") : (isDark ? "#2a2a44" : "#e8eaf0"), color: themeColor }}
              >
                T
              </button>
            </div>
          </div>

          {/* Size picker */}
          <div className={`settings-row${!showShortcuts ? " settings-row-dimmed" : ""}`} style={{ borderTop: `1px solid ${rowBorder}` }}>
            <span className="settings-row-label">{t.linkStyle} / Size</span>
            <div className="ql-size-picker">
              {(["small", "medium", "large"] as const).map((s) => (
                <button key={s} onClick={() => setQuickLinksSize(s)} disabled={!showShortcuts}
                  className={`ql-size-btn${quickLinksSize === s ? " active" : ""}`}
                  style={{ background: quickLinksSize === s ? (isDark ? "#4a4a8a" : "#d0d4f0") : (isDark ? "#2a2a44" : "#e8eaf0"), color: themeColor }}>
                  {t[s]}
                </button>
              ))}
            </div>
          </div>

          {/* App Library */}
          <div className="settings-row" style={{ borderTop: `1px solid ${rowBorder}` }}>
            <span className="settings-row-label">APP Set name</span>
            <button
              className="import-bm-btn"
              style={{ background: isDark ? "#3a3a6a" : "#4285F4", color: "#fff" }}
              onClick={() => { setSelectedLibIds(new Set()); setShowLibraryModal(true); }}
            >
              {t.importBtn}
            </button>
          </div>

        </div>

        {/* ── Search Bar Card ── */}
        <p className="settings-section-label" style={{ marginTop: 12 }}>Search bar</p>
        <div className="settings-card" style={{ background: cardBg }}>

          <div className="settings-row">
            <span className="settings-row-label">Enable</span>
            <button className={`toggle${searchBarEnabled ? " on" : ""}`} onClick={() => setSearchBarEnabled(!searchBarEnabled)} aria-label="Enable search bar" />
          </div>

          <div className={`settings-row${!searchBarEnabled ? " settings-row-dimmed" : ""}`} style={{ borderTop: `1px solid ${rowBorder}` }}>
            <span className="settings-row-label">Suggestions</span>
            <button className={`toggle${searchSuggestionsEnabled ? " on" : ""}`} onClick={() => setSearchSuggestionsEnabled(!searchSuggestionsEnabled)} disabled={!searchBarEnabled} aria-label="Search suggestions" />
          </div>

          <div className={`settings-row${!searchBarEnabled ? " settings-row-dimmed" : ""}`} style={{ borderTop: `1px solid ${rowBorder}` }}>
            <span className="settings-row-label">Search engine</span>
            <select className="settings-select" value={selectedEngine.name} disabled={!searchBarEnabled}
              onChange={(e) => { const eng = engines.find(en => en.name === e.target.value); if (eng) setSelectedEngine(eng); }}
              style={{ background: selectBg, color: selectColor, borderColor: selectBorder }}>
              {engines.map(en => <option key={en.name} value={en.name}>{en.name}</option>)}
            </select>
          </div>

          <div className={`settings-row settings-row-col${!searchBarEnabled ? " settings-row-dimmed" : ""}`} style={{ borderTop: `1px solid ${rowBorder}` }}>
            <span className="settings-row-label">Placeholder text</span>
            <input
              type="text"
              className="ql-input"
              placeholder={`Search with ${selectedEngine.name}...`}
              value={searchBarPlaceholder}
              onChange={(e) => setSearchBarPlaceholder(e.target.value)}
              disabled={!searchBarEnabled}
              style={{ background: isDark ? "#252540" : "#f0f0f5", color: themeColor, borderColor: isDark ? "#3a3a5c" : "#dde0e8", width: "100%", marginTop: 6 }}
            />
          </div>

          <div className={`settings-row settings-row-col${!searchBarEnabled ? " settings-row-dimmed" : ""}`} style={{ borderTop: `1px solid ${rowBorder}` }}>
            <span className="settings-row-label">Width</span>
            <div className="settings-slider-row">
              <input type="range" className="settings-slider" min={30} max={100} value={searchBarWidth}
                onChange={(e) => setSearchBarWidth(Number(e.target.value))} disabled={!searchBarEnabled} />
              <span style={{ fontSize: 11, opacity: 0.6, minWidth: 28, textAlign: "right" }}>{searchBarWidth}%</span>
            </div>
          </div>

          <div className={`settings-row settings-row-col${!searchBarEnabled ? " settings-row-dimmed" : ""}`} style={{ borderTop: `1px solid ${rowBorder}` }}>
            <span className="settings-row-label">Background</span>
            <div className="settings-slider-row">
              <input type="range" className="settings-slider" min={0} max={100} value={searchBarBgOpacity}
                onChange={(e) => setSearchBarBgOpacity(Number(e.target.value))} disabled={!searchBarEnabled} />
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" style={{ opacity: 0.5, flexShrink: 0 }}>
                <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/>
              </svg>
            </div>
          </div>

        </div>

        {/* ── Background Card ── */}
        <p className="settings-section-label" style={{ marginTop: 12 }}>{t.background}</p>
        <div className="settings-card" style={{ background: cardBg }}>

          <div className="settings-row">
            <span className="settings-row-label">{t.backgroundType}</span>
            <select className="settings-select" value={bgType} onChange={(e) => setBgType(e.target.value as typeof bgType)}
              style={{ background: selectBg, color: selectColor, borderColor: selectBorder }}>
              <option value="none">{t.bgNone}</option>
              <option value="images">{t.bgImages}</option>
              <option value="color">{t.bgColorType}</option>
              <option value="gradient">{t.bgGradient}</option>
            </select>
          </div>

          {bgType === "color" && (
            <div className="bg-color-panel" style={{ borderTop: `1px solid ${rowBorder}`, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="bg-color-swatches">
                {[
                  "#f5f4f0","#ffffff","#1a1a2e","#0f0f1a","#12121f","#2d2d44",
                  "#1e3a5f","#0d2137","#1a3a2a","#0f2e1a","#3a1a1a","#2e1a3a",
                  "#e8f4fd","#fef9e7","#f0fef4","#fdf0f8","#fff3e0","#e8eaf6",
                  "#37474f","#4a4a6a","#5d4037","#1b5e20","#0d47a1","#4a148c",
                  "#b71c1c","#e65100","#f57f17","#33691e","#006064","#880e4f",
                ].map(c => (
                  <button
                    key={c}
                    className={`bg-color-dot${bgColor === c ? " active" : ""}`}
                    style={{ background: c, outline: bgColor === c ? "2px solid #5a7aff" : `1px solid ${isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)"}`, outlineOffset: bgColor === c ? 2 : 0 }}
                    onClick={() => setBgColor(c)}
                    title={c}
                  />
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: "0.75rem", opacity: 0.6, color: isDark ? "#c8cce0" : "#555" }}>Custom</span>
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  style={{ width: 36, height: 28, border: "none", borderRadius: 6, cursor: "pointer", padding: 2, background: "none" }}
                />
                <span style={{ fontSize: "0.72rem", fontFamily: "monospace", opacity: 0.55, color: isDark ? "#c8cce0" : "#555" }}>{bgColor}</span>
              </div>
            </div>
          )}

          {bgType === "images" && (
            <div className="bg-image-panel" style={{ borderTop: `1px solid ${rowBorder}` }}>
              {bgImageFolder === null ? (
                <div className="bg-folder-grid">
                  {BG_FOLDERS.map(folder => (
                    <div
                      key={folder.id}
                      className="bg-folder-card"
                      onClick={() => setBgImageFolder(folder.id)}
                      style={{ borderColor: isDark ? "#3a3a5c" : "#dde0e8" }}
                    >
                      <img
                        src={`${folder.photos[0]}?w=280&h=160&fit=crop&q=75`}
                        alt={folder.name}
                        className="bg-folder-thumb"
                      />
                      <div className="bg-folder-name" style={{ color: isDark ? "#c8cce0" : "#333" }}>
                        {folder.emoji} {folder.name}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <button
                    className="bg-back-btn"
                    onClick={() => setBgImageFolder(null)}
                    style={{ color: isDark ? "#aab" : "#555", background: "none", border: "none", cursor: "pointer", padding: "6px 0", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: 4 }}
                  >
                    ← {BG_FOLDERS.find(f => f.id === bgImageFolder)?.emoji} {BG_FOLDERS.find(f => f.id === bgImageFolder)?.name}
                  </button>
                  <div className="bg-image-grid">
                    {BG_FOLDERS.find(f => f.id === bgImageFolder)?.photos.map((photo, i) => {
                      const isActive = bgImageSelected === photo;
                      return (
                        <div
                          key={i}
                          className={`bg-image-thumb${isActive ? " active" : ""}`}
                          onClick={() => setBgImageSelected(isActive ? "" : photo)}
                          style={{ borderColor: isActive ? "#5a7aff" : (isDark ? "#3a3a5c" : "#dde0e8") }}
                        >
                          <img src={`${photo}?w=200&h=130&fit=crop&q=75`} alt="" className="bg-image-img" />
                          {isActive && <div className="bg-image-check">✓</div>}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

        </div>

        {/* ── Font Card ── */}
        <p className="settings-section-label" style={{ marginTop: 12 }}>{t.font}</p>
        <div className="settings-card" style={{ background: cardBg }}>

          {/* Font family row */}
          <div className="settings-row" style={{ position: "relative" }}>
            <span className="settings-row-label">{t.fontFamily}</span>
            <div className="font-family-row" style={{ position: "relative" }}>
              <input
                className="ql-input font-family-input"
                type="text"
                placeholder="Search font..."
                value={fontFamilyInput}
                onChange={(e) => { setFontFamilyInput(e.target.value); setFontDropdownOpen(true); }}
                onFocus={() => setFontDropdownOpen(true)}
                onBlur={() => setTimeout(() => setFontDropdownOpen(false), 150)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { setAppliedFontFamily(fontFamilyInput.trim()); setFontDropdownOpen(false); }
                  if (e.key === "Escape") setFontDropdownOpen(false);
                }}
                style={{ background: isDark ? "#252540" : "#f0f0f5", color: themeColor, borderColor: isDark ? "#3a3a5c" : "#dde0e8" }}
              />
              <button className="font-apply-btn"
                onClick={() => { setAppliedFontFamily(fontFamilyInput.trim()); setFontDropdownOpen(false); }}
                title="Apply font"
                style={{ background: isDark ? "#3a3a6a" : "#e0e2ef", color: isDark ? "#c8cce0" : "#444" }}>
                ✓
              </button>
              {fontDropdownOpen && (
                <div className="font-dropdown" style={{ background: isDark ? "#1e1e38" : "#fff", borderColor: isDark ? "#3a3a5c" : "#dde0e8", boxShadow: isDark ? "0 8px 24px rgba(0,0,0,0.5)" : "0 8px 24px rgba(0,0,0,0.12)" }}>
                  {["Inter", "Poppins", "Roboto", "Montserrat", "Open Sans", "Lato", "Playfair Display", "Oswald", "Merriweather", "DM Sans", "Manrope", "Urbanist", "Raleway", "Lora", "Work Sans"]
                    .filter(f => f.toLowerCase().includes(fontFamilyInput.toLowerCase()))
                    .map(f => (
                      <div
                        key={f}
                        className={`font-dropdown-item${appliedFontFamily === f ? " active" : ""}`}
                        onMouseDown={() => { setFontFamilyInput(f); setAppliedFontFamily(f); setFontDropdownOpen(false); }}
                        style={{
                          background: appliedFontFamily === f ? (isDark ? "#5a5aaa" : "#4a4aaa") : "transparent",
                          color: appliedFontFamily === f ? "#fff" : (isDark ? "#c8cce0" : "#333"),
                        }}
                      >{f}</div>
                    ))
                  }
                </div>
              )}
            </div>
          </div>

          {/* Weight row */}
          <div className="settings-row" style={{ borderTop: `1px solid ${rowBorder}` }}>
            <span className="settings-row-label">{t.fontWeight}</span>
            <select className="settings-select" value={fontWeightSetting}
              onChange={(e) => setFontWeightSetting(e.target.value as typeof fontWeightSetting)}
              style={{ background: selectBg, color: selectColor, borderColor: selectBorder }}>
              <option value="light">{t.weightLight}</option>
              <option value="normal">{t.weightNormal}</option>
              <option value="semi-bold">{t.weightSemiBold}</option>
              <option value="bold">{t.weightBold}</option>
            </select>
          </div>

          {/* Size row */}
          <div className="settings-row settings-row-col" style={{ borderTop: `1px solid ${rowBorder}` }}>
            <span className="settings-row-label">{t.fontSize}</span>
            <div className="settings-slider-row">
              <input type="range" className="settings-slider" min={0} max={100} value={fontSizeNum}
                onChange={(e) => setFontSizeNum(Number(e.target.value))} />
              <span style={{ fontSize: 11, opacity: 0.6, minWidth: 28, textAlign: "right" }}>{fontSizePx}px</span>
            </div>
          </div>

          {/* Colour row */}
          <div className="settings-row" style={{ borderTop: `1px solid ${rowBorder}` }}>
            <span className="settings-row-label">Colour</span>
            <div className="font-color-wrap" ref={fontColorRef}>
              <button
                className="font-color-swatch-btn"
                onClick={() => setFontColorOpen(o => !o)}
                style={{
                  background: fontColor || (textColor),
                  border: `2px solid ${isDark ? "#3a3a5c" : "#ccc"}`,
                }}
                title="Pick font colour"
              />
              {fontColor && (
                <button
                  className="font-color-reset"
                  onClick={() => setFontColor("")}
                  style={{ color: isDark ? "#aab" : "#888" }}
                  title="Reset to default"
                >✕</button>
              )}
              {fontColorOpen && (
                <div className="font-color-popup" style={{ background: isDark ? "#1e1e38" : "#fff", borderColor: isDark ? "#3a3a5c" : "#dde0e8", boxShadow: isDark ? "0 8px 28px rgba(0,0,0,0.55)" : "0 8px 28px rgba(0,0,0,0.14)" }}>
                  <div className="font-color-swatches">
                    {["#ffffff","#e0e0e0","#9e9e9e","#424242","#212121","#000000",
                      "#ef5350","#ff7043","#ffa726","#ffee58","#aed581","#66bb6a",
                      "#26a69a","#26c6da","#42a5f5","#5c6bc0","#7e57c2","#ec407a",
                      "#ffcdd2","#ffe0b2","#fff9c4","#c8e6c9","#b3e5fc","#e1bee7"
                    ].map(c => (
                      <button
                        key={c}
                        className={`font-color-dot${fontColor === c ? " active" : ""}`}
                        style={{ background: c, outline: fontColor === c ? "2px solid #5a7aff" : "none", outlineOffset: 2 }}
                        onClick={() => { setFontColor(c); setFontColorOpen(false); }}
                        title={c}
                      />
                    ))}
                  </div>
                  <div className="font-color-custom-row">
                    <span style={{ fontSize: "0.72rem", opacity: 0.6, color: isDark ? "#c8cce0" : "#555" }}>Custom</span>
                    <input
                      type="color"
                      className="font-color-custom-input"
                      value={fontColor || (textColor)}
                      onChange={(e) => setFontColor(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* ── Pomodoro Card ── */}
        <p className="settings-section-label" style={{ marginTop: 12 }}>Pomodoro timer</p>
        <div className="settings-card" style={{ background: cardBg }}>

          <div className="settings-row">
            <span className="settings-row-label">Stopwatch</span>
            <button className={`toggle${countdownEnabled ? " on" : ""}`} onClick={() => { setCountdownEnabled(v => { if (!v) setPomodoroEnabled(false); return !v; }); }} aria-label="Enable countdown" />
          </div>

          <div className="settings-row" style={{ borderTop: `1px solid ${rowBorder}` }}>
            <span className="settings-row-label">Timer</span>
            <button className={`toggle${pomodoroEnabled ? " on" : ""}`} onClick={() => { setPomodoroEnabled(v => { if (!v) setCountdownEnabled(false); return !v; }); }} aria-label="Enable timer" />
          </div>

          <div className={`settings-row${!pomodoroEnabled ? " settings-row-dimmed" : ""}`} style={{ borderTop: `1px solid ${rowBorder}` }}>
            <span className="settings-row-label">Play sound on alarm</span>
            <button className={`toggle${pomodoroSound ? " on" : ""}`} onClick={() => setPomodoroSound(!pomodoroSound)} disabled={!pomodoroEnabled} aria-label="Play sound" />
          </div>

          <div className={`settings-row${!pomodoroEnabled || !pomodoroSound ? " settings-row-dimmed" : ""}`} style={{ borderTop: `1px solid ${rowBorder}` }}>
            <span className="settings-row-label">Alarm tune</span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <select className="settings-select" value={pomodoroTune}
                onChange={(e) => setPomodoroTune(e.target.value)}
                disabled={!pomodoroEnabled || !pomodoroSound}
                style={{ background: selectBg, color: selectColor, borderColor: selectBorder }}>
                <option>Marimba</option>
                <option>Digital</option>
                <option>Bell</option>
                <option>Chime</option>
              </select>
              <button
                onClick={() => playPomodoroAlarm(pomodoroTune, pomodoroVolume)}
                disabled={!pomodoroEnabled || !pomodoroSound}
                title="Preview sound"
                style={{ background: "none", border: "none", cursor: "pointer", color: themeColor, opacity: (!pomodoroEnabled || !pomodoroSound) ? 0.35 : 1, fontSize: 16, lineHeight: 1, padding: "2px 4px" }}>
                🔊
              </button>
            </div>
          </div>

          <div className={`settings-row settings-row-col${!pomodoroEnabled || !pomodoroSound ? " settings-row-dimmed" : ""}`} style={{ borderTop: `1px solid ${rowBorder}` }}>
            <span className="settings-row-label">Alarm volume</span>
            <div className="settings-slider-row">
              <input type="range" className="settings-slider" min={0} max={100} value={pomodoroVolume}
                onChange={(e) => setPomodoroVolume(Number(e.target.value))} disabled={!pomodoroEnabled || !pomodoroSound} />
            </div>
          </div>

          <div className={`settings-row${!pomodoroEnabled ? " settings-row-dimmed" : ""}`} style={{ borderTop: `1px solid ${rowBorder}` }}>
            <span className="settings-row-label">Default time</span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input type="number" min={1} max={99} value={pomodoroDefaultTime} disabled={!pomodoroEnabled}
                onChange={(e) => { const v = Math.max(1, Math.min(99, Number(e.target.value))); setPomodoroDefaultTime(v); if (pomodoroMode === "pomodoro" && !pomodoroRunning) setPomodoroSeconds(v * 60); }}
                className="pomo-time-input" style={{ background: selectBg, color: selectColor, borderColor: selectBorder }} />
              <span style={{ fontSize: "0.8rem", opacity: 0.6 }}>mins</span>
            </div>
          </div>

          <div className={`settings-row${!pomodoroEnabled ? " settings-row-dimmed" : ""}`} style={{ borderTop: `1px solid ${rowBorder}` }}>
            <span className="settings-row-label">Break time</span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input type="number" min={1} max={99} value={pomodoroBreakTime} disabled={!pomodoroEnabled}
                onChange={(e) => { const v = Math.max(1, Math.min(99, Number(e.target.value))); setPomodoroBreakTime(v); if (pomodoroMode === "break" && !pomodoroRunning) setPomodoroSeconds(v * 60); }}
                className="pomo-time-input" style={{ background: selectBg, color: selectColor, borderColor: selectBorder }} />
              <span style={{ fontSize: "0.8rem", opacity: 0.6 }}>mins</span>
            </div>
          </div>

          <div className={`settings-row${!pomodoroEnabled ? " settings-row-dimmed" : ""}`} style={{ borderTop: `1px solid ${rowBorder}` }}>
            <span className="settings-row-label">Long break time</span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input type="number" min={1} max={99} value={pomodoroLongBreakTime} disabled={!pomodoroEnabled}
                onChange={(e) => { const v = Math.max(1, Math.min(99, Number(e.target.value))); setPomodoroLongBreakTime(v); if (pomodoroMode === "longbreak" && !pomodoroRunning) setPomodoroSeconds(v * 60); }}
                className="pomo-time-input" style={{ background: selectBg, color: selectColor, borderColor: selectBorder }} />
              <span style={{ fontSize: "0.8rem", opacity: 0.6 }}>mins</span>
            </div>
          </div>

        </div>

        {/* ── Page Layout Card ── */}
        <p className="settings-section-label" style={{ marginTop: 12 }}>Page layout</p>
        <div className="settings-card" style={{ background: cardBg }}>
          <div className="layout-slot-grid">
            {(["main", "A1", "B2", "C3"] as LayoutSlotKey[]).map(slot => (
              <button
                key={slot}
                className={`layout-slot-box${activeSlot === slot ? " layout-slot-active" : ""}`}
                style={{
                  background: activeSlot === slot ? (isDark ? "#2a2a50" : "#e8eeff") : (isDark ? "#1a1a36" : "#f5f5fa"),
                  borderColor: activeSlot === slot ? "#4285F4" : (isDark ? "#3a3a5c" : "#d0d0e0"),
                  color: activeSlot === slot ? "#4285F4" : (isDark ? "#aab" : "#555"),
                }}
                onClick={() => selectSlot(slot)}
              >
                <span className="layout-slot-name">{slot === "main" ? "Main" : slot}</span>
                {slot === "main" && <span className="layout-slot-badge">Default</span>}
              </button>
            ))}
          </div>
          {activeSlot !== "main" && (
            <div className="settings-row" style={{ borderTop: `1px solid ${rowBorder}` }}>
              <span className="settings-row-label" style={{ fontSize: "0.85rem" }}>
                Edit layout <span style={{ opacity: 0.55, fontSize: "0.78rem" }}>({activeSlot})</span>
              </span>
              <button
                className="layout-open-btn"
                onClick={enterLayoutMode}
                style={{ background: "#4285F4", color: "#fff" }}
              >
                Open
              </button>
            </div>
          )}
          <div className="settings-row" style={{ borderTop: `1px solid ${rowBorder}`, opacity: 0.55 }}>
            <span className="settings-row-label" style={{ fontSize: "0.78rem", lineHeight: 1.4 }}>
              {activeSlot === "main"
                ? "Select A1, B2 or C3 to create a custom layout."
                : "Click any element on the page to select it, then drag to reposition."}
            </span>
          </div>
        </div>

      {/* ── App Library Modal ── */}
      {showLibraryModal && (
        <div className="al-overlay" onClick={() => { setShowLibraryModal(false); setAddingToSet(null); setSelectingSet(null); setSelectedInSet(new Set()); setEditingSetId(null); }}>
          <div className="al-modal" style={{ background: isDark ? "#16162a" : "#efefef", color: themeColor }} onClick={(e) => e.stopPropagation()}>

            {/* ── Header ── */}
            <div className="al-header">
              <span className="al-title" style={{ color: themeColor }}>App Library</span>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button
                  className="al-add-set-btn"
                  onClick={() => {
                    const id = genId();
                    setAppSets(prev => [...prev, { id, name: "New Set", apps: [] }]);
                    setEditingSetId(id);
                    setEditingSetName("New Set");
                  }}
                >
                  + APP SET
                </button>
                <button className="bm-close-btn" style={{ color: themeColor }} onClick={() => setShowLibraryModal(false)}>
                  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                </button>
              </div>
            </div>

            {/* ── Sets body ── */}
            <div className="al-body">
              {appSets.map((set) => (
                <div key={set.id} className="al-set-card" style={{ borderColor: isDark ? "rgba(34,211,238,0.45)" : "rgba(6,182,212,0.6)", background: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.7)" }}>

                  {/* Set name row */}
                  <div className="al-set-header">
                    {editingSetId === set.id ? (
                      <input
                        className="al-set-name-input"
                        style={{ color: themeColor, background: "transparent", borderColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)" }}
                        value={editingSetName}
                        autoFocus
                        onChange={(e) => setEditingSetName(e.target.value)}
                        onBlur={() => { setAppSets(prev => prev.map(s => s.id === set.id ? { ...s, name: editingSetName.trim() || "Set" } : s)); setEditingSetId(null); }}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === "Escape") (e.target as HTMLInputElement).blur(); }}
                      />
                    ) : (
                      <span
                        className="al-set-name"
                        style={{ color: themeColor }}
                        title="Click to rename"
                        onClick={() => { setEditingSetId(set.id); setEditingSetName(set.name); }}
                      >{set.name}</span>
                    )}
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      {appSets.length > 1 && (
                        <button
                          className="al-set-del-btn"
                          style={{ color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)" }}
                          title="Delete set"
                          onClick={() => { setAppSets(prev => prev.filter(s => s.id !== set.id)); if (selectingSet === set.id) { setSelectingSet(null); setSelectedInSet(new Set()); } if (addingToSet === set.id) setAddingToSet(null); }}
                        >
                          <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                        </button>
                      )}
                      <button
                        className="al-select-btn"
                        style={{
                          borderColor: selectingSet === set.id ? "#22d3ee" : (isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.18)"),
                          color: selectingSet === set.id ? "#22d3ee" : themeColor,
                          background: selectingSet === set.id ? (isDark ? "rgba(34,211,238,0.1)" : "rgba(6,182,212,0.08)") : "transparent",
                        }}
                        onClick={() => { if (selectingSet === set.id) { setSelectingSet(null); setSelectedInSet(new Set()); } else { setSelectingSet(set.id); setSelectedInSet(new Set()); } }}
                      >
                        {selectingSet === set.id ? "Cancel" : "Select"}
                      </button>
                    </div>
                  </div>

                  {/* App icon grid */}
                  <div className="al-app-grid">
                    {set.apps.map((app) => {
                      const isSel = selectingSet === set.id && selectedInSet.has(app.id);
                      return (
                        <div
                          key={app.id}
                          className={`al-app-item${isSel ? " al-app-sel" : ""}`}
                          style={{ background: isDark ? "#252540" : "#e2e2e9", borderColor: isSel ? "#22d3ee" : "transparent" }}
                          title={app.name}
                          onClick={() => {
                            if (selectingSet === set.id) {
                              setSelectedInSet(prev => { const n = new Set(prev); if (n.has(app.id)) n.delete(app.id); else n.add(app.id); return n; });
                            }
                          }}
                        >
                          {isSel && (
                            <div className="al-check">
                              <svg viewBox="0 0 24 24" fill="#fff" width="10" height="10"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                            </div>
                          )}
                          {selectingSet !== set.id && (
                            <button
                              className="al-app-del"
                              style={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)" }}
                              onClick={(e) => { e.stopPropagation(); setAppSets(prev => prev.map(s => s.id === set.id ? { ...s, apps: s.apps.filter(a => a.id !== app.id) } : s)); }}
                            >×</button>
                          )}
                          <img
                            src={`https://www.google.com/s2/favicons?domain=${app.domain}&sz=64`}
                            alt={app.name}
                            className="al-app-icon"
                          />
                          <span className="al-app-label" style={{ color: isDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.65)" }}>{app.name}</span>
                        </div>
                      );
                    })}

                    {/* + Add button (only when not in select mode) */}
                    {selectingSet !== set.id && addingToSet !== set.id && (
                      <button
                        className="al-add-app-tile"
                        style={{ background: isDark ? "#252540" : "#e2e2e9", borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)" }}
                        onClick={() => { setAddingToSet(set.id); setAddUrlValue(""); setAddUrlError(""); }}
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22" style={{ opacity: 0.5 }}><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                      </button>
                    )}
                  </div>

                  {/* Inline URL input (shown when + clicked) */}
                  {addingToSet === set.id && (
                    <div className="al-inline-add" style={{ borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)"}` }}>
                      <input
                        type="text"
                        className="al-inline-input"
                        placeholder="Paste app URL, e.g. youtube.com"
                        value={addUrlValue}
                        autoFocus
                        style={{ background: isDark ? "#1c1c34" : "#fff", color: themeColor, borderColor: addUrlError ? "#e74c3c" : (isDark ? "#3a3a5c" : "#d0d3de") }}
                        onChange={(e) => { setAddUrlValue(e.target.value); setAddUrlError(""); }}
                        onKeyDown={(e) => {
                          if (e.key === "Escape") { setAddingToSet(null); }
                          if (e.key === "Enter") {
                            let url = addUrlValue.trim();
                            if (!url) { setAddUrlError("Enter a URL"); return; }
                            if (!/^https?:\/\//i.test(url)) url = "https://" + url;
                            let domain = "";
                            try { domain = new URL(url).hostname.replace(/^www\./, ""); } catch { setAddUrlError("Invalid URL"); return; }
                            const name = domain.split(".")[0].replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
                            const id = genId();
                            setAppSets(prev => prev.map(s => s.id === set.id ? { ...s, apps: [...s.apps, { id, name, url, domain }] } : s));
                            setAddingToSet(null); setAddUrlValue("");
                          }
                        }}
                      />
                      <button
                        className="al-inline-save"
                        onClick={() => {
                          let url = addUrlValue.trim();
                          if (!url) { setAddUrlError("Enter a URL"); return; }
                          if (!/^https?:\/\//i.test(url)) url = "https://" + url;
                          let domain = "";
                          try { domain = new URL(url).hostname.replace(/^www\./, ""); } catch { setAddUrlError("Invalid URL"); return; }
                          const name = domain.split(".")[0].replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
                          const id = genId();
                          setAppSets(prev => prev.map(s => s.id === set.id ? { ...s, apps: [...s.apps, { id, name, url, domain }] } : s));
                          setAddingToSet(null); setAddUrlValue("");
                        }}
                      >Save</button>
                      <button className="al-inline-cancel" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.35)" }} onClick={() => setAddingToSet(null)}>Cancel</button>
                      {addUrlError && <span className="al-url-error">{addUrlError}</span>}
                    </div>
                  )}

                  {/* Select mode footer */}
                  {selectingSet === set.id && (
                    <div className="al-sel-footer" style={{ borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)"}` }}>
                      <span style={{ fontSize: "0.75rem", color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.45)" }}>
                        {selectedInSet.size > 0 ? `${selectedInSet.size} selected` : "Tap apps to select"}
                      </span>
                      <button
                        className="al-sel-add-btn"
                        style={{ background: selectedInSet.size === 0 ? (isDark ? "#2a2a44" : "#d8d8e0") : "#22d3ee", color: selectedInSet.size === 0 ? (isDark ? "rgba(255,255,255,0.25)" : "#aaa") : "#fff" }}
                        disabled={selectedInSet.size === 0}
                        onClick={() => {
                          const toAdd = set.apps.filter(a => selectedInSet.has(a.id));
                          setShortcuts(prev => {
                            const existingUrls = new Set(prev.map(s => s.url));
                            return [...prev, ...toAdd.filter(a => !existingUrls.has(a.url)).map(a => ({ name: a.name, url: a.url, domain: a.domain }))];
                          });
                          setSelectingSet(null); setSelectedInSet(new Set()); setShowLibraryModal(false);
                        }}
                      >Add to Quick Access</button>
                    </div>
                  )}

                </div>
              ))}
            </div>

            {/* ── Footer ── */}
            <div className="al-footer" style={{ borderTop: `1px solid ${rowBorder}` }}>
              <button className="al-done-btn" style={{ background: isDark ? "#2a2a44" : "#e0e0ea", color: themeColor }} onClick={() => setShowLibraryModal(false)}>
                Done
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
    </div>
    </div>
    </div>
  );
}
