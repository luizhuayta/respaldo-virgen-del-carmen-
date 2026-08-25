const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const AcademicPapers = sequelize.define('AcademicPapers', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('Programas', 'Admisión', 'Horarios', 'Costos', 'Estadísticas', 'Reglamentos', 'Inversiones', 'Procedimientos', 'Becas y Créditos'),
        allowNull: false
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    pdf_url: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    year: {
        type: DataTypes.INTEGER,
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
    tableName: 'academic_papers',
    timestamps: true
});

module.exports = AcademicPapers;