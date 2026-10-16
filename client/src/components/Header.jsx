import { useAuth } from "../AuthContext";

export default function Header() {
  const { user, logout } = useAuth();
  return (
    <header className="header">
      <h1>SpendWise</h1>
      <div className="header-user">
        <span>{user.name}</span>
        <button className="btn ghost" onClick={logout}>Log out</button>
      </div>
    </header>
  );
}
