import { Routes, Route } from "react-router-dom";
import RacePage from "./pages/RacePage";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<RacePage />} />
    </Routes>
  );
};

export default App;
