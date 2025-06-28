import SoundLibrary from "../components/SoundLibrary.jsx";

function Home() {
  return (
    <div className="min-h-screen bg-light-secondary dark:bg-dark-secondary">
      <h1 className="text-3xl font-bold text-center p-6 text-dark-primary dark:text-light-primary">
        Library
      </h1>
      <SoundLibrary />
    </div>
  );
}

export default Home;
