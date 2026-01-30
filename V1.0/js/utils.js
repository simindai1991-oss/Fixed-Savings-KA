export const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num || 0);
};

export const formatShortNumber = (num) => {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    return (num / 1000).toFixed(1) + 'K';
};

export const formatDateTime = (date) => {
    return date.toLocaleString('en-GB', { 
        day: 'numeric', month: 'short', year: 'numeric', 
        hour: '2-digit', minute: '2-digit', second: '2-digit' 
    });
};

export const calculateMaturityDate = (days, startDate) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};