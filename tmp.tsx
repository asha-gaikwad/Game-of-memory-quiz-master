import { useEffect, useState } from 'react'
import './App.css'
//import * as _ from 'lodash';
import _ from 'lodash';
import {GameProps} from './MemoryQuiz';

let inTransition = false;
let coundId:number = 0;

function App() {

  const [count, setCount] = useState(0);
  const [theId, setId] = useState(0);

  const num = [1, 2, 3, 5, 6];
  const list = num.map((it) => 
    (<p onClick={() => setId((theId) => it)} className="cursor-default bg-red-500 py-4 rounded-lg my-8 text-blue-400" key={it.toString()}>Hey there nice one {it}</p>));

  const handleCount = () => {

    console.log('Start count');
    if (inTransition) return;
    clearTimeout(coundId);
    inTransition = true;
    coundId = setTimeout(() => {
      setCount((count) => count + 1);
      inTransition = false;
      console.log('done count');
    }, 2000);
  };

  return (
    <div className="App">
    <div className="custom w-32 h-32 bg-yellow-400 text-gray-900 rounded-lg fixed top-0 left-0 p-4">
      The one and the id {theId}
    </div>
      <div className="card">
        {list}
        <button onClick={handleCount}>
          count is {count}
        </button>
      </div>
    </div>
  )
}

export default App