import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import { routeArray } from '@/config/routes';
import SearchBar from '@/components/molecules/SearchBar';

const Layout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: '-100%' }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      {/* Header */}
      <header className="flex-shrink-0 h-16 bg-white border-b border-gray-200 z-40">
        <div className="h-full flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ApperIcon name="Menu" size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <ApperIcon name="Users" size={18} className="text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">FlowCRM</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <SearchBar />
            </div>
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <ApperIcon name="Bell" size={20} className="text-gray-600" />
            </button>
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">JD</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 bg-white border-r border-gray-200 flex-col z-40">
          <nav className="flex-1 p-4 space-y-1">
            {routeArray.map((route) => (
              <NavLink
                key={route.id}
                to={route.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                <ApperIcon name={route.icon} size={18} />
                {route.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                onClick={() => setMobileMenuOpen(false)}
              />
              <motion.aside
                initial="closed"
                animate="open"
                exit="closed"
                variants={sidebarVariants}
                transition={{ duration: 0.3 }}
                className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 z-50 lg:hidden"
              >
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                      <ApperIcon name="Users" size={18} className="text-white" />
                    </div>
                    <h1 className="text-xl font-semibold text-gray-900">FlowCRM</h1>
                  </div>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                  {routeArray.map((route) => (
                    <NavLink
                      key={route.id}
                      to={route.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-primary text-white shadow-sm'
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }`
                      }
                    >
                      <ApperIcon name={route.icon} size={18} />
                      {route.label}
                    </NavLink>
                  ))}
                </nav>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;