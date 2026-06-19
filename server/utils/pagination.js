const parsePagination = (query = {}) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const buildPaginationMeta = (total, page, limit) => ({
  total,
  page,
  limit,
  pages: Math.ceil(total / limit) || 1,
  hasNext: page * limit < total,
  hasPrev: page > 1,
});

const paginateQuery = async (model, filter, query, sort = { createdAt: -1 }) => {
  const { page, limit, skip } = parsePagination(query);
  const [items, total] = await Promise.all([
    model.find(filter).sort(sort).skip(skip).limit(limit),
    model.countDocuments(filter),
  ]);
  return { items, meta: buildPaginationMeta(total, page, limit) };
};

module.exports = { parsePagination, buildPaginationMeta, paginateQuery };
