import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./AppSidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, Settings } from "lucide-react"
import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { loadSettings, saveSettings, applyRuntimeSettings, defaultSettings, type AppSettings } from '@/lib/settings'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const s = loadSettings()
    setSettings(s)
    // Apply on load
    applyRuntimeSettings(s)
  }, [])

  const update = (partial: Partial<AppSettings>) => {
    const next = { ...settings, ...partial }
    setSettings(next)
    saveSettings(next)
    applyRuntimeSettings(next)
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 border-b bg-background/70 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-40">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-semibold text-foreground">KCET Coded</h1>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200 text-xs">
                    BETA
                  </Badge>
                </div>
                <p className="text-sm text-foreground/70">KCET Helping Hub</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Settings">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent 
                  className="sm:max-w-lg"
                  aria-describedby="settings-dialog-description"
                >
                  <DialogHeader>
                    <DialogTitle>Settings</DialogTitle>
                    <p id="settings-dialog-description" className="sr-only">
                      Configure application settings including dashboard mode, theme preferences, and data loading options.
                    </p>
                  </DialogHeader>
                  <div className="space-y-5">
                    {/* Theme */}
                    <div className="space-y-2">
                      <Label>Theme</Label>
                      <Select value={settings.theme} onValueChange={(v: any) => update({ theme: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="system">System</SelectItem>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Toggles */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between border rounded p-3">
                        <Label htmlFor="compact">Compact mode</Label>
                        <Switch id="compact" checked={settings.compactMode} onCheckedChange={(v) => update({ compactMode: !!v })} />
                      </div>
                      <div className="flex items-center justify-between border rounded p-3">
                        <Label htmlFor="motion">Reduce animations</Label>
                        <Switch id="motion" checked={settings.reduceMotion} onCheckedChange={(v) => update({ reduceMotion: !!v })} />
                      </div>
                      <div className="flex items-center justify-between border rounded p-3">
                        <Label htmlFor="fast">Fast dashboard (summary)</Label>
                        <Switch id="fast" checked={settings.dashboardFastMode} onCheckedChange={(v) => update({ dashboardFastMode: !!v })} />
                      </div>
                      <div className="flex items-center justify-between border rounded p-3">
                        <Label htmlFor="watermark">Hide watermark</Label>
                        <Switch id="watermark" checked={settings.hideWatermark} onCheckedChange={(v) => update({ hideWatermark: !!v })} />
                      </div>
                      <div className="flex items-center justify-between border rounded p-3">
                        <Label htmlFor="codes">Show course codes</Label>
                        <Switch id="codes" checked={settings.showCourseCodes} onCheckedChange={(v) => update({ showCourseCodes: !!v })} />
                      </div>
                      <div className="flex items-center justify-between border rounded p-3">
                        <Label htmlFor="instcodes">Show institute codes</Label>
                        <Switch id="instcodes" checked={settings.showInstituteCodes} onCheckedChange={(v) => update({ showInstituteCodes: !!v })} />
                      </div>
                    </div>

                    {/* Defaults */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Default Year</Label>
                        <Select value={settings.defaultYear} onValueChange={(v: any) => update({ defaultYear: v })}>
                          <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">None</SelectItem>
                            <SelectItem value="2025">2025</SelectItem>
                            <SelectItem value="2024">2024</SelectItem>
                            <SelectItem value="2023">2023</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Default Round</Label>
                        <Select value={settings.defaultRound} onValueChange={(v: any) => update({ defaultRound: v })}>
                          <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">None</SelectItem>
                            <SelectItem value="R1">R1</SelectItem>
                            <SelectItem value="R2">R2</SelectItem>
                            <SelectItem value="R3">R3</SelectItem>
                            <SelectItem value="EXT">EXT</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Default Category</Label>
                        <Select value={settings.defaultCategory} onValueChange={(v: any) => update({ defaultCategory: v })}>
                          <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">None</SelectItem>
                            <SelectItem value="GM">GM</SelectItem>
                            <SelectItem value="GMK">GMK</SelectItem>
                            <SelectItem value="GMR">GMR</SelectItem>
                            <SelectItem value="1G">1G</SelectItem>
                            <SelectItem value="2AG">2AG</SelectItem>
                            <SelectItem value="3BG">3BG</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="ghost" size="icon">
                <User className="h-4 w-4" />
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
        
        {/* Watermark - Global (subtle, blurred glass) */}
        {!settings.hideWatermark && (
        <div 
          style={{
            position: 'fixed',
            bottom: '16px',
            right: '16px',
            zIndex: 40,
            padding: '8px 14px',
            borderRadius: '9999px',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'rgba(255,255,255,0.95)',
            background: 'linear-gradient( to top left, rgba(255,255,255,0.08), rgba(255,255,255,0.02) )',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)'
          }}
        >
          <span style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.25))' }}>❤️</span>
          <span style={{ letterSpacing: 0.2, textShadow: '0 1px 1px rgba(0,0,0,0.25)' }}>by u/Elegant_Compote9073</span>
        </div>
        )}
      </div>
    </SidebarProvider>
  )
}