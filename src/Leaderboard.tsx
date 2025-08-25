import React from 'react'

function Leaderboard() {
    const today = new Date().toISOString().split('T')[0];
    const storedResults = JSON.parse(localStorage.getItem('memoryResults') || '[]');
  
    const todayResults = storedResults
      .filter((r: any) => r.date === today)
      .sort((a: any, b: any) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.time - b.time;
      });
  return (
    <div className="mt-8 w-full max-w-xl bg-white shadow-lg rounded-lg p-4">
    <h3 className="text-xl font-bold mb-4 text-center">🏆 Today’s Leaderboard</h3>
    <table className="w-full table-auto text-sm">
      <thead>
        <tr className="bg-gray-200">
          <th className="p-2 text-left">#</th>
          <th className="p-2 text-left">Name</th>
          <th className="p-2 text-left">Score</th>
          <th className="p-2 text-left">Time (s)</th>
        </tr>
      </thead>
      <tbody>
        {todayResults.map((r: any, i: number) => (
          <tr key={i} className="border-t">
            <td className="p-2">{i + 1}</td>
            <td className="p-2">{r.username}</td>
            <td className="p-2">{r.score}</td>
            <td className="p-2">{r.time}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
  )
}

export default Leaderboard