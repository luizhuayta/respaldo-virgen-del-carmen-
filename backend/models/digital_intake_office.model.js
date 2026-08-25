const { DataTypes, ENUM } = require('sequelize');
const sequelize = require('../config/db.config');

const Digital_Intake_Office = sequelize.define('Digital_Intake_Office', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    full_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    DNI_RUC: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    phone_number: {
        type: DataTypes.STRING(9),
        allowNull: false
    },
    c_condition: {
        type: DataTypes.ENUM('Estudiante','Docente','Administrativo','Egresado','Externo'),
        allowNull: false
    },
    verification_code: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    document_type: {
        type: DataTypes.ENUM('Solicitud','Recurso de reconsideración','Apelación','Constancia','Certificado','Otro'),
        allowNull: false
    },
    v_subject: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    v_message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    number_of_pages: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    attached_file_url: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    document_url: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    processing_status: {
        type: DataTypes.ENUM('Pendiente','Rechazado','Aceptado','Finalizado'),
        allowNull: false
    },
    tracking_code: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'digital_intake_office',
    timestamps: true
});

module.exports = Digital_Intake_Office;