import React, { useState, useEffect } from 'react';

/*
  Countdown Timer Component
  Displays a countdown to a specified target date.
  props:
  - targetDate: Date object or date string representing the target date/time
    in format 'YYYY-MM-DDTHH:MM:SS'
*/

const CountdownTimer = (props) => {
  const { targetDate } = props;
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = new Date(targetDate) - new Date();
    
    if (difference <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        expired: true
      };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      expired: false
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (timeLeft.expired) {
    return (
      <div className="countdown expired">
        <h2>¡El evento ya comenzó!</h2>
      </div>
    );
  }

  return (
    <div className="countdown">
      <h2>Faltan:</h2>
      <div className="countdown-grid">
        <div className="countdown-item">
          <span className="countdown-number">{timeLeft.days}</span>
          <span className="countdown-label">Días</span>
        </div>
        <div className="countdown-item">
          <span className="countdown-number">{timeLeft.hours.toString().padStart(2, '0')}</span>
          <span className="countdown-label">Horas</span>
        </div>
        <div className="countdown-item">
          <span className="countdown-number">{timeLeft.minutes.toString().padStart(2, '0')}</span>
          <span className="countdown-label">Minutos</span>
        </div>
        <div className="countdown-item">
          <span className="countdown-number">{timeLeft.seconds.toString().padStart(2, '0')}</span>
          <span className="countdown-label">Segundos</span>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;