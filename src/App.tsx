import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import Shell from "./components/Shell";
import Overview from "./pages/Overview";
import ProductDecomposition from "./pages/ProductDecomposition";
import FunctionalPromise from "./pages/FunctionalPromise";
import Constraints from "./pages/Constraints";
import CapabilityRegister from "./pages/CapabilityRegister";
import HomeMarketCompetition from "./pages/HomeMarketCompetition";
import NewMarketDiscovery from "./pages/NewMarketDiscovery";
import NewMarketAnalysis from "./pages/NewMarketAnalysis";
import AdjacencyAnalysis from "./pages/AdjacencyAnalysis";
import StrategicSynthesis from "./pages/StrategicSynthesis";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Shell />}>
          <Route path="/" element={<Navigate to="/overview" replace />} />
          <Route path="/overview" element={<Overview />} />
          <Route path="/product" element={<ProductDecomposition />} />
          <Route path="/functional-promise" element={<FunctionalPromise />} />
          <Route path="/constraints" element={<Constraints />} />
          <Route path="/capabilities" element={<CapabilityRegister />} />
          <Route path="/home-market" element={<HomeMarketCompetition />} />
          <Route path="/discovery" element={<NewMarketDiscovery />} />
          <Route path="/analysis" element={<NewMarketAnalysis />} />
          <Route path="/analysis/:marketSlug" element={<NewMarketAnalysis />} />
          <Route path="/analysis/:marketSlug/:tab" element={<NewMarketAnalysis />} />
          <Route path="/adjacency" element={<AdjacencyAnalysis />} />
          <Route path="/adjacency/:marketSlug" element={<AdjacencyAnalysis />} />
          <Route path="/synthesis" element={<StrategicSynthesis />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
