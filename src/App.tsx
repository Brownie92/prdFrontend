import { Routes, Route } from "react-router-dom";
import RacePage from "./pages/RacePage";
import { WebSocketProvider } from "./context/WebSocketProvider";

const App = () => {
  return (
    <WebSocketProvider>
      <Routes>
        <Route path="/" element={<RacePage />} />
      </Routes>
    </WebSocketProvider>
  );
};

export default App;
