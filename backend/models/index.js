const sequelize = require('../config/db.config');
const {Sequelize} = require('sequelize');

const News = require('./news.models');
const Contacts = require('./contacts.model');
const Investigations = require('./investigations.models');
const Users = require('./users.model');
const PressReleases = require('./press_releases.model');
const AcademicPersonal = require('./academic_personal.model');
const Career = require('./career.model');
const AcademicPapers = require('./academic_papers.model');
const DigitalIntakeOffice = require('./digital_intake_office.model');
const Reclamacion = require('./reclamacion.model');

module.exports = {
    sequelize,
    Sequelize,
    News,
    Contacts,
    Investigations,
    Users,
    PressReleases,
    AcademicPersonal,
    Career,
    AcademicPapers,
    DigitalIntakeOffice,
    Reclamacion
}