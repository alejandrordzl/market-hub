// Helper function to parse user agent and detect device
export function parseUserAgent(userAgent?: string | null): string {
    if (!userAgent) return 'Desconocido';
    
    // Detect device type
    let device = '';
    if (/mobile/i.test(userAgent)) {
        device = '📱 ';
    } else if (/tablet/i.test(userAgent)) {
        device = '📱 ';
    } else {
        device = '💻 ';
    }
    
    // Detect OS
    let os = '';
    if (/Windows/i.test(userAgent)) {
        os = 'Windows';
    } else if (/Mac OS X/i.test(userAgent)) {
        os = 'macOS';
    } else if (/Linux/i.test(userAgent)) {
        os = 'Linux';
    } else if (/Android/i.test(userAgent)) {
        os = 'Android';
    } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
        os = 'iOS';
    }
    
    // Detect browser
    let browser = '';
    if (/Edg\//i.test(userAgent)) {
        browser = 'Edge';
    } else if (/Chrome/i.test(userAgent) && !/Chromium/i.test(userAgent)) {
        browser = 'Chrome';
    } else if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) {
        browser = 'Safari';
    } else if (/Firefox/i.test(userAgent)) {
        browser = 'Firefox';
    } else if (/Opera|OPR/i.test(userAgent)) {
        browser = 'Opera';
    }
    
    return `${device}${browser}${os ? ` • ${os}` : ''}`;
}