const getIconMap = () => {
    if (typeof window === 'undefined') {
        return new Map();
    }
    else {
        const win = window;
        win.Ionicons = win.Ionicons || {};
        win.Ionicons.map = win.Ionicons.map || new Map();
        return win.Ionicons.map;
    }
};
export const isIonIconsV4 = () => {
    const iconMap = getIconMap();
    return !!iconMap.get('md-arrow-dropdown');
};
//# sourceMappingURL=icons.js.map