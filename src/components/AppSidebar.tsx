import { Calculator, Search, Target, Shuffle, Bell, Table, GitCompare, FileText, DollarSign, BarChart3, BookOpen, Star, Home, FileSpreadsheet, ClipboardList, ExternalLink, Construction, Info } from "lucide-react"
import { NavLink } from "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"

const menuItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Rank Predictor", url: "/rank-predictor", icon: Calculator },
  { title: "Cutoff Explorer", url: "/cutoff-explorer", icon: Search },
  { title: "College Finder", url: "/college-finder", icon: Target },
  { title: "Round Tracker", url: "/round-tracker", icon: Bell },
  { title: "Documents", url: "/documents", icon: FileText },
  { title: "Reviews", url: "/reviews", icon: Star },
  { title: "Info Centre", url: "/info-centre", icon: Info },
  { title: "Mock Simulator", url: "/mock-simulator", icon: Shuffle, underDevelopment: true },
  { title: "College Compare", url: "/college-compare", icon: GitCompare, underDevelopment: true },
  { title: "Planner", url: "/planner", icon: ClipboardList, underDevelopment: true },
  { title: "Fee Calculator", url: "/fee-calculator", icon: DollarSign, underDevelopment: true },
  { title: "Analytics", url: "/analytics", icon: BarChart3, underDevelopment: true },
  { title: "XLSX Demo", url: "/xlsx-demo", icon: FileSpreadsheet, underDevelopment: true },
  { title: "Reddit Community", url: "https://www.reddit.com/r/KCETcoded/", icon: ExternalLink, external: true },
]

export function AppSidebar() {
  const { state, setOpenMobile, isMobile } = useSidebar()

  return (
    <Sidebar className={state === "collapsed" ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-primary font-semibold">
            {state !== "collapsed" && "KCET Coded"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    {item.external ? (
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors text-sidebar-foreground hover:bg-accent hover:text-accent-foreground"
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        {state !== "collapsed" && (
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="truncate">{item.title}</span>
                            {item.underDevelopment && (
                              <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200 text-xs px-1.5 py-0.5">
                                <Construction className="h-3 w-3 mr-1" />
                                Dev
                              </Badge>
                            )}
                          </div>
                        )}
                      </a>
                    ) : (
                      <NavLink 
                        to={item.url} 
                        onClick={() => {
                          if (isMobile) {
                            setOpenMobile(false)
                          }
                        }}
                        className={({ isActive }) => 
                          `flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors text-sidebar-foreground ${
                            isActive 
                              ? "bg-primary text-primary-foreground font-medium" 
                              : "hover:bg-accent hover:text-accent-foreground"
                          }`
                        }
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        {state !== "collapsed" && (
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="truncate">{item.title}</span>
                            {item.underDevelopment && (
                              <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200 text-xs px-1.5 py-0.5">
                                <Construction className="h-3 w-3 mr-1" />
                                Dev
                              </Badge>
                            )}
                          </div>
                        )}
                      </NavLink>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}