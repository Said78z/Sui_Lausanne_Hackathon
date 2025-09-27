class FormattedDate {
    /**
     * Convertit une date du format YYYY-MM-DD vers DD-MM-YYYY
     */
    public formatToFrenchDate(dateStr: string): string {
        if (!dateStr) return '';

        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
    }

    /**
     * Convertit une date en format relatif (il y a X temps)
     */
    public toRelativeTime(dateStr: string): string {
        const date = new Date(dateStr);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffSeconds = Math.floor(diffTime / 1000);
        const diffMinutes = Math.floor(diffSeconds / 60);
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);
        const diffMonths = Math.floor(diffDays / 30);
        const diffYears = Math.floor(diffMonths / 12);

        if (diffSeconds < 60) {
            return "à l'instant";
        } else if (diffMinutes < 60) {
            return `il y a ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
        } else if (diffHours < 24) {
            return `il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
        } else if (diffDays < 30) {
            return `il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
        } else if (diffMonths < 12) {
            return `il y a ${diffMonths} mois`;
        } else {
            return `il y a ${diffYears} an${diffYears > 1 ? 's' : ''}`;
        }
    }

    public formatDate(dateStr: string): string {
        const date = new Date(dateStr);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    }
}

const formattedDate = new FormattedDate();

export default formattedDate;
