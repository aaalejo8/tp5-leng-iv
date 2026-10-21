import { Link, NavLink } from 'react-router';

function Header() {
  return (
    <header className="encabezado">
      <div className="encabezado-contenido">
        <Link className="marca" to="/" aria-label="Lenguajes IV, ir al inicio">
          <span className="marca-icono" aria-hidden="true">B</span>
          <span className="marca-texto"><strong>Lenguajes IV</strong><small>TP N.º 7 · REACT + BLOB</small></span>
        </Link>
        <nav className="navegacion" aria-label="Navegación principal">
          <NavLink to="/" end>Inicio</NavLink>
          <NavLink to="/proyectoBlob">proyectoBlob</NavLink>
          <NavLink to="/acerca">Acerca de nosotros</NavLink>
          <NavLink to="/contacto">Contacto</NavLink>
        </nav>
      </div>
    </header>
  );
}

export default Header;
