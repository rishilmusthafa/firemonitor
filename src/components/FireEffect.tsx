'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface FireEffectProps {
  isActive: boolean;
  children: React.ReactNode;
  className?: string;
}

export default function FireEffect({ isActive, children, className = '' }: FireEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!isActive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Fire particle system
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      size: number;
      color: string;
      flicker: number;
      type: 'flame' | 'spark' | 'ember' | 'smoke';
      rotation: number;
      rotationSpeed: number;
      temperature: number;
      turbulence: number;
      oxygen: number;
    }> = [];

    const createParticle = () => {
      const rect = canvas.getBoundingClientRect();
      // Constrain particles to card width with some margin
      const margin = 20;
      const minX = margin;
      const maxX = rect.width - margin;
      const baseX = minX + Math.random() * (maxX - minX);
      
      const type: 'flame' | 'spark' | 'ember' | 'smoke' = Math.random() < 0.6 ? 'flame' : Math.random() < 0.8 ? 'spark' : Math.random() < 0.9 ? 'ember' : 'smoke';
      
      const temperature = Math.random() * 1000 + 500; // 500-1500°C
      const turbulence = Math.random() * 2 + 0.5;
      const oxygen = Math.random() * 0.3 + 0.7; // Oxygen level affects flame color
      
      return {
        x: baseX,
        y: rect.height - 5 + Math.random() * 3, // Start just below the card
        vx: (Math.random() - 0.5) * 0.8, // Reduced horizontal movement
        vy: -Math.random() * 2 - 1, // Reduced upward movement
        life: 1,
        maxLife: Math.random() * 0.6 + 0.8,
        size: Math.random() * 6 + 3, // Smaller particles
        color: getFireColor(type, temperature, oxygen),
        flicker: Math.random() * 0.4 + 0.6,
        type,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        temperature,
        turbulence,
        oxygen
      };
    };

    // Realistic fire color based on temperature and oxygen
    const getFireColor = (type: string, temperature: number, oxygen: number) => {
      if (type === 'smoke') {
        return `hsl(0, 0%, ${Math.random() * 20 + 10}%)`;
      }
      
      if (type === 'spark') {
        return `hsl(${Math.random() * 20 + 50}, 100%, ${Math.random() * 30 + 60}%)`;
      }
      
      if (type === 'ember') {
        return `hsl(${Math.random() * 15 + 10}, 100%, ${Math.random() * 20 + 30}%)`;
      }
      
      // Flame colors based on temperature and oxygen
      if (temperature > 1200) {
        // Blue flame (hottest)
        return oxygen > 0.8 ? `hsl(${Math.random() * 20 + 200}, 100%, ${Math.random() * 30 + 60}%)` : 
               `hsl(${Math.random() * 20 + 180}, 100%, ${Math.random() * 30 + 50}%)`;
      } else if (temperature > 900) {
        // White flame
        return `hsl(${Math.random() * 20 + 40}, 100%, ${Math.random() * 30 + 70}%)`;
      } else if (temperature > 700) {
        // Yellow flame
        return `hsl(${Math.random() * 20 + 50}, 100%, ${Math.random() * 30 + 60}%)`;
      } else if (temperature > 500) {
        // Orange flame
        return `hsl(${Math.random() * 20 + 25}, 100%, ${Math.random() * 30 + 50}%)`;
      } else {
        // Red flame (coolest)
        return `hsl(${Math.random() * 20 + 15}, 100%, ${Math.random() * 30 + 40}%)`;
      }
    };

    // Drawing functions for different particle types
    const drawFlame = (ctx: CanvasRenderingContext2D, size: number, color: string) => {
      // Create realistic flame gradient
      const gradient = ctx.createRadialGradient(0, size * 0.2, 0, 0, size * 0.2, size);
      gradient.addColorStop(0, color);
      gradient.addColorStop(0.3, color.replace('100%', '90%'));
      gradient.addColorStop(0.6, color.replace('100%', '70%'));
      gradient.addColorStop(0.8, 'rgba(255, 100, 0, 0.5)');
      gradient.addColorStop(1, 'rgba(255, 50, 0, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      
      // Draw realistic flame shape with multiple lobes
      const lobes = 3;
      for (let i = 0; i < lobes; i++) {
        const angle = (i * Math.PI * 2) / lobes;
        const lobeSize = size * (0.8 + Math.sin(Date.now() * 0.01 + i) * 0.2);
        
        ctx.moveTo(0, -size);
        ctx.quadraticCurveTo(
          Math.cos(angle) * lobeSize * 0.3, -size * 0.7,
          Math.cos(angle) * lobeSize * 0.5, -size * 0.3
        );
        ctx.quadraticCurveTo(
          Math.cos(angle) * lobeSize * 0.7, -size * 0.1,
          Math.cos(angle) * lobeSize * 0.8, size * 0.2
        );
        ctx.quadraticCurveTo(
          Math.cos(angle) * lobeSize * 0.6, size * 0.5,
          Math.cos(angle) * lobeSize * 0.4, size * 0.7
        );
        ctx.quadraticCurveTo(
          Math.cos(angle) * lobeSize * 0.2, size * 0.9,
          0, size
        );
      }
      
      ctx.fill();
      
      // Add inner core
      const coreGradient = ctx.createRadialGradient(0, size * 0.1, 0, 0, size * 0.1, size * 0.3);
      coreGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
      coreGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = coreGradient;
      ctx.beginPath();
      ctx.arc(0, -size * 0.3, size * 0.2, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawSpark = (ctx: CanvasRenderingContext2D, size: number, color: string) => {
      // Create spark gradient
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
      gradient.addColorStop(0, color);
      gradient.addColorStop(0.5, color.replace('100%', '70%'));
      gradient.addColorStop(1, 'rgba(255, 255, 100, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      
      // Draw star-like spark
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4;
        const radius = i % 2 === 0 ? size : size * 0.5;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.fill();
    };

    const drawEmber = (ctx: CanvasRenderingContext2D, size: number, color: string) => {
      // Create ember gradient
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
      gradient.addColorStop(0, color);
      gradient.addColorStop(0.7, color.replace('100%', '60%'));
      gradient.addColorStop(1, 'rgba(255, 50, 0, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      
      // Draw irregular ember shape
      ctx.arc(0, 0, size * 0.8, 0, Math.PI * 2);
      ctx.fill();
      
      // Add some irregularity
      ctx.fillStyle = color.replace('100%', '80%');
      ctx.beginPath();
      ctx.arc(size * 0.3, -size * 0.2, size * 0.3, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawSmoke = (ctx: CanvasRenderingContext2D, size: number, color: string) => {
      // Create smoke gradient
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
      gradient.addColorStop(0, 'rgba(100, 100, 100, 0.8)');
      gradient.addColorStop(0.5, 'rgba(80, 80, 80, 0.4)');
      gradient.addColorStop(1, 'rgba(60, 60, 60, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      
      // Draw irregular smoke cloud
      const points = 8;
      for (let i = 0; i < points; i++) {
        const angle = (i * Math.PI * 2) / points;
        const radius = size * (0.7 + Math.sin(Date.now() * 0.005 + i) * 0.3);
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.fill();
      
      // Add inner smoke detail
      ctx.fillStyle = 'rgba(120, 120, 120, 0.3)';
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.4, 0, Math.PI * 2);
      ctx.fill();
    };

          const animate = () => {
        if (!isActive) return;

        // Get canvas dimensions
        const rect = canvas.getBoundingClientRect();

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Add new particles (fewer for better containment)
        if (particles.length < 30) {
          particles.push(createParticle());
        }
      
      // Add random spark particles (less frequent)
      if (Math.random() < 0.15) {
        const spark = {
          ...createParticle(),
          vy: -Math.random() * 8 - 4,
          size: Math.random() * 3 + 1,
          color: `hsl(${Math.random() * 20 + 50}, 100%, ${Math.random() * 30 + 60}%)`,
          maxLife: Math.random() * 0.4 + 0.3,
          type: 'spark' as const,
          temperature: Math.random() * 500 + 1000,
          turbulence: Math.random() * 3 + 1,
          oxygen: Math.random() * 0.2 + 0.8
        };
        particles.push(spark);
      }

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        
        // Update position and rotation with realistic physics
        const timeStep = 1/60; // 60 FPS
        
        // Temperature affects buoyancy
        const buoyancy = (particle.temperature - 500) / 1000 * 0.5;
        
        // Turbulence affects movement
        const turbulenceX = Math.sin(Date.now() * 0.001 * particle.turbulence) * 0.5;
        const turbulenceY = Math.cos(Date.now() * 0.001 * particle.turbulence) * 0.3;
        
        // Oxygen affects flame behavior
        const oxygenEffect = particle.oxygen * 0.5;
        
        // Update velocity with realistic physics
        particle.vx += turbulenceX * timeStep;
        particle.vy += (0.08 - buoyancy - oxygenEffect) * timeStep; // Gravity vs buoyancy
        
        // Update position with boundary constraints
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Keep particles within card boundaries
        const margin = 15;
        if (particle.x < margin) {
          particle.x = margin;
          particle.vx *= -0.5; // Bounce back with reduced velocity
        } else if (particle.x > rect.width - margin) {
          particle.x = rect.width - margin;
          particle.vx *= -0.5; // Bounce back with reduced velocity
        }
        
        // Life decay based on temperature and oxygen
        const lifeDecay = (1 - particle.oxygen) * 0.02 + (1 - particle.temperature / 1500) * 0.01;
        particle.life -= lifeDecay;
        particle.rotation += particle.rotationSpeed;

        // Remove dead particles
        if (particle.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        // Draw particle based on type
        const alpha = (particle.life / particle.maxLife) * particle.flicker;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rotation);

        if (particle.type === 'flame') {
          // Draw flame shape
          drawFlame(ctx, particle.size * alpha, particle.color);
        } else if (particle.type === 'spark') {
          // Draw spark
          drawSpark(ctx, particle.size * alpha, particle.color);
        } else if (particle.type === 'smoke') {
          // Draw smoke
          drawSmoke(ctx, particle.size * alpha, particle.color);
        } else {
          // Draw ember
          drawEmber(ctx, particle.size * alpha, particle.color);
        }

        ctx.restore();
      }

              // Draw realistic fire glow effect
      
      // Base fire glow with multiple layers (more contained)
      const baseGradient = ctx.createRadialGradient(
        rect.width / 2, rect.height, 0,
        rect.width / 2, rect.height, rect.height * 0.6
      );
      baseGradient.addColorStop(0, 'rgba(255, 100, 0, 0.3)');
      baseGradient.addColorStop(0.2, 'rgba(255, 80, 0, 0.2)');
      baseGradient.addColorStop(0.5, 'rgba(255, 60, 0, 0.15)');
      baseGradient.addColorStop(0.8, 'rgba(255, 40, 0, 0.08)');
      baseGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
      
      ctx.fillStyle = baseGradient;
      ctx.fillRect(0, 0, rect.width, rect.height);
      
      // Add flickering fire base with realistic timing
      const time = Date.now() * 0.001;
      const flickerIntensity = 0.4 + Math.sin(time * 8) * 0.2 + Math.sin(time * 15) * 0.1;
      const flickerGradient = ctx.createRadialGradient(
        rect.width / 2, rect.height, 0,
        rect.width / 2, rect.height, rect.height * 0.3
      );
      flickerGradient.addColorStop(0, `rgba(255, 200, 0, ${0.4 * flickerIntensity})`);
      flickerGradient.addColorStop(0.3, `rgba(255, 150, 0, ${0.3 * flickerIntensity})`);
      flickerGradient.addColorStop(0.7, `rgba(255, 100, 0, ${0.2 * flickerIntensity})`);
      flickerGradient.addColorStop(1, 'rgba(255, 50, 0, 0)');
      
      ctx.fillStyle = flickerGradient;
      ctx.fillRect(0, 0, rect.width, rect.height);
      
      // Add blue core for hottest part
      const coreGradient = ctx.createRadialGradient(
        rect.width / 2, rect.height, 0,
        rect.width / 2, rect.height, rect.height * 0.1
      );
      coreGradient.addColorStop(0, `rgba(100, 200, 255, ${0.25 * flickerIntensity})`);
      coreGradient.addColorStop(0.5, `rgba(150, 200, 255, ${0.15 * flickerIntensity})`);
      coreGradient.addColorStop(1, 'rgba(200, 200, 255, 0)');
      
      ctx.fillStyle = coreGradient;
      ctx.fillRect(0, 0, rect.width, rect.height);

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive]);

  return (
    <div className={`relative fire-effect-container ${isActive ? 'active p-1' : ''} ${className}`}>
      {/* Fire canvas overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          mixBlendMode: 'screen',
          filter: 'blur(1px)'
        }}
      />
      
      {/* Glowing border effect */}
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none z-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            background: 'linear-gradient(45deg, #ff4400, #ff8800, #ff4400)',
            filter: 'blur(8px)',
            transform: 'scale(1.05)',
          }}
        />
      )}
      
      {/* Content */}
      <div className={`relative z-20 ${isActive ? 'alert-open-glow' : ''}`}>
        {children}
      </div>
    </div>
  );
} 