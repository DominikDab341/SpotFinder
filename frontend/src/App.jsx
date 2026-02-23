import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';


function App() {

  return (
    <>
    <main>
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* <Route path="/register" element={<Register />} /> */}
        <Route path="/" element={<Home />} />
      </Routes>
    </main>
    </>
  )
}

export default App
