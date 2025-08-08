'use client';

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { GraduationCap, Car, Home, ShoppingBag, DollarSign } from 'lucide-react';

interface ServiceCard {
  id: string;
  title: string;
  description: string;
  label: string;
  icon: any;
  href: string;
  size: 'large' | 'medium' | 'small';
  image?: string;
}

interface MagicBentoProps {
  textAutoHide?: boolean;
  enableStars?: boolean;
  enableSpotlight?: boolean;
  enableBorderGlow?: boolean;
  disableAnimations?: boolean;
  spotlightRadius?: number;
  particleCount?: number;
  enableTilt?: boolean;
  glowColor?: string;
  clickEffect?: boolean;
  enableMagnetism?: boolean;
  onCardClick?: (href: string) => void;
}

const services: ServiceCard[] = [
  {
    id: 'accommodation',
    title: 'Student Housing',
    description: 'Discover affordable accommodation near your university',
    label: 'Housing',
    icon: Home,
    href: '/accommodation',
    size: 'large',
    image: '🏠'
  },
  {
    id: 'jobs',
    title: 'Part-Time Jobs',
    description: 'Find flexible work opportunities',
    label: 'Career',
    icon: GraduationCap,
    href: '/jobs',
    size: 'medium'
  },
  {
    id: 'ridesharing',
    title: 'Ride Sharing',
    description: 'Share rides with fellow students',
    label: 'Transport',
    icon: Car,
    href: '/ridesharing',
    size: 'medium'
  },
  {
    id: 'marketplace',
    title: 'Marketplace',
    description: 'Buy and sell student essentials',
    label: 'Commerce',
    icon: ShoppingBag,
    href: '/marketplace',
    size: 'small'
  },
  {
    id: 'currency',
    title: 'Currency Exchange',
    description: 'Real-time exchange rates',
    label: 'Finance',
    icon: DollarSign,
    href: '/currency',
    size: 'small'
  }
];

const ParticleCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  enableParticles?: boolean;
  enableGlow?: boolean;
}> = ({ children, className = '', onClick, enableParticles = true, enableGlow = true }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (!cardRef.current) return;

    const card = cardRef.current;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!enableGlow) return;
      
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Calculate relative position as percentages
      const xPercent = (x / rect.width) * 100;
      const yPercent = (y / rect.height) * 100;
      
      // Set CSS custom properties for the glow effect
      card.style.setProperty('--mouse-x', `${xPercent}%`);
      card.style.setProperty('--mouse-y', `${yPercent}%`);
    };
    
    const handleMouseEnter = () => {
      if (enableGlow) {
        card.style.setProperty('--glow-opacity', '1');
      }
      
      if (!enableParticles) return;
      
      // Create particles on hover
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          const particle = document.createElement('div');
          particle.className = 'particle';
          particle.style.cssText = `
            position: absolute;
            width: 4px;
            height: 4px;
            background: rgb(251, 146, 60);
            border-radius: 50%;
            pointer-events: none;
            z-index: 10;
            left: ${Math.random() * card.offsetWidth}px;
            top: ${Math.random() * card.offsetHeight}px;
          `;
          
          card.appendChild(particle);
          particlesRef.current.push(particle);
          
          // Animate particle
          gsap.fromTo(particle, 
            { scale: 0, opacity: 1 },
            { 
              scale: 1, 
              opacity: 0,
              x: (Math.random() - 0.5) * 50,
              y: (Math.random() - 0.5) * 50,
              duration: 1,
              ease: "power2.out",
              onComplete: () => {
                particle.remove();
                const index = particlesRef.current.indexOf(particle);
                if (index > -1) particlesRef.current.splice(index, 1);
              }
            }
          );
        }, i * 100);
      }
    };

    const handleMouseLeave = () => {
      if (enableGlow) {
        card.style.setProperty('--glow-opacity', '0');
      }
      
      // Clean up particles
      particlesRef.current.forEach(particle => {
        particle.remove();
      });
      particlesRef.current = [];
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseenter', handleMouseEnter);
      card.removeEventListener('mouseleave', handleMouseLeave);
      handleMouseLeave();
    };
  }, [enableParticles, enableGlow]);

  return (
    <div
      ref={cardRef}
      className={className}
      onClick={onClick}
      style={{ 
        position: 'relative',
        '--mouse-x': '50%',
        '--mouse-y': '50%',
        '--glow-opacity': '0'
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
};

const MagicBento: React.FC<MagicBentoProps> = ({
  enableStars = true,
  onCardClick
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleCardClick = (href: string) => {
    if (onCardClick) {
      onCardClick(href);
    } else {
      window.location.href = href;
    }
  };

  return (
    <div ref={containerRef} className="magic-bento-container">
      <style jsx>{`
        .magic-bento-container {
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
          padding: 0 1rem;
        }
        
        .bento-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          grid-template-rows: repeat(2, 240px);
          gap: 1.5rem;
          width: 100%;
        }
        
        .bento-card {
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 16px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: all 0.3s ease;
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }
        
        .bento-card::before {
          content: '';
          position: absolute;
          inset: 0;
          padding: 2px;
          background: radial-gradient(
            400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
            rgba(251, 146, 60, 0.4) 0%,
            rgba(251, 146, 60, 0.2) 25%,
            rgba(251, 146, 60, 0.1) 50%,
            transparent 70%
          );
          border-radius: inherit;
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: subtract;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          pointer-events: none;
          opacity: var(--glow-opacity, 0);
          transition: opacity 0.3s ease;
        }
        
        .bento-card::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(
            300px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
            rgba(251, 146, 60, 0.1) 0%,
            rgba(251, 146, 60, 0.05) 30%,
            transparent 70%
          );
          border-radius: inherit;
          opacity: var(--glow-opacity, 0);
          transition: opacity 0.3s ease;
          pointer-events: none;
        }
        
        .bento-card:hover {
          border-color: rgb(251, 146, 60);
          transform: translateY(-4px);
          box-shadow: 
            0 10px 25px rgba(251, 146, 60, 0.15),
            0 0 30px rgba(251, 146, 60, 0.1);
        }
        
        .large {
          grid-column: span 2;
          grid-row: span 2;
        }
        
        .medium {
          grid-column: span 1;
          grid-row: span 1;
        }
        
        .small {
          grid-column: span 1;
          grid-row: span 1;
        }
        
        .card-content {
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }
        
        .card-label {
          background: rgba(251, 146, 60, 0.1);
          color: rgb(251, 146, 60);
          padding: 0.25rem 0.75rem;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .card-icon {
          width: 32px;
          height: 32px;
          color: rgb(251, 146, 60);
          flex-shrink: 0;
        }
        
        .card-image {
          font-size: 4rem;
          text-align: center;
          margin: 1rem 0;
          opacity: 0.8;
        }
        
        .large .card-image {
          font-size: 6rem;
          margin: 2rem 0;
        }
        
        .card-title {
          font-size: 1.25rem;
          font-weight: 700;
          margin: 0.5rem 0;
          color: #1f2937;
          line-height: 1.3;
        }
        
        .large .card-title {
          font-size: 1.75rem;
          margin: 1rem 0;
        }
        
        .card-description {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0;
          line-height: 1.5;
        }
        
        .large .card-description {
          font-size: 1rem;
        }
        
        @media (max-width: 768px) {
          .bento-grid {
            grid-template-columns: 1fr;
            grid-template-rows: auto;
            gap: 1rem;
          }
          
          .large,
          .medium,
          .small {
            grid-column: span 1;
            grid-row: span 1;
          }
          
          .bento-card {
            min-height: 160px;
          }
        }
      `}</style>
      
      <div className="bento-grid">
        {services.map((service) => {
          const IconComponent = service.icon;
          
          const CardComponent = enableStars ? ParticleCard : 'div';
          
          return (
            <CardComponent
              key={service.id}
              className={`bento-card ${service.size}`}
              onClick={() => handleCardClick(service.href)}
              enableParticles={enableStars}
              enableGlow={true}
            >
              <div className="card-content">
                <div className="card-header">
                  <span className="card-label">{service.label}</span>
                  <IconComponent className="card-icon" />
                </div>
                
                {service.image && service.size === 'large' && (
                  <div className="card-image">{service.image}</div>
                )}
                
                <div>
                  <h3 className="card-title">{service.title}</h3>
                  <p className="card-description">{service.description}</p>
                </div>
              </div>
            </CardComponent>
          );
        })}
      </div>
    </div>
  );
};

export default MagicBento;
