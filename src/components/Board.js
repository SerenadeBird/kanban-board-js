// src/components/Board.js
import { creerColonne } from "./Column.js";

export function creerTableauKanban({
  store,
  zones,
  compteurs,
  annoncer,
  onEdit,
}) {
  // Sécurité : on vérifie que les éléments DOM existent
  if (!zones?.["a-faire"] || !zones?.["en-cours"] || !zones?.termine) {
    throw new Error("Zones de dépôt manquantes (data-zone-depot).");
  }
  if (
    !compteurs?.["a-faire"] ||
    !compteurs?.["en-cours"] ||
    !compteurs?.termine
  ) {
    throw new Error("Compteurs manquants (data-compteur).");
  }

  const colAFaire = creerColonne({
    statut: "a-faire",
    zoneDepot: zones["a-faire"],
    compteur: compteurs["a-faire"],
    store,
    onEdit,
    annoncer,
  });

  const colEnCours = creerColonne({
    statut: "en-cours",
    zoneDepot: zones["en-cours"],
    compteur: compteurs["en-cours"],
    store,
    onEdit,
    annoncer,
  });

  const colTermine = creerColonne({
    statut: "termine",
    zoneDepot: zones.termine,
    compteur: compteurs.termine,
    store,
    onEdit,
    annoncer,
  });

  function render() {
    const etat = store.obtenirEtat();
    const taches = etat.taches ?? [];

    colAFaire.render(taches.filter((t) => t.statut === "a-faire"));
    colEnCours.render(taches.filter((t) => t.statut === "en-cours"));
    colTermine.render(taches.filter((t) => t.statut === "termine"));
  }

  return { render };
}
