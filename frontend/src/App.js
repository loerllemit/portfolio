import React, { useState, useEffect } from "react";
import "./App.css";

const BASE_URL = "http://localhost:8000/api";

function App() {
   const [data, setData] = useState([]);

   async function fetchData() {
      let res = await fetch(BASE_URL);

      try {
         setData(await res.json());
      } catch (err) {
         console.log(err);
      }
   }

   useEffect(() => {
      fetchData();
   }, []);

   return <div className="App bg-slate-600 min-h-screen"></div>;
}

export default App;
