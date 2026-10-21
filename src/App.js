import { Link, Navigate, Route, Routes } from 'react-router';
import Header from './components/Header';
import Footer from './components/Footer';
import BlobPage from './components/BlobPage';
import './App.css';

function Inicio() {
  return (
    <section className="hero">
      <div className="hero-contenido">
        <span className="etiqueta">TRABAJO PRÁCTICO N.º 7 · LENGUAJES IV</span>
        <h1>Archivos en memoria, ideas en movimiento.</h1>
        <p>
          Una demostración interactiva de React Router y la API Blob.
          Explorá las secciones y creá, descargá y recortá un archivo de texto.
        </p>
        <div className="hero-acciones">
          <Link className="boton boton-primario" to="/proyectoBlob">Explorar proyecto Blob <span aria-hidden="true">→</span></Link>
          <Link className="boton boton-secundario" to="/acerca">Conocer el proyecto</Link>
        </div>
      </div>
      <div className="hero-ilustracion" aria-hidden="true">
        <div className="archivo-visual">
          <span className="archivo-pestana">.TXT</span>
          <span className="archivo-linea linea-larga" />
          <span className="archivo-linea linea-media" />
          <span className="archivo-linea linea-corta" />
          <span className="archivo-sello">BLOB</span>
        </div>
      </div>
      <div className="hero-pie">
        <span>01 / 03 <strong>CREAR</strong></span>
        <span>02 / 03 <strong>DESCARGAR</strong></span>
        <span>03 / 03 <strong>RECORTAR</strong></span>
      </div>
    </section>
  );
}

function Acerca() {
  return (
    <section className="pagina-interior">
      <span className="etiqueta">SOBRE EL PROYECTO</span>
      <h1>Acerca de nosotros</h1>
      <p className="introduccion">Este trabajo práctico fue desarrollado para Lenguajes IV por Almada Alejo Matías.</p>
      <div className="tarjetas-info">
        <article className="tarjeta-info">
          <span className="numero-tarjeta">01</span>
          <h2>Navegación</h2>
          <p>React Router conecta las secciones del sitio sin recargar la página.</p>
        </article>
        <article className="tarjeta-info">
          <span className="numero-tarjeta">02</span>
          <h2>Archivos Blob</h2>
          <p>La API Blob permite crear un archivo de texto, descargarlo y obtener una porción con slice().</p>
        </article>
      </div>
    </section>
  );
}

function Contacto() {
  return (
    <section className="pagina-interior contacto">
      <span className="etiqueta">CONTACTO</span>
      <h1>Hablemos del proyecto.</h1>
      <p className="introduccion">Para consultas sobre el trabajo práctico, contactá al alumno a través de la plataforma de la materia.</p>
      <div className="contacto-tarjeta">
        <div>
          <span className="contacto-label">ALUMNO</span>
          <strong>Almada Alejo Matías</strong>
          <span>Lenguajes IV · Comisión 1</span>
        </div>
        <Link className="boton boton-primario" to="/proyectoBlob">Ver proyecto Blob <span aria-hidden="true">→</span></Link>
      </div>
    </section>
  );
}

function App() {
  return (
    <div className="pagina">
      <Header />
      <main className="contenedor" id="contenido">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/proyectoBlob" element={<BlobPage />} />
          <Route path="/blob" element={<Navigate to="/proyectoBlob" replace />} />
          <Route path="/acerca" element={<Acerca />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="*" element={<section className="pagina-interior"><h1>Página no encontrada</h1><Link className="boton boton-primario" to="/">Volver al inicio</Link></section>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
