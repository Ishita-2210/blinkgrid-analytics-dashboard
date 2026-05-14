import TopFailuresWidget from "./components/TopFailuresWidget";

function App() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-6">
      <TopFailuresWidget customerId={1} />
    </div>
  );
}

export default App;