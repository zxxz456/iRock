import { useState } from 'react'
import './App.css'
import { Routes, Route } from 'react-router-dom'
import UserNavAppBar from './components/nav/UserNavAppBar.jsx'
import Login from './components/Login.jsx'
import RegisterParticipant from './components/RegisterParticipant.jsx'
import HomeAdmin from './components/HomeAdmin.jsx'
import HomeUsr from './components/HomeUsr.jsx'
import RegisterAscension from './components/RegisterAscension.jsx'
import ParticipantsPage from './components/ParticipantsPage.jsx'
import RoutesPageAdmin from './components/RoutesPageAdmin.jsx'
import AscensionsPage from './components/AscensionsPage.jsx'
import LeaderboardPage from './components/LeaderboardPage.jsx'
import LeaderboardPageKids from './components/LeaderboardPageKids.jsx'
import LeaderboardPagePrincipiantes from './components/LeaderboardPagePrincipiantes.jsx'
import LeaderboardPageIntermedio from './components/LeaderboardPageIntermedio.jsx'
import LeaderboardPageAvanzado from './components/LeaderboardPageAvanzado.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import UserAscensions from './components/UserAscensions.jsx'
import AboutPage from './components/About.jsx'
// import UserAvailableRoutes from './components/UserAvailableRoutes.jsx'
import InactiveUser from './components/InactiveUser.jsx' 
import NavBar from './components/nav/NavBar.jsx';
import RegisterRouteAdmin from './components/RegisterRouteAdmin.jsx'
import EditRouteAdmin from './components/EditRouteAdmin.jsx'
import RegisterParticipantAdmin from './components/RegisterParticipantAdmin.jsx'
import EditParticipantAdmin from './components/EditParticipantAdmin.jsx'
import InactiveUserDate from './components/InactiveUserDate.jsx'

/*
  Main application component defining all routes.
*/

function App() {
  return (
    <>
      <Routes>
        {/* PUBlic routes (no navbar) */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<RegisterParticipant />} />
        <Route path="/inactive" element={<InactiveUser />} />
        <Route path="/inactive-date" element={<InactiveUserDate />} />

        {/* Routes with UserNavAppBar for regular users */}
        <Route path="/participant" element={
          <ProtectedRoute>
            <UserNavAppBar>
              <HomeUsr />
            </UserNavAppBar>
          </ProtectedRoute>
        } />
        <Route path="/register-ascension" element={
          <ProtectedRoute>
            <UserNavAppBar>
              <RegisterAscension />
            </UserNavAppBar>
          </ProtectedRoute>
        } />
        {/* User available routes are in Select form */}
        {/*} <Route path="/routes" element={
          <ProtectedRoute>
            <UserNavAppBar>
              <UserAvailableRoutes />
            </UserNavAppBar>
          </ProtectedRoute>
        } /> {*/}
        <Route path="/my-ascensions" element={
          <ProtectedRoute>
            <UserNavAppBar>
              <UserAscensions />
            </UserNavAppBar>
          </ProtectedRoute>
        } />
        <Route path="/about" element={
          <ProtectedRoute>
            <UserNavAppBar>
              <AboutPage />
            </UserNavAppBar>
          </ProtectedRoute>
        } />
        

        
        {/* Protected routes only for staff/admin (no user navbar) */}
        <Route path="/admin" element={
          <ProtectedRoute requireStaff={true}>
            <NavBar content={<HomeAdmin />} />
          </ProtectedRoute>
        } />
        <Route path="/participants" element={
          <ProtectedRoute requireStaff={true}>
            <NavBar content={<ParticipantsPage />} />
          </ProtectedRoute>
        } />
        <Route path="/ascensions" element={
          <ProtectedRoute requireStaff={true}>
            <NavBar content={<AscensionsPage />} />
          </ProtectedRoute>
        } />
        <Route path="/leaderboard" element={
          <ProtectedRoute requireStaff={true}>
            <NavBar content={<LeaderboardPage />} />
          </ProtectedRoute>
        } />
        <Route path="/leaderboard-kids" element={
          <ProtectedRoute requireStaff={true}>
            <NavBar content={<LeaderboardPageKids />} />
          </ProtectedRoute>
        } />
        <Route path="/leaderboard-principiantes" element={
          <ProtectedRoute requireStaff={true}>
            <NavBar content={<LeaderboardPagePrincipiantes />} />
          </ProtectedRoute>
        } />
        <Route path="/leaderboard-intermedio" element={
          <ProtectedRoute requireStaff={true}>
            <NavBar content={<LeaderboardPageIntermedio />} />
          </ProtectedRoute>
        } />
        <Route path="/leaderboard-avanzado" element={
          <ProtectedRoute requireStaff={true}>
            <NavBar content={<LeaderboardPageAvanzado />} />
          </ProtectedRoute>
        } />
        <Route path="/routes-admin" element={
          <ProtectedRoute requireStaff={true}>
            <NavBar content={<RoutesPageAdmin />} />
          </ProtectedRoute>
        } />
        <Route path="/register-route-admin" element={
          <ProtectedRoute requireStaff={true}>
            <NavBar content={<RegisterRouteAdmin />} />
          </ProtectedRoute>
        } />
        <Route path="/edit-route-admin" element={
          <ProtectedRoute requireStaff={true}>
            <NavBar content={<EditRouteAdmin />} />
          </ProtectedRoute>
        } />
        <Route path="/register-participant-admin" element={
          <ProtectedRoute requireStaff={true}>
            <NavBar content={<RegisterParticipantAdmin />} />
          </ProtectedRoute>
        } />
        <Route path="/edit-participant-admin" element={
          <ProtectedRoute requireStaff={true}>
            <NavBar content={<EditParticipantAdmin />} />
          </ProtectedRoute>
        } />
        <Route path="/leaderboard-kids" element={
          <ProtectedRoute requireStaff={true}>
            <NavBar content={<LeaderboardPageKids />} />
          </ProtectedRoute>
        } />
        <Route path="/leaderboard-principiantes" element={
          <ProtectedRoute requireStaff={true}>
            <NavBar content={<LeaderboardPagePrincipiantes />} />
          </ProtectedRoute>
        } />
        <Route path="/leaderboard-intermedio" element={
          <ProtectedRoute requireStaff={true}>
            <NavBar content={<LeaderboardPageIntermedio />} />
          </ProtectedRoute>
        } />
        <Route path="/leaderboard-avanzado" element={
          <ProtectedRoute requireStaff={true}>
            <NavBar content={<LeaderboardPageAvanzado />} />
          </ProtectedRoute>
        } />
      </Routes>
    </>
  )
}

export default App
