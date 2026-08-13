// Lightweight i18n: English (default), French, Arabic (RTL).
// The chosen locale persists in localStorage; switching reloads the app so
// every screen re-renders in the new language. Dynamic data from the API
// (class names, news, coach names) stays in its original language.

import { Preferences } from '@capacitor/preferences';

export type Locale = 'en' | 'fr' | 'ar';

const KEY = 'appLocale';

export function getLocale(): Locale {
  const l = localStorage.getItem(KEY);
  return l === 'fr' || l === 'ar' ? l : 'en';
}

export function setLocale(l: Locale) {
  localStorage.setItem(KEY, l);
  // Also persist in the NATIVE store: survives app close/reopen and even the
  // OS purging web storage. Fire-and-forget, then reload into the new locale.
  Preferences.set({ key: KEY, value: l }).finally(() => window.location.reload());
}

/** Called once at boot, before first render: if the native store has a locale
 *  the web storage lost (fresh install restore, purged WebView data), bring it
 *  back so the app opens in the user's language. */
export async function restoreLocale(): Promise<void> {
  try {
    const { value } = await Preferences.get({ key: KEY });
    if ((value === 'fr' || value === 'ar' || value === 'en') && value !== localStorage.getItem(KEY)) {
      localStorage.setItem(KEY, value);
    }
  } catch {
    // native store unavailable (plain browser without plugin) — localStorage rules
  }
  applyDir();
}

export function applyDir() {
  const l = getLocale();
  document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = l;
}

export const LOCALES: { code: Locale; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'ar', label: 'العربية' },
];

const en: Record<string, string> = {
  'nav.home': 'Home',
  'nav.levels': 'Swim Levels',
  'nav.profile': 'Profile',
  'nav.signin': 'Sign In',
  'nav.about': 'About',

  'home.title': 'Home',
  'home.welcome': 'Welcome back',
  'home.upNext': 'Up next',
  'home.group': 'Group training',
  'home.private': 'Private training',
  'home.payments': 'Payments',
  'home.quickActions': 'Quick actions',
  'home.attendance': 'Attendance',
  'home.noUpcoming': 'No upcoming sessions in the next two weeks.',
  'home.next': 'Next',
  'home.due': 'Due',
  'home.leftOf': 'of {n} left',
  'home.outstanding': 'Outstanding balance',
  'home.outstandingHint': 'payments pending — tap for details',
  'home.allSettled': 'All payments settled',
  'home.historyHint': 'Tap to see your payment history',
  'home.book': 'Book a session',
  'home.bookHint': 'Chat with us on WhatsApp',
  'home.requestChange': 'Request a change',
  'home.requestHint': 'Update your details',
  'home.lowSessions': 'Sessions running low — time to renew',
  'home.today': 'Today',
  'home.tomorrow': 'Tomorrow',

  'switch.trigger': 'Switch swimmer',
  'switch.title': 'My swimmers',
  'switch.current': 'Current',

  'profile.title': 'My Profile',
  'profile.subtitle': 'Your swimmer details & attendance',
  'profile.programs': 'Programs Enrolled In',
  'profile.contact': 'Contact',
  'profile.personal': 'Personal',
  'profile.family': 'Family',
  'profile.progress': 'Progress & Achievements',
  'profile.language': 'Language',
  'profile.attendance': 'Attendance',
};

const fr: Record<string, string> = {
  'nav.home': 'Accueil',
  'nav.levels': 'Niveaux',
  'nav.profile': 'Profil',
  'nav.signin': 'Connexion',
  'nav.about': 'À propos',

  'home.title': 'Accueil',
  'home.welcome': 'Bon retour',
  'home.upNext': 'Prochaine séance',
  'home.group': 'Entraînement en groupe',
  'home.private': 'Entraînement privé',
  'home.payments': 'Paiements',
  'home.quickActions': 'Actions rapides',
  'home.attendance': 'Présence',
  'home.noUpcoming': 'Aucune séance prévue dans les deux prochaines semaines.',
  'home.next': 'Proch.',
  'home.due': 'Dû',
  'home.leftOf': 'sur {n} restantes',
  'home.outstanding': 'Solde impayé',
  'home.outstandingHint': 'paiements en attente — appuyez pour les détails',
  'home.allSettled': 'Tous les paiements sont réglés',
  'home.historyHint': "Appuyez pour voir l'historique des paiements",
  'home.book': 'Réserver une séance',
  'home.bookHint': 'Discutez avec nous sur WhatsApp',
  'home.requestChange': 'Demander une modification',
  'home.requestHint': 'Mettre à jour vos informations',
  'home.lowSessions': 'Plus que quelques séances — pensez à renouveler',
  'home.today': "Aujourd'hui",
  'home.tomorrow': 'Demain',

  'switch.trigger': 'Changer de nageur',
  'switch.title': 'Mes nageurs',
  'switch.current': 'Actuel',

  'profile.title': 'Mon profil',
  'profile.subtitle': 'Détails et présence de votre nageur',
  'profile.programs': 'Programmes inscrits',
  'profile.contact': 'Contact',
  'profile.personal': 'Informations personnelles',
  'profile.family': 'Famille',
  'profile.progress': 'Progrès et réalisations',
  'profile.language': 'Langue',
  'profile.attendance': 'Présence',
};

const ar: Record<string, string> = {
  'nav.home': 'الرئيسية',
  'nav.levels': 'المستويات',
  'nav.profile': 'الملف الشخصي',
  'nav.signin': 'تسجيل الدخول',
  'nav.about': 'حول',

  'home.title': 'الرئيسية',
  'home.welcome': 'مرحباً بعودتك',
  'home.upNext': 'الحصة القادمة',
  'home.group': 'التدريب الجماعي',
  'home.private': 'التدريب الخاص',
  'home.payments': 'المدفوعات',
  'home.quickActions': 'إجراءات سريعة',
  'home.attendance': 'الحضور',
  'home.noUpcoming': 'لا توجد حصص قادمة خلال الأسبوعين المقبلين.',
  'home.next': 'التالي',
  'home.due': 'مستحق',
  'home.leftOf': 'من أصل {n} متبقية',
  'home.outstanding': 'رصيد مستحق',
  'home.outstandingHint': 'دفعات معلّقة — اضغط للتفاصيل',
  'home.allSettled': 'جميع الدفعات مسدّدة',
  'home.historyHint': 'اضغط لعرض سجل الدفعات',
  'home.book': 'احجز حصة',
  'home.bookHint': 'تواصل معنا عبر واتساب',
  'home.requestChange': 'طلب تعديل',
  'home.requestHint': 'تحديث بياناتك',
  'home.lowSessions': 'الحصص على وشك الانتهاء — حان وقت التجديد',
  'home.today': 'اليوم',
  'home.tomorrow': 'غداً',

  'switch.trigger': 'تبديل السباح',
  'switch.title': 'سباحيّ',
  'switch.current': 'الحالي',

  'profile.title': 'ملفي الشخصي',
  'profile.subtitle': 'تفاصيل السباح والحضور',
  'profile.programs': 'البرامج المسجّل بها',
  'profile.contact': 'معلومات الاتصال',
  'profile.personal': 'معلومات شخصية',
  'profile.family': 'العائلة',
  'profile.progress': 'التقدّم والإنجازات',
  'profile.language': 'اللغة',
  'profile.attendance': 'الحضور',
};

const dicts: Record<Locale, Record<string, string>> = { en, fr, ar };

/** Translate a key; falls back to English, then to the key itself. */
export function t(key: string, vars?: Record<string, string | number>): string {
  let s = dicts[getLocale()][key] ?? en[key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
  return s;
}

// Apply direction as soon as the module loads (before first paint matters for RTL).
if (typeof document !== 'undefined') applyDir();
