
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Kanban from './pages/Kanban';
import Welcome from './pages/Welcome';
import Dashboard from './components/Dashboard';


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/home" element={<Home />} />
        <Route path="/board/:boardId" element={<Kanban />} />
        <Route path ='/dashboard' element={<Dashboard/>}/>
      </Routes>
    </Router>
  );
};

export default App;