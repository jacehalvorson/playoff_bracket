import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PlayoffBracket from './playoff_bracket.jsx';
import Admin from './admin.jsx';

function App()
{
  return (
    <Router>
      <Routes>
        <Route path="/" element={ <PlayoffBracket /> } />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<h1>404: Not Found</h1>} />
      </Routes>
    </Router>
  );
}

export default App;
