import React, {useState, useEffect} from "react";
import {initializeApp} from "firebase/app";
import {Client, Storage} from "appwrite";
import {GoogleAuthProvider, getAuth, onAuthStateChanged} from "firebase/auth";
import {BrowserRouter as Router, Routes, Route, useNavigate} from "react-router-dom";
import {ThemeProvider, createTheme, CssBaseline, Box} from "@mui/material";
import Swal from "sweetalert2";
import Header from "./Header.jsx";
import Home from "./Home.jsx";
import Login from "./Login.jsx";
import Dashboard from "./Dashboard.jsx";
import Create from "./Create.jsx";
import View from "./View.jsx";
import Explore from "./Explore.jsx";
import Presentations from "./Presentations.jsx";
import Profile from "./Profile";
import EditProfile from "./EditProfile.jsx";
import Loader from "./Loader.jsx";
import Chatbot from "./Chatbot.jsx";
import About from "./About.jsx";
import Pricing from "./Pricing.jsx";
import "./sockjs.js";
import "./App.css";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_API_KEY,
    authDomain: import.meta.env.VITE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_APP_ID
};

const app = initializeApp(firebaseConfig);

const provider = new GoogleAuthProvider(app);

const auth = getAuth();

const client = new Client();

client
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
    .setProject(import.meta.env.VITE_APPWRITE_KEY)
;

const storage = new Storage(client);

const storeKey = import.meta.env.VITE_APPWRITE_STORAGE;

const socket = new SockJS(import.meta.env.VITE_SOCKET_ENDPOINT);

const theme = createTheme({
    palette: {
        primary: {
            main: "#ff148a"
        },
        secondary: {
            main: "#ffffff"
        },
        error: {
            main: "#ff295e"
        }
    }
});

function App(){
    const navigate = useNavigate();

    const [socketData, setSocketData] = useState({});

    const [page, setPage] = useState("");

    const [user, setUser] = useState({});

    const [userChecked, setUserChecked] = useState(false);

    const [currentPresentation, setCurrentPresentation] = useState({});

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userChecked){
            if (user.uid === "UNDEFINED" && !(["home", "about", "pricing"].includes(page))){
                navigate("/login");
            }
        }

        setSocketData({});
    }, [page]);

    useEffect(() => {
        if (userChecked){
            if (user.uid === "UNDEFINED" && !(["home", "about", "pricing"].includes(page))){
                navigate("/login");
            }
        }
    }, [userChecked]);

    useEffect(() => {
        if (socketData.event === "getUser"){
            const data = socketData.value;

            setUser(data);

            setSocketData({});
        }
    }, [socketData]);

    useEffect(() => {
        socket.onopen = () => {
            setLoading(false);
        
            onAuthStateChanged(auth, (user) => {
                setUserChecked(true);

                if (user){
                    socket.send(JSON.stringify({
                        event: "getUser",
                        value: user
                    }));
                }
                else{
                    setUser({
                        uid: "UNDEFINED"
                    });
                }
            });
        };

        socket.onmessage = (message) => {
            const data = JSON.parse(message.data);

            setSocketData(data);
        };
    }, []);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>

            <Box sx={{
                position: "absolute",
                top: "0",
                left: "0",
                width: "100%",
                height: "100%",
                background: "#000",
                overflowY: "auto"
            }}>
                <Header page={page}/>

                <Routes>
                    <Route path="/" element={<Home setPage={setPage} />}/>

                    <Route path="/login" element={<Login setPage={setPage} socket={socket} socketData={socketData} setSocketData={setSocketData} provider={provider} auth={auth} setUser={setUser}/>}/>

                    <Route path="/dashboard" element={<Dashboard setPage={setPage} user={user}/>}/>
 
                    <Route path="/create" element={<Create setPage={setPage} socket={socket} socketData={socketData} setSocketData={setSocketData} storeKey={storeKey} storage={storage} setCurrentPresentation={setCurrentPresentation} setLoading={setLoading}/>}/>
               
                    <Route path="/view" element={<View setPage={setPage} socket={socket} socketData={socketData} setSocketData={setSocketData} currentPresentation={currentPresentation} setCurrentPresentation={setCurrentPresentation} user={user}/>}/>

                    <Route path="/explore" element={<Explore setPage={setPage} socket={socket} socketData={socketData} setSocketData={setSocketData} storeKey={storeKey} user={user} storage={storage} setLoading={setLoading}/>}/>

                    <Route path="/presentations" element={<Presentations setPage={setPage} socket={socket} socketData={socketData} setSocketData={setSocketData} storeKey={storeKey} user={user} storage={storage} setLoading={setLoading}/>}/>

                    <Route path="/profile" element={<Profile setPage={setPage} auth={auth} user={user}/>}/>

                    <Route path="/about" element={<About setPage={setPage}/>}/>
                
                    <Route path="/pricing" element={<Pricing setPage={setPage}/>}/>

                    <Route path="/editProfile" element={<EditProfile setPage={setPage} socket={socket} socketData={socketData} setSocketData={setSocketData} user={user} setUser={setUser}/>}/>
                </Routes>

                <Chatbot/>

                {(loading) &&
                    <Loader loading={loading}/>
                }
            </Box>
        </ThemeProvider>
    );
}

window.oncontextmenu = (event) => {
    event.preventDefault();
};

export default App;