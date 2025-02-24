import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { WebSocketProvider } from "./context/WebSocketProvider";

// Lazy loading voor betere performance
const RacePage = lazy(() => import("./pages/RacePage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const App = () => {
  return (
    <WebSocketProvider>
      <Suspense fallback={<div className="text-center p-6">Loading...</div>}>
        <Routes>
          <Route path="/" element={<RacePage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </WebSocketProvider>
  );
};

export default App;
