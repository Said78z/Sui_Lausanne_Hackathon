import { useEffect, useState } from 'react';

import { ChevronLeft, ChevronRight, Download, Upload, X } from 'lucide-react';

interface ImageGalleryProps {
    images: string[];
    onClose: () => void;
}

export function ImageGallery({ images, onClose }: ImageGalleryProps) {
    const [selectedImage, setSelectedImage] = useState<string | null>(images[0]);
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [isClosing, setIsClosing] = useState<boolean>(false);

    useEffect(() => {
        // Sauvegarder la position de défilement actuelle
        const scrollY = window.scrollY;
        // Bloquer le défilement
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = '100%';

        return () => {
            // Restaurer le défilement
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            window.scrollTo(0, scrollY);
        };
    }, []);

    const closeFullscreen = () => {
        setIsClosing(true);
        setTimeout(() => {
            setSelectedImage(null);
            setIsClosing(false);
            onClose();
        }, 400);
    };

    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (selectedImage) {
            const link = document.createElement('a');
            link.href = selectedImage;
            link.download = `image-${currentIndex + 1}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation();
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const newImage = event.target?.result as string;
                images.push(newImage);
                setCurrentIndex(images.length - 1);
                setSelectedImage(newImage);
            };
            reader.readAsDataURL(file);
        }
    };

    const goToNext = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        const nextIndex = (currentIndex + 1) % images.length;
        setCurrentIndex(nextIndex);
        setSelectedImage(images[nextIndex]);
    };

    const goToPrev = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        const prevIndex = (currentIndex - 1 + images.length) % images.length;
        setCurrentIndex(prevIndex);
        setSelectedImage(images[prevIndex]);
    };

    const getPreviewIndices = () => {
        const previewCount = 3;
        const indices = [];
        for (let i = 1; i <= previewCount; i++) {
            indices.push((currentIndex + i) % images.length);
        }
        return indices;
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!selectedImage) return;

            if (e.key === 'ArrowRight') {
                goToNext();
            } else if (e.key === 'ArrowLeft') {
                goToPrev();
            } else if (e.key === 'Escape') {
                closeFullscreen();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedImage, currentIndex]);

    if (!selectedImage) return null;

    return (
        <div
            className={`duration-400 fixed inset-0 z-[60] flex flex-col items-center justify-center backdrop-blur-sm transition-all ease-in-out ${isClosing ? 'bg-black/0' : 'bg-black/80'}`}
            onClick={closeFullscreen}
        >
            <div
                className={`relative w-full max-w-5xl p-4 ${isClosing ? 'animate-slide-out opacity-0' : 'animate-slide-in opacity-100'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    className={`transition-all duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
                >
                    <button
                        className="absolute right-12 top-0 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white"
                        onClick={closeFullscreen}
                    >
                        <X size={20} />
                    </button>

                    <div className="absolute right-24 top-0 z-10 flex gap-4">
                        <button
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-white hover:bg-gray-100"
                            onClick={handleDownload}
                        >
                            <Download size={20} />
                        </button>
                        <label className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white hover:bg-gray-100">
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleUpload}
                            />
                            <Upload size={20} />
                        </label>
                    </div>

                    <button
                        className="group absolute left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white bg-opacity-70 transition-all hover:bg-opacity-100"
                        onClick={goToPrev}
                    >
                        <ChevronLeft className="transition-all group-hover:-translate-x-[1px]" />
                    </button>
                    <button
                        className="group absolute right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white bg-opacity-70 transition-all hover:bg-opacity-100"
                        onClick={goToNext}
                    >
                        <ChevronRight className="transition-all group-hover:translate-x-[1px]" />
                    </button>

                    <div className="flex h-[65vh] items-center justify-center">
                        <img
                            src={selectedImage}
                            alt="Image en plein écran"
                            className="mx-auto max-h-full max-w-full rounded-lg object-contain shadow-2xl"
                        />
                    </div>

                    <div className="mt-4 flex justify-center gap-2">
                        {getPreviewIndices().map((index) => (
                            <div
                                key={index}
                                className="h-16 w-24 cursor-pointer overflow-hidden rounded border-2 border-transparent transition-all hover:border-white hover:opacity-80"
                                onClick={() => {
                                    setCurrentIndex(index);
                                    setSelectedImage(images[index]);
                                }}
                            >
                                <img
                                    src={images[index]}
                                    alt={`Prévisualisation ${index + 1}`}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
