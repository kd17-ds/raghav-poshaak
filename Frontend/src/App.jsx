import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import UserLayout from './layouts/UserLayout';

function App() {
  return (
    <Routes>
      <Route element={<UserLayout />}>
        <Route path='/' element={<Home />} />
      </Route>
    </Routes>
  )
}

export default App;