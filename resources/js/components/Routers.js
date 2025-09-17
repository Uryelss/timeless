import ReactDOM from "react-dom";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./Homepage/Home";
import Login from "./Homepage/Login";
import Signup from "./Homepage/Signup";

export default function Routers() {
    return (
        <Router>
            <Routes>
                <Route path="/Home" element={<Homepage />} />
                <Route path="/Login" element={<Login />} />
                <Route path="/Signup" element={<Signup />} />
            </Routes>
        </Router>
    );
}

if (document.getElementById("root")) {
    ReactDOM.render(<Routers />, document.getElementById("root"));
}
