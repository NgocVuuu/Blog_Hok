'use client';
import React, { useState, useMemo } from 'react';
import { Box, Container, Grid, Typography, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';

// Imported Components
import ItemSlot from '@/components/calculator/ItemSlot';
import ItemSelectorModal from '@/components/calculator/ItemSelectorModal';
import StatsPanel from '@/components/calculator/StatsPanel';
import ArcanaSelector from '@/components/calculator/ArcanaSelector';

export default function CalculatorPageClient({ heroes, equipment, arcana }: any) {
    const { t } = useTranslation();
    const [items, setItems] = useState<(any | null)[]>(Array(6).fill(null));
    // Arcana State
    const [arcanaBuild, setArcanaBuild] = useState<any[]>([]); // { arcanaId, count, arcana }

    const [modalOpen, setModalOpen] = useState(false);
    const [activeSlot, setActiveSlot] = useState<number | null>(null);

    // Open modal for specific slot
    const handleSlotClick = (index: number) => {
        setActiveSlot(index);
        setModalOpen(true);
    };

    // Select item
    const handleSelect = (item: any) => {
        if (activeSlot !== null) {
            const newItems = [...items];
            newItems[activeSlot] = item;
            setItems(newItems);
        }
        setModalOpen(false);
    };

    // Remove item
    const handleRemove = (index: number) => {
        const newItems = [...items];
        newItems[index] = null;
        setItems(newItems);
    };

    // Calculate Totals
    const totals = useMemo(() => {
        const acc: any = {
            physicalAttack: 0,
            magicPower: 0,
            physicalDefense: 0,
            magicDefense: 0,
            maxHealth: 0,
            maxMana: 0,
            cooldownReduction: 0,
            movementSpeed: 0,
            attackSpeed: 0,
            criticalRate: 0,
            criticalDamage: 0,
            physicalPenetration: 0,
            magicPenetration: 0,
            lifeSteal: 0,
            magicLifeSteal: 0,
        };

        const sumStats = (obj: any, count: number) => {
            if (!obj) return;
            // Support both 'attributes' (DB schema) and 'stats' (legacy scrape)
            // Also ensure we handle both number and string values
            const attr = obj.attributes || obj.stats || obj;

            // Helper to parse safely
            const val = (v: any) => {
                if (typeof v === 'number') return v;
                if (typeof v === 'string') return parseFloat(v) || 0;
                return 0;
            };

            const speed = val(attr.speed) || val(attr.movementSpeed);
            const defense = val(attr.defense) + val(attr.armor) + val(attr.physicalDefense);

            acc.physicalAttack += val(attr.attack) * count + val(attr.physicalAttack) * count;
            acc.magicPower += val(attr.magic) * count + val(attr.magicPower) * count;
            acc.physicalDefense += defense * count;
            acc.magicDefense += (val(attr.magicResist) + val(attr.magicDefense)) * count;

            acc.maxHealth += (val(attr.health) + val(attr.maxHealth)) * count;
            acc.maxMana += (val(attr.mana) + val(attr.maxMana)) * count;

            acc.cooldownReduction += val(attr.cooldownReduction) * count;
            acc.movementSpeed += speed * count;
            acc.attackSpeed += val(attr.attackSpeed) * count;

            acc.criticalRate += val(attr.criticalRate) * count;
            acc.criticalDamage += val(attr.criticalDamage) * count;

            acc.physicalPenetration += (val(attr.penetration) + val(attr.physicalPenetration)) * count;
            acc.magicPenetration += val(attr.magicPenetration) * count;

            acc.lifeSteal += val(attr.lifeSteal) * count;
            acc.magicLifeSteal += val(attr.magicLifeSteal) * count;
        };

        // 1. Sum Items
        items.forEach(it => {
            if (it) {
                sumStats(it, 1);
            }
        });

        // 2. Sum Arcana
        arcanaBuild.forEach(entry => {
            if (entry.arcana) {
                sumStats(entry.arcana, entry.count);
            }
        });

        // Rounding floats
        Object.keys(acc).forEach(k => {
            acc[k] = Math.round(acc[k] * 100) / 100;
        });

        return acc;
    }, [items, arcanaBuild]);

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
            <Box display="flex" flexDirection={{ xs: 'column', lg: 'row' }} gap={4}>
                {/* LEFT: Builder Area */}
                <Box flex={2}>
                    <Box mb={4}>
                        <Typography variant="h4" fontWeight={800} gutterBottom sx={{ background: 'linear-gradient(45deg, #C9A063 30%, #f0c485 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Build Calculator
                        </Typography>
                        <Typography color="text.secondary">Select items and arcana to simulate total bonus stats.</Typography>
                    </Box>

                    {/* Items Row */}
                    <Paper sx={{ p: 4, mb: 4, bgcolor: 'background.paper', borderRadius: 3 }}>
                        <Typography variant="h6" gutterBottom fontWeight={700}>Equipment</Typography>
                        <Box display="flex" gap={2} flexWrap="wrap">
                            {items.map((it, idx) => (
                                <ItemSlot
                                    key={idx}
                                    item={it}
                                    onClick={() => handleSlotClick(idx)}
                                    onRemove={() => handleRemove(idx)}
                                />
                            ))}
                        </Box>
                    </Paper>

                    {/* Arcana Section */}
                    <Typography variant="h6" gutterBottom mt={4}>Arcana</Typography>
                    <ArcanaSelector
                        arcanaList={arcana}
                        build={arcanaBuild}
                        onUpdate={setArcanaBuild}
                    />
                </Box>

                {/* RIGHT: Stats Panel */}
                <Box flex={1}>
                    <StatsPanel totals={totals} />
                </Box>
            </Box>

            <ItemSelectorModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSelect={handleSelect}
                equipment={equipment}
            />
        </Container>
    );
}
