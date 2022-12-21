import React, { useState, useEffect } from "react";
import "./App.css";
import DailyPNL from "./components/DailyPNL";
import Loading from "./components/Loading";

const BASE_URL = "http://localhost:8000/api";

function App() {
   const [data, setData] = useState([]);
   const [loading, setLoading] = useState(true);

   async function fetchData() {
      let res = await fetch(BASE_URL);

      try {
         setData(await res.json());
      } catch (err) {
         console.log(err);
      } finally {
         setLoading(false);
      }
   }

   useEffect(() => {
      fetchData();
   }, []);

   return (
      <div className="App bg-slate-600 min-h-screen">
         {loading && <Loading />}
         {!loading && <DailyPNL data={data} />}
      </div>
   );
}

export default App;
