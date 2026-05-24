import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast"

/* AUTH */
import RoleSelect    from "./pages/auth/RoleSelect";
import Login         from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import FirstLogin    from "./pages/auth/FirstLogin";

/* DOCTORANT */
import DocDashboard from "./pages/Doctorant/Dahboard";
import These        from "./pages/Doctorant/These";
import Objectifs    from "./pages/Doctorant/Objectifs";
import Reunions     from "./pages/Doctorant/Reunions";
import Livrables    from "./pages/Doctorant/Livrables";
import Taches       from "./pages/Doctorant/Taches";
import Echeances    from "./pages/Doctorant/Echeances";

/* ENCADRANT */
import EncDashboard  from "./pages/Encadrant/Dashboard";
import Doctorants    from "./pages/Encadrant/Doctorants";
import EncObjectifs  from "./pages/Encadrant/Objectifs";
import EncReunions   from "./pages/Encadrant/Reunions";
import EncLivrables  from "./pages/Encadrant/Livrables";
import EncMessages from "./pages/Encadrant/Messages"


/* CO-ENCADRANT */
import CoEncDashboard from "./pages/coEncadrant/Dashboard";
import CoDoctorants   from "./pages/CoEncadrant/Doctorants";
import CoReunions     from "./pages/CoEncadrant/Reunions";
import CoLivrables    from "./pages/CoEncadrant/Livrables";
import CoMessages  from "./pages/coEncadrant/Messages"

/* RESPONSABLE */
import ResDashboard  from "./pages/Responsable/Dashboard";
import Statistiques  from "./pages/Responsable/Statistique";
import ResDoctorants from "./pages/Responsable/Doctorants";
import Reports       from "./pages/Responsable/Reports";

/* ADMIN */
import AdminDashboard from "./pages/Admin/Dashboard";
import Users          from "./pages/Admin/Users";
import Roles          from "./pages/Admin/Roles";

/* LAYOUT */
import MainLayout from "./components/layout/MainLayout";

function App() {
  return (
    <>
      <Toaster />
      <Routes>

        {/* AUTH */}
        <Route path="/" element={<RoleSelect />} />
        <Route path="/login/first-login"    element={<FirstLogin />} />
        <Route path="/login/forgot-password" element={<ForgotPassword />} />
        <Route path="/forgot"               element={<ForgotPassword />} />

        <Route path="/login/doctorant"    element={<Login role='doctorant'    title='Espace Doctorant'    subtitle="Accédez à votre espace pour suivre l'avancement de votre thèse." />} />
        <Route path="/login/encadrant"    element={<Login role='encadrant'    title='Espace Encadrant'    subtitle="Supervisez les doctorants et suivez les réunions d'encadrement." />} />
        <Route path="/login/responsable"  element={<Login role='responsable'  title='Espace Responsable'  subtitle="Consultez les indicateurs globaux des doctorants." />} />
        <Route path="/login/admin"        element={<Login role='admin'        title='Espace Admin'        subtitle="Gérez les utilisateurs et les paramètres de la plateforme." />} />
        <Route path="/login/co-encadrant" element={<Login role='co-encadrant' title='Espace Co-Encadrant' subtitle="Suivez les doctorants co-encadrés et participez au suivi scientifique." />} />

        {/* DOCTORANT */}
        <Route path="/doctorant" element={<MainLayout />}>
          <Route index             element={<DocDashboard />} />
          <Route path="these"      element={<These />} />
          <Route path="objectifs"  element={<Objectifs />} />
          <Route path="reunions"   element={<Reunions />} />
          <Route path="livrables"  element={<Livrables />} />
          <Route path="taches"     element={<Taches />} />
          <Route path="echeances"  element={<Echeances />} />
        </Route>

        {/* ENCADRANT */}
        <Route path="/encadrant" element={<MainLayout />}>
          <Route index              element={<EncDashboard />} />
          <Route path="doctorants"  element={<Doctorants />} />
          <Route path="objectifs"   element={<EncObjectifs />} />
          <Route path="reunions"    element={<EncReunions />} />
          <Route path="livrables"   element={<EncLivrables />} />
          <Route path="messages" element={<EncMessages />} />
        </Route>

        {/* CO-ENCADRANT */}
        <Route path="/co-encadrant" element={<MainLayout />}>
          <Route index              element={<CoEncDashboard />} />
          <Route path="doctorants"  element={<CoDoctorants />} />
          <Route path="reunions"    element={<CoReunions />} />
          <Route path="livrables"   element={<CoLivrables />} />
          <Route path="messages" element={<CoMessages />} />
        </Route>

        {/* RESPONSABLE */}
        <Route path="/responsable" element={<MainLayout />}>
          <Route index              element={<ResDashboard />} />
          <Route path="statistiques" element={<Statistiques />} />
          <Route path="doctorants"  element={<ResDoctorants />} />
          <Route path="reports"     element={<Reports />} />
        </Route>

        {/* ADMIN */}
        <Route path="/admin" element={<MainLayout />}>
          <Route index          element={<AdminDashboard />} />
          <Route path="users"   element={<Users />} />
          <Route path="roles"   element={<Roles />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<h1>Page Not Found</h1>} />

      </Routes>
    </>
  )
}

export default App;