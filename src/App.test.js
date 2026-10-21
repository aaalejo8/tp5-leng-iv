import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import App from './App';

function renderApp(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  );
}

// jsdom no implementa Blob.text(); el navegador sí lo hace.
beforeAll(() => {
  Blob.prototype.text = function () {
    return new Promise((resolve, reject) => {
      const lector = new FileReader();
      lector.onload = () => resolve(lector.result);
      lector.onerror = () => reject(lector.error);
      lector.readAsText(this);
    });
  };
});

test('la navegación abre las cuatro secciones sin recargar', () => {
  renderApp();

  expect(screen.getByRole('heading', { name: /archivos en memoria/i })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('link', { name: 'Contacto' }));
  expect(screen.getByRole('heading', { name: /hablemos del proyecto/i })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('link', { name: 'Acerca de nosotros' }));
  expect(screen.getByRole('heading', { name: 'Acerca de nosotros' })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('link', { name: 'proyectoBlob' }));
  expect(screen.getByRole('heading', { name: 'Proyecto Blob' })).toBeInTheDocument();
});

test('crea un Blob de texto y muestra sus datos', () => {
  renderApp('/proyectoBlob');

  fireEvent.click(screen.getByRole('button', { name: /crear blob de texto/i }));

  expect(screen.getByText('Blob creado correctamente')).toBeInTheDocument();
  expect(screen.getByText('Tipo: text/plain;charset=utf-8')).toBeInTheDocument();
  expect(screen.getByText(/Tamaño: \d+ bytes/)).toBeInTheDocument();
});

test('avisa si se intenta usar slice antes de crear el Blob', () => {
  renderApp('/proyectoBlob');

  fireEvent.click(screen.getByRole('button', { name: /usar slice/i }));

  expect(screen.getByText('Primero creá el Blob')).toBeInTheDocument();
});

test('slice() muestra los primeros 20 bytes', async () => {
  renderApp('/proyectoBlob');
  fireEvent.click(screen.getByRole('button', { name: /crear blob de texto/i }));
  fireEvent.click(screen.getByRole('button', { name: /usar slice/i }));

  expect(await screen.findByText('Porción obtenida con slice()')).toBeInTheDocument();
  expect(screen.getByText('Porción: 20 bytes')).toBeInTheDocument();
  expect(screen.getByText('Contenido: Este archivo fue cre')).toBeInTheDocument();
});

test('descarga el Blob creado con el nombre esperado', () => {
  const createObjectURL = jest.fn(() => 'blob:prueba');
  const revokeObjectURL = jest.fn();
  URL.createObjectURL = createObjectURL;
  URL.revokeObjectURL = revokeObjectURL;
  const click = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

  renderApp('/proyectoBlob');
  fireEvent.click(screen.getByRole('button', { name: /crear blob de texto/i }));
  fireEvent.click(screen.getByRole('button', { name: /descargar archivo/i }));

  expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
  expect(click).toHaveBeenCalled();
  expect(screen.getByText('Archivo: proyecto-blob.txt')).toBeInTheDocument();
  click.mockRestore();
});
