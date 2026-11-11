
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import Home from './pages/Home';
import SingleBlog from './pages/SingleBlog';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import BlogListing from './pages/BlogListing';

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <Routes>

          {/* Home Page */}
          <Route
            path="/"
            element={<Home />}
          />

          {/* Blog Listing Page */}
          <Route
            path="/articles"
            element={<BlogListing />}
          />

          {/* Individual Blog Page - SEO Slug */}
          <Route
            path="/blog/:slug"
            element={<SingleBlog />}
          />

          {/* Admin Login */}
          <Route
            path="/login"
            element={<Login />}
          />

          {/* Admin Dashboard */}
          <Route
            path="/admin"
            element={<AdminDashboard />}
          />

        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
