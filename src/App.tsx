import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Home from "./pages/Home";
import About from "./pages/About";
import NavMenu from "./pages/menu/menu";

import ProductsPage from "./pages/ProductsList/ProductList";
import AccessoriesPage from "./pages/ProductsList/EmptyPage";
import { CartProvider } from "./utils/CartContext";
import CheckoutPage from "./pages/Checkout/CheckoutPage";
import SignInPage from "./pages/SignIn/SignIn";
import ForgotPasswordPage from "./pages/Forget password/ForgotPasswordPage";
import OtpVerifyPage from "./pages/Forget password/OtpVerifyPage";
import ResetPasswordPage from "./pages/Forget password/ResetPasswordPage";


import RequireAuth from "./routes/RequireAuth";
import StartupPopup from "./pages/components/popup/StartupPopup";
import ProductDetailsPage from "./pages/ProductsList/ProductDetailsPage";
function AnimatedRoutes() {
  const location = useLocation();

  return (

    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route element={<RequireAuth />}></Route>
        <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
        <Route path="/products/accessories" element={<AccessoriesPage />} />
        <Route path="/products/:slug" element={<PageWrapper><ProductDetailsPage /></PageWrapper>} />
        <Route path="/checkout" element={<PageWrapper><CheckoutPage /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><SignInPage /></PageWrapper>} />
        <Route path="/forgot-password" element={<PageWrapper><ForgotPasswordPage /></PageWrapper>} />
        <Route path="/reset-password" element={<PageWrapper><ResetPasswordPage /></PageWrapper>} />
        <Route path="/verify-otp" element={<PageWrapper><OtpVerifyPage /></PageWrapper>} />
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
        <StartupPopup />
        <NavMenu></NavMenu>
        <AnimatedRoutes />
      </CartProvider>
    </Router>

  );
}
