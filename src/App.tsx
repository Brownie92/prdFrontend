import { Routes, Route } from "react-router-dom";
import RacePage from "./pages/RacePage";
import { WebSocketProvider } from "./context/WebSocketProvider";
import RaceTest from "./components/RaceTest";

const App = () => {
  return (
    <WebSocketProvider>
      <Routes>
        <Route path="/" element={<RacePage />} />
        <Route path="/test" element={<RaceTest />} />
      </Routes>
    </WebSocketProvider>
  );
};

export default App;
