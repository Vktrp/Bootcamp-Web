export default function Filters(){
  // ...
  return (
    <div className="filters container-page">
      <div className="group" style={{flex:1}}>
        <label>Recherche</label>
        <input className="input" /* ... */ />
      </div>
      <div className="group">
        <label>Catégorie</label>
        <select className="input">{/* ... */}</select>
      </div>
      <div className="group">
        <label>Pointure (EU)</label>
        <input className="input" placeholder="ex: 42" /* ... */ />
      </div>
    </div>
  );
}
