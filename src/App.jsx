import React, { useEffect, useState } from 'react';
import { motion, useAnimation, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend
} from 'chart.js';
import { Menu, X } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import './App.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Setup interactive cursor
const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const updateMousePosition = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    const handleMouseOver = (e) => {
      const target = e.target;
      if (
        (target.tagName && target.tagName.toLowerCase() === 'a') ||
        (target.tagName && target.tagName.toLowerCase() === 'button') ||
        target.closest('.glass-card') ||
        target.closest('.liquid-glass') ||
        target.closest('.hero-tag') ||
        target.closest('.flow-node') ||
        target.closest('.qb-item') ||
        target.closest('.hero-stat')
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mouseover', handleMouseOver);
    
    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  return (
    <motion.div
      className={`custom-cursor ${isHovering ? 'hovering' : ''}`}
      animate={{
        x: mousePosition.x,
        y: mousePosition.y
      }}
      transition={{ type: 'spring', damping: 28, mass: 0.5, stiffness: 300 }}
    />
  );
};

// Reveal blocks
const Reveal = ({ children, delay = 0, yOffset = 40 }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: yOffset },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, delay, ease: [0.175, 0.885, 0.32, 1.275] } }
      }}
    >
      {children}
    </motion.div>
  );
};

// SVG Animated Progress Bar
const AnimatedBar = ({ percentage, colorClass }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true });

  useEffect(() => {
    if (inView) controls.start('visible');
  }, [controls, inView]);

  return (
    <div className="mini-bar" ref={ref}>
      <motion.div 
        className={`mini-fill ${colorClass}`}
        initial="hidden" animate={controls}
        variants={{
          hidden: { width: 0 },
          visible: { width: `${percentage}%`, transition: { duration: 1.5, ease: "easeOut", delay: 0.2 } }
        }}
      />
    </div>
  );
};

const commonChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { 
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(8, 8, 12, 0.9)',
      titleFont: { size: 14, family: "'DM Serif Display', serif" },
      bodyFont: { size: 14, family: "'DM Sans', sans-serif" },
      padding: 12,
      borderColor: 'rgba(255,255,255,0.1)',
      borderWidth: 1,
      displayColors: false
    }
  },
  scales: {
    y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.04)' } },
    x: { grid: { display: false } }
  },
  animation: {
    duration: 2000,
    easing: 'easeOutQuart'
  }
};

const statContexts = {
  lifeExpectancy: {
    title: "Life Expectancy",
    india: "70.8",
    taiwan: "80.9",
    unit: "yrs",
    context: "India's life expectancy has improved from 63 in 2000, yet systemic inequities and rural-urban divides keep the average lower. Taiwan's universal access to advanced medical care allows it to match Western European longevity standards at a fraction of the cost."
  },
  populationCovered: {
    title: "Population Covered",
    india: "37",
    taiwan: "99",
    unit: "%",
    context: "India relies on fragmented schemes like Ayushman Bharat targeting the poor, leaving hundreds of millions in the 'missing middle' uninsured. Taiwan implemented mandatory National Health Insurance in 1995, achieving 99.9% universal coverage almost overnight."
  },
  oopBurden: {
    title: "Out-of-Pocket Burden",
    india: "40",
    taiwan: "12",
    unit: "%",
    context: "In India, paying directly out-of-pocket is a primary driver of medical impoverishment, forcing many to forego necessary care. Taiwan's single-payer system absorbs the vast majority of costs; copayments are nominal and capped for low-income citizens, ensuring financial immunity."
  }
};

function App() {
  const { scrollYProgress } = useScroll();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeStatModal, setActiveStatModal] = useState(null);
  const [hoveredMember, setHoveredMember] = useState(null);
  
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    setIsMenuOpen(false); // Close mobile drawer when a link is clicked
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <CustomCursor />
      <div className="global-glow"></div>
      
      <motion.div className="scroll-progress" style={{ scaleX }} />
      
      <motion.nav 
        className="nav-container"
        initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <a href="#hero" onClick={(e) => handleNavClick(e, 'hero')} className="nav-brand">Healthcare Compared</a>
        <div className={`nav-links ${isMenuOpen ? 'mobile-open' : ''}`}>
          <a href="#overview" onClick={(e) => handleNavClick(e, 'overview')}>Overview</a>
          <a href="#benchmarks" onClick={(e) => handleNavClick(e, 'benchmarks')}>Benchmarks</a>
          <a href="#outcomes" onClick={(e) => handleNavClick(e, 'outcomes')}>Outcomes</a>
          <a href="#structure" onClick={(e) => handleNavClick(e, 'structure')}>Structure</a>
          <a href="#finances" onClick={(e) => handleNavClick(e, 'finances')}>Finances</a>
          <a href="#digital" onClick={(e) => handleNavClick(e, 'digital')}>Digital</a>
          <a href="#workforce" onClick={(e) => handleNavClick(e, 'workforce')}>Workforce</a>
          <a href="#system-loops" onClick={(e) => handleNavClick(e, 'system-loops')}>System Loops</a>
          <a href="#verdict" onClick={(e) => handleNavClick(e, 'verdict')}>Verdict</a>
        </div>
        <div className="nav-flag">
          <motion.span whileHover={{ scale: 1.1 }}>IN India</motion.span> 
          <span style={{opacity: 0.5}}>vs</span> 
          <motion.span whileHover={{ scale: 1.1 }}>TW Taiwan</motion.span>
        </div>
        <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </motion.nav>

      {/* ── HERO ── */}
      <section id="hero" className="hero-section">
        <Reveal yOffset={60}>
          <motion.div className="hero-tag" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <motion.div 
              className="hero-tag-dot"
              animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
            Healthcare Systems · Deep Comparison
          </motion.div>
          <h1 className="hero-title">
            <motion.span className="text-india" drag dragConstraints={{ left:0, right:0, top:0, bottom:0 }} dragElastic={0.2} style={{display:'inline-block'}}>India</motion.span><br/>
            <span style={{ fontSize: '0.4em', fontStyle: 'italic', color: 'var(--text3)' }}>vs</span><br/>
            <motion.span className="text-taiwan" drag dragConstraints={{ left:0, right:0, top:0, bottom:0 }} dragElastic={0.2} style={{display:'inline-block'}}>Taiwan</motion.span>
          </h1>
          <p className="hero-desc">
            Two healthcare systems, two philosophies. One fragmented and scaling, one unified and mature. Here's what the data reveals.
          </p>
          
          <div className="hero-stats">
            <motion.div 
              className="hero-stat" 
              onClick={() => setActiveStatModal('lifeExpectancy')} 
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.05)' }} 
              style={{cursor: 'pointer', borderRadius: '12px'}}
            >
              <div className="stat-label">Life expectancy</div>
              <div className="hero-stat-vals">
                <span className="stat-value text-india">70.8</span> <span className="stat-note">vs</span> <span className="stat-value text-taiwan">80.9</span>
                <span className="stat-note" style={{marginLeft:'4px'}}>yrs</span>
              </div>
            </motion.div>
            <motion.div 
              className="hero-stat" 
              onClick={() => setActiveStatModal('populationCovered')} 
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.05)' }} 
              style={{cursor: 'pointer', borderRadius: '12px'}}
            >
              <div className="stat-label">Population covered</div>
              <div className="hero-stat-vals">
                <span className="stat-value text-india">37</span> <span className="stat-note">vs</span> <span className="stat-value text-taiwan">99</span>
                <span className="stat-note" style={{marginLeft:'4px'}}>%</span>
              </div>
            </motion.div>
            <motion.div 
              className="hero-stat" 
              onClick={() => setActiveStatModal('oopBurden')} 
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.05)' }} 
              style={{cursor: 'pointer', borderRadius: '12px'}}
            >
              <div className="stat-label">Out-of-pocket burden</div>
              <div className="hero-stat-vals">
                <span className="stat-value text-india">40</span> <span className="stat-note">vs</span> <span className="stat-value text-taiwan">12</span>
                <span className="stat-note" style={{marginLeft:'4px'}}>%</span>
              </div>
            </motion.div>
          </div>
        </Reveal>

        <AnimatePresence>
          {activeStatModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.85)',
                backdropFilter: 'blur(10px)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1.5rem'
              }}
              onClick={() => setActiveStatModal(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 20, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  padding: '2.5rem',
                  maxWidth: '500px',
                  width: '100%',
                  position: 'relative',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <button 
                  onClick={() => setActiveStatModal(null)}
                  style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer' }}
                >
                  <X size={24} />
                </button>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text)', fontFamily: 'var(--serif)' }}>
                  {statContexts[activeStatModal].title}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
                  <span className="text-india" style={{fontWeight: 'bold', textShadow: '0 0 15px rgba(255,90,95,0.4)'}}>{statContexts[activeStatModal].india}</span>
                  <span style={{ color: 'var(--text3)', fontSize: '1rem' }}>vs</span>
                  <span className="text-taiwan" style={{fontWeight: 'bold', textShadow: '0 0 15px rgba(0,229,255,0.4)'}}>{statContexts[activeStatModal].taiwan}</span>
                  <span style={{ color: 'var(--text3)', fontSize: '1rem', marginLeft: '-0.5rem' }}>{statContexts[activeStatModal].unit}</span>
                </div>
                <p style={{ color: 'var(--text2)', lineHeight: '1.8', fontSize: '1.05rem', margin: 0 }}>
                  {statContexts[activeStatModal].context}
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <div className="quickbar" id="quickbar">
        <div className="quickbar-inner">
          <Reveal delay={0.1}><div className="qb-item liquid-glass">
            <div className="stat-label" style={{marginBottom:'1rem'}}>Speed of Access</div>
            <div className="qb-row"><span className="qb-flag">🇮🇳</span><AnimatedBar percentage={30} colorClass="bg-india"/><span className="qb-word text-india">Slow</span></div>
            <div className="qb-row"><span className="qb-flag">🇹🇼</span><AnimatedBar percentage={88} colorClass="bg-taiwan"/><span className="qb-word text-taiwan">Fast</span></div>
          </div></Reveal>
          <Reveal delay={0.2}><div className="qb-item liquid-glass">
            <div className="stat-label" style={{marginBottom:'1rem'}}>Care Quality</div>
            <div className="qb-row"><span className="qb-flag">🇮🇳</span><AnimatedBar percentage={35} colorClass="bg-india"/><span className="qb-word text-india">Unequal</span></div>
            <div className="qb-row"><span className="qb-flag">🇹🇼</span><AnimatedBar percentage={85} colorClass="bg-taiwan"/><span className="qb-word text-taiwan">High</span></div>
          </div></Reveal>
          <Reveal delay={0.3}><div className="qb-item liquid-glass">
            <div className="stat-label" style={{marginBottom:'1rem'}}>Cost Protection</div>
            <div className="qb-row"><span className="qb-flag">🇮🇳</span><AnimatedBar percentage={25} colorClass="bg-india"/><span className="qb-word text-india">Low</span></div>
            <div className="qb-row"><span className="qb-flag">🇹🇼</span><AnimatedBar percentage={90} colorClass="bg-taiwan"/><span className="qb-word text-taiwan">Strong</span></div>
          </div></Reveal>
          <Reveal delay={0.4}><div className="qb-item liquid-glass">
            <div className="stat-label" style={{marginBottom:'1rem'}}>System Reliability</div>
            <div className="qb-row"><span className="qb-flag">🇮🇳</span><AnimatedBar percentage={28} colorClass="bg-india"/><span className="qb-word text-india">Weak</span></div>
            <div className="qb-row"><span className="qb-flag">🇹🇼</span><AnimatedBar percentage={87} colorClass="bg-taiwan"/><span className="qb-word text-taiwan">Strong</span></div>
          </div></Reveal>
        </div>
      </div>
      
      <hr className="divider" />

      {/* 1. OVERVIEW */}
      <section id="overview">
        <Reveal><p className="section-eyebrow">System Overview</p></Reveal>
        <Reveal delay={0.1}><h2 className="section-title">Two very different starting points</h2></Reveal>
        <Reveal delay={0.2}>
          <p className="section-sub">
            India operates a fragmented, state-devolved mix of public and private care. Taiwan built a single-payer system from scratch in 1995 — and it works.
          </p>
        </Reveal>

        <div className="grid-2">
          <Reveal delay={0.3}>
            <motion.div className="liquid-glass india-glow" style={{borderTop: '3px solid var(--india)'}}>
              <motion.span 
                initial={{ rotate: -15, scale: 0.8 }} animate={{ rotate: 0, scale: 1 }} transition={{ delay: 0.5, type: 'spring' }}
                style={{fontSize: '2.5rem', display:'block', marginBottom:'1rem'}}
              >🇮🇳</motion.span>
              <h3 style={{fontSize: '1.8rem', marginBottom: '0.5rem', transform: 'translateZ(20px)'}}>India</h3>
              <p style={{fontSize: '0.9rem', color: 'var(--text2)', marginBottom: '1.5rem'}}>
                A 1.4 billion-person nation with extreme regional disparities. Public spending remains below global standards.
              </p>
              <div className="cc-tag india" style={{marginBottom: '2rem'}}>Fragmented · Developing</div>
              
              <div style={{display:'flex', flexDirection:'column', gap:'1.5rem'}}>
                <div className="stat-box">
                  <span className="stat-label">Life Expectancy</span>
                  <motion.span className="stat-value text-india">70.8 yrs</motion.span>
                  <AnimatedBar percentage={65} colorClass="bg-india" />
                  <span className="stat-note">Improved from 63 in 2000 — significant but still lagging</span>
                </div>
                <div className="stat-box">
                  <span className="stat-label">Infant Mortality</span>
                  <motion.span className="stat-value text-india">28.3</motion.span>
                  <AnimatedBar percentage={78} colorClass="bg-india" />
                  <span className="stat-note">Rural infant mortality can exceed 40 in some states</span>
                </div>
                <div className="stat-box">
                  <span className="stat-label">Out-of-Pocket Spend</span>
                  <motion.span className="stat-value text-india">~40%</motion.span>
                  <AnimatedBar percentage={80} colorClass="bg-india" />
                  <span className="stat-note">Among the highest OOP rates globally — a poverty driver</span>
                </div>
              </div>
            </motion.div>
          </Reveal>

          <Reveal delay={0.4}>
            <motion.div className="liquid-glass taiwan-glow" style={{borderTop: '3px solid var(--taiwan)'}}>
              <motion.span 
                initial={{ rotate: 15, scale: 0.8 }} animate={{ rotate: 0, scale: 1 }} transition={{ delay: 0.6, type: 'spring' }}
                style={{fontSize: '2.5rem', display:'block', marginBottom:'1rem'}}
              >🇹🇼</motion.span>
              <h3 style={{fontSize: '1.8rem', marginBottom: '0.5rem', transform: 'translateZ(20px)'}}>Taiwan</h3>
              <p style={{fontSize: '0.9rem', color: 'var(--text2)', marginBottom: '1.5rem'}}>
                A high-income society of 23 million with a centralized National Health Insurance (NHI) system.
              </p>
              <div className="cc-tag taiwan" style={{marginBottom: '2rem'}}>Unified · Mature</div>
              
              <div style={{display:'flex', flexDirection:'column', gap:'1.5rem'}}>
                <div className="stat-box">
                  <span className="stat-label">Life Expectancy</span>
                  <motion.span className="stat-value text-taiwan">80.9 yrs</motion.span>
                  <AnimatedBar percentage={90} colorClass="bg-taiwan" />
                  <span className="stat-note">Comparable to Western Europe — achieved at far lower cost</span>
                </div>
                <div className="stat-box">
                  <span className="stat-label">Infant Mortality</span>
                  <motion.span className="stat-value text-taiwan">4.1</motion.span>
                  <AnimatedBar percentage={18} colorClass="bg-taiwan" />
                  <span className="stat-note">One of the lowest in Asia — reflects strong maternal care access</span>
                </div>
                <div className="stat-box">
                  <span className="stat-label">Out-of-Pocket Spend</span>
                  <motion.span className="stat-value text-taiwan">~12%</motion.span>
                  <AnimatedBar percentage={25} colorClass="bg-taiwan" />
                  <span className="stat-note">NHI absorbs most costs; copays are capped for low-income</span>
                </div>
              </div>
            </motion.div>
          </Reveal>
        </div>
      </section>

      <hr className="divider" />

      {/* 2. BENCHMARKS */}
      <section id="benchmarks">
        <Reveal><p className="section-eyebrow">Core Benchmarks</p></Reveal>
        <Reveal delay={0.1}><h2 className="section-title">The numbers, parameter by parameter</h2></Reveal>
        <Reveal delay={0.2}><p className="section-sub">Every major dimension of healthcare performance — coverage, infrastructure, spending, and workforce — compared side by side.</p></Reveal>

        <Reveal delay={0.3}>
          <div className="glass-card" style={{padding: '1rem', overflowX: 'auto'}}>
            <table className="bench-table">
              <thead>
                <tr>
                  <th style={{minWidth: '140px'}}>Parameter</th>
                  <th>🇮🇳 India</th>
                  <th>🇹🇼 Taiwan</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="bench-param">Health coverage</td>
                  <td><div className="text-india bench-cell-val">~37% insured</div><div className="stat-note">Ayushman Bharat covers low-income tiers; large informal workforce left out</div></td>
                  <td><div className="text-taiwan bench-cell-val">99.9% insured <span className="badge-winner taiwan">Winner</span></div><div className="stat-note">Mandatory NHI enrollment; effectively universal since 1995</div></td>
                </tr>
                <tr>
                  <td className="bench-param">Hospital beds / 1k pop</td>
                  <td><div className="text-india bench-cell-val">1.3 beds</div><div className="stat-note">Severe shortfall; concentrated in cities</div></td>
                  <td><div className="text-taiwan bench-cell-val">6.8 beds <span className="badge-winner taiwan">Winner</span></div><div className="stat-note">Well-distributed across all care tiers</div></td>
                </tr>
                <tr>
                  <td className="bench-param">Doctors / 1k pop</td>
                  <td><div className="text-india bench-cell-val">0.74 doctors</div><div className="stat-note">Below WHO minimum; rural-urban imbalance</div></td>
                  <td><div className="text-taiwan bench-cell-val">2.1 doctors <span className="badge-winner taiwan">Winner</span></div><div className="stat-note">Adequate density, burnout is a concern</div></td>
                </tr>
                <tr>
                  <td className="bench-param">Health spend (% GDP)</td>
                  <td><div className="text-india bench-cell-val">~3.0%</div><div className="stat-note">Gov share is only ~1.5%</div></td>
                  <td><div className="text-taiwan bench-cell-val">~6.8% <span className="badge-winner taiwan">Winner</span></div><div className="stat-note">Lower admin overhead via single-payer</div></td>
                </tr>
                <tr>
                  <td className="bench-param">Maternal mort. (100k)</td>
                  <td><div className="text-india bench-cell-val">103 deaths</div><div className="stat-note">Improved but still high</div></td>
                  <td><div className="text-taiwan bench-cell-val">15 deaths <span className="badge-winner taiwan">Winner</span></div><div className="stat-note">Universal prenatal care access</div></td>
                </tr>
                <tr>
                  <td className="bench-param">Cancer 5-yr survival</td>
                  <td><div className="text-india bench-cell-val">~40–55%</div><div className="stat-note">Varies by cancer type and access</div></td>
                  <td><div className="text-taiwan bench-cell-val">~62–70% <span className="badge-winner taiwan">Winner</span></div><div className="stat-note">Early screening & NHI coverage</div></td>
                </tr>
                <tr>
                  <td className="bench-param">Generic drug access</td>
                  <td><div className="text-india bench-cell-val">High (unregulated)</div><div className="stat-note">Quality control risk varies</div></td>
                  <td><div className="text-taiwan bench-cell-val">High (regulated) <span className="badge-winner taiwan">Winner</span></div><div className="stat-note">NHI negotiates prices centrally</div></td>
                </tr>
                <tr>
                  <td className="bench-param">Population Scale</td>
                  <td><div className="text-india bench-cell-val">1.44 billion <span className="badge-winner india">Scale Challenge</span></div><div className="stat-note">Enormous complexity slowing improvements</div></td>
                  <td><div className="text-taiwan bench-cell-val">23 million</div><div className="stat-note">Smaller population makes centralized management feasible</div></td>
                </tr>
              </tbody>
            </table>
          </div>
        </Reveal>
      </section>

      <hr className="divider" />

      {/* 3. OUTCOMES */}
      <section id="outcomes">
         <Reveal><p className="section-eyebrow">Outcomes</p></Reveal>
         <Reveal delay={0.1}><h2 className="section-title">Hard numbers, visualized</h2></Reveal>
         <Reveal delay={0.2}><p className="section-sub">Charts that put the performance gap into perspective — from life expectancy to infrastructure and spending.</p></Reveal>
         
         <div className="grid-2">
           <Reveal delay={0.2}>
             <div className="glass-card india-glow">
                <p className="stat-label" style={{marginBottom: '1rem'}}>Life Expectancy (Years)</p>
                <div style={{ height: '220px' }}>
                  <Bar data={{ labels: ['India', 'Taiwan'], datasets: [{ data: [70.8, 80.9], backgroundColor: ['#FF5A5F', '#00E5FF'], borderRadius: 4, hoverBackgroundColor: ['#FF797D', '#33EFFF'] }] }} options={commonChartOptions} />
                </div>
             </div>
           </Reveal>
           <Reveal delay={0.3}>
             <div className="glass-card taiwan-glow">
                <p className="stat-label" style={{marginBottom: '1rem'}}>Infant Mortality (per 1,000 births)</p>
                <div style={{ height: '220px' }}>
                  <Bar data={{ labels: ['India', 'Taiwan'], datasets: [{ data: [28.3, 4.1], backgroundColor: ['#FF5A5F', '#00E5FF'], borderRadius: 4, hoverBackgroundColor: ['#FF797D', '#33EFFF'] }] }} options={commonChartOptions} />
                </div>
             </div>
           </Reveal>
           <Reveal delay={0.4}>
             <div className="glass-card india-glow">
                <p className="stat-label" style={{marginBottom: '1rem'}}>Hospital Beds per 1,000</p>
                <div style={{ height: '220px' }}>
                  <Bar data={{ labels: ['India', 'Taiwan'], datasets: [{ data: [1.3, 6.8], backgroundColor: ['#FF5A5F', '#00E5FF'], borderRadius: 4, hoverBackgroundColor: ['#FF797D', '#33EFFF'] }] }} options={commonChartOptions} />
                </div>
             </div>
           </Reveal>
           <Reveal delay={0.5}>
             <div className="glass-card taiwan-glow">
                <p className="stat-label" style={{marginBottom: '1rem'}}>Health Spend (% of GDP)</p>
                <div style={{ height: '220px' }}>
                  <Bar data={{ labels: ['India', 'Taiwan'], datasets: [{ data: [3.0, 6.8], backgroundColor: ['#FF5A5F', '#00E5FF'], borderRadius: 4, hoverBackgroundColor: ['#FF797D', '#33EFFF'] }] }} options={commonChartOptions} />
                </div>
             </div>
           </Reveal>
         </div>
      </section>

      <hr className="divider" />

      {/* 4. STRUCTURE */}
      <section id="structure">
        <Reveal><p className="section-eyebrow">Structure & Governance</p></Reveal>
        <Reveal delay={0.1}><h2 className="section-title">How each system is structured</h2></Reveal>
        <Reveal delay={0.2}><p className="section-sub">The root cause of most performance differences lies in how each country governs, finances, and delivers care.</p></Reveal>
        
        <div className="grid-2">
            <Reveal delay={0.2} yOffset={50}>
              <div className="liquid-glass india-glow">
                <h3 style={{marginBottom: '1.5rem', color: 'var(--text)'}}>🇮🇳 India's Architecture</h3>
                <motion.div initial="hidden" animate="visible" variants={{visible: { transition: { staggerChildren: 0.15 } }}} style={{display:'flex', flexDirection:'column', gap:'0'}}>
                  <motion.div variants={{hidden: {opacity: 0, scale: 0.95}, visible: {opacity: 1, scale: 1}}} className="flow-node india">
                    <span className="stat-label" style={{display:'block'}}>Governance</span>
                    State-Devolved (28 States)
                  </motion.div>
                  <motion.div variants={{hidden: {opacity: 0}, visible: {opacity: 1}}} className="flow-arrow-down">↓</motion.div>
                  <motion.div variants={{hidden: {opacity: 0, scale: 0.95}, visible: {opacity: 1, scale: 1}}} className="flow-node india">
                    <span className="stat-label" style={{display:'block'}}>Payer System</span>
                    Multi-payer (fragmented)
                  </motion.div>
                  <motion.div variants={{hidden: {opacity: 0}, visible: {opacity: 1}}} className="flow-arrow-down">↓</motion.div>
                  <motion.div variants={{hidden: {opacity: 0, scale: 0.95}, visible: {opacity: 1, scale: 1}}} className="flow-node india">
                    <span className="stat-label" style={{display:'block'}}>Access Model</span>
                    Tiered, unequal via urban private sector
                  </motion.div>
                  <motion.div variants={{hidden: {opacity: 0}, visible: {opacity: 1}}} className="flow-arrow-down">↓</motion.div>
                  <motion.div variants={{hidden: {opacity: 0, scale: 0.95}, visible: {opacity: 1, scale: 1}}} className="flow-node india">
                    <span className="stat-label" style={{display:'block'}}>Enrollment</span>
                    Voluntary / Means-tested
                  </motion.div>
                 </motion.div>
                <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay: 1.2}} style={{marginTop: '1.5rem', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px'}}>
                  <strong style={{color:'var(--india)', fontSize:'0.75rem', textTransform: 'uppercase', letterSpacing:'0.1em'}}>Core Outcome</strong>
                  <div style={{fontSize: '0.9rem', color: 'var(--text2)', marginTop: '0.3rem'}}>Inconsistent quality, High cost burden, Unequal access</div>
                </motion.div>
              </div>
            </Reveal>
            <Reveal delay={0.4} yOffset={50}>
              <div className="liquid-glass taiwan-glow">
                <h3 style={{marginBottom: '1.5rem', color: 'var(--text)'}}>🇹🇼 Taiwan's Architecture</h3>
                <motion.div initial="hidden" animate="visible" variants={{visible: { transition: { staggerChildren: 0.15 } }}} style={{display:'flex', flexDirection:'column', gap:'0'}}>
                  <motion.div variants={{hidden: {opacity: 0, scale: 0.95}, visible: {opacity: 1, scale: 1}}} className="flow-node taiwan">
                    <span className="stat-label" style={{display:'block'}}>Governance</span>
                    Centralized (NHIA)
                  </motion.div>
                  <motion.div variants={{hidden: {opacity: 0}, visible: {opacity: 1}}} className="flow-arrow-down">↓</motion.div>
                  <motion.div variants={{hidden: {opacity: 0, scale: 0.95}, visible: {opacity: 1, scale: 1}}} className="flow-node taiwan">
                    <span className="stat-label" style={{display:'block'}}>Payer System</span>
                    Single-payer (NHI)
                  </motion.div>
                  <motion.div variants={{hidden: {opacity: 0}, visible: {opacity: 1}}} className="flow-arrow-down">↓</motion.div>
                  <motion.div variants={{hidden: {opacity: 0, scale: 0.95}, visible: {opacity: 1, scale: 1}}} className="flow-node taiwan">
                    <span className="stat-label" style={{display:'block'}}>Access Model</span>
                    Free choice, any provider
                  </motion.div>
                  <motion.div variants={{hidden: {opacity: 0}, visible: {opacity: 1}}} className="flow-arrow-down">↓</motion.div>
                  <motion.div variants={{hidden: {opacity: 0, scale: 0.95}, visible: {opacity: 1, scale: 1}}} className="flow-node taiwan">
                    <span className="stat-label" style={{display:'block'}}>Enrollment</span>
                    Mandatory (universal)
                  </motion.div>
                </motion.div>
                <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay: 1.2}} style={{marginTop: '1.5rem', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px'}}>
                  <strong style={{color:'var(--taiwan)', fontSize:'0.75rem', textTransform: 'uppercase', letterSpacing:'0.1em'}}>Core Outcome</strong>
                  <div style={{fontSize: '0.9rem', color: 'var(--text2)', marginTop: '0.3rem'}}>Consistent quality, Low cost burden, High access</div>
                </motion.div>
              </div>
            </Reveal>
         </div>
      </section>

      <hr className="divider" />

      {/* 5. FINANCES */}
      <section id="finances">
        <Reveal><p className="section-eyebrow">Finances & Risk</p></Reveal>
        <Reveal delay={0.1}><h2 className="section-title">Who bears the cost of getting sick?</h2></Reveal>
        <Reveal delay={0.2}><p className="section-sub">A stark difference between driving people into poverty and ensuring absolute financial immunity.</p></Reveal>
        
        <div className="grid-2">
          <Reveal delay={0.2}>
            <div className="liquid-glass india-glow" style={{padding: '2.5rem'}}>
              <span className="stat-label">India Financial Risk Profile</span>
              <h3 style={{fontSize: '2.5rem', color: 'var(--india)', margin: '0.5rem 0'}}>Scarcity</h3>
              <p className="stat-note" style={{fontSize: '1rem', lineHeight: '1.8', color: 'var(--text2)'}}>
                Indians pay nearly 40% of healthcare costs directly from their pockets. This is one of the highest OOP ratios in Asia, and a leading driver of catastrophic health expenditure — defined as spending over 10% of household income on health. An estimated 55 million Indians fall below the poverty line annually due to medical bills.
              </p>
              <div style={{marginTop: '1.5rem', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid var(--india)'}}>
                <strong style={{color:'var(--text)', fontSize:'0.75rem', textTransform: 'uppercase', letterSpacing:'0.1em'}}>System Behavior</strong>
                <div style={{fontSize: '0.9rem', color: 'var(--text2)', marginTop: '0.3rem'}}>Minor illness quickly becomes a profound financial shock.</div>
              </div>
              <div className="cc-tag india" style={{marginTop: '1.5rem'}}>⚠ High Individual Risk</div>
            </div>
          </Reveal>
          <Reveal delay={0.4}>
            <div className="liquid-glass taiwan-glow" style={{padding: '2.5rem'}}>
              <span className="stat-label">Taiwan Financial Risk Profile</span>
              <h3 style={{fontSize: '2.5rem', color: 'var(--taiwan)', margin: '0.5rem 0'}}>Overuse</h3>
              <p className="stat-note" style={{fontSize: '1rem', lineHeight: '1.8', color: 'var(--text2)'}}>
                Taiwan's NHI absorbs the vast majority of healthcare expenditure. Copays exist but are modest — around NT$50–300 per clinic visit — and are waived for low-income households, children, and the elderly. Catastrophic illness coverage is included in the NHI package at no extra cost. The low cost drives extreme outpatient utilization.
              </p>
              <div style={{marginTop: '1.5rem', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid var(--taiwan)'}}>
                <strong style={{color:'var(--text)', fontSize:'0.75rem', textTransform: 'uppercase', letterSpacing:'0.1em'}}>System Behavior</strong>
                <div style={{fontSize: '0.9rem', color: 'var(--text2)', marginTop: '0.3rem'}}>Easy access translates to high demand and eventual provider burnout.</div>
              </div>
              <div className="cc-tag taiwan" style={{marginTop: '1.5rem'}}>✓ Low Individual Risk</div>
            </div>
          </Reveal>
        </div>
      </section>

      <hr className="divider" />

      {/* 6. DIGITAL */}
      <section id="digital">
         <Reveal><p className="section-eyebrow">Digital</p></Reveal>
         <Reveal delay={0.1}><h2 className="section-title">Interoperability & Data Pipelines</h2></Reveal>
         <Reveal delay={0.2}><p className="section-sub">Healthcare speed relies heavily on digital infrastructure and secure real-time data flows.</p></Reveal>
         
         <div className="grid-2">
            <Reveal delay={0.2}>
              <div className="glass-card india-glow">
                <h3 style={{marginBottom: '1rem'}}>🇮🇳 India Pipeline</h3>
                <p className="stat-note" style={{marginBottom: '1.5rem'}}>Fragmented, largely paper-based in rural tiers. Ayushman Bharat Digital Mission (ABHA) is partially rolled out, but interoperability remains a massive bottleneck between private and public silos.</p>
                <div style={{display:'flex', flexDirection:'column', gap:'0.8rem'}}>
                  <div className="flow-node india">Patient visits facility <strong style={{float:'right', fontSize:'0.7rem'}}>Paper-based</strong></div>
                  <div className="flow-node india">ABHA digital ID created <strong style={{float:'right', fontSize:'0.7rem'}}>Partial rollout</strong></div>
                  <div className="flow-node india">Records not shared <strong style={{float:'right', fontSize:'0.7rem'}}>Silos</strong></div>
                  <div className="flow-node india">Claims submitted manually <strong style={{float:'right', fontSize:'0.7rem'}}>Slow</strong></div>
                  <div className="flow-node india">No national EHR sync <strong style={{float:'right', fontSize:'0.7rem'}}>Bottleneck</strong></div>
                </div>
                <div style={{marginTop: '1.5rem'}}>
                  <strong style={{color:'var(--text)', fontSize:'0.75rem', textTransform: 'uppercase', letterSpacing:'0.1em'}}>End Result</strong>
                  <div style={{fontSize: '0.9rem', color: 'var(--text2)', marginTop: '0.3rem'}}>Slow, inefficient, and disconnected care.</div>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.3}>
              <div className="glass-card taiwan-glow">
                <h3 style={{marginBottom: '1rem'}}>🇹🇼 Taiwan Pipeline</h3>
                <p className="stat-note" style={{marginBottom: '1.5rem'}}>Integrated and smooth. The NHI IC smart card provides universal, real-time medical history loading and syncs claims automatically to the NHIA. Used globally as a model for proactive tracking.</p>
                <div style={{display:'flex', flexDirection:'column', gap:'0.8rem'}}>
                  <div className="flow-node taiwan">Patient presents NHI IC card <strong style={{float:'right', fontSize:'0.7rem'}}>Universal</strong></div>
                  <div className="flow-node taiwan">Full medical history loaded <strong style={{float:'right', fontSize:'0.7rem'}}>Real-time</strong></div>
                  <div className="flow-node taiwan">Treatment recorded to EHR <strong style={{float:'right', fontSize:'0.7rem'}}>Live sync</strong></div>
                  <div className="flow-node taiwan">Claim auto-submitted <strong style={{float:'right', fontSize:'0.7rem'}}>Automated</strong></div>
                  <div className="flow-node taiwan">Payment processed instantly <strong style={{float:'right', fontSize:'0.7rem'}}>Fast</strong></div>
                </div>
                <div style={{marginTop: '1.5rem'}}>
                  <strong style={{color:'var(--text)', fontSize:'0.75rem', textTransform: 'uppercase', letterSpacing:'0.1em'}}>End Result</strong>
                  <div style={{fontSize: '0.9rem', color: 'var(--text2)', marginTop: '0.3rem'}}>Fast, seamless, and deeply data-driven care.</div>
                </div>
              </div>
            </Reveal>
         </div>
      </section>

      <hr className="divider" />

      {/* 7. WORKFORCE */}
      <section id="workforce">
         <Reveal><p className="section-eyebrow">Workforce</p></Reveal>
         <Reveal delay={0.1}><h2 className="section-title">Human Resources Availability</h2></Reveal>
         <Reveal delay={0.2}><p className="section-sub">A critical look at the raw numbers powering the clinical delivery of these healthcare systems.</p></Reveal>
         
         <div className="grid-2">
            <Reveal delay={0.2}>
              <div className="glass-card india-glow">
                <h3 style={{marginBottom: '1.5rem'}}>🇮🇳 Indian Workforce Statistics</h3>
                <ul style={{listStyle: 'none', padding: 0, fontSize: '1rem', color: 'var(--text2)', lineHeight: '2.4'}}>
                  <li style={{borderBottom: '1px solid var(--border)'}}><strong style={{color: 'var(--text)'}}>Docs per 1,000 pop:</strong> <span className="text-india" style={{float:'right', fontWeight:'500'}}>0.74</span></li>
                  <li style={{borderBottom: '1px solid var(--border)'}}><strong style={{color: 'var(--text)'}}>Nurses per 1,000 pop:</strong> <span className="text-india" style={{float:'right', fontWeight:'500'}}>1.96</span></li>
                  <li style={{borderBottom: '1px solid var(--border)'}}><strong style={{color: 'var(--text)'}}>Understaffed Rural Posts:</strong> <span className="text-india" style={{float:'right', fontWeight:'500'}}>~75%</span></li>
                  <li style={{borderBottom: '1px solid var(--border)'}}><strong style={{color: 'var(--text)'}}>Urban-Rural Access Ratio:</strong> <span className="text-india" style={{float:'right', fontWeight:'500'}}>3.8 : 1</span></li>
                </ul>
                <div style={{marginTop: '1.5rem', background: 'rgba(255,90,95,0.08)', padding: '0.75rem 1rem', borderRadius: '8px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <strong style={{color:'var(--india)', fontSize:'0.75rem', textTransform: 'uppercase', letterSpacing:'0.1em'}}>Primary Stress Type</strong>
                  <span style={{fontSize: '0.9rem', color: 'var(--text)', fontWeight: 'bold'}}>Absolute Scarcity</span>
                </div>
                <p className="stat-note" style={{marginTop: '1.5rem'}}>A stark imbalance exists where the vast majority of trained specialists operate exclusively in tier-1 urban hubs.</p>
              </div>
            </Reveal>
            <Reveal delay={0.3}>
              <div className="glass-card taiwan-glow">
                <h3 style={{marginBottom: '1.5rem'}}>🇹🇼 Taiwanese Workforce Statistics</h3>
                <ul style={{listStyle: 'none', padding: 0, fontSize: '1rem', color: 'var(--text2)', lineHeight: '2.4'}}>
                  <li style={{borderBottom: '1px solid var(--border)'}}><strong style={{color: 'var(--text)'}}>Docs per 1,000 pop:</strong> <span className="text-taiwan" style={{float:'right', fontWeight:'500'}}>2.10</span></li>
                  <li style={{borderBottom: '1px solid var(--border)'}}><strong style={{color: 'var(--text)'}}>Nurses per 1,000 pop:</strong> <span className="text-taiwan" style={{float:'right', fontWeight:'500'}}>7.15</span></li>
                  <li style={{borderBottom: '1px solid var(--border)'}}><strong style={{color: 'var(--text)'}}>Understaffed Rural Posts:</strong> <span className="text-taiwan" style={{float:'right', fontWeight:'500'}}>~5%</span></li>
                  <li style={{borderBottom: '1px solid var(--border)'}}><strong style={{color: 'var(--text)'}}>Urban-Rural Access Ratio:</strong> <span className="text-taiwan" style={{float:'right', fontWeight:'500'}}>1.5 : 1</span></li>
                </ul>
                <div style={{marginTop: '1.5rem', background: 'rgba(0,229,255,0.08)', padding: '0.75rem 1rem', borderRadius: '8px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <strong style={{color:'var(--taiwan)', fontSize:'0.75rem', textTransform: 'uppercase', letterSpacing:'0.1em'}}>Primary Stress Type</strong>
                  <span style={{fontSize: '0.9rem', color: 'var(--text)', fontWeight: 'bold'}}>System Overload</span>
                </div>
                <p className="stat-note" style={{marginTop: '1.5rem'}}>Maintains a well-distributed clinical workforce, though intense patient volume has raised concerns over physician burnout.</p>
              </div>
            </Reveal>
         </div>
      </section>

      <hr className="divider" />

      {/* 8. SYSTEM LOOPS */}
      <section id="system-loops">
         <Reveal><p className="section-eyebrow">System Loops</p></Reveal>
         <Reveal delay={0.1}><h2 className="section-title">The Vicious vs Virtuous Cycles</h2></Reveal>
         <Reveal delay={0.2}><p className="section-sub">Societal behaviors dictated by the constraints of healthcare policy and economics.</p></Reveal>
         
         <div className="grid-2">
            <Reveal delay={0.2} yOffset={50}>
              <div className="liquid-glass india-glow">
                <h3 style={{marginBottom: '1.5rem', color: 'var(--text)'}}>India: The Poverty Trap</h3>
                <motion.div initial="hidden" animate="visible" variants={{visible: { transition: { staggerChildren: 0.2 } }}} style={{display:'flex', flexDirection:'column', gap:'0'}}>
                  <motion.div variants={{hidden: {opacity: 0, x: -20}, visible: {opacity: 1, x: 0}}} className="flow-node india">Lack of pre-emptive care</motion.div>
                  <motion.div variants={{hidden: {opacity: 0}, visible: {opacity: 1}}} className="flow-arrow-down">↓</motion.div>
                  <motion.div variants={{hidden: {opacity: 0, x: -20}, visible: {opacity: 1, x: 0}}} className="flow-node india">Disease progresses untreated</motion.div>
                  <motion.div variants={{hidden: {opacity: 0}, visible: {opacity: 1}}} className="flow-arrow-down">↓</motion.div>
                  <motion.div variants={{hidden: {opacity: 0, x: -20}, visible: {opacity: 1, x: 0}}} className="flow-node india">High out-of-pocket payment</motion.div>
                  <motion.div variants={{hidden: {opacity: 0}, visible: {opacity: 1}}} className="flow-arrow-down">↓</motion.div>
                  <motion.div variants={{hidden: {opacity: 0, x: -20}, visible: {opacity: 1, x: 0}}} className="flow-node india">Financial ruin / debt</motion.div>
                </motion.div>
                <div style={{marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: '3px solid var(--india)'}}>
                  <strong style={{color:'var(--india)', fontSize:'0.75rem', textTransform: 'uppercase', letterSpacing:'0.1em', display:'block', marginBottom:'0.5rem'}}>Reinforcing Negative Cycle</strong>
                  <p style={{fontSize: '0.9rem', color: 'var(--text2)', fontStyle: 'italic'}}>“Millions fall into this cycle annually. Ayushman Bharat aims to break the link between hospitalization and debt, but outpatient care remains largely unshielded.”</p>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.4} yOffset={50}>
              <div className="liquid-glass taiwan-glow">
                <h3 style={{marginBottom: '1.5rem', color: 'var(--text)'}}>Taiwan: The Hyper-Access Loop</h3>
                <motion.div initial="hidden" animate="visible" variants={{visible: { transition: { staggerChildren: 0.2 } }}} style={{display:'flex', flexDirection:'column', gap:'0'}}>
                  <motion.div variants={{hidden: {opacity: 0, x: 20}, visible: {opacity: 1, x: 0}}} className="flow-node taiwan">Extremely low copays</motion.div>
                  <motion.div variants={{hidden: {opacity: 0}, visible: {opacity: 1}}} className="flow-arrow-down">↓</motion.div>
                  <motion.div variants={{hidden: {opacity: 0, x: 20}, visible: {opacity: 1, x: 0}}} className="flow-node taiwan">Patients visit for minor issues</motion.div>
                  <motion.div variants={{hidden: {opacity: 0}, visible: {opacity: 1}}} className="flow-arrow-down">↓</motion.div>
                  <motion.div variants={{hidden: {opacity: 0, x: 20}, visible: {opacity: 1, x: 0}}} className="flow-node taiwan">Early detection of illness</motion.div>
                  <motion.div variants={{hidden: {opacity: 0}, visible: {opacity: 1}}} className="flow-arrow-down">↓</motion.div>
                  <motion.div variants={{hidden: {opacity: 0, x: 20}, visible: {opacity: 1, x: 0}}} className="flow-node taiwan">System remains financially viable</motion.div>
                </motion.div>
                <div style={{marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: '3px solid var(--taiwan)'}}>
                  <strong style={{color:'var(--taiwan)', fontSize:'0.75rem', textTransform: 'uppercase', letterSpacing:'0.1em', display:'block', marginBottom:'0.5rem'}}>Positive Loop (Side-Effect: Overload)</strong>
                  <p style={{fontSize: '0.9rem', color: 'var(--text2)', fontStyle: 'italic'}}>“This cycle keeps population health high and late-stage costs low. However, its side effect is severe physician burnout and overcrowded daily clinic schedules.”</p>
                </div>
              </div>
            </Reveal>
         </div>
      </section>

      <hr className="divider" />

      {/* 9. VERDICT */}
      <section id="verdict">
         <Reveal><p className="section-eyebrow" style={{textAlign: 'center'}}>Final Judgment</p></Reveal>
         <Reveal delay={0.1}><h2 className="section-title" style={{textAlign: 'center'}}>The Verdict</h2></Reveal>
         
         <div className="grid-3" style={{marginTop: '3rem'}}>
           <Reveal delay={0.2}>
             <div className="liquid-glass" style={{textAlign: 'center', padding: '1.5rem'}}>
               <p className="stat-note" style={{marginBottom: '1rem'}}>Which gives higher quality care at the top end?</p>
               <h3 style={{fontSize: '1.5rem'}}>Tie</h3>
               <p className="stat-label" style={{marginTop: '0.5rem'}}>India's top private hospitals equal global standards.</p>
             </div>
           </Reveal>
           <Reveal delay={0.3}>
             <div className="liquid-glass taiwan-glow" style={{textAlign: 'center', padding: '1.5rem'}}>
               <p className="stat-note" style={{marginBottom: '1rem'}}>Which is better for the average citizen?</p>
               <h3 style={{fontSize: '1.5rem', color: 'var(--taiwan)'}}>Taiwan</h3>
               <p className="stat-label" style={{marginTop: '0.5rem'}}>Universal access, no financial fear.</p>
             </div>
           </Reveal>
           <Reveal delay={0.4}>
             <div className="liquid-glass taiwan-glow" style={{textAlign: 'center', padding: '1.5rem'}}>
               <p className="stat-note" style={{marginBottom: '1rem'}}>Which is more efficient per dollar?</p>
               <h3 style={{fontSize: '1.5rem', color: 'var(--taiwan)'}}>Taiwan</h3>
               <p className="stat-label" style={{marginTop: '0.5rem'}}>2% admin cost vs fragmented overhead.</p>
             </div>
           </Reveal>
         </div>

         <Reveal delay={0.6}>
           <div style={{textAlign: 'center', marginTop: '4rem', padding: '2rem', borderTop: '1px solid var(--border)'}}>
             <h2 style={{fontFamily: 'var(--serif)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 'normal', color: 'var(--text)'}}>
               India is scaling access. Taiwan is fighting to sustain it. But in the fundamentals of public health, <span className="text-taiwan">Taiwan</span> provides the gold standard.
             </h2>
             <p className="stat-note" style={{marginTop: '2rem'}}>
                Sources: WHO Global Health Observatory, World Bank Data, Taiwan NHIA Annual Report (2023), India National Health Profile (2022), The Commonwealth Fund, OECD Health Statistics.
             </p>
           </div>
         </Reveal>
      </section>

      <footer style={{ padding: '6rem 2rem 8rem', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '4rem', background: 'radial-gradient(ellipse at bottom, rgba(0, 229, 255, 0.05) 0%, transparent 70%)', position: 'relative', overflow: 'hidden' }}>
        
        {/* Animated background glow that follows the hovered member or just pulses */}
        <motion.div 
          animate={{
            opacity: hoveredMember ? 0.8 : 0.3,
            scale: hoveredMember ? 1.2 : 1,
          }}
          transition={{ duration: 0.8 }}
          style={{
            position: 'absolute',
            bottom: '-20%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '60vw',
            height: '40vw',
            background: 'radial-gradient(circle, rgba(0, 229, 255, 0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: 0
          }}
        />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05, textShadow: '0 0 30px rgba(255,255,255,0.4)', letterSpacing: '0.05em' }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: 'var(--text)', marginBottom: '0.5rem', cursor: 'default' }}
          >
            Health care
          </motion.h2>
          <p style={{ color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.3em', fontSize: '0.85rem', marginBottom: '3.5rem', fontWeight: 'bold' }}>
            Group Project Members
          </p>
          
          <div 
            style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem', maxWidth: '1200px', width: '100%', margin: '0 auto' }}
            onMouseLeave={() => setHoveredMember(null)}
          >
            {['Vanshika Pandey', 'Manasvi Wadhwa', 'Ananta Dimri', 'Rishi Upadhyay'].map((name, i) => (
              <motion.div 
                key={name}
                onMouseEnter={() => setHoveredMember(name)}
                whileHover={{ 
                  y: -10, 
                  scale: 1.1, 
                  boxShadow: '0 20px 40px -10px rgba(0,229,255,0.5)', 
                  borderColor: 'rgba(0,229,255,0.8)',
                  backgroundColor: 'rgba(0,229,255,0.08)'
                }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  delay: hoveredMember ? 0 : 0.1 * i, 
                  type: 'spring', stiffness: 400, damping: 25 
                }}
                className="qb-item"
                style={{ 
                  padding: '1rem 3rem', 
                  background: 'rgba(255,255,255,0.02)', 
                  border: '1px solid rgba(255,255,255,0.08)', 
                  borderRadius: '30px', 
                  color: 'var(--text)', 
                  fontWeight: '600', 
                  letterSpacing: '0.05em', 
                  cursor: 'pointer',
                  opacity: hoveredMember && hoveredMember !== name ? 0.3 : 1,
                  filter: hoveredMember && hoveredMember !== name ? 'blur(2px)' : 'blur(0px)',
                  transition: 'opacity 0.4s ease, filter 0.4s ease, border-color 0.3s, background-color 0.3s' 
                }}
              >
                {name}
              </motion.div>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, type: 'spring' }}
            style={{ marginTop: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--text2)' }}
          >
            <div style={{ textAlign: 'center', letterSpacing: '0.05em' }}>
              <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--text)' }}>Students of Designing</p>
              <p style={{ margin: '0.3rem 0', color: 'var(--taiwan)', fontWeight: '500' }}>B.Des</p>
              <p style={{ margin: 0, opacity: 0.8, fontSize: '0.95rem' }}>Graphic Era (Deemed to be University)</p>
            </div>
          </motion.div>

        </div>
      </footer>
    </>
  );
}

export default App;
