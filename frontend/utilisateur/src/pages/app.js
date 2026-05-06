import { useEffect, useState } from "react";

function App() {

  const [encadrants, setEncadrants] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/encadrants")
      .then(res => res.json())
      .then(data => setEncadrants(data));
  }, []);

  return (
    <div>
      <h1>Encadrants</h1>

      {encadrants.map(e => (
        <p key={e.id}>{e.nom} {e.prenom}</p>
      ))}

    </div>
  );
}

export default App;