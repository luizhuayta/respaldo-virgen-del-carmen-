const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ message: 'Rol de usuario no encontrado' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: 'Acceso denegado: se requiere rol de ' + allowedRoles.join(' o ') 
            });
        }

        next();
    };
};

module.exports = checkRole;
