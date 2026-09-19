import { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    // async/await so we wait for the response before updating state
    const fetchHello = async () => {
      const res = await fetch("http://localhost:5001/api/hello");
      const data = await res.json();
      setMessage(data.message);
    };
    fetchHello().catch(() => setMessage("Could not reach server"));
  }, []);

  return <h1>{message}</h1>;
}

export default App;