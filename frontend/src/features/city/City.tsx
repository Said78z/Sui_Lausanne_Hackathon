import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import citiesData from '@/mocks/citiesMock.json';

import { AveragePriceChart } from './components/AveragePriceChart';
import { CityMap } from './components/CityMap';
import { DemographyCard } from './components/DemographyCard';
import { EconomyCard } from './components/EconomyCard';
import { EquipmentCard } from './components/EquipmentCard';
import { HousingCard } from './components/HousingCard';
import { PriceDistributionChart } from './components/PriceDistributionChart';
import { SearchDistributionChart } from './components/SearchDistributionChart';
import { SearchDurationChart } from './components/SearchDurationChart';
import { SecurityCard } from './components/SecurityCard';
import { TaxCard } from './components/TaxCard';
import { TransportCard } from './components/TransportCard';

export default function City() {
    const { t } = useTranslation();
    const { id } = useParams();
    const city = citiesData.cities.find((c) => c.id === Number(id));
    const [isFixed, setIsFixed] = useState(false);
    const [topPosition, setTopPosition] = useState(24);
    const [divHeight, setDivHeight] = useState(0);
    const [initialOffset, setInitialOffset] = useState(0);

    const mapContainerRef = useRef<HTMLDivElement>(null);
    const placeholderRef = useRef<HTMLDivElement>(null);
    const cardsContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (mapContainerRef.current && cardsContainerRef.current) {
            setDivHeight(mapContainerRef.current.offsetHeight);
            setInitialOffset(mapContainerRef.current.getBoundingClientRect().top + window.scrollY);
        }
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            if (mapContainerRef.current && cardsContainerRef.current) {
                const cardsBottom =
                    cardsContainerRef.current.getBoundingClientRect().bottom + window.scrollY;
                const cardHeight = mapContainerRef.current.offsetHeight;
                const scrollPosition = window.scrollY;
                const stopPosition = cardsBottom - cardHeight - 24;

                if (scrollPosition >= initialOffset - 24) {
                    setIsFixed(true);
                    if (scrollPosition > stopPosition) {
                        const diff = scrollPosition - stopPosition;
                        setTopPosition(24 - diff);
                    } else {
                        setTopPosition(24);
                    }
                } else {
                    setIsFixed(false);
                    setTopPosition(24);
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [initialOffset]);

    if (!city) {
        return <div className="p-8 text-center text-lg">{t('city.notFound')}</div>;
    }

    return (
        <div className="min-h-screen w-full overflow-y-auto p-6 pb-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">{city.name}</h1>
                <p className="text-gray-600">
                    {city.department}, {city.region}
                </p>
            </div>

            <div className="flex gap-6">
                {/* Colonne de gauche avec les cartes */}
                <div className="w-[calc(50%-12px)]" ref={cardsContainerRef}>
                    <div className="flex flex-col gap-6">
                        <DemographyCard city={city} />
                        <HousingCard city={city} />
                        <TaxCard city={city} />
                        <EquipmentCard city={city} />
                        <EconomyCard city={city} />
                        <TransportCard city={city} />
                        <SecurityCard city={city} />
                    </div>
                </div>

                {/* Colonne de droite avec la carte */}
                <div className="w-[calc(50%-12px)]">
                    <div
                        ref={placeholderRef}
                        style={{ height: isFixed ? `${divHeight}px` : '0px' }}
                    ></div>
                    <div
                        ref={mapContainerRef}
                        className={`w-full rounded-[1rem] border border-gray-200 bg-white ${isFixed ? 'fixed' : ''}`}
                        style={{
                            top: isFixed ? `${topPosition}px` : 'auto',
                            width: isFixed ? 'calc(50% - 212px)' : '100%',
                        }}
                    >
                        <CityMap city={city} />
                    </div>
                </div>
            </div>

            {/* GRAPHIQUES : disposition en 2 lignes de 2 colonnes */}
            <div className="mt-10 grid grid-cols-3 gap-8">
                {/* Première ligne */}
                <div className="col-span-1 min-w-0">
                    <SearchDurationChart />
                </div>
                <div className="col-span-2 min-w-0">
                    <AveragePriceChart />
                </div>
                <div className="col-span-3 min-w-0">
                    <SearchDistributionChart />
                </div>
                <div className="col-span-3 min-w-0">
                    <PriceDistributionChart />
                </div>
            </div>
        </div>
    );
}
