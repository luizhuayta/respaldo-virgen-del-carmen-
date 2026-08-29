const jwt = require('jsonwebtoken');

// Middleware para validar acceso a PDFs mediante JWT o código de seguimiento
const validateTrackingCode = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const trackingCode = req.query.code || req.body.code;

    // Si hay token JWT, validar
    if (authHeader) {
        try {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            return next();
        } catch (err) {
            // Token inválido, intentar con código de seguimiento
        }
    }

    // Si hay código de seguimiento, validar
    if (trackingCode) {
        // Aquí podrías validar el código contra la base de datos
        // Por ahora, permitimos el acceso si existe el código
        req.trackingCode = trackingCode;
        return next();
    }

    // Ni token ni código de seguimiento
    return res.status(401).json({ 
        message: 'Se requiere autenticación o código de seguimiento válido' 
    });
};

module.exports = validateTrackingCode;
