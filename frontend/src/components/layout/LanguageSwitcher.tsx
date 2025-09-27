import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { FR, GB } from 'country-flag-icons/react/3x2';
import { ChevronDown } from 'lucide-react';

export default function LanguageSwitcher() {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
        setIsOpen(false);
    };

    const languages = [
        { code: 'fr', name: 'Français', flag: FR },
        { code: 'en', name: 'English', flag: GB },
    ];

    const currentLanguage = languages.find((lang) => lang.code === i18n.language) || languages[0];
    const Flag = currentLanguage.flag;

    return (
        <div className="relative">
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="flex cursor-pointer items-center gap-1 border-r px-3 py-2"
            >
                <Flag className="h-4 w-full" />
                <ChevronDown
                    size={24}
                    className={`${isOpen ? 'rotate-180' : ''} transition-transform duration-200`}
                />
            </div>

            {isOpen && (
                <div className="absolute left-0 top-full z-[1000] mt-4 w-48 rounded border border-gray-200 bg-white shadow-lg">
                    {languages.map((lang) => {
                        const Flag = lang.flag;
                        return (
                            <div
                                key={lang.code}
                                onClick={() => changeLanguage(lang.code)}
                                className="flex w-full items-center space-x-2 px-4 py-2 text-left hover:bg-gray-100"
                            >
                                <Flag className="h-4 w-5" />
                                <span className="text-sm">{lang.name}</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
