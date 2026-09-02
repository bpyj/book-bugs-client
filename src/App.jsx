import { useEffect, useState } from "react";
import InventoryTable from "./components/InventoryTable";

function App() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("https://book-bugs-server.onrender.com/api/inventory")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Could not retrieve inventory");
        }

        return response.json();
      })
      .then((data) => {
        setRecords(data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <h2>Loading Book Bugs inventory...</h2>;
  if (error) return <h2>Error: {error}</h2>;

  return (
    <main>
      <h1>Book Bugs Inventory</h1>
      <p>{records.length} records retrieved from Airtable</p>

      <InventoryTable records={records} />
    </main>
  );
}

export default App;