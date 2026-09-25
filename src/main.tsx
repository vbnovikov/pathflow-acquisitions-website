import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import {
  ArrowRight,
  CalendarCheck,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Circle,
  Clock3,
  Database,
  DatabaseZap,
  FileText,
  Globe2,
  MapPin,
  MessageCircle,
  MoreVertical,
  PhoneCall,
  RefreshCw,
  Send,
  Settings2,
  Tag,
  UserCheck,
  Users,
  Webhook,
  X,
} from "lucide-react";
import "./styles.css";

const signInUrl = "https://acquisitions.getpathflow.com";
const calendarHref = "https://calendar.app.google/GZTkbJFCUjhd58xk7";
const contactEmail = "info@getpathflow.com";
const contactHref = `mailto:${contactEmail}`;
const contactEndpoint =
  import.meta.env.VITE_CONTACT_ENDPOINT || "https://pathflow-contact.vladimir-246.workers.dev";
const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || "";
const appBasePath = normalizeBasePath(import.meta.env.BASE_URL);
const contactPageHref = siteHref("/contact");

function normalizeBasePath(baseUrl: string) {
  if (!baseUrl || baseUrl === "/" || baseUrl === "./") {
    return "";
  }

  return `/${baseUrl.replace(/^\.?\//, "").replace(/\/$/, "")}`;
}

function siteHref(path = "/") {
  if (path === "/" || !path) {
    return appBasePath || "/";
  }

  if (path.startsWith("#")) {
    return `${appBasePath}${path}`;
  }

  if (path.startsWith("/#")) {
    return `${appBasePath}${path.slice(1)}`;
  }

  if (path.startsWith("/")) {
    return `${appBasePath}${path}`;
  }

  return `${appBasePath}/${path}`;
}

function assetPath(path: string) {
  const cleanPath = path.replace(/^\/+/, "");
  const baseUrl = import.meta.env.BASE_URL && import.meta.env.BASE_URL !== "./" ? import.meta.env.BASE_URL : "/";
  const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;

  return `${normalizedBaseUrl}${cleanPath}`;
}

function normalizeRoutePath(path?: string) {
  if (!path) {
    return "";
  }

  let routePath = path.split("#")[0].replace(/\/$/, "");

  if (appBasePath && routePath === appBasePath) {
    return "/";
  }

  if (appBasePath && routePath.startsWith(`${appBasePath}/`)) {
    routePath = routePath.slice(appBasePath.length);
  }

  return routePath || "/";
}

type NavItem = {
  label: string;
  href: string;
  hasDropdown?: boolean;
};

type PlatformCard = {
  href: string;
  image: string;
  imageAlt: string;
  title: string;
  text: string;
  bullets: string[];
};

type Testimonial = {
  quote: string;
  image: string;
  name: string;
  company: string;
};

type HowStep = {
  number: string;
  title: string;
  text: string;
  kind: "lead" | "conversation" | "intent" | "booking";
};

type ValuePoint = {
  icon: React.ElementType;
  title: string;
  text: string;
};

type PricingFeature = {
  icon: React.ElementType;
  title: string;
  detail: string;
};

type HeroEvent = {
  id: string;
  title: string;
  detail: string;
  time: string;
  icon: React.ElementType;
  tone: "blue" | "green" | "purple" | "sage" | "amber" | "slate";
};

type HeroFeedCard = {
  event: HeroEvent;
  instanceId: string;
  phase: "visible" | "entering" | "leaving";
  slot: number;
};

type FollowupActivityStep = {
  id: string;
  title: string;
  detail: string;
  day: string;
  time: string;
  icon: React.ElementType;
};

type FollowupScenario = {
  initials: string;
  name: string;
  meta: string;
  badge: string;
  steps: FollowupActivityStep[];
};

const platformCards: PlatformCard[] = [
  {
    href: siteHref("/"),
    image: assetPath("/images/acquisitions.png"),
    imageAlt: "Acquisitions workspace preview",
    title: "Acquisitions",
    text: "From inquiry to qualified opportunity.",
    bullets: ["Instant lead response", "Text + voice follow-up", "Qualification and booking"],
  },
  {
    href: siteHref("/conversations"),
    image: assetPath("/images/conversations.png"),
    imageAlt: "Conversations workspace preview",
    title: "Conversations",
    text: "Understand what happens on every call.",
    bullets: ["Transcripts and summaries", "CRM-ready call insights", "Full conversation context"],
  },
  {
    href: siteHref("/documents"),
    image: assetPath("/images/documents.png"),
    imageAlt: "Documents workspace preview",
    title: "Documents",
    text: "Collect, review, and move deals forward.",
    bullets: [
      "Automated document collection",
      "Classification and organization",
      "Missing-item tracking",
    ],
  },
];

const testimonials: Testimonial[] = [
  {
    quote:
      "Pathflow has completely changed how we handle leads. Nothing falls through the cracks anymore, and our team can focus on the opportunities that actually need us.",
    image: assetPath("/images/evanvart-tersimonial.png"),
    name: "Evan V.",
    company: "Home Financing Solution",
  },
  {
    quote:
      "Acquisitions gives us instant response, qualification, and follow-up in one motion. Serious leads keep moving, and our team sees the booked appointments that matter.",
    image: assetPath("/images/adi-g-testimonial.png"),
    name: "Adi G.",
    company: "Farm Financing Ontario",
  },
];

const navItems: NavItem[] = [
  { label: "Product", href: siteHref("/#platform") },
  { label: "How it works", href: siteHref("/how-it-works") },
  { label: "Customers", href: siteHref("/#customers") },
  { label: "Pricing", href: siteHref("/pricing") },
  { label: "Contact", href: siteHref("/contact") },
];

const footerLinks = [
  { label: "Product", href: siteHref("/#platform") },
  { label: "How it works", href: siteHref("/how-it-works") },
  { label: "Customers", href: siteHref("/#customers") },
  { label: "Pricing", href: siteHref("/pricing") },
  { label: "Contact", href: siteHref("/contact") },
];

const howSteps: HowStep[] = [
  {
    number: "01",
    title: "A lead arrives.",
    text: "Acquisitions receives new leads from ads, forms, your website, and other sources with the context your team needs.",
    kind: "lead",
  },
  {
    number: "02",
    title: "A real conversation begins.",
    text: "Your AI agent responds naturally across SMS and voice, following the playbook you define for each lead source.",
    kind: "conversation",
  },
  {
    number: "03",
    title: "Intent is understood.",
    text: "The agent qualifies the lead, collects key details, handles objections, and follows up automatically when needed.",
    kind: "intent",
  },
  {
    number: "04",
    title: "The right next step happens.",
    text: "Qualified leads are booked to your calendar, CRM is updated, and your team steps in when human attention adds value.",
    kind: "booking",
  },
];

const valuePoints: ValuePoint[] = [
  {
    icon: Clock3,
    title: "Minutes, not hours",
    text: "New inquiries receive attention without waiting for someone to become available.",
  },
  {
    icon: RefreshCw,
    title: "Persistence without busywork",
    text: "Acquisitions remembers who needs another touch and when.",
  },
  {
    icon: Users,
    title: "People where people matter",
    text: "Your team handles judgment, relationships, and closing. The repetitive work stays automated.",
  },
];

const pricingFeatures: PricingFeature[] = [
  {
    icon: DatabaseZap,
    title: "Automated follow-up",
    detail: "Respond faster",
  },
  {
    icon: MessageCircle,
    title: "Conversations",
    detail: "Natural and on-brand",
  },
  {
    icon: UserCheck,
    title: "Lead qualification",
    detail: "Focus on high-intent",
  },
  {
    icon: CalendarDays,
    title: "Appointment booking",
    detail: "More meetings",
  },
  {
    icon: Database,
    title: "CRM integration",
    detail: "Works with your stack",
  },
  {
    icon: Clock3,
    title: "Live activity",
    detail: "Real-time visibility",
  },
];

const contactProductOptions = [
  "Acquisitions",
  "Documents",
  "Conversations",
  "Platform",
  "CRM Setup",
  "Custom Development",
];

const leadSources = [
  { icon: MessageCircle, label: "Facebook Lead Ads" },
  { icon: Globe2, label: "Your Website" },
  { icon: FileText, label: "LeadProsper" },
  { icon: Webhook, label: "Forms & Webhooks" },
];

const processSteps = [
  { icon: MessageCircle, label: "AI Conversation (SMS / Voice)" },
  { icon: UserCheck, label: "Qualification" },
  { icon: RefreshCw, label: "Follow-up & Retry Logic" },
  { icon: CalendarCheck, label: "Appointment Booking" },
  { icon: Users, label: "Human Handoff (when needed)" },
];

const crmTools = [
  { icon: Database, label: "GoHighLevel" },
  { icon: CalendarDays, label: "Calendars" },
  { icon: Tag, label: "Tags & Pipelines" },
  { icon: Settings2, label: "Custom Fields" },
];

const controlPoints = [
  "Custom playbooks",
  "Qualification rules",
  "Calling and messaging hours",
  "Follow-up cadence",
  "Human handoff rules",
  "Full conversation history",
];

const followupScenarios: FollowupScenario[] = [
  {
    initials: "SM",
    name: "Sarah Mitchell",
    meta: "Homeowner · Lead #4821",
    badge: "Qualified",
    steps: [
      {
        id: "lead-received",
        title: "Lead received",
        detail: "from website form",
        day: "Day 0",
        time: "10:14 AM",
        icon: Users,
      },
      {
        id: "sms-sent",
        title: "SMS sent",
        detail: "\"Hi Sarah, thanks for reaching out. Are you looking to replace or repair your existing furnace?\"",
        day: "Day 0",
        time: "10:14 AM",
        icon: MessageCircle,
      },
      {
        id: "no-response",
        title: "No response",
        detail: "No reply within 24 hours",
        day: "Day 1",
        time: "10:14 AM",
        icon: X,
      },
      {
        id: "call-attempted",
        title: "Call attempted",
        detail: "Left voicemail",
        day: "Day 1",
        time: "2:43 PM",
        icon: PhoneCall,
      },
      {
        id: "followup-sms",
        title: "Follow-up SMS sent",
        detail: "\"Just following up - happy to answer any questions!\"",
        day: "Day 3",
        time: "9:14 AM",
        icon: MessageCircle,
      },
      {
        id: "reply-received",
        title: "Reply received",
        detail: "\"Yes, I'd like to book a consultation.\"",
        day: "Day 3",
        time: "11:27 AM",
        icon: RefreshCw,
      },
      {
        id: "appointment-booked",
        title: "Appointment booked",
        detail: "Consultation scheduled for Tue, Apr 23 at 3:30 PM",
        day: "Day 3",
        time: "11:29 AM",
        icon: CalendarDays,
      },
    ],
  },
  {
    initials: "RB",
    name: "Ryan Brooks",
    meta: "Homeowner · Lead #5176",
    badge: "Booked",
    steps: [
      {
        id: "lead-received",
        title: "Lead received",
        detail: "from Facebook Lead Ad",
        day: "Day 0",
        time: "8:42 AM",
        icon: Users,
      },
      {
        id: "sms-sent",
        title: "SMS sent",
        detail: "\"Hi Ryan, I can help with a heat pump quote. Is this for your home?\"",
        day: "Day 0",
        time: "8:42 AM",
        icon: MessageCircle,
      },
      {
        id: "reply-received",
        title: "Reply received",
        detail: "\"Yes, it is. I'm available later this week.\"",
        day: "Day 0",
        time: "9:18 AM",
        icon: RefreshCw,
      },
      {
        id: "qualified",
        title: "Lead qualified",
        detail: "Homeowner, in service area, project timeline confirmed",
        day: "Day 0",
        time: "9:20 AM",
        icon: UserCheck,
      },
      {
        id: "appointment-booked",
        title: "Appointment booked",
        detail: "In-home estimate scheduled for Fri, Apr 26 at 2:00 PM",
        day: "Day 0",
        time: "9:24 AM",
        icon: CalendarDays,
      },
    ],
  },
];

const heroEvents: HeroEvent[] = [
  {
    id: "lead-replied",
    title: "Lead replied via SMS",
    detail: "\"Yes, tomorrow afternoon works.\"",
    time: "1m ago",
    icon: MessageCircle,
    tone: "green",
  },
  {
    id: "qualified",
    title: "Qualified lead",
    detail: "Furnace replacement - in service area.",
    time: "2m ago",
    icon: UserCheck,
    tone: "purple",
  },
  {
    id: "call-queued",
    title: "Call queued",
    detail: "Voice follow-up scheduled for 4:15 PM.",
    time: "3m ago",
    icon: PhoneCall,
    tone: "blue",
  },
  {
    id: "appointment",
    title: "Appointment booked",
    detail: "Tue, Sep 29 - 3:30 PM consultation.",
    time: "5m ago",
    icon: CalendarCheck,
    tone: "sage",
  },
  {
    id: "human-handoff",
    title: "Human handoff ready",
    detail: "Budget question flagged for your team.",
    time: "6m ago",
    icon: Users,
    tone: "amber",
  },
  {
    id: "follow-up",
    title: "Follow-up scheduled",
    detail: "Retry sequence set for tomorrow morning.",
    time: "8m ago",
    icon: RefreshCw,
    tone: "slate",
  },
  {
    id: "reminder-sent",
    title: "Reminder sent",
    detail: "Confirmed appointment details by SMS.",
    time: "9m ago",
    icon: CheckCircle2,
    tone: "green",
  },
  {
    id: "crm-updated",
    title: "Pipeline updated",
    detail: "Stage, notes, tags, and calendar synced.",
    time: "11m ago",
    icon: DatabaseZap,
    tone: "slate",
  },
];

const initialHeroFeed: HeroFeedCard[] = heroEvents.slice(0, 3).map((event, index) => ({
  event,
  instanceId: `${event.id}-initial`,
  phase: "visible",
  slot: index,
}));

function SiteHeader({
  startHref = calendarHref,
  logoSrc = assetPath("/images/pf_black_transparent.png"),
  brandName = "Acquisitions",
  activeHref,
  className,
}: {
  startHref?: string;
  logoSrc?: string;
  brandName?: string;
  activeHref?: string;
  className?: string;
}) {
  const normalizedActiveHref = normalizeRoutePath(activeHref);
  const headerClassName = className ? `site-header ${className}` : "site-header";

  return (
    <header className={headerClassName}>
      <a className="brand" href={siteHref("/")} aria-label="Pathflow Acquisitions home">
        <span className="brand-mark">
          <img src={logoSrc} alt="" />
        </span>
        <span className="brand-name">{brandName}</span>
      </a>

      <nav className="primary-nav" aria-label="Primary navigation">
        {navItems.map((item) => (
          <a
            className={normalizeRoutePath(item.href) === normalizedActiveHref ? "is-active" : undefined}
            href={item.href}
            key={item.label}
            aria-current={normalizeRoutePath(item.href) === normalizedActiveHref ? "page" : undefined}
          >
            {item.label}
            {item.hasDropdown && <ChevronDown size={14} />}
          </a>
        ))}
      </nav>

      <div className="header-actions">
        <a className="signin-link" href={signInUrl}>
          Sign in
        </a>
        <a className="button button-dark" href={startHref}>
          Get started <ArrowRight size={16} />
        </a>
      </div>
    </header>
  );
}

function CanonicalFooter() {
  return (
    <footer className="canonical-footer">
      <a className="canonical-footer-brand" href={siteHref("/")} aria-label="Pathflow home">
        <img src={assetPath("/images/pf_transparent.png")} alt="" />
        <span>Pathflow</span>
      </a>
      <p>Build a more capable business.</p>
      <nav aria-label="Footer navigation">
        {footerLinks.map((item) => (
          <a href={item.href} key={item.label}>
            {item.label}
          </a>
        ))}
      </nav>
    </footer>
  );
}

function HeroEventStack() {
  const [cards, setCards] = useState<HeroFeedCard[]>(initialHeroFeed);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const nextEventIndex = useRef(3);
  const timingIndex = useRef(0);
  const instanceCounter = useRef(0);
  const cleanupTimers = useRef<number[]>([]);

  useEffect(() => {
    const updateDelays = [2400, 2800, 2550, 3150, 2700, 3000, 2350, 3250];

    const advanceFeed = () => {
      setCards((currentCards) => {
        const activeCards = currentCards
          .filter((card) => card.phase !== "leaving")
          .sort((a, b) => a.slot - b.slot)
          .slice(-3);
        const nextEvent = heroEvents[nextEventIndex.current];

        nextEventIndex.current = (nextEventIndex.current + 1) % heroEvents.length;
        instanceCounter.current += 1;

        return [
          { ...activeCards[0], phase: "leaving", slot: -1 },
          { ...activeCards[1], phase: "visible", slot: 0 },
          { ...activeCards[2], phase: "visible", slot: 1 },
          {
            event: nextEvent,
            instanceId: `${nextEvent.id}-${instanceCounter.current}`,
            phase: "entering",
            slot: 2,
          },
        ];
      });

      const cleanupTimer = window.setTimeout(() => {
        setCards((currentCards) =>
          currentCards
            .filter((card) => card.phase !== "leaving")
            .map((card) => ({ ...card, phase: "visible" })),
        );
      }, 950);

      cleanupTimers.current.push(cleanupTimer);
    };

    const scheduleNext = () => {
      const delay = updateDelays[timingIndex.current % updateDelays.length];
      timingIndex.current += 1;

      const timer = window.setTimeout(() => {
        advanceFeed();
        scheduleNext();
      }, delay);

      cleanupTimers.current.push(timer);
    };

    scheduleNext();

    return () => {
      cleanupTimers.current.forEach((timer) => window.clearTimeout(timer));
      cleanupTimers.current = [];
    };
  }, []);

  return (
    <div
      className="how-event-stack"
      aria-hidden="true"
      onPointerLeave={() => setCursor({ x: 0, y: 0 })}
      onPointerMove={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 7;
        const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 4;
        setCursor({ x, y });
      }}
      style={
        {
          "--cursor-x-px": `${cursor.x.toFixed(2)}px`,
          "--cursor-y-px": `${cursor.y.toFixed(2)}px`,
        } as React.CSSProperties
      }
    >
      {cards
        .slice()
        .sort((a, b) => a.slot - b.slot)
        .map((card) => {
          const Icon = card.event.icon;
          const slotX = card.slot === 1 ? 14 : card.slot === 2 ? 7 : 0;
          const slotY =
            card.slot === -1
              ? "calc(0px - var(--card-step))"
              : card.slot === 0
                ? "0px"
                : card.slot === 1
                  ? "var(--card-step)"
                  : "calc(var(--card-step) + var(--card-step))";

          return (
            <article
              className={`how-event-card is-${card.phase}`}
              key={card.instanceId}
              style={
                {
                  "--slot-x": `${slotX}px`,
                  "--slot-y": slotY,
                  "--drift-duration": `${12.5 + card.slot * 1.4}s`,
                  "--drift-delay": `${card.slot * -1.6}s`,
                } as React.CSSProperties
              }
            >
              <div className="how-event-card-drift">
                <div className="how-event-card-inner">
                  <span className={`how-event-icon how-event-icon-${card.event.tone}`}>
                    <Icon size={23} />
                  </span>
                  <div>
                    <strong>{card.event.title}</strong>
                    <p>{card.event.detail}</p>
                  </div>
                  <time>{card.event.time}</time>
                </div>
              </div>
            </article>
          );
        })}
    </div>
  );
}

function FollowupActivityCard() {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(1);
  const scenario = followupScenarios[scenarioIndex];

  useEffect(() => {
    const isComplete = visibleCount >= scenario.steps.length;
    const timer = window.setTimeout(() => {
      if (isComplete) {
        setScenarioIndex((current) => (current + 1) % followupScenarios.length);
        setVisibleCount(1);
        return;
      }

      setVisibleCount((current) => current + 1);
    }, isComplete ? 2300 : 820);

    return () => window.clearTimeout(timer);
  }, [scenario.steps.length, visibleCount]);

  return (
    <aside className="followup-activity-card" aria-label="Automated follow-up timeline">
      <header className="followup-activity-header">
        <span className="followup-lead-avatar">{scenario.initials}</span>
        <span className="followup-lead-copy">
          <strong>{scenario.name}</strong>
          <small>{scenario.meta}</small>
        </span>
        <span className="followup-qualified-badge"><i />{scenario.badge}</span>
        <span className="followup-more" aria-hidden="true"><MoreVertical size={16} /></span>
      </header>

      <ol className="followup-activity-list" aria-live="polite">
        {scenario.steps.map((step, index) => {
          const Icon = step.icon;
          const isVisible = index < visibleCount;

          return (
            <li
              className={`followup-activity-item${isVisible ? " is-visible" : " is-hidden"}`}
              key={`${scenario.name}-${step.id}`}
              aria-hidden={!isVisible}
            >
              <span className="followup-activity-icon"><Icon size={17} /></span>
              <span className="followup-activity-copy">
                <strong>{step.title}</strong>
                <small>{step.detail}</small>
              </span>
              <time className="followup-activity-time">
                <span>{step.day}</span>
                <span>{step.time}</span>
              </time>
              {index < visibleCount - 1 && <span className="followup-activity-line" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </aside>
  );
}

function LandingPage() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setActiveTestimonial((current) => (current + 1) % testimonials.length);
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [activeTestimonial]);

  return (
    <main className="site-shell">
      <section className="hero-section" aria-labelledby="hero-heading">
        <div className="hero-art" aria-hidden="true">
          <picture>
            <source media="(min-width: 2200px)" srcSet={assetPath("/images/landing-hero-tall.png")} />
            <img src={assetPath("/images/landing-hero-tall.png")} alt="" />
          </picture>
        </div>

        <SiteHeader logoSrc={assetPath("/images/pf_transparent.png")} brandName="Acquisitions" />

        <div className="hero-grid">
          <div className="hero-copy">
            <h1 id="hero-heading">
              <span>Interest</span>
              <span>becomes</span>
              <span>opportunity.</span>
            </h1>
            <p className="hero-intro">
              Acquisitions carries the conversation forward, from first interest
              to the moment it's ready for you.
            </p>
            <div className="hero-cta">
              <a className="button button-light button-large" href={calendarHref}>
                See Acquisitions <ArrowRight size={18} />
              </a>
            </div>
          </div>

          <div className="hero-visual" aria-hidden="true">
            <div className="home-hero-storyboard">
              <SoftwareStoryboard />
            </div>
          </div>
        </div>

        <div className="hero-bottom-rail" aria-hidden="true">
          <p>
            <span>More leads.</span>
            <span>Less chasing.</span>
          </p>
          <div className="hero-progress">
            {["Conversation", "Qualification", "Coordination", "Opportunity"].map((item, index) => (
              <span className={index === 0 ? "is-active" : ""} key={item}>
                <i />
                {index + 1}. {item}
              </span>
            ))}
          </div>
          <p>
            <span>Built for</span>
            <span>forward-thinking teams.</span>
          </p>
        </div>
      </section>

      <section className="integration-band" aria-label="Integrations">
        <p>Works with the tools you already use</p>
        <div className="logo-row">
          <span className="wordmark">GoHighLevel</span>
          <span className="divider" />
          <span className="wordmark">Meta</span>
          <span className="divider" />
          <span className="wordmark">Twilio</span>
          <span className="divider" />
          <span className="wordmark">Google Calendar</span>
        </div>
      </section>

      <section className="followup-banner-section" id="how-it-works">
        <img className="followup-banner-image" src={assetPath("/images/landing-banner.png")} alt="" />
        <div className="followup-banner-content">
          <div className="followup-banner-copy">
            <h2>
              <span>Persistent follow-up.</span>
              <span>More opportunities.</span>
            </h2>
            <p>
              Most leads do not book on the first message. Acquisitions keeps
              following up across text and voice until the opportunity is resolved.
            </p>
            <a className="button button-light" href={siteHref("/how-it-works")}>
              See the follow-up flow <ArrowRight size={18} />
            </a>
          </div>
          <FollowupActivityCard />
          <div className="followup-banner-stat" aria-label="Appointment volume lift">
            <strong>3.2x</strong>
            <span>Appointment volume</span>
          </div>
        </div>
      </section>

      <section className="platform-section" id="platform">
        <div className="platform-copy">
          <p className="eyebrow">Beyond Acquisitions</p>
          <h2>A complete revenue workflow.</h2>
          <p>
            Acquisitions gets the opportunity to your team. Pathflow helps you take
            it from there with Conversations, Documents, and more.
          </p>
          <a className="text-link" href="#start">
            Explore the Pathflow platform <ArrowRight size={18} />
          </a>
        </div>
        <div className="platform-card-grid">
          {platformCards.map((card) => (
            <a className="platform-card" href={card.href} key={card.title}>
              <div className="platform-card-media">
                <img src={card.image} alt={card.imageAlt} />
              </div>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
              <ul>
                {card.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </a>
          ))}
        </div>
      </section>

      <section className="customer-story-section" id="customers">
        <div className="customer-story-heading">
          <p className="eyebrow">Customer stories</p>
          <h2>
            <span>Built for businesses</span>
            <span>that take growth seriously.</span>
          </h2>
        </div>

        <div className="customer-story-list" aria-live="polite">
          {testimonials.map((story, index) => (
            <figure
              className={`customer-story-quote${index === activeTestimonial ? " is-active" : ""}`}
              key={story.name}
              aria-hidden={index !== activeTestimonial}
            >
              <blockquote>"{story.quote}"</blockquote>
              <figcaption>
                <img className="customer-avatar" src={story.image} alt={story.name} />
                <span>
                  <strong>{story.name}</strong>
                  {story.company}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="story-controls" aria-label="Choose customer story">
          {testimonials.map((story, index) => (
            <button
              className={index === activeTestimonial ? "is-active" : ""}
              type="button"
              aria-label={`Show ${story.name} testimonial`}
              aria-pressed={index === activeTestimonial}
              key={story.name}
              onClick={() => setActiveTestimonial(index)}
            />
          ))}
        </div>
      </section>

      <section className="final-cta-section" id="start">
        <img className="final-cta-image" src={assetPath("/images/bottom-banner.png")} alt="" />
        <div className="final-cta-content">
          <p className="eyebrow">Pathflow acquisitions</p>
          <h2>
            <span>Less busywork.</span>
            <span>More what matters.</span>
          </h2>
          <p>
            Get your leads handled, your pipeline moving, and your time back.
          </p>
          <div className="final-cta-actions">
            <a className="button button-light" href={calendarHref}>
              Get started <ArrowRight size={17} />
            </a>
            <a className="final-cta-link" href={contactPageHref}>
              Talk to our team
            </a>
          </div>
        </div>

        <CanonicalFooter />
      </section>
    </main>
  );
}

function HowItWorksPage() {
  return (
    <main className="how-page">
      <section className="how-hero-section" aria-labelledby="how-hero-heading">
        <picture className="how-hero-art" aria-hidden="true">
          <source media="(min-width: 1700px)" srcSet={assetPath("/images/how_it_works/hero_wide.png")} />
          <img src={assetPath("/images/how_it_works/hero.png")} alt="" />
        </picture>

        <SiteHeader logoSrc={assetPath("/images/pf_transparent.png")} />

        <div className="how-hero-content">
          <h1 id="how-hero-heading">
            <span>Your leads keep moving.</span>
            <em>Even when you don't.</em>
          </h1>
          <p>
            Acquisitions responds, qualifies, follows up, and books so
            opportunities keep progressing while your team focuses on the work
            that deserves them.
          </p>
          <div className="how-hero-actions">
            <a className="button button-dark button-large" href="#how-flow">
              See it in action <ArrowRight size={17} />
            </a>
            <a className="button button-light button-large" href={calendarHref}>
              Book a walkthrough
            </a>
          </div>
          <span className="how-hero-note">More revenue. Less busywork. A calmer day.</span>
        </div>

        <blockquote className="how-hero-quote">
          "It quietly handles the leads so I can focus on growing the business."
          <span>Existing client</span>
        </blockquote>

        <HeroEventStack />
      </section>

      <section className="how-flow-section" id="how-flow">
        <div className="how-section-heading">
          <div>
            <p className="eyebrow">How it works</p>
            <h2>From interest to conversation.</h2>
            <p>A simple flow. A meaningful difference.</p>
          </div>
          <p>
            Acquisitions takes care of the work between a new lead and a booked
            appointment automatically, across SMS and voice.
          </p>
        </div>

        <div className="how-step-grid">
          {howSteps.map((step) => (
            <article className="how-step-card" key={step.number}>
              <StepVisual kind={step.kind} />
              <span>{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="time-returned-section">
        <img src={assetPath("/images/how_it_works/middle_banner.png")} alt="" />
        <div className="time-returned-copy">
          <p className="eyebrow">Time returned</p>
          <h2>The best automation is the work you stop thinking about.</h2>
          <p>
            Following up with every lead matters. Spending your day doing it
            doesn't have to.
          </p>
        </div>
        <div className="value-point-grid">
          {valuePoints.map((point) => {
            const Icon = point.icon;
            return (
              <article className="value-point" key={point.title}>
                <Icon size={30} />
                <h3>{point.title}</h3>
                <p>{point.text}</p>
              </article>
            );
          })}
        </div>
        <p className="time-returned-note">
          More opportunities.
          <span>More time for what matters.</span>
        </p>
      </section>

      <section className="stack-section">
        <div className="stack-heading">
          <div>
            <p className="eyebrow">Built around you</p>
            <h2>Works with your existing stack.</h2>
            <p>
              Acquisitions sits on top of the tools you already use, like
              GoHighLevel, Meta, and your calendars with no rip and replace
              required.
            </p>
          </div>
          <a className="button button-light" href={siteHref("/#platform")}>
            See all integrations <ArrowRight size={17} />
          </a>
        </div>

        <div className="stack-diagram">
          <StackPanel title="Lead sources" items={leadSources} footer="and more..." />
          <ArrowRight className="stack-arrow" size={26} />
          <div className="stack-core">
            <img src={assetPath("/images/pf_transparent.png")} alt="" />
            <span>Pathflow</span>
            <strong>Acquisitions</strong>
          </div>
          <ArrowRight className="stack-arrow" size={26} />
          <StackPanel title="The process" items={processSteps} />
          <ArrowRight className="stack-arrow" size={26} />
          <StackPanel title="Your CRM & tools" items={crmTools} footer="and more..." />
        </div>
      </section>

      <section className="control-section">
        <div className="control-media">
          <img src={assetPath("/images/how_it_works/product_photo.png")} alt="Acquisitions configuration screen" />
        </div>
        <div className="control-copy">
          <p className="eyebrow">You're in control</p>
          <h2>Automatic doesn't mean out of your hands.</h2>
          <p>
            You define the tone, the qualification criteria, calling windows,
            follow-up behavior, calendars, tags, and stop conditions.
            Acquisitions follows your rules and adapts as you learn.
          </p>
          <ul>
            {controlPoints.map((point) => (
              <li key={point}>
                <Check size={18} /> {point}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="how-testimonial-section" aria-label="Customer testimonials">
        <div className="how-testimonial-inner">
          <div className="how-testimonial-heading">
            <p className="eyebrow">Customer stories</p>
            <h2>Proof from teams already moving faster.</h2>
          </div>
          <div className="how-testimonial-grid">
            {testimonials.map((story) => (
              <figure className="how-testimonial-card" key={story.name}>
                <blockquote>"{story.quote}"</blockquote>
                <figcaption>
                  <img className="customer-avatar" src={story.image} alt={story.name} />
                  <span>
                    <strong>{story.name}</strong>
                    {story.company}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="how-bottom-cta-section">
        <img src={assetPath("/images/how_it_works/bottom_banner.png")} alt="" />
        <div className="how-bottom-cta-content">
          <p className="eyebrow">Ready to acquire more?</p>
          <h2>
            <span>More opportunities moved forward.</span>
            <span className="cta-serif-line">More time kept for yourself.</span>
          </h2>
          <p>See what Acquisitions could handle for your business.</p>
          <div className="how-bottom-actions">
            <a className="button button-light button-large" href={calendarHref}>
              Book a walkthrough <ArrowRight size={17} />
            </a>
          </div>
        </div>

        <CanonicalFooter />
      </section>
    </main>
  );
}

function PricingPage() {
  return (
    <main className="pricing-page">
      <section className="pricing-hero-section" aria-labelledby="pricing-hero-heading">
        <img className="pricing-hero-image" src={assetPath("/images/pricing/pricing-hero.png")} alt="" />

        <SiteHeader
          activeHref="/pricing"
          logoSrc={assetPath("/images/pf_transparent.png")}
          brandName="Acquisitions"
          startHref={calendarHref}
        />

        <div className="pricing-hero-content">
          <p className="eyebrow">Pricing</p>
          <h1 id="pricing-hero-heading">
            <span>Simple pricing</span>
            <span>for work that moves.</span>
          </h1>
          <p className="pricing-hero-subline">
            <span>Less manual work.</span>
            <span>More meaningful conversations.</span>
          </p>
        </div>

        <p className="pricing-hero-note">
          <span>A calmer</span>
          <span>way</span>
          <span>to grow</span>
        </p>
      </section>

      <section className="pricing-plans-section" aria-label="Pricing plans">
        <article className="pricing-main-card">
          <div className="pricing-plan-copy">
            <p className="eyebrow">Acquisitions</p>
            <div className="pricing-price">
              <span>$199</span>
              <small>per organization / month</small>
            </div>
            <p>
              For teams that want leads followed up, qualified, and carried toward booking.
            </p>
            <a className="button pricing-button-bone" href={calendarHref}>
              Get started <ArrowRight size={18} />
            </a>
            <small className="pricing-usage-note">Usage billed separately.</small>
          </div>

          <div className="pricing-feature-list" aria-label="Included features">
            {pricingFeatures.map((feature) => {
              const Icon = feature.icon;

              return (
                <div className="pricing-feature-row" key={feature.title}>
                  <Icon size={25} />
                  <span>
                    <strong>{feature.title}</strong>
                    <small>{feature.detail}</small>
                  </span>
                </div>
              );
            })}
          </div>
        </article>

        <article className="pricing-enterprise-card">
          <div className="pricing-enterprise-media">
            <img src={assetPath("/images/pricing/enterprise-pricing.png")} alt="" />
            <p>
              <span>Built</span>
              <span>for bigger</span>
              <span>possibilities</span>
            </p>
          </div>

          <div className="pricing-enterprise-copy">
            <p className="eyebrow">Enterprise</p>
            <h2>Custom deployment</h2>
            <p>
              For agencies, higher-volume teams, and tailored workflows. We'll design a
              solution that fits.
            </p>
            <a className="button pricing-button-outline" href={contactHref}>
              Contact us <ArrowRight size={17} />
            </a>
          </div>
        </article>
      </section>

      <section className="pricing-bottom-section">
        <img src={assetPath("/images/pricing/bottom-banner.png")} alt="" />
        <div className="pricing-bottom-copy">
          <h2>Built for the work ahead.</h2>
        </div>
        <p className="pricing-bottom-note">
          <span>Systems that</span>
          <span>turn opportunity</span>
          <span>into progress.</span>
        </p>

        <CanonicalFooter />
      </section>
    </main>
  );
}

function ContactPage() {
  const [isProductMenuOpen, setIsProductMenuOpen] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [submissionMessage, setSubmissionMessage] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [turnstileToken, setTurnstileToken] = useState("");
  const productMenuRef = useRef<HTMLDivElement | null>(null);
  const turnstileRef = useRef<HTMLDivElement | null>(null);
  const turnstileWidgetIdRef = useRef<string | null>(null);

  const toggleProduct = (product: string) => {
    setSelectedProducts((current) =>
      current.includes(product)
        ? current.filter((item) => item !== product)
        : [...current, product],
    );
  };

  const selectedProductLabel =
    selectedProducts.length > 0 ? selectedProducts.join(", ") : "Select one or more";

  useEffect(() => {
    if (!isProductMenuOpen) {
      return undefined;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!productMenuRef.current?.contains(event.target as Node)) {
        setIsProductMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsProductMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isProductMenuOpen]);

  useEffect(() => {
    if (!turnstileSiteKey || !turnstileRef.current) {
      return undefined;
    }

    let isDisposed = false;
    let script: HTMLScriptElement | null = document.querySelector("[data-turnstile-script='true']");

    const renderTurnstile = () => {
      if (isDisposed || !turnstileRef.current || !window.turnstile || turnstileWidgetIdRef.current) {
        return;
      }

      turnstileWidgetIdRef.current = window.turnstile.render(turnstileRef.current, {
        sitekey: turnstileSiteKey,
        action: "contact",
        theme: "dark",
        callback: (token) => setTurnstileToken(token),
        "expired-callback": () => setTurnstileToken(""),
        "error-callback": () => setTurnstileToken(""),
      });
    };

    if (script) {
      if (window.turnstile) {
        renderTurnstile();
      } else {
        script.addEventListener("load", renderTurnstile);
      }
    } else {
      script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.dataset.turnstileScript = "true";
      script.addEventListener("load", renderTurnstile);
      document.head.appendChild(script);
    }

    return () => {
      isDisposed = true;
      script?.removeEventListener("load", renderTurnstile);
      if (turnstileWidgetIdRef.current && window.turnstile?.remove) {
        window.turnstile.remove(turnstileWidgetIdRef.current);
      }
      turnstileWidgetIdRef.current = null;
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") || "");
    const workEmail = String(formData.get("email") || "");
    const company = String(formData.get("company") || "");
    const details = String(formData.get("details") || "");
    const website = String(formData.get("website") || "");
    const products = selectedProducts.length > 0 ? selectedProducts : ["Not specified"];

    setSubmissionStatus("sending");
    setSubmissionMessage("");

    if (!contactEndpoint) {
      setSubmissionStatus("error");
      setSubmissionMessage("Inquiry delivery is not configured yet.");
      return;
    }

    if (turnstileSiteKey && !turnstileToken) {
      setSubmissionStatus("error");
      setSubmissionMessage("Please complete the verification.");
      return;
    }

    try {
      const response = await fetch(contactEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          workEmail,
          company,
          products,
          details,
          website,
          turnstileToken,
          source: window.location.href,
        }),
      });

      if (!response.ok) {
        throw new Error(`Contact submission failed with ${response.status}`);
      }

      form.reset();
      setSelectedProducts([]);
      setIsProductMenuOpen(false);
      setTurnstileToken("");
      if (turnstileWidgetIdRef.current) {
        window.turnstile?.reset(turnstileWidgetIdRef.current);
      }
      setSubmissionStatus("success");
      setSubmissionMessage("Thanks, we'll get back to you shortly.");
    } catch {
      setTurnstileToken("");
      if (turnstileWidgetIdRef.current) {
        window.turnstile?.reset(turnstileWidgetIdRef.current);
      }
      setSubmissionStatus("error");
      setSubmissionMessage("Something went wrong. Please email info@getpathflow.com.");
    }
  };

  return (
    <main className="contact-page">
      <section className="contact-section" aria-labelledby="contact-heading">
        <SiteHeader
          activeHref="/contact"
          logoSrc={assetPath("/images/pf_transparent.png")}
          brandName="Acquisitions"
          startHref={calendarHref}
        />

        <div className="contact-layout">
          <div className="contact-form-panel">
            <p className="eyebrow">Contact</p>
            <h1 id="contact-heading">Let's talk.</h1>
            <p>
              Tell us what you're working with, what's getting in the way, and
              what you want to improve.
            </p>

            <form className="contact-form" onSubmit={handleSubmit}>
              <label className="contact-honeypot" aria-hidden="true">
                <span>Website</span>
                <input name="website" type="text" tabIndex={-1} autoComplete="off" maxLength={120} />
              </label>

              <label>
                <span>Name</span>
                <input name="name" type="text" placeholder="Your name" required maxLength={120} />
              </label>

              <label>
                <span>Work email</span>
                <input name="email" type="email" placeholder="you@company.com" required maxLength={180} />
              </label>

              <label>
                <span>Company</span>
                <input name="company" type="text" placeholder="Your company" maxLength={160} />
              </label>

              <div className="contact-multiselect-field" ref={productMenuRef}>
                <label className="contact-multiselect-label">
                  <span>What are you looking for?</span>
                  <input name="products" type="hidden" value={selectedProducts.join(", ")} readOnly />
                  <button
                    className="contact-multiselect-trigger"
                    type="button"
                    aria-haspopup="listbox"
                    aria-expanded={isProductMenuOpen}
                    onClick={() => setIsProductMenuOpen((open) => !open)}
                  >
                    <span>{selectedProductLabel}</span>
                    <ChevronDown size={18} />
                  </button>
                </label>

                {isProductMenuOpen && (
                  <div
                    className="contact-multiselect-menu"
                    role="listbox"
                    aria-label="Select products and services"
                    aria-multiselectable="true"
                  >
                    {contactProductOptions.map((product) => {
                      const isSelected = selectedProducts.includes(product);

                      return (
                        <button
                          className={isSelected ? "is-selected" : undefined}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          key={product}
                          onClick={() => toggleProduct(product)}
                        >
                          <span>{product}</span>
                          {isSelected && <Check size={16} />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <label>
                <span>Tell us a little about what you're trying to solve</span>
                <textarea name="details" placeholder="Share a few details..." rows={5} maxLength={2000} />
              </label>

              {turnstileSiteKey && (
                <div className="contact-turnstile" ref={turnstileRef} aria-label="Security verification" />
              )}

              <button
                className="button contact-submit-button"
                type="submit"
                disabled={submissionStatus === "sending"}
              >
                {submissionStatus === "sending" ? "Sending..." : "Send inquiry"} <ArrowRight size={18} />
              </button>
              {submissionMessage && (
                <p className={`contact-submit-message is-${submissionStatus}`} aria-live="polite">
                  {submissionMessage}
                </p>
              )}
            </form>
          </div>

          <aside className="contact-info-panel">
            <div className="contact-node-art" aria-hidden="true">
              <img src={assetPath("/images/contact/nodes.png")} alt="" />
            </div>
            <div className="contact-side-copy">
              <p className="eyebrow">For custom deployments</p>
              <h2>
                We work with teams that need Pathflow fitted around existing
                systems, workflows, and infrastructure.
              </h2>
            </div>

            <div className="contact-email-block">
              <p className="eyebrow">Prefer email?</p>
              <a href={contactHref}>{contactEmail}</a>
              <span>Typical reply: within one business day.</span>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function SoftwareStoryboard() {
  type StoryLead = {
    id: string;
    initials: string;
    name: string;
    location: string;
    service: string;
    address: string;
    propertyType: string;
    timeline: string;
    budget: string;
    appointmentDate: string;
    appointmentDay: string;
    appointmentTime: string;
  };
  type StoryMessage = {
    id: string;
    author: "lead" | "agent";
    text: string;
  };
  type StoryActivity = {
    id: string;
    initials: string;
    label: string;
    time: string;
  };

  const leadTimes = ["Just now", "12m ago", "28m ago", "1h ago"];
  const workflowLeads: StoryLead[] = [
    {
      id: "javier",
      initials: "JS",
      name: "Javier Silva",
      location: "Littleton, CO",
      service: "new HVAC system",
      address: "1234 Maple St, Denver, CO",
      propertyType: "Single-family",
      timeline: "Within 30 days",
      budget: "In line",
      appointmentDate: "Thu, Apr 17",
      appointmentDay: "17",
      appointmentTime: "2:00 PM",
    },
    {
      id: "mike",
      initials: "MK",
      name: "Mike Chen",
      location: "Denver, CO",
      service: "furnace replacement",
      address: "88 Ogden Ave, Denver, CO",
      propertyType: "Townhome",
      timeline: "This month",
      budget: "Confirmed",
      appointmentDate: "Fri, Apr 19",
      appointmentDay: "19",
      appointmentTime: "10:00 AM",
    },
    {
      id: "sarah",
      initials: "SC",
      name: "Sarah Kim",
      location: "Arvada, CO",
      service: "AC tune-up",
      address: "4107 Iris Ct, Arvada, CO",
      propertyType: "Single-family",
      timeline: "This week",
      budget: "Approved",
      appointmentDate: "Mon, Apr 22",
      appointmentDay: "22",
      appointmentTime: "4:00 PM",
    },
    {
      id: "ryan",
      initials: "RB",
      name: "Ryan Brooks",
      location: "Highlands Ranch, CO",
      service: "heat pump quote",
      address: "6207 Ridge Way, Highlands Ranch, CO",
      propertyType: "Single-family",
      timeline: "Within 14 days",
      budget: "In line",
      appointmentDate: "Fri, Apr 26",
      appointmentDay: "26",
      appointmentTime: "2:00 PM",
    },
    {
      id: "emily",
      initials: "EL",
      name: "Emily Lawson",
      location: "Castle Rock, CO",
      service: "ductless mini-split",
      address: "915 Canyon Dr, Castle Rock, CO",
      propertyType: "Detached home",
      timeline: "Next week",
      budget: "Confirmed",
      appointmentDate: "Sat, Apr 27",
      appointmentDay: "27",
      appointmentTime: "11:00 AM",
    },
  ];
  const [activeLeadIndex, setActiveLeadIndex] = useState(0);
  const [bookedLeadIndex, setBookedLeadIndex] = useState(0);
  const [chatStep, setChatStep] = useState(3);
  const [lifecycleStage, setLifecycleStage] = useState(0);
  const [bookingPulse, setBookingPulse] = useState(false);
  const activityCounter = useRef(0);
  const [activityItems, setActivityItems] = useState<StoryActivity[]>([
    { id: "initial-booked", initials: "A", label: "Appointment booked", time: "9:17" },
    { id: "initial-qualified", initials: "A", label: "Qualification complete", time: "9:16" },
    { id: "initial-conversation", initials: "A", label: "Acquisitions reply", time: "9:14" },
    { id: "initial-form", initials: "A", label: "Form submitted", time: "9:13" },
    { id: "initial-lead", initials: "JS", label: "Lead created", time: "9:12" },
  ]);
  const calendarDays = ["31", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27"];

  const activeLead = workflowLeads[activeLeadIndex];
  const bookedLead = workflowLeads[bookedLeadIndex];
  const leads = workflowLeads.slice(activeLeadIndex).concat(workflowLeads.slice(0, activeLeadIndex)).slice(0, 4);
  const qualification = [
    { label: "Service need", value: "Matched", stage: 1 },
    { label: "Homeowner", value: "Verified", stage: 2 },
    { label: "Property", value: activeLead.propertyType, stage: 3 },
    { label: "Timeline", value: activeLead.timeline, stage: 4 },
    { label: "Budget", value: activeLead.budget, stage: 5 },
  ];
  const chatMessages: StoryMessage[] = [
    {
      id: `${activeLead.id}-intro`,
      author: "lead",
      text: `Hi, I need a quote for a ${activeLead.service}.`,
    },
    {
      id: `${activeLead.id}-reply`,
      author: "agent",
      text: "I can help. Are you the homeowner, and what address should I check?",
    },
    {
      id: `${activeLead.id}-address`,
      author: "lead",
      text: `Yes, I own it. The address is ${activeLead.address}.`,
    },
    {
      id: `${activeLead.id}-property`,
      author: "agent",
      text: "Thanks. I matched the request and pulled the property details.",
    },
    {
      id: `${activeLead.id}-details`,
      author: "lead",
      text: `It's a ${activeLead.propertyType.toLowerCase()} home.`,
    },
    {
      id: `${activeLead.id}-timeline-prompt`,
      author: "agent",
      text: "Great. What timeline and budget range should I note?",
    },
    {
      id: `${activeLead.id}-timeline`,
      author: "lead",
      text: `${activeLead.timeline}. The budget is ${activeLead.budget.toLowerCase()}.`,
    },
    {
      id: `${activeLead.id}-booking`,
      author: "agent",
      text: `You're qualified. I can book ${activeLead.appointmentDate} at ${activeLead.appointmentTime}.`,
    },
  ];
  const appointmentSelected = lifecycleStage >= 6;
  const appointmentTimes = ["10:00 AM", activeLead.appointmentTime, "4:00 PM"].filter(
    (time, index, times) => times.indexOf(time) === index,
  );

  useEffect(() => {
    const timers: number[] = [];
    const addActivity = (label: string, initials = "A", delay = 0) => {
      const timer = window.setTimeout(() => {
        activityCounter.current += 1;
        setActivityItems((items) => [
          {
            id: `${activeLead.id}-${label}-${activityCounter.current}`,
            initials,
            label,
            time: delay <= 900 ? "now" : "just now",
          },
          ...items,
        ].slice(0, 6));
      }, delay);

      timers.push(timer);
    };

    setChatStep(3);
    setLifecycleStage(0);
    setBookingPulse(false);
    addActivity("Lead created", activeLead.initials);
    addActivity("Form submitted", "A", 460);

    timers.push(window.setTimeout(() => {
      setChatStep(4);
      setLifecycleStage(1);
      addActivity("Service need matched");
    }, 900));

    timers.push(window.setTimeout(() => {
      setChatStep(5);
      setLifecycleStage(2);
      addActivity("Homeowner verified");
    }, 1580));

    timers.push(window.setTimeout(() => {
      setChatStep(6);
      addActivity("Acquisitions reply");
    }, 2240));

    timers.push(window.setTimeout(() => {
      setLifecycleStage(3);
      setChatStep(7);
      addActivity("Property confirmed");
    }, 2920));

    timers.push(window.setTimeout(() => {
      setChatStep(8);
    }, 3560));

    timers.push(window.setTimeout(() => {
      setLifecycleStage(4);
      addActivity("Timeline confirmed");
    }, 4240));

    timers.push(window.setTimeout(() => {
      setLifecycleStage(5);
      addActivity("Qualification complete");
    }, 4920));

    timers.push(window.setTimeout(() => {
      setLifecycleStage(6);
      addActivity("Appointment selected");
    }, 5680));

    timers.push(window.setTimeout(() => {
      setBookedLeadIndex(activeLeadIndex);
      setBookingPulse(true);
      setLifecycleStage(7);
      addActivity("Appointment booked");
    }, 6460));

    timers.push(window.setTimeout(() => {
      setBookingPulse(false);
    }, 7600));

    timers.push(window.setTimeout(() => {
      setActiveLeadIndex((current) => (current + 1) % workflowLeads.length);
    }, 8800));

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [activeLeadIndex]);

  return (
    <div
      className="software-storyboard"
      role="img"
      aria-label="Acquisitions software workflow with leads, AI conversation, qualification, calendar booking, and activity updates."
    >
      <article
        className="software-panel software-panel-leads"
        style={
          {
            "--float-delay": "-1.2s",
            "--float-duration": "20s",
            "--float-distance": "1.6px",
            "--panel-rotate": "-0.32deg",
            "--panel-shift-x": "-5px",
            "--panel-shift-y": "-2px",
          } as React.CSSProperties
        }
      >
        <div className="software-panel-surface">
          <header className="software-panel-header">
            <strong>New Leads</strong>
            <span><i />{12 + activeLeadIndex} new</span>
          </header>
          <div className="software-lead-list">
            {leads.map((lead, index) => (
              <div className={`software-lead-row${index === 0 ? " is-new" : ""}`} key={lead.id}>
                <span className={`software-avatar software-avatar-${index === 0 ? "active" : "muted"}`}>
                  {lead.initials}
                </span>
                <span>
                  <strong>{lead.name}</strong>
                  <small>{lead.location}</small>
                </span>
                <time>{leadTimes[index]}</time>
              </div>
            ))}
          </div>
          <span className="software-link">View all leads <ArrowRight size={11} /></span>
        </div>
      </article>

      <article
        className="software-panel software-panel-chat"
        style={
          {
            "--float-delay": "-2.8s",
            "--float-duration": "21.5s",
            "--float-distance": "1.9px",
            "--panel-rotate": "0.2deg",
            "--panel-shift-x": "4px",
            "--panel-shift-y": "1px",
          } as React.CSSProperties
        }
      >
        <div className="software-panel-surface">
          <header className="software-chat-header">
            <span className="software-agent-avatar">
              <img src={assetPath("/images/pf_transparent.png")} alt="" />
            </span>
            <strong>Acquisitions</strong>
            <span className="software-online"><i />Online</span>
            <MoreVertical size={15} />
          </header>
          <div className="software-message-list">
            {chatMessages.slice(0, chatStep).map((message, index) => (
              <div
                className={`software-message-row${message.author === "agent" ? " is-agent" : ""}${index === chatStep - 1 ? " is-new" : ""}`}
                key={message.id}
              >
                {message.author === "lead" && (
                  <span className="software-avatar software-avatar-muted">{activeLead.initials}</span>
                )}
                <p className={`software-message ${message.author === "agent" ? "is-outbound" : "is-inbound"}`}>
                  {message.text}
                </p>
                {message.author === "agent" && (
                  <span className="software-avatar software-avatar-agent">
                    <img src={assetPath("/images/pf_transparent.png")} alt="" />
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="software-compose">
            <span>Type a message...</span>
            <Send size={15} />
          </div>
        </div>
      </article>

      <article
        className="software-panel software-panel-qualification"
        style={
          {
            "--float-delay": "-4.4s",
            "--float-duration": "19.5s",
            "--float-distance": "1.4px",
            "--panel-rotate": "-0.2deg",
            "--panel-shift-x": "7px",
            "--panel-shift-y": "-4px",
          } as React.CSSProperties
        }
      >
        <div className="software-panel-surface">
          <header className="software-panel-title">Qualification</header>
          <div className="software-check-list">
            {qualification.map((item) => {
              const isComplete = lifecycleStage >= item.stage;

              return (
              <div className={`software-check-row${isComplete ? " is-complete" : ""}`} key={item.label}>
                <span className="software-check-status">
                  {isComplete ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                </span>
                <strong>{item.label}</strong>
                <span>{isComplete ? item.value : "Pending"}</span>
              </div>
              );
            })}
          </div>
          <span className="software-link">View full details <ArrowRight size={11} /></span>
        </div>
      </article>

      <article
        className="software-panel software-panel-calendar"
        style={
          {
            "--float-delay": "-1.9s",
            "--float-duration": "20.5s",
            "--float-distance": "1.5px",
            "--panel-rotate": "0.24deg",
            "--panel-shift-x": "-2px",
            "--panel-shift-y": "5px",
          } as React.CSSProperties
        }
      >
        <div className="software-panel-surface">
          <header className="software-calendar-header">
            <strong>Select appointment</strong>
            <span>April 2024 <ArrowRight size={12} /></span>
          </header>
          <div className="software-calendar-grid">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <b key={day}>{day}</b>
            ))}
            {calendarDays.map((day, index) => (
              <span
                className={
                  day === activeLead.appointmentDay && appointmentSelected
                    ? "is-selected"
                    : day === activeLead.appointmentDay || day === "26"
                      ? "is-soft"
                      : ""
                }
                key={`${day}-${index}`}
              >
                {day}
              </span>
            ))}
          </div>
          <div className="software-time-row">
            {appointmentTimes.map((time) => (
              <span className={time === activeLead.appointmentTime && appointmentSelected ? "is-selected" : ""} key={time}>
                {time}
              </span>
            ))}
          </div>
        </div>
      </article>

      <article
        className={`software-panel software-panel-booked${bookingPulse ? " is-booking" : ""}`}
        style={
          {
            "--float-delay": "-3.6s",
            "--float-duration": "22s",
            "--float-distance": "1.6px",
            "--panel-rotate": "0.18deg",
            "--panel-shift-x": "5px",
            "--panel-shift-y": "-2px",
          } as React.CSSProperties
        }
      >
        <div className="software-panel-surface">
          <span className="software-success-mark"><Check size={31} /></span>
          <div className="software-booked-copy" key={`${bookedLead.id}-booked-copy`}>
            <span className="software-booked-name">{bookedLead.name}</span>
            <strong>Appointment Booked</strong>
            <span className="software-detail"><CalendarDays size={16} /> {bookedLead.appointmentDate} - {bookedLead.appointmentTime}</span>
            <span className="software-detail"><MapPin size={16} /> {bookedLead.address}</span>
            <p>A confirmation email and text have been sent to the lead.</p>
          </div>
        </div>
      </article>

      <article
        className="software-panel software-panel-activity"
        style={
          {
            "--float-delay": "-5.3s",
            "--float-duration": "21s",
            "--float-distance": "1.5px",
            "--panel-rotate": "-0.22deg",
            "--panel-shift-x": "-6px",
            "--panel-shift-y": "3px",
          } as React.CSSProperties
        }
      >
        <div className="software-panel-surface">
          <header className="software-activity-header">
            <DatabaseZap size={18} />
            <strong>Activity Feed</strong>
          </header>
          <div className="software-activity-list">
            {activityItems.map((item, index) => (
              <div className={`software-activity-row${index === 0 ? " is-new" : ""}`} key={item.id}>
                <span className="software-avatar software-avatar-soft">{item.initials}</span>
                <strong>{item.label}</strong>
                <time>{item.time}</time>
              </div>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
}

function StepVisual({ kind }: Pick<HowStep, "kind">) {
  if (kind === "lead") {
    return (
      <div className="step-visual step-visual-lead">
        <div className="mini-lead-card">
          <div className="mini-source">f</div>
          <div>
            <strong>New Lead</strong>
            <span>Sarah Mitchell</span>
            <small>Facebook Lead Ad</small>
          </div>
          <time>now</time>
        </div>
      </div>
    );
  }

  if (kind === "conversation") {
    return (
      <div className="step-visual step-visual-chat">
        <div className="chat-bubble inbound">Hi! I'm Sarah, looking for a quote for AC installation.</div>
        <div className="chat-bubble outbound">
          Great, I can help with that. Are you looking to install a new system or replace an existing one?
        </div>
        <div className="typing-dots">
          <span />
          <span />
          <span />
        </div>
      </div>
    );
  }

  if (kind === "intent") {
    return (
      <div className="step-visual step-visual-intent">
        {["Service needed: AC installation", "Property type: Single family home", "Timeline: Within 1-3 months", "Budget: Confirmed", "Qualified"].map((item) => (
          <span key={item}>
            <CheckCircle2 size={16} /> {item}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="step-visual step-visual-booking">
      <div className="mini-booking-card">
        <CalendarCheck size={22} />
        <div>
          <strong>Appointment Booked</strong>
          <span>Sarah Mitchell</span>
          <small>AC Installation Consultation</small>
          <small>Thu, Sep 25 - 2:00 PM</small>
        </div>
        <CheckCircle2 size={18} />
      </div>
    </div>
  );
}

function StackPanel({
  title,
  items,
  footer,
}: {
  title: string;
  items: { icon: React.ElementType; label: string }[];
  footer?: string;
}) {
  return (
    <article className="stack-panel">
      <h3>{title}</h3>
      <div>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <span key={item.label}>
              <Icon size={18} /> {item.label}
            </span>
          );
        })}
      </div>
      {footer && <p>{footer}</p>}
    </article>
  );
}

function App() {
  const pathname = window.location.pathname.replace(/\/$/, "");
  const isHowItWorksPage = pathname.endsWith("/how-it-works");
  const isPricingPage = pathname.endsWith("/pricing");
  const isContactPage = pathname.endsWith("/contact");
  const activeHref = isHowItWorksPage
    ? "/how-it-works"
    : isPricingPage
      ? "/pricing"
      : isContactPage
        ? "/contact"
        : undefined;
  const mobileHeader = (
    <SiteHeader
      activeHref={activeHref}
      className="mobile-site-header"
      logoSrc={assetPath("/images/pf_transparent.png")}
      brandName="Acquisitions"
      startHref={calendarHref}
    />
  );
  const page = isHowItWorksPage ? (
    <HowItWorksPage />
  ) : isPricingPage ? (
    <PricingPage />
  ) : isContactPage ? (
    <ContactPage />
  ) : (
    <LandingPage />
  );

  return (
    <>
      {mobileHeader}
      {page}
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

export default App;
