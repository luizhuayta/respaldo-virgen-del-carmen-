const buildContactsQuery = (where = {}, order = []) => ({
    where,
    order
});

module.exports = buildContactsQuery;