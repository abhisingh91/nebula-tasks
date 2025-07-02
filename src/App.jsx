// App.jsx – NebulaTasks: Animated Grid Background with Calmer Glow
import { useEffect, useRef, useState } from 'react';
import { Clock8 } from 'lucide-react';
import tick from './assets/tick.svg';
import bin from './assets/bin.svg';
import robot from './assets/robot.png';

const weatherIcons = {
  clear: '🌤️',
  sunny: '☀️',
  rain: '🌧️',
  fog: '🌫️',
  snow: '❄️',
  cloudy: '☁️',
};

const today = new Date();
const formatDateKey = (d) => d.toISOString().split('T')[0];

export default function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');
  const [time, setTime] = useState(new Date());
  const [weather, setWeather] = useState(null);
  const [date, setDate] = useState(today);
  const [customDate, setCustomDate] = useState(false);
  const [page, setPage] = useState(1);
  const ddRef = useRef(null);
  const mmRef = useRef(null);
  const yyyyRef = useRef(null);

  const dateKey = formatDateKey(date);

  useEffect(() => {
    const stored = localStorage.getItem('nebulatasks');
    if (stored) setTodos(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem('nebulatasks', JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(pos => {
      const { latitude, longitude } = pos.coords;
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&weathercode=true`)
        .then(res => res.json())
        .then(data => {
          const code = data.current_weather.weathercode;
          let desc = 'clear';
          if (code >= 45 && code <= 48) desc = 'fog';
          else if (code >= 51 && code <= 67) desc = 'rain';
          else if (code >= 71 && code <= 77) desc = 'snow';
          else if (code >= 80 && code <= 99) desc = 'rain';
          else if (code === 3) desc = 'cloudy';
          setWeather({ ...data.current_weather, description: desc });
        });
    });
  }, []);

  const isSmallScreen = window.innerWidth < 640;
  const tasksPerPage = isSmallScreen ? 5 : 6;

  const filteredTodos = todos
    .filter(todo => formatDateKey(new Date(todo.date)) === dateKey)
    .slice((page - 1) * tasksPerPage, page * tasksPerPage);

  const addTodo = () => {
    if (!input.trim()) return;
    const text = input.slice(0, 50);
    const now = new Date();
    const taskCount = todos.filter(t => formatDateKey(new Date(t.date)) === dateKey).length;
    if (taskCount >= 10) return;
    const newTodos = [...todos, { text, done: false, date: now.toISOString(), id: Date.now() }];
    setTodos(newTodos);
    setInput('');
    if ((taskCount + 1) > tasksPerPage) setPage(Math.ceil((taskCount + 1) / tasksPerPage));
  };

  const toggleDone = (id) => {
    const updated = todos.map(todo => {
      if (todo.id === id && !todo.done) {
        triggerConfetti();
        return { ...todo, done: true };
      }
      if (todo.id === id && todo.done) return { ...todo, done: false };
      return todo;
    });
    setTodos(updated);
  };

  const triggerConfetti = () => {
    const confetti = document.createElement('div');
    confetti.className = 'absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-green-400 animate-confetti';
    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), 600);
  };

  const changeDateBy = (days) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    setDate(newDate);
    setPage(1);
  };

  const submitCustomDate = () => {
    const dd = Math.max(1, Math.min(31, parseInt(ddRef.current.value)));
    const mm = Math.max(1, Math.min(12, parseInt(mmRef.current.value)));
    const yyyy = Math.max(today.getFullYear(), parseInt(yyyyRef.current.value));
    const newDate = new Date(yyyy, mm - 1, dd);
    if (!isNaN(newDate)) setDate(newDate);
    setCustomDate(false);
    setPage(1);
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center bg-black text-white font-sans overflow-hidden py-6">
      <AnimatedGrid />
      <div className="relative z-10 flex flex-col items-center px-4 gap-6 max-w-full">
        <div className="w-full max-w-3xl backdrop-blur-xl bg-white/10 rounded-2xl p-3 md:p-6 shadow-2xl border border-white/10 ring-1 ring-white/20">
          <h1 className="text-3xl md:text-4xl font-medium font-orbitron tracking-[6px] text-center mb-4">NebulaTasks</h1>

          <div className="flex justify-center items-center gap-2 text-sm text-gray-400 mb-2">
            <button onClick={() => changeDateBy(-1)} className="cursor-pointer">&#x276E;</button>
            <div onClick={() => setCustomDate(!customDate)} className="cursor-pointer">
              {date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
            </div>
            <button onClick={() => changeDateBy(1)} className="cursor-pointer">&#x276F;</button>
          </div>

          {customDate && (
            <div className="flex gap-2 justify-center items-center mb-2 text-white">
              <input ref={ddRef} type="text" inputMode="numeric" pattern="\d*" placeholder="dd" className="w-12 px-2 py-1 rounded bg-black/40 border border-white/10 text-center appearance-none" />
              <input ref={mmRef} type="text" inputMode="numeric" pattern="\d*" placeholder="mm" className="w-12 px-2 py-1 rounded bg-black/40 border border-white/10 text-center appearance-none" />
              <input ref={yyyyRef} type="text" inputMode="numeric" pattern="\d*" placeholder="yyyy" className="w-20 px-2 py-1 rounded bg-black/40 border border-white/10 text-center appearance-none" />
              <button onClick={submitCustomDate} className="px-3 py-1 text-sm rounded bg-purple-600 hover:bg-purple-700">Go</button>
            </div>
          )}

          <div className="text-center text-lg md:text-2xl font-mono tracking-widest mb-1">
            {time.toLocaleTimeString()}
          </div>
          {weather && (
            <div className="text-center text-sm text-gray-300 mb-4">
              Weather: {weatherIcons[weather.description] || '🌤️'} {weather.description} — {weather.temperature}°C
            </div>
          )}

          <div className="flex gap-2 mb-4 items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={30}
              placeholder="Enter a task..."
              className="flex-1 px-4 py-2 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={addTodo}
              className="bg-purple-600 hover:bg-purple-700 w-10 h-10 rounded-xl transition shadow-md flex items-center justify-center"
            >
              {/* Replace the span with an SVG icon */}
              <svg
                className="w-6 h-6 text-white" /* Adjust size and color as needed */
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2} /* A thicker stroke can look better */
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
              </svg>
            </button>
          </div>

          {filteredTodos.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center text-gray-500">
              <img src={robot} alt="No tasks" className="w-28 h-28 mb-3 opacity-70" />
              <p>No tasks for this date — stay spooky productive 👾</p>
            </div>
          ) : (
            <>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-hidden">
                {filteredTodos.map(todo => (
                  <li
                    key={todo.id}
                    className={`relative flex items-center bg-white/5 backdrop-blur-lg px-3 py-3 rounded-2xl border border-white/10 transition duration-300 shadow-md min-h-[72px] ${todo.done ? 'opacity-60 line-through' : ''}`}
                  >
                    <button
                      onClick={() => toggleDone(todo.id)}
                      className={`mr-3 transform transition active:scale-95 ${todo.done ? 'text-green-400' : 'text-gray-500 hover:text-green-300'}`}
                      title="Mark as done"
                    >
                      <img src={tick} alt="done" className="w-5 h-5" />
                    </button>
                    <div className="flex-1 flex flex-col justify-between text-white/90 text-[15px] md:text-base font-medium pr-2">
                      <span>{todo.text}</span>
                      <span className="text-xs text-gray-500 mt-1 flex items-center">
                        <Clock8 className="w-3 h-3 mr-1" />
                        {new Date(todo.date).toLocaleString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <button
                      onClick={() => setTodos(todos.filter(t => t.id !== todo.id))}
                      className="text-red-400 hover:text-red-600 ml-3"
                      title="Delete"
                    >
                      <img src={bin} alt="delete" className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
              <div className="mt-4 w-[100px] mx-auto h-2 rounded-full bg-purple-900/30 flex overflow-hidden">
                <button onClick={() => setPage(1)} disabled={page === 1} className={`flex-1 transition ${page === 1 ? 'bg-purple-600' : 'bg-transparent'}`} />
                <button onClick={() => setPage(2)} disabled={todos.filter(t => formatDateKey(new Date(t.date)) === dateKey).length <= tasksPerPage} className={`flex-1 transition ${page === 2 ? 'bg-purple-600' : 'bg-transparent'}`} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function AnimatedGrid() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:30px_30px]"></div>
      <div className="absolute inset-[-100%] bg-[radial-gradient(circle_700px_at_50%_50%,rgba(124,58,237,0.2),#0000000f)] animate-glow-bounce"></div>
    </div>
  );
}
