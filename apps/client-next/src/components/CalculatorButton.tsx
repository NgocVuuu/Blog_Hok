import React from 'react';
import { Button, Tooltip, IconButton } from '@mui/material';
import { MdCalculate } from 'react-icons/md';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

interface CalculatorButtonProps {
    variant?: 'icon' | 'button';
    size?: 'small' | 'medium' | 'large';
}

const CalculatorButton: React.FC<CalculatorButtonProps> = ({ variant = 'button', size = 'small' }) => {
    const { t } = useTranslation();

    if (variant === 'icon') {
        return (
            <Tooltip title={t('calculator.title', 'Build Calculator')}>
                <IconButton component={Link} href="/calculator" color="primary" size={size}>
                    <MdCalculate />
                </IconButton>
            </Tooltip>
        );
    }

    return (
        <Button
            component={Link}
            href="/calculator"
            variant="contained"
            size={size}
            startIcon={<MdCalculate />}
            sx={{
                bgcolor: '#C9A063',
                color: '#000',
                '&:hover': { bgcolor: '#b08d55' },
                textTransform: 'none',
                fontWeight: 'bold',
                boxShadow: 'none'
            }}
        >
            {t('calculator.button', 'Calculator')}
        </Button>
    );
};

export default CalculatorButton;
