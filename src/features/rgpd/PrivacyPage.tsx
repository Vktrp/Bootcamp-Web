// src/features/rgpd/PrivacyPolicyPage.tsx
export default function PrivacyPolicyPage() {
  const resetConsent = () => {
    localStorage.removeItem("consent");
    location.reload();
  };

  return (
    <div className="container-page" style={{ maxWidth: 900, marginTop: 24 }}>
      <div className="card" style={{ padding: 24 }}>
        <h1 className="font-semibold" style={{ fontSize: 28, marginBottom: 8 }}>
          Politique de confidentialité
        </h1>
        <p className="text-sm">Dernière mise à jour : 09/2025</p>

        <h2 className="font-semibold mt-4" style={{ fontSize: 20 }}>
          1. Responsable du traitement
        </h2>
        <address className="mt-2" style={{ fontStyle: "normal" }}>
          <strong>ACME Sneakershop</strong>
          <br />
          24 Rue Pasteur, 94270 Le Kremlin-Bicêtre
          <br />
          E-mail : contact@acme-sneakershop.fr
        </address>

        <h2 className="font-semibold mt-4" style={{ fontSize: 20 }}>
          2. Données collectées
        </h2>
        <ul className="mt-2">
          <li>Compte : e-mail, mot de passe (haché), nom.</li>
          <li>Commande : adresses, téléphone, articles, montant.</li>
          <li>Navigation : pages vues, paniers, préférence de consentement.</li>
        </ul>

        <h2 className="font-semibold mt-4" style={{ fontSize: 20 }}>
          3. Finalités et bases légales
        </h2>
        <ul className="mt-2">
          <li>Création/gestion du compte — exécution du contrat.</li>
          <li>
            Traitement des commandes et service client — exécution du contrat.
          </li>
          <li>Mesure d’audience — consentement.</li>
          <li>Prévention de la fraude — intérêt légitime.</li>
        </ul>

        <h2 className="font-semibold mt-4" style={{ fontSize: 20 }}>
          4. Cookies
        </h2>
        <p className="mt-2">
          Les cookies nécessaires assurent le fonctionnement du site. Les
          cookies d’analyse ne sont déposés qu’avec votre consentement.
        </p>
        <div
          className="mt-2"
          style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
        >
          <button className="btn-outline" onClick={resetConsent}>
            Gérer mes cookies
          </button>
          <span className="badge">Nécessaires</span>
          <span className="badge">Analyse (opt-in)</span>
        </div>

        <h2 className="font-semibold mt-4" style={{ fontSize: 20 }}>
          5. Destinataires et sous-traitants
        </h2>
        <p className="mt-2">
          Hébergeur, prestataires de paiement/logistique, et outils d’analyse.
          Aucun transfert hors UE sans garanties appropriées.
        </p>

        <h2 className="font-semibold mt-4" style={{ fontSize: 20 }}>
          6. Durées de conservation
        </h2>
        <ul className="mt-2">
          <li>Compte : tant qu’actif, puis 3 ans après inactivité.</li>
          <li>Commandes : 5 à 10 ans .</li>
          <li>Cookies d’analyse : 13 mois max.</li>
        </ul>

        <h2 className="font-semibold mt-4" style={{ fontSize: 20 }}>
          7. Sécurité
        </h2>
        <p className="mt-2">
          Chiffrement TLS, mots de passe hachés, contrôle d’accès,
          journalisation.
        </p>

        <h2 className="font-semibold mt-4" style={{ fontSize: 20 }}>
          8. Vos droits (RGPD)
        </h2>
        <p className="mt-2">
          Accès, rectification, suppression, opposition, limitation,
          portabilité. Exercez-les à : privacy@acme-sneakershop.fr. Vous pouvez
          saisir la CNIL si nécessaire.
        </p>

        <h2 className="font-semibold mt-4" style={{ fontSize: 20 }}>
          9. Contact DPO
        </h2>
        <p className="mt-2">dpo@acme-sneakershop.fr.</p>

        <h2 className="font-semibold mt-4" style={{ fontSize: 20 }}>
          10. Modifications
        </h2>
        <p className="mt-2">
          Nous pouvons mettre à jour cette politique. La date de mise à jour
          sera indiquée.
        </p>
      </div>
    </div>
  );
}
