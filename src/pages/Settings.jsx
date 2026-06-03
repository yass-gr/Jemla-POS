import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'next-themes';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogAction, AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table';
import { toast } from 'sonner';

export default function Settings() {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();

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
    if (!currentPassword || !newPassword) { toast.error('Veuillez remplir tous les champs'); return; }
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

  function SectionCard({ title, children }) {
    return (
      <Card className="p-6">
        <h3 className="font-headline-sm text-headline-sm text-on-surface mb-4">{title}</h3>
        {children}
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="space-y-gutter pb-xl">
        <h2 className="font-headline-lg text-headline-lg text-on-surface">{t('settings.title')}</h2>
        <p className="text-body-md text-on-surface-variant mt-1">{t('settings.subtitle')}</p>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-gutter pb-xl">
      <h2 className="font-headline-lg text-headline-lg text-on-surface">{t('settings.title')}</h2>
      <p className="text-body-md text-on-surface-variant mt-1">{t('settings.subtitle')}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">

        {/* Theme */}
        <SectionCard title={t('settings.theme')}>
          <div className="flex items-center justify-between py-2">
            <span className="text-body-md text-on-surface">{t('settings.theme.light')}</span>
            <Button
              variant={theme === 'light' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme('light')}
              className="min-w-[90px]"
            >
              <span className="material-symbols-outlined text-lg">light_mode</span>
              {t('settings.theme.light')}
            </Button>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-body-md text-on-surface">{t('settings.theme.dark')}</span>
            <Button
              variant={theme === 'dark' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme('dark')}
              className="min-w-[90px]"
            >
              <span className="material-symbols-outlined text-lg">dark_mode</span>
              {t('settings.theme.dark')}
            </Button>
          </div>
        </SectionCard>

        {/* Language */}
        <SectionCard title={t('settings.language')}>
          <Select value={i18n.language} onValueChange={v => i18n.changeLanguage(v)}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="fr">{t('settings.language.fr')}</SelectItem>
              <SelectItem value="ar">{t('settings.language.ar')}</SelectItem>
            </SelectContent>
          </Select>
        </SectionCard>

        {/* POS Defaults */}
        <SectionCard title={t('settings.pos_defaults')}>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-on-surface mb-1 block">{t('settings.pos_defaults.payment_method')}</label>
              <Select value={settings.pos_default_payment || 'cash'} onValueChange={v => updateSetting('pos_default_payment', v)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">{t('settings.pos_defaults.cash')}</SelectItem>
                  <SelectItem value="card">{t('settings.pos_defaults.card')}</SelectItem>
                  <SelectItem value="digital">{t('settings.pos_defaults.digital')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-on-surface mb-1 block">{t('settings.pos_defaults.default_customer')}</label>
              <Input
                value={settings.pos_default_customer || ''}
                onChange={e => updateSetting('pos_default_customer', e.target.value)}
                placeholder="Client général"
              />
            </div>
          </div>
        </SectionCard>

        {/* Stock Threshold */}
        <SectionCard title={t('settings.stock_threshold')}>
          <label className="text-sm font-medium text-on-surface mb-1 block">{t('settings.stock_threshold.label')}</label>
          <p className="text-label-md text-on-surface-variant mb-3">{t('settings.stock_threshold.desc')}</p>
          <Input
            type="number"
            min="0"
            value={settings.stock_threshold || '10'}
            onChange={e => updateSetting('stock_threshold', e.target.value)}
            className="max-w-[120px]"
          />
        </SectionCard>

        {/* Receipt Printer */}
        <SectionCard title={t('settings.receipt')}>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-on-surface mb-1 block">{t('settings.receipt.width')}</label>
              <Input
                type="number"
                min="30"
                max="80"
                value={settings.receipt_width || '48'}
                onChange={e => updateSetting('receipt_width', e.target.value)}
                className="max-w-[120px]"
              />
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-body-md text-on-surface">{t('settings.receipt.show_logo')}</span>
              <Switch
                checked={settings.receipt_show_logo !== 'false'}
                onCheckedChange={v => updateSetting('receipt_show_logo', v)}
              />
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-body-md text-on-surface">{t('settings.receipt.show_tax')}</span>
              <Switch
                checked={settings.receipt_show_tax !== 'false'}
                onCheckedChange={v => updateSetting('receipt_show_tax', v)}
              />
            </div>
          </div>
        </SectionCard>

        {/* Backup */}
        <SectionCard title={t('settings.backup')}>
          <p className="text-label-md text-on-surface-variant mb-4">{t('settings.backup.desc')}</p>
          <Button onClick={handleDownloadBackup} className="w-full">
            <span className="material-symbols-outlined">download</span>
            {t('settings.backup.download')}
          </Button>
        </SectionCard>

        {/* Account - Change Password */}
        <SectionCard title={t('settings.account')}>
          <div className="space-y-3">
            <p className="font-bold text-body-md text-on-surface">{t('settings.account.change_password')}</p>
            <Input type="password" placeholder={t('settings.account.current_password')}
              value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
            <Input type="password" placeholder={t('settings.account.new_password')}
              value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            <Input type="password" placeholder={t('settings.account.confirm_password')}
              value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            <Button onClick={handleChangePassword} className="w-full">
              <span className="material-symbols-outlined">lock</span>
              {t('settings.account.change_password')}
            </Button>
          </div>
        </SectionCard>

      </div>

      {/* Manage Users (admin only) */}
      {user?.role === 'admin' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">{t('settings.account.manage_users')}</h3>
            <Button onClick={openAddUser}>
              <span className="material-symbols-outlined">person_add</span>
              {t('settings.account.add_user')}
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('settings.account.username')}</TableHead>
                <TableHead>{t('settings.account.name')}</TableHead>
                <TableHead>{t('settings.account.role')}</TableHead>
                <TableHead className="text-end">{t('common.delete')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(u => (
                <TableRow key={u.id}>
                  <TableCell className="font-bold text-on-surface">{u.username}</TableCell>
                  <TableCell className="text-on-surface-variant">{u.name}</TableCell>
                  <TableCell>
                    <Select value={u.role} onValueChange={v => api.users.update(u.id, { role: v }).then(() => {
                      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, role: v } : x));
                      toast.success(t('settings.account.user_updated'));
                    }).catch(err => toast.error(err.message))}>
                      <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">{t('settings.account.admin')}</SelectItem>
                        <SelectItem value="cashier">{t('settings.account.cashier')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-end">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" className="text-primary" onClick={() => openEditUser(u)}>
                        <span className="material-symbols-outlined">edit</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="text-error" onClick={() => setDeleteTarget(u)} disabled={u.id === user.id}>
                        <span className="material-symbols-outlined">delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow><TableCell colSpan="4" className="text-center py-8 text-on-surface-variant">{t('common.loading')}</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* User edit dialog */}
      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? t('settings.account.manage_users') : t('settings.account.add_user')}</DialogTitle>
            <DialogDescription>
              {editingUser ? t('settings.account.user_updated') : t('settings.account.user_created')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-on-surface mb-1 block">{t('settings.account.username')} *</label>
              <Input value={userForm.username} onChange={e => setUserForm(f => ({ ...f, username: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium text-on-surface mb-1 block">{t('settings.account.name')} *</label>
              <Input value={userForm.name} onChange={e => setUserForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium text-on-surface mb-1 block">{t('settings.account.password')}{editingUser ? ' (' + t('settings.account.new_password') + ')' : ''}</label>
              <Input type="password" value={userForm.password} onChange={e => setUserForm(f => ({ ...f, password: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium text-on-surface mb-1 block">{t('settings.account.role')}</label>
              <Select value={userForm.role} onValueChange={v => setUserForm(f => ({ ...f, role: v }))}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">{t('settings.account.admin')}</SelectItem>
                  <SelectItem value="cashier">{t('settings.account.cashier')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setUserDialogOpen(false)}>{t('common.cancel')}</Button>
              <Button onClick={handleSaveUser}>{editingUser ? t('common.save') : t('settings.account.add_user')}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete user confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={o => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('settings.account.delete_confirm')}</AlertDialogTitle>
            <AlertDialogDescription>{deleteTarget?.username}</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-3">
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDeleteUser(deleteTarget?.id)} className="bg-error text-on-error hover:brightness-110">
              {t('common.delete')}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
