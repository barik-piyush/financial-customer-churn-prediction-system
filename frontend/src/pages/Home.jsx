import React, { useEffect, useState, useRef, useCallback } from 'react';

import slide1 from '../assets/Slide1.png';
import slide2 from '../assets/Slide2.png';
import slide3 from '../assets/Slide3.png';
import slide4 from '../assets/Slide4.png';

export default function Home() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= 880 : false
  );
  const [hoveredStart, setHoveredStart] = useState(false);
  const [hoveredLearn, setHoveredLearn] = useState(false);
  const [navbarBg, setNavbarBg] = useState('linear-gradient(to bottom right, #001845, #023E7D, #0466C8)');
  const [h2Opacity, setH2Opacity] = useState(1);
  const [visibleSpanCount, setVisibleSpanCount] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [hoveredNavItem, setHoveredNavItem] = useState(null);
  const [hoveredStartBtn, setHoveredStartBtn] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredSliderBtn, setHoveredSliderBtn] = useState(null);

  const sliderIntervalRef = useRef(null);
  const totalSlides = 4;
  const revealContainerRef = useRef(null);
  const thirdSectionRef = useRef(null);
  const featuresSectionRef = useRef(null);
  const accordionContentsRef = useRef([]);

  // Sample images for slider 
  const sliderImages = [
    slide1,
    slide2,
    slide3,
    slide4
  ];

  // Sample text spans for reveal animation (matching HTML structure)
  const revealWords = [
    'Financial', 'customer', 'churn', 'prediction', 'is', 'the', 'process', 'of', 'using',
    'machine', 'learning', 'algorithms', 'and', 'data', 'analytics', 'to', 'identify', 'customers',
    'at', 'high', 'risk', 'of', 'closing', 'their', 'accounts,', 'reducing', 'their',
    'product', 'usage,', 'or', 'switching', 'to', 'a', 'competitor.', 'By', 'analyzing',
    'historical', 'data—such', 'as', 'transaction', 'history,', 'demographics', 'information,', 'service',
    'interactions,', 'and', 'product', 'usage', 'patterns—financial', 'institutions', 'can', 'pinpoint',
    'behavioral', 'indicators', 'of', 'disengagement', 'or', 'dissatisfaction.', <br key="br1" />, <br key="br2" />,
    'This', 'proactive,', 'data-driven', 'approach', 'allows', 'banks', 'and', 'financial', 'firms',
    'to', 'intervene', 'with', 'targeted', 'retention', 'strategies,', 'such', 'as',
    'personalized', 'offers,', 'improved', 'service,', 'or', 'loyalty', 'incentives,', 'before', 'the',
    'customer', 'actually', 'leaves.', 'Implementing', 'these', 'models', 'is', 'critical', 'for',
    'minimizing', 'revenue', 'loss', 'and', 'maintaining', 'profitability,', 'as', 'acquiring',
    'new', 'customers', 'is', 'significantly', 'more', 'expensive', 'than', 'retaining', 'existing', 'ones.'
  ];

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Features', href: '#features' },
    { name: 'Model Training', href: '#Model-training' },
    { name: 'About us', href: '#footer' },
    { name: 'Contact us', href: '#footer' }
  ];

  const features = [
    { icon: '🔒', title: 'Revenue Protection', desc: 'Helps safeguard existing and future income streams associated with customer accounts, loans, and other financial products.' },
    { icon: '💸', title: 'Cost Efficiency', desc: 'Retaining existing customers is estimated to be five to seven times cheaper than attracting new ones.' },
    { icon: '⚡', title: 'Profitability Boost', desc: 'A mere 5% increase in customer retention rates can lead to a 25% to 95% increase in profits.' },
    { icon: '🎯', title: 'Targeted Retention', desc: 'Identifies specific at-risk customers, allowing for personalized interventions and offers to address their unique concerns and needs.' },
    { icon: '🌟', title: 'Enhanced Reputation', desc: 'Proactive churn management and improved customer satisfaction can reduce negative word-of-mouth and strengthen the brand\'s reputation and trust.' },
    { icon: '🔍', title: 'Product Improvement Insights', desc: 'Analyzing why customers might leave helps financial institutions pinpoint weaknesses in their services or products, guiding future improvements.' },
    { icon: '🚀', title: 'Competitive Advantage', desc: 'Enables institutions to respond quickly to customer needs and market changes, staying ahead of competitors.' },
    { icon: '💰', title: 'Better Financial Planning', desc: 'Provides data-driven insights for more accurate forecasting of revenue and efficient allocation of resources for retention campaigns.' }
  ];

  const accordionItems = [
    {
      title: 'Retention Gain',
      content: 'Improves customer loyalty by providing personalized experiences, faster interactions, and consistent engagement that keeps users coming back. This targeted approach increases the effectiveness of retention campaigns, reduces unnecessary marketing costs, and maximizes the overall return on investment.'
    },
    {
      title: 'Revenue Impact',
      content: 'Drives revenue growth by increasing customer lifetime value, improving conversion rates, and reducing acquisition costs. By identifying customers who are likely to leave and taking timely action, businesses can retain valuable customers and protect recurring revenue streams.'
    },
    {
      title: 'Operational Efficiency',
      content: 'The ability to streamline business processes by using data-driven insights to manage customer retention more effectively. By identifying high-risk customers in advance, organizations can prioritize their efforts and allocate resources more efficiently, reducing time and operational costs.'
    }
  ];

  const members = [
    { name: 'Arpita Dipti Rajan', linkedin: 'https://www.linkedin.com/in/arpita-dipti-rajan-8bb9273a0', github: 'https://github.com/rajanarpitadipti'},
    { name: 'Itishree Behera', linkedin: 'www.linkedin.com/in/itishree-behera-177e45', github: 'https://github.com/itishreebehera533-boop'  },
    { name: 'Piyush Barik', linkedin: 'www.linkedin.com/in/piyush-barik-753b84383', github: 'https://github.com/barik-piyush'  },
    { name: 'Rahul Arbind', linkedin: 'https://www.linkedin.com/in/rahularbind', github: 'https://github.com/BlakeXHunt' },
    { name: 'Santosh Kumar Mangaraj', linkedin: 'https://www.linkedin.com/in/santosh-kumar-mangaraj-7361333a4', github: 'https://github.com/santoshmangaraj047-cyber'}
  ];

  // Handle resize
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 880);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Inject fonts and global styles
  useEffect(() => {
    const fontId = 'fccps-fonts';
    if (!document.getElementById(fontId)) {
      const link = document.createElement('link');
      link.id = fontId;
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Nunito:wght@200;300;400;500;600;700;800;900&family=Montserrat:wght@100;200;300;400;500;600;700;800;900&family=Lato:wght@100;300;400;700;900&display=swap';
      document.head.appendChild(link);
    }

    const styleId = 'fccps-global-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        @keyframes slideInFromLeft {
          from { opacity: 0; transform: translateX(-100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes revealText {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Scroll handlers: navbar background, h2 opacity, spans reveal
  useEffect(() => {
    const handleScroll = () => {
      // Navbar background change
      if (featuresSectionRef.current) {
        const featureTop = featuresSectionRef.current.offsetTop;
        if (window.scrollY >= featureTop - 60) {
          setNavbarBg('rgba(0, 0, 0, 1)');
        } else {
          setNavbarBg('linear-gradient(to bottom right, #001845, #023E7D, #0466C8)');
        }
      }

      // Third section h2 opacity
      if (thirdSectionRef.current) {
        const thirdTop = thirdSectionRef.current.offsetTop;
        const scrollTop = window.scrollY;
        let opacity = 1 - scrollTop / 250;
        opacity = Math.max(0, Math.min(1, opacity));
        setH2Opacity(opacity);
      }

      // Reveal spans animation
      if (revealContainerRef.current) {
        const containerRect = revealContainerRef.current.getBoundingClientRect();
        const containerTop = containerRect.top;
        const containerBottom = containerRect.bottom;
        const windowHeight = window.innerHeight;
        let scrollProgress = 0;
        if (containerTop < windowHeight && containerBottom > 0) {
          scrollProgress = 1 - (containerTop / windowHeight);
          scrollProgress = Math.max(0, Math.min(1, scrollProgress));
        } else if (containerTop >= windowHeight) {
          scrollProgress = 0;
        } else {
          scrollProgress = 1;
        }
        const totalSpans = revealWords.filter(item => typeof item === 'string').length;
        const shouldBeVisible = Math.round(scrollProgress * totalSpans);
        setVisibleSpanCount(shouldBeVisible);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // initial call
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Slider auto-advance
  const startSlider = useCallback(() => {
    if (sliderIntervalRef.current) clearInterval(sliderIntervalRef.current);
    sliderIntervalRef.current = setInterval(() => {
      setCurrentSlide(prev => (prev % totalSlides) + 1);
    }, 3000);
  }, []);

  useEffect(() => {
    startSlider();
    return () => {
      if (sliderIntervalRef.current) clearInterval(sliderIntervalRef.current);
    };
  }, [startSlider]);

  const handleSlideChange = (index) => {
    setCurrentSlide(index);
    if (sliderIntervalRef.current) {
      clearInterval(sliderIntervalRef.current);
      startSlider();
    }
  };

  // Accordion logic with height transition
  useEffect(() => {
    accordionContentsRef.current.forEach((content, idx) => {
      if (content) {
        if (activeAccordion === idx) {
          content.style.maxHeight = content.scrollHeight + 'px';
        } else {
          content.style.maxHeight = '0px';
        }
      }
    });
  }, [activeAccordion]);

  const toggleAccordion = (index) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  // Smooth scroll handler
  const scrollToSection = (e, href) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Styles
  const colors = { white: '#ffffff', black: '#000000' };

  const headerStyle = {
    position: 'fixed',
    top: 0,
    width: '100%',
    background: navbarBg,
    zIndex: 1000,
    boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
  };

  const navbarStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '60px',
    paddingLeft: '30px',
    fontSize: isMobile ? '0.9rem' : '1.12rem'
  };

  const logoTextStyle = {
    color: colors.white,
    fontSize: isMobile ? '1.5rem' : '2rem',
    fontFamily: 'Gill Sans, Gill Sans MT, Calibri, Trebuchet MS, sans-serif',
    margin: 0
  };

  const navItemsContainerStyle = {
    display: 'flex',
    gap: isMobile ? '12px' : '20px',
    paddingRight: isMobile ? '15px' : '15px',
    listStyle: 'none',
    margin: 0
  };

  const navItemStyle = (isHovered) => ({
    padding: '10px 15px',
    color: isHovered ? '#001845' : colors.white,
    borderRadius: '80px',
    fontSize: isMobile ? '0.95rem' : '1.12rem',
    cursor: 'pointer',
    background: isHovered ? colors.white : 'transparent',
    transition: '0.3s ease',
    fontFamily: 'Verdana, Geneva, Tahoma, sans-serif',
    textDecoration: 'none',
    display: 'inline-block'
  });

  const startBtnStyle = (isHovered) => ({
    color: colors.white,
    padding: '4px 13px',
    fontSize: isMobile ? '0.9rem' : '1.12rem',
    fontFamily: 'Relative, sans-serif',
    borderRadius: '8px',
    backgroundColor: '#22cd6e',
    border: isHovered ? '2px solid #199b1c' : '2px solid transparent',
    cursor: 'pointer',
    transition: '0.3s ease',
    marginRight: '29px'
  });

  const mainSectionStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 'calc(100vh - 60px)',
    marginTop: '60px'
  };

  const sectionDetailsStyle = {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const mainTextStyle = {
    color: colors.white,
    fontSize: isMobile ? '2.2rem' : '5rem',
    fontWeight: 700,
    marginBottom: '20px',
    fontFamily: 'Lato, sans-serif',
    animation: 'slideInFromLeft 1s ease-out forwards'
  };

  const getStartedBtnStyle = (isHovered) => ({
    color: isHovered ? colors.black : colors.white,
    borderRadius: '80px',
    padding: '10px 24px',
    fontSize: isMobile ? '1rem' : '1.12rem',
    backgroundColor: isHovered ? 'rgba(232, 237, 230, 0.659)' : 'rgb(16, 6, 35)',
    border: isHovered ? '2px solid black' : '2px solid transparent',
    transition: '0.1s',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block',
    animation: 'slideInFromLeft 3s ease-out forwards'
  });

  const featuresSectionStyle = {
    background: 'linear-gradient(to bottom, #0a6b82 0%, #000814 100%)',
    padding: isMobile ? '60px 20px' : '80px 40px',
    minHeight: '900px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center'
  };

  const featuresTitleStyle = {
    color: colors.white,
    fontSize: isMobile ? '2rem' : '2.8rem',
    fontWeight: 700,
    marginBottom: '20px',
    fontFamily: 'Montserrat, sans-serif'
  };

  const featuresDescStyle = {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: isMobile ? '1rem' : '1.2rem',
    maxWidth: '800px',
    marginBottom: '60px',
    lineHeight: 1.6
  };

  const featuresContainerStyle = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '30px',
    maxWidth: '1300px',
    width: '100%',
    margin: '0 auto'
  };

  const featuresCardStyle = (isHovered) => ({
    background: 'rgba(255, 255, 255, 0.251)',
    border: isHovered ? '1px solid rgba(4, 102, 200, 0.5)' : '1px solid rgba(255, 255, 255, 0.15)',
    padding: '30px',
    borderRadius: '12px',
    color: colors.white,
    transition: 'transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease',
    cursor: 'pointer',
    transform: isHovered ? 'translateY(-8px)' : 'none',
    boxShadow: isHovered ? '0 16px 35px rgba(4, 102, 200, 0.25)' : 'none',
    background: isHovered ? 'rgba(32, 32, 30, 0.51)' : 'rgba(255, 255, 255, 0.251)'
  });

  const thirdSectionStyle = {
    background: '#000814',
    minHeight: '300px'
  };

  const thirdHeadingStyle = {
    opacity: h2Opacity,
    color: '#22cd6e',
    fontWeight: 300,
    paddingLeft: isMobile ? '20px' : '85px',
    fontSize: isMobile ? '1.2rem' : '1.8rem',
    paddingTop: '21px',
    fontFamily: 'Times New Roman, Times, serif'
  };

  const revealContainerStyle = {
    maxWidth: isMobile ? '90%' : '764px',
    margin: isMobile ? '20px auto' : '61px 60px',
    padding: isMobile ? '30px 20px' : '61px 60px',
    marginLeft: isMobile ? 'auto' : '25px'
  };

  const fourthSectionStyle = {
    background: '#e8edf2',
    minHeight: '900px',
    padding: isMobile ? '20px' : '0'
  };

  const fourthPara1Style = {
    textAlign: 'center',
    fontFamily: 'Lato, sans-serif',
    fontWeight: 700,
    fontSize: isMobile ? '1.8rem' : '2.3rem',
    paddingTop: '100px'
  };

  const fourthPara2Style = {
    textAlign: 'center',
    fontWeight: 700,
    fontSize: isMobile ? '1.5rem' : '2.5rem',
    lineHeight: 1.8,
    fontFamily: 'Lato, sans-serif'
  };

  const fourthPreStyle = {
    textAlign: 'center',
    fontFamily: 'Montserrat, sans-serif',
    paddingTop: '8px',
    lineHeight: 1.4,
    whiteSpace: 'pre-wrap',
    fontSize: isMobile ? '0.9rem' : '1rem'
  };

  const learnBtnStyle = (isHovered) => ({
    display: 'block',
    margin: '0 auto',
    textAlign: 'center',
    padding: '6px 15px',
    fontSize: isMobile ? '1rem' : '1.12rem',
    fontFamily: 'Relative, sans-serif',
    color: colors.white,
    backgroundColor: colors.black,
    border: isHovered ? '2px solid rgb(197, 177, 177)' : '2px solid transparent',
    cursor: 'pointer',
    transition: '0.3s ease'
  });

  const fifthSectionStyle = {
    background: '#000000',
    minHeight: '900px',
    padding: isMobile ? '20px' : '0'
  };

  const fifthHeadingStyle = {
    color: colors.white,
    textAlign: 'center',
    fontSize: isMobile ? '2rem' : '2.8rem',
    fontWeight: 700,
    fontFamily: 'Montserrat, sans-serif',
    paddingTop: '82px'
  };

  const fifthPreStyle = {
    color: colors.white,
    textAlign: 'center',
    fontFamily: 'Montserrat, sans-serif',
    paddingTop: '8px',
    lineHeight: 1.4,
    whiteSpace: 'pre-wrap'
  };

  const securityContainerStyle = {
    color: colors.white,
    maxWidth: isMobile ? '90%' : '764px',
    margin: '102px auto',
    fontSize: isMobile ? '1rem' : '1.2rem',
    fontFamily: 'Times New Roman, Times, serif',
    lineHeight: 1.8,
    textAlign: 'center'
  };

  const optionsContainerStyle = {
    maxWidth: '700px',
    margin: 'auto',
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    gap: '30px',
    justifyContent: 'center',
    paddingLeft: isMobile ? '20px' : '124px',
    paddingRight: isMobile ? '20px' : '0'
  };

  const optionItemStyle = {
    marginBottom: '0px',
    justifyContent: 'space-between',
    fontSize: 'medium',
    width: isMobile ? '100%' : '300px'
  };

  const optionHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    color: colors.white
  };

  const arrowStyle = (isActive) => ({
    transition: 'transform 0.1s ease',
    fontSize: 'small',
    transform: isActive ? 'rotate(180deg)' : 'none'
  });

  const discoverStyle = {
    color: '#555',
    fontSize: '14px',
    cursor: 'pointer',
    margin: '8px 0'
  };

  const optionContentStyle = {
    maxHeight: '0px',
    overflow: 'hidden',
    transition: 'max-height 0.4s ease',
    color: colors.white,
    fontSize: '1rem'
  };

  const sliderContainerStyle = {
    position: 'relative',
    marginTop: '3rem'
  };

  const sliderStyle = {
    width: isMobile ? '90vw' : '55vw',
    height: isMobile ? '30vh' : '50vh',
    boxShadow: '10px 10px 10px rgba(0, 0, 1, 0.625)',
    overflow: 'hidden',
    margin: '0 auto'
  };

  const sliderHolderStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 100%)',
    height: '100%',
    width: '100%',
    transition: 'transform 0.8s ease-in-out',
    transform: `translateX(-${(currentSlide - 1) * 100}%)`
  };

  const sliderImageStyle = (imageUrl) => ({
    backgroundImage: `url(${imageUrl})`,
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    width: '100%',
    height: '100%'
  });

  const buttonHolderStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: '12px',
    position: 'absolute',
    bottom: '6px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    padding: '10px'
  };

  const sliderBtnStyle = (isActive, isHovered) => ({
    backgroundColor: isHovered ? '#929090' : colors.white,
    height: '10px',
    width: '10px',
    borderRadius: '10px',
    display: 'inline-block',
    opacity: isActive ? 1 : 0.5,
    transform: isActive ? 'scale(1.3)' : 'scale(1)',
    transition: 'opacity 0.3s ease, transform 0.3s ease',
    cursor: 'pointer'
  });

  const footerStyle = {
    height: 'auto',
    background: '#ffffff',
    padding: isMobile ? '30px 20px' : '50px',
    fontFamily: 'Arial, sans-serif'
  };

  const footerSectionStyle = {
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    justifyContent: 'space-between',
    gap: '20px'
  };

  const aboutUsStyle = {
    flex: 1,
    minWidth: isMobile ? 'auto' : '300px',
    marginBottom: isMobile ? '30px' : 0
  };

  const aboutTitleStyle = {
    fontSize: '25px',
    fontWeight: 'lighter',
    marginBottom: '15px'
  };

  const aboutPreStyle = {
    color: '#555',
    lineHeight: 1.6,
    paddingTop: '10px',
    whiteSpace: 'pre-wrap',
    fontFamily: 'Arial, sans-serif'
  };

  const featuresFooterStyle = {
    display: 'flex',
    gap: '15px',
    marginTop: '15px',
    flexWrap: 'wrap'
  };

  const featureBadgeStyle = {
    background: '#f4f6f8',
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '14px'
  };

  const contactUsStyle = {
    flex: 1,
    minWidth: isMobile ? 'auto' : '350px'
  };

  const memberSectionStyle = {
    display: 'flex',
    gap: '30px',
    paddingTop: '30px',
    flexWrap: 'wrap'
  };

  const memberStyle = {
    marginBottom: '12px',
    paddingTop: '10px',
    flex: isMobile ? '0 0 100%' : '0 0 calc(33.333% - 34px)'
  };

  const memberNameStyle = {
    marginBottom: '5px',
    fontSize: '14px',
    fontWeight: 'lighter'
  };

  const linkTextStyle = {
    fontSize: '14px',
    color: '#555'
  };

  const linkAStyle = {
    marginRight: '10px',
    color: '#0077b5',
    textDecoration: 'none'
  };

  const footerBottomStyle = {
    marginTop: '50px',
    textAlign: 'center',
    color: '#777',
    fontSize: '14px',
    borderTop: '1px solid #eee',
    paddingTop: '15px'
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #001845, #023E7D, #0466C8, #979DAC, #5C677D, #023E7D)' }}>
      <header style={headerStyle}>
        <nav style={navbarStyle}>
          <a href="#home" style={{ textDecoration: 'none' }} onClick={(e) => scrollToSection(e, '#home')}>
            <h2 style={logoTextStyle}>FCCPS</h2>
          </a>
          <ul style={navItemsContainerStyle}>
            {navLinks.map((link, idx) => (
              <li key={idx} style={{ margin: 0 }}>
                <a
                  href={link.href}
                  style={navItemStyle(hoveredNavItem === idx)}
                  onMouseEnter={() => setHoveredNavItem(idx)}
                  onMouseLeave={() => setHoveredNavItem(null)}
                  onClick={(e) => scrollToSection(e, link.href)}
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
          <div>
            <button
              style={startBtnStyle(hoveredStartBtn)}
              onMouseEnter={() => setHoveredStartBtn(true)}
              onMouseLeave={() => setHoveredStartBtn(false)}
              onClick={() => window.location.href = '/login'}
            >
              Start
            </button>
          </div>
        </nav>
      </header>

      <main>
        <section style={mainSectionStyle} id="home">
          <div style={sectionDetailsStyle}>
            <b><p style={mainTextStyle}>Let's Get Started</p></b>
            <div>
              <a
                href="#"
                style={getStartedBtnStyle(hoveredStart)}
                onMouseEnter={() => setHoveredStart(true)}
                onMouseLeave={() => setHoveredStart(false)}
                onClick={(e) => { e.preventDefault(); window.location.href = '/login'; }}
              >
                Get Started
              </a>
            </div>
          </div>
        </section>

        <section style={featuresSectionStyle} id="features" ref={featuresSectionRef}>
          <h2 style={featuresTitleStyle}>Why We Need FCCPS?</h2>
          <p style={featuresDescStyle}>Powerful capabilities designed to help you predict customer churn and take proactive retention actions.</p>
          <div style={featuresContainerStyle}>
            {features.map((feature, idx) => (
              <div
                key={idx}
                style={featuresCardStyle(hoveredCard === idx)}
                onMouseEnter={() => setHoveredCard(idx)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <h3 style={{ fontSize: '1.4rem', marginBottom: '12px', fontWeight: 600 }}>{feature.icon} {feature.title}</h3>
                <p style={{ fontSize: '0.95rem', lineHeight: 1.5, opacity: 0.9 }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={thirdSectionStyle} id="Model-training" ref={thirdSectionRef}>
          <strong><h2 style={thirdHeadingStyle}>A powerful prediction of churn</h2></strong>
          <div style={revealContainerStyle} ref={revealContainerRef}>
            <h1 style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }} className="reveal">
              {revealWords.map((word, idx) => {
                if (typeof word === 'object') return word;
                return (
                  <span
                    key={idx}
                    style={{
                      display: 'inline-block',
                      opacity: idx < visibleSpanCount ? 1 : 0,
                      transition: 'opacity 1s ease-out',
                      color: colors.white,
                      fontSize: isMobile ? '1rem' : '1.2rem',
                      fontFamily: 'Montserrat, sans-serif'
                    }}
                  >
                    {word}{' '}
                  </span>
                );
              })}
            </h1>
          </div>
        </section>

        <section style={fourthSectionStyle}>
          <p style={fourthPara1Style}>Stop Loosing Customer</p>
          <p style={fourthPara2Style}>Before You See It Coming</p>
          <pre style={fourthPreStyle}>Predict which customers will leave and act before they do. Our system identifies churn risk with 
precision, giving your institution the edge it needs to retain revenue and relationships.</pre>
          <div style={{ paddingTop: '28px' }}>
            <button
              style={learnBtnStyle(hoveredLearn)}
              onMouseEnter={() => setHoveredLearn(true)}
              onMouseLeave={() => setHoveredLearn(false)}
              onClick={() => alert('Learn more about churn prediction')}
            >
              Learn
            </button>
          </div>

          <div style={sliderContainerStyle}>
            <div style={sliderStyle}>
              <div style={sliderHolderStyle}>
                {sliderImages.map((img, idx) => (
                  <div key={idx} style={sliderImageStyle(img)}></div>
                ))}
              </div>
              <div style={buttonHolderStyle}>
                {[1, 2, 3, 4].map((num) => (
                  <a
                    key={num}
                    href="#"
                    style={sliderBtnStyle(currentSlide === num, hoveredSliderBtn === num)}
                    onMouseEnter={() => setHoveredSliderBtn(num)}
                    onMouseLeave={() => setHoveredSliderBtn(null)}
                    onClick={(e) => { e.preventDefault(); handleSlideChange(num); }}
                  ></a>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section style={fifthSectionStyle}>
          <div>
            <h2 style={fifthHeadingStyle}>What Do You Gain</h2>
          </div>
          <pre style={fifthPreStyle}>Financial institution using our sytem see measurable improvements in retention and revenue</pre>
          <pre style={fifthPreStyle}>The number speaks for themeselves when you know who's leaving before they leave</pre>
          <p style={securityContainerStyle}>
            The system handles sensitive financial and personal customer data, so strong security
            measures such as encrypted data transmission, secure authentication, and role-based access control are
            essential. Proper validation of user inputs and protection against common web threats like data leakage
            and unauthorized access help maintain system reliability. In addition, secure data storage, regular security
            updates, and compliance with financial data protection standards ensure customer privacy and trust. A
            well-secured web interface not only safeguards information but also enhances user confidence in the
            system's predictions and services.
          </p>

          <div style={optionsContainerStyle}>
            {accordionItems.map((item, idx) => (
              <div key={idx} style={optionItemStyle}>
                <div style={optionHeaderStyle} onClick={() => toggleAccordion(idx)}>
                  <h3 style={{ margin: 0 }}>{item.title}</h3>
                  <span style={arrowStyle(activeAccordion === idx)}>▼</span>
                </div>
                <p style={discoverStyle} onClick={() => toggleAccordion(idx)}>Discover</p>
                <div
                  ref={(el) => accordionContentsRef.current[idx] = el}
                  style={optionContentStyle}
                >
                  <p>{item.content}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer style={footerStyle} id="footer">
        <div style={footerSectionStyle}>
          <div style={aboutUsStyle}>
            <h3 style={aboutTitleStyle}>About us</h3>
            <pre style={aboutPreStyle}>
We are a team of 5 developers building a financial
customer churn prediction system. Our goal is to help businesses
analyze customer behavior and reduce churn using smart insights.
            </pre>
            <pre style={aboutPreStyle}>
This system helps reduce the risk of customers who are likely to
leave the bank by identifying early warning signs of churn. It
enables the bank to understand the key reasons why customers 
intend to leave and take proactive measures to address their
concerns. By minimizing customer churn, the bank can improve
customer retention and increase overall profitability. The 
system provides timely insights before a customer actually
leaves, allowing the bank to implement targeted retention 
strategies.
            </pre>
            <div style={featuresFooterStyle}>
              <span style={featureBadgeStyle}>🪙 Profitability Boost</span>
              <span style={featureBadgeStyle}>📊 Data Insights</span>
              <span style={featureBadgeStyle}>⚡ Real-Time</span>
            </div>
          </div>

          <div style={contactUsStyle}>
            <h3 style={aboutTitleStyle}>Contact us</h3>
            <div style={memberSectionStyle}>
              {members.map((member, idx) => (
                <div key={idx} style={memberStyle}>
                  <h4 style={memberNameStyle}>{member.name}</h4>
                  <div>
                    <p style={linkTextStyle}>
                      LinkedIn: <a href={member.linkedin} style={linkAStyle} target="_blank" rel="noopener noreferrer">Profile</a>
                    </p>
                    <p style={linkTextStyle}>
                      GitHub: <a href={member.github} style={linkAStyle} target="_blank" rel="noopener noreferrer">Profile</a>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={footerBottomStyle}>
          © 2026 Churn Project All rights reserved • Built by Team • Services • Privacy policy
        </div>
      </footer>
    </div>
  );
}