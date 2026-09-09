import { NavLink, Outlet } from "react-router-dom";

const links = [
  { to: "/", label: "Plan", end: true },
  { to: "/recipes", label: "Recipes" },
  { to: "/shop", label: "Shop" },
  { to: "/settings", label: "Settings" },
];

export function Layout() {
  return (
    <div className="app-shell">
      <main>
        <Outlet />
      </main>
      <nav className="bottom-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => (isActive ? "active" : undefined)}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
