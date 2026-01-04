// src/components/Column.js
import { creerCarteTache } from "./TaskCard.js";

function vider(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
}

export function creerColonne({
  statut,
  zoneDepot,
  compteur,
  store,
  onEdit,
  annoncer,
}) {
  if (!zoneDepot) throw new Error(`Zone de dépôt manquante pour "${statut}".`);
  if (!compteur) throw new Error(`Compteur manquant pour "${statut}".`);

  function render(taches) {
    vider(zoneDepot);
    for (const tache of taches) {
      zoneDepot.appendChild(
        creerCarteTache({ tache, store, onEdit, annoncer }),
      );
    }
    compteur.textContent = String(taches.length);
  }

  return { statut, render };
}
