import { ReactNode } from "react"

const AdminTableTabs = ({ children }: { children: ReactNode }) => {
  return (
    <div
      role="tablist"
      className="flex max-w-full gap-1 overflow-x-auto p-1 text-xs border-foreground/20 border rounded-md bg-background md:flex-wrap md:overflow-visible"
    >
      {children}
    </div>
  )
}

export function Tab({ children, active, onClick }: { children: ReactNode, active?: boolean, onClick?: () => void }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={!!active}
      onClick={onClick}
      className={`px-4 py-2 whitespace-nowrap ${active ? 'bg-foreground text-background' : 'bg-transparent'} hover:bg-foreground hover:text-background rounded-md cursor-pointer transition-all duration-200`}
    >
      {children}
    </button>
  )
}

export default AdminTableTabs