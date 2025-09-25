'use client';

import { useEffect, useRef, useCallback } from 'react';

const SmoothWavyCanvas = ({
  backgroundColor = '#000000',
  primaryColor = '51,116,253',
  secondaryColor = '51,116,253',
  accentColor = '51,116,253',
  lineOpacity = 3,
  animationSpeed = 0.010,
}) => {
  const canvasRef = useRef(null);
  const requestIdRef = useRef(null);
  const timeRef = useRef(0);
  const energyFields = useRef([]);


  const getEnergyFieldInfluence = useCallback((x, y, currentTime) => {
    let totalIntensity = 0;
    let totalDirectionX = 0;
    let totalDirectionY = 0;
    energyFields.current.forEach((field) => {
      const age = currentTime - field.time;
      const maxAge = 4000;
      if (age < maxAge) {
        const dx = x - field.x;
        const dy = y - field.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const fieldRadius = (age / maxAge) * 300;
        const fieldWidth = 100;
        if (Math.abs(distance - fieldRadius) < fieldWidth) {
          const fieldStrength = (1 - age / maxAge) * field.intensity;
          const proximityToField = 1 - Math.abs(distance - fieldRadius) / fieldWidth;
          const influence = fieldStrength * proximityToField * 0.6;
          totalIntensity += influence;
          if (distance > 0) {
            totalDirectionX += (dx / distance) * influence;
            totalDirectionY += (dy / distance) * influence;
          }
        }
      }
    });
    const direction = Math.atan2(totalDirectionY, totalDirectionX);
    return { intensity: Math.min(totalIntensity, 1), direction };
  }, []);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }, []);




  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const currentTime = Date.now();
    timeRef.current += animationSpeed;
    const width = canvas.width;
    const height = canvas.height;
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
    const numPrimaryLines = 35;
    for (let i = 0; i < numPrimaryLines; i++) {
      const yPos = (i / numPrimaryLines) * height;
      const { intensity: fieldIntensity } = getEnergyFieldInfluence(width / 2, yPos, currentTime);
      const amplitude = 45 + 25 * Math.sin(timeRef.current * 0.25 + i * 0.15);
      const frequency = 0.006 + 0.002 * Math.sin(timeRef.current * 0.12 + i * 0.08);
      const speed = timeRef.current * (0.6 + 0.3 * Math.sin(i * 0.12));
      const thickness = 0.6 + 0.4 * Math.sin(timeRef.current + i * 0.25);
      const opacity =
        (0.12 + 0.08 * Math.abs(Math.sin(timeRef.current * 0.3 + i * 0.18))) *
        lineOpacity;
      ctx.beginPath();
      ctx.lineWidth = thickness;
      ctx.strokeStyle = `rgba(${primaryColor}, ${opacity})`;
      for (let x = 0; x < width; x += 2) {
        const y =
          yPos +
          amplitude * Math.sin(x * frequency + speed);
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }
    const numSecondaryLines = 25;
    for (let i = 0; i < numSecondaryLines; i++) {
      const xPos = (i / numSecondaryLines) * width;
      const { intensity: fieldIntensity } = getEnergyFieldInfluence(xPos, height / 2, currentTime);
      const amplitude = 40 + 20 * Math.sin(timeRef.current * 0.18 + i * 0.14);
      const frequency = 0.007 + 0.003 * Math.cos(timeRef.current * 0.14 + i * 0.09);
      const speed = timeRef.current * (0.5 + 0.25 * Math.cos(i * 0.16));
      const thickness = 0.5 + 0.3 * Math.sin(timeRef.current + i * 0.35);
      const opacity =
        (0.1 + 0.06 * Math.abs(Math.sin(timeRef.current * 0.28 + i * 0.2))) *
        lineOpacity;
      ctx.beginPath();
      ctx.lineWidth = thickness;
      ctx.strokeStyle = `rgba(${secondaryColor}, ${opacity})`;
      for (let y = 0; y < height; y += 2) {
        const x =
          xPos +
          amplitude * Math.sin(y * frequency + speed);
        if (y === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }
    const numAccentLines = 15;
    for (let i = 0; i < numAccentLines; i++) {
      const offset = (i / numAccentLines) * width * 1.5 - width * 0.25;
      const amplitude = 30 + 15 * Math.cos(timeRef.current * 0.22 + i * 0.12);
      const frequency = 0.01 + 0.004 * Math.sin(timeRef.current * 0.16 + i * 0.1);
      const phase = timeRef.current * (0.4 + 0.2 * Math.sin(i * 0.13));
      const thickness = 0.4 + 0.25 * Math.sin(timeRef.current + i * 0.28);
      const opacity =
        (0.06 + 0.04 * Math.abs(Math.sin(timeRef.current * 0.24 + i * 0.15))) *
        lineOpacity;
      ctx.beginPath();
      ctx.lineWidth = thickness;
      ctx.strokeStyle = `rgba(${accentColor}, ${opacity})`;
      const steps = 100;
      for (let j = 0; j <= steps; j++) {
        const progress = j / steps;
        const baseX = offset + progress * width;
        const baseY = progress * height + amplitude * Math.sin(progress * 6 + phase);
        const x = baseX;
        const y = baseY;
        if (j === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }
    requestIdRef.current = requestAnimationFrame(animate);
  }, [
    backgroundColor,
    primaryColor,
    secondaryColor,
    accentColor,
    lineOpacity,
    animationSpeed,
    getEnergyFieldInfluence,
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    resizeCanvas();

    const handleResize = () => resizeCanvas();
    window.addEventListener('resize', handleResize);

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (requestIdRef.current) {
        cancelAnimationFrame(requestIdRef.current);
        requestIdRef.current = null;
      }
      timeRef.current = 0;
      energyFields.current = [];
    };
  }, [animate, resizeCanvas]);

  return (
    <div
      className="fixed inset-0 w-full h-full overflow-hidden"
      style={{ backgroundColor, pointerEvents: 'none', zIndex: 0 }}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};

export default SmoothWavyCanvas;
