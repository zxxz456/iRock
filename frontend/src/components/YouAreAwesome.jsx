import React, { useEffect, useState } from 'react';
import { Box, Button } from '@mui/material';
import smile1 from '../assets/smile1.png';
import smile2 from '../assets/smile2.png';
import smile3 from '../assets/smile3.png';
import smile4 from '../assets/smile4.png';

const YouAreAnIdiotAnimation = (props) => {
  const { onGoBack, audioRef } = props;
  const [faces, setFaces] = useState([]);
  const [backgroundColor, setBackgroundColor] = useState('yellow');
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [buttonColor, setButtonColor] = useState('#1976d2');

  const faceImages = [smile1, smile2, smile3, smile4];
  const colors = ['#ff0000', '#00ff00', '#0000ff', 
    '#ffff00', '#ff00ff', '#00ffff', '#ffffff', '#000000'];

  const startAudio = () => {
    if (audioRef.current && !audioPlaying) {
      audioRef.current.volume = 0.7;
      audioRef.current.loop = true;
      audioRef.current.play()
        .then(() => setAudioPlaying(true))
        .catch(error => console.log('Error reproduciendo audio:', error));
    }
  };

  useEffect(() => {
    const newFaces = Array.from({ length: 25 }, (_, index) => ({
      id: index,
      top: Math.random() * 100,
      left: Math.random() * 100,
      animationDuration: 3 + Math.random() * 7, 
      animationDelay: Math.random() * 5,
      imageUrl: faceImages[Math.floor(Math.random() * faceImages.length)],
      size: 30 + Math.random() * 70, 
      keyframes: generateRandomKeyframes()
    }));
    setFaces(newFaces);

    let colorIndex = 0;
    let buttonColorIndex = 0;
    
    const strobeInterval = setInterval(() => {
      setBackgroundColor(colors[colorIndex]);
      colorIndex = (colorIndex + 1) % colors.length;
    }, 100);

    const buttonInterval = setInterval(() => {
      setButtonColor(colors[buttonColorIndex]);
      buttonColorIndex = (buttonColorIndex + 1) % colors.length;
    }, 300);

    startAudio();

    return () => {
      clearInterval(strobeInterval);
      clearInterval(buttonInterval);
    };
  }, []);

  // gen random keyframes for face movement
  const generateRandomKeyframes = () => {
    const keyframes = [];
    const numPoints = 5 + Math.floor(Math.random() * 6); 
    
    for (let i = 0; i <= numPoints; i++) {
      const progress = (i / numPoints) * 100;
      keyframes.push({
        progress,
        translateX: (Math.random() - 0.5) * 600, 
        translateY: (Math.random() - 0.5) * 600, 
        rotate: Math.random() * 720 - 360, 
        scale: 0.5 + Math.random() * 1.5
      });
    }
    
    return keyframes;
  };

  // Función para generar el CSS de animación para cada cara
  const generateAnimationStyle = (face) => {
    const keyframeRules = face.keyframes.map(kf => `
      ${kf.progress}% {
        transform: translate(${kf.translateX}px, 
        ${kf.translateY}px) rotate(${kf.rotate}deg) scale(${kf.scale});
      }
    `).join('');

    return `
      @keyframes faceMove-${face.id} {
        ${keyframeRules}
      }
    `;
  };

  const handleGoBackClick = () => {
    onGoBack();
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: backgroundColor,
        zIndex: 9999,
        overflow: 'hidden',
        fontFamily: 'Arial, sans-serif',
        transition: 'background-color 0.1s ease'
      }}
      onClick={startAudio}
    >
      {/* Estilos CSS dinámicos para las animaciones */}
      <style>
        {`
          @keyframes textColorChange {
            0% { color: #ff0000; transform: translate(-50%, -50%) scale(1); }
            25% { color: #00ff00; }
            50% { color: #0000ff; transform: translate(-50%, -50%) scale(1.1); }
            75% { color: #ffff00; }
            100% { color: #ff00ff; transform: translate(-50%, -50%) scale(1); }
          }
          ${faces.map(face => generateAnimationStyle(face)).join('')}
        `}
      </style>

      {!audioPlaying && (
        <Button
          variant="contained"
          color="secondary"
          sx={{
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10001
          }}
          onClick={startAudio}
        >
          🔈 Activar Sonido
        </Button>
      )}

      <Box
        sx={{
          position: 'absolute',
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '4.5rem',
          fontWeight: 'bold',
          color: 'white',
          textAlign: 'center',
          zIndex: 10000,
          textShadow: '3px 3px 6px black',
          animation: 'textColorChange 0.5s infinite alternate'
        }}
      >
        YOU ARE AWESOME!
      </Box>
      
      
      <Box
        sx={{
          marginTop: '50px',
          position: 'absolute',
          top: '60%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '0.8rem',
          fontWeight: 'bold',
          color: 'white',
          textAlign: 'center',
          zIndex: 10000,
          textShadow: '3px 3px 6px black',
          animation: 'textColorChange 0.5s infinite alternate'
        }}
      >
        (give me all ur money :P)
      </Box>

      {faces.map((face) => (
        <Box
          key={face.id}
          sx={{
            position: 'absolute',
            top: `${face.top}%`,
            left: `${face.left}%`,
            width: `${face.size}px`,
            height: `${face.size}px`,
            animation: `faceMove-${face.id} ${face.animationDuration}s 
            ease-in-out ${face.animationDelay}s infinite alternate`,
            userSelect: 'none',
            pointerEvents: 'none',
            filter: 'drop-shadow(2px 2px 2px rgba(0,0,0,0.5))'
          }}
        >
          <img 
            src={face.imageUrl} 
            alt="smiley face" 
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain'
            }}
          />
        </Box>
      ))}

      <Button 
        variant="contained"
        onClick={handleGoBackClick}
        sx={{ 
          position: 'fixed', 
          bottom: 20, 
          right: 20, 
          zIndex: 1000,
          backgroundColor: buttonColor,
          color: 'white',
          fontWeight: 'bold',
          fontSize: '10px',
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: buttonColor,
            filter: 'brightness(0.8)',
            transform: 'scale(1.1)'
          }
        }}
      >
        Told ya! If you click me again you'll go back! :)))
      </Button>
    </Box>
  );
};

export default YouAreAnIdiotAnimation;