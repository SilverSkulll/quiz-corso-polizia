import React, { useEffect, useState } from 'react'
import Papa from 'papaparse'

function App() {
  const [questions, setQuestions] = useState([])
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
            const random = results.data.sort(() => 0.5 - Math.random()).slice(0, 10)
            setQuestions(random)
          }
        })
      })
  }, [])

  const handleAnswer = (choice) => {
    const q = questions[step]
    if (choice === q.corretta) {
      setScore(score + 1)
    } else {
      setMistakes([...mistakes, {
        domanda: q.domanda,
        tua: q['risposta' + choice],
        corretta: q['risposta' + q.corretta]
      }])
    }

    if (step + 1 < questions.length) {
      setStep(step + 1)
    } else {
      setShowResult(true)
    }
  }

  if (!questions.length) return <p>Caricamento…</p>

  if (showResult) {
    return (
      <div>
        <h1>Hai totalizzato {score} su {questions.length}</h1>
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

  const q = questions[step]
  return (
    <div>
      <h1>Domanda {step + 1}</h1>
      <p><strong>{q.domanda}</strong></p>
      {['A', 'B', 'C'].map((k) => (
        <button key={k} onClick={() => handleAnswer(k)}>
          {k}) {q['risposta' + k]}
        </button>
      ))}
    </div>
  )
}

export default App
