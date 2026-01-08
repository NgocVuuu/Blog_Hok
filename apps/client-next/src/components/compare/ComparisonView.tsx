'use client';
import React from 'react';
import { Box, Typography, Divider, Chip, LinearProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface ComparisonViewProps {
    heroA: any | null;
    heroB: any | null;
}

const StatRow = ({ label, valA, valB, format = (v: any) => v }: { label: string, valA: any, valB: any, format?: (v: any) => string }) => {
    const numA = parseFloat(valA) || 0;
    const numB = parseFloat(valB) || 0;
    const isBetterA = numA > numB;

    return (
        <Box mb={2}>
            <Box display="flex" justifyContent="space-between" mb={0.5}>
                <Typography variant="body2" color={isBetterA ? 'success.main' : 'text.secondary'} fontWeight={isBetterA ? 700 : 400}>
                    {format(valA) || '-'}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase' }}>
                    {label}
                </Typography>
                <Typography variant="body2" color={!isBetterA && numB > numA ? 'success.main' : 'text.secondary'} fontWeight={!isBetterA && numB > numA ? 700 : 400}>
                    {format(valB) || '-'}
                </Typography>
            </Box>
            <Box display="flex" gap={1} alignItems="center">
                <LinearProgress
                    variant="determinate"
                    value={100}
                    sx={{ flex: 1, transform: 'scaleX(-1)', height: 6, borderRadius: 1, bgcolor: 'action.hover', '& .MuiLinearProgress-bar': { bgcolor: isBetterA ? 'success.light' : 'action.disabled' } }}
                />
                <LinearProgress
                    variant="determinate"
                    value={100}
                    sx={{ flex: 1, height: 6, borderRadius: 1, bgcolor: 'action.hover', '& .MuiLinearProgress-bar': { bgcolor: !isBetterA && numB > numA ? 'success.light' : 'action.disabled' } }}
                />
            </Box>
        </Box>
    );
};

export default function ComparisonView({ heroA, heroB }: ComparisonViewProps) {
    const { t } = useTranslation();

    if (!heroA && !heroB) {
        return (
            <Box textAlign="center" py={8} color="text.secondary">
                <Typography variant="h6">{String(t('compare.select_hint', 'Select two heroes to compare'))}</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ mt: 4 }}>
            {/* Basic Info Comparison */}
            <Box display="flex" justifyContent="center" alignItems="stretch" gap={2}>
                {/* Left Hero */}
                <Box flex={1} textAlign="center">
                    {heroA && (
                        <Box>
                            <Typography variant="h4" fontWeight={800} color="#C9A063">{heroA.metaTier}</Typography>
                            <Typography variant="caption" color="text.secondary">
                                {String(t('hero.metaTier', 'Meta Tier'))}
                            </Typography>
                        </Box>
                    )}
                </Box>

                {/* VS Badge */}
                <Box display="flex" alignItems="center" justifyContent="center" mx={1}>
                    <Box
                        sx={{
                            bgcolor: 'rgba(255,255,255,0.1)',
                            color: '#fff',
                            fontWeight: 900,
                            fontSize: '1.2rem',
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '2px solid rgba(255,255,255,0.2)'
                        }}
                    >
                        VS
                    </Box>
                </Box>

                {/* Right Hero */}
                <Box flex={1} textAlign="center">
                    {heroB && (
                        <Box>
                            <Typography variant="h4" fontWeight={800} color={heroB.metaTier === 'S+' ? '#C9A063' : 'text.primary'}>
                                {heroB.metaTier}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {String(t('hero.metaTier', 'Meta Tier'))}
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Box>

            <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.1)' }} />

            {/* Stats Comparison */}
            <Box sx={{ maxWidth: 600, mx: 'auto' }}>
                <StatRow
                    label={String(t('hero.winRate', 'Win Rate'))}
                    valA={heroA?.winRate}
                    valB={heroB?.winRate}
                    format={(v: any) => v ? `${v}%` : '-'}
                />
                <StatRow
                    label={String(t('hero.pickRate', 'Pick Rate'))}
                    valA={heroA?.pickRate}
                    valB={heroB?.pickRate}
                    format={(v: any) => v ? `${v}%` : '-'}
                />
                <StatRow
                    label={String(t('hero.banRate', 'Ban Rate'))}
                    valA={heroA?.banRate}
                    valB={heroB?.banRate}
                    format={(v: any) => v ? `${v}%` : '-'}
                />
            </Box>

            {/* Attributes Comparison */}
            <Box mt={4} display="flex" justifyContent="space-between" gap={2}>
                <Box flex={1} alignItems="flex-end" display="flex" flexDirection="column" gap={1}>
                    {heroA?.roles?.map((r: string) => <Chip key={r} label={String(t(`roles.${r}`, r))} size="small" />)}
                </Box>
                <Typography variant="caption" sx={{ alignSelf: 'center', opacity: 0.5 }}>{String(t('common.roles', 'ROLES'))}</Typography>
                <Box flex={1} alignItems="flex-start" display="flex" flexDirection="column" gap={1}>
                    {heroB?.roles?.map((r: string) => <Chip key={r} label={String(t(`roles.${r}`, r))} size="small" />)}
                </Box>
            </Box>

        </Box>
    );
}
