import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Home from "./pages/Home";
import About from "./pages/About";
import NavMenu from "./pages/menu/menu";

import ProductsPage from "./pages/ProductsList/ProductList";
import AccessoriesPage from "./pages/ProductsList/EmptyPage";
import { CartProvider } from "./utils/CartContext";
function AnimatedRoutes() {
  const location = useLocation();

  return (

    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
        <Route path="/products/accessories" element={<AccessoriesPage />} />
      </Routes>
    </AnimatePresence>

  );
}

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="h-screen flex items-center justify-center bg-gray-100"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  return (
    <Router>
      <CartProvider>
        <NavMenu></NavMenu>
        <AnimatedRoutes />
      </CartProvider>
    </Router>
  );
}
