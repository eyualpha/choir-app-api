const toSlug = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const uniqueSlug = async (model, baseValue, field = "slug") => {
  const base = toSlug(baseValue) || "item";
  let candidate = base;
  let counter = 1;
  while (await model.exists({ [field]: candidate })) {
    counter += 1;
    candidate = `${base}-${counter}`;
  }
  return candidate;
};

const isValidSlug = (value) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);

module.exports = { toSlug, uniqueSlug, isValidSlug };
