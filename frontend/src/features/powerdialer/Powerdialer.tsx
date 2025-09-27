import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { BasisData, BuildingData, FinalData, LotPowerdialer, RentalData } from '@shared/dto/lotDto';

import { BasisData as BasisDataComponent } from './components/BasisData';
import { BuildingDetails } from './components/BuildingDetails';
import { DescriptionCard } from './components/DescriptionCard';
import { FinalQuestions } from './components/FinalQuestions';
import { Header } from './components/Header';
import { ImageGallery } from './components/ImageGallery';
import { LotGeneralInfo } from './components/LotGeneralInfo';
import { LotsCard } from './components/LotsCard';
import { NotesPanel } from './components/NotesPanel';
import { ProgressBar } from './components/ProgressBar';
import { RentalInfo } from './components/RentalInfo';

export default function Powerdialer() {
    const { t } = useTranslation();

    const createDefaultLot = (): LotPowerdialer => ({
        id: Date.now().toString(),
        name: t('powerdialer.lots.name', { number: 1 }),
        type: '',
        loyerHC: 0,
        provisions: 0,
        etage: '0',
        travaux: 0,
        locataire: '',
        debutBail: '',
        surface: 0,
        caf: 0,
        dpe: 'D',
        saisonnier: false,
        loue: false,
        meuble: 'Non',
        souhaitMeubler: false,
        notes: '',
    });

    const [selectedLot, setSelectedLot] = useState<string | null>(null);
    const [lots, setLots] = useState<LotPowerdialer[]>([createDefaultLot()]);
    const [isFixed, setIsFixed] = useState(false);
    const [topPosition, setTopPosition] = useState(24);
    const [divHeight, setDivHeight] = useState(0);
    const [initialOffset, setInitialOffset] = useState(0);
    const [showAllNotes, setShowAllNotes] = useState(false);
    const [notesTopPosition, setNotesTopPosition] = useState(112);
    const [selectedQualification, setSelectedQualification] = useState('prequalifie');
    const [showGallery, setShowGallery] = useState(false);

    // États pour les données
    const [basisData, setBasisData] = useState<BasisData>({
        typeBien: '',
        ville: '',
        prix: 0,
    });

    const [buildingData, setBuildingData] = useState<BuildingData>({
        doubleVitrage: '',
        copropriete: false,
        compteursElectriques: false,
        compteursEau: false,
        surface: 0,
        etatToiture: false,
        etatFacade: false,
        meuble: false,
    });

    const [rentalData, setRentalData] = useState<RentalData>({
        taxeFonciere: 0,
        nombreLots: 0,
        loyerAnnuelHC: 0,
        loyerMensuelHC: 0,
        vacancesLocatives: 0,
        typeLoyer: '',
        provisionsChargesAnnuelles: 0,
        chargesAnnuelles: 0,
        cafAnnuelle: 0,
        montantTotalTravaux: 0,
        fraisSyndic: 0,
    });

    const [finalData, setFinalData] = useState<FinalData>({
        raisonVente: '',
        prixNegocie: {
            montant: 0,
            date: '',
        },
        adresse: '',
        telephone: '',
        email: '',
        permisLouer: false,
        visiteDistance: false,
    });

    // Images de test
    const [images, _setImages] = useState([
        'https://pause-maison.ouest-france.fr/wp-content/uploads/2024/05/travaux-prioritaires-renovation-maison.jpg',
        'https://artisanat-france.fr/wp-content/uploads/2022/03/re%CC%81novation-maison.jpg',
        'https://www.cprim-renovation.fr/wp-content/uploads/2023/11/IMG_7332.jpg',
        'https://pause-maison.ouest-france.fr/wp-content/uploads/2024/05/travaux-prioritaires-renovation-maison.jpg',
        'https://artisanat-france.fr/wp-content/uploads/2022/03/re%CC%81novation-maison.jpg',
        'https://www.cprim-renovation.fr/wp-content/uploads/2023/11/IMG_7332.jpg',
        'https://pause-maison.ouest-france.fr/wp-content/uploads/2024/05/travaux-prioritaires-renovation-maison.jpg',
        'https://artisanat-france.fr/wp-content/uploads/2022/03/re%CC%81novation-maison.jpg',
        'https://www.cprim-renovation.fr/wp-content/uploads/2023/11/IMG_7332.jpg',
    ]);

    const lotsContainerRef = useRef<HTMLDivElement>(null);
    const placeholderRef = useRef<HTMLDivElement>(null);
    const cardsContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (lots.length > 0 && !selectedLot) {
            setSelectedLot(lots[0].id);
        }
    }, [lots, selectedLot]);

    useEffect(() => {
        if (lotsContainerRef.current && cardsContainerRef.current) {
            setDivHeight(lotsContainerRef.current.offsetHeight);
            setInitialOffset(lotsContainerRef.current.getBoundingClientRect().top + window.scrollY);
        }
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            if (lotsContainerRef.current && cardsContainerRef.current) {
                const cardsBottom =
                    cardsContainerRef.current.getBoundingClientRect().bottom + window.scrollY;
                const cardHeight = lotsContainerRef.current.offsetHeight;
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

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            const newTop = Math.max(32, 112 - scrollPosition);
            setNotesTopPosition(newTop);
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const handleAddLot = () => {
        const newLot: LotPowerdialer = {
            id: Date.now().toString(),
            name: `Lot ${lots.length + 1}`,
            type: '',
            loyerHC: 0,
            provisions: 0,
            etage: '0',
            travaux: 0,
            locataire: '',
            debutBail: '',
            surface: 0,
            caf: 0,
            dpe: 'D',
            saisonnier: false,
            loue: false,
            meuble: 'Non',
            souhaitMeubler: false,
            notes: '',
        };
        setLots([...lots, newLot]);
        setSelectedLot(newLot.id);
    };

    const handleDeleteLot = (lotId: string) => {
        if (lots.length <= 1) {
            return;
        }
        setLots(lots.filter((lot) => lot.id !== lotId));
        if (selectedLot === lotId) {
            const remainingLots = lots.filter((lot) => lot.id !== lotId);
            setSelectedLot(remainingLots[0].id);
        }
    };

    const handleBasisChange = (field: string, value: any) => {
        setBasisData((prev: BasisData) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleBuildingChange = (field: string, value: any) => {
        setBuildingData((prev: BuildingData) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleRentalChange = (field: string, value: any) => {
        setRentalData((prev: RentalData) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleFinalChange = (field: string, value: any) => {
        setFinalData((prev: FinalData) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleLotChange = (field: string, value: any) => {
        setLots((prevLots) =>
            prevLots.map((lot) =>
                lot.id === selectedLot
                    ? {
                          ...lot,
                          [field]: value,
                      }
                    : lot
            )
        );
    };

    const calculateProgress = () => {
        let totalFields = 0;
        let filledFields = 0;

        // Basis Data
        if (basisData.typeBien) filledFields++;
        if (basisData.ville) filledFields++;
        if (basisData.prix > 0) filledFields++;
        totalFields += 3;

        // Building Data
        if (buildingData.doubleVitrage) filledFields++;
        if (buildingData.surface > 0) filledFields++;
        totalFields += 2;

        // Rental Data
        if (rentalData.taxeFonciere > 0) filledFields++;
        if (rentalData.nombreLots > 0) filledFields++;
        if (rentalData.loyerAnnuelHC > 0) filledFields++;
        if (rentalData.loyerMensuelHC > 0) filledFields++;
        totalFields += 4;

        // Final Data
        if (finalData.raisonVente) filledFields++;
        if (finalData.prixNegocie.montant > 0) filledFields++;
        if (finalData.adresse) filledFields++;
        if (finalData.telephone) filledFields++;
        if (finalData.email) filledFields++;
        totalFields += 5;

        // Lots Data
        lots.forEach((lot) => {
            if (lot.type) filledFields++;
            if (lot.loyerHC > 0) filledFields++;
            if (lot.surface > 0) filledFields++;
            totalFields += 3;
        });

        return Math.round((filledFields / totalFields) * 100);
    };

    const progress = calculateProgress();

    return (
        <div className="flex gap-6">
            <div
                className={`min-h-screen overflow-y-auto px-4 transition-all duration-300 ${showAllNotes ? 'w-[70%]' : 'w-full'}`}
            >
                <Header showAllNotes={showAllNotes} />

                <div className="grid grid-cols-2 gap-4">
                    <BasisDataComponent
                        selectedQualification={selectedQualification}
                        onQualificationChange={setSelectedQualification}
                        data={basisData}
                        onChange={handleBasisChange}
                        showAllNotes={showAllNotes}
                    />
                    <div className="relative rounded-lg border border-gray-200 px-6 py-8">
                        <div className="absolute left-0 top-6 h-12 w-1 bg-tertiary"></div>
                        <div className="flex items-center justify-between px-6">
                            <h2 className="text-xl font-semibold">
                                {t('powerdialer.description.title')}
                            </h2>
                        </div>
                        <DescriptionCard
                            description={t('powerdialer.description.placeholder')}
                            notes={[
                                {
                                    author: 'John Doe',
                                    date: '01/01/2024',
                                    time: '14:30',
                                    to: 'building1',
                                    content: 'Note de test',
                                },
                            ]}
                            onShowAllNotes={() => setShowAllNotes(!showAllNotes)}
                            showAllNotes={showAllNotes}
                        />
                    </div>
                </div>

                <ProgressBar progress={progress} onGalleryClick={() => setShowGallery(true)} />

                <div className="flex gap-10 py-10" ref={cardsContainerRef}>
                    <div className="w-[calc(25%-12px)]">
                        <div
                            ref={placeholderRef}
                            style={{ height: isFixed ? `${divHeight}px` : '0px' }}
                        ></div>
                        <div
                            ref={lotsContainerRef}
                            className={`w-full rounded-[1rem] bg-white ${isFixed ? 'fixed' : ''}`}
                            style={{
                                top: isFixed ? `${topPosition}px` : 'auto',
                                width: isFixed
                                    ? `calc(${showAllNotes ? '25%' : '31%'} - 212px)`
                                    : '100%',
                            }}
                        >
                            <LotsCard
                                lots={lots}
                                selectedLotId={selectedLot}
                                onSelectLot={setSelectedLot}
                                onAddLot={handleAddLot}
                                onDeleteLot={handleDeleteLot}
                                showAllNotes={showAllNotes}
                            />
                        </div>
                    </div>

                    <div className="w-[calc(75%-12px)]">
                        {selectedLot && (
                            <div className="relative rounded-lg border border-gray-200 bg-white p-6">
                                <div className="absolute left-0 top-1/2 h-3/4 w-1 -translate-y-1/2 bg-tertiary"></div>
                                <LotGeneralInfo
                                    lotData={lots.find((lot) => lot.id === selectedLot)}
                                    onDelete={() => handleDeleteLot(selectedLot)}
                                    onChange={handleLotChange}
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-8 py-6">
                    <BuildingDetails buildingData={buildingData} onChange={handleBuildingChange} />
                    <RentalInfo rentalData={rentalData} onChange={handleRentalChange} />
                    <FinalQuestions finalData={finalData} onChange={handleFinalChange} />
                </div>
            </div>

            <NotesPanel
                showAllNotes={showAllNotes}
                notesTopPosition={notesTopPosition}
                onToggleNotes={() => setShowAllNotes(!showAllNotes)}
            />

            {showGallery && <ImageGallery images={images} onClose={() => setShowGallery(false)} />}
        </div>
    );
}
