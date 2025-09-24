'use client';

import { useEffect, useRef, useCallback } from 'react';

const SmoothWavyCanvas = ({
  backgroundColor = '#ffffff',
  primaryColor = '51,116,253',
  secondaryColor = '51,116,253',
  accentColor = '51,116,253',
  lineOpacity = 2,
  animationSpeed = 0.005,
}) => {
  const canvasRef = useRef(null);
  const requestIdRef = useRef(null);
  const timeRef = useRef(0);
  const mouseRef = useRef({ x: 0, y: 0, isDown: false });
  const energyFields = useRef([]);

  const getMouseInfluence = (x, y) => {
    const dx = x - mouseRef.current.x;
    const dy = y - mouseRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxDistance = 200;
    return Math.max(0, 1 - distance / maxDistance);
  };

  const getEnergyFieldInfluence = (x, y, currentTime) => {
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
  };

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }, []);

  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mouseRef.current.x = e.clientX - rect.left;
    mouseRef.current.y = e.clientY - rect.top;
  }, []);

  const handleMouseDown = useCallback(() => {
    mouseRef.current.isDown = true;
  }, []);

  const handleMouseUp = useCallback(() => {
    mouseRef.current.isDown = false;
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
      const mouseInfl = getMouseInfluence(width / 2, yPos);
      const { intensity: fieldIntensity } = getEnergyFieldInfluence(width / 2, yPos, currentTime);
      const amplitude = 45 + 25 * Math.sin(timeRef.current * 0.25 + i * 0.15) + mouseInfl * 25;
      const frequency = 0.006 + 0.002 * Math.sin(timeRef.current * 0.12 + i * 0.08) + mouseInfl * 0.001;
      const speed = timeRef.current * (0.6 + 0.3 * Math.sin(i * 0.12)) + mouseInfl * timeRef.current * 0.3;
      const thickness = 0.6 + 0.4 * Math.sin(timeRef.current + i * 0.25) + mouseInfl * 0.8;
      const opacity =
        (0.12 + 0.08 * Math.abs(Math.sin(timeRef.current * 0.3 + i * 0.18)) + mouseInfl * 0.15) *
        lineOpacity;
      ctx.beginPath();
      ctx.lineWidth = thickness;
      ctx.strokeStyle = `rgba(${primaryColor}, ${opacity})`;
      for (let x = 0; x < width; x += 2) {
        const localMouseInfl = getMouseInfluence(x, yPos);
        const y =
          yPos +
          amplitude * Math.sin(x * frequency + speed) +
          localMouseInfl * Math.sin(timeRef.current * 2 + x * 0.008) * 15;
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
      const mouseInfl = getMouseInfluence(xPos, height / 2);
      const { intensity: fieldIntensity } = getEnergyFieldInfluence(xPos, height / 2, currentTime);
      const amplitude = 40 + 20 * Math.sin(timeRef.current * 0.18 + i * 0.14) + mouseInfl * 20;
      const frequency = 0.007 + 0.003 * Math.cos(timeRef.current * 0.14 + i * 0.09) + mouseInfl * 0.002;
      const speed = timeRef.current * (0.5 + 0.25 * Math.cos(i * 0.16)) + mouseInfl * timeRef.current * 0.25;
      const thickness = 0.5 + 0.3 * Math.sin(timeRef.current + i * 0.35) + mouseInfl * 0.7;
      const opacity =
        (0.1 + 0.06 * Math.abs(Math.sin(timeRef.current * 0.28 + i * 0.2)) + mouseInfl * 0.12) *
        lineOpacity;
      ctx.beginPath();
      ctx.lineWidth = thickness;
      ctx.strokeStyle = `rgba(${secondaryColor}, ${opacity})`;
      for (let y = 0; y < height; y += 2) {
        const localMouseInfl = getMouseInfluence(xPos, y);
        const x =
          xPos +
          amplitude * Math.sin(y * frequency + speed) +
          localMouseInfl * Math.sin(timeRef.current * 2 + y * 0.008) * 12;
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
        const mouseInfl = getMouseInfluence(baseX, baseY);
        const x =
          baseX +
          mouseInfl * Math.sin(timeRef.current * 1.5 + progress * 6) * 8;
        const y =
          baseY +
          mouseInfl * Math.cos(timeRef.current * 1.5 + progress * 6) * 8;
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
    getMouseInfluence,
    getEnergyFieldInfluence,
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    resizeCanvas();

    const handleResize = () => resizeCanvas();
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener(
      'touchmove',
      (e) => {
        const t = e.touches && e.touches[0];
        if (!t) return;
        handleMouseMove({ clientX: t.clientX, clientY: t.clientY });
      },
      { passive: true }
    );
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', () => {});
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      if (requestIdRef.current) {
        cancelAnimationFrame(requestIdRef.current);
        requestIdRef.current = null;
      }
      timeRef.current = 0;
      energyFields.current = [];
    };
  }, [animate, resizeCanvas, handleMouseMove, handleMouseDown, handleMouseUp]);

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
