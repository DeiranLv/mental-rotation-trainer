import ThreeScene from './components/ThreeScene';
import './App.css';

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Mental Rotation Trainer</h1>
      </header>
      <main className="scene-container">
        <ThreeScene />
      </main>
    </div>
  );
}
