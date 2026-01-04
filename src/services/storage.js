// src/services/storage.js

function localStorageDisponible() {
  try {
    const cleTest = "__mini_kanban_test__";
    window.localStorage.setItem(cleTest, "ok");
    window.localStorage.removeItem(cleTest);
    return true;
  } catch {
    return false;
  }
}

export function sauvegarderEtat(cle, etat) {
  if (!localStorageDisponible()) return;

  try {
    const texte = JSON.stringify(etat);
    window.localStorage.setItem(cle, texte);
  } catch {
    // On évite de casser l’application si la sauvegarde échoue
    // (quota dépassé, JSON non sérialisable, etc.)
  }
}

export function chargerEtat(cle) {
  if (!localStorageDisponible()) return null;

  try {
    const texte = window.localStorage.getItem(cle);
    if (!texte) return null;

    const donnees = JSON.parse(texte);

    // Validation minimale (pour éviter d’exploser si le stockage est corrompu)
    if (!donnees || typeof donnees !== "object") return null;
    if (!("taches" in donnees) || !Array.isArray(donnees.taches)) return null;

    return donnees;
  } catch {
    // JSON invalide ou autre erreur => on ignore et on repart à zéro côté store
    return null;
  }
}

export function supprimerEtat(cle) {
  if (!localStorageDisponible()) return;

  try {
    window.localStorage.removeItem(cle);
  } catch {
    // ignore
  }
}
