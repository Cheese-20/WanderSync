import React from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';

export default function Layout() {
  return (
    <div className="ws-layout">
      <NavBar />
      <main className="ws-layout-content">
        <Outlet />
      </main>
    </div>
  );
}
