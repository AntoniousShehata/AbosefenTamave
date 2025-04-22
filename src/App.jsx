import Header from './components/Header';
import Products from './pages/Products';

function App() {
  return (
    <div className="bg-light min-h-screen text-dark">
      <Header />
      <main className="p-4">
        <Products />
      </main>
    </div>
  );
}

export default App;
