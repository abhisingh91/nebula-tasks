import { useEffect, useState } from 'react';
import { CalendarClock, Trash2 } from 'lucide-react';

export default function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');
  const [time, setTime] = useState(new Date());
  const [weather, setWeather] = useState(null);

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
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`)
        .then(res => res.json())
        .then(data => setWeather(data.current_weather));
    });
  }, []);

  const addTodo = () => {
    if (!input.trim()) return;
    setTodos([{ text: input, date: new Date(), id: Date.now() }, ...todos]);
    setInput('');
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white p-6 font-sans flex flex-col items-center">
      <div className="w-full max-w-2xl backdrop-blur-xl bg-white/5 rounded-2xl shadow-2xl p-6">
        <h1 className="text-4xl font-bold text-center mb-4 tracking-wide">NebulaTasks</h1>

        <div className="text-center text-sm text-gray-400">
          {time.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
        <div className="text-center text-2xl font-medium text-white/80 mb-2">
          {time.toLocaleTimeString()}
        </div>
        {weather && (
          <div className="text-center text-gray-300 text-sm mb-4">
            Weather: {weather.temperature}°C, Wind {weather.windspeed} km/h
          </div>
        )}

        <div className="flex gap-3 mb-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="What's on your mind?"
            className="flex-1 px-4 py-2 rounded-xl bg-black/20 text-white border-none focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-white/60"
          />
          <button
            onClick={addTodo}
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-xl transition shadow-md"
          >
            Add
          </button>
        </div>

        {todos.length === 0 ? (
          <p className="text-center text-gray-500">You're all caught up 🚀</p>
        ) : (
          <ul className="space-y-4">
            {todos.map(todo => (
              <li
                key={todo.id}
                className="flex justify-between items-start bg-white/5 backdrop-blur-lg p-4 rounded-2xl shadow-inner border border-white/10"
              >
                <div>
                  <p className="text-lg font-medium text-white/90">{todo.text}</p>
                  <div className="flex items-center text-sm text-gray-400 mt-1">
                    <CalendarClock className="w-4 h-4 mr-1" />
                    {new Date(todo.date).toLocaleString()}
                  </div>
                </div>
                <button onClick={() => deleteTodo(todo.id)} className="text-red-400 hover:text-red-600">
                  <Trash2 className="w-5 h-5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
