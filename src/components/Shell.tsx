/**
 * Shell — root app layout: left nav sidebar + main content area.
 *
 * Sidebar structure:
 *   ANALYSIS
 *     01  Product Profile       ▶ (expandable section links)
 *     02  Functional Promise    ▶
 *     03  Constraints           ▶
 *     04  Market Competition
 *     05  New Market Discovery
 *     06  New Market Analysis    ← tabbed
 *     08  Strategic Synthesis    ← conclusion
 */

import { useState, useEffect, useCallback } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

interface NavSection {
  id: string;
  label: string;
  sub?: boolean;
}

interface NavItem {
  to: string;
  label: string;
  kicker: string;
  sections?: NavSection[];
}

/** Type labels for analysis pages from manifest */
const TYPE_LABELS: Record<string, string> = {
  company_profile: "Company Profile",
  product_portfolio: "Product Portfolio",
  product_decomposition: "Product Profile",
  functional_promise: "Functional Promise",
  constraints: "Constraints",
  capability_assessment: "Capability Assessment",
  home_market_competition: "Home Market",
  market_discovery: "Market Discovery",
  final_ranking: "Final Ranking",
  product_validation: "Product Validation",
  financial_scenarios: "Financial Scenarios",
  implementation_roadmap: "Implementation Roadmap",
  transition_model: "Transition Model",
  go_no_go_decision: "Go/No-Go Decision",
  product_ranking: "Product Ranking",
};

/** Route paths for analysis page types */
const TYPE_ROUTES: Record<string, string> = {
  company_profile: "/overview",
  product_portfolio: "/overview",
  product_decomposition: "/product",
  functional_promise: "/functional-promise",
  constraints: "/constraints",
  capability_assessment: "/constraints",
  home_market_competition: "/home-market",
  market_discovery: "/discovery",
  final_ranking: "/overview",
};

/** Build nav items from manifest (dynamic) with fallback to static */
function buildNavFromManifest(): NavItem[] {
  const manifest = (window as any).__CLAYTON_MANIFEST__;
  if (!manifest?.analysis_pages) return staticNavItems;

  const items: NavItem[] = [
    staticNavItems[0], // Overview with sections
  ];

  let idx = 1;
  for (const page of manifest.analysis_pages) {
    const label = TYPE_LABELS[page.type] || page.title;
    const route = TYPE_ROUTES[page.type];
    if (!route || route === "/overview") continue;
    if (items.some(i => i.to === route)) continue;
    const staticMatch = staticNavItems.find(s => s.to === route);
    if (staticMatch) {
      items.push({ ...staticMatch, kicker: String(idx).padStart(2, "0") });
    } else {
      items.push({ to: route, label, kicker: String(idx).padStart(2, "0") });
    }
    idx++;
  }

  if (manifest.markets?.length > 0) {
    items.push({ to: "/analysis", label: "Market Analysis", kicker: String(idx).padStart(2, "0") });
    idx++;
  }

  // Always append Strategic Synthesis as the final item
  items.push({ ...staticNavItems[staticNavItems.length - 1], kicker: String(idx).padStart(2, "0") });

  return items;
}

/** Static nav items with section anchors for chapter subsections */
const staticNavItems: NavItem[] = [
  {
    to: "/overview",
    label: "Overview",
    kicker: "00",
    sections: [
      { id: "ovw-question",   label: "The Question" },
      { id: "ovw-company",    label: "About ZOLLERN" },
      { id: "ovw-hierarchy",  label: "Division → Product" },
      { id: "ovw-product",    label: "Product Variants" },
      { id: "ovw-howto",      label: "How to Read" },
    ],
  },
  {
    to: "/product",
    label: "Product Profile",
    kicker: "01",
    sections: [
      { id: "prod-three-levels", label: "What the Product Does" },
      { id: "prod-tech-class",   label: "Technology Classification" },
      { id: "prod-fp",           label: "Functional Promise" },
      { id: "prod-commodity-fp", label: "Commodity-Level FP", sub: true },
      { id: "prod-features",     label: "Features" },
      { id: "prod-specs",        label: "Specifications" },
      { id: "prod-constraints",  label: "Key Constraints" },
      { id: "prod-unspsc",       label: "UNSPSC Classification" },
      { id: "prod-validation",   label: "Validation Notes" },
      { id: "prod-sources",      label: "Sources" },
    ],
  },
  {
    to: "/functional-promise",
    label: "Functional Promise",
    kicker: "02",
    sections: [
      { id: "fp-mechanism",    label: "Underlying Mechanism" },
      { id: "fp-product-fp",   label: "Product Functional Promise" },
      { id: "fp-unspsc",       label: "UNSPSC / Product Group" },
      { id: "fp-extension",    label: "FP Extension", sub: true },
      { id: "fp-bom",          label: "BOM Position" },
      { id: "fp-complements",  label: "Required Complements" },
      { id: "fp-downstream",   label: "Downstream Analysis" },
      { id: "fp-quality",      label: "Quality Checklist" },
      { id: "fp-sources",      label: "Sources" },
    ],
  },
  {
    to: "/constraints",
    label: "Constraints",
    kicker: "03",
    sections: [
      { id: "con-summary",       label: "Summary" },
      { id: "con-detailed",      label: "Detailed Constraints" },
      { id: "con-regulatory",    label: "Regulatory", sub: true },
      { id: "con-physical",      label: "Physical", sub: true },
      { id: "con-operational",   label: "Operational", sub: true },
      { id: "con-economic",      label: "Economic", sub: true },
      { id: "con-environmental", label: "Environmental", sub: true },
      { id: "con-coverage",      label: "Coverage Table" },
      { id: "con-absolute",      label: "Absolute vs Conditional" },
      { id: "con-downstream",    label: "Downstream Analysis" },
      { id: "con-sources",       label: "Sources" },
    ],
  },
  { to: "/home-market", label: "Home Market", kicker: "04" },
  { to: "/capabilities", label: "Capability Register", kicker: "05" },
  { to: "/adjacency", label: "Adjacency Analysis", kicker: "06" },
  { to: "/discovery", label: "Market Discovery", kicker: "07" },
  { to: "/analysis", label: "Market Analysis", kicker: "08" },
  {
    to: "/synthesis",
    label: "Strategic Synthesis",
    kicker: "09",
    sections: [
      { id: "syn-executive",      label: "Executive Summary" },
      { id: "syn-opportunities",  label: "Top 15 Opportunities" },
      { id: "syn-themes",         label: "Capability Themes" },
      { id: "syn-classification", label: "Market Classification" },
      { id: "syn-vertical",       label: "Vertical Integration" },
    ],
  },
];

export default function Shell() {
  const location = useLocation();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [projectInfo, setProjectInfo] = useState<{company: string; division: string; archetype: string} | null>(null);
  const [navItems, setNavItems] = useState<NavItem[]>(staticNavItems);
  const [pendingScroll, setPendingScroll] = useState<string | null>(null);

  // Load project info and build dynamic nav
  useEffect(() => {
    fetch('./data/project.json')
      .then(r => r.json())
      .then(p => setProjectInfo(p))
      .catch(() => setProjectInfo({ company: "Clayton Analysis", division: "", archetype: "Analysis" }));

    const checkManifest = setInterval(() => {
      if ((window as any).__CLAYTON_MANIFEST__) {
        setNavItems(buildNavFromManifest());
        clearInterval(checkManifest);
      }
    }, 200);
    setTimeout(() => clearInterval(checkManifest), 5000);
    return () => clearInterval(checkManifest);
  }, []);

  // Auto-expand when the active route changes
  useEffect(() => {
    const activeItem = navItems.find((item) =>
      location.pathname === item.to ||
      location.pathname.startsWith(item.to + "/") ||
      (item.to === "/overview" && location.pathname === "/")
    );
    if (activeItem?.sections) {
      setExpanded((prev) => ({ ...prev, [activeItem.to]: true }));
    }
  }, [location.pathname, navItems]);

  // Execute pending scroll after navigation completes and DOM updates
  useEffect(() => {
    if (!pendingScroll) return;
    const raf = requestAnimationFrame(() => {
      setTimeout(() => {
        const el = document.getElementById(pendingScroll);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        setPendingScroll(null);
      }, 100);
    });
    return () => cancelAnimationFrame(raf);
  }, [pendingScroll, location.pathname]);

  /**
   * Navigate to a section anchor. If already on the target page, scroll
   * immediately. If on a different page, navigate first then scroll after render.
   */
  const goToSection = useCallback((parentRoute: string, sectionId: string) => {
    const isOnPage =
      location.pathname === parentRoute ||
      (parentRoute === "/overview" && location.pathname === "/");

    if (isOnPage) {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      setPendingScroll(sectionId);
      navigate(parentRoute);
    }
  }, [location.pathname, navigate]);

  function toggle(to: string) {
    setExpanded((prev) => ({ ...prev, [to]: !prev[to] }));
  }

  return (
    <div className="app-shell">
      {/* Left navigation sidebar */}
      <aside className="app-sidebar">
        {/* Brand block — reads from project.json */}
        <div className="app-sidebar__brand">
          <div className="app-sidebar__brand-kicker">Clayton / Node42</div>
          <div className="app-sidebar__brand-title">
            {projectInfo?.company || "Loading..."}
          </div>
          <div className="app-sidebar__brand-sub">
            {projectInfo?.archetype || "Analysis"}
          </div>
        </div>

        {/* Navigation */}
        <div className="app-sidebar__section">
          <div className="app-sidebar__section-label">Analysis</div>
          <nav>
            {navItems.map((item) => {
              const hasSections = item.sections && item.sections.length > 0;
              const isOpen = hasSections && !!expanded[item.to];

              return (
                <div key={item.to}>
                  {/* Main nav row */}
                  <div style={{ display: "flex", alignItems: "stretch" }}>
                    <NavLink
                      to={item.to}
                      end={item.to === "/overview" || item.to === "/product"}
                      className={({ isActive }) =>
                        ["app-nav-link", isActive ? "is-active" : ""].filter(Boolean).join(" ")
                      }
                      style={{ flex: 1, minWidth: 0 }}
                    >
                      <span className="app-nav-link__num">{item.kicker}</span>
                      <span>{item.label}</span>
                    </NavLink>

                    {/* Chevron toggle — only for items with sections */}
                    {hasSections && (
                      <button
                        onClick={() => toggle(item.to)}
                        title={isOpen ? "Collapse sections" : "Expand sections"}
                        style={{
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 28,
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                          color: "var(--text-gray-dark)",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            fontSize: 9,
                            transition: "transform 0.2s ease",
                            transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                            color: isOpen ? "var(--accent-yellow)" : "var(--text-gray-dark)",
                          }}
                        >
                          ▶
                        </span>
                      </button>
                    )}
                  </div>

                  {/* Section links — slide in/out */}
                  {hasSections && (
                    <div
                      style={{
                        maxHeight: isOpen ? `${item.sections!.length * 26 + 8}px` : "0px",
                        overflow: "hidden",
                        transition: "max-height 0.25s ease",
                      }}
                    >
                      <div style={{ paddingBottom: 4 }}>
                        {item.sections!.map((sec) => (
                          <button
                            key={sec.id}
                            onClick={() => goToSection(item.to, sec.id)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              width: "100%",
                              textAlign: "left",
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              padding: `3px 10px 3px ${sec.sub ? 36 : 28}px`,
                              fontSize: 11,
                              color: "var(--text-gray-dark)",
                              fontFamily: "inherit",
                              lineHeight: 1.4,
                              transition: "color 0.15s ease",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.color = "var(--accent-yellow)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.color = "var(--text-gray-dark)")
                            }
                          >
                            <span
                              style={{
                                fontSize: 8,
                                opacity: 0.5,
                                flexShrink: 0,
                              }}
                            >
                              {sec.sub ? "└" : "·"}
                            </span>
                            {sec.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Tagline at bottom */}
        <div style={{
          padding: "20px",
          marginTop: "auto",
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          color: "var(--text-gray-dark)",
          lineHeight: 1.6,
          borderTop: "1px solid var(--border-subtle)",
        }}>
          <div style={{ textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 3 }}>
            Archetype
          </div>
          <div style={{ color: "var(--text-gray-light)", fontSize: 11 }}>
            {projectInfo?.archetype || "Analysis"}
          </div>
          <div style={{ color: "var(--text-gray-light)", fontSize: 11, marginTop: 8 }}>
            {projectInfo?.division || ""}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
