export default function Settings() {
  return (
    <div className="space-y-gutter pb-xl">
      <h2 className="font-headline-lg text-headline-lg text-on-surface">Paramètres</h2>
      <p className="text-body-md text-on-surface-variant mt-1">Configuration de l'application.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        <div className="bg-surface-container-lowest p-6 rounded-[24px] shadow-sm border border-outline-variant/30">
          <h3 className="font-headline-sm mb-4">Application</h3>
          <div className="space-y-4">
            <div className="flex justify-between py-2 border-b border-outline-variant/20">
              <span className="text-on-surface-variant">Version</span>
              <span className="font-bold">1.0.0</span>
            </div>
            <div className="flex justify-between py-2 border-b border-outline-variant/20">
              <span className="text-on-surface-variant">Nom</span>
              <span className="font-bold">Jemla POS</span>
            </div>
            <div className="flex justify-between py-2 border-b border-outline-variant/20">
              <span className="text-on-surface-variant">Devise</span>
              <span className="font-bold">MAD (DH)</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-on-surface-variant">Langue</span>
              <span className="font-bold">Français</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-[24px] shadow-sm border border-outline-variant/30">
          <h3 className="font-headline-sm mb-4">Comptes</h3>
          <div className="space-y-4">
            <div className="flex justify-between py-2 border-b border-outline-variant/20">
              <div>
                <p className="font-bold">Admin</p>
                <p className="text-label-md text-on-surface-variant">Administrateur</p>
              </div>
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-label-md font-bold">admin</span>
            </div>
            <div className="flex justify-between py-2">
              <div>
                <p className="font-bold">Cashier</p>
                <p className="text-label-md text-on-surface-variant">Caissier</p>
              </div>
              <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-label-md font-bold">cashier</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
