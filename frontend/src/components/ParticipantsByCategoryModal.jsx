import React, { useMemo, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    ButtonGroup,
    Divider,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const ParticipantsByCategoryModal = ({ open, onClose, category, participants }) => {
    const [genderFilter, setGenderFilter] = useState('all');

    const categoryColors = {
        kids: '#FF6B6B',
        principiante: '#4ECDC4',
        intermedio: '#45B7D1',
        avanzado: '#FFA07A',
    };

    const categoryNames = {
        kids: 'Kids',
        principiante: 'Principiante',
        intermedio: 'Intermedio',
        avanzado: 'Avanzado',
    };

    // Filter participants by category and gender
    const filteredParticipants = useMemo(() => {
        if (!category || !participants) return [];

        let filtered = participants.filter(p => p.cup === category);

        if (genderFilter === 'male') {
            filtered = filtered.filter(p => p.gender === 'M');
        } else if (genderFilter === 'female') {
            filtered = filtered.filter(p => p.gender === 'F');
        }

        // Sort alphabetically by first name
        return filtered.sort((a, b) => 
            a.first_name.localeCompare(b.first_name)
        );
    }, [category, participants, genderFilter]);

    if (!category) return null;

    const color = categoryColors[category];
    const name = categoryNames[category];

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle
                sx={{
                    backgroundColor: color,
                    color: 'white',
                    fontWeight: 'bold',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <Typography variant="h5" component="span">
                    Competidores - {name}
                </Typography>
                <CloseIcon 
                    sx={{ cursor: 'pointer' }} 
                    onClick={onClose}
                />
            </DialogTitle>

            <DialogContent sx={{ mt: 2 }}>
                {/* Gender Filter Buttons */}
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    mb: 3 
                }}>
                    <ButtonGroup variant="contained">
                        <Button
                            onClick={() => setGenderFilter('all')}
                            sx={{
                                backgroundColor: genderFilter === 'all' ? color : '#gray',
                                '&:hover': {
                                    backgroundColor: genderFilter === 'all' ? color : '#darkgray',
                                    opacity: 0.9,
                                },
                            }}
                        >
                            Todos
                        </Button>
                        <Button
                            onClick={() => setGenderFilter('male')}
                            sx={{
                                backgroundColor: genderFilter === 'male' ? color : '#gray',
                                '&:hover': {
                                    backgroundColor: genderFilter === 'male' ? color : '#darkgray',
                                    opacity: 0.9,
                                },
                            }}
                        >
                            Varonil
                        </Button>
                        <Button
                            onClick={() => setGenderFilter('female')}
                            sx={{
                                backgroundColor: genderFilter === 'female' ? color : '#gray',
                                '&:hover': {
                                    backgroundColor: genderFilter === 'female' ? color : '#darkgray',
                                    opacity: 0.9,
                                },
                            }}
                        >
                            Femenil
                        </Button>
                    </ButtonGroup>
                </Box>

                {/* Summary */}
                <Box sx={{ 
                    mb: 2, 
                    p: 2, 
                    backgroundColor: '#f5f5f5', 
                    borderRadius: 2,
                    textAlign: 'center',
                }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: color }}>
                        {filteredParticipants.length}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Competidores {genderFilter === 'male' ? 'Varoniles' : 
                                     genderFilter === 'female' ? 'Femeniles' : 'Totales'}
                    </Typography>
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* Participants List */}
                {filteredParticipants.length > 0 ? (
                    <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                        {filteredParticipants.map((participant, index) => (
                            <ListItem 
                                key={participant.id}
                                sx={{
                                    borderBottom: index < filteredParticipants.length - 1 
                                        ? '1px solid #e0e0e0' 
                                        : 'none',
                                    '&:hover': {
                                        backgroundColor: '#f5f5f5',
                                    },
                                }}
                            >
                                <ListItemText
                                    primary={
                                        <Typography 
                                            variant="body1" 
                                            sx={{ 
                                                fontWeight: 'medium',
                                                color: color,
                                            }}
                                        >
                                            {participant.first_name} {participant.last_name}
                                        </Typography>
                                    }
                                    secondary={
                                        <Typography variant="body2" color="text.secondary">
                                            {participant.gender === 'M' ? '♂ Varonil' : '♀ Femenil'}
                                        </Typography>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                ) : (
                    <Typography 
                        color="text.secondary" 
                        sx={{ 
                            fontStyle: 'italic', 
                            textAlign: 'center',
                            py: 4,
                        }}
                    >
                        No hay competidores en esta categoría
                        {genderFilter !== 'all' && ' con este filtro'}
                    </Typography>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button 
                    onClick={onClose} 
                    variant="contained"
                    sx={{
                        backgroundColor: color,
                        '&:hover': {
                            backgroundColor: color,
                            opacity: 0.9,
                        },
                    }}
                >
                    Cerrar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ParticipantsByCategoryModal;
