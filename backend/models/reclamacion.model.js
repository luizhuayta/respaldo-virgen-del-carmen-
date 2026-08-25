const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const Reclamacion = sequelize.define('Reclamacion', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    tracking_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    doc_type: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    dni: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    apellido_paterno: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    apellido_materno: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    nombres: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    telefono: {
        type: DataTypes.STRING(15),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    department: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    province: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    district: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    domicilio: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    is_minor: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    parent_doc_type: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    parent_dni: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    parent_apellido_paterno: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    parent_apellido_materno: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    parent_nombres: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    parent_telefono: {
        type: DataTypes.STRING(15),
        allowNull: true
    },
    parent_email: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    parent_department: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    parent_province: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    parent_district: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    parent_domicilio: {
        type: DataTypes.STRING(200),
        allowNull: true
    },
    service_type: {
        type: DataTypes.TEXT,
        allowNull: false,
        get() {
            const raw = this.getDataValue('service_type');
            try { return JSON.parse(raw); } catch { return raw; }
        },
        set(val) {
            this.setDataValue('service_type', JSON.stringify(val));
        }
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    service_description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    claim_description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    claim_request: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    claim_type: {
        type: DataTypes.ENUM('Reclamo', 'Queja'),
        allowNull: false
    },
    processing_status: {
        type: DataTypes.ENUM('Pendiente', 'En Proceso', 'Respondido', 'Cerrado'),
        defaultValue: 'Pendiente'
    },
    admin_response: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    responded_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'reclamaciones',
    timestamps: true
});

module.exports = Reclamacion;
