import type { Locale } from "@/i18n/config";
import type { MediaKey } from "./media";

/*
  Insights articles. Every title, excerpt and paragraph is taken from the Aqar
  Dyafa AI Social Media & Marketing Reference Folder (message house, content
  pillars, sample posts, audience objections); Arabic follows the folder's own
  Arabic wherever it has one. Do not add any text that is not in that folder.
*/

export type Block = { type: "p"; text: string } | { type: "h2"; text: string } | { type: "ul"; items: string[] };

type Localised = { title: string; excerpt: string; category: string; body: Block[] };

export type Article = {
  slug: string;
  date: string; // ISO date, shown as the publish date
  image: MediaKey;
  alt: Record<Locale, string>;
  content: Record<Locale, Localised>;
};

export const articles: Article[] = [
  {
    slug: "what-hotels-teach-property-managers",
    date: "2026-10-12",
    image: "lobby",
    alt: { en: "A calm hotel lobby with marble floors", ar: "ردهة فندق هادئة بأرضيات رخامية" },
    content: {
      en: {
        title: "What hotels can teach property managers",
        category: "Hospitality-led real estate",
        excerpt: "Hospitality is not only for guests; it can improve how assets are managed.",
        body: [
          { type: "p", text: "Hospitality standards can transform the way residential and real-estate assets are managed." },
          { type: "p", text: "Residents do not only rent space. They expect service, response, safety, and comfort." },
          { type: "p", text: "One operating model connects leasing, maintenance, reporting, service response, and resident communication." },
          { type: "p", text: "Owners feel their asset is under control. Residents feel they are heard and cared for." },
        ],
      },
      ar: {
        title: "ما الذي يمكن أن تتعلمه إدارة العقار من الفنادق",
        category: "عقار بروح ضيافة",
        excerpt: "الضيافة ليست للضيوف فقط؛ بل يمكنها أن تحسّن طريقة إدارة الأصول.",
        body: [
          { type: "p", text: "معايير الضيافة قادرة على تغيير طريقة إدارة الأصول السكنية والعقارية." },
          { type: "p", text: "المقيم لا يستأجر مساحة فقط؛ بل يتوقع خدمة واستجابة وأماناً وراحة." },
          { type: "p", text: "نموذج تشغيلي واحد يربط التأجير، الصيانة، التقارير، الاستجابة، والتواصل مع المقيمين." },
          { type: "p", text: "يشعر المالك أن الأصل تحت إدارة واضحة، ويشعر المقيم أن هناك من يسمعه ويهتم بتجربته." },
        ],
      },
    },
  },
  {
    slug: "five-things-owners-should-review-monthly",
    date: "2026-10-05",
    image: "apartmentsDusk",
    alt: { en: "A residential building at dusk", ar: "مبنى سكني عند الغروب" },
    content: {
      en: {
        title: "Five things every owner should review each month",
        category: "For owners",
        excerpt: "Your building is not only units; it is an asset that needs a system.",
        body: [
          { type: "p", text: "Property management should be measurable:" },
          { type: "ul", items: ["Occupancy", "Response time", "Resident satisfaction", "Renewal rate", "Asset condition"] },
          { type: "p", text: "If it is not reported, it is not truly managed." },
          { type: "p", text: "Good property management should be visible in reports, response times, occupancy, and resident satisfaction." },
        ],
      },
      ar: {
        title: "خمسة أمور يراجعها المالك كل شهر",
        category: "للملّاك",
        excerpt: "مبناك ليس وحدات فقط؛ بل أصل يحتاج إلى نظام.",
        body: [
          { type: "p", text: "الإدارة العقارية يجب أن تكون قابلة للقياس:" },
          { type: "ul", items: ["الإشغال", "سرعة الاستجابة", "رضا المقيمين", "التجديد", "حالة الأصل"] },
          { type: "p", text: "ما لا يُقاس لا يُدار فعلياً." },
          { type: "p", text: "الإدارة العقارية الجيدة تظهر في التقارير، سرعة الاستجابة، نسب الإشغال، ورضا المقيمين." },
        ],
      },
    },
  },
  {
    slug: "leasing-fills-units-management-protects-value",
    date: "2026-09-28",
    image: "faisaliahTower",
    alt: { en: "Al Faisaliah Tower in Riyadh with palm trees at its base", ar: "برج الفيصلية في الرياض تحيط به أشجار النخيل" },
    content: {
      en: {
        title: "Leasing fills units. Management protects value.",
        category: "Leasing",
        excerpt: "Leasing is not only listing; it is positioning, response and follow-up.",
        body: [
          { type: "p", text: "A property can be fully leased and still be under-managed." },
          { type: "p", text: "The difference appears in maintenance follow-up, resident complaints, reporting quality and renewal stability. At Aqar Dyafa, we believe real estate management should be treated as an operating discipline, not only a leasing function." },
          { type: "p", text: "Owners deserve clearer reporting. Residents deserve better response. Assets deserve long-term care." },
          { type: "p", text: "A full building is not always a well-managed asset. Strong property management connects occupancy, maintenance, resident satisfaction and owner reporting into one operating rhythm." },
        ],
      },
      ar: {
        title: "التأجير يملأ الوحدات. الإدارة تحمي القيمة.",
        category: "التأجير",
        excerpt: "التأجير ليس مجرد عرض للوحدات؛ بل تموضع واستجابة ومتابعة.",
        body: [
          { type: "p", text: "قد يكون العقار مؤجراً بالكامل، لكنه لا يُدار بالشكل الصحيح." },
          { type: "p", text: "الفرق يظهر في متابعة الصيانة، شكاوى المقيمين، جودة التقارير، واستقرار التجديدات. في عقار الضيافة نؤمن أن إدارة العقار يجب أن تكون انضباطاً تشغيلياً، لا مجرد وظيفة تأجير." },
          { type: "p", text: "المالك يحتاج وضوحاً، والمقيم يحتاج استجابة، والأصل يحتاج عناية طويلة الأمد." },
          { type: "p", text: "امتلاء الوحدات لا يعني دائماً أن الأصل يُدار بشكل صحيح. الإدارة العقارية الجيدة تربط الإشغال، الصيانة، رضا المقيمين، وتقارير المالك ضمن إيقاع تشغيلي واحد." },
        ],
      },
    },
  },
  {
    slug: "questions-before-appointing-a-property-manager",
    date: "2026-09-21",
    image: "courtyardDusk",
    alt: { en: "A courtyard with arches and palm trees at dusk", ar: "فناء بأقواس ونخيل عند الغروب" },
    content: {
      en: {
        title: "Before appointing a property manager, ask these questions",
        category: "Guides",
        excerpt: "Good owners ask for more than rent collection.",
        body: [
          {
            type: "ul",
            items: [
              "Will this cost more than a traditional property manager?",
              "Can you actually lease the units?",
              "Can you handle maintenance and resident complaints?",
              "Will reporting be transparent?",
              "Are you a broker or a real operating platform?",
              "Do you have enough team capability?",
            ],
          },
          { type: "p", text: "Aqar Dyafa helps property owners move from fragmented management to one accountable model for leasing, maintenance, resident experience, and long-term asset care." },
        ],
      },
      ar: {
        title: "قبل تعيين مدير للعقار، اسأل هذه الأسئلة",
        category: "أدلة",
        excerpt: "المالك الواعي يطلب أكثر من تحصيل الإيجار.",
        body: [
          {
            type: "ul",
            items: [
              "هل ستكون التكلفة أعلى من مدير العقار التقليدي؟",
              "هل تستطيعون فعلاً تأجير الوحدات؟",
              "هل تستطيعون التعامل مع الصيانة وشكاوى المقيمين؟",
              "هل ستكون التقارير شفافة؟",
              "هل أنتم وسطاء أم منصة تشغيل حقيقية؟",
              "هل لديكم فريق بالقدرة الكافية؟",
            ],
          },
          { type: "p", text: "تساعد عقار الضيافة الملاك على تحويل إدارة العقار من متابعة متفرقة إلى نموذج واضح يربط الإشغال، الصيانة، تجربة المقيم، وحماية قيمة الأصل." },
        ],
      },
    },
  },
];

export const getArticle = (slug: string) => articles.find((a) => a.slug === slug);

/** Rough reading time from word count; Arabic reads a little slower. */
export function readingMinutes(article: Article, locale: Locale) {
  const words = article.content[locale].body
    .flatMap((b) => (b.type === "ul" ? b.items : [b.text]))
    .join(" ")
    .split(/\s+/).length;
  return Math.max(1, Math.ceil(words / (locale === "ar" ? 180 : 220)));
}

export const formatDate = (iso: string, locale: Locale) =>
  new Intl.DateTimeFormat(locale === "ar" ? "ar-SA-u-ca-gregory-nu-latn" : "en-GB", { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));

/** "3 min read" / "قراءة 3 دقائق", with Arabic number agreement. */
export function readingLabel(minutes: number, locale: Locale) {
  if (locale === "en") return `${minutes} min read`;
  if (minutes === 1) return "قراءة دقيقة واحدة";
  if (minutes === 2) return "قراءة دقيقتين";
  return `قراءة ${minutes} ${minutes <= 10 ? "دقائق" : "دقيقة"}`;
}
