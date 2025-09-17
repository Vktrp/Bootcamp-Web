export const authMiddleware = (req, res, next) => {
  // TODO: Vérifier le JWT plus tard
  console.log("🛡 Auth middleware exécuté");
  next();
};
