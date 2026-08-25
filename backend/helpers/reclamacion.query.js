const db = require('../models');

async function generateTrackingCode(nombres, claim_type) {
    const prefix = claim_type === 'Queja' ? 'Q' : 'R';
    const initials = nombres.trim().substring(0, 3).toUpperCase().replace(/\s/g, '');
    const timestamp = Date.now();
    return `${prefix}-${initials}-${timestamp}`;
}

async function getReclamaciones(where = {}, order = [['createdAt', 'DESC']]) {
    return await db.Reclamacion.findAll({ where, order });
}

module.exports = { generateTrackingCode, getReclamaciones };
