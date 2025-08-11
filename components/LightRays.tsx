'use client';

import { useRef, useEffect } from 'react';

interface LightRaysProps {
  raysOrigin?: 'top-center' | 'top-left' | 'top-right' | 'bottom-center' | 'center';
  raysColor?: string;
  raysSpeed?: number;
  lightSpread?: number;
  rayLength?: number;
  followMouse?: boolean;
  mouseInfluence?: number;
  noiseAmount?: number;
  distortion?: number;
  className?: string;
}

// Helper function to clamp RGB values between 0 and 255
const clampRgb = (value: number): number => Math.max(0, Math.min(255, Math.floor(value)));

// Helper function to create safe RGBA string
const safeRgba = (r: number, g: number, b: number, a: number): string => {
  const safeR = clampRgb(isNaN(r) ? 255 : r);
  const safeG = clampRgb(isNaN(g) ? 112 : g);
  const safeB = clampRgb(isNaN(b) ? 33 : b);
  const safeA = isNaN(a) ? 0.5 : Math.max(0, Math.min(1, a));
  return `rgba(${safeR}, ${safeG}, ${safeB}, ${safeA})`;
};

const LightRays: React.FC<LightRaysProps> = ({
  raysOrigin = 'top-center',
  raysColor = '#FB9230',
  raysSpeed = 1.5,
  lightSpread = 0.8,
  rayLength = 1.2,
  followMouse = true,
  mouseInfluence = 0.1,
  noiseAmount = 0.1,
  distortion = 0.05,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const timeRef = useRef(0);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
    };

    resize();

    // Convert hex to RGB
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 251, g: 146, b: 48 };
    };

    const color = hexToRgb(raysColor);

    // Origin positions
    const origins = {
      'top-center': [0.5, 0.1],
      'top-left': [0.2, 0.1],
      'top-right': [0.8, 0.1],
      'bottom-center': [0.5, 0.9],
      'center': [0.5, 0.5]
    };

    const [originX, originY] = origins[raysOrigin] || origins['top-center'];

    // Animation loop
    const animate = () => {
      timeRef.current += 0.016;
      
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Calculate origin point
      let currentOriginX = originX * width;
      let currentOriginY = originY * height;

      if (followMouse) {
        currentOriginX += (mouseRef.current.x * width - width * 0.5) * mouseInfluence;
        currentOriginY += (mouseRef.current.y * height - height * 0.5) * mouseInfluence;
      }

      // Text center for focused lighting
      const textCenterX = width * 0.5;
      const textCenterY = height * 0.45;

      // Draw rays
      const numRays = 12;
      for (let i = 0; i < numRays; i++) {
        const angle = (i / numRays) * Math.PI * 2;
        
        // Calculate ray direction toward text center
        const textAngle = Math.atan2(textCenterY - currentOriginY, textCenterX - currentOriginX);
        const angleDiff = Math.abs(angle - textAngle);
        const normalizedAngleDiff = Math.min(angleDiff, Math.PI * 2 - angleDiff);
        
        // Create focused beam toward text
        const focusStrength = Math.exp(-normalizedAngleDiff * 2);
        
        // Animate ray intensity with NaN safety
        const rayIntensity = (Math.sin(angle * 3 + timeRef.current * raysSpeed) * 0.5 + 0.5) * lightSpread;
        const finalIntensity = Math.max(0, isNaN(rayIntensity) ? 0.5 : rayIntensity * (1 + focusStrength * 2));
        
        if (finalIntensity > 0.1) {
          // Calculate ray end point
          const rayDistance = rayLength * Math.min(width, height) * 0.8;
          const endX = currentOriginX + Math.cos(angle) * rayDistance;
          const endY = currentOriginY + Math.sin(angle) * rayDistance;

          // Create gradient for ray
          const gradient = ctx.createLinearGradient(currentOriginX, currentOriginY, endX, endY);
          
          // Enhanced orange colors with spotlight effect
          const spotlightDistance = Math.sqrt(
            Math.pow(endX - textCenterX, 2) + Math.pow(endY - textCenterY, 2)
          );
          const spotlightStrength = Math.max(0, 1 - spotlightDistance / (width * 0.4));
          
          const startAlpha = Math.max(0, Math.min(1, finalIntensity * 0.8));
          const endAlpha = Math.max(0, Math.min(1, finalIntensity * 0.1 * (1 + spotlightStrength)));
          
          // Warm orange gradient with safe color values
          gradient.addColorStop(0, safeRgba(color.r, color.g * 0.7, color.b * 0.4, startAlpha));
          gradient.addColorStop(0.3, safeRgba(color.r, color.g, color.b, finalIntensity * 0.6));
          gradient.addColorStop(1, safeRgba(color.r * 1.2, color.g * 0.8, color.b * 0.5, endAlpha));

          // Draw ray
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 2 + focusStrength * 3;
          ctx.lineCap = 'round';
          
          ctx.beginPath();
          ctx.moveTo(currentOriginX, currentOriginY);
          ctx.lineTo(endX, endY);
          ctx.stroke();
        }
      }

      // Add central glow around text area
      const glowGradient = ctx.createRadialGradient(
        textCenterX, textCenterY, 0,
        textCenterX, textCenterY, width * 0.3
      );
      
      const glowIntensity = (Math.sin(timeRef.current * 2) * 0.1 + 0.3) * lightSpread;
      glowGradient.addColorStop(0, `rgba(${color.r}, ${Math.floor(color.g * 0.8)}, ${Math.floor(color.b * 0.6)}, ${glowIntensity})`);
      glowGradient.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, ${glowIntensity * 0.3})`);
      glowGradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);

      ctx.fillStyle = glowGradient;
      ctx.fillRect(0, 0, width, height);

      animationRef.current = requestAnimationFrame(animate);
    };

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      if (!followMouse) return;
      
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = (e.clientX - rect.left) / rect.width;
      mouseRef.current.y = (e.clientY - rect.top) / rect.height;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', resize);
    
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', resize);
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [
    raysOrigin,
    raysColor,
    raysSpeed,
    lightSpread,
    rayLength,
    followMouse,
    mouseInfluence,
    noiseAmount,
    distortion
  ]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 2,
        opacity: 0.8,
        mixBlendMode: 'screen'
      }}
    />
  );
};

export default LightRays;
