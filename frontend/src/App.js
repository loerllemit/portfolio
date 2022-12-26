import React, { useState, useEffect } from "react";
import DailyPNL from "./components/DailyPNL";
import Loading from "./components/Loading";
import useWindowDimensions from "./utils/useWindowDimensions";
import "./App.css";
import TotalPNL from "./components/TotalPNL";
import CalendarPNL from "./components/CalendarPNL";
import TopWin from "./components/TopWin";
import TopLoss from "./components/TopLoss";
import MostTraded from "./components/MostTraded";

const BASE_URL = "http://localhost:8000/api";

function App() {
   const [data, setData] = useState([]);
   const [isloading, setLoading] = useState(true);
   const { height, width } = useWindowDimensions();

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
      <div className="App bg-slate-600">
         {isloading ? (
            <Loading />
         ) : (
            <>
               <DailyPNL
                  className=" min-h-screen"
                  data={data}
                  width={width}
                  height={height}
               />
               <TotalPNL
                  className=" min-h-screen"
                  data={data}
                  width={width}
                  height={height}
               />
               <CalendarPNL
                  className=" max-h-screen"
                  data={data}
                  width={width}
                  height={height}
               />
               <TopLoss data={data} />
               <TopWin data={data} height={height} />
               <MostTraded data={data} />
            </>
         )}
      </div>
   );
}

export default App;
