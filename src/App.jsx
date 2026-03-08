import { Navigate, Route, Routes } from "react-router-dom"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Profile from "./pages/Profile"
import Register from "./pages/Register"
import { useContext } from "react"
import { AuthContext } from "./contexts/AuthContext"

function App() {

  const { user } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-emerald-500/30">

      <Routes>
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to='/' />}
        />

        <Route
          path="/register"
          element={!user ? <Register /> : <Navigate to='/' />}
        />

        <Route
          path="/profile"
          element={user ? <Profile /> : <Navigate to='/login' />}
        />

        <Route
          path="/"
          element={user ? <Home /> : <Navigate to='/login' />}
        />

      </Routes>

    </div>
  )
}

export default App
