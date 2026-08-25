const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const AcademicPersonal = sequelize.define('AcademicPersonal', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('Autoridad', 'Docente', 'Administrativo', 'Complementario'),
        allowNull: false
    },
    names: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    last_names: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    position: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    area: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    grade: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    img_url: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    pdf_url: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    institucional_email: {
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
    tableName: 'academic_personal',
    timestamps: true
});

module.exports = AcademicPersonal;