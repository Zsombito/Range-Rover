import logo from './logo.svg';
import './App.css';
import Temp from './components/temperature/temp';
import Dist from './components/distance/dist';
import Humid from './components/humidity/humid';

function App() {
  return (
    <div className="App">
     <Temp/>
     <Dist/>
     <Humid/>
    </div>
  );
}

export default App;
