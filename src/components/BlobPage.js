import { useState } from 'react';

const TEXTO_INICIAL = 'Este archivo fue creado con Blob en React.\nTrabajo Práctico N.º 7 - Lenguajes IV.';
const NOMBRE_ARCHIVO = 'proyecto-blob.txt';

function BlobPage() {
  const [texto, setTexto] = useState(TEXTO_INICIAL);
  const [blobDeTexto, setBlobDeTexto] = useState(null);
  const [resultado, setResultado] = useState(null);

  const actualizarTexto = (event) => {
    setTexto(event.target.value);
    setBlobDeTexto(null);
    setResultado(null);
  };

  const crearBlob = () => {
    const nuevoBlob = new Blob([texto], { type: 'text/plain;charset=utf-8' });
    setBlobDeTexto(nuevoBlob);
    setResultado({
      titulo: 'Blob creado correctamente',
      detalles: [`Tipo: ${nuevoBlob.type}`, `Tamaño: ${nuevoBlob.size} bytes`, `Contenido: ${texto || '(vacío)'}`],
    });
  };

  const descargarBlob = () => {
    if (!blobDeTexto) {
      setResultado({ titulo: 'Primero creá el Blob', detalles: ['Usá el botón Crear Blob de texto antes de descargar.'] });
      return;
    }

    const urlTemporal = URL.createObjectURL(blobDeTexto);
    const enlace = document.createElement('a');
    enlace.href = urlTemporal;
    enlace.download = NOMBRE_ARCHIVO;
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    setTimeout(() => URL.revokeObjectURL(urlTemporal), 1000);

    setResultado({
      titulo: 'Descarga iniciada',
      detalles: [`Archivo: ${NOMBRE_ARCHIVO}`, `Tamaño: ${blobDeTexto.size} bytes`, 'El archivo contiene el texto escrito arriba.'],
    });
  };

  const usarSlice = async () => {
    if (!blobDeTexto) {
      setResultado({ titulo: 'Primero creá el Blob', detalles: ['Usá el botón Crear Blob de texto antes de recortar.'] });
      return;
    }

    const inicio = 0;
    const fin = 20;
    const porcionBlob = blobDeTexto.slice(inicio, fin, 'text/plain');
    const contenidoPorcion = await porcionBlob.text();
    setResultado({
      titulo: 'Porción obtenida con slice()',
      detalles: [
        `Rango: bytes ${inicio} a ${fin - 1}`,
        `Blob original: ${blobDeTexto.size} bytes`,
        `Porción: ${porcionBlob.size} bytes`,
        `Contenido: ${contenidoPorcion || '(vacío)'}`,
      ],
    });
  };

  return (
    <section className="pagina-interior laboratorio">
      <span className="etiqueta">LABORATORIO INTERACTIVO</span>
      <h1>Proyecto Blob</h1>
      <p className="introduccion">Creá un archivo en memoria, descargalo y explorá sus primeros 20 bytes.</p>
      <div className="laboratorio-grid">
        <div className="panel panel-editor">
          <div className="panel-cabecera"><span className="panel-paso">01</span><h2>Texto de origen</h2></div>
          <label htmlFor="texto-blob">Contenido del archivo</label>
          <textarea id="texto-blob" value={texto} onChange={actualizarTexto} rows="7" />
          <p className="ayuda">Si editás el texto, creá el Blob nuevamente para actualizarlo.</p>
          <button className="boton boton-primario" type="button" onClick={crearBlob}>Crear Blob de texto</button>
        </div>
        <div className="panel panel-acciones">
          <div className="panel-cabecera"><span className="panel-paso">02</span><h2>Explorar el archivo</h2></div>
          <p>Después de crearlo, probá estas operaciones sobre el mismo Blob.</p>
          <button className="boton boton-secundario" type="button" onClick={descargarBlob}>Descargar archivo .txt <span aria-hidden="true">↗</span></button>
          <button className="boton boton-secundario" type="button" onClick={usarSlice}>Usar slice() <span aria-hidden="true">→</span></button>
          <div className="resultado" aria-live="polite">
            {resultado ? (
              <><strong>{resultado.titulo}</strong><ul>{resultado.detalles.map((detalle) => <li key={detalle}>{detalle}</li>)}</ul></>
            ) : (
              <><strong>Esperando una acción</strong><p>Los resultados aparecerán acá.</p></>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default BlobPage;
