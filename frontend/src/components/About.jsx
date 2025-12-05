import { Box, Typography, Button, Paper, Divider } from '@mui/material';
import { React, useState, useEffect, useRef } from 'react';
import YouAreAnIdiot from './YouAreAwesome';
import DangerousIcon from '@mui/icons-material/Dangerous';
import zxxz6Image from '../assets/zxxz6.png';
import GitHubIcon from '@mui/icons-material/GitHub';
import EmailIcon from '@mui/icons-material/Email';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import traktorAudio from '../assets/traktor.mp3';


/*
    About page component with interactive elements (easter eggs :P).
*/

const RandomColorChar = ({ char }) => {
  const [color, setColor] = useState('#5f5f5fff');

  useEffect(() => {
    const interval = setInterval(() => {
      const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);
      setColor(randomColor);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <span style={{ color, display: 'inline-block' }}>
      {char}
    </span>
  );
};

const AboutPage = () => {
    const specialChars = '௸߶࿕௳৺୰௴';
    const [clickCount, setClickCount] = useState(0);
    const [showWarning, setShowWarning] = useState(false);
    const [showYouAreAnIdiot, setShowYouAreAnIdiot] = useState(false);
    const audioRef = useRef(null);

    // Preload audio
    useEffect(() => {
        audioRef.current = new Audio(traktorAudio);
        audioRef.current.preload = 'auto';
        
        audioRef.current.addEventListener('error', (e) => {
            console.error('Error cargando audio:', e);
        });
    }, []);

    const handleButtonClick = () => {
        const newCount = clickCount + 1;
        setClickCount(newCount);

        if (newCount === 1) {
            setShowWarning(true);
            setTimeout(() => {
                setClickCount(0);
                setShowWarning(false);
            }, 60000);
        } else if (newCount === 2) {
            if (audioRef.current) {
                audioRef.current.play().catch(error => {
                    console.log('Error reproduciendo audio:', error);
                });
            }
            setShowYouAreAnIdiot(true);
            setShowWarning(false);
        }
    };

    const handleGoBack = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        setShowYouAreAnIdiot(false);
        setClickCount(0);
        setShowWarning(false);
    };

    return (
       <Box sx={{ p: 3, 
                maxWidth: 1200, 
                margin: '0 auto', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', }}
        >

            {showYouAreAnIdiot ? (
                <YouAreAnIdiot onGoBack={handleGoBack} audioRef={audioRef} />
            ) : (
                <>
                    <Typography variant="h4" 
                        gutterBottom 
                        sx={{ fontWeight: 'bold', 
                            textAlign: 'center', 
                            marginBottom: 0, 
                            color:'#5f5f5fff' }}
                    >
                      iRock App beta
                    </Typography>

                    <Typography 
                        variant="caption" 
                        sx={{ fontSize: '0.7rem', 
                            textAlign: 'center', 
                            marginBottom: 10, 
                            color:'#5f5f5fff'}}
                    >
                        from climbers to climbers n.n
                    </Typography>

                    <img 
                        src={zxxz6Image} 
                        alt="zxxz6" 
                        style={{ display: 'block', 
                                 margin: '20px auto', 
                                 maxWidth: '100%', 
                                 height: 'auto' }} 
                    />
                    
                    <Typography 
                        variant="h4" 
                        gutterBottom 
                        sx={{ fontWeight: 'bold', 
                              textAlign: 'center', 
                              marginBottom: 3, 
                              color:'#5f5f5fff' }}
                    >
                      Made with {' '}
                      {specialChars.split('').map((char, index) => (
                        <RandomColorChar key={index} char={char} />
                      ))}
                      {' '} by zxxz6
                    </Typography>

                    {/* personal links*/}
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Typography 
                            variant="h6" 
                            gutterBottom 
                            sx={{ color: '#5f5f5fff', mb: 3 }}>
                            If u like the app plz contact 
                            me and leave a comment!
                        </Typography>
                        
                        <Box 
                            sx={{ display: 'flex', 
                                  justifyContent: 'center', 
                                  gap: 2, 
                                  flexWrap: 'wrap' }}
                        >
                            {/*<Button
                                variant="outlined"
                                startIcon={<GitHubIcon />}
                                href="https://github.com/zxxz456"
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{
                                    borderRadius: 2,
                                    color: '#5f5f5fff',
                                    borderColor: '#5f5f5fff',
                                    '&:hover': {
                                        borderColor: '#8e3f65',
                                        backgroundColor: 'rgba(142, 63, 101, 0.1)'
                                    }
                                }}
                            >
                                GitHub
                            </Button>*/}

                            <Button
                                variant="outlined"
                                startIcon={<EmailIcon />}
                                href="mailto:zxxz456@gmail.com"
                                sx={{
                                    borderRadius: 2,
                                    color: '#5f5f5fff',
                                    borderColor: '#5f5f5fff',
                                    '&:hover': {
                                        borderColor: '#72a5ae',
                                        backgroundColor: 'rgba(114, 165, 174, 0.1)'
                                    }
                                }}
                            >
                                Email
                            </Button>

                            <Button
                                variant="outlined"
                                startIcon={<WhatsAppIcon />}
                                href="https://wa.me/4421700689?text=Hey%20:P"
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{
                                    borderRadius: 2,
                                    color: '#5f5f5fff',
                                    borderColor: '#5f5f5fff',
                                    '&:hover': {
                                        borderColor: '#25D366',
                                        backgroundColor: 'rgba(37, 211, 102, 0.1)'
                                    }
                                }}
                            >
                                WhatsApp
                            </Button>

                        </Box>
                    </Box>

                    {showWarning && (
                        <Typography 
                            variant="h6" 
                            sx={{ textAlign: 'center', 
                                  color: 'red', 
                                  fontWeight: 'bold', 
                                  mb: 2 }}>
                            ⚠️ DO NOT PRESS THE BUTTON AGAIN ⚠️
                        </Typography>
                    )}

                    <Button 
                        variant="contained" 
                        color="error" 
                        onClick={handleButtonClick}
                        sx={{
                            borderRadius: 15, 
                            padding: 1.5, 
                            fontWeight: 'bold', 
                            fontSize: '16px', 
                            textTransform: 'none', 
                            boxShadow: 'none', 
                            '&:hover': { 
                                boxShadow: 'none',
                                backgroundColor: '#d32f2f'
                            }
                        }}
                    >
                        <DangerousIcon sx={{ mr: 1 }} />
                        DON'T PRESS THIS BUTTON
                        <DangerousIcon sx={{ ml: 1 }} />
                    </Button>
                </>
            )}

       </Box>
    )
}

export default AboutPage;