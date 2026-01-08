import React from 'react';
import { getGameData } from '@/lib/gameService';
import CalculatorPageClient from './CalculatorPageClient';

export const metadata = {
    title: 'Build Calculator | BlogHok',
    description: 'Simulate your hero builds with equipment and arcana to optimize your stats.',
};

export default async function CalculatorPage() {
    const { heroes, equipment, arcana } = await getGameData();

    return (
        <CalculatorPageClient
            heroes={heroes}
            equipment={equipment}
            arcana={arcana}
        />
    );
}
