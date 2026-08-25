const buildUsersQuery = (where = {}, order = []) => ({
    where,
    order
});

module.exports = buildUsersQuery;