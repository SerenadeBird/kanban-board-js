// src/state/store.js
import { chargerEtat, sauvegarderEtat } from "../services/storage.js";

const STATUTS = ["a-faire", "en-cours", "termine"];

function creerId() {
  // Suffisant pour un projet étudiant (pas besoin de lib externe)
  return `t_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function creerEtatParDefaut() {
  return {
    version: 1,
    taches: [],
  };
}

function normaliserStatut(statut) {
  return STATUTS.includes(statut) ? statut : "a-faire";
}

export function creerStore({ cleStockage = "mini-kanban:etat" } = {}) {
  let etat = chargerEtat(cleStockage) ?? creerEtatParDefaut();
  let ecouteurs = [];

  function notifier() {
    for (const fn of ecouteurs) fn(obtenirEtat());
  }

  function persister() {
    sauvegarderEtat(cleStockage, etat);
  }

  function obtenirEtat() {
    // copie superficielle pour éviter les modifs directes depuis l’extérieur
    return {
      ...etat,
      taches: [...etat.taches],
    };
  }

  function abonner(fn) {
    ecouteurs.push(fn);
    // renvoie une fonction pour se désabonner
    return () => {
      ecouteurs = ecouteurs.filter((x) => x !== fn);
    };
  }

  function reinitialiser() {
    etat = creerEtatParDefaut();
    persister();
    notifier();
  }

  function ajouterTache({ titre, description = "", priorite = "medium" }) {
    const titreNettoye = String(titre ?? "").trim();
    if (!titreNettoye) {
      throw new Error("Le titre est obligatoire.");
    }

    const nouvelleTache = {
      id: creerId(),
      titre: titreNettoye,
      description: String(description ?? "").trim(),
      priorite: priorite === "high" || priorite === "low" ? priorite : "medium",
      statut: "a-faire",
      creeLe: new Date().toISOString(),
      majLe: new Date().toISOString(),
    };

    etat = {
      ...etat,
      taches: [nouvelleTache, ...etat.taches],
    };

    persister();
    notifier();
    return nouvelleTache.id;
  }

  function modifierTache(id, patch = {}) {
    const idStr = String(id);
    let trouve = false;

    etat = {
      ...etat,
      taches: etat.taches.map((t) => {
        if (t.id !== idStr) return t;
        trouve = true;

        const titre =
          patch.titre !== undefined ? String(patch.titre).trim() : t.titre;

        if (!titre) {
          throw new Error("Le titre est obligatoire.");
        }

        return {
          ...t,
          titre,
          description:
            patch.description !== undefined
              ? String(patch.description).trim()
              : t.description,
          priorite:
            patch.priorite === "high" || patch.priorite === "low"
              ? patch.priorite
              : patch.priorite === "medium"
                ? "medium"
                : t.priorite,
          statut:
            patch.statut !== undefined
              ? normaliserStatut(patch.statut)
              : t.statut,
          majLe: new Date().toISOString(),
        };
      }),
    };

    if (!trouve) throw new Error("Tâche introuvable.");
    persister();
    notifier();
  }

  function supprimerTache(id) {
    const idStr = String(id);
    const avant = etat.taches.length;

    etat = {
      ...etat,
      taches: etat.taches.filter((t) => t.id !== idStr),
    };

    if (etat.taches.length === avant) {
      throw new Error("Tâche introuvable.");
    }

    persister();
    notifier();
  }

  function deplacerTache(id, nouveauStatut) {
    modifierTache(id, { statut: normaliserStatut(nouveauStatut) });
  }

  function tachesParStatut(statut) {
    const s = normaliserStatut(statut);
    return etat.taches.filter((t) => t.statut === s);
  }

  function compteParStatut() {
    return {
      "a-faire": tachesParStatut("a-faire").length,
      "en-cours": tachesParStatut("en-cours").length,
      termine: tachesParStatut("termine").length,
    };
  }

  // API publique du store
  return {
    STATUTS,

    obtenirEtat,
    abonner,

    reinitialiser,

    ajouterTache,
    modifierTache,
    supprimerTache,
    deplacerTache,

    tachesParStatut,
    compteParStatut,
  };
}
