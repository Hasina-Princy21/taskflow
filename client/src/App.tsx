import { useEffect, useState } from "react"

interface HealthResponse {
  status?: string;
  database?: string;
  timestamp?: string;
}

function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null)

  async function fetchHealth() {
    try {
      const response = await fetch("http://localhost:4000/health");
      if (response.ok) {
        const data = await response.json();
        setHealth(data);
      } else {
        setHealth({
          status: `Error ${response.status}`,
          database: "Disconnected",
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error(error);
      setHealth({
        status: "Serveur injoignable",
        database: "Unknown",
        timestamp: new Date().toISOString(),
      });
    }
  }

  useEffect(() => {
    fetchHealth();
  }, []);
  
  return (
    <>
      <h1>Welcome to the TaskFlow App</h1>
      <div>
        <h2>Server Health Status: <b>{health?.status || "Unknown"}</b></h2>
        <h2>Server database: <b>{health?.database || "Unknown"}</b></h2>
        <h2>Server timestamp: <b>{health?.timestamp || "Unknown"}</b></h2>
      </div>
    </>
  )
}

export default App