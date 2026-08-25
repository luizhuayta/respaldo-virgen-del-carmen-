const QRCode = require('qrcode');
const getAppConfig = require('../config/app.config');

/**
 * Generate a QR code as Base64 for document verification
 * @param {string} uuid - The document UUID
 * @returns {Promise<string>} - Base64 encoded QR code image
 */
const generateQRCode = async (uuid) => {
    try {
        const config = getAppConfig();
        const frontendUrl = config.frontendUrl;
        const verificationUrl = `${frontendUrl}/validar-documento/${uuid}`;
        
        // Debug console log to verify the target URL
        console.log('=== QR CODE GENERATION DEBUG ===');
        console.log('FRONTEND_URL from env:', process.env.FRONTEND_URL);
        console.log('Frontend URL from config:', frontendUrl);
        console.log('QR Target URL:', verificationUrl);
        console.log('===============================');
        
        const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
            width: 200,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            },
            errorCorrectionLevel: 'H'
        });
        
        // Remove the data URL prefix to get just the Base64 data
        const base64Data = qrCodeDataUrl.replace(/^data:image\/png;base64,/, '');
        
        return base64Data;
    } catch (error) {
        console.error('Error generating QR code:', error);
        throw new Error('Failed to generate QR code');
    }
};

module.exports = generateQRCode;