import { useMemo } from 'react';
import './Starfield.css';

export default function Starfield() {
  const stars = useMemo(() => {
    return Array.from({ length: 150 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: `${Math.random() * 2 + 1}px`,
      animationDuration: `${Math.random() * 3 + 2}s`,
      animationDelay: `${Math.random() * 2}s`
    }));
  }, []);

  const shootingStars = useMemo(() => {
    return Array.from({ length: 4 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 30}%`,
      left: `${Math.random() * 50 + 50}%`,
      animationDuration: `${Math.random() * 4 + 4}s`,
      animationDelay: `${Math.random() * 10}s`
    }));
  }, []);

  return (
    <div className="starfield-container">
      {stars.map(star => (
        <div 
          key={star.id}
          className="star"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            animationDuration: star.animationDuration,
            animationDelay: star.animationDelay
          }}
        />
      ))}
      {shootingStars.map(star => (
        <div 
          key={`shoot-${star.id}`}
          className="shooting-star"
          style={{
            left: star.left,
            top: star.top,
            animationDuration: star.animationDuration,
            animationDelay: star.animationDelay
          }}
        />
      ))}
    </div>
  );
}