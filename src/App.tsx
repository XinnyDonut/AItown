import { BrowserRouter, Routes, Route } from 'react-router-dom';
import GamePage from './GamePage';
import ConfigPage from './Config/ConfigPage';
import ConvexClientProvider from './components/ConvexClientProvider';

 export default function App() {
  return (
    <ConvexClientProvider>
      <BrowserRouter basename='/ai-town'>
        <Routes>
          <Route path="/" element={<GamePage />}/>
          <Route path="/settings" element={<ConfigPage />}/>
        </Routes>  
      </BrowserRouter>
    </ConvexClientProvider>
  )
 }