import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'next-themes';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogAction, AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const sections = [
  { id: 'general', labelKey: 'settings.general', icon: 'settings' },
  { id: 'appearance', labelKey: 'settings.appearance', icon: 'palette' },
  { id: 'backup', labelKey: 'settings.backup', icon: 'backup' },
  { id: 'account', labelKey: 'settings.account', icon: 'account_circle' },
];

export default function Settings() {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('general');

  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [users, setUsers] = useState([]);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({ username: '', name: '', password: '', role: 'cashier' });
  const [deleteTarget, setDeleteTarget] = useState(null);

  async function loadSettings() {
    try {
      const data = await api.settings.get();
      setSettings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function loadUsers() {
    try {
      setUsers(await api.users.list());
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => { loadSettings(); if (user?.role === 'admin') loadUsers(); }, []);

  async function updateSetting(key, value) {
    const updated = { ...settings, [key]: String(value) };
    setSettings(updated);
    try {
      await api.settings.update({ [key]: value });
    } catch (err) {
      toast.error(t('common.error') || 'Erreur: ' + err.message);
    }
  }

  async function handleChangePassword() {
    if (!currentPassword || !newPassword) { toast.error(t('settings.password_required') || 'Veuillez remplir tous les champs'); return; }
    if (newPassword !== confirmPassword) { toast.error('Les mots de passe ne correspondent pas'); return; }
    if (newPassword.length < 3) { toast.error('Le mot de passe doit contenir au moins 3 caractères'); return; }
    try {
      await api.users.changeMyPassword(currentPassword, newPassword);
      toast.success(t('settings.account.password_changed'));
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err) {
      toast.error(err.message);
    }
  }

  function openAddUser() {
    setEditingUser(null);
    setUserForm({ username: '', name: '', password: '', role: 'cashier' });
    setUserDialogOpen(true);
  }

  function openEditUser(u) {
    setEditingUser(u);
    setUserForm({ username: u.username, name: u.name, password: '', role: u.role });
    setUserDialogOpen(true);
  }

  async function handleSaveUser() {
    if (!userForm.username.trim() || !userForm.name.trim()) { toast.error('Nom d\'utilisateur et nom requis'); return; }
    if (!editingUser && !userForm.password) { toast.error('Mot de passe requis'); return; }
    try {
      if (editingUser) {
        await api.users.update(editingUser.id, { username: userForm.username, name: userForm.name, role: userForm.role });
        if (userForm.password) await api.users.changePassword(editingUser.id, userForm.password);
        setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, username: userForm.username, name: userForm.name, role: userForm.role } : u));
        toast.success(t('settings.account.user_updated'));
      } else {
        const created = await api.users.create(userForm);
        setUsers(prev => [created, ...prev]);
        toast.success(t('settings.account.user_created'));
      }
      setUserDialogOpen(false);
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleDeleteUser(id) {
    try {
      await api.users.delete(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      toast.success(t('settings.account.user_deleted'));
    } catch (err) {
      toast.error(err.message);
    }
    setDeleteTarget(null);
  }

  function handleDownloadBackup() {
    const a = document.createElement('a');
    a.href = api.backup.download();
    a.download = `jemla-backup-${new Date().toISOString().slice(0, 10)}.db`;
    a.click();
    toast.success(t('settings.backup.success'));
  }

  if (loading) {
    return (
      <div className="space-y-5 pb-8">
        <div className="py-2">
          <h1 className="text-[28px] font-extrabold text-foreground leading-tight tracking-tight">{t('settings.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('settings.subtitle')}</p>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const SectionHeader = ({ icon, title, description }) => (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-xl bg-[#0F766E]/10 dark:bg-teal-500/20 flex items-center justify-center">
        <span className="material-symbols-outlined text-[#0F766E] dark:text-teal-400">{icon}</span>
      </div>
      <div>
        <h2 className="text-[22px] font-bold text-foreground">{title}</h2>
        {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
      </div>
    </div>
  );

  const SettingsCard = ({ children }) => (
    <div className="bg-white dark:bg-card rounded-[20px] shadow-[0_4px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-[#F1F5F9] dark:border-border p-6">
      {children}
    </div>
  );

  const SettingRow = ({ label, description, children }) => (
    <div className="flex items-center justify-between py-4 border-b border-[#F1F5F9] dark:border-border last:border-0">
      <div>
        <label className="text-sm font-medium text-foreground">{label}</label>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </div>
      <div>{children}</div>
    </div>
  );

  return (
    <div className="space-y-5 pb-8">
      <div className="py-2">
        <h1 className="text-[28px] font-extrabold text-foreground leading-tight tracking-tight">{t('settings.title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('settings.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <nav className="bg-white dark:bg-card rounded-[20px] shadow-[0_4px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-[#F1F5F9] dark:border-border p-2">
            {sections.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  activeSection === section.id
                    ? 'bg-[#0F766E]/10 dark:bg-teal-500/20 text-[#0F766E] dark:text-teal-400'
                    : 'text-muted-foreground hover:bg-accent'
                }`}
              >
                <span className="material-symbols-outlined text-lg">{section.icon}</span>
                {t(section.labelKey)}
              </button>
            ))}
            {user?.role === 'admin' && (
              <button
                onClick={() => setActiveSection('users')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  activeSection === 'users'
                    ? 'bg-[#0F766E]/10 dark:bg-teal-500/20 text-[#0F766E] dark:text-teal-400'
                    : 'text-muted-foreground hover:bg-accent'
                }`}
              >
                <span className="material-symbols-outlined text-lg">group</span>
                {t('settings.account.manage_users')}
              </button>
            )}
          </nav>
        </div>

        <div className="lg:col-span-3 space-y-4">
          {activeSection === 'general' && (
            <SettingsCard>
              <SectionHeader 
                icon="tune" 
                title={t('settings.general')} 
                description={t('settings.general_desc', 'General application settings')}
              />
              <div>
                <SettingRow 
                  label={t('settings.pos_defaults.payment_method')}
                  description={t('settings.pos_defaults.desc', 'Default payment method for new sales')}
                >
                  <Select value={settings.pos_default_payment || 'cash'} onValueChange={v => updateSetting('pos_default_payment', v)}>
                    <SelectTrigger className="w-[140px] h-9 bg-white dark:bg-card border border-[#F1F5F9] dark:border-border rounded-xl text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">{t('settings.pos_defaults.cash')}</SelectItem>
                      <SelectItem value="card">{t('settings.pos_defaults.card')}</SelectItem>
                      <SelectItem value="digital">{t('settings.pos_defaults.digital')}</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingRow>
                <SettingRow 
                  label={t('settings.pos_defaults.default_customer')}
                  description={t('settings.pos_defaults.default_customer_desc', 'Default customer name for quick sales')}
                >
                  <Input
                    value={settings.pos_default_customer || ''}
                    onChange={e => updateSetting('pos_default_customer', e.target.value)}
                    placeholder="Client général"
                    className="w-[200px] h-9 bg-white dark:bg-card border border-[#F1F5F9] dark:border-border rounded-xl text-sm"
                  />
                </SettingRow>
                <SettingRow 
                  label={t('settings.stock_threshold.label')}
                  description={t('settings.stock_threshold.desc')}
                >
                  <Input
                    type="number"
                    min="0"
                    value={settings.stock_threshold || '10'}
                    onChange={e => updateSetting('stock_threshold', e.target.value)}
                    className="w-[80px] h-9 bg-white dark:bg-card border border-[#F1F5F9] dark:border-border rounded-xl text-sm"
                  />
                </SettingRow>
              </div>
            </SettingsCard>
          )}

          {activeSection === 'appearance' && (
            <SettingsCard>
              <SectionHeader 
                icon="palette" 
                title={t('settings.appearance')} 
                description={t('settings.appearance_desc', 'Customize application appearance')}
              />
              <div>
                <SettingRow 
                  label={t('settings.theme.light')}
                  description={t('settings.theme.light_desc', 'Light color scheme')}
                >
                  <button
                    onClick={() => setTheme('light')}
                    className={theme === 'light'
                      ? 'px-4 h-8 bg-[#0F766E] text-white rounded-xl text-xs font-semibold'
                      : 'px-4 h-8 border border-[#F1F5F9] dark:border-border text-muted-foreground rounded-xl text-xs font-medium hover:bg-accent transition-colors'}
                  >
                    {t('settings.theme.light')}
                  </button>
                </SettingRow>
                <SettingRow 
                  label={t('settings.theme.dark')}
                  description={t('settings.theme.dark_desc', 'Dark color scheme')}
                >
                  <button
                    onClick={() => setTheme('dark')}
                    className={theme === 'dark'
                      ? 'px-4 h-8 bg-[#0F766E] text-white rounded-xl text-xs font-semibold'
                      : 'px-4 h-8 border border-[#F1F5F9] dark:border-border text-muted-foreground rounded-xl text-xs font-medium hover:bg-accent transition-colors'}
                  >
                    {t('settings.theme.dark')}
                  </button>
                </SettingRow>
                <SettingRow 
                  label={t('settings.language')}
                  description={t('settings.language_desc', 'Application language')}
                >
                  <Select value={i18n.language} onValueChange={v => i18n.changeLanguage(v)}>
                    <SelectTrigger className="w-[140px] h-9 bg-white dark:bg-card border border-[#F1F5F9] dark:border-border rounded-xl text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">{t('settings.language.fr')}</SelectItem>
                      <SelectItem value="ar">{t('settings.language.ar')}</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingRow>
                <SettingRow 
                  label={t('settings.receipt.width')}
                  description={t('settings.receipt.width_desc', 'Receipt paper width in mm')}
                >
                  <Input
                    type="number"
                    min="30"
                    max="80"
                    value={settings.receipt_width || '48'}
                    onChange={e => updateSetting('receipt_width', e.target.value)}
                    className="w-[80px] h-9 bg-white dark:bg-card border border-[#F1F5F9] dark:border-border rounded-xl text-sm"
                  />
                </SettingRow>
                <SettingRow 
                  label={t('settings.receipt.show_logo')}
                  description={t('settings.receipt.show_logo_desc', 'Display logo on printed receipts')}
                >
                  <Switch
                    checked={settings.receipt_show_logo !== 'false'}
                    onCheckedChange={v => updateSetting('receipt_show_logo', v)}
                  />
                </SettingRow>
                <SettingRow 
                  label={t('settings.receipt.show_tax')}
                  description={t('settings.receipt.show_tax_desc', 'Show tax breakdown on receipts')}
                >
                  <Switch
                    checked={settings.receipt_show_tax !== 'false'}
                    onCheckedChange={v => updateSetting('receipt_show_tax', v)}
                  />
                </SettingRow>
              </div>
            </SettingsCard>
          )}

          {activeSection === 'account' && (
            <SettingsCard>
              <SectionHeader 
                icon="password" 
                title={t('settings.account.change_password')} 
                description={t('settings.account.change_password_desc', 'Update your account password')}
              />
              <div className="space-y-4 pt-2">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">{t('settings.account.current_password')}</label>
                  <Input
                    type="password"
                    placeholder={t('settings.account.current_password')}
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    className="h-10 bg-white dark:bg-card border border-[#F1F5F9] dark:border-border rounded-[20px] text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">{t('settings.account.new_password')}</label>
                  <Input
                    type="password"
                    placeholder={t('settings.account.new_password')}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="h-10 bg-white dark:bg-card border border-[#F1F5F9] dark:border-border rounded-[20px] text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">{t('settings.account.confirm_password')}</label>
                  <Input
                    type="password"
                    placeholder={t('settings.account.confirm_password')}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="h-10 bg-white dark:bg-card border border-[#F1F5F9] dark:border-border rounded-[20px] text-sm"
                  />
                </div>
                <div className="pt-2">
                  <button
                    onClick={handleChangePassword}
                    className="px-4 h-9 bg-[#0F766E] text-white rounded-xl text-xs font-semibold hover:bg-[#0F766E]/90 transition-colors"
                  >
                    {t('settings.account.change_password')}
                  </button>
                </div>
              </div>
            </SettingsCard>
          )}

          {activeSection === 'backup' && (
            <SettingsCard>
              <SectionHeader 
                icon="backup" 
                title={t('settings.backup')} 
                description={t('settings.backup.desc')}
              />
              <button
                onClick={handleDownloadBackup}
                className="flex items-center gap-2 px-4 h-9 bg-[#0F766E] text-white rounded-xl text-xs font-semibold hover:bg-[#0F766E]/90 transition-colors"
              >
                <span className="material-symbols-outlined">download</span>
                {t('settings.backup.download')}
              </button>
            </SettingsCard>
          )}

          {activeSection === 'users' && user?.role === 'admin' && (
            <SettingsCard>
              <div className="flex items-center justify-between mb-6">
                <SectionHeader 
                  icon="group" 
                  title={t('settings.account.manage_users')} 
                  description={t('settings.account.manage_users_desc', 'Manage system users')}
                />
                <button
                  onClick={openAddUser}
                  className="flex items-center gap-1.5 px-4 h-9 bg-[#0F766E] text-white rounded-xl text-xs font-semibold hover:bg-[#0F766E]/90 transition-colors"
                >
                  <span className="material-symbols-outlined">person_add</span>
                  {t('settings.account.add_user')}
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#F1F5F9] dark:border-border">
                      <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground tracking-wider uppercase text-start">{t('settings.account.username')}</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground tracking-wider uppercase text-start">{t('settings.account.name')}</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground tracking-wider uppercase text-start">{t('settings.account.role')}</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground tracking-wider uppercase text-end">{t('common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className="group hover:bg-[#f8fafc] dark:hover:bg-accent transition-colors border-b border-[#F1F5F9] dark:border-border last:border-0">
                        <td className="px-4 py-3 font-semibold text-foreground">{u.username}</td>
                        <td className="px-4 py-3 text-muted-foreground">{u.name}</td>
                        <td className="px-4 py-3">
                          <Select value={u.role} onValueChange={v => api.users.update(u.id, { role: v }).then(() => {
                            setUsers(prev => prev.map(x => x.id === u.id ? { ...x, role: v } : x));
                            toast.success(t('settings.account.user_updated'));
                          }).catch(err => toast.error(err.message))}>
                            <SelectTrigger className="w-[140px] h-8 bg-white dark:bg-card border border-[#F1F5F9] dark:border-border rounded-xl text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">{t('settings.account.admin')}</SelectItem>
                              <SelectItem value="cashier">{t('settings.account.cashier')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-4 py-3 text-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent transition-colors flex items-center justify-center">
                                <span className="material-symbols-outlined text-[18px]">more_vert</span>
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditUser(u)} className="gap-2 cursor-pointer text-xs">
                                <span className="material-symbols-outlined text-[16px]">edit</span>
                                {t('common.edit')}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setDeleteTarget(u)} disabled={u.id === user.id} className="gap-2 cursor-pointer text-red-500 text-xs">
                                <span className="material-symbols-outlined text-[16px]">delete</span>
                                {t('common.delete')}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr><td colSpan="4" className="px-4 py-8 text-xs text-muted-foreground text-center">{t('common.no_results')}</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </SettingsCard>
          )}
        </div>
      </div>

      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingUser ? t('settings.account.manage_users') : t('settings.account.add_user')}</DialogTitle>
            <DialogDescription>
              {editingUser ? t('settings.account.user_updated') : t('settings.account.user_created')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">{t('settings.account.username')} *</label>
              <Input
                value={userForm.username}
                onChange={e => setUserForm(f => ({ ...f, username: e.target.value }))}
                className="h-10 bg-white dark:bg-card border border-[#F1F5F9] dark:border-border rounded-[20px] text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">{t('settings.account.name')} *</label>
              <Input
                value={userForm.name}
                onChange={e => setUserForm(f => ({ ...f, name: e.target.value }))}
                className="h-10 bg-white dark:bg-card border border-[#F1F5F9] dark:border-border rounded-[20px] text-sm"
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-medium text-foreground">{t('settings.account.password')}{editingUser ? ' (' + t('settings.account.new_password') + ')' : ''}</label>
              <Input
                type="password"
                value={userForm.password}
                onChange={e => setUserForm(f => ({ ...f, password: e.target.value }))}
                placeholder={editingUser ? t('settings.account.password_new_placeholder', 'Leave empty to keep current') : ''}
                className="h-10 bg-white dark:bg-card border border-[#F1F5F9] dark:border-border rounded-[20px] text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">{t('settings.account.role')}</label>
              <Select value={userForm.role} onValueChange={v => setUserForm(f => ({ ...f, role: v }))}>
                <SelectTrigger className="w-full h-10 bg-white dark:bg-card border border-[#F1F5F9] dark:border-border rounded-[20px] text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">{t('settings.account.admin')}</SelectItem>
                  <SelectItem value="cashier">{t('settings.account.cashier')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 pt-2">
              <button
                onClick={() => setUserDialogOpen(false)}
                className="px-4 h-9 border border-[#F1F5F9] dark:border-border text-muted-foreground rounded-xl text-xs font-medium hover:bg-accent transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleSaveUser}
                className="px-4 h-9 bg-[#0F766E] text-white rounded-xl text-xs font-semibold hover:bg-[#0F766E]/90 transition-colors"
              >
                {editingUser ? t('common.save') : t('settings.account.add_user')}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={o => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('settings.account.delete_confirm')}</AlertDialogTitle>
            <AlertDialogDescription>{deleteTarget?.username}</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-3">
            <AlertDialogCancel className="px-4 h-9">{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDeleteUser(deleteTarget?.id)}
              className="px-4 h-9 bg-red-500 hover:bg-red-600"
            >
              {t('common.delete')}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}