import { BrowserRouter, useRoutes } from 'react-router-dom';
import { routes } from './lib/routes';
import { Toaster } from 'react-hot-toast';

function AppRoutes() {
  const element = useRoutes(routes);
  return element;
}

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
