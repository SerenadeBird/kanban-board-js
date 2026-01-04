// src/main.js
import { creerStore } from "./state/store.js";
import { creerTableauKanban } from "./components/Board.js";

document.addEventListener("DOMContentLoaded", () => {
  const store = creerStore({ cleStockage: "mini-kanban:etat" });

  // --- DOM ---
  const elStatut = document.getElementById("statut-appli");

  const btnReset = document.getElementById("btn-reinitialiser-tableau");

  const form = document.getElementById("formulaire-tache");
  const inputTitre = document.getElementById("tache-titre");
  const inputDescription = document.getElementById("tache-description");
  const inputPriorite = document.getElementById("tache-priorite");
  const btnAnnuler = document.getElementById("btn-annuler-tache");

  const elTitreForm = document.getElementById("titre-formulaire");

  const zones = {
    "a-faire": document.querySelector('[data-zone-depot="a-faire"]'),
    "en-cours": document.querySelector('[data-zone-depot="en-cours"]'),
    termine: document.querySelector('[data-zone-depot="termine"]'),
  };

  const compteurs = {
    "a-faire": document.querySelector('[data-compteur="a-faire"]'),
    "en-cours": document.querySelector('[data-compteur="en-cours"]'),
    termine: document.querySelector('[data-compteur="termine"]'),
  };

  // --- UI state ---
  let idTacheEnEdition = null;

  function annoncer(message) {
    if (!elStatut) return;
    elStatut.textContent = message;

    window.clearTimeout(annoncer._t);
    annoncer._t = window.setTimeout(() => {
      elStatut.textContent = "";
    }, 2500);
  }

  function nettoyerFormulaire() {
    form.reset();
    idTacheEnEdition = null;
    if (elTitreForm) elTitreForm.textContent = "Nouvelle tâche";
  }

  function passerEnModeEdition(tache) {
    idTacheEnEdition = tache.id;
    if (elTitreForm) elTitreForm.textContent = "Modifier la tâche";

    inputTitre.value = tache.titre ?? "";
    inputDescription.value = tache.description ?? "";
    inputPriorite.value = tache.priorite ?? "medium";

    inputTitre.focus();
    annoncer("Mode édition activé.");
  }

  function formVersObjet() {
    return {
      titre: inputTitre.value,
      description: inputDescription.value,
      priorite: inputPriorite.value,
    };
  }

  // --- Board (UI) ---
  const board = creerTableauKanban({
    store,
    zones,
    compteurs,
    annoncer,
    onEdit: passerEnModeEdition,
  });

  // --- Events ---
  btnReset?.addEventListener("click", () => {
    const ok = window.confirm(
      "Réinitialiser le tableau (supprime toutes les tâches) ?",
    );
    if (!ok) return;

    store.reinitialiser();
    nettoyerFormulaire();
    inputTitre?.focus();
    annoncer("Tableau réinitialisé.");
  });

  btnAnnuler?.addEventListener("click", () => {
    nettoyerFormulaire();
    inputTitre?.focus();
    annoncer("Édition annulée.");
  });

  form?.addEventListener("submit", (e) => {
    e.preventDefault();

    try {
      const data = formVersObjet();

      if (idTacheEnEdition) {
        store.modifierTache(idTacheEnEdition, data);
        annoncer("Tâche modifiée.");
      } else {
        store.ajouterTache(data);
        annoncer("Tâche créée.");
      }

      nettoyerFormulaire();
      inputTitre?.focus();
    } catch (err) {
      annoncer(err?.message ?? "Erreur : impossible d’enregistrer.");
      inputTitre?.focus();
    }
  });

  // --- Render initial + abonnement ---
  store.abonner(() => board.render());
  board.render();

  // Focus initial (UX)
  inputTitre?.focus();
});
