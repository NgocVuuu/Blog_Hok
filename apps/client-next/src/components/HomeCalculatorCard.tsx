import React from 'react';
import { Card, CardActionArea, CardContent, Typography, Box } from '@mui/material';
import { MdCalculate } from 'react-icons/md';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

const HomeCalculatorCard = () => {
    const { t } = useTranslation();

    return (
        <Card
            sx={{
                height: '100%',
                minHeight: { xs: 120, md: 220 },
                display: 'flex',
                borderRadius: 2,
                overflow: 'hidden',
                border: '1px solid rgba(0,0,0,0.06)',
                boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
                bgcolor: '#C9A063', // BlogHok gold accent
                color: '#fff',
                position: 'relative'
            }}
        >
            <CardActionArea
                component={Link}
                href="/calculator"
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 2
                }}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: -20,
                        right: -20,
                        opacity: 0.2,
                        transform: 'rotate(-15deg)'
                    }}
                >
                    <MdCalculate size={140} />
                </Box>

                <Box sx={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                    <MdCalculate size={48} />
                    <Typography variant="h5" fontWeight={800} align="center">
                        {t('calculator.button', 'Build Calculator')}
                    </Typography>
                    <Typography variant="body2" align="center" sx={{ opacity: 0.9, maxWidth: '80%' }}>
                        {t('calculator.desc', 'Optimize your hero stats with Equipment & Arcana')}
                    </Typography>
                </Box>
            </CardActionArea>
        </Card>
    );
};

export default HomeCalculatorCard;
