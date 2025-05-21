import React, { useEffect, useState } from 'react'
import Papa from 'papaparse'

function App() {
  const [questions, setQuestions] = useState([])
  const [selected, setSelected] = useState([])
  const [step, setStep] = useState(0)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [mistakes, setMistakes] = useState([])

  useEffect(() => {
    fetch('/quiz_domande_200.csv')
      .then(res => res.text())
      .then(csv => {
        Papa.parse(csv, {
          header: true,
          complete: (results) => {
            setQuestions(shuffle(results.data).slice(0, 10))
          }
        })
      })
  }, [])

  const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5)

  const handleAnswer = (choice) => {
    const current = questions[step]
    setSelected([...selected, choice])
    if (choice === current.corretta) {
      setScore(score + 1)
    } else {
      setMistakes([...mistakes, {
        domanda: current.domanda,
        tua: current['risposta' + choice],
        corretta: current['risposta' + current.corretta]
      }])
    }
    const next = step + 1
    if (next < questions.length) {
      setStep(next)
    } else {
      setShowResult(true)
    }
  }

  if (!questions.length) return <p>Caricamento domande…</p>

  if (showResult) {
    return (
      <div>
        <h1>Risultato: {score} su {questions.length}</h1>
        <h2>Domande sbagliate:</h2>
        {mistakes.map((m, i) => (
          <div key={i}>
            <p><strong>{m.domanda}</strong></p>
            <p>Tua risposta: ❌ {m.tua}</p>
            <p>Corretta: ✅ {m.corretta}</p>
          </div>
        ))}
      </div>
    )
  }

  const q = questions[step]

  return (
    <div>
      <h1>Domanda {step + 1} di {questions.length}</h1>
      <p><strong>{q.domanda}</strong></p>
      {['A', 'B', 'C'].map(k => (
        <button key={k} onClick={() => handleAnswer(k)}>
          {k}) {q['risposta' + k]}
        </button>
      ))}
    </div>
  )
}

export default App
