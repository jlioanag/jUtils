module.exports = {
  "pre-commit": "npx prettier --write . && npx tsc --noEmit",
  "commit-msg": "npx commitlint --edit",
};
