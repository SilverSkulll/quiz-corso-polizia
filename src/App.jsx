import React, { useEffect, useState } from 'react'
import Papa from 'papaparse'

function App() {
  const [allQuestions, setAllQuestions] = useState([])
  const [selectedQuestions, setSelectedQuestions] = useState([])
  const [step, setStep] = useState(0)
  const [score, setScore] = useState(0)
  const [showSetup, setShowSetup] = useState(true)
  const [showResult, setShowResult] = useState(false)
  const [mistakes, setMistakes] = useState([])
  const [numQuestions, setNumQuestions] = useState(10)
  const [timeLimit, setTimeLimit] = useState(300)
  const [timeLeft, setTimeLeft] = useState(0)

  useEffect(() => {
    fetch('/quiz_domande_200.csv')
      .then(res => res.text())
      .then(csv => {
        Papa.parse(csv, {
          header: true,
          complete: results => setAllQuestions(results.data)
        })
      })
  }, [])

  useEffect(() => {
    if (!showSetup && timeLeft > 0 && !showResult) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000)
      return () => clearInterval(timer)
    } else if (timeLeft === 0 && !showResult && selectedQuestions.length > 0) {
      setShowResult(true)
    }
  }, [timeLeft, showSetup, showResult])

  const startQuiz = () => {
    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random()).slice(0, numQuestions)
    setSelectedQuestions(shuffled)
    setStep(0)
    setScore(0)
    setMistakes([])
    setShowResult(false)
    setTimeLeft(timeLimit)
    setShowSetup(false)
  }

  const handleAnswer = (choice) => {
    const q = selectedQuestions[step]
    if (choice === q.corretta) {
      setScore(score + 1)
    } else {
      setMistakes([...mistakes, {
        domanda: q.domanda,
        tua: q['risposta' + choice],
        corretta: q['risposta' + q.corretta]
      }])
    }
    if (step + 1 < selectedQuestions.length) {
      setStep(step + 1)
    } else {
      setShowResult(true)
    }
  }

  const downloadResult = () => {
    const text = `Risultato: ${score} su ${selectedQuestions.length}\n\nErrori:\n` +
      mistakes.map(m => `Domanda: ${m.domanda}\nTua risposta: ${m.tua}\nCorretta: ${m.corretta}\n`).join('\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'risultato_quiz.txt'
    a.click()
  }

  if (showSetup) {
    return (
      <div>
        <h1>Imposta il Test</h1>
        <label>Numero domande:
          <select value={numQuestions} onChange={e => setNumQuestions(Number(e.target.value))}>
            {[10, 20, 50, 100, 200].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </label><br/>
        <label>Tempo (minuti):
          <select value={timeLimit / 60} onChange={e => setTimeLimit(Number(e.target.value) * 60)}>
            {[1, 2, 5, 10, 15, 20].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </label><br/>
        <button onClick={startQuiz}>Inizia Test</button>
      </div>
    )
  }

  if (!selectedQuestions.length) return <p>Caricamento…</p>

  if (showResult) {
    return (
      <div>
        <h1>Hai totalizzato {score} su {selectedQuestions.length}</h1>
        <button onClick={downloadResult}>Scarica risultato</button>
        <button onClick={() => setShowSetup(true)}>Ricomincia</button>
        <h2>Rivedi le risposte sbagliate:</h2>
        {mistakes.map((m, i) => (
          <div key={i}>
            <p><strong>{m.domanda}</strong></p>
            <p>❌ Tua risposta: {m.tua}</p>
            <p>✅ Corretta: {m.corretta}</p>
          </div>
        ))}
      </div>
    )
  }

  const q = selectedQuestions[step]
  return (
    <div>
      <h1>Domanda {step + 1} / {selectedQuestions.length}</h1>
      <p><strong>{q.domanda}</strong></p>
      <div>
        {['A', 'B', 'C'].map(k => (
          <div key={k} style={{ marginBottom: '10px' }}>
            <button style={{ display: 'block' }} onClick={() => handleAnswer(k)}>
              {k}) {q['risposta' + k]}
            </button>
          </div>
        ))}
      </div>
      <p>Tempo rimanente: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</p>
    </div>
  )
}

export default App
