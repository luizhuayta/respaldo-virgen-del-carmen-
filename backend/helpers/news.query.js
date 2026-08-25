const buildNewsQuery = (where = {}, order = []) => ({
    where,
    order
});

module.exports = buildNewsQuery;