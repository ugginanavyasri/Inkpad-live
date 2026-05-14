import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Login from "./Login";
import Home from "./Home";
import Editor from "./Editor";

function App() {

  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/home"
          element={<Home />}
        />

        <Route
          path="/room/:id"
          element={<Editor />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;