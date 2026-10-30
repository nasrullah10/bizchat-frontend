'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { apiGet, apiPost } from '@/lib/api'
import {
  Settings, Shield, Bell, Mail, Globe, Database,
  Loader2, Save, RefreshCw,
} from 'lucide-react'

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    companyName: 'BizChat Pro',
    supportEmail: 'support@bizchatpro.com',
    maxTeamMembers: 10,
    maxBroadcastPerDay: 1000,
    enableSignup: true,
    enableFreeTrial: true,
    trialDays: 7,
    maintenanceMode: false,
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    // Load from API or localStorage
    const stored = localStorage.getItem('adminSettings')
    if (stored) {
      try {
        setSettings(JSON.parse(stored))
      } catch (e) {
        console.error(e)
      }
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      // Save to localStorage for now, later to API
      localStorage.setItem('adminSettings', JSON.stringify(settings))
      toast.success('Settings saved!')
    } catch (error) {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage platform configuration</p>
      </div>

      {/* Company Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Company Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Company Name</label>
              <Input
                value={settings.companyName}
                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Support Email</label>
              <Input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Platform Limits */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Database className="h-5 w-5" />
            Platform Limits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Max Team Members</label>
              <Input
                type="number"
                value={settings.maxTeamMembers}
                onChange={(e) => setSettings({ ...settings, maxTeamMembers: parseInt(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Max Broadcast/Day</label>
              <Input
                type="number"
                value={settings.maxBroadcastPerDay}
                onChange={(e) => setSettings({ ...settings, maxBroadcastPerDay: parseInt(e.target.value) })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Features
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">Enable Signup</p>
              <p className="text-sm text-muted-foreground">Allow new user registrations</p>
            </div>
            <Switch
              checked={settings.enableSignup}
              onCheckedChange={(v) => setSettings({ ...settings, enableSignup: v })}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">Enable Free Trial</p>
              <p className="text-sm text-muted-foreground">Offer free trial to new users</p>
            </div>
            <Switch
              checked={settings.enableFreeTrial}
              onCheckedChange={(v) => setSettings({ ...settings, enableFreeTrial: v })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Trial Duration (Days)</label>
            <Input
              type="number"
              value={settings.trialDays}
              onChange={(e) => setSettings({ ...settings, trialDays: parseInt(e.target.value) })}
              disabled={!settings.enableFreeTrial}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">Maintenance Mode</p>
              <p className="text-sm text-muted-foreground">Temporarily disable platform access</p>
            </div>
            <Switch
              checked={settings.maintenanceMode}
              onCheckedChange={(v) => setSettings({ ...settings, maintenanceMode: v })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={saveSettings} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Settings
        </Button>
      </div>
    </div>
  )
}